import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { getAssetBalance } from '../services/algorand';
import { APP_IDS } from '../config';
import './Layout.css';

export default function Layout() {
    const { account, shortAddress, connecting, connect, disconnect } = useWallet();
    const [cxgBalance, setCxgBalance] = useState(0);

    useEffect(() => {
        if (account && APP_IDS.GOVERNANCE_TOKEN_ID) {
            getAssetBalance(account, APP_IDS.GOVERNANCE_TOKEN_ID).then(bal => {
                // Asset decimals is 6
                setCxgBalance(bal / 1_000_000);
            });
        } else {
            setCxgBalance(0);
        }
    }, [account]);

    return (
        <div className="app-layout">
            {/* ─── Sidebar ─────────────────────────────────── */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">🌿</div>
                    <div>
                        <span className="brand-name">CarbonX</span>
                        <span className="brand-sub">Credit Registry</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/marketplace" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">🏪</span>
                        <span>Marketplace</span>
                    </NavLink>
                    <NavLink to="/issuers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">🏛️</span>
                        <span>Issuer Registry</span>
                    </NavLink>
                    <NavLink to="/retirement" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">♻️</span>
                        <span>Retirement</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="network-badge">
                        <span className="network-dot"></span>
                        Algorand Testnet
                    </div>
                </div>
            </aside>

            {/* ─── Main Content ────────────────────────────── */}
            <div className="main-wrapper">
                <header className="topbar">
                    <div className="topbar-title">
                        <h2>Carbon Credit Registry</h2>
                    </div>
                    <div className="topbar-actions">
                        {account ? (
                            <div className="wallet-connected">
                                <div className="balance-pill" title="CarbonX Governance Token">
                                    <span className={`status-dot ${cxgBalance > 0 ? 'active' : 'inactive'}`}></span>
                                    <span className="balance-val">{cxgBalance.toLocaleString()} CXG</span>
                                </div>
                                <span className="wallet-addr">{shortAddress}</span>
                                <button className="btn btn-ghost btn-sm" onClick={disconnect}>
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={connect}
                                disabled={connecting}
                            >
                                {connecting ? '⟳ Connecting...' : '🔗 Connect Wallet'}
                            </button>
                        )}
                    </div>
                </header>

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './Layout.css';

export default function Layout() {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
