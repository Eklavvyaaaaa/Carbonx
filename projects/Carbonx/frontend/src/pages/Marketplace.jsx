import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { APP_IDS } from '../config';
import {
    mintCredits,
    retireCredits,
    getMarketplaceState,
    getCredits,
} from '../services/contracts';
import './Pages.css';

export default function Marketplace() {
    const { account } = useWallet();
    const toast = useToast();

    const [stats, setStats] = useState({ total_credits: 0, retired_credits: 0 });
    const [userBalance, setUserBalance] = useState(0);
    const [mintAmount, setMintAmount] = useState('');
    const [retireAmount, setRetireAmount] = useState('');
    const [lookupAddr, setLookupAddr] = useState('');
    const [lookupResult, setLookupResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!APP_IDS.CARBON_MARKETPLACE) return;
        try {
            const state = await getMarketplaceState();
            setStats(state);
            if (account) {
                const balance = await getCredits(account);
                setUserBalance(Number(balance) || 0);
            }
        } catch (e) {
            console.error(e);
        }
    }, [account]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleMint = async (e) => {
        e.preventDefault();
        if (!account) return toast.warning('Connect your wallet first');
        if (!mintAmount || Number(mintAmount) <= 0) return toast.warning('Enter a valid amount');
        setLoading(true);
        try {
            await mintCredits(account, Number(mintAmount));
            toast.success(`Minted ${mintAmount} credits!`);
            setMintAmount('');
            await refresh();
        } catch (e) {
            toast.error(e.message || 'Minting failed');
        }
        setLoading(false);
    };

    const handleRetire = async (e) => {
        e.preventDefault();
        if (!account) return toast.warning('Connect your wallet first');
        if (!retireAmount || Number(retireAmount) <= 0) return toast.warning('Enter a valid amount');
        setLoading(true);
        try {
            await retireCredits(account, Number(retireAmount));
            toast.success(`Retired ${retireAmount} credits!`);
            setRetireAmount('');
            await refresh();
        } catch (e) {
            toast.error(e.message || 'Retirement failed');
        }
        setLoading(false);
    };

    const handleLookup = async (e) => {
        e.preventDefault();
        if (!lookupAddr) return toast.warning('Enter an address');
        try {
            const balance = await getCredits(lookupAddr);
            setLookupResult({ address: lookupAddr, balance: Number(balance) || 0 });
        } catch (e) {
            toast.error('Lookup failed');
        }
    };

    return (
        <div className="page-marketplace animate-fade-in">
            <div className="page-header">
                <h1>Marketplace</h1>
                <p>Mint and retire carbon credits on the Algorand blockchain</p>
            </div>

            {/* ─── Stats ─────────────────────────────────────── */}
            <div className="stats-grid">
                <div className="stat-card" style={{ '--accent': '#10b981' }}>
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>🌱</div>
                    <div className="stat-label">Total Credits</div>
                    <div className="stat-value">{(stats.total_credits || 0).toLocaleString()}</div>
                </div>
                <div className="stat-card" style={{ '--accent': '#06b6d4' }}>
                    <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>♻️</div>
                    <div className="stat-label">Retired Credits</div>
                    <div className="stat-value">{(stats.retired_credits || 0).toLocaleString()}</div>
                </div>
                <div className="stat-card" style={{ '--accent': '#8b5cf6' }}>
                    <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>💰</div>
                    <div className="stat-label">Your Balance</div>
                    <div className="stat-value">{account ? userBalance.toLocaleString() : '—'}</div>
                    <div className="stat-sub">{account ? 'Connected' : 'Connect wallet to view'}</div>
                </div>
            </div>

            {/* ─── Action Cards ──────────────────────────────── */}
            <div className="form-grid">
                <div className="glass-card">
                    <h3 className="section-title">
                        <span className="icon">🌱</span>
                        Mint Credits
                    </h3>
                    <p className="form-desc">Create new carbon credits. Only the contract creator can mint.</p>
                    <form onSubmit={handleMint}>
                        <div className="input-row">
                            <div className="input-group">
                                <label htmlFor="mint-amount">Amount</label>
                                <input
                                    id="mint-amount"
                                    className="input"
                                    type="number"
                                    min="1"
                                    placeholder="Enter amount to mint"
                                    value={mintAmount}
                                    onChange={(e) => setMintAmount(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={loading || !account}>
                                {loading ? '⟳' : '🌱'} Mint
                            </button>
                        </div>
                    </form>
                </div>

                <div className="glass-card">
                    <h3 className="section-title">
                        <span className="icon">🔥</span>
                        Retire Credits
                    </h3>
                    <p className="form-desc">Permanently burn credits from your balance. Anyone with credits can retire them.</p>
                    <form onSubmit={handleRetire}>
                        <div className="input-row">
                            <div className="input-group">
                                <label htmlFor="retire-amount">Amount</label>
                                <input
                                    id="retire-amount"
                                    className="input"
                                    type="number"
                                    min="1"
                                    placeholder="Enter amount to retire"
                                    value={retireAmount}
                                    onChange={(e) => setRetireAmount(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button className="btn btn-danger" type="submit" disabled={loading || !account}>
                                {loading ? '⟳' : '🔥'} Retire
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ─── Lookup ────────────────────────────────────── */}
            <div className="glass-card" style={{ marginTop: 'var(--sp-6)' }}>
                <h3 className="section-title">
                    <span className="icon">🔍</span>
                    Balance Lookup
                </h3>
                <form onSubmit={handleLookup}>
                    <div className="input-row">
                        <div className="input-group">
                            <label htmlFor="lookup-addr">Algorand Address</label>
                            <input
                                id="lookup-addr"
                                className="input"
                                type="text"
                                placeholder="Enter Algorand address (58 chars)"
                                value={lookupAddr}
                                onChange={(e) => setLookupAddr(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-secondary" type="submit">🔍 Lookup</button>
                    </div>
                </form>
                {lookupResult && (
                    <div className="lookup-result">
                        <div className="lookup-addr">{lookupResult.address.slice(0, 12)}...{lookupResult.address.slice(-8)}</div>
                        <div className="lookup-balance">{lookupResult.balance.toLocaleString()} credits</div>
                    </div>
                )}
            </div>
        </div>
    );
}
