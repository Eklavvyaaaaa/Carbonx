import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { APP_IDS } from '../config';
import {
    mintCredits,
    retireCreditsRM,
    buyCreditsWithCost,
    getCurrentPrice,
    getMarketplaceState,
    checkCXTOptIn,
} from '../services/contracts';
import { getAssetBalance, getAlgoBalance } from '../services/algorand';
import { formatCredits, parseCredits } from '../utils/formatting';
import { ensureOptedIn } from '../utils/autoOptIn';
import './Pages.css';
import './DashboardMarketplace.css';

const MARKET_LISTINGS = [
    {
        id: 101,
        project: "Amazon Reforestation",
        type: "Nature-Based",
        location: "Brazil",
        price: 12.50,
        available: 5000,
        seller: "GreenCorps",
        vintage: "2025",
        description: "Large-scale reforestation project in the Amazon rainforest, restoring native tree species and protecting biodiversity.",
        certification: "VCS Verified",
        co2Reduction: "500,000 tonnes CO₂e",
        startDate: "2023",
        endDate: "2030"
    },
    {
        id: 102,
        project: "Gujarat Solar Park",
        type: "Renewable",
        location: "India",
        price: 8.00,
        available: 12000,
        seller: "EcoEnergy",
        vintage: "2026",
        description: "Massive solar energy installation providing clean electricity to thousands of homes and businesses.",
        certification: "Gold Standard",
        co2Reduction: "1,200,000 tonnes CO₂e",
        startDate: "2024",
        endDate: "2026"
    },
    {
        id: 103,
        project: "Methane Capture Delhi",
        type: "Methane",
        location: "India",
        price: 11.00,
        available: 3500,
        seller: "CleanCity",
        vintage: "2025",
        description: "Advanced methane capture system at landfill sites, converting waste gas into clean energy.",
        certification: "CDM Verified",
        co2Reduction: "350,000 tonnes CO₂e",
        startDate: "2023",
        endDate: "2025"
    },
    {
        id: 104,
        project: "Rooftop Solar Initiative",
        type: "Renewable",
        location: "Germany",
        price: 14.50,
        available: 800,
        seller: "UrbanSolar",
        vintage: "2024",
        description: "Distributed solar panels on residential and commercial rooftops across urban areas.",
        certification: "TÜV Certified",
        co2Reduction: "80,000 tonnes CO₂e",
        startDate: "2022",
        endDate: "2024"
    },
    {
        id: 105,
        project: "Blue Carbon Mangroves",
        type: "Nature-Based",
        location: "Indonesia",
        price: 22.00,
        available: 1500,
        seller: "OceanSave",
        vintage: "2025",
        description: "Mangrove restoration project protecting coastlines and sequestering carbon in marine ecosystems.",
        certification: "VCS + CCB",
        co2Reduction: "150,000 tonnes CO₂e",
        startDate: "2023",
        endDate: "2028"
    },
    {
        id: 106,
        project: "Biogas Plants India",
        type: "Methane",
        location: "India",
        price: 9.50,
        available: 2800,
        seller: "BioGreen",
        vintage: "2026",
        description: "Biogas facilities converting agricultural waste into clean cooking fuel for rural communities.",
        certification: "Gold Standard",
        co2Reduction: "280,000 tonnes CO₂e",
        startDate: "2024",
        endDate: "2026"
    },
    {
        id: 107,
        project: "Wind Farm Expansion",
        type: "Renewable",
        location: "Germany",
        price: 9.50,
        available: 6500,
        seller: "WindFlow",
        vintage: "2025",
        description: "Expansion of existing wind energy infrastructure with new high-efficiency turbines.",
        certification: "I-REC Standard",
        co2Reduction: "650,000 tonnes CO₂e",
        startDate: "2023",
        endDate: "2025"
    },
    {
        id: 108,
        project: "Clean Cookstoves Kenya",
        type: "Community",
        location: "Kenya",
        price: 15.00,
        available: 4200,
        seller: "EcoCook",
        vintage: "2025",
        description: "Distribution of efficient cookstoves reducing wood consumption and indoor air pollution.",
        certification: "Gold Standard",
        co2Reduction: "420,000 tonnes CO₂e",
        startDate: "2023",
        endDate: "2025"
    },
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
    const [isOptedIn, setIsOptedIn] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [buyingProject, setBuyingProject] = useState(null);

    const refresh = useCallback(async () => {
        if (!APP_IDS.CARBON_MARKETPLACE) return;
        try {
            const state = await getMarketplaceState();
            setStats({
                total_credits: Number(state.total_credits || 0) / 1_000_000,
                retired_credits: Number(state.retired_credits || 0) / 1_000_000
            });
            const priceRaw = await getCurrentPrice();
            const priceNum = Number(priceRaw) || 1_000_000; // Fallback to 1 ALGO
            setCurrentPrice(priceNum);

            if (account) {
                const opted = await checkCXTOptIn(account);
                setIsOptedIn(opted);
                if (opted) {
                    const balance = await getAssetBalance(account, APP_IDS.CXT_ASSET_ID);
                    setUserBalance(Number(balance) / 1_000_000);
                } else {
                    setUserBalance(0);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }, [account]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleBuyFromTable = async (item) => {
        if (!account) {
            toast.warning("Connect wallet to trade");
            return;
        }

        // Set the project being bought
        setBuyingProject(item);

        // Auto opt-in if needed
        const optedIn = await ensureOptedIn(account, toast);
        if (!optedIn) {
            setBuyingProject(null);
            return;
        }

        // Check ALGO balance
        try {
            const algoBal = await getAlgoBalance(account);
            const pricePerCredit = currentPrice / 1_000_000; // Convert to ALGO
            const minRequired = pricePerCredit * 1; // At least 1 credit

            if (algoBal < minRequired * 1_000_000) {
                toast.error(`Insufficient ALGO balance. You need at least ${minRequired.toFixed(4)} ALGO to buy 1 credit.`);
                setBuyingProject(null);
                return;
            }

            // Use a default amount of 1 credit for table buy
            const amountDecimal = 1;
            const amountBase = BigInt(Math.floor(amountDecimal * 1_000_000));
            const priceBI = BigInt(Math.floor(currentPrice));
            const factorBI = BigInt(1_000_000);
            const totalCost = (priceBI * amountBase + factorBI - 1n) / factorBI;

            setLoading(true);
            await buyCreditsWithCost(account, Number(amountBase), totalCost);
            toast.success(`Bought 1 credit from ${item.project}!`);
            await refresh();
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'Purchase failed');
        } finally {
            setLoading(false);
            setBuyingProject(null);
        }
    };

    const handleBuy = async (e) => {
        e.preventDefault();
        if (!account) return toast.warning('Connect your wallet first');
        if (!buyAmount || Number(buyAmount) <= 0) return toast.warning('Enter a valid amount');

        // Auto opt-in if needed
        const optedIn = await ensureOptedIn(account, toast);
        if (!optedIn) {
            return;
        }

        setLoading(true);
        try {
            // Check ALGO balance
            const algoBal = await getAlgoBalance(account);
            const amountDecimal = Number(buyAmount);
            const amountBase = BigInt(Math.floor(amountDecimal * 1_000_000));

            if (amountBase <= 0n) {
                toast.warning('Enter a valid credit amount (e.g. 1 or 0.5).');
                setLoading(false);
                return;
            }

            // Price per credit in microAlgos (contract uses 1 ALGO = 1 credit if not set)
            const priceMicroAlgos = currentPrice > 0 ? currentPrice : 1_000_000;
            const priceBI = BigInt(Math.floor(priceMicroAlgos));
            const factorBI = BigInt(1_000_000);
            const totalCost = (priceBI * amountBase + factorBI - 1n) / factorBI;
            const totalCostAlgo = Number(totalCost) / 1_000_000;

            if (algoBal < Number(totalCost)) {
                toast.error(`Insufficient ALGO balance. You need ${totalCostAlgo.toFixed(4)} ALGO but only have ${(algoBal / 1_000_000).toFixed(4)} ALGO.`);
                setLoading(false);
                return;
            }

            console.log('[Marketplace] Buying credits:', {
                amount: amountDecimal,
                amountBase: Number(amountBase),
                totalCost: Number(totalCost),
                totalCostAlgo: totalCostAlgo
            });

            await buyCreditsWithCost(account, Number(amountBase), totalCost);
            toast.success(`Bought ${buyAmount} credits!`);
            setBuyAmount('');
            await refresh();
        } catch (e) {
            console.error('[Marketplace] Buy error:', e);
            const errorMsg = e.message || 'Purchase failed';
            if (errorMsg.includes('Asset not initialized') || errorMsg.includes('not initialized')) {
                toast.error('Marketplace asset is not initialized. Please contact the contract owner.');
            } else if (errorMsg.includes('cancel') || errorMsg.includes('rejected')) {
                toast.warning('Transaction was cancelled.');
            } else {
                toast.error(`Purchase failed: ${errorMsg}`);
            }
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
            const msg = e.message || 'Minting failed';
            if (msg.includes('creator') || msg.includes('Only creator')) {
                toast.error('Only the contract creator can mint credits.');
            } else {
                toast.error(msg);
            }
        }
        setLoading(false);
    };

    const handleRetire = async (e) => {
        e.preventDefault();
        if (!account) return toast.warning('Connect wallet');
        if (!retireAmount || Number(retireAmount) <= 0) return toast.warning('Enter a valid amount');

        // Auto opt-in if needed
        const optedIn = await ensureOptedIn(account, toast);
        if (!optedIn) {
            return;
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
                                                    <th>Actions</th>
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
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <button
                                                                    className="btn btn-outline btn-sm"
                                                                    onClick={() => setSelectedProject(item)}
                                                                    disabled={loading}
                                                                >
                                                                    View Details
                                                                </button>
                                                                <button
                                                                    className="btn btn-primary btn-sm"
                                                                    onClick={() => handleBuyFromTable(item)}
                                                                    disabled={loading || buyingProject?.id === item.id}
                                                                >
                                                                    {buyingProject?.id === item.id ? 'Buying...' : 'Buy'}
                                                                </button>
                                                            </div>
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

            {/* Project Details Modal */}
            {selectedProject && (
                <div
                    className="modal-overlay"
                    onClick={() => setSelectedProject(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                >
                    <div
                        className="card"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ marginBottom: '0.5rem' }}>{selectedProject.project}</h2>
                                <p className="text-muted">{selectedProject.seller}</p>
                            </div>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setSelectedProject(null)}
                                style={{ minWidth: 'auto', padding: '0.5rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <span className={`badge ${selectedProject.type === 'Nature-Based' ? 'badge-green' : selectedProject.type === 'Renewable' ? 'badge-blue' : selectedProject.type === 'Methane' ? 'badge-yellow' : 'badge-purple'}`}>
                                {selectedProject.type}
                            </span>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>Description</h3>
                            <p className="text-muted">{selectedProject.description}</p>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <div className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>Location</div>
                                <div className="font-bold">{selectedProject.location}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>Vintage</div>
                                <div className="font-bold">{selectedProject.vintage}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>Certification</div>
                                <div className="font-bold">{selectedProject.certification}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>Price per Credit</div>
                                <div className="font-bold">₹{(selectedProject.price * 83).toFixed(0)}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>Available Credits</div>
                                <div className="font-bold">{selectedProject.available.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>CO₂ Reduction</div>
                                <div className="font-bold">{selectedProject.co2Reduction}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>Project Period</div>
                                <div className="font-bold">{selectedProject.startDate} - {selectedProject.endDate}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setSelectedProject(null);
                                    handleBuyFromTable(selectedProject);
                                }}
                                disabled={loading || !account}
                            >
                                Buy Credits
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => setSelectedProject(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
