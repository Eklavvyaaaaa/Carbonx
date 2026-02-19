import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { APP_IDS } from '../config';
import {
    mintCredits,
    retireCredits,
    buyCreditsWithCost,
    getCurrentPrice,
    getMarketplaceState,
    getCredits,
} from '../services/contracts';
import { formatCredits, parseCredits } from '../utils/formatting';
import './Pages.css';
import { getCredits, mintCredits, retireCredits } from '../services/contracts';
import './DashboardMarketplace.css';

const MARKET_LISTINGS = [
    { id: 101, project: "Amazon Reforestation", type: "Nature-Based", location: "Brazil", price: 12.50, available: 5000, seller: "GreenCorps", vintage: "2025" },
    { id: 102, project: "Gujarat Solar Park", type: "Renewable", location: "India", price: 8.00, available: 12000, seller: "EcoEnergy", vintage: "2026" },
    { id: 103, project: "Methane Capture Delhi", type: "Methane", location: "India", price: 11.00, available: 3500, seller: "CleanCity", vintage: "2025" },
    { id: 104, project: "Rooftop Solar Initiative", type: "Renewable", location: "Germany", price: 14.50, available: 800, seller: "UrbanSolar", vintage: "2024" },
    { id: 105, project: "Blue Carbon Mangroves", type: "Nature-Based", location: "Indonesia", price: 22.00, available: 1500, seller: "OceanSave", vintage: "2025" },
    { id: 106, project: "Biogas Plants India", type: "Methane", location: "India", price: 9.50, available: 2800, seller: "BioGreen", vintage: "2026" },
    { id: 107, project: "Wind Farm Expansion", type: "Renewable", location: "Germany", price: 9.50, available: 6500, seller: "WindFlow", vintage: "2025" },
    { id: 108, project: "Clean Cookstoves Kenya", type: "Community", location: "Kenya", price: 15.00, available: 4200, seller: "EcoCook", vintage: "2025" },
];

export default function Marketplace() {
    const { account } = useWallet();
    const toast = useToast();
    const [userBalance, setUserBalance] = useState(0);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [buyAmount, setBuyAmount] = useState('');
    const [activeTab, setActiveTab] = useState('buy');
    const [mintAmount, setMintAmount] = useState('');
    const [retireAmount, setRetireAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [sortBy, setSortBy] = useState('price_asc');

    const refresh = useCallback(async () => {
        if (!APP_IDS.CARBON_MARKETPLACE) return;
        try {
            const state = await getMarketplaceState();
            setStats(state);
            const price = await getCurrentPrice();
            setCurrentPrice(Number(price) || 0);
            if (account) {
                const balance = await getCredits(account);
                setUserBalance(Number(balance) || 0);
            }
        } catch (e) { console.error(e); }
    }, [account]);

    useEffect(() => { refresh(); }, [refresh]);

    const handleBuy = (item) => {
        if (!account) return toast.warning("Connect wallet to trade");
        toast.success(`Order placed for ${item.project}! (Simulation)`);
    };

    const handleMint = async (e) => {
        e.preventDefault();
        if (!account) return toast.warning('Connect wallet');
        setLoading(true);
        setLoading(true);
        try {
            const amountBase = parseCredits(mintAmount);
            await mintCredits(account, Number(amountBase));
            toast.success(`Minted ${mintAmount} credits!`);
            await mintCredits(account, Number(mintAmount));
            toast.success('Minted successfully!');
            setMintAmount('');
            refresh();
        } catch (e) { toast.error(e.message); }
        setLoading(false);
    };

    const handleRetire = async (e) => {
        e.preventDefault();
        if (!account) return toast.warning('Connect wallet');
        setLoading(true);
        setLoading(true);
        try {
            const amountBase = parseCredits(retireAmount);
            await retireCredits(account, Number(amountBase));
            toast.success(`Retired ${retireAmount} credits!`);
            await retireCredits(account, Number(retireAmount));
            toast.success('Retired successfully!');
            setRetireAmount('');
            refresh();
        } catch (e) { toast.error(e.message); }
        setLoading(false);
    };


    const handleBuy = async (e) => {
        e.preventDefault();
        if (!account) return toast.warning('Connect your wallet first');
        if (!buyAmount || Number(buyAmount) <= 0) return toast.warning('Enter a valid amount');
        setLoading(true);
        try {
            const amountBase = parseCredits(buyAmount);
            // Calculate total cost based on current price (simplified)
            // Real app should handle slippage. 
            // Cost = Price * Amount. 
            // Current Price is in microAlgos per credit.
            // Amount is in credits.
            // Total Cost = currentPrice * Number(buyAmount).
            // Wait, currentPrice is per 1 credit (1,000,000 units).
            // So if I buy 1 credit, cost is currentPrice.
            const totalCost = Math.ceil(currentPrice * Number(buyAmount));

            await buyCreditsWithCost(account, Number(amountBase), totalCost);
            toast.success(`Bought ${buyAmount} credits!`);
            setBuyAmount('');
            await refresh();
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'Purchase failed');
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
    const filteredListings = MARKET_LISTINGS.filter(item => {
        const matchesSearch = item.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.seller.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || item.type === filterType;
        return matchesSearch && matchesType;
    }).sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'name') return a.project.localeCompare(b.project);
        if (sortBy === 'available') return b.available - a.available;
        return 0;
    });

    const totalMarketValue = MARKET_LISTINGS.reduce((sum, l) => sum + (l.price * l.available), 0);

            {/* ─── Stats ─────────────────────────────────────── */}
            <div className="stats-grid">
                <div className="stat-card" style={{ '--accent': '#10b981' }}>
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>🌱</div>
                    <div className="stat-label">Total Credits</div>
                    <div className="stat-label">Total Credits</div>
                    <div className="stat-value">{formatCredits(stats.total_credits)}</div>
                </div>
                <div className="stat-card" style={{ '--accent': '#06b6d4' }}>
                    <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>🏷️</div>
                    <div className="stat-label">Current Price</div>
                    <div className="stat-value">{(currentPrice / 1_000_000).toFixed(2)} A</div>
                </div>
                <div className="stat-card" style={{ '--accent': '#ef4444' }}>
                    <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>🔥</div>
                    <div className="stat-label">Retired Credits</div>
                    <div className="stat-value">{formatCredits(stats.retired_credits)}</div>
                </div>
                <div className="stat-card" style={{ '--accent': '#8b5cf6' }}>
                    <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>💰</div>
                    <div className="stat-label">Your Balance</div>
                    <div className="stat-label">Your Balance</div>
                    <div className="stat-value">{account ? formatCredits(userBalance) : '—'}</div>
                    <div className="stat-sub">{account ? 'Connected' : 'Connect wallet to view'}</div>
                </div>
            </div>

            {/* ─── Action Cards ──────────────────────────────── */}
            <div className="form-grid">
                <div className="glass-card">
                    <h3 className="section-title">
                        <span className="icon">💳</span>
                        Buy Credits
                    </h3>
                    <p className="form-desc">Purchase credits. Price increases with demand.</p>
                    <div className="price-tag">Current Price: {(currentPrice / 1_000_000).toFixed(6)} ALGO/Credit</div>
                    <form onSubmit={handleBuy}>
                        <div className="input-row">
                            <div className="input-group">
                                <label htmlFor="buy-amount">Amount</label>
                                <input
                                    id="buy-amount"
                                    className="input"
                                    type="number"
                                    min="0.000001"
                                    step="0.000001"
                                    placeholder="Amount to buy"
                                    value={buyAmount}
                                    onChange={(e) => setBuyAmount(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={loading || !account}>
                                {loading ? '⟳' : '💳'} Buy
                            </button>
                        </div>
                    </form>
                </div>

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
                                    min="0.000001"
                                    step="0.000001"
                                    placeholder="Enter amount to mint (e.g. 0.1)"
                                    value={mintAmount}
                                    onChange={(e) => setMintAmount(e.target.value)}
                                    disabled={loading}
                                />
    return (
        <div className="page-marketplace">
            {/* Header */}
            <div className="page-banner">
                <div className="container">
                    <div className="marketplace-header">
                        <div>
                            <span className="section-tag-light">Live Trading Desk</span>
                            <h1>Carbon Exchange</h1>
                            <p className="banner-sub">Real-time carbon credit trading powered by Algorand blockchain</p>
                        </div>
                        <div className="marketplace-stats">
                            <div className="mp-stat">
                                <span className="mp-stat-label">Your Balance</span>
                                <span className="mp-stat-value">{userBalance.toLocaleString()} Credits</span>
                            </div>
                            <div className="mp-stat">
                                <span className="mp-stat-label">Market Volume</span>
                                <span className="mp-stat-value">${(totalMarketValue / 1000).toFixed(0)}K</span>
                            </div>
                            <div className="mp-stat">
                                <span className="mp-stat-label">Listings</span>
                                <span className="mp-stat-value">{MARKET_LISTINGS.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section" style={{ paddingTop: '2rem' }}>
                <div className="container">
                    {/* Tabs */}
                    <div className="tabs mb-8">
                        <button className={`tab-btn ${activeTab === 'buy' ? 'active' : ''}`} onClick={() => setActiveTab('buy')}>
                            Buy Credits
                        </button>
                        <button className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>
                            Manage (Mint/Retire)
                        </button>
                    </div>

                    {activeTab === 'buy' ? (
                        <div className="card">
                            {/* Toolbar */}
                            <div className="market-toolbar">
                                <div className="search-wrap">
                                    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-muted)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                                    <input
                                        type="text" className="input search-input"
                                        placeholder="Search projects, locations, sellers..."
                                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select className="input" value={filterType} onChange={e => setFilterType(e.target.value)}>
                                    <option value="All">All Types</option>
                                    <option value="Nature-Based">Nature-Based</option>
                                    <option value="Renewable">Renewable</option>
                                    <option value="Methane">Methane</option>
                                    <option value="Community">Community</option>
                                </select>
                                <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                    <option value="price_asc">Price: Low → High</option>
                                    <option value="price_desc">Price: High → Low</option>
                                    <option value="available">Most Available</option>
                                    <option value="name">Project Name</option>
                                </select>
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
                                    min="0.000001"
                                    step="0.000001"
                                    placeholder="Enter amount to retire (e.g. 0.1)"
                                    value={retireAmount}
                                    onChange={(e) => setRetireAmount(e.target.value)}
                                    disabled={loading}
                                />
                            {/* Results count */}
                            <div className="market-results-info mb-4">
                                <span className="text-sm text-muted">{filteredListings.length} credits found</span>
                            </div>

                            {/* Table */}
                            <div className="table-responsive">
                                <table className="market-table">
                                    <thead>
                                        <tr>
                                            <th>Project</th>
                                            <th>Type</th>
                                            <th>Location</th>
                                            <th>Vintage</th>
                                            <th>Price</th>
                                            <th>Available</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredListings.map(item => (
                                            <tr key={item.id}>
                                                <td>
                                                    <strong>{item.project}</strong>
                                                    <div className="text-xs text-muted">{item.seller}</div>
                                                </td>
                                                <td><span className={`badge ${item.type === 'Nature-Based' ? 'badge-green' : item.type === 'Renewable' ? 'badge-blue' : item.type === 'Methane' ? 'badge-yellow' : 'badge-purple'}`}>{item.type}</span></td>
                                                <td>{item.location}</td>
                                                <td><span className="text-muted">{item.vintage}</span></td>
                                                <td><span className="price-cell">${item.price.toFixed(2)}</span></td>
                                                <td>{item.available.toLocaleString()}</td>
                                                <td>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleBuy(item)}>Buy</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredListings.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="text-center py-8 text-muted">No listings found matching your criteria.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="manage-grid">
                            <div className="card">
                                <div className="manage-card-header">
                                    <span className="manage-icon mint">🌱</span>
                                    <div>
                                        <h3>Mint Credits</h3>
                                        <p className="text-sm text-muted">Creator access only — issue new carbon credits</p>
                                    </div>
                                </div>
                                <form onSubmit={handleMint}>
                                    <div className="input-group mb-4">
                                        <label>Amount to Mint</label>
                                        <input type="number" className="input" placeholder="Enter amount" value={mintAmount} onChange={e => setMintAmount(e.target.value)} min="1" />
                                    </div>
                                    <button className="btn btn-primary w-full" disabled={loading || !mintAmount}>
                                        {loading ? 'Processing...' : 'Mint Credits'}
                                    </button>
                                </form>
                            </div>
                            <div className="card">
                                <div className="manage-card-header">
                                    <span className="manage-icon retire">♻️</span>
                                    <div>
                                        <h3>Retire Credits</h3>
                                        <p className="text-sm text-muted">Permanently offset — removes credits from circulation</p>
                                    </div>
                                </div>
                                <form onSubmit={handleRetire}>
                                    <div className="input-group mb-4">
                                        <label>Amount to Retire</label>
                                        <input type="number" className="input" placeholder="Enter amount" value={retireAmount} onChange={e => setRetireAmount(e.target.value)} min="1" />
                                    </div>
                                    <button className="btn btn-danger w-full" disabled={loading || !retireAmount}>
                                        {loading ? 'Processing...' : 'Retire Credits'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
