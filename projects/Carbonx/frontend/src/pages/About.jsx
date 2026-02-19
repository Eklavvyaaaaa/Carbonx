import './StaticPages.css';

const TEAM = [
    { name: 'Arjun Mehta', role: 'CEO & Co-Founder', bg: 'Fintech & Climate Policy', emoji: '👨‍💼' },
    { name: 'Priya Sharma', role: 'CTO & Co-Founder', bg: 'Blockchain & Distributed Systems', emoji: '👩‍💻' },
    { name: 'Rahul Verma', role: 'Head of Carbon Markets', bg: 'Environmental Science & Trading', emoji: '📊' },
];

const VALUES = [
    { icon: '🎯', title: 'Transparency', desc: 'Every credit is traceable on-chain. Full audit trail from source to retirement.' },
    { icon: '🌍', title: 'Impact First', desc: 'We prioritize projects with measurable environmental and social co-benefits.' },
    { icon: '🇮🇳', title: 'India Focus', desc: 'Empowering Indian carbon projects to access global voluntary carbon markets.' },
    { icon: '🔗', title: 'Blockchain Native', desc: 'Built on Algorand for speed, security, and near-zero carbon footprint.' },
];

export default function About() {
    return (
        <div className="page-about">
            <div className="page-banner">
                <div className="container">
                    <span className="section-tag-light">Our Story</span>
                    <h1>About CarbonX</h1>
                    <p className="banner-sub">
                        Accelerating the transition to a sustainable future by democratizing access to verified carbon markets.
                    </p>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="section">
                <div className="container">
                    <div className="about-split">
                        <div className="about-block">
                            <span className="section-tag">Our Mission</span>
                            <h2>Democratizing Carbon Markets</h2>
                            <p className="text-muted text-lg">
                                CarbonX exists to make carbon markets accessible, transparent, and impactful.
                                We believe that every tonne of CO₂ reduced should be verifiable, tradable, and auditable.
                                By leveraging blockchain technology, we eliminate intermediaries, reduce fraud,
                                and ensure every credit represents genuine environmental impact.
                            </p>
                        </div>
                        <div className="about-block">
                            <span className="section-tag">Our Vision</span>
                            <h2>A Net-Zero World</h2>
                            <p className="text-muted text-lg">
                                We envision a future where carbon neutrality is the default, not the exception.
                                Our platform connects global buyers with verified offset projects, with a special focus on
                                empowering projects in developing economies — particularly India — to monetize
                                their sustainability efforts and participate in the global green economy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* India Focus */}
            <div className="section section-bg">
                <div className="container">
                    <div className="text-center mb-12">
                        <span className="section-tag">Made in India</span>
                        <h2>India-First Carbon Projects</h2>
                        <p className="text-muted mt-2 max-w-3xl mx-auto text-lg">
                            India is one of the world's largest sources of carbon credits, yet many projects struggle
                            to access international markets. CarbonX bridges this gap by providing a streamlined
                            platform for Indian projects to register, verify, and sell credits globally.
                        </p>
                    </div>
                    <div className="india-stats">
                        <div className="india-stat">
                            <span className="india-stat-val">200+</span>
                            <span className="india-stat-lbl">Indian Projects Registered</span>
                        </div>
                        <div className="india-stat">
                            <span className="india-stat-val">₹100Cr+</span>
                            <span className="india-stat-lbl">Revenue Generated for Indian Farmers</span>
                        </div>
                        <div className="india-stat">
                            <span className="india-stat-val">15+</span>
                            <span className="india-stat-lbl">States Covered</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="section">
                <div className="container">
                    <div className="text-center mb-12">
                        <span className="section-tag">What We Stand For</span>
                        <h2>Our Values</h2>
                    </div>
                    <div className="values-grid">
                        {VALUES.map((v, i) => (
                            <div key={i} className="card value-card text-center">
                                <div className="value-icon">{v.icon}</div>
                                <h3>{v.title}</h3>
                                <p className="text-muted">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team */}
            <div className="section section-bg">
                <div className="container">
                    <div className="text-center mb-12">
                        <span className="section-tag">The People Behind CarbonX</span>
                        <h2>Meet the Team</h2>
                    </div>
                    <div className="team-grid">
                        {TEAM.map((member, i) => (
                            <div key={i} className="card team-card text-center">
                                <div className="team-avatar">{member.emoji}</div>
                                <h3>{member.name}</h3>
                                <p className="team-role">{member.role}</p>
                                <p className="text-xs text-muted mt-2">{member.bg}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
