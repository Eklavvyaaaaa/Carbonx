// Contract-specific helpers for the three CarbonX smart contracts
import { APP_IDS, ABI_METHODS } from '../config';
import { callMethod, simulateReadonly, readGlobalState, readLocalState, algodClient, getIndexerClient } from './algorand';

import algosdk from 'algosdk';

// ─── CarbonMarketplace ──────────────────────────────────────────────

export async function mintCredits(sender, amount) {
    return callMethod(
        APP_IDS.CARBON_MARKETPLACE,
        sender,
        ABI_METHODS.MARKETPLACE.mint_credits,
        [amount]
    );
}

export async function retireCredits(sender, amount) {
    return callMethod(
        APP_IDS.CARBON_MARKETPLACE,
        sender,
        ABI_METHODS.MARKETPLACE.retire_credits,
        [amount]
    );
}

export async function buyCredits(sender, amount, pricePerUnit) {
    // This is a placeholder or simplified wrapper. 
    // Use buyCreditsWithCost for actual implementation.
    console.warn("Use buyCreditsWithCost instead");
}

export async function buyCreditsWithCost(sender, creditAmount, totalCostMicroAlgos) {
    const params = await algodClient.getTransactionParams().do();

    // Payment Transaction to Contract
    const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: sender,
        to: algosdk.getApplicationAddress(APP_IDS.CARBON_MARKETPLACE),
        amount: BigInt(totalCostMicroAlgos),
        suggestedParams: params,
    });

    return callMethod(
        APP_IDS.CARBON_MARKETPLACE,
        sender,
        ABI_METHODS.MARKETPLACE.buy_credits,
        [
            { txn: payTxn, sign: true },
            creditAmount
        ]
    );
}

export async function getCurrentPrice() {
    return simulateReadonly(
        APP_IDS.CARBON_MARKETPLACE,
        null,
        ABI_METHODS.MARKETPLACE.get_current_price
    );
}

export async function getCredits(account) {
    return simulateReadonly(
        APP_IDS.CARBON_MARKETPLACE,
        null,
        ABI_METHODS.MARKETPLACE.get_credits,
        [account]
    );
}

export async function getTotalCredits() {
    return simulateReadonly(
        APP_IDS.CARBON_MARKETPLACE,
        null,
        ABI_METHODS.MARKETPLACE.get_total_credits
    );
}

export async function getRetiredCredits() {
    return simulateReadonly(
        APP_IDS.CARBON_MARKETPLACE,
        null,
        ABI_METHODS.MARKETPLACE.get_retired_credits
    );
}

export async function getMarketplaceState() {
    return readGlobalState(APP_IDS.CARBON_MARKETPLACE);
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

export async function getApprovedCount() {
    return simulateReadonly(
        APP_IDS.ISSUER_REGISTRY,
        null,
        ABI_METHODS.ISSUER_REGISTRY.get_approved_count
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
            // Check local state for 'is_registered' and 'is_approved'
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
    return callMethod(
        APP_IDS.RETIREMENT_MANAGER,
        sender,
        ABI_METHODS.RETIREMENT_MANAGER.retire_credits,
        [amount]
    );
}

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
