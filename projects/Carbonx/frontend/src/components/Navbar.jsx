import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import './Navbar.css';

export default function Navbar() {
    const { account, connect, disconnect, connecting, shortAddress } = useWallet();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    const navLinks = [
        { path: '/', label: 'Home', end: true },
        { path: '/how-it-works', label: 'How It Works' },
        { path: '/projects', label: 'Projects' },
        { path: '/calculator', label: 'Calculator' },
        { path: '/marketplace', label: 'Marketplace' },
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/about', label: 'About' },
        { path: '/contact', label: 'Contact' },
    ];

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-content">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <path d="M14 2C14 2 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 2 14 2Z" fill="currentColor" opacity="0.9" />
                            <path d="M14 10V22M14 22C11.8 20 10 17.5 10 15C10 12 12 10 14 10C16 10 18 12 18 15C18 17.5 16.2 20 14 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </span>
                    <span className="logo-text">CarbonX</span>
                </Link>

                {/* Desktop Nav */}
                <div className="navbar-links desktop-only">
                    {navLinks.map(link => (
                        <NavLink key={link.path} to={link.path} end={link.end}>
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                {/* Actions */}
                <div className="navbar-actions desktop-only">
                    {account ? (
                        <div className="wallet-badge" onClick={disconnect} title="Disconnect">
                            <span className="dot"></span>
                            {shortAddress}
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={connect}
                            disabled={connecting}
                        >
                            {connecting ? 'Connecting...' : 'Get Started'}
                        </button>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                    <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
                {navLinks.map((link, i) => (
                    <NavLink key={link.path} to={link.path} end={link.end} style={{ animationDelay: `${i * 0.05}s` }}>
                        {link.label}
                    </NavLink>
                ))}
                <div className="mobile-actions">
                    {account ? (
                        <button className="btn btn-outline-white w-full" onClick={disconnect}>
                            Disconnect ({shortAddress})
                        </button>
                    ) : (
                        <button className="btn btn-primary w-full" onClick={connect}>
                            Get Started
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
