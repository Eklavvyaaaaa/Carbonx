// Contract-specific helpers for the three CarbonX smart contracts
import { APP_IDS, ABI_METHODS } from '../config';
import { callMethod, simulateReadonly, readGlobalState, algodClient, getIndexerClient } from './algorand';
import { signTransactions } from './wallet';

import algosdk from 'algosdk';

// ─── Utility: ASA Opt-in ───────────────────────────────────────────

/**
 * Opt-in to the CXT asset
 * @param {string} sender - Account address to opt-in
 * @returns {Promise<Object>} - Transaction confirmation
 */
export async function optInToCXT(sender) {
    console.log('[DEBUG] optInToCXT called for:', sender);

    if (!sender) {
        throw new Error("Sender address is required");
    }

    try {
        // Get transaction parameters
        const params = await algodClient.getTransactionParams().do();
        
        // Ensure Testnet parameters are set
        if (!params.genesisHash) {
            params.genesisHash = 'SGO1GKSzyE7IEPItTxCBywTZ644S4o/W88un3Ry7jd0=';
        }
        if (!params.genesisID) {
            params.genesisID = 'testnet-v1.0';
        }

        const assetIndex = Number(APP_IDS.CXT_ASSET_ID);
        if (!assetIndex || assetIndex === 0) {
            throw new Error("CXT_ASSET_ID is not configured properly");
        }

        console.log(`[DEBUG] Creating opt-in transaction for asset ${assetIndex}`);

        // Create the opt-in transaction (asset transfer to self with amount 0)
        const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: sender,
            to: sender,
            assetIndex: assetIndex,
            amount: 0,
            suggestedParams: params,
        });

        console.log('[DEBUG] Opt-in transaction created successfully');

        // Prepare transaction for signing
        // signTransactions expects array of { txn, signers? }
        const txnsToSign = [{
            txn: optInTxn,
            signers: [sender]
        }];

        console.log('[DEBUG] Requesting signature from wallet...');
        const signedTxns = await signTransactions(txnsToSign);

        if (!signedTxns || signedTxns.length === 0) {
            throw new Error("No signed transactions returned. Transaction may have been cancelled.");
        }

        console.log('[DEBUG] Transaction signed. Broadcasting to network...');
        
        // Send the signed transaction(s) to the network
        // sendRawTransaction accepts Uint8Array[] directly
        const { txId } = await algodClient.sendRawTransaction(signedTxns).do();

        console.log('[DEBUG] Transaction broadcasted. Transaction ID:', txId);
        console.log('[DEBUG] Waiting for confirmation...');

        // Wait for confirmation (4 rounds)
        const confirmation = await algosdk.waitForConfirmation(algodClient, txId, 4);

        console.log('[DEBUG] Transaction confirmed in round:', confirmation['confirmed-round']);
        return confirmation;
    } catch (err) {
        console.error('[DEBUG] Error during opt-in:', err);
        
        // Re-throw with more context if needed
        if (err.message) {
            throw err;
        }
        throw new Error(`Opt-in failed: ${err.toString()}`);
    }
}

/**
 * Check if an address has opted into the CXT asset
 * @param {string} address - Account address to check
 * @returns {Promise<boolean>} - True if opted in, false otherwise
 */
export async function checkCXTOptIn(address) {
    if (!address) {
        return false;
    }

    try {
        const indexer = getIndexerClient();
        const accountInfo = await indexer.lookupAccountByID(address).do();
        const assets = accountInfo.account?.assets || [];
        
        const assetId = Number(APP_IDS.CXT_ASSET_ID);
        const isOptedIn = assets.some(a => Number(a['asset-id']) === assetId);
        
        console.log(`[DEBUG] checkCXTOptIn for ${address}:`, isOptedIn);
        return isOptedIn;
    } catch (e) {
        console.warn('[DEBUG] Indexer check failed, trying algod:', e.message);
        try {
            const accountInfo = await algodClient.accountInformation(address).do();
            const assets = accountInfo.assets || [];
            const assetId = Number(APP_IDS.CXT_ASSET_ID);
            return assets.some(a => Number(a['asset-id']) === assetId);
        } catch (e2) {
            console.error('[DEBUG] Both indexer and algod checks failed:', e2.message);
            return false;
        }
    }
}

// ─── CarbonMarketplace ──────────────────────────────────────────────

/**
 * Create a TransactionWithSigner for use with AtomicTransactionComposer.
 * Signs the full group once so Pera gets both txns in one approval.
 */
function makeWalletTransactionWithSigner(sender) {
    return {
        signer: async (txnGroup, indexesToSign) => {
            // Sign the full group so the wallet sees both txns in one approval
            const fullGroup = txnGroup.map(t => ({ txn: t, signers: [sender] }));
            const signedAll = await signTransactions(fullGroup);
            // Return only the txns we were asked to sign, in indexesToSign order
            return indexesToSign.map(i => signedAll[i]);
        }
    };
}

export async function mintCredits(sender, amount) {
    const params = await algodClient.getTransactionParams().do();
    params.genesisHash = params.genesisHash || 'SGO1GKSzyE7IEPItTxCBywTZ644S4o/W88un3Ry7jd0=';
    params.genesisID = params.genesisID || 'testnet-v1.0';

    const axferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: sender,
        to: algosdk.getApplicationAddress(APP_IDS.CARBON_MARKETPLACE),
        assetIndex: Number(APP_IDS.CXT_ASSET_ID),
        amount: BigInt(amount),
        suggestedParams: params,
    });

    const axferWithSigner = {
        txn: axferTxn,
        ...makeWalletTransactionWithSigner(sender)
    };

    return callMethod(
        APP_IDS.CARBON_MARKETPLACE,
        sender,
        ABI_METHODS.MARKETPLACE.mint_credits,
        [axferWithSigner],
        { assets: [Number(APP_IDS.CXT_ASSET_ID)] }
    );
}

export async function buyCreditsWithCost(sender, creditAmount, totalCostMicroAlgos) {
    const params = await algodClient.getTransactionParams().do();
    params.genesisHash = params.genesisHash || 'SGO1GKSzyE7IEPItTxCBywTZ644S4o/W88un3Ry7jd0=';
    params.genesisID = params.genesisID || 'testnet-v1.0';

    // Contract expects payment >= 0; use at least 0.1 ALGO (100_000 microAlgos) if computed cost is 0
    const paymentAmount = BigInt(totalCostMicroAlgos) > 0n
        ? BigInt(totalCostMicroAlgos)
        : 100_000n;

    const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: sender,
        to: algosdk.getApplicationAddress(APP_IDS.CARBON_MARKETPLACE),
        amount: paymentAmount,
        suggestedParams: params,
    });

    const payWithSigner = {
        txn: payTxn,
        ...makeWalletTransactionWithSigner(sender)
    };

    return callMethod(
        APP_IDS.CARBON_MARKETPLACE,
        sender,
        ABI_METHODS.MARKETPLACE.buy_credits,
        [
            payWithSigner,
            BigInt(creditAmount)
        ],
        { assets: [Number(APP_IDS.CXT_ASSET_ID)] }
    );
}

export async function getCurrentPrice() {
    try {
        const price = await simulateReadonly(
            APP_IDS.CARBON_MARKETPLACE,
            null,
            ABI_METHODS.MARKETPLACE.get_current_price
        );
        return price != null ? price : 1_000_000;
    } catch (e) {
        // Contract may not have get_current_price; use 1 ALGO per credit as fallback
        return 1_000_000;
    }
}

export async function getMarketplaceState() {
    return readGlobalState(APP_IDS.CARBON_MARKETPLACE);
}

export async function getCredits(account) {
    return simulateReadonly(
        APP_IDS.CARBON_MARKETPLACE,
        null,
        ABI_METHODS.MARKETPLACE.get_credits,
        [account]
    );
}

// ─── IssuerRegistry ─────────────────────────────────────────────────

export async function registerIssuer(sender) {
    return callMethod(
        APP_IDS.ISSUER_REGISTRY,
        sender,
        ABI_METHODS.ISSUER_REGISTRY.register_issuer
    );
}

export async function approveIssuer(sender, account) {
    return callMethod(
        APP_IDS.ISSUER_REGISTRY,
        sender,
        ABI_METHODS.ISSUER_REGISTRY.approve_issuer,
        [account]
    );
}

export async function voteForIssuer(sender, account) {
    return callMethod(
        APP_IDS.ISSUER_REGISTRY,
        sender,
        ABI_METHODS.ISSUER_REGISTRY.vote,
        [account]
    );
}

export async function revokeIssuer(sender, account) {
    return callMethod(
        APP_IDS.ISSUER_REGISTRY,
        sender,
        ABI_METHODS.ISSUER_REGISTRY.revoke_issuer,
        [account]
    );
}

export async function getIssuerStatus(account) {
    return simulateReadonly(
        APP_IDS.ISSUER_REGISTRY,
        null,
        ABI_METHODS.ISSUER_REGISTRY.get_issuer_status,
        [account]
    );
}

export async function getIssuerRegistryState() {
    return readGlobalState(APP_IDS.ISSUER_REGISTRY);
}

export async function getPendingIssuers() {
    const indexer = getIndexerClient();
    try {
        const response = await indexer.searchAccounts()
            .applicationID(APP_IDS.ISSUER_REGISTRY)
            .do();

        const pending = [];
        for (const account of response.accounts) {
            const localState = account['apps-local-state']?.find(a => a.id === APP_IDS.ISSUER_REGISTRY);
            if (!localState) continue;

            const getKey = (key) => {
                const kv = localState['key-value']?.find(k => atob(k.key) === key);
                return kv ? (kv.value.type === 2 ? kv.value.uint : atob(kv.value.bytes)) : 0;
            };

            const isRegistered = getKey('is_registered');
            const isApproved = getKey('is_approved');
            const votes = getKey('vote_count');

            if (isRegistered === 1 && isApproved === 0) {
                pending.push({
                    address: account.address,
                    votes: votes || 0
                });
            }
        }
        return pending;
    } catch (e) {
        console.error('Error fetching pending issuers:', e);
        return [];
    }
}

// ─── RetirementManager ──────────────────────────────────────────────

export async function addSupply(sender, amount) {
    return callMethod(
        APP_IDS.RETIREMENT_MANAGER,
        sender,
        ABI_METHODS.RETIREMENT_MANAGER.add_supply,
        [amount]
    );
}

export async function retireCreditsRM(sender, amount) {
    const params = await algodClient.getTransactionParams().do();
    params.genesisHash = params.genesisHash || 'SGO1GKSzyE7IEPItTxCBywTZ644S4o/W88un3Ry7jd0=';
    params.genesisID = params.genesisID || 'testnet-v1.0';

    const axferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: sender,
        to: algosdk.getApplicationAddress(APP_IDS.RETIREMENT_MANAGER),
        assetIndex: APP_IDS.CXT_ASSET_ID,
        amount: BigInt(amount),
        suggestedParams: params,
    });

    return callMethod(
        APP_IDS.RETIREMENT_MANAGER,
        sender,
        ABI_METHODS.RETIREMENT_MANAGER.retire_credits,
        [
            { txn: axferTxn, sign: true }
        ]
    );
}

export const retireCredits = retireCreditsRM;

export async function getRetirementStats() {
    return simulateReadonly(
        APP_IDS.RETIREMENT_MANAGER,
        null,
        ABI_METHODS.RETIREMENT_MANAGER.get_retirement_stats
    );
}

export async function getAvailableSupply() {
    return simulateReadonly(
        APP_IDS.RETIREMENT_MANAGER,
        null,
        ABI_METHODS.RETIREMENT_MANAGER.get_available_supply
    );
}

export async function getRetirementManagerState() {
    return readGlobalState(APP_IDS.RETIREMENT_MANAGER);
}
