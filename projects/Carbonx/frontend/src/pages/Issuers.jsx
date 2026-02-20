import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { APP_IDS } from '../config';
import {
    registerIssuer,
    approveIssuer,
    voteForIssuer,
    revokeIssuer,
    getIssuerStatus,
    getIssuerRegistryState,
    getPendingIssuers,
} from '../services/contracts';
import './Pages.css';

const STATUS_LABELS = {
    0: { text: 'Not Registered', badge: 'badge-error' },
    1: { text: 'Pending Approval', badge: 'badge-warning' },
    2: { text: 'Approved', badge: 'badge-success' },
};

export default function Issuers() {
    const { account } = useWallet();
    const toast = useToast();

    const [stats, setStats] = useState({ approved_count: 0 });
    const [pendingList, setPendingList] = useState([]);
    const [approveAddr, setApproveAddr] = useState('');
    const [revokeAddr, setRevokeAddr] = useState('');
    const [statusAddr, setStatusAddr] = useState('');
    const [statusResult, setStatusResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!APP_IDS.ISSUER_REGISTRY) return;
        try {
            const state = await getIssuerRegistryState();
            setStats(state);
            const pending = await getPendingIssuers();
            setPendingList(pending);
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleRegister = async () => {
        if (!account) return toast.warning('Connect your wallet first');
        setLoading(true);
        try {
            await registerIssuer(account);
            toast.success('Registered as issuer!');
            await refresh();
        } catch (e) {
            toast.error(e.message || 'Registration failed');
        }
        setLoading(false);
    };

    const handleVote = async (issuerAddr) => {
        if (!account) return toast.warning('Connect wallet');
        setLoading(true);
        try {
            await voteForIssuer(account, issuerAddr);
            toast.success('Voted successfully!');
            await refresh();
        } catch (e) {
            toast.error(e.message || 'Voting failed');
        }
        setLoading(false);
    };

    const handleApprove = async (e, addrOverride) => {
        if (e) e.preventDefault();
        const addr = addrOverride || approveAddr;
        if (!account) return toast.warning('Connect your wallet first');
        if (!addr) return toast.warning('Enter an address');
        setLoading(true);
        try {
            await approveIssuer(account, addr);
            toast.success('Issuer approved!');
            setApproveAddr('');
            await refresh();
        } catch (e) {
            toast.error(e.message || 'Approval failed');
        }
        setLoading(false);
    };

    const handleRevoke = async (e) => {
        e.preventDefault();
        if (!account) return toast.warning('Connect your wallet first');
        if (!revokeAddr) return toast.warning('Enter an address');
        setLoading(true);
        try {
            await revokeIssuer(account, revokeAddr);
            toast.success('Issuer revoked!');
            setRevokeAddr('');
            await refresh();
        } catch (e) {
            toast.error(e.message || 'Revocation failed');
        }
        setLoading(false);
    };

    const handleStatusCheck = async (e) => {
        e.preventDefault();
        if (!statusAddr) return toast.warning('Enter an address');
        try {
            const status = await getIssuerStatus(statusAddr);
            const code = Number(status) || 0;
            setStatusResult({ address: statusAddr, code });
        } catch (e) {
            toast.error('Status check failed');
        }
    };

    return (
        <div className="page-issuers animate-fade-in">
            <div className="page-header">
                <h1>Issuer Registry</h1>
                <p>Register, approve, and manage verified carbon credit issuers</p>
            </div>

            {/* ─── Stats ─────────────────────────────────────── */}
            <div className="stats-grid">
                <div className="stat-card" style={{ '--accent': '#f59e0b' }}>
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg></div>
                    <div className="stat-label">Approved Issuers</div>
                    <div className="stat-value">{(stats.approved_count || 0).toLocaleString()}</div>
                    <div className="stat-sub">Verified by admin</div>
                </div>

                <div className="stat-card" style={{ '--accent': '#10b981' }}>
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></svg></div>
                    <div className="stat-label">Your Status</div>
                    <div className="stat-value" style={{ fontSize: 'var(--fs-md)' }}>
                        {account ? (
                            <button className="btn btn-primary btn-sm" onClick={handleRegister} disabled={loading}>
                                {loading ? 'Loading...' : 'Register as Issuer'}
                            </button>
                        ) : (
                            <span className="text-muted">Connect wallet</span>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Pending Issuers (DAO Voting) ──────────────── */}
            {pendingList.length > 0 && (
                <div className="glass-card mb-6">
                    <h3 className="section-title">
                        <span className="icon">🗳️</span>
                        DAO Voting (Pending Issuers)
                    </h3>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Issuer Address</th>
                                    <th>Votes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingList.map((issuer, idx) => (
                                    <tr key={idx}>
                                        <td className="font-mono text-sm">{issuer.address}</td>
                                        <td>
                                            <div className="vote-progress">
                                                <span className="font-bold">{issuer.votes}</span> / 5
                                                <progress value={issuer.votes} max="5" className="ml-2 w-20"></progress>
                                            </div>
                                        </td>
                                        <td className="flex gap-2">
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleVote(issuer.address)}
                                                disabled={loading}
                                            >
                                                👍 Vote
                                            </button>
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleApprove(null, issuer.address)}
                                                disabled={loading || issuer.votes < 1} // Threshold 1 for demo
                                                title={issuer.votes < 1 ? "Need 5 votes" : "Approve now"}
                                            >
                                                ✅ Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── Admin Panel ───────────────────────────────── */}
            <div className="form-grid">
                <div className="glass-card">
                    <h3 className="section-title">
                        <span className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></span>
                        Approve Issuer
                    </h3>
                    <p className="form-desc">Admin only — approve a registered issuer's account.</p>
                    <form onSubmit={handleApprove}>
                        <div className="input-row">
                            <div className="input-group">
                                <label htmlFor="approve-addr">Issuer Address</label>
                                <input
                                    id="approve-addr"
                                    className="input"
                                    type="text"
                                    placeholder="Enter issuer's Algorand address"
                                    value={approveAddr}
                                    onChange={(e) => setApproveAddr(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={loading || !account}>
                                Approve
                            </button>
                        </div>
                    </form>
                </div>

                <div className="glass-card">
                    <h3 className="section-title">
                        <span className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg></span>
                        Revoke Issuer
                    </h3>
                    <p className="form-desc">Admin only — revoke an approved issuer's status.</p>
                    <form onSubmit={handleRevoke}>
                        <div className="input-row">
                            <div className="input-group">
                                <label htmlFor="revoke-addr">Issuer Address</label>
                                <input
                                    id="revoke-addr"
                                    className="input"
                                    type="text"
                                    placeholder="Enter issuer's Algorand address"
                                    value={revokeAddr}
                                    onChange={(e) => setRevokeAddr(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button className="btn btn-danger" type="submit" disabled={loading || !account}>
                                Revoke
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ─── Status Check ──────────────────────────────── */}
            <div className="glass-card" style={{ marginTop: 'var(--sp-6)' }}>
                <h3 className="section-title">
                    <span className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg></span>
                    Check Issuer Status
                </h3>
                <form onSubmit={handleStatusCheck}>
                    <div className="input-row">
                        <div className="input-group">
                            <label htmlFor="status-addr">Algorand Address</label>
                            <input
                                id="status-addr"
                                className="input"
                                type="text"
                                placeholder="Enter address to check"
                                value={statusAddr}
                                onChange={(e) => setStatusAddr(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-secondary" type="submit">Check</button>
                    </div>
                </form>
                {statusResult && (
                    <div className="lookup-result">
                        <div className="lookup-addr">
                            {statusResult.address.slice(0, 12)}...{statusResult.address.slice(-8)}
                        </div>
                        <span className={`badge ${STATUS_LABELS[statusResult.code]?.badge || 'badge-error'}`}>
                            {STATUS_LABELS[statusResult.code]?.text || 'Unknown'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
