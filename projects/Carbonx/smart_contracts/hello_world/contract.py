from algopy import ARC4Contract, GlobalState, Txn, Global, UInt64, String
from algopy.arc4 import abimethod


class CarbonX(ARC4Contract):
    """Carbon Credit Registry — register projects, mint credits, and retire them."""

    def __init__(self) -> None:
        self.project_name = GlobalState(String(""), key="project_name")
        self.total_credits = GlobalState(UInt64(0), key="total_credits")
        self.retired_credits = GlobalState(UInt64(0), key="retired_credits")

    @abimethod(create="require")
    def create(self) -> None:
        """Initialise the registry with default global state."""
        self.project_name.value = String("")
        self.total_credits.value = UInt64(0)
        self.retired_credits.value = UInt64(0)

    @abimethod()
    def register_project(self, name: String) -> None:
        """Register a carbon project. Creator only."""
        assert Txn.sender == Global.creator_address, "Only creator can register projects"
        self.project_name.value = name

    @abimethod()
    def mint_credits(self, amount: UInt64) -> None:
        """Mint new carbon credits. Creator only."""
        assert Txn.sender == Global.creator_address, "Only creator can mint credits"
        assert amount > 0, "Amount must be greater than zero"
        self.total_credits.value += amount

    @abimethod()
    def retire_credits(self, amount: UInt64) -> None:
        """Retire carbon credits — callable by anyone."""
        assert amount > 0, "Amount must be greater than zero"
        assert self.total_credits.value >= amount, "Insufficient credits to retire"
        self.total_credits.value -= amount
        self.retired_credits.value += amount