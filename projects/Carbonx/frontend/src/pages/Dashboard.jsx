import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { APP_IDS } from '../config';
import {
    getMarketplaceState,
    getIssuerRegistryState,
    getRetirementManagerState,
} from '../services/contracts';
import './Pages.css';

export default function Dashboard() {
    const { account } = useWallet();
    const toast = useToast();

    const [stats, setStats] = useState({
        totalCredits: 0,
        retiredCredits: 0,
        activeSupply: 0,
        approvedIssuers: 0,
        retirementSupply: 0,
        retirementRetired: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        if (!APP_IDS.CARBON_MARKETPLACE && !APP_IDS.ISSUER_REGISTRY && !APP_IDS.RETIREMENT_MANAGER) {
            setLoading(false);
            return;
        }

        try {
            const [marketplace, registry, retirement] = await Promise.allSettled([
                APP_IDS.CARBON_MARKETPLACE ? getMarketplaceState() : Promise.resolve({}),
                APP_IDS.ISSUER_REGISTRY ? getIssuerRegistryState() : Promise.resolve({}),
                APP_IDS.RETIREMENT_MANAGER ? getRetirementManagerState() : Promise.resolve({}),
            ]);

            const mp = marketplace.status === 'fulfilled' ? marketplace.value : {};
            const ir = registry.status === 'fulfilled' ? registry.value : {};
            const rm = retirement.status === 'fulfilled' ? retirement.value : {};

            setStats({
                totalCredits: mp.total_credits || 0,
                retiredCredits: mp.retired_credits || 0,
                activeSupply: (mp.total_credits || 0) - (mp.retired_credits || 0),
                approvedIssuers: ir.approved_count || 0,
                retirementSupply: rm.total_supply || 0,
                retirementRetired: rm.retired_credits || 0,
            });
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const retirementPct = stats.retirementSupply > 0
        ? Math.round((stats.retirementRetired / stats.retirementSupply) * 100)
        : 0;

    const noContracts = !APP_IDS.CARBON_MARKETPLACE && !APP_IDS.ISSUER_REGISTRY;

    return (
        <div className="page-dashboard animate-fade-in">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Real-time overview of the CarbonX carbon credit ecosystem</p>
            </div>

            {noContracts && (
                <div className="glass-card config-notice">
                    <span className="config-icon">⚙️</span>
                    <div>
                        <strong>Configure Contract App IDs</strong>
                        <p>Set your deployed contract App IDs in <code>src/config.js</code> to enable live data from the Algorand blockchain.</p>
                    </div>
                </div>
            )}

            {/* ─── Stats Grid ───────────────────────────────── */}
            <div className="stats-grid">
                <div className="stat-card" style={{ '--accent': '#10b981' }}>
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>🌱</div>
                    <div className="stat-label">Total Credits Minted</div>
                    <div className="stat-value">{loading ? '—' : stats.totalCredits.toLocaleString()}</div>
                    <div className="stat-sub">Across all marketplace activity</div>
                </div>

                <div className="stat-card" style={{ '--accent': '#06b6d4' }}>
                    <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>♻️</div>
                    <div className="stat-label">Credits Retired</div>
                    <div className="stat-value">{loading ? '—' : stats.retiredCredits.toLocaleString()}</div>
                    <div className="stat-sub">Permanently removed from circulation</div>
                </div>

                <div className="stat-card" style={{ '--accent': '#8b5cf6' }}>
                    <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>📈</div>
                    <div className="stat-label">Active Supply</div>
                    <div className="stat-value">{loading ? '—' : stats.activeSupply.toLocaleString()}</div>
                    <div className="stat-sub">Credits currently in circulation</div>
                </div>

                <div className="stat-card" style={{ '--accent': '#f59e0b' }}>
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>🏛️</div>
                    <div className="stat-label">Approved Issuers</div>
                    <div className="stat-value">{loading ? '—' : stats.approvedIssuers.toLocaleString()}</div>
                    <div className="stat-sub">Verified carbon credit issuers</div>
                </div>
            </div>

            {/* ─── Retirement Progress ─────────────────────── */}
            <div className="dashboard-grid">
                <div className="glass-card">
                    <h3 className="section-title">
                        <span className="icon">♻️</span>
                        Retirement Progress
                    </h3>
                    <div className="retirement-chart">
                        <div className="donut-container">
                            <svg viewBox="0 0 120 120" className="donut-svg">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--c-bg)" strokeWidth="12" />
                                <circle
                                    cx="60" cy="60" r="50"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={`${retirementPct * 3.14} ${314 - retirementPct * 3.14}`}
                                    transform="rotate(-90 60 60)"
                                    className="donut-progress"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="var(--c-primary)" />
                                        <stop offset="100%" stopColor="var(--c-secondary)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="donut-center">
                                <span className="donut-pct">{retirementPct}%</span>
                                <span className="donut-label">Retired</span>
                            </div>
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <span className="legend-dot" style={{ background: 'var(--c-primary)' }}></span>
                                <span className="legend-label">Retired Credits</span>
                                <span className="legend-value">{stats.retirementRetired.toLocaleString()}</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{ background: 'var(--c-bg-elevated)' }}></span>
                                <span className="legend-label">Available Supply</span>
                                <span className="legend-value">{(stats.retirementSupply - stats.retirementRetired).toLocaleString()}</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{ background: 'var(--c-secondary)' }}></span>
                                <span className="legend-label">Total Supply</span>
                                <span className="legend-value">{stats.retirementSupply.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card">
                    <h3 className="section-title">
                        <span className="icon">🔗</span>
                        Quick Actions
                    </h3>
                    <div className="quick-actions">
                        {account ? (
                            <>
                                <a href="#/marketplace" className="action-card">
                                    <span className="action-icon">🌱</span>
                                    <span className="action-title">Mint Credits</span>
                                    <span className="action-desc">Create new carbon credits</span>
                                </a>
                                <a href="#/marketplace" className="action-card">
                                    <span className="action-icon">🔥</span>
                                    <span className="action-title">Retire Credits</span>
                                    <span className="action-desc">Permanently burn credits</span>
                                </a>
                                <a href="#/issuers" className="action-card">
                                    <span className="action-icon">📝</span>
                                    <span className="action-title">Register as Issuer</span>
                                    <span className="action-desc">Join the issuer registry</span>
                                </a>
                                <a href="#/retirement" className="action-card">
                                    <span className="action-icon">📊</span>
                                    <span className="action-title">View Retirement</span>
                                    <span className="action-desc">Track retirement progress</span>
                                </a>
                            </>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">🔗</div>
                                <p>Connect your wallet to access quick actions</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
