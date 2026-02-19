from algosdk.v2client import algod
import json

def check_token():
    # Localnet Configuration
    algod_address = "http://localhost:4001"
    algod_token = "a" * 64
    client = algod.AlgodClient(algod_token, algod_address)

    asset_id = 1008
    try:
        info = client.asset_info(asset_id)
        print(f"✅ Token Found (ID: {asset_id})")
        print(json.dumps(info['params'], indent=2))
    except Exception as e:
        print(f"❌ Token ID {asset_id} not found: {e}")

if __name__ == "__main__":
    check_token()
