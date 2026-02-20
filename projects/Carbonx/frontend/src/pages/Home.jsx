import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ProjectCard from '../components/ProjectCard';
import './Home.css';

const FEATURED_PROJECTS = [
    {
        id: 1, title: "Gujarat Solar Park", category: "Renewable", location: "India",
        credits: "120k", risk: "Low", price: "8.00",
        description: "One of the world's largest solar parks generating clean energy and displacing coal-based power.",
        revenue: "₹7.9Cr/yr",
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 2, title: "Methane Capture India", category: "Methane", location: "India",
        credits: "45k", risk: "Low", price: "11.00",
        description: "Captures methane from landfills and converts it into usable energy, reducing potent greenhouse emissions.",
        revenue: "₹4.1Cr/yr",
        image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 3, title: "Biochar Sequestration", category: "Nature-Based", location: "Brazil",
        credits: "25k", risk: "Medium", price: "18.00",
        description: "Converts agricultural waste into biochar, locking carbon in soil for centuries while boosting crop yields.",
        revenue: "₹3.7Cr/yr",
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 4, title: "Amazon Reforestation", category: "Nature-Based", location: "Brazil",
        credits: "50k", risk: "Low", price: "12.50",
        description: "Large-scale tree planting in deforested areas of the Amazon basin, restoring biodiversity and carbon sinks.",
        revenue: "₹5.2Cr/yr",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5c73?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 5, title: "Clean Cookstoves", category: "Community", location: "Kenya",
        credits: "30k", risk: "Medium", price: "15.00",
        description: "Distributing efficient cookstoves to rural communities, reducing indoor air pollution and deforestation.",
        revenue: "₹3.7Cr/yr",
        image: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80&w=800"
    }
];

const MARKETPLACE_PREVIEW = [
    { project: "Gujarat Solar Park", type: "Renewable", price: 8.00, available: 12000, location: "India" },
    { project: "Methane Capture Delhi", type: "Methane", price: 11.00, available: 3500, location: "India" },
    { project: "Amazon Reforestation", type: "Nature-Based", price: 12.50, available: 5000, location: "Brazil" },
];

function AnimatedCounter({ target, suffix = '', prefix = '' }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [visible, target]);

    return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="page-home">
            {/* ─── Hero Section ────────────────────────────── */}
            <section className="hero">
                <div className="hero-bg"></div>
                <div className="hero-particles">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="particle" style={{ animationDelay: `${i * 0.5}s`, left: `${10 + i * 15}%` }}></div>
                    ))}
                </div>
                <div className="container hero-content animate-in">
                    <span className="hero-tag">
                        <span className="tag-dot"></span>
                        Carbon Credit Platform on Algorand
                    </span>
                    <h1>Measure. Reduce.<br />Trade Carbon Credits.</h1>
                    <p className="hero-sub">
                        The world's most transparent carbon credit marketplace built on blockchain.
                        Track your impact, support verified projects, and trade credits securely.
                    </p>
                    <div className="hero-buttons">
                        <button onClick={() => navigate('/calculator')} className="btn btn-primary btn-lg">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="10" y2="10" /><line x1="14" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="10" y2="14" /><line x1="14" y1="14" x2="16" y2="14" /><line x1="8" y1="18" x2="10" y2="18" /><line x1="14" y1="18" x2="16" y2="18" /></svg>
                            Calculate Now
                        </button>
                        <button onClick={() => navigate('/marketplace')} className="btn btn-outline-white btn-lg">
                            Explore Marketplace
                        </button>
                    </div>
                </div>
                <div className="hero-scroll-hint">
                    <span>Scroll to explore</span>
                    <div className="scroll-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7l7 7 7-7" /></svg>
                    </div>
                </div>
            </section>

            {/* ─── Problem / Stats ─────────────────────────── */}
            <section className="section">
                <div className="container">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="section-tag">Why It Matters</span>
                        <h2 className="mb-4">Why Carbon Accounting Matters</h2>
                        <p className="text-muted text-lg">
                            Global CO₂ emissions have reached unprecedented levels. CarbonX empowers
                            organizations and individuals to take measurable, verified action against climate change.
                        </p>
                    </div>

                    <div className="stats-row">
                        <div className="stat-box animate-up">
                            <span className="stat-number"><AnimatedCounter target={40} suffix="%" /></span>
                            <span className="stat-desc">Increase in emissions since 1990</span>
                        </div>
                        <div className="stat-box animate-up delay-1">
                            <span className="stat-number"><AnimatedCounter target={40} prefix="₹" suffix="L Cr+" /></span>
                            <span className="stat-desc">Projected Carbon Market by 2030</span>
                        </div>
                        <div className="stat-box animate-up delay-2">
                            <span className="stat-number"><AnimatedCounter target={100} suffix="%" /></span>
                            <span className="stat-desc">Transparent On-Chain Verification</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── How It Works ────────────────────────────── */}
            <section className="section section-bg hiw-section">
                <div className="container">
                    <div className="text-center mb-12">
                        <div className="hiw-accent-line"></div>
                        <h2 className="hiw-title">How It Works</h2>
                        <p className="text-muted mt-2 hiw-subtitle">
                            Your journey to Net Zero — from measuring your footprint to earning a verified certificate
                        </p>
                    </div>

                    <div className="hiw-flow">
                        {/* Step 1 — Calculate */}
                        <div className="hiw-step">
                            <div className="hiw-card-wrap">
                                <div className="hiw-card">
                                    <div className="hiw-card-header">
                                        <div className="hiw-dots"><span></span><span></span><span></span></div>
                                        <div className="hiw-header-bar"></div>
                                    </div>
                                    <div className="hiw-card-body">
                                        <div className="hiw-row"><div className="hiw-block green small"></div><div className="hiw-line w60"></div></div>
                                        <div className="hiw-row"><div className="hiw-line w80"></div></div>
                                        <div className="hiw-row"><div className="hiw-block blue small"></div><div className="hiw-line w40"></div></div>
                                        <div className="hiw-row"><div className="hiw-line w70"></div></div>
                                        <div className="hiw-row"><div className="hiw-block green small"></div><div className="hiw-block blue medium"></div></div>
                                    </div>
                                </div>
                            </div>
                            <p className="hiw-label">Calculate Footprint</p>
                        </div>

                        {/* Arrow 1→2 */}
                        <div className="hiw-arrow">
                            <svg viewBox="0 0 80 60" fill="none">
                                <path d="M5 50 Q40 -10 75 30" stroke="var(--c-accent)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.5" />
                                <polygon points="72,25 80,32 72,35" fill="var(--c-accent)" opacity="0.5" />
                            </svg>
                        </div>

                        {/* Step 2 — Choose Projects */}
                        <div className="hiw-step">
                            <div className="hiw-card-wrap">
                                <div className="hiw-card">
                                    <div className="hiw-card-header">
                                        <div className="hiw-dots"><span></span><span></span><span></span></div>
                                        <div className="hiw-header-bar"></div>
                                    </div>
                                    <div className="hiw-card-body">
                                        <div className="hiw-row"><div className="hiw-line w50"></div><div className="hiw-block green medium"></div></div>
                                        <div className="hiw-row"><div className="hiw-block blue small"></div><div className="hiw-line w60"></div></div>
                                        <div className="hiw-row"><div className="hiw-line w30"></div><div className="hiw-block green small"></div><div className="hiw-block blue small"></div></div>
                                        <div className="hiw-row"><div className="hiw-block green medium"></div><div className="hiw-line w40"></div></div>
                                        <div className="hiw-row"><div className="hiw-line w80"></div></div>
                                    </div>
                                </div>
                            </div>
                            <p className="hiw-label">Choose Projects</p>
                        </div>

                        {/* Arrow 2→3 */}
                        <div className="hiw-arrow">
                            <svg viewBox="0 0 80 60" fill="none">
                                <path d="M5 30 Q40 70 75 20" stroke="var(--c-accent)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.5" />
                                <polygon points="72,15 80,22 73,26" fill="var(--c-accent)" opacity="0.5" />
                            </svg>
                        </div>

                        {/* Step 3 — Buy Credits */}
                        <div className="hiw-step">
                            <div className="hiw-card-wrap">
                                <div className="hiw-card">
                                    <div className="hiw-card-header">
                                        <div className="hiw-dots"><span></span><span></span><span></span></div>
                                        <div className="hiw-header-bar"></div>
                                    </div>
                                    <div className="hiw-card-body">
                                        <div className="hiw-row"><div className="hiw-block green small"></div><div className="hiw-line w40"></div><div className="hiw-block blue small"></div></div>
                                        <div className="hiw-row"><div className="hiw-line w70"></div></div>
                                        <div className="hiw-row"><div className="hiw-block blue medium"></div><div className="hiw-line w30"></div></div>
                                        <div className="hiw-row"><div className="hiw-line w50"></div><div className="hiw-block green small"></div></div>
                                        <div className="hiw-row"><div className="hiw-block blue small"></div><div className="hiw-line w60"></div></div>
                                    </div>
                                </div>
                            </div>
                            <p className="hiw-label">Buy Credits</p>
                        </div>

                        {/* Arrow 3→4 */}
                        <div className="hiw-arrow">
                            <svg viewBox="0 0 80 60" fill="none">
                                <path d="M5 50 Q40 -10 75 30" stroke="var(--c-accent)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.5" />
                                <polygon points="72,25 80,32 72,35" fill="var(--c-accent)" opacity="0.5" />
                            </svg>
                        </div>

                        {/* Step 4 — Get Certified */}
                        <div className="hiw-step">
                            <div className="hiw-card-wrap">
                                <div className="hiw-card hiw-card-final">
                                    <div className="hiw-card-header">
                                        <div className="hiw-dots"><span></span><span></span><span></span></div>
                                        <div className="hiw-header-bar"></div>
                                    </div>
                                    <div className="hiw-card-body">
                                        <div className="hiw-row"><div className="hiw-line w60"></div></div>
                                        <div className="hiw-row"><div className="hiw-line w40"></div></div>
                                        <div className="hiw-row center"><div className="hiw-block green small"></div><div className="hiw-block green small"></div><div className="hiw-block green small"></div></div>
                                        <div className="hiw-row"><div className="hiw-line w70"></div></div>
                                        <div className="hiw-row"><div className="hiw-block blue medium"></div></div>
                                    </div>
                                </div>
                                <div className="hiw-check">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                            </div>
                            <p className="hiw-label">Get Certified</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Featured Projects ───────────────────────── */}
            <section className="section">
                <div className="container">
                    <div className="section-header-row">
                        <div>
                            <span className="section-tag">Verified Impact</span>
                            <h2>Featured Projects</h2>
                            <p className="text-muted mt-2">High-impact verified sustainability projects across the globe</p>
                        </div>
                        <button onClick={() => navigate('/projects')} className="btn btn-outline">View All Projects →</button>
                    </div>

                    <div className="projects-grid">
                        {FEATURED_PROJECTS.map(p => (
                            <ProjectCard key={p.id} project={p} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Impact Stats ────────────────────────────── */}
            <section className="section section-dark">
                <div className="container">
                    <div className="text-center mb-12">
                        <span className="section-tag-light">Our Impact</span>
                        <h2>Platform Impact</h2>
                    </div>
                    <div className="impact-grid">
                        <div className="impact-item">
                            <div className="impact-val"><AnimatedCounter target={2500000} prefix="" suffix="+" /></div>
                            <div className="impact-lbl">Tonnes CO₂ Offset</div>
                        </div>
                        <div className="impact-item">
                            <div className="impact-val"><AnimatedCounter target={150} suffix="+" /></div>
                            <div className="impact-lbl">Verified Projects</div>
                        </div>
                        <div className="impact-item">
                            <div className="impact-val"><AnimatedCounter target={500} suffix="+" /></div>
                            <div className="impact-lbl">Corporate Partners</div>
                        </div>
                        <div className="impact-item">
                            <div className="impact-val"><AnimatedCounter target={12} prefix="$" suffix="M" /></div>
                            <div className="impact-lbl">Climate Funding</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Marketplace Preview ────────────────────── */}
            <section className="section section-bg">
                <div className="container">
                    <div className="text-center mb-12">
                        <span className="section-tag">Live Trading</span>
                        <h2>Marketplace Preview</h2>
                        <p className="text-muted mt-2">Browse available carbon credits — ready for purchase</p>
                    </div>
                    <div className="marketplace-preview-card card">
                        <table className="market-table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Type</th>
                                    <th>Location</th>
                                    <th>Price/Credit</th>
                                    <th>Available</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {MARKETPLACE_PREVIEW.map((item, i) => (
                                    <tr key={i}>
                                        <td><strong>{item.project}</strong></td>
                                        <td><span className="badge badge-blue">{item.type}</span></td>
                                        <td>{item.location}</td>
                                        <td className="font-bold">${item.price.toFixed(2)}</td>
                                        <td>{item.available.toLocaleString()}</td>
                                        <td><button onClick={() => navigate('/marketplace')} className="btn btn-primary btn-sm">Buy</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="text-center mt-8">
                        <button onClick={() => navigate('/marketplace')} className="btn btn-outline">
                            View Full Marketplace →
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── CTA Section ─────────────────────────────── */}
            <section className="section cta-section text-center">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="mb-4">Start Offsetting Today</h2>
                        <p className="text-muted text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of individuals and companies committing to a greener future.
                            Calculate your footprint, offset with verified credits, and make a real impact.
                        </p>
                        <div className="cta-buttons">
                            <button onClick={() => navigate('/calculator')} className="btn btn-primary btn-lg">Get Started</button>
                            <button onClick={() => navigate('/how-it-works')} className="btn btn-outline btn-lg">Learn More</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
