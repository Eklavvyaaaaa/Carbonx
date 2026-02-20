// ─── Algorand Testnet Configuration ─────────────────────────────────
export const ALGORAND_NODE = 'https://testnet-api.algonode.cloud';
export const ALGORAND_INDEXER = 'https://testnet-idx.algonode.cloud';
export const ALGORAND_NETWORK = 'testnet';

// ─── Deployed Contract App IDs (Testnet) ─────────────────────────────
export const APP_IDS = {
    CARBON_MARKETPLACE: 755796939,
    ISSUER_REGISTRY: 755796937,
    RETIREMENT_MANAGER: 755796917,
    CXT_ASSET_ID: 755796756,      // Official $CXT Asset ID
    GOVERNANCE_TOKEN_ID: 0,       // CXG not yet deployed on Testnet
};

// ─── ABI Method Signatures ──────────────────────────────────────────
export const ABI_METHODS = {
    MARKETPLACE: {
        create: 'create()void',
        mint_credits: 'mint_credits(axfer)void',
        retire_credits: 'retire_credits(axfer)void',
        get_credits: 'get_credits(address)uint64',
        get_total_credits: 'get_total_credits()uint64',
        get_retired_credits: 'get_retired_credits()uint64',
        buy_credits: 'buy_credits(pay,uint64)void',
        get_current_price: 'get_current_price()uint64',
        init_asset: 'init_asset(asset)void',
    },
    ISSUER_REGISTRY: {
        create: 'create()void',
        register_issuer: 'register_issuer()void',
        vote: 'vote(account)void',
        approve_issuer: 'approve_issuer(account)void',
        revoke_issuer: 'revoke_issuer(address)void',
        get_issuer_status: 'get_issuer_status(address)uint64',
        get_approved_count: 'get_approved_count()uint64',
    },
    RETIREMENT_MANAGER: {
        create: 'create()void',
        add_supply: 'add_supply(uint64)void',
        retire_credits: 'retire_credits(axfer)void',
        get_retirement_stats: 'get_retirement_stats()uint64',
        get_available_supply: 'get_available_supply()uint64',
        init_asset: 'init_asset(uint64)void',
    },
};
