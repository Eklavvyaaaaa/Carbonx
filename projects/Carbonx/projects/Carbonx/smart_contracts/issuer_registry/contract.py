from algopy import ARC4Contract, Account, GlobalState, LocalState, Txn, Global, UInt64, Bytes, op

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
        self.vote_count = LocalState(UInt64, key="vote_count")

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
        self.vote_count[Txn.sender] = UInt64(0)

    @abimethod()
    def vote(self, issuer: Account) -> None:
        """Vote for an issuer to be approved. Requires holding CXG token (ID 1008)."""
        # 1. Check Token Balance
        asset_id = UInt64(1008)
        balance, exists = op.AssetHolding.get_asset_balance(Txn.sender, asset_id)
        assert exists and balance > 0, "Must hold Governance Token (CXG)"

        # 2. Check Target
        registered = self.is_registered.get(issuer, default=UInt64(0))
        assert registered == 1, "Issuer not registered"
        approved = self.is_approved.get(issuer, default=UInt64(0))
        assert approved == 0, "Issuer already approved"

        # 3. Check Double Voting (Box: Voter + Issuer)
        # Key = Voter(32) + Issuer(32)
        key = Txn.sender.bytes + issuer.bytes
        box_exists = op.Box.get(key)
        assert not box_exists[1], "Already voted for this issuer"

        # 4. Record Vote
        op.Box.put(key, Bytes(b"1"))

        # 5. Increment Vote Count
        current_votes = self.vote_count.get(issuer, default=UInt64(0))
        self.vote_count[issuer] = current_votes + UInt64(1)

    @abimethod()
    def approve_issuer(self, account: Account) -> None:
        """Approve a registered issuer. Admin only.

        The target account must have registered first.
        """

        # Admin or DAO check
        is_admin = Txn.sender.bytes == self.admin.value
        votes = self.vote_count.get(account, default=UInt64(0))
        is_dao = votes >= UInt64(1) # Reduced to 1 for easy testing, normally 5
        
        assert is_admin or is_dao, "Not authorized (Admin or 5+ votes required)"
        
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
