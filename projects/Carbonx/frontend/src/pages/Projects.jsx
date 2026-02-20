import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import './StaticPages.css';

const ALL_PROJECTS = [
    // Nature-Based
    {
        id: 1,
        title: "Amazon Reforestation",
        category: "Nature-Based",
        location: "Brazil",
        credits: "50k",
        risk: "Low",
        price: "12.50",
        revenue: "₹5.2Cr/yr",
        description: "Large-scale native tree planting in deforested areas of the Amazon basin, restoring biodiversity and creating long-term carbon sinks.",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5c73?auto=format&fit=crop&q=80&w=800",
        certification: "VCS Verified",
        co2Reduction: "500,000 tonnes CO₂e/year",
        startDate: "2022",
        endDate: "2032",
        highlights: "Native species restoration, biodiversity corridors, community engagement"
    },
    {
        id: 2,
        title: "Soil Carbon Enhancement",
        category: "Nature-Based",
        location: "India",
        credits: "35k",
        risk: "Medium",
        price: "14.00",
        revenue: "₹4.1Cr/yr",
        description: "Regenerative farming practices that enhance soil organic carbon through cover cropping, no-till agriculture, and composting.",
        image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=800",
        certification: "Gold Standard",
        co2Reduction: "350,000 tonnes CO₂e/year",
        startDate: "2023",
        endDate: "2028",
        highlights: "Cover cropping, no-till farming, organic compost, farmer training"
    },
    {
        id: 3,
        title: "Blue Carbon Mangroves",
        category: "Nature-Based",
        location: "Indonesia",
        credits: "20k",
        risk: "Medium",
        price: "22.00",
        revenue: "₹3.7Cr/yr",
        description: "Protecting and restoring coastal mangrove ecosystems that store up to 10x more carbon than terrestrial forests.",
        image: "https://images.unsplash.com/photo-1584553181829-f53835f8e657?auto=format&fit=crop&q=80&w=800",
        certification: "VCS + CCB",
        co2Reduction: "200,000 tonnes CO₂e/year",
        startDate: "2023",
        endDate: "2028",
        highlights: "Mangrove replanting, coastal protection, fisheries support"
    },
    // Methane Projects
    {
        id: 4,
        title: "Landfill Gas Capture",
        category: "Methane",
        location: "USA",
        credits: "45k",
        risk: "Low",
        price: "10.00",
        revenue: "₹3.7Cr/yr",
        description: "Capturing methane from municipal landfills and converting it to electricity, preventing a potent greenhouse gas from entering the atmosphere.",
        image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=800",
        certification: "CDM Verified",
        co2Reduction: "450,000 tonnes CO₂e/year",
        startDate: "2021",
        endDate: "2030",
        highlights: "Methane-to-energy conversion, grid connection, landfill remediation"
    },
    {
        id: 5,
        title: "Biogas Plants India",
        category: "Methane",
        location: "India",
        credits: "28k",
        risk: "Low",
        price: "9.50",
        revenue: "₹2.2Cr/yr",
        description: "Community-scale biogas digesters converting agricultural waste and cattle dung into clean cooking fuel and organic fertilizer.",
        image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800",
        certification: "Gold Standard",
        co2Reduction: "280,000 tonnes CO₂e/year",
        startDate: "2023",
        endDate: "2027",
        highlights: "Clean cookstoves, organic fertilizer, rural employment"
    },
    {
        id: 6,
        title: "Methane Capture Delhi",
        category: "Methane",
        location: "India",
        credits: "38k",
        risk: "Low",
        price: "11.00",
        revenue: "₹3.5Cr/yr",
        description: "Industrial methane capture at waste processing facilities in Delhi NCR region, reducing urban methane emissions significantly.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=800",
        certification: "VCS Verified",
        co2Reduction: "380,000 tonnes CO₂e/year",
        startDate: "2022",
        endDate: "2029",
        highlights: "Industrial waste gas capture, power generation, urban air quality"
    },
    // Renewable
    {
        id: 7,
        title: "Gujarat Solar Park",
        category: "Renewable",
        location: "India",
        credits: "120k",
        risk: "Low",
        price: "8.00",
        revenue: "₹7.9Cr/yr",
        description: "One of the world's largest solar parks generating clean energy to displace coal-based power across western India.",
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800",
        certification: "I-REC Standard",
        co2Reduction: "1,200,000 tonnes CO₂e/year",
        startDate: "2020",
        endDate: "2040",
        highlights: "Utility-scale solar, grid integration, regional decarbonization"
    },
    {
        id: 8,
        title: "Wind Farm Expansion",
        category: "Renewable",
        location: "Germany",
        credits: "80k",
        risk: "Low",
        price: "9.50",
        revenue: "₹6.3Cr/yr",
        description: "Adding new wind turbines to existing wind farm infrastructure in northern Germany, increasing clean energy capacity.",
        image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=800",
        certification: "TÜV Certified",
        co2Reduction: "800,000 tonnes CO₂e/year",
        startDate: "2022",
        endDate: "2035",
        highlights: "Wind turbine expansion, grid stability, European renewable targets"
    },
    {
        id: 9,
        title: "Clean Cookstoves",
        category: "Community",
        location: "Kenya",
        credits: "30k",
        risk: "Medium",
        price: "15.00",
        revenue: "₹3.7Cr/yr",
        description: "Distributing fuel-efficient cookstoves to rural communities, reducing wood consumption, indoor air pollution, and deforestation rates.",
        image: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80&w=800",
        certification: "Gold Standard",
        co2Reduction: "300,000 tonnes CO₂e/year",
        startDate: "2023",
        endDate: "2028",
        highlights: "Community distribution, health benefits, women empowerment"
    },
];

const CATEGORIES = ['All', 'Nature-Based', 'Methane', 'Renewable', 'Community'];

export default function Projects() {
    const [filter, setFilter] = useState('All');
    const [selectedProject, setSelectedProject] = useState(null);

    const filtered = filter === 'All'
        ? ALL_PROJECTS
        : ALL_PROJECTS.filter(p => p.category === filter);

    return (
        <div className="page-projects">
            <div className="page-banner">
                <div className="container">
                    <span className="section-tag-light">Our Portfolio</span>
                    <h1>Verified Projects</h1>
                    <p className="banner-sub">
                        Explore our portfolio of high-impact carbon offset projects across nature-based, methane, and renewable categories.
                    </p>
                </div>
            </div>

            <div className="section">
                <div className="container">
                    <div className="filter-bar mb-8">
                        {CATEGORIES.map(f => (
                            <button
                                key={f}
                                type="button"
                                className={`filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="project-count mb-6">
                        <span className="text-muted text-sm">Showing <strong>{filtered.length}</strong> projects</span>
                    </div>

                    <div className="projects-grid">
                        {filtered.map(p => (
                            <ProjectCard
                                key={p.id}
                                project={p}
                                onViewDetails={setSelectedProject}
                            />
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="empty-state">
                            <p>No projects found in this category.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Project Details Modal */}
            {selectedProject && (
                <div
                    className="project-modal-overlay"
                    onClick={() => setSelectedProject(null)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Escape' && setSelectedProject(null)}
                    aria-label="Close modal"
                >
                    <div
                        className="project-details-modal card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="project-details-header">
                            <div
                                className="project-details-img"
                                style={{ backgroundImage: `url(${selectedProject.image})` }}
                            />
                            <div className="project-details-title-wrap">
                                <span className="badge badge-category">{selectedProject.category}</span>
                                <h2>{selectedProject.title}</h2>
                                <div className="project-details-meta">
                                    <span className="location">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                        {selectedProject.location}
                                    </span>
                                    <span className="risk-badge" style={{
                                        color: selectedProject.risk === 'Low' ? 'var(--c-success)' : selectedProject.risk === 'Medium' ? 'var(--c-warning)' : 'var(--c-error)',
                                        background: selectedProject.risk === 'Low' ? '#dcfce7' : selectedProject.risk === 'Medium' ? '#fef3c7' : '#fee2e2',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                    }}>
                                        Risk: {selectedProject.risk}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="project-modal-close"
                                onClick={() => setSelectedProject(null)}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="project-details-body">
                            <div className="project-details-section">
                                <h3>Overview</h3>
                                <p>{selectedProject.description}</p>
                            </div>

                            <div className="project-details-stats">
                                <div className="detail-stat">
                                    <span className="label">Credits/Yr</span>
                                    <span className="value">{selectedProject.credits}</span>
                                </div>
                                <div className="detail-stat">
                                    <span className="label">Price per Credit</span>
                                    <span className="value">${selectedProject.price}</span>
                                </div>
                                <div className="detail-stat">
                                    <span className="label">Revenue Potential</span>
                                    <span className="value">{selectedProject.revenue}</span>
                                </div>
                                <div className="detail-stat">
                                    <span className="label">CO₂ Reduction</span>
                                    <span className="value">{selectedProject.co2Reduction}</span>
                                </div>
                                <div className="detail-stat">
                                    <span className="label">Certification</span>
                                    <span className="value">{selectedProject.certification || 'Verified'}</span>
                                </div>
                                <div className="detail-stat">
                                    <span className="label">Project Period</span>
                                    <span className="value">{selectedProject.startDate} – {selectedProject.endDate}</span>
                                </div>
                            </div>

                            {selectedProject.highlights && (
                                <div className="project-details-section">
                                    <h3>Key Highlights</h3>
                                    <p>{selectedProject.highlights}</p>
                                </div>
                            )}

                            <div className="project-details-actions">
                                <Link
                                    to="/marketplace"
                                    className="btn btn-primary"
                                    onClick={() => setSelectedProject(null)}
                                >
                                    Buy Credits
                                </Link>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setSelectedProject(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
