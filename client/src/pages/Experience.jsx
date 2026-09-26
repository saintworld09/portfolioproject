import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/PublicExperience.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { API_BASE_URL } from "../config";

function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
}

function Experience() {
    const { portfolioSlug } = useParams();

    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadExperiences = async () => {
            try {
                setLoading(true);
                setError("");

                // ----------------------------------------
                // PORTFOLIO SLUG IS REQUIRED
                // ----------------------------------------

                if (!portfolioSlug) {
                    if (!cancelled) {
                        setExperiences([]);
                        setError(
                            "Portfolio information is missing."
                        );
                        setLoading(false);
                    }

                    return;
                }

                // ----------------------------------------
                // BUILD PORTFOLIO-SCOPED REQUEST
                // ----------------------------------------

                const portfolioQuery = `?portfolioSlug=${encodeURIComponent(
                    portfolioSlug
                )}`;

                const response = await fetch(
                    `${API_BASE_URL}/api/experiences${portfolioQuery}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to load experience"
                    );
                }

                if (!cancelled) {
                    setExperiences(
                        Array.isArray(data) ? data : []
                    );
                    setLoading(false);
                }
            } catch (error) {
                console.error(
                    "Error loading public experience:",
                    error
                );

                if (!cancelled) {
                    setError(
                        error.message ||
                            "Failed to load experience"
                    );
                    setLoading(false);
                }
            }
        };

        loadExperiences();

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

                <main className="public-experience-page">
                    <div className="public-experience-loading">
                        <div className="public-experience-loading-spinner" />
                        <p>Loading experience...</p>
                    </div>
                </main>

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

                <main className="public-experience-page">
                    <section className="public-experience-error">
                        <span className="public-experience-error-label">
                            Experience
                        </span>

                        <h1>Something went wrong</h1>

                        <p>{error}</p>
                    </section>
                </main>

                <Footer />
            </>
        );
    }

    // ========================================
    // PUBLIC EXPERIENCE PAGE
    // ========================================

    return (
        <>
            <Header />

            <main className="public-experience-page">
                <section className="public-experience-header">
                    <div className="public-experience-header-content">
                        <div className="public-experience-header-title">
                            <span>Experience</span>
                        </div>

                        <div className="public-experience-header-description">
                            <p>
                                A look at the professional roles,
                                responsibilities, and experiences
                                that have shaped my career.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="public-experience-content">
                    {experiences.length === 0 ? (
                        <div className="public-experience-empty">
                            <div className="public-experience-empty-line" />

                            <h2>No experience available</h2>

                            <p>
                                Professional experience will
                                appear here once it has been added.
                            </p>
                        </div>
                    ) : (
                        <div className="public-experience-timeline">
                            {experiences.map(
                                (experience, index) => (
                                    <article
                                        key={experience.id}
                                        className={`public-experience-entry ${
                                            experience.isCurrent
                                                ? "public-experience-entry-current"
                                                : ""
                                        }`}
                                    >
                                        <div className="public-experience-timeline-column">
                                            <div className="public-experience-timeline-dot">
                                                <span />
                                            </div>

                                            {index !==
                                                experiences.length -
                                                    1 && (
                                                <div className="public-experience-timeline-line" />
                                            )}
                                        </div>

                                        <div className="public-experience-entry-content">
                                            <div className="public-experience-entry-top">
                                                <div className="public-experience-entry-heading">
                                                    <div className="public-experience-entry-date">
                                                        <span>
                                                            {formatDate(
                                                                experience.startDate
                                                            )}
                                                        </span>

                                                        <span className="public-experience-date-dash">
                                                            —
                                                        </span>

                                                        <span>
                                                            {experience.isCurrent
                                                                ? "Present"
                                                                : formatDate(
                                                                      experience.endDate
                                                                  )}
                                                        </span>
                                                    </div>

                                                    <div className="public-experience-title-row">
                                                        <h2>
                                                            {
                                                                experience.jobTitle
                                                            }
                                                        </h2>

                                                        {experience.isCurrent && (
                                                            <span className="public-experience-current-badge">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="public-experience-company">
                                                        <span className="public-experience-company-name">
                                                            {
                                                                experience.company
                                                            }
                                                        </span>

                                                        {experience.location && (
                                                            <>
                                                                <span className="public-experience-company-separator">
                                                                    /
                                                                </span>

                                                                <span className="public-experience-location">
                                                                    {
                                                                        experience.location
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {experience.description && (
                                                <div className="public-experience-description">
                                                    <p>
                                                        {
                                                            experience.description
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                )
                            )}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </>
    );
}

export default Experience;