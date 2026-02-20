from algopy import ARC4Contract, Account, Asset, GlobalState, LocalState, Txn, Global, UInt64, gtxn, itxn
from algopy.arc4 import abimethod, baremethod


class CarbonMarketplace(ARC4Contract):
    """Marketplace for distributing $CXT carbon credits via real tokens.

    Global state:
        total_credits    – total credits distributed (informative)
        retired_credits  – cumulative credits permanently retired
        cxt_asset_id    – the Asset ID of the $CXT token
    """

    def __init__(self) -> None:
        self.total_credits = GlobalState(UInt64(0), key="total_credits")
        self.retired_credits = GlobalState(UInt64(0), key="retired_credits")
        self.cxt_asset_id = GlobalState(UInt64(0), key="cxt_asset_id")

    @abimethod(create="require")
    def create(self) -> None:
        """Initialise the marketplace."""
        self.total_credits.value = UInt64(0)
        self.retired_credits.value = UInt64(0)
        self.cxt_asset_id.value = UInt64(0)

    @abimethod()
    def init_asset(self, asset: Asset) -> None:
        """Opt-in to the $CXT ASA and set its ID. Creator only.
        
        Args:
            asset: The $CXT asset to opt-in to.
        """
        assert Txn.sender == Global.creator_address, "Only creator can init asset"
        assert self.cxt_asset_id.value == 0, "Asset already initialized"
        
        self.cxt_asset_id.value = asset.id
        
        # Opt-in to asset via inner transaction
        itxn.AssetTransfer(
            xfer_asset=asset,
            asset_receiver=Global.current_application_address,
            asset_amount=0,
        ).submit()

    @abimethod()
    def buy_credits(self, buyer_tx: gtxn.PaymentTransaction, amount: UInt64) -> None:
        """Purchase carbon credits using ALGO.
        
        The contract sends $CXT tokens from its balance to the buyer.
        
        Args:
            buyer_tx: The payment transaction from the buyer to the contract.
            amount: Number of credits to purchase.
        """
        assert buyer_tx.receiver == Global.current_application_address, "Payment must be to contract"
        assert amount > 0, "Amount must be greater than zero"
        
        asset_id = self.cxt_asset_id.value
        assert asset_id != 0, "Asset not initialized"
        
        # In a real scenario, we would calculate the price here.
        # For simplicity, let's assume 1 Credit = 1 ALGO for now, or use a price oracle.
        # current_price = self.get_current_price()
        # assert buyer_tx.amount >= current_price * amount
        
        # Send $CXT to buyer
        itxn.AssetTransfer(
            xfer_asset=Asset(asset_id),
            asset_receiver=Txn.sender,
            asset_amount=amount,
        ).submit()
        
        self.total_credits.value += amount

    @abimethod()
    def mint_credits(self, axfer_tx: gtxn.AssetTransferTransaction) -> None:
        """Deposit new $CXT credits into the contract. Creator only.
        
        Args:
            axfer_tx: The asset transfer from the creator/reserve to the contract.
        """
        assert Txn.sender == Global.creator_address, "Only creator can deposit credits"
        assert axfer_tx.asset_receiver == Global.current_application_address, "Transfer must be to contract"
        assert axfer_tx.xfer_asset.id == self.cxt_asset_id.value, "Incorrect asset ID"
        
        # Informative update, the actual balance is on the ASA
        pass

    @abimethod(readonly=True)
    def get_asset_id(self) -> UInt64:
        """Return the $CXT Asset ID."""
        return self.cxt_asset_id.value

    @abimethod(readonly=True)
    def get_total_credits(self) -> UInt64:
        """Return the total credits distributed."""
        return self.total_credits.value

    @abimethod(readonly=True)
    def get_retired_credits(self) -> UInt64:
        """Return the cumulative retired credits."""
        return self.retired_credits.value
