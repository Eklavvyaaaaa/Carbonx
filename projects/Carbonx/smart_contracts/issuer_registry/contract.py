from algopy import ARC4Contract, Account, GlobalState, LocalState, Txn, Global, UInt64, Bytes
from algopy.arc4 import abimethod, baremethod


class IssuerRegistry(ARC4Contract):
    """Registry for carbon credit issuers with admin approval workflow."""

    def __init__(self) -> None:
        self.admin = GlobalState(Bytes(), key="admin")
        self.is_registered = LocalState(UInt64, key="is_registered")
        self.is_approved = LocalState(UInt64, key="is_approved")

    @abimethod(create="require")
    def create(self) -> None:
        """Set the contract creator as admin."""
        self.admin.value = Txn.sender.bytes

    @baremethod(allow_actions=["OptIn"])
    def opt_in(self) -> None:
        """Allow accounts to opt in for local state."""
        pass

    @abimethod()
    def register_issuer(self) -> None:
        """Register the caller as an issuer."""
        current = self.is_registered.get(Txn.sender, default=UInt64(0))
        assert current == 0, "Already registered"
        self.is_registered[Txn.sender] = UInt64(1)

    @abimethod()
    def approve_issuer(self, account: Account) -> None:
        """Approve a registered issuer. Admin only."""
        assert Txn.sender.bytes == self.admin.value, "Only admin can approve"
        registered = self.is_registered.get(account, default=UInt64(0))
        assert registered == 1, "Account not registered"
        self.is_approved[account] = UInt64(1)
