import logging
import algokit_utils
from algokit_utils import AlgorandClient
from algosdk.transaction import AssetConfigTxn

logger = logging.getLogger(__name__)

def create_cxt_asa():
    import os
    from dotenv import load_dotenv
    
    # Load .env from root
    env_path = os.path.join(os.path.dirname(__file__), "../../../.env")
    load_dotenv(env_path)
    
    # Explicitly use testnet
    algorand = AlgorandClient.testnet()
    
    mnemonic = os.getenv("DEPLOYER_MNEMONIC")
    deployer = None
    
    if mnemonic:
        try:
            deployer = algorand.account.from_mnemonic(mnemonic=mnemonic)
        except Exception as e:
            logger.warning(f"Invalid mnemonic in .env: {e}")
            
    if not deployer:
        logger.info("Generating a new deployer account for Testnet...")
        # Note: In a real agentic flow, we'd persist this, but for now we follow Algokit patterns
        # Better: Tell the user to get a real mnemonic or fund this one.
        new_account = algorand.account.random()
        from algosdk import mnemonic as algosdk_mnemonic
        logger.error("\n" + "="*60)
        logger.error("🛑 ACTION REQUIRED: TESTNET DISPENSER")
        logger.error(f"Address: {new_account.address}")
        logger.error("1. Go to: https://bank.testnet.algorand.network/")
        logger.error(f"2. Paste address: {new_account.address}")
        logger.error("3. Fund the account with test ALGO.")
        logger.error("4. Update your .env with the following mnemonic:")
        logger.error(f"DEPLOYER_MNEMONIC=\"{algosdk_mnemonic.from_private_key(new_account.private_key)}\"")
        logger.error("="*60 + "\n")
        return
    
    # 10 Billion total supply with 6 decimals
    # 10,000,000,000 * 1,000,000 = 10,000,000,000,000,000
    total_supply = 10_000_000_000_000_000
    
    logger.info(f"Creating $CXT ASA from {deployer.address}...")
    
    # Using raw Transaction for Asset Creation to have full control
    params = algorand.client.algod.suggested_params()
    
    txn = AssetConfigTxn(
        sender=deployer.address,
        sp=params,
        total=total_supply,
        decimals=6,
        default_frozen=False,
        unit_name="CXT",
        asset_name="Carbon Credits",
        manager=deployer.address,
        reserve=deployer.address,
        freeze=deployer.address,
        clawback=deployer.address,
        url="https://carbonx.finance",
    )
    
    signed_txn = txn.sign(deployer.private_key)
    tx_id = algorand.client.algod.send_transaction(signed_txn)
    
    logger.info(f"Asset Creation Transaction ID: {tx_id}")
    
    # Wait for confirmation
    result = algokit_utils.wait_for_confirmation(algorand.client.algod, tx_id, 4)
    asset_id = result["asset-index"]
    
    logger.info(f"Successfully created $CXT ASA. Asset ID: {asset_id}")
    
    # Update .env file
    env_path = os.path.join(os.path.dirname(__file__), "../../../.env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            lines = f.readlines()
        
        updated = False
        with open(env_path, "w") as f:
            for line in lines:
                if line.startswith("CXT_ASSET_ID="):
                    f.write(f"CXT_ASSET_ID={asset_id}\n")
                    updated = True
                else:
                    f.write(line)
            if not updated:
                f.write(f"\nCXT_ASSET_ID={asset_id}\n")
        logger.info(f"Updated .env with CXT_ASSET_ID={asset_id}")
    
    return asset_id

if __name__ == "__main__":
    import os
    logging.basicConfig(level=logging.INFO)
    
    # Check if already exists in env to avoid duplicates
    existing_id = os.getenv("CXT_ASSET_ID")
    if existing_id:
        logger.info(f"$CXT ASA already exists in env: {existing_id}")
    else:
        create_cxt_asa()
