from algopy import ARC4Contract, Account, GlobalState, LocalState, Txn, Global, UInt64, gtxn
from algopy.arc4 import abimethod, baremethod


class CarbonMarketplace(ARC4Contract):
    """Marketplace for minting and retiring carbon credits with per-user tracking.

    Global state:
        total_credits    – total minted credits in circulation
        retired_credits  – cumulative credits permanently retired

    Local state (per account):
        credits_minted   – credits minted by/for this account
    """

    def __init__(self) -> None:
        self.total_credits = GlobalState(UInt64(0), key="total_credits")
        self.retired_credits = GlobalState(UInt64(0), key="retired_credits")
        self.credits_minted = LocalState(UInt64, key="credits_minted")

    @abimethod(create="require")
    def create(self) -> None:
        """Initialise the marketplace."""
        self.total_credits.value = UInt64(0)
        self.retired_credits.value = UInt64(0)

    @baremethod(allow_actions=["OptIn"])
    def opt_in(self) -> None:
        """Allow accounts to opt in for local state."""
        pass

    @abimethod()
    def mint_credits(self, amount: UInt64) -> None:
        """Mint new carbon credits to the caller. Creator only.

        Args:
            amount: number of credits to mint (must be > 0)
        """
        assert Txn.sender == Global.creator_address, "Only creator can mint credits"
        assert amount > 0, "Amount must be greater than zero"
        self.total_credits.value += amount
        current = self.credits_minted.get(Txn.sender, default=UInt64(0))
        self.credits_minted[Txn.sender] = current + amount

    @abimethod()
    def retire_credits(self, amount: UInt64) -> None:
        """Retire (burn) carbon credits from the caller's balance.

        Anyone who holds credits can retire them. This permanently removes
        them from circulation.

        Args:
            amount: number of credits to retire (must be > 0)
        """
        assert amount > 0, "Amount must be greater than zero"
        current = self.credits_minted.get(Txn.sender, default=UInt64(0))
        assert current >= amount, "Insufficient credits to retire"
        self.credits_minted[Txn.sender] = current - amount
        self.total_credits.value -= amount
        self.retired_credits.value += amount

    @abimethod()
    def buy_credits(self, payment: gtxn.PaymentTransaction, amount: UInt64) -> None:
        """Buy credits from the marketplace.

        Price increases as total supply increases (Linear Bonding Curve).
        Formula: Price = (Base + Supply * Slope) * Amount
        Base = 0.1 ALGO (100,000 microAlgos)
        Slope = 1 microAlgo per credit

        Args:
            payment: Payment transaction to the contract's account.
            amount: Number of credits to buy.
        """
        assert amount > 0, "Amount must be greater than zero"
        
        # Calculate Price
        base_price = UInt64(100_000) # 0.1 ALGO
        slope = UInt64(1)
        current_supply = self.total_credits.value
        unit_price = base_price + (current_supply * slope)
        total_cost = unit_price * amount
        
        # Verify Payment
        assert payment.receiver == Global.current_application_address, "Payment must be to contract"
        assert payment.amount >= total_cost, "Insufficient payment"
        
        # Mint Credits
        self.total_credits.value += amount
        current_bal = self.credits_minted.get(Txn.sender, default=UInt64(0))
        self.credits_minted[Txn.sender] = current_bal + amount

    @abimethod(readonly=True)
    def get_current_price(self) -> UInt64:
        """Return the current price per credit in microAlgos."""
        base_price = UInt64(100_000)
        slope = UInt64(1)
        return base_price + (self.total_credits.value * slope)

    @abimethod(readonly=True)
    def get_credits(self, account: Account) -> UInt64:
        """Return the credit balance for the given account."""
        return self.credits_minted.get(account, default=UInt64(0))

    @abimethod(readonly=True)
    def get_total_credits(self) -> UInt64:
        """Return the total credits currently in circulation."""
        return self.total_credits.value

    @abimethod(readonly=True)
    def get_retired_credits(self) -> UInt64:
        """Return the cumulative retired credits."""
        return self.retired_credits.value
