import { useState } from 'react';
import './StaticPages.css';

// SVG Icon components
const IconMapPin = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
);
const IconMail = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
);
const IconPhone = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
);
const IconWorld = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
);
const IconCheck = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
);
const IconSend = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
);

export default function Contact() {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="page-contact">
            <div className="page-banner">
                <div className="container">
                    <span className="section-tag-light">Reach Out</span>
                    <h1>Get in Touch</h1>
                    <p className="banner-sub">
                        Have questions about offsetting or registering a project? We'd love to hear from you.
                    </p>
                </div>
            </div>

            <div className="section">
                <div className="container">
                    <div className="contact-layout">
                        <div className="card contact-form-card">
                            {submitted ? (
                                <div className="success-state animate-scale">
                                    <div className="success-icon"><IconCheck /></div>
                                    <h3>Message Sent!</h3>
                                    <p className="text-muted">We'll get back to you within 24 hours.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-row">
                                        <div className="input-group">
                                            <label>Name</label>
                                            <input type="text" className="input" placeholder="Your Name"
                                                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                        </div>
                                        <div className="input-group">
                                            <label>Email</label>
                                            <input type="email" className="input" placeholder="you@company.com"
                                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="input-group mb-4">
                                        <label>Subject</label>
                                        <select className="input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                                            <option value="">Select a topic</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="project">Register a Project</option>
                                            <option value="partnership">Partnership Opportunity</option>
                                            <option value="support">Technical Support</option>
                                        </select>
                                    </div>
                                    <div className="input-group mb-6">
                                        <label>Message</label>
                                        <textarea className="input" rows="5" placeholder="How can we help?"
                                            value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-full">
                                        <IconSend />
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="contact-info">
                            <div className="info-card">
                                <div className="info-icon"><IconMapPin /></div>
                                <div>
                                    <h4>Office</h4>
                                    <p>CarbonX HQ<br />Koramangala, Bangalore<br />Karnataka, India 560034</p>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-icon"><IconMail /></div>
                                <div>
                                    <h4>Email</h4>
                                    <p>support@carbonx.com<br />partnerships@carbonx.com</p>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-icon"><IconPhone /></div>
                                <div>
                                    <h4>Phone</h4>
                                    <p>+91 98765 43210<br />Mon–Fri, 9AM–6PM IST</p>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-icon"><IconWorld /></div>
                                <div>
                                    <h4>Social</h4>
                                    <p>@CarbonXOfficial<br />LinkedIn, Twitter, GitHub</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
