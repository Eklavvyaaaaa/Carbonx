import sys
import os
sys.path.append(os.getcwd())

import algokit_utils
from algokit_utils import AlgorandClient, AlgoAmount
from smart_contracts.artifacts.retirement_manager.retirement_manager_client import RetirementManagerClient
from dotenv import load_dotenv

load_dotenv()
algorand = AlgorandClient.testnet()
deployer = algorand.account.from_environment('DEPLOYER')
client = RetirementManagerClient(algorand=algorand, app_id=755796917, default_sender=deployer.address)

try:
    print("Attempting init_asset call with extra_fee...")
    result = client.app_client.send.call(
        algokit_utils.AppClientMethodCallParams(
            method="init_asset(uint64)void",
            args=[755796756],
            asset_references=[755796756],
            extra_fee=AlgoAmount(micro_algo=1000)
        )
    )
    print(f"Success! TXID: {result.tx_id}")
except Exception as e:
    print(f"Failed: {e}")
