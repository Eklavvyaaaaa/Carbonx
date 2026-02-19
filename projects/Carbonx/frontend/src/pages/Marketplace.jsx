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
import { formatCredits, parseCredits, SCALING_FACTOR } from '../utils/formatting';
import './Pages.css';
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
    const [stats, setStats] = useState({ total_credits: 0, retired_credits: 0 });
    const [userBalance, setUserBalance] = useState(0);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [buyAmount, setBuyAmount] = useState('');
    const [mintAmount, setMintAmount] = useState('');
    const [retireAmount, setRetireAmount] = useState('');
    const [activeTab, setActiveTab] = useState('buy');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [sortBy, setSortBy] = useState('price_asc');
    const [loading, setLoading] = useState(false);

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
        } catch (e) {
            console.error(e);
        }
    }, [account]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleBuyFromTable = (item) => {
        if (!account) return toast.warning("Connect wallet to trade");
        toast.success(`Order placed for ${item.project}! (Simulation)`);
    };

    const handleBuy = async (e) => {
        e.preventDefault();
        if (!account) return toast.warning('Connect your wallet first');
        if (!buyAmount || Number(buyAmount) <= 0) return toast.warning('Enter a valid amount');

        setLoading(true);
        try {
            const amountBase = parseCredits(buyAmount);
            const amountBI = amountBase;
            const priceBI = BigInt(Math.floor(currentPrice));
            const factorBI = BigInt(SCALING_FACTOR);
            const totalCost = (priceBI * amountBI + factorBI - 1n) / factorBI;

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

    const handleMint = async (e) => {
        e.preventDefault();
        if (!account) return toast.warning('Connect wallet');
        if (!mintAmount || Number(mintAmount) <= 0) return toast.warning('Enter a valid amount');
        setLoading(true);
        try {
            const amountBase = parseCredits(mintAmount);
            await mintCredits(account, Number(amountBase));
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
        if (!account) return toast.warning('Connect wallet');
        if (!retireAmount || Number(retireAmount) <= 0) return toast.warning('Enter a valid amount');
        setLoading(true);
        try {
            const amountBase = parseCredits(retireAmount);
            await retireCredits(account, Number(amountBase));
            toast.success(`Retired ${retireAmount} credits!`);
            setRetireAmount('');
            await refresh();
        } catch (e) {
            toast.error(e.message || 'Retirement failed');
        }
        setLoading(false);
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

    return (
        <div className="page-marketplace">
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
                                <span className="mp-stat-value">₹{(totalMarketValue * 83 / 100000).toFixed(0)}L</span>
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
                    <div className="tabs mb-8">
                        <button className={`tab-btn ${activeTab === 'buy' ? 'active' : ''}`} onClick={() => setActiveTab('buy')}>
                            Buy Credits
                        </button>
                        <button className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>
                            Manage (Mint/Retire)
                        </button>
                    </div>

                    {activeTab === 'buy' ? (
                        <div className="market-layout">
                            <div className="market-sidebar">
                                <div className="glass-card mb-6">
                                    <h3 className="section-title">
                                        <span className="icon">💳</span>
                                        Quick Exchange
                                    </h3>
                                    <p className="text-sm text-muted mb-4">Instant liquidity via automated market maker.</p>
                                    <div className="price-tag mb-4">
                                        <span className="text-xs uppercase font-bold opacity-60">Listing Price</span>
                                        <div className="text-xl font-bold">{(currentPrice / 1_000_000).toFixed(4)} ALGO</div>
                                    </div>
                                    <form onSubmit={handleBuy}>
                                        <div className="input-group mb-4">
                                            <label>Amount (Credits)</label>
                                            <input
                                                type="number" className="input" placeholder="0.00"
                                                value={buyAmount} onChange={e => setBuyAmount(e.target.value)}
                                                step="0.001" min="0" disabled={loading}
                                            />
                                        </div>
                                        <button className="btn btn-primary w-full" disabled={loading || !buyAmount}>
                                            {loading ? 'Processing...' : 'Buy Now'}
                                        </button>
                                    </form>
                                </div>

                                <div className="stats-mini-grid">
                                    <div className="stat-mini-card">
                                        <div className="text-xs text-muted">Market Credits</div>
                                        <div className="font-bold">{formatCredits(stats.total_credits)}</div>
                                    </div>
                                    <div className="stat-mini-card">
                                        <div className="text-xs text-muted">Total Retired</div>
                                        <div className="font-bold">{formatCredits(stats.retired_credits)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="market-main">
                                <div className="card">
                                    <div className="market-toolbar">
                                        <div className="search-wrap">
                                            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-muted)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                                            <input
                                                type="text" className="input search-input"
                                                placeholder="Search projects..."
                                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="filter-group">
                                            <select className="input input-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
                                                <option value="All">All Types</option>
                                                <option value="Nature-Based">Nature-Based</option>
                                                <option value="Renewable">Renewable</option>
                                                <option value="Methane">Methane</option>
                                                <option value="Community">Community</option>
                                            </select>
                                            <select className="input input-sm" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                                <option value="price_asc">Price: Low → High</option>
                                                <option value="price_desc">Price: High → Low</option>
                                                <option value="available">Availability</option>
                                            </select>
                                        </div>
                                    </div>

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
                                                        <td><span className="price-cell">₹{(item.price * 83).toFixed(0)}</span></td>
                                                        <td>{item.available.toLocaleString()}</td>
                                                        <td>
                                                            <button className="btn btn-primary btn-sm" onClick={() => handleBuyFromTable(item)}>Buy</button>
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
                            </div>
                        </div>
                    ) : (
                        <div className="manage-grid">
                            <div className="card">
                                <div className="manage-card-header">
                                    <span className="manage-icon mint"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89-.82L5 22l.82-1.89C10.83 18.1 14 16 22 7l-5 1z" /></svg></span>
                                    <div>
                                        <h3>Mint Credits</h3>
                                        <p className="text-sm text-muted">Creator access only — issue new carbon credits</p>
                                    </div>
                                </div>
                                <form onSubmit={handleMint}>
                                    <div className="input-group mb-4">
                                        <label>Amount to Mint</label>
                                        <input type="number" className="input" placeholder="Enter amount" value={mintAmount} onChange={e => setMintAmount(e.target.value)} min="1" step="0.001" />
                                    </div>
                                    <button className="btn btn-primary w-full" disabled={loading || !mintAmount}>
                                        {loading ? 'Processing...' : 'Mint Credits'}
                                    </button>
                                </form>
                            </div>

                            <div className="card">
                                <div className="manage-card-header">
                                    <span className="manage-icon retire"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-error)" strokeWidth="2" strokeLinecap="round"><path d="M7 19H4.815a1.83 1.83 0 01-1.57-.881A1.785 1.785 0 013.119 16.6L7.024 9.7" /><path d="M11 19h5.965a1.83 1.83 0 001.57-.881l2.1-3.6" /><path d="M14 4L12 8l4 1" /><path d="M10 4L8 8l-4 1" /></svg></span>
                                    <div>
                                        <h3>Retire Credits</h3>
                                        <p className="text-sm text-muted">Permanently offset — removes credits from circulation</p>
                                    </div>
                                </div>
                                <form onSubmit={handleRetire}>
                                    <div className="input-group mb-4">
                                        <label>Amount to Retire</label>
                                        <input type="number" className="input" placeholder="Enter amount" value={retireAmount} onChange={e => setRetireAmount(e.target.value)} min="1" step="0.001" />
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
