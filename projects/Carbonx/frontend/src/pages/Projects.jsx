import { useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import './StaticPages.css';

const ALL_PROJECTS = [
    // Nature-Based
    {
        id: 1, title: "Amazon Reforestation", category: "Nature-Based", location: "Brazil",
        credits: "50k", risk: "Low", price: "12.50", revenue: "$625K/yr",
        description: "Large-scale native tree planting in deforested areas of the Amazon basin, restoring biodiversity and creating long-term carbon sinks.",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5c73?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 2, title: "Soil Carbon Enhancement", category: "Nature-Based", location: "India",
        credits: "35k", risk: "Medium", price: "14.00", revenue: "$490K/yr",
        description: "Regenerative farming practices that enhance soil organic carbon through cover cropping, no-till agriculture, and composting.",
        image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 3, title: "Blue Carbon Mangroves", category: "Nature-Based", location: "Indonesia",
        credits: "20k", risk: "Medium", price: "22.00", revenue: "$440K/yr",
        description: "Protecting and restoring coastal mangrove ecosystems that store up to 10x more carbon than terrestrial forests.",
        image: "https://images.unsplash.com/photo-1584553181829-f53835f8e657?auto=format&fit=crop&q=80&w=800"
    },
    // Methane Projects
    {
        id: 4, title: "Landfill Gas Capture", category: "Methane", location: "USA",
        credits: "45k", risk: "Low", price: "10.00", revenue: "$450K/yr",
        description: "Capturing methane from municipal landfills and converting it to electricity, preventing a potent greenhouse gas from entering the atmosphere.",
        image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 5, title: "Biogas Plants India", category: "Methane", location: "India",
        credits: "28k", risk: "Low", price: "9.50", revenue: "$266K/yr",
        description: "Community-scale biogas digesters converting agricultural waste and cattle dung into clean cooking fuel and organic fertilizer.",
        image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 6, title: "Methane Capture Delhi", category: "Methane", location: "India",
        credits: "38k", risk: "Low", price: "11.00", revenue: "$418K/yr",
        description: "Industrial methane capture at waste processing facilities in Delhi NCR region, reducing urban methane emissions significantly.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=800"
    },
    // Renewable
    {
        id: 7, title: "Gujarat Solar Park", category: "Renewable", location: "India",
        credits: "120k", risk: "Low", price: "8.00", revenue: "$960K/yr",
        description: "One of the world's largest solar parks generating clean energy to displace coal-based power across western India.",
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 8, title: "Wind Farm Expansion", category: "Renewable", location: "Germany",
        credits: "80k", risk: "Low", price: "9.50", revenue: "$760K/yr",
        description: "Adding new wind turbines to existing wind farm infrastructure in northern Germany, increasing clean energy capacity.",
        image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 9, title: "Clean Cookstoves", category: "Community", location: "Kenya",
        credits: "30k", risk: "Medium", price: "15.00", revenue: "$450K/yr",
        description: "Distributing fuel-efficient cookstoves to rural communities, reducing wood consumption, indoor air pollution, and deforestation rates.",
        image: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80&w=800"
    },
];

const CATEGORIES = ['All', 'Nature-Based', 'Methane', 'Renewable', 'Community'];

export default function Projects() {
    const [filter, setFilter] = useState('All');

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
                            <ProjectCard key={p.id} project={p} />
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="empty-state">
                            <p>No projects found in this category.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
