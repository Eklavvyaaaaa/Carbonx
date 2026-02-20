import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { APP_IDS } from '../config';
import {
    addSupply,
    retireCreditsRM,
    getRetirementManagerState,
    checkCXTOptIn,
} from '../services/contracts';
import { ensureOptedIn } from '../utils/autoOptIn';
import './Pages.css';

export default function Retirement() {
    const { account } = useWallet();
    const toast = useToast();

    const [stats, setStats] = useState({ total_supply: 0, retired_credits: 0 });
    const [supplyAmount, setSupplyAmount] = useState('');
    const [retireAmount, setRetireAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOptedIn, setIsOptedIn] = useState(false);

    const refresh = useCallback(async () => {
        if (!APP_IDS.RETIREMENT_MANAGER) return;
        try {
            const state = await getRetirementManagerState();
            setStats({
                total_supply: Number(state.total_supply || 0) / 1_000_000,
                retired_credits: Number(state.retired_credits || 0) / 1_000_000
            });

            if (account) {
                const opted = await checkCXTOptIn(account);
                setIsOptedIn(opted);
            }
        } catch (e) {
            console.error(e);
        }
    }, [account]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const available = (stats.total_supply || 0) - (stats.retired_credits || 0);
    const pct = stats.total_supply > 0
        ? Math.round(((stats.retired_credits || 0) / stats.total_supply) * 100)
        : 0;

    const handleAddSupply = async (e) => {
        e.preventDefault();
        if (!account) return toast.warning('Connect your wallet first');
        if (!supplyAmount || Number(supplyAmount) <= 0) return toast.warning('Enter a valid amount');
        setLoading(true);
        try {
            const amountDecimal = Number(supplyAmount);
            const amountBase = Math.floor(amountDecimal * 1_000_000);
            await addSupply(account, amountBase);
            toast.success(`Added ${supplyAmount} to supply!`);
            setSupplyAmount('');
            await refresh();
        } catch (e) {
            toast.error(e.message || 'Failed to add supply');
        }
        setLoading(false);
    };

    const handleRetire = async (e) => {
        e.preventDefault();
        if (!account) return toast.warning('Connect your wallet first');
        if (!retireAmount || Number(retireAmount) <= 0) return toast.warning('Enter a valid amount');

        // Auto opt-in if needed
        const optedIn = await ensureOptedIn(account, toast);
        if (!optedIn) {
            return; // Error already shown by ensureOptedIn
        }

        setLoading(true);
        try {
            const amountDecimal = Number(retireAmount);
            const amountBase = Math.floor(amountDecimal * 1_000_000);
            await retireCreditsRM(account, amountBase);
            toast.success(`Retired ${retireAmount} credits!`);
            setRetireAmount('');
            await refresh();
        } catch (e) {
            toast.error(e.message || 'Retirement failed');
        }
        setLoading(false);
    };

    return (
        <div className="page-retirement animate-fade-in">
            <div className="page-header">
                <h1>Retirement Manager</h1>
                <p>Track and manage carbon credit supply and retirement</p>
            </div>

            {/* ─── Stats ─────────────────────────────────────── */}
            <div className="stats-grid">
                <div className="stat-card" style={{ '--accent': '#10b981' }}>
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg></div>
                    <div className="stat-label">Total Supply</div>
                    <div className="stat-value">{(stats.total_supply || 0).toLocaleString()}</div>
                </div>
                <div className="stat-card" style={{ '--accent': '#ef4444' }}>
                    <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" /></svg></div>
                    <div className="stat-label">Retired Credits</div>
                    <div className="stat-value">{(stats.retired_credits || 0).toLocaleString()}</div>
                </div>
                <div className="stat-card" style={{ '--accent': '#06b6d4' }}>
                    <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg></div>
                    <div className="stat-label">Available Supply</div>
                    <div className="stat-value">{available.toLocaleString()}</div>
                </div>
            </div>

            {/* ─── Progress ──────────────────────────────────── */}
            <div className="glass-card" style={{ marginBottom: 'var(--sp-6)' }}>
                <h3 className="section-title">
                    <span className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg></span>
                    Retirement Progress
                </h3>
                <div className="progress-info">
                    <span>{pct}% retired</span>
                    <span className="text-muted">{(stats.retired_credits || 0).toLocaleString()} / {(stats.total_supply || 0).toLocaleString()}</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                </div>
                <div className="progress-milestones">
                    <span className={pct >= 25 ? 'milestone-active' : ''}>25%</span>
                    <span className={pct >= 50 ? 'milestone-active' : ''}>50%</span>
                    <span className={pct >= 75 ? 'milestone-active' : ''}>75%</span>
                    <span className={pct >= 100 ? 'milestone-active' : ''}>100%</span>
                </div>
            </div>

            {/* ─── Actions ───────────────────────────────────── */}
            <div className="form-grid">
                <div className="glass-card">
                    <h3 className="section-title">
                        <span className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg></span>
                        Add Supply
                    </h3>
                    <p className="form-desc">Register additional credit supply. Creator only.</p>
                    <form onSubmit={handleAddSupply}>
                        <div className="input-row">
                            <div className="input-group">
                                <label htmlFor="supply-amount">Amount</label>
                                <input
                                    id="supply-amount"
                                    className="input"
                                    type="number"
                                    min="1"
                                    placeholder="Credits to add"
                                    value={supplyAmount}
                                    onChange={(e) => setSupplyAmount(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={loading || !account}>
                                {loading ? 'Loading...' : 'Add'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="glass-card">
                    <h3 className="section-title">
                        <span className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" /></svg></span>
                        Retire Credits
                    </h3>
                    <p className="form-desc">Permanently retire credits from available supply. Creator only.</p>
                    <form onSubmit={handleRetire}>
                        <div className="input-row">
                            <div className="input-group">
                                <label htmlFor="rm-retire-amount">Amount</label>
                                <input
                                    id="rm-retire-amount"
                                    className="input"
                                    type="number"
                                    min="1"
                                    placeholder="Credits to retire"
                                    value={retireAmount}
                                    onChange={(e) => setRetireAmount(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button className="btn btn-danger" type="submit" disabled={loading || !account}>
                                {loading ? 'Loading...' : 'Retire'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
