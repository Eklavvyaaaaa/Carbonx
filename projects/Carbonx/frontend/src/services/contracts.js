// Contract-specific helpers for the three CarbonX smart contracts
import { APP_IDS, ABI_METHODS } from '../config';
import { callMethod, simulateReadonly, readGlobalState } from './algorand';

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
