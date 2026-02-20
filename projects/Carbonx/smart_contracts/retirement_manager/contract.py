from algopy import ARC4Contract, GlobalState, Txn, Global, UInt64, gtxn, Asset
from algopy.arc4 import abimethod


class RetirementManager(ARC4Contract):
    """Manages carbon credit retirements by verifying $CXT ASA transfers.

    Global state:
        retired_credits  – credits permanently retired
        cxt_asset_id    – the Asset ID of the $CXT token
    """

    def __init__(self) -> None:
        self.retired_credits = GlobalState(UInt64(0), key="retired_credits")
        self.cxt_asset_id = GlobalState(UInt64(0), key="cxt_asset_id")

    @abimethod(create="require")
    def create(self) -> None:
        """Initialise retirement tracking."""
        self.retired_credits.value = UInt64(0)
        self.cxt_asset_id.value = UInt64(0)

    @abimethod()
    def init_asset(self, asset: Asset) -> None:
        """Set the $CXT Asset ID. Creator only.
        
        Args:
            asset: The $CXT asset to track.
        """
        assert Txn.sender == Global.creator_address, "Only creator can init asset"
        assert self.cxt_asset_id.value == 0, "Asset already initialized"
        self.cxt_asset_id.value = asset.id
        
        # Note: RetirementManager doesn't necessarily need to opt-in 
        # unless it wants to hold tokens instead of just receiving them.
        # But if we want to "collect" them, it MUST opt-in.
        from algopy import itxn
        itxn.AssetTransfer(
            xfer_asset=asset,
            asset_receiver=Global.current_application_address,
            asset_amount=0,
        ).submit()

    @abimethod()
    def retire_credits(self, axfer_tx: gtxn.AssetTransferTransaction) -> None:
        """Retire carbon credits permanently.
        
        Requires an atomic group:
        1. Asset Transfer ($CXT) from User to RetirementManager
        2. App Call to this method
        
        Args:
            axfer_tx: The asset transfer from the user to the contract.
        """
        assert axfer_tx.asset_receiver == Global.current_application_address, "Transfer must be to contract"
        assert axfer_tx.xfer_asset.id == self.cxt_asset_id.value, "Incorrect asset ID"
        assert axfer_tx.asset_amount > 0, "Amount must be greater than zero"
        
        # Update global tally
        self.retired_credits.value += axfer_tx.asset_amount

    @abimethod(readonly=True)
    def get_retirement_stats(self) -> UInt64:
        """Return the total retired credits."""
        return self.retired_credits.value
