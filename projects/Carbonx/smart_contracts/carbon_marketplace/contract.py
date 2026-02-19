from algopy import ARC4Contract, GlobalState, LocalState, Txn, UInt64
from algopy.arc4 import abimethod, baremethod


class CarbonMarketplace(ARC4Contract):
    """Marketplace for minting carbon credits with per-user tracking."""

    def __init__(self) -> None:
        self.total_credits = GlobalState(UInt64(0), key="total_credits")
        self.credits_minted = LocalState(UInt64, key="credits_minted")

    @abimethod(create="require")
    def create(self) -> None:
        """Initialise the marketplace."""
        self.total_credits.value = UInt64(0)

    @baremethod(allow_actions=["OptIn"])
    def opt_in(self) -> None:
        """Allow accounts to opt in for local state."""
        pass

    @abimethod()
    def mint_credits(self, amount: UInt64) -> None:
        """Mint new carbon credits for the caller."""
        assert amount > 0, "Amount must be greater than zero"
        self.total_credits.value += amount
        current = self.credits_minted.get(Txn.sender, default=UInt64(0))
        self.credits_minted[Txn.sender] = current + amount
