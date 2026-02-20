import './ProjectCard.css';

export default function ProjectCard({ project, onViewDetails }) {
    const { title, category, location, credits, risk, price, image, description, revenue } = project;

    const riskColor = risk === 'Low' ? 'var(--c-success)' : risk === 'Medium' ? 'var(--c-warning)' : 'var(--c-error)';
    const riskBg = risk === 'Low' ? '#dcfce7' : risk === 'Medium' ? '#fef3c7' : '#fee2e2';

    const handleClick = () => {
        if (onViewDetails) {
            onViewDetails(project);
        }
    };

    return (
        <div className="card project-card">
            <div className="project-img" style={{ backgroundImage: `url(${image})` }}>
                <span className="badge badge-category">{category}</span>
            </div>
            <div className="project-content">
                <div className="project-header">
                    <h3>{title}</h3>
                    <span className="project-location">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {location}
                    </span>
                </div>

                {description && (
                    <p className="project-desc">{description}</p>
                )}

                <div className="project-stats">
                    <div className="stat">
                        <span className="label">Credits/Yr</span>
                        <span className="value">{credits}</span>
                    </div>
                    <div className="stat">
                        <span className="label">Price</span>
                        <span className="value-price">${price}</span>
                    </div>
                    <div className="stat">
                        <span className="label">Risk</span>
                        <span className="value-risk" style={{ color: riskColor, background: riskBg, padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem' }}>{risk}</span>
                    </div>
                </div>

                {revenue && (
                    <div className="project-revenue">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2"><path d="M12 2v20m5-17H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H7" /></svg>
                        <span>Revenue Potential: <strong>{revenue}</strong></span>
                    </div>
                )}

                <button type="button" className="btn btn-outline w-full" onClick={handleClick}>
                    View Details
                </button>
            </div>
        </div>
    );
}
