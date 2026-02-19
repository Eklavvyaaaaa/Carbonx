// ─── Algorand Testnet Configuration ─────────────────────────────────
// Replace the APP_ID values with your deployed contract App IDs on testnet.

export const ALGORAND_NODE = 'https://testnet-api.algonode.cloud';
export const ALGORAND_INDEXER = 'https://testnet-idx.algonode.cloud';
export const ALGORAND_NETWORK = 'testnet';

// ─── Deployed Contract App IDs ──────────────────────────────────────
// Set these after deploying your contracts to testnet
export const APP_IDS = {
    CARBON_MARKETPLACE: 0,    // Replace with your CarbonMarketplace App ID
    ISSUER_REGISTRY: 0,       // Replace with your IssuerRegistry App ID
    RETIREMENT_MANAGER: 0,    // Replace with your RetirementManager App ID
};

// ─── ABI Method Signatures ──────────────────────────────────────────
export const ABI_METHODS = {
    MARKETPLACE: {
        create: 'create()void',
        mint_credits: 'mint_credits(uint64)void',
        retire_credits: 'retire_credits(uint64)void',
        get_credits: 'get_credits(address)uint64',
        get_total_credits: 'get_total_credits()uint64',
        get_retired_credits: 'get_retired_credits()uint64',
    },
    ISSUER_REGISTRY: {
        create: 'create()void',
        register_issuer: 'register_issuer()void',
        approve_issuer: 'approve_issuer(address)void',
        revoke_issuer: 'revoke_issuer(address)void',
        get_issuer_status: 'get_issuer_status(address)uint64',
        get_approved_count: 'get_approved_count()uint64',
    },
    RETIREMENT_MANAGER: {
        create: 'create()void',
        add_supply: 'add_supply(uint64)void',
        retire_credits: 'retire_credits(uint64)void',
        get_retirement_stats: 'get_retirement_stats()uint64',
        get_available_supply: 'get_available_supply()uint64',
    },
};
