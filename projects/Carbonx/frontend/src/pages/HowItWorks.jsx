import './StaticPages.css';

export default function HowItWorks() {
    return (
        <div className="page-how-it-works">
            {/* Hero Banner */}
            <div className="page-banner">
                <div className="container">
                    <span className="section-tag-light">Understanding Carbon Credits</span>
                    <h1>How It Works</h1>
                    <p className="banner-sub">
                        From verified measurement to transparent trading — CarbonX simplifies the journey to Net Zero.
                    </p>
                </div>
            </div>

            <div className="section">
                <div className="container">
                    {/* Baseline Explanation */}
                    <div className="content-block mb-16">
                        <div className="text-center mb-8 max-w-3xl mx-auto">
                            <span className="section-tag">Baseline Emissions</span>
                            <h2>Understanding Your Baseline</h2>
                            <p className="text-muted mt-4 text-lg">
                                Baseline emissions represent the amount of greenhouse gases that would be emitted
                                in the absence of any carbon reduction project. This is the starting point for
                                calculating how many carbon credits a project can generate.
                            </p>
                        </div>
                    </div>

                    {/* Formula Card */}
                    <div className="formula-card mb-16 animate-in">
                        <h3 className="mb-6">The Carbon Credit Formula</h3>
                        <div className="formula-visual">
                            <div className="f-item">
                                <span className="f-label">Baseline Emissions</span>
                                <span className="f-val">100t CO₂</span>
                            </div>
                            <span className="f-op">−</span>
                            <div className="f-item">
                                <span className="f-label">Project Emissions</span>
                                <span className="f-val">10t CO₂</span>
                            </div>
                            <span className="f-op">=</span>
                            <div className="f-item highlight">
                                <span className="f-label">Emission Reduction</span>
                                <span className="f-val">90 Credits</span>
                            </div>
                        </div>
                        <p className="text-center text-muted mt-6" style={{ maxWidth: '600px', margin: '1.5rem auto 0' }}>
                            Credits are calculated by measuring the difference between baseline emissions (without project)
                            and actual emissions (with project). Each credit represents 1 tonne of CO₂ avoided.
                        </p>
                    </div>

                    {/* Verification Standards */}
                    <div className="content-block mb-16">
                        <div className="text-center mb-8">
                            <span className="section-tag">Verification</span>
                            <h2>Verification Standards</h2>
                            <p className="text-muted mt-2">All projects on CarbonX undergo rigorous third-party verification</p>
                        </div>
                        <div className="standards-grid">
                            <div className="standard-card">
                                <div className="standard-badge">VCS</div>
                                <h3>Verra (VCS)</h3>
                                <p>The Verified Carbon Standard is the world's most widely used voluntary GHG program.
                                    Verra-certified projects must demonstrate measurable, real, additional, and permanent emission reductions.</p>
                                <ul className="standard-features">
                                    <li>World's largest voluntary carbon standard</li>
                                    <li>1700+ certified projects globally</li>
                                    <li>Rigorous MRV (Monitoring, Reporting, Verification)</li>
                                </ul>
                            </div>
                            <div className="standard-card">
                                <div className="standard-badge gold">GS</div>
                                <h3>Gold Standard</h3>
                                <p>Established by WWF, Gold Standard certifies projects that deliver the highest
                                    levels of environmental integrity and sustainable development contributions.</p>
                                <ul className="standard-features">
                                    <li>Founded by WWF & other international NGOs</li>
                                    <li>Focuses on sustainable development goals</li>
                                    <li>Premium pricing due to co-benefits</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Process */}
                    <div className="content-block">
                        <div className="text-center mb-12">
                            <span className="section-tag">Step-by-Step</span>
                            <h2>The CarbonX Process</h2>
                            <p className="text-muted mt-2">From project registration to credit retirement</p>
                        </div>
                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="tl-number">01</div>
                                <div className="tl-content">
                                    <h3>Project Registration & Baseline</h3>
                                    <p>Projects are registered on the CarbonX platform with detailed documentation of baseline emissions,
                                        project methodology, and expected impact. The baseline scenario is established using approved methodologies.</p>
                                    <div className="tl-tags">
                                        <span className="badge badge-green">Documentation</span>
                                        <span className="badge badge-blue">Methodology</span>
                                    </div>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="tl-number">02</div>
                                <div className="tl-content">
                                    <h3>Third-Party Verification</h3>
                                    <p>Independent auditors verify the project against standards like Verra VCS or Gold Standard.
                                        This includes on-site visits, data validation, and additionality testing to ensure credits represent real reductions.</p>
                                    <div className="tl-tags">
                                        <span className="badge badge-green">Audit</span>
                                        <span className="badge badge-blue">Verra / Gold Standard</span>
                                    </div>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="tl-number">03</div>
                                <div className="tl-content">
                                    <h3>Tokenization on Algorand</h3>
                                    <p>Verified credits are minted as ASAs (Algorand Standard Assets) on the blockchain.
                                        Each token represents 1 tonne of CO₂ and includes immutable metadata about origin, verification, and vintage.</p>
                                    <div className="tl-tags">
                                        <span className="badge badge-green">Blockchain</span>
                                        <span className="badge badge-purple">ASA Tokens</span>
                                    </div>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="tl-number">04</div>
                                <div className="tl-content">
                                    <h3>Marketplace Listing & Trading</h3>
                                    <p>Credits are listed on the CarbonX marketplace with full transparency on pricing, location, and impact.
                                        Buyers can purchase, hold, or trade credits in a peer-to-peer fashion.</p>
                                    <div className="tl-tags">
                                        <span className="badge badge-green">Trading</span>
                                        <span className="badge badge-blue">Transparent Pricing</span>
                                    </div>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="tl-number">05</div>
                                <div className="tl-content">
                                    <h3>Retirement & Reporting</h3>
                                    <p>Buyers retire credits to offset their emissions. Retirement is permanently recorded on-chain,
                                        preventing double-counting. A verifiable certificate is generated for sustainability reporting.</p>
                                    <div className="tl-tags">
                                        <span className="badge badge-green">On-Chain Record</span>
                                        <span className="badge badge-yellow">Certificate</span>
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
