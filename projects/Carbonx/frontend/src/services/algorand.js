// Algorand client wrapper for interacting with the blockchain
import algosdk from 'algosdk';
import { ALGORAND_NODE, ALGORAND_INDEXER } from '../config';
import { signTransactions } from './wallet';

export const algodClient = new algosdk.Algodv2('', ALGORAND_NODE, '');
const indexerClient = new algosdk.Indexer('', ALGORAND_INDEXER, '');

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

/**
 * Call an ABI method on a contract.
 * @param {number} appId - Application ID
 * @param {string} sender - Sender address
 * @param {string} methodSignature - e.g. "mint_credits(uint64)void"
 * @param {any[]} args - Method arguments
 * @param {object} options - Extra options { onComplete, boxes, accounts, apps, assets }
 */
export async function callMethod(appId, sender, methodSignature, args = [], options = {}) {
    const suggestedParams = await algodClient.getTransactionParams().do();

    const method = algosdk.ABIMethod.fromSignature(methodSignature);

    const atc = new algosdk.AtomicTransactionComposer();

    atc.addMethodCall({
        appID: appId,
        method,
        sender,
        suggestedParams,
        signer: async (txnGroup, indexesToSign) => {
            const txnsToSign = indexesToSign.map(i => ({
                txn: txnGroup[i],
            }));
            return await signTransactions(txnsToSign);
        },
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
    const suggestedParams = await algodClient.getTransactionParams().do();
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
        const appInfo = await algodClient.getApplicationByID(appId).do();
        const state = {};
        if (appInfo.params?.['global-state']) {
            for (const kv of appInfo.params['global-state']) {
                const key = atob(kv.key);
                const value = kv.value.type === 2 ? kv.value.uint : atob(kv.value.bytes);
                state[key] = value;
            }
        }
        return state;
    } catch (error) {
        console.error('Error reading global state:', error);
        return {};
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
        return {};
    }
}
