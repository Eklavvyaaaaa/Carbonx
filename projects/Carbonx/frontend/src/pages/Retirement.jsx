import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { APP_IDS } from '../config';
import {
    addSupply,
    retireCreditsRM,
    getRetirementManagerState,
} from '../services/contracts';
import './Pages.css';

export default function Retirement() {
    const { account } = useWallet();
    const toast = useToast();

    const [stats, setStats] = useState({ total_supply: 0, retired_credits: 0 });
    const [supplyAmount, setSupplyAmount] = useState('');
    const [retireAmount, setRetireAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!APP_IDS.RETIREMENT_MANAGER) return;
        try {
            const state = await getRetirementManagerState();
            setStats(state);
        } catch (e) {
            console.error(e);
        }
    }, []);

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
            await addSupply(account, Number(supplyAmount));
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
        setLoading(true);
        try {
            await retireCreditsRM(account, Number(retireAmount));
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
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>📦</div>
                    <div className="stat-label">Total Supply</div>
                    <div className="stat-value">{(stats.total_supply || 0).toLocaleString()}</div>
                </div>
                <div className="stat-card" style={{ '--accent': '#ef4444' }}>
                    <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>🔥</div>
                    <div className="stat-label">Retired Credits</div>
                    <div className="stat-value">{(stats.retired_credits || 0).toLocaleString()}</div>
                </div>
                <div className="stat-card" style={{ '--accent': '#06b6d4' }}>
                    <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>🔄</div>
                    <div className="stat-label">Available Supply</div>
                    <div className="stat-value">{available.toLocaleString()}</div>
                </div>
            </div>

            {/* ─── Progress ──────────────────────────────────── */}
            <div className="glass-card" style={{ marginBottom: 'var(--sp-6)' }}>
                <h3 className="section-title">
                    <span className="icon">📊</span>
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
                        <span className="icon">📦</span>
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
                                {loading ? '⟳' : '📦'} Add
                            </button>
                        </div>
                    </form>
                </div>

                <div className="glass-card">
                    <h3 className="section-title">
                        <span className="icon">🔥</span>
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
                                {loading ? '⟳' : '🔥'} Retire
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
