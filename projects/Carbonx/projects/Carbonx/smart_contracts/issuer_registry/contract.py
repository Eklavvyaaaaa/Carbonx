from algopy import ARC4Contract, Account, GlobalState, LocalState, Txn, Global, UInt64, Bytes
from algopy.arc4 import abimethod, baremethod


class IssuerRegistry(ARC4Contract):
    """Registry for carbon credit issuers with admin approval workflow.

    Global state:
        admin           – address of the contract administrator
        approved_count  – total number of currently approved issuers

    Local state (per account):
        is_registered   – 1 if the account has registered as an issuer
        is_approved     – 1 if the account has been approved by admin
    """

    def __init__(self) -> None:
        self.admin = GlobalState(Bytes(), key="admin")
        self.approved_count = GlobalState(UInt64(0), key="approved_count")
        self.is_registered = LocalState(UInt64, key="is_registered")
        self.is_approved = LocalState(UInt64, key="is_approved")

    @abimethod(create="require")
    def create(self) -> None:
        """Set the contract creator as admin."""
        self.admin.value = Txn.sender.bytes
        self.approved_count.value = UInt64(0)

    @baremethod(allow_actions=["OptIn"])
    def opt_in(self) -> None:
        """Allow accounts to opt in for local state."""
        pass

    @abimethod()
    def register_issuer(self) -> None:
        """Register the caller as an issuer.

        Reverts if the caller is already registered.
        """
        current = self.is_registered.get(Txn.sender, default=UInt64(0))
        assert current == 0, "Already registered"
        self.is_registered[Txn.sender] = UInt64(1)

    @abimethod()
    def approve_issuer(self, account: Account) -> None:
        """Approve a registered issuer. Admin only.

        The target account must have registered first.
        """
        assert Txn.sender.bytes == self.admin.value, "Only admin can approve"
        registered = self.is_registered.get(account, default=UInt64(0))
        assert registered == 1, "Account not registered"
        already_approved = self.is_approved.get(account, default=UInt64(0))
        assert already_approved == 0, "Account already approved"
        self.is_approved[account] = UInt64(1)
        self.approved_count.value += UInt64(1)

    @abimethod()
    def revoke_issuer(self, account: Account) -> None:
        """Revoke an approved issuer. Admin only.

        Sets the account's approved flag back to 0 and decrements the counter.
        """
        assert Txn.sender.bytes == self.admin.value, "Only admin can revoke"
        approved = self.is_approved.get(account, default=UInt64(0))
        assert approved == 1, "Account not approved"
        self.is_approved[account] = UInt64(0)
        self.approved_count.value -= UInt64(1)

    @abimethod(readonly=True)
    def get_issuer_status(self, account: Account) -> UInt64:
        """Return the approval status for the given account.

        Returns:
            0 – not registered
            1 – registered but not approved
            2 – registered and approved
        """
        registered = self.is_registered.get(account, default=UInt64(0))
        if registered == 0:
            return UInt64(0)
        approved = self.is_approved.get(account, default=UInt64(0))
        if approved == 1:
            return UInt64(2)
        return UInt64(1)

    @abimethod(readonly=True)
    def get_approved_count(self) -> UInt64:
        """Return the total number of currently approved issuers."""
        return self.approved_count.value
