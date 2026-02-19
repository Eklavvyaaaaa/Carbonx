from algopy import ARC4Contract, GlobalState, Txn, Global, UInt64
from algopy.arc4 import abimethod


class RetirementManager(ARC4Contract):
    """Manages carbon credit retirements with admin access control.

    Global state:
        total_supply     – total credits registered in this manager
        retired_credits  – credits permanently retired
    """

    def __init__(self) -> None:
        self.total_supply = GlobalState(UInt64(0), key="total_supply")
        self.retired_credits = GlobalState(UInt64(0), key="retired_credits")

    @abimethod(create="require")
    def create(self) -> None:
        """Initialise retirement tracking."""
        self.total_supply.value = UInt64(0)
        self.retired_credits.value = UInt64(0)

    @abimethod()
    def add_supply(self, amount: UInt64) -> None:
        """Register additional credit supply. Creator only.

        This should be called when credits are minted in the marketplace
        so this manager knows the total supply available for retirement.

        Args:
            amount: number of credits to add (must be > 0)
        """
        assert Txn.sender == Global.creator_address, "Only creator can add supply"
        assert amount > 0, "Amount must be greater than zero"
        self.total_supply.value += amount

    @abimethod()
    def retire_credits(self, amount: UInt64) -> None:
        """Retire carbon credits permanently. Creator only.

        Credits are removed from the available supply and added to
        the retirement tally.

        Args:
            amount: number of credits to retire (must be > 0)
        """
        assert Txn.sender == Global.creator_address, "Only creator can retire credits"
        assert amount > 0, "Amount must be greater than zero"
        available = self.total_supply.value - self.retired_credits.value
        assert available >= amount, "Insufficient supply to retire"
        self.retired_credits.value += amount

    @abimethod(readonly=True)
    def get_retirement_stats(self) -> UInt64:
        """Return the total retired credits."""
        return self.retired_credits.value

    @abimethod(readonly=True)
    def get_available_supply(self) -> UInt64:
        """Return credits available for retirement (total_supply - retired)."""
        return self.total_supply.value - self.retired_credits.value
