import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { getMarketplaceState } from '../services/contracts';
import './DashboardMarketplace.css';

const TRANSACTIONS = [
    { id: 1, type: 'purchase', project: 'Amazon Reforestation', credits: 50, date: '2 days ago', value: '$625' },
    { id: 2, type: 'retire', project: 'Gujarat Solar Park', credits: 25, date: '5 days ago', value: '$200' },
    { id: 3, type: 'purchase', project: 'Methane Capture Delhi', credits: 100, date: '1 week ago', value: '$1,100' },
    { id: 4, type: 'mint', project: 'Clean Cookstoves', credits: 200, date: '2 weeks ago', value: '$3,000' },
    { id: 5, type: 'purchase', project: 'Blue Carbon Mangroves', credits: 30, date: '3 weeks ago', value: '$660' },
];

const MONTHLY_DATA = [
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 59 },
    { month: 'Mar', value: 80 },
    { month: 'Apr', value: 81 },
    { month: 'May', value: 56 },
    { month: 'Jun', value: 55 },
    { month: 'Jul', value: 40 },
    { month: 'Aug', value: 35 },
    { month: 'Sep', value: 48 },
    { month: 'Oct', value: 42 },
    { month: 'Nov', value: 38 },
    { month: 'Dec', value: 30 },
];

export default function Dashboard() {
    const { account } = useWallet();
    const [stats, setStats] = useState({
        totalCredits: 0,
        retiredCredits: 0,
        portfolioValue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const mp = await getMarketplaceState();
                setStats({
                    totalCredits: mp.total_credits || 0,
                    retiredCredits: mp.retired_credits || 0,
                    portfolioValue: (mp.total_credits || 0) * 10
                });
            } catch (e) { }
        };
        fetchStats();
    }, []);

    const maxBar = Math.max(...MONTHLY_DATA.map(d => d.value));

    return (
        <div className="page-dashboard">
            {/* Header Banner */}
            <div className="page-banner">
                <div className="container">
                    <div className="dashboard-header">
                        <div>
                            <span className="section-tag-light">Your Portfolio</span>
                            <h1>Dashboard</h1>
                            <p className="banner-sub">Welcome back, {account ? 'User' : 'Guest'}</p>
                        </div>
                        {account && (
                            <div className="dash-wallet-info">
                                <span className="dot"></span>
                                <span className="text-sm opacity-80">Wallet Connected</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="section" style={{ paddingTop: '2rem' }}>
                <div className="container">
                    {/* Stats Grid */}
                    <div className="stats-grid mb-12">
                        <div className="stat-card">
                            <div className="stat-icon">💼</div>
                            <div className="stat-label">Portfolio Value</div>
                            <div className="stat-value">${stats.portfolioValue.toLocaleString()}</div>
                            <div className="stat-sub">Est. Market Value</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🌱</div>
                            <div className="stat-label">Total Credits</div>
                            <div className="stat-value">{(stats.totalCredits).toLocaleString()}</div>
                            <div className="stat-sub">Across All Projects</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">♻️</div>
                            <div className="stat-label">Retired Credits</div>
                            <div className="stat-value">{(stats.retiredCredits).toLocaleString()}</div>
                            <div className="stat-sub">Permanently Offset</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📉</div>
                            <div className="stat-label">Emissions Reduced</div>
                            <div className="stat-value">{(stats.retiredCredits).toLocaleString()}t</div>
                            <div className="stat-sub">CO₂ Equivalent</div>
                        </div>
                    </div>

                    {/* Charts & Activity */}
                    <div className="dashboard-grid">
                        {/* Monthly Emissions Chart */}
                        <div className="card">
                            <div className="card-header-row">
                                <div>
                                    <h3>Monthly Emissions</h3>
                                    <p className="text-sm text-muted">Track your carbon footprint over time (tonnes CO₂)</p>
                                </div>
                                <span className="badge badge-green">↓ 54% YoY</span>
                            </div>
                            <div className="chart-container">
                                {MONTHLY_DATA.map((d, i) => (
                                    <div key={i} className="chart-bar-group">
                                        <div className="chart-bar-value">{d.value}</div>
                                        <div
                                            className="chart-bar"
                                            style={{
                                                height: `${(d.value / maxBar) * 100}%`,
                                                animationDelay: `${i * 0.05}s`
                                            }}
                                        ></div>
                                        <span className="chart-bar-label">{d.month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Transaction History */}
                        <div className="card">
                            <div className="card-header-row mb-4">
                                <h3>Recent Activity</h3>
                                <span className="text-sm text-muted">{TRANSACTIONS.length} transactions</span>
                            </div>
                            <div className="activity-list">
                                {TRANSACTIONS.map(tx => (
                                    <div key={tx.id} className="activity-item">
                                        <div className="activity-icon-wrap">
                                            <span className={`activity-icon ${tx.type}`}>
                                                {tx.type === 'purchase' ? '📥' : tx.type === 'retire' ? '♻️' : '🌱'}
                                            </span>
                                        </div>
                                        <div className="activity-info">
                                            <div className="activity-title">
                                                {tx.type === 'purchase' ? 'Purchased' : tx.type === 'retire' ? 'Retired' : 'Minted'} Credits
                                            </div>
                                            <div className="text-xs text-muted">{tx.project} • {tx.date}</div>
                                        </div>
                                        <div className="activity-amount">
                                            <span className={tx.type === 'retire' ? 'text-red' : 'text-green'}>
                                                {tx.type === 'retire' ? '-' : '+'}{tx.credits}
                                            </span>
                                            <span className="text-xs text-muted">{tx.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Certificate Section */}
                        <div className="card certificate-card col-span-2">
                            <div className="certificate-content">
                                <div className="certificate-icon">🏆</div>
                                <div className="certificate-info">
                                    <h3>Impact Certificate</h3>
                                    <p className="text-muted">
                                        You have successfully offset {stats.retiredCredits || 150} tonnes of CO₂.
                                        Download your verified certificate for ESG reporting, sustainability disclosures, and stakeholder communications.
                                    </p>
                                    <div className="certificate-actions">
                                        <button className="btn btn-primary">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
                                            Download PDF Certificate
                                        </button>
                                        <button className="btn btn-outline">View On-Chain Proof</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
