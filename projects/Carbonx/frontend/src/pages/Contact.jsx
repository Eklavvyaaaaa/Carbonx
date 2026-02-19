import { useState } from 'react';
import './StaticPages.css';

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
                                    <div className="success-icon">✅</div>
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
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="contact-info">
                            <div className="info-card">
                                <div className="info-icon">📍</div>
                                <div>
                                    <h4>Office</h4>
                                    <p>CarbonX HQ<br />Koramangala, Bangalore<br />Karnataka, India 560034</p>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-icon">📧</div>
                                <div>
                                    <h4>Email</h4>
                                    <p>support@carbonx.com<br />partnerships@carbonx.com</p>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-icon">📱</div>
                                <div>
                                    <h4>Phone</h4>
                                    <p>+91 98765 43210<br />Mon–Fri, 9AM–6PM IST</p>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-icon">🌐</div>
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
