from algopy import ARC4Contract, GlobalState, UInt64
from algopy.arc4 import abimethod


class RetirementManager(ARC4Contract):
    """Manages carbon credit retirements."""

    def __init__(self) -> None:
        self.retired_credits = GlobalState(UInt64(0), key="retired_credits")

    @abimethod(create="require")
    def create(self) -> None:
        """Initialise retirement tracking."""
        self.retired_credits.value = UInt64(0)

    @abimethod()
    def retire_credits(self, amount: UInt64) -> None:
        """Retire carbon credits permanently."""
        assert amount > 0, "Amount must be greater than zero"
        self.retired_credits.value += amount
