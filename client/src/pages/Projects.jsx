import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../styles/Projects.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const API_BASE_URL = "http://localhost:5000";

function getImageUrl(imageUrl) {
    if (!imageUrl) {
        return null;
    }

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    return `${API_BASE_URL}${imageUrl}`;
}

function Projects() {
    const { portfolioSlug } = useParams();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadProjects = async () => {
            try {
                setLoading(true);
                setError("");

                // ========================================
                // PORTFOLIO SLUG IS REQUIRED
                // ========================================

                if (!portfolioSlug) {
                    if (!cancelled) {
                        setProjects([]);
                        setError(
                            "Portfolio information is missing."
                        );
                        setLoading(false);
                    }

                    return;
                }

                // ========================================
                // BUILD PORTFOLIO-SCOPED REQUEST
                // ========================================

                const portfolioQuery = `?portfolioSlug=${encodeURIComponent(
                    portfolioSlug
                )}`;

                const response = await fetch(
                    `${API_BASE_URL}/api/projects${portfolioQuery}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to load projects."
                    );
                }

                if (!cancelled) {
                    setProjects(
                        Array.isArray(data) ? data : []
                    );
                    setLoading(false);
                }
            } catch (error) {
                console.error(
                    "Error loading projects:",
                    error
                );

                if (!cancelled) {
                    setError(
                        error.message ||
                            "Unable to load projects."
                    );
                    setLoading(false);
                }
            }
        };

        loadProjects();

        return () => {
            cancelled = true;
        };
    }, [portfolioSlug]);

    // ========================================
    // LOADING STATE
    // ========================================

    if (loading) {
        return (
            <>
                <Header />

                <div className="projects-page">
                    <div className="projects-container">
                        <div className="projects-state">
                            <h2>Loading Projects...</h2>

                            <p>
                                Please wait while the projects
                                are being loaded.
                            </p>
                        </div>
                    </div>
                </div>

                <Footer />
            </>
        );
    }

    // ========================================
    // ERROR STATE
    // ========================================

    if (error) {
        return (
            <>
                <Header />

                <div className="projects-page">
                    <div className="projects-container">
                        <div className="projects-state projects-state-error">
                            <h2>Unable to Load Projects</h2>

                            <p>{error}</p>
                        </div>
                    </div>
                </div>

                <Footer />
            </>
        );
    }

    // ========================================
    // PUBLIC PROJECTS PAGE
    // ========================================

    return (
        <>
            <Header />

            <div className="projects-page">
                <div className="projects-container">

                    {/* ========================================
                        PAGE HEADER
                    ======================================== */}

                    <header className="projects-header">
                        <div className="projects-header-content">

                            <div className="projects-header-title">
                                <h1>Projects</h1>
                            </div>

                            <div className="projects-header-description">
                                <p>
                                    Explore selected data analytics and
                                    business intelligence projects, including
                                    dashboards, analysis, insights, and
                                    business-focused recommendations.
                                </p>
                            </div>

                        </div>
                    </header>

                    {/* ========================================
                        PROJECTS GRID
                    ======================================== */}

                    {projects.length === 0 ? (
                        <div className="projects-state">
                            <h2>No Projects Available</h2>

                            <p>
                                Projects will appear here once
                                they have been added from the
                                admin dashboard.
                            </p>
                        </div>
                    ) : (
                        <section className="projects-grid">

                            {projects.map((project) => {
                                const coverImage =
                                    project.images?.find(
                                        (image) =>
                                            image.isCover === true
                                    );

                                const projectImage =
                                    coverImage?.imageUrl ||
                                    project.dashboardImageUrl;

                                return (
                                    <article
                                        className="project-card"
                                        key={project.id}
                                    >

                                        {/* ========================================
                                            PROJECT IMAGE
                                        ======================================== */}

                                        <div className="project-card-image">

                                            {projectImage ? (
                                                <img
                                                    src={getImageUrl(
                                                        projectImage
                                                    )}
                                                    alt={`${project.title} dashboard`}
                                                />
                                            ) : (
                                                <div className="project-card-image-placeholder">
                                                    No Image Available
                                                </div>
                                            )}

                                        </div>

                                        {/* ========================================
                                            PROJECT CONTENT
                                        ======================================== */}

                                        <div className="project-card-content">

                                            {project.category && (
                                                <p className="project-card-category">
                                                    {project.category}
                                                </p>
                                            )}

                                            <h2>
                                                {project.title}
                                            </h2>

                                            <p className="project-card-description">
                                                {
                                                    project.shortDescription
                                                }
                                            </p>

                                            <div className="project-card-footer">

                                                <Link
                                                    to={`/${portfolioSlug}/projects/${project.id}`}
                                                    className="project-card-link"
                                                >
                                                    View Project

                                                    <span>
                                                        →
                                                    </span>
                                                </Link>

                                            </div>

                                        </div>

                                    </article>
                                );
                            })}

                        </section>
                    )}

                </div>
            </div>

            <Footer />
        </>
    );
}

export default Projects;