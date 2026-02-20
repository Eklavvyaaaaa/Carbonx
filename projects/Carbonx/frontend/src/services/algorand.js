import { Buffer } from 'buffer';
window.Buffer = Buffer;
// Algorand client wrapper for interacting with the blockchain
import algosdk from 'algosdk';
import { ALGORAND_NODE, ALGORAND_INDEXER, APP_IDS } from '../config';
import { signTransactions, peraAtcSigner } from './wallet';

// Primary Node: AlgoNode (Public & Permissive)
let activeAlgodNode = ALGORAND_NODE;
export let algodClient = new algosdk.Algodv2('', activeAlgodNode, '');
const indexerClient = new algosdk.Indexer('', ALGORAND_INDEXER, '');

async function switchToFallback() {
    // Only fallback if not already on the main public relay
    if (activeAlgodNode !== 'https://node.testnet.algorand.tech') {
        console.warn('Switching to fallback node:', 'https://node.testnet.algorand.tech');
        activeAlgodNode = 'https://node.testnet.algorand.tech';
        algodClient = new algosdk.Algodv2('', activeAlgodNode, '');
        return true;
    }
    return false;
}

export function getAlgodClient() {
    return algodClient;
}

export function getIndexerClient() {
    return indexerClient;
}

export async function getAssetBalance(accountAddr, assetId) {
    try {
        const response = await indexerClient.lookupAccountAssets(accountAddr).do();
        const asset = response.assets.find(a => a['asset-id'] === assetId);
        return asset ? asset.amount : 0;
    } catch (e) {
        console.error('Error fetching asset balance:', e);
        return 0;
    }
}

export async function getAlgoBalance(accountAddr) {
    try {
        // Try Indexer first for account info as it's often more permissive
        const accountInfo = await indexerClient.lookupAccountByID(accountAddr).do();
        return accountInfo.account.amount; // in microAlgos
    } catch (e) {
        console.warn('Indexer balance fetch failed, trying algod:', e);
        try {
            const accountInfo = await algodClient.accountInformation(accountAddr).do();
            return accountInfo.amount;
        } catch (e2) {
            console.error('Final balance fetch error:', e2);
            if (await switchToFallback()) return getAlgoBalance(accountAddr);
            return 0;
        }
    }
}

/**
 * Call an ABI method on a contract.
 * @param {number} appId - Application ID
 * @param {string} sender - Sender address
 * @param {string} methodSignature - e.g. "mint_credits(uint64)void"
 * @param {any[]} args - Method arguments
 * @param {object} options - Extra options { onComplete, boxes, accounts, apps, assets }
 */
export async function callMethod(appId, sender, methodSignature, args = [], options = {}) {
    let suggestedParams;
    try {
        suggestedParams = await algodClient.getTransactionParams().do();
    } catch (e) {
        if (await switchToFallback()) return callMethod(appId, sender, methodSignature, args, options);
        throw e;
    }

    const method = algosdk.ABIMethod.fromSignature(methodSignature);

    const atc = new algosdk.AtomicTransactionComposer();

    atc.addMethodCall({
        appID: appId,
        method,
        sender,
        suggestedParams,
        signer: peraAtcSigner,
        methodArgs: args,
        onComplete: options.onComplete || algosdk.OnApplicationComplete.NoOpOC,
        boxes: options.boxes,
        appAccounts: options.accounts,
        appForeignApps: options.apps,
        appForeignAssets: options.assets,
    });

    const result = await atc.execute(algodClient, 4);
    return result;
}

/**
 * Simulate a readonly ABI method call (no wallet needed).
 */
export async function simulateReadonly(appId, sender, methodSignature, args = []) {
    let suggestedParams;
    try {
        suggestedParams = await algodClient.getTransactionParams().do();
    } catch (e) {
        if (await switchToFallback()) return simulateReadonly(appId, sender, methodSignature, args);
        throw e;
    }
    const method = algosdk.ABIMethod.fromSignature(methodSignature);

    const atc = new algosdk.AtomicTransactionComposer();

    atc.addMethodCall({
        appID: appId,
        method,
        sender: sender || 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        suggestedParams,
        signer: algosdk.makeEmptyTransactionSigner(),
        methodArgs: args,
    });

    const result = await atc.simulate(algodClient);

    if (result.methodResults && result.methodResults[0]) {
        return result.methodResults[0].returnValue;
    }
    return null;
}

/**
 * Read global state of an application.
 */
export async function readGlobalState(appId) {
    try {
        // Try Indexer for global state
        const appInfo = await indexerClient.lookupApplications(appId).do();
        const state = {};
        const globalState = appInfo.application?.params?.['global-state'];
        if (globalState) {
            for (const kv of globalState) {
                try {
                    const key = atob(kv.key);
                    const value = kv.value.type === 2 ? kv.value.uint : atob(kv.value.bytes);
                    state[key] = value;
                } catch (e) {
                    console.warn('Could not decode state key/value:', kv);
                }
            }
        }
        return state;
    } catch (error) {
        console.warn('Indexer state fetch failed for App', appId, ', trying algod:', error);
        try {
            const appInfo = await algodClient.getApplicationByID(appId).do();
            const state = {};
            if (appInfo.params?.['global-state']) {
                for (const kv of appInfo.params['global-state']) {
                    try {
                        const key = atob(kv.key);
                        const value = kv.value.type === 2 ? kv.value.uint : atob(kv.value.bytes);
                        state[key] = value;
                    } catch (e) {
                        console.warn('Could not decode state key/value:', kv);
                    }
                }
            }
            return state;
        } catch (e2) {
            if (await switchToFallback()) return readGlobalState(appId);
            return {};
        }
    }
}

/**
 * Read local state for a specific account.
 */
export async function readLocalState(appId, address) {
    try {
        const accountInfo = await algodClient.accountApplicationInformation(address, appId).do();
        const state = {};
        if (accountInfo['app-local-state']?.['key-value']) {
            for (const kv of accountInfo['app-local-state']['key-value']) {
                const key = atob(kv.key);
                const value = kv.value.type === 2 ? kv.value.uint : atob(kv.value.bytes);
                state[key] = value;
            }
        }
        return state;
    } catch (error) {
        if (await switchToFallback()) return readLocalState(appId, address);
        return {};
    }
}
