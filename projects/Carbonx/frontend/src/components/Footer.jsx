import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <span className="footer-logo-icon">
                                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                                    <path d="M14 2C14 2 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 2 14 2Z" fill="currentColor" opacity="0.9" />
                                    <path d="M14 10V22M14 22C11.8 20 10 17.5 10 15C10 12 12 10 14 10C16 10 18 12 18 15C18 17.5 16.2 20 14 22Z" stroke="#0f2e1c" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </span>
                            CarbonX
                        </Link>
                        <p>Empowering a sustainable future through transparent carbon credit trading and verified impact projects on the Algorand blockchain.</p>
                        <div className="footer-newsletter">
                            <p className="newsletter-label">Stay updated on climate action</p>
                            <div className="newsletter-form">
                                <input type="email" placeholder="you@example.com" className="newsletter-input" />
                                <button className="btn btn-primary btn-sm">Subscribe</button>
                            </div>
                        </div>
                    </div>

                    <div className="footer-links">
                        <h4>Platform</h4>
                        <Link to="/projects">Projects</Link>
                        <Link to="/marketplace">Marketplace</Link>
                        <Link to="/calculator">Calculator</Link>
                        <Link to="/dashboard">Dashboard</Link>
                    </div>

                    <div className="footer-links">
                        <h4>Resources</h4>
                        <Link to="/how-it-works">How It Works</Link>
                        <Link to="/about">About Us</Link>
                        <Link to="/contact">Contact</Link>
                        <a href="#">Documentation</a>
                    </div>

                    <div className="footer-links">
                        <h4>Legal</h4>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 CarbonX. All rights reserved. Built on Algorand.</p>
                    <div className="footer-social">
                        <a href="#" aria-label="Twitter" className="social-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                        <a href="#" aria-label="LinkedIn" className="social-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" /></svg>
                        </a>
                        <a href="#" aria-label="GitHub" className="social-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
