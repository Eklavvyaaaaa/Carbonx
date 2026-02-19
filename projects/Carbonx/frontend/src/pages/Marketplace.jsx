import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { APP_IDS } from '../config';
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
        try {
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
        try {
            await retireCredits(account, Number(retireAmount));
            toast.success('Retired successfully!');
            setRetireAmount('');
            refresh();
        } catch (e) { toast.error(e.message); }
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
