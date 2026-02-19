import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Calculator.css';

const REGIONS = {
    'India': { factor: 0.9, currency: '₹', rate: 83 },
    'Global': { factor: 1.0, currency: '$', rate: 1 },
    'USA': { factor: 1.2, currency: '$', rate: 1 },
    'EU': { factor: 0.8, currency: '€', rate: 0.92 }
};

export default function Calculator() {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({
        electricity: '',
        fuel: '',
        distance: '',
        waste: '',
        region: 'India'
    });
    const [result, setResult] = useState(null);
    const [animating, setAnimating] = useState(false);

    const CO2_FACTORS = {
        electricity: 0.85,
        fuel: 2.3,
        distance: 0.12,
        waste: 0.5
    };

    const calculate = (e) => {
        e.preventDefault();
        setAnimating(true);

        setTimeout(() => {
            const region = REGIONS[inputs.region];
            const electricity = (Number(inputs.electricity) || 0) * CO2_FACTORS.electricity;
            const fuel = (Number(inputs.fuel) || 0) * CO2_FACTORS.fuel;
            const distance = (Number(inputs.distance) || 0) * CO2_FACTORS.distance;
            const waste = (Number(inputs.waste) || 0) * CO2_FACTORS.waste;

            const totalKg = (electricity + fuel + distance + waste) * region.factor;
            const totalTonnes = totalKg / 1000;
            const creditsNeeded = Math.ceil(totalTonnes);
            const baseCost = creditsNeeded * 10;
            const localCost = baseCost * region.rate;

            setResult({
                tonnes: totalTonnes.toFixed(2),
                credits: creditsNeeded,
                cost: localCost.toLocaleString(),
                currency: region.currency,
                breakdown: { electricity, fuel, distance, waste },
                totalKg: totalKg.toFixed(1)
            });
            setAnimating(false);
        }, 800);
    };

    const reset = () => {
        setInputs({ electricity: '', fuel: '', distance: '', waste: '', region: 'India' });
        setResult(null);
    };

    return (
        <div className="page-calculator">
            <div className="page-banner">
                <div className="container">
                    <span className="section-tag-light">Measure Your Impact</span>
                    <h1>Carbon Footprint Calculator</h1>
                    <p className="banner-sub">
                        Estimate your carbon emissions and discover how many credits you need to become Carbon Neutral.
                    </p>
                </div>
            </div>

            <div className="section">
                <div className="container">
                    <div className="calc-grid">
                        {/* Input Form */}
                        <div className="card calc-form-card">
                            <div className="calc-form-header">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /></svg>
                                <h3>Enter Your Monthly Usage</h3>
                            </div>
                            <form onSubmit={calculate}>
                                <div className="input-group mb-4">
                                    <label>Region</label>
                                    <select
                                        className="input"
                                        value={inputs.region}
                                        onChange={e => setInputs({ ...inputs, region: e.target.value })}
                                    >
                                        {Object.keys(REGIONS).map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>

                                <div className="input-group mb-4">
                                    <label>
                                        <span className="label-icon">⚡</span>
                                        Electricity Usage (kWh)
                                    </label>
                                    <input
                                        type="number" className="input" placeholder="e.g. 150"
                                        value={inputs.electricity}
                                        onChange={e => setInputs({ ...inputs, electricity: e.target.value })}
                                    />
                                </div>

                                <div className="input-group mb-4">
                                    <label>
                                        <span className="label-icon">⛽</span>
                                        Fuel Consumption (Liters)
                                    </label>
                                    <input
                                        type="number" className="input" placeholder="e.g. 40"
                                        value={inputs.fuel}
                                        onChange={e => setInputs({ ...inputs, fuel: e.target.value })}
                                    />
                                </div>

                                <div className="input-group mb-4">
                                    <label>
                                        <span className="label-icon">🚗</span>
                                        Vehicle Distance (km)
                                    </label>
                                    <input
                                        type="number" className="input" placeholder="e.g. 500"
                                        value={inputs.distance}
                                        onChange={e => setInputs({ ...inputs, distance: e.target.value })}
                                    />
                                </div>

                                <div className="input-group mb-6">
                                    <label>
                                        <span className="label-icon">🗑️</span>
                                        Waste Generated (kg)
                                    </label>
                                    <input
                                        type="number" className="input" placeholder="e.g. 20"
                                        value={inputs.waste}
                                        onChange={e => setInputs({ ...inputs, waste: e.target.value })}
                                    />
                                </div>

                                <div className="calc-actions">
                                    <button type="submit" className="btn btn-primary w-full" disabled={animating}>
                                        {animating ? (
                                            <><span className="spinner"></span>Calculating...</>
                                        ) : 'Calculate Footprint'}
                                    </button>
                                    {result && (
                                        <button type="button" className="btn btn-outline w-full" onClick={reset}>Reset</button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Result Card */}
                        <div className="calc-result-area">
                            {result ? (
                                <div className="card calc-result-card animate-scale">
                                    <span className="badge badge-green mb-4">Analysis Complete</span>

                                    <div className="result-header">
                                        <span className="result-label">Total Monthly Emissions</span>
                                        <div className="result-big">
                                            {result.tonnes}
                                            <span className="unit">Tonnes CO₂</span>
                                        </div>
                                        <span className="result-sub">{result.totalKg} kg CO₂ equivalent</span>
                                    </div>

                                    <div className="credits-needed-box">
                                        <div className="cn-left">
                                            <span className="cn-icon">🌱</span>
                                            <div>
                                                <strong>{result.credits} Credits</strong>
                                                <p className="text-xs text-muted">Needed to offset</p>
                                            </div>
                                        </div>
                                        <div className="cn-right">
                                            <span className="text-sm text-muted">Est. Cost</span>
                                            <strong className="cn-price">{result.currency}{result.cost}</strong>
                                        </div>
                                    </div>

                                    {/* Breakdown Chart */}
                                    <div className="breakdown-section">
                                        <h4 className="mb-4">Emission Breakdown</h4>
                                        <div className="breakdown-bars">
                                            {[
                                                { label: 'Electricity', value: result.breakdown.electricity, color: '#f59e0b', icon: '⚡' },
                                                { label: 'Fuel', value: result.breakdown.fuel, color: '#ef4444', icon: '⛽' },
                                                { label: 'Transport', value: result.breakdown.distance, color: '#3b82f6', icon: '🚗' },
                                                { label: 'Waste', value: result.breakdown.waste, color: '#8b5cf6', icon: '🗑️' },
                                            ].map((item, i) => {
                                                const total = result.breakdown.electricity + result.breakdown.fuel + result.breakdown.distance + result.breakdown.waste;
                                                const pct = total > 0 ? (item.value / total * 100) : 0;
                                                return (
                                                    <div key={i} className="breakdown-row">
                                                        <div className="breakdown-label">
                                                            <span>{item.icon}</span>
                                                            <span>{item.label}</span>
                                                        </div>
                                                        <div className="breakdown-bar-wrap">
                                                            <div className="breakdown-bar" style={{ width: `${Math.max(pct, 2)}%`, background: item.color }}></div>
                                                        </div>
                                                        <span className="breakdown-val">{item.value.toFixed(1)} kg</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <button onClick={() => navigate('/marketplace')} className="btn btn-dark w-full mt-6">
                                        Buy Credits Now →
                                    </button>
                                </div>
                            ) : (
                                <div className="card placeholder-card">
                                    <div className="placeholder-icon">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-muted)" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="10" y2="10" /><line x1="14" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="10" y2="14" /><line x1="14" y1="14" x2="16" y2="14" /></svg>
                                    </div>
                                    <h3>Ready to Measure?</h3>
                                    <p className="text-muted">Fill in the details on the left to see your carbon impact and offset options.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
