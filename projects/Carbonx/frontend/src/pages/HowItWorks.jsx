import { useState } from 'react';
import './StaticPages.css';

const METHODS = [
    {
        category: 'Nature-Based',
        items: [
            {
                title: 'Afforestation / Reforestation',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89-.82L5 22l.82-1.89C10.83 18.1 14 16 22 7l-5 1z" /></svg>,
                formula: '1 tree absorbs ≈ 20 kg CO₂/year',
                example: '100 trees = 2 tons CO₂ = 2 Carbon Credits/year',
                avgCredits: '2–5 credits/100 trees/year',
                color: '#10b981'
            },
            {
                title: 'Soil Carbon (Regenerative Agriculture)',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 22h20M6.36 17.97l-2-2a1 1 0 010-1.41L12 7l7.64 7.56a1 1 0 010 1.41l-2 2" /><path d="M12 2v5" /></svg>,
                formula: 'Each hectare stores additional 1.5 tons CO₂/year',
                example: '10 hectares = 15 tons CO₂ = 15 Carbon Credits/year',
                avgCredits: '1.5 credits/hectare/year',
                color: '#84cc16'
            },
            {
                title: 'Blue Carbon (Mangroves / Wetlands)',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 12h1M6 8l1 1M12 6V5M17.66 8l.7-.7M20 12h2M17 12a5 5 0 00-10 0" /><path d="M4 18c0 0 3-2 8-2s8 2 8 2" /></svg>,
                formula: 'Credits = CO₂ stored per hectare × Area',
                example: 'Stores 6 tons CO₂/hectare/year. 10 hectares = 60 credits',
                avgCredits: '6 credits/hectare/year',
                color: '#06b6d4'
            },
            {
                title: 'Peatland Restoration',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
                formula: 'Credits = Emissions avoided after restoration',
                example: '10 hectares avoids 10 tons CO₂/hectare/year = 100 Carbon Credits',
                avgCredits: '10 credits/hectare/year',
                color: '#8b5cf6'
            },
        ]
    },
    {
        category: 'Energy & Industrial',
        items: [
            {
                title: 'Renewable Energy (Solar/Wind)',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></svg>,
                formula: '1 kW solar plant = 1.3 Carbon Credits/year',
                example: '100 kW solar plant = 130 credits/year',
                avgCredits: '1.3 credits/kW/year',
                color: '#f59e0b'
            },
            {
                title: 'Methane Capture (Landfill / Biogas)',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" /></svg>,
                formula: 'Methane is 28× stronger than CO₂ (GWP ≈ 28)',
                example: '10 tons captured methane = 280 tons CO₂ = 280 Carbon Credits',
                avgCredits: '280 credits / 10 tons methane',
                color: '#ef4444'
            },
            {
                title: 'Industrial Fuel Switching',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg>,
                formula: 'Credits = Baseline Emissions − New Emissions',
                example: 'Coal: 10,000 t → Gas: 6,000 t = 4,000 Carbon Credits',
                avgCredits: '4,000 credits / facility switch',
                color: '#64748b'
            },
            {
                title: 'Carbon Capture & Storage (CCS)',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
                formula: 'Credits = CO₂ captured and permanently stored',
                example: 'Factory captures 500 t/yr, 95% stored = 475 Carbon Credits',
                avgCredits: '475 credits / 500t captured',
                color: '#6366f1'
            },
        ]
    },
    {
        category: 'Waste & Community',
        items: [
            {
                title: 'Clean Cookstove Projects',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 11h18M5 11V7a2 2 0 012-2h10a2 2 0 012 2v4M7 11v6a4 4 0 008 0v-6" /></svg>,
                formula: 'Credits = Wood Saved × Emission Factor',
                example: '1,000 households reduce 1 ton CO₂/year each = 1,000 Credits',
                avgCredits: '1 credit / household / year',
                color: '#f97316'
            },
            {
                title: 'Waste Diversion (Composting)',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>,
                formula: 'Credits = Methane avoided × GWP (28)',
                example: '10 tons organic waste diverted → avoids 6t methane → 168 Credits',
                avgCredits: '168 credits / 10t waste',
                color: '#a855f7'
            },
            {
                title: 'Biochar Projects',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6v6H9z" /></svg>,
                formula: 'Credits = Stable carbon stored × 3.67 (CO₂ factor)',
                example: '10t biomass → 3t stable carbon × 3.67 = 36.7 Carbon Credits',
                avgCredits: '36.7 credits / 10t biomass',
                color: '#78716c'
            },
        ]
    },
    {
        category: 'Technology & Transport',
        items: [
            {
                title: 'Refrigerant Management (HFC Destruction)',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v8l4-4M12 2v8l-4-4" /><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" /></svg>,
                formula: '1 ton HFC-134a = 1,430 tons CO₂ equivalent',
                example: '1 ton HFC destroyed = 1,430 Carbon Credits',
                avgCredits: '1,430 credits / ton HFC',
                color: '#0ea5e9'
            },
            {
                title: 'Low-Carbon Construction Materials',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01" /><path d="M17 12h.01" /><path d="M7 12h.01" /></svg>,
                formula: 'Credits = (Baseline − Low-carbon) emissions × Volume',
                example: 'Green cement: (900−500) × 1,000t = 400 Carbon Credits',
                avgCredits: '400 credits / 1,000t material',
                color: '#14b8a6'
            },
            {
                title: 'EV Transition Programs',
                icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2" /><circle cx="7.5" cy="17" r="2" /><circle cx="16.5" cy="17" r="2" /></svg>,
                formula: 'Credits = Fuel emissions avoided − Electricity emissions',
                example: '100 diesel buses → EV: 5,000 − 1,500 = 3,500 Carbon Credits',
                avgCredits: '3,500 credits / 100 buses',
                color: '#2563eb'
            },
        ]
    },
];

const PROFITABILITY = [
    { rank: 1, method: 'Refrigerant (HFC) Destruction', profit: 'Very High', price: '₹1,500–₹2,000/credit', note: 'High credits, low land cost. Heavily regulated now.', tag: 'tag-gold' },
    { rank: 2, method: 'Carbon Capture & Storage (CCS)', profit: 'High', price: '₹1,000–₹1,800/credit', note: 'Large volume, high corporate demand. Expensive to build.', tag: 'tag-silver' },
    { rank: 3, method: 'Methane Capture (Landfill/Biogas)', profit: 'High', price: '₹500–₹1,200/credit', note: 'Strong ROI, moderate setup. Very profitable in India.', tag: 'tag-bronze' },
    { rank: 4, method: 'Peatland Restoration', profit: 'Moderate–High', price: '₹400–₹1,000/credit', note: 'High carbon density. Limited geography (rare in India).', tag: '' },
    { rank: 5, method: 'Renewable Energy (Solar/Wind)', profit: 'Moderate', price: '₹250–₹600/credit', note: 'Stable & predictable. Market saturated, lower margins.', tag: '' },
    { rank: 6, method: 'Clean Cookstoves', profit: 'Moderate', price: '₹300–₹800/credit', note: 'High social impact. Strong demand for community projects.', tag: '' },
    { rank: 7, method: 'Afforestation / Reforestation', profit: 'Low–Moderate', price: '₹250–₹500/credit', note: 'Slow returns (trees take years). But long-term value.', tag: '' },
    { rank: 8, method: 'Biochar Projects', profit: 'Emerging', price: '₹400–₹900/credit', note: 'Future opportunity. Growing demand for durable removals.', tag: '' },
];

const INDIA_PICKS = [
    { rank: 1, method: 'Methane Capture', why: 'Abundant landfills, strong ROI, 28× GWP multiplier' },
    { rank: 2, method: 'Clean Cookstoves', why: 'High social impact, scalable across rural India' },
    { rank: 3, method: 'Solar / Wind', why: 'Government incentives, stable returns, low risk' },
    { rank: 4, method: 'Biochar', why: 'Growing opportunity with agricultural biomass' },
    { rank: 5, method: 'Afforestation', why: 'Available land, co-benefits for biodiversity' },
];

export default function HowItWorks() {
    const [openCategory, setOpenCategory] = useState('Nature-Based');

    return (
        <div className="page-hiw-data">
            <div className="page-banner">
                <div className="container">
                    <span className="section-tag-light">Real Data</span>
                    <h1>How Carbon Credits Work</h1>
                    <p className="banner-sub">
                        Understand every method, formula, and earning potential — backed by real-world data and verified standards.
                    </p>
                </div>
            </div>

            {/* Key Fact */}
            <div className="section">
                <div className="container">
                    <div className="key-fact-card">
                        <div className="kf-badge">Key Fact</div>
                        <h2>1 Carbon Credit = 1 Ton CO₂</h2>
                        <p className="text-muted text-lg">
                            Each carbon credit represents the reduction, avoidance, or removal of one metric tonne of carbon dioxide equivalent (tCO₂e) from the atmosphere.
                            Credits are verified by standards like Verra VCS and Gold Standard before they can be traded.
                        </p>
                        <div className="kf-stats">
                            <div className="kf-stat">
                                <span className="kf-val">₹250 – ₹2,000</span>
                                <span className="kf-lbl">Price range per credit</span>
                            </div>
                            <div className="kf-stat">
                                <span className="kf-val">13+</span>
                                <span className="kf-lbl">Verified earning methods</span>
                            </div>
                            <div className="kf-stat">
                                <span className="kf-val">28×</span>
                                <span className="kf-lbl">Methane vs CO₂ impact</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Methods */}
            <div className="section section-bg">
                <div className="container">
                    <div className="text-center mb-12">
                        <span className="section-tag">13 Verified Methods</span>
                        <h2>How to Earn Carbon Credits</h2>
                        <p className="text-muted mt-2">Each method includes real formulas, example calculations, and average credit yields.</p>
                    </div>

                    {/* Category Tabs */}
                    <div className="method-tabs">
                        {METHODS.map(cat => (
                            <button
                                key={cat.category}
                                className={`method-tab ${openCategory === cat.category ? 'active' : ''}`}
                                onClick={() => setOpenCategory(cat.category)}
                            >
                                {cat.category}
                                <span className="tab-count">{cat.items.length}</span>
                            </button>
                        ))}
                    </div>

                    {/* Method Cards */}
                    <div className="methods-grid">
                        {METHODS.find(c => c.category === openCategory)?.items.map((m, i) => (
                            <div key={i} className="method-card" style={{ '--method-color': m.color }}>
                                <div className="method-card-head">
                                    <div className="method-icon" style={{ background: `${m.color}15`, color: m.color }}>
                                        <m.icon />
                                    </div>
                                    <h3>{m.title}</h3>
                                </div>
                                <div className="method-formula">
                                    <span className="formula-label">Formula</span>
                                    <code>{m.formula}</code>
                                </div>
                                <div className="method-example">
                                    <span className="example-label">Example</span>
                                    <p>{m.example}</p>
                                </div>
                                <div className="method-yield">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                                    <span>Avg: <strong>{m.avgCredits}</strong></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Profitability Ranking */}
            <div className="section">
                <div className="container">
                    <div className="text-center mb-12">
                        <span className="section-tag">Profitability Analysis</span>
                        <h2>Ranked by Earning Potential</h2>
                        <p className="text-muted mt-2">
                            Based on credit price (₹250–₹2,000), verification cost, scale, and risk.
                            Nature-based methods are priced lower; tech-based methods command premium prices.
                        </p>
                    </div>

                    <div className="profit-table-wrap">
                        <table className="profit-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Method</th>
                                    <th>Profitability</th>
                                    <th>Price Range</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PROFITABILITY.map(p => (
                                    <tr key={p.rank}>
                                        <td>
                                            <span className={`rank-badge ${p.tag}`}>
                                                {p.rank <= 3 ? ['', '#1', '#2', '#3'][p.rank] : `#${p.rank}`}
                                            </span>
                                        </td>
                                        <td className="font-semibold">{p.method}</td>
                                        <td><span className="profit-level">{p.profit}</span></td>
                                        <td className="text-accent font-semibold">{p.price}</td>
                                        <td className="text-muted text-sm">{p.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* India Best Picks */}
            <div className="section section-bg">
                <div className="container">
                    <div className="text-center mb-12">
                        <span className="section-tag">India Focus</span>
                        <h2>Best Practical Options in India</h2>
                        <p className="text-muted mt-2">
                            Ranked by feasibility, ROI, and availability of resources in the Indian market.
                        </p>
                    </div>

                    <div className="india-picks-grid">
                        {INDIA_PICKS.map(p => (
                            <div key={p.rank} className="india-pick-card">
                                <div className="pick-rank">#{p.rank}</div>
                                <div className="pick-info">
                                    <h4>{p.method}</h4>
                                    <p className="text-muted text-sm">{p.why}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Verification Standards */}
            <div className="section">
                <div className="container">
                    <div className="text-center mb-12">
                        <span className="section-tag">Verification</span>
                        <h2>How Credits Are Verified</h2>
                    </div>
                    <div className="standards-grid">
                        <div className="standard-card">
                            <div className="standard-badge">VCS</div>
                            <h3>Verra VCS</h3>
                            <p>
                                The Verified Carbon Standard is the world's most widely used
                                voluntary GHG program. Projects must demonstrate additionality,
                                permanence, and measurable reductions.
                            </p>
                            <ul className="standard-features">
                                <li>1,700+ projects registered globally</li>
                                <li>Rigorous third-party auditing</li>
                                <li>Covers all major methodologies</li>
                            </ul>
                        </div>
                        <div className="standard-card">
                            <div className="standard-badge gold">GS</div>
                            <h3>Gold Standard</h3>
                            <p>
                                Founded by WWF, Gold Standard certifies projects that deliver
                                verifiable climate and development benefits aligned with the
                                UN Sustainable Development Goals.
                            </p>
                            <ul className="standard-features">
                                <li>Focus on community co-benefits</li>
                                <li>Premium pricing for credits</li>
                                <li>Strong ESG alignment</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
