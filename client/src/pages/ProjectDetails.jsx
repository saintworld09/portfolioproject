import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../styles/ProjectDetails.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { API_BASE_URL } from "../config";

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

function ProjectDetails() {
    const { portfolioSlug, id } = useParams();

    const [project, setProject] = useState(null);
    const [insights, setInsights] = useState([]);
    const [recommendations, setRecommendations] =
        useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * =========================================================
     * IMAGE LIGHTBOX STATE
     * =========================================================
     */

    const [selectedImageIndex, setSelectedImageIndex] =
        useState(null);

    /*
     * =========================================================
     * LOAD PROJECT DATA
     * =========================================================
     */

    useEffect(() => {
        let cancelled = false;

        const loadProjectData = async () => {
            try {
                setLoading(true);
                setError("");

                // ========================================
                // VALIDATE PORTFOLIO SLUG
                // ========================================

                if (!portfolioSlug) {
                    if (!cancelled) {
                        setError(
                            "Portfolio information is missing."
                        );
                        setLoading(false);
                    }

                    return;
                }

                // ========================================
                // BUILD PORTFOLIO-SCOPED QUERY
                // ========================================

                const portfolioQuery =
                    `portfolioSlug=${encodeURIComponent(
                        portfolioSlug
                    )}`;

                const [
                    projectResponse,
                    insightsResponse,
                    recommendationsResponse,
                ] = await Promise.all([
                    fetch(
                        `${API_BASE_URL}/api/projects/${id}?${portfolioQuery}`
                    ),

                    fetch(
                        `${API_BASE_URL}/api/projects/${id}/insights?${portfolioQuery}`
                    ),

                    fetch(
                        `${API_BASE_URL}/api/projects/${id}/recommendations?${portfolioQuery}`
                    ),
                ]);

                // ========================================
                // PROJECT RESPONSE
                // ========================================

                if (!projectResponse.ok) {
                    if (projectResponse.status === 404) {
                        throw new Error(
                            "Project not found."
                        );
                    }

                    throw new Error(
                        "Failed to load project."
                    );
                }

                // ========================================
                // INSIGHTS RESPONSE
                // ========================================

                if (!insightsResponse.ok) {
                    throw new Error(
                        "Failed to load project insights."
                    );
                }

                // ========================================
                // RECOMMENDATIONS RESPONSE
                // ========================================

                if (!recommendationsResponse.ok) {
                    throw new Error(
                        "Failed to load project recommendations."
                    );
                }

                // ========================================
                // PARSE RESPONSES
                // ========================================

                const projectData =
                    await projectResponse.json();

                const insightsData =
                    await insightsResponse.json();

                const recommendationsData =
                    await recommendationsResponse.json();

                if (!cancelled) {
                    setProject(projectData);

                    setInsights(
                        Array.isArray(insightsData)
                            ? insightsData
                            : []
                    );

                    setRecommendations(
                        Array.isArray(
                            recommendationsData
                        )
                            ? recommendationsData
                            : []
                    );

                    setLoading(false);
                }
            } catch (error) {
                console.error(
                    "Error loading project data:",
                    error
                );

                if (!cancelled) {
                    setError(
                        error.message ||
                            "Unable to load project."
                    );

                    setLoading(false);
                }
            }
        };

        loadProjectData();

        return () => {
            cancelled = true;
        };
    }, [portfolioSlug, id]);

    /*
     * =========================================================
     * IMAGE DATA
     * =========================================================
     */

    const projectImages = project?.images || [];

    /*
     * Put the cover image first.
     *
     * This means:
     * - Cover appears first
     * - Other images follow
     * - Existing sortOrder is still respected for the rest
     */

    const sortedProjectImages = [
        ...projectImages.filter(
            (image) => image.isCover === true
        ),
        ...projectImages.filter(
            (image) => image.isCover !== true
        ),
    ];

    /*
     * =========================================================
     * LIGHTBOX FUNCTIONS
     * =========================================================
     */

    const openImage = (index) => {
        setSelectedImageIndex(index);
    };

    const closeImage = () => {
        setSelectedImageIndex(null);
    };

    const showPreviousImage = () => {
        if (
            selectedImageIndex === null ||
            sortedProjectImages.length === 0
        ) {
            return;
        }

        setSelectedImageIndex((currentIndex) => {
            if (currentIndex === 0) {
                return sortedProjectImages.length - 1;
            }

            return currentIndex - 1;
        });
    };

    const showNextImage = () => {
        if (
            selectedImageIndex === null ||
            sortedProjectImages.length === 0
        ) {
            return;
        }

        setSelectedImageIndex((currentIndex) => {
            if (
                currentIndex ===
                sortedProjectImages.length - 1
            ) {
                return 0;
            }

            return currentIndex + 1;
        });
    };

    /*
     * =========================================================
     * KEYBOARD CONTROLS FOR LIGHTBOX
     * =========================================================
     */

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (selectedImageIndex === null) {
                return;
            }

            if (event.key === "Escape") {
                setSelectedImageIndex(null);
                return;
            }

            if (event.key === "ArrowLeft") {
                setSelectedImageIndex((currentIndex) => {
                    if (
                        currentIndex === null ||
                        sortedProjectImages.length === 0
                    ) {
                        return currentIndex;
                    }

                    if (currentIndex === 0) {
                        return (
                            sortedProjectImages.length - 1
                        );
                    }

                    return currentIndex - 1;
                });

                return;
            }

            if (event.key === "ArrowRight") {
                setSelectedImageIndex((currentIndex) => {
                    if (
                        currentIndex === null ||
                        sortedProjectImages.length === 0
                    ) {
                        return currentIndex;
                    }

                    if (
                        currentIndex ===
                        sortedProjectImages.length - 1
                    ) {
                        return 0;
                    }

                    return currentIndex + 1;
                });
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        selectedImageIndex,
        sortedProjectImages.length,
    ]);

    /*
     * =========================================================
     * LOCK PAGE SCROLL WHEN LIGHTBOX IS OPEN
     * =========================================================
     */

    useEffect(() => {
        if (selectedImageIndex !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [selectedImageIndex]);

    /*
     * =========================================================
     * LOADING STATE
     * =========================================================
     */

    if (loading) {
        return (
            <>
                <Header />

                <div className="project-details-page">
                    <div className="project-details-loading">
                        <div className="project-details-loading-spinner"></div>

                        <p>
                            Loading project...
                        </p>
                    </div>
                </div>

                <Footer />
            </>
        );
    }

    /*
     * =========================================================
     * ERROR STATE
     * =========================================================
     */

    if (error) {
        return (
            <>
                <Header />

                <div className="project-details-page">
                    <div className="project-details-error">

                        <div className="project-details-error-icon">
                            !
                        </div>

                        <h1>
                            Project Not Found
                        </h1>

                        <p>
                            {error}
                        </p>

                        <Link
                            to={`/${portfolioSlug}/projects`}
                            className="project-details-back-link"
                        >
                            ← Back to Projects
                        </Link>

                    </div>
                </div>

                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="project-details-page">

                <div className="project-details-container">

                    {/* =================================================
                        BACK NAVIGATION
                    ================================================= */}

                    <div className="project-details-navigation">

                        <Link
                            to={`/${portfolioSlug}/projects`}
                            className="project-details-back-link"
                        >
                            <span>←</span>
                            Back to Projects
                        </Link>

                    </div>


                    {/* =================================================
                        HERO
                    ================================================= */}

                    <section className="project-details-hero">

                        <div className="project-details-hero-content">

                            {project.category && (
                                <div className="project-details-category">
                                    {project.category}
                                </div>
                            )}

                            <h1>
                                {project.title}
                            </h1>

                            <p className="project-details-hero-description">
                                {project.shortDescription}
                            </p>

                            <div className="project-details-hero-meta">

                                {project.category && (
                                    <div className="project-details-meta-item">
                                        <span>
                                            Category
                                        </span>

                                        <strong>
                                            {project.category}
                                        </strong>
                                    </div>
                                )}

                                {project.startDate && (
                                    <div className="project-details-meta-item">
                                        <span>
                                            Started
                                        </span>

                                        <strong>
                                            {new Date(
                                                project.startDate
                                            ).toLocaleDateString(
                                                "en-US",
                                                {
                                                    year: "numeric",
                                                    month: "long",
                                                }
                                            )}
                                        </strong>
                                    </div>
                                )}

                                <div className="project-details-meta-item">
                                    <span>
                                        Insights
                                    </span>

                                    <strong>
                                        {insights.length}
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        PROJECT IMAGES
                    ================================================= */}

                    {sortedProjectImages.length > 0 && (
                        <section className="project-details-gallery">

                            <div className="project-details-gallery-header">

                                <div>

                                    <p className="project-details-eyebrow">
                                        Project Gallery
                                    </p>

                                    <h2>
                                        Project Images
                                    </h2>

                                    <p>
                                        Explore the dashboards,
                                        analysis, and project views.
                                        Click any image to view it
                                        larger.
                                    </p>

                                </div>

                            </div>


                            {/* =================================================
                                HORIZONTAL IMAGE ROW
                            ================================================= */}

                            <div className="project-details-gallery-scroll">

                                {sortedProjectImages.map(
                                    (image, index) => (
                                        <button
                                            type="button"
                                            className={`project-details-gallery-item ${
                                                image.isCover
                                                    ? "is-cover"
                                                    : ""
                                            }`}
                                            key={image.id}
                                            onClick={() =>
                                                openImage(index)
                                            }
                                            aria-label={`View ${
                                                project.title
                                            } image ${
                                                index + 1
                                            }`}
                                        >

                                            <img
                                                src={getImageUrl(
                                                    image.imageUrl
                                                )}
                                                alt={`${project.title} project image ${
                                                    index + 1
                                                }`}
                                            />

                                            {image.isCover && (
                                                <span className="project-details-gallery-cover-badge">
                                                    Cover
                                                </span>
                                            )}

                                            <span className="project-details-gallery-view-indicator">
                                                View
                                            </span>

                                        </button>
                                    )
                                )}

                            </div>

                        </section>
                    )}


                    {/* =================================================
                        FALLBACK DASHBOARD IMAGE
                    ================================================= */}

                    {sortedProjectImages.length === 0 &&
                        project.dashboardImageUrl && (
                            <section className="project-details-dashboard">

                                <div
                                    className="project-details-dashboard-frame"
                                    onClick={() =>
                                        setSelectedImageIndex(
                                            0
                                        )
                                    }
                                >

                                    <img
                                        src={getImageUrl(
                                            project.dashboardImageUrl
                                        )}
                                        alt={`${project.title} dashboard preview`}
                                    />

                                </div>

                            </section>
                        )}


                    {/* =================================================
                        IMAGE LIGHTBOX
                    ================================================= */}

                    {selectedImageIndex !== null &&
                        sortedProjectImages.length > 0 && (
                            <div
                                className="project-details-lightbox"
                                onClick={closeImage}
                            >

                                <div
                                    className="project-details-lightbox-content"
                                    onClick={(event) =>
                                        event.stopPropagation()
                                    }
                                >

                                    {/* Close Button */}

                                    <button
                                        type="button"
                                        className="project-details-lightbox-close"
                                        onClick={closeImage}
                                        aria-label="Close image viewer"
                                    >
                                        ×
                                    </button>


                                    {/* Previous Button */}

                                    {sortedProjectImages.length >
                                        1 && (
                                        <button
                                            type="button"
                                            className="project-details-lightbox-prev"
                                            onClick={
                                                showPreviousImage
                                            }
                                            aria-label="Previous image"
                                        >
                                            ‹
                                        </button>
                                    )}


                                    {/* Large Image */}

                                    <div className="project-details-lightbox-image-wrapper">

                                        <img
                                            src={getImageUrl(
                                                sortedProjectImages[
                                                    selectedImageIndex
                                                ]
                                                    .imageUrl
                                            )}
                                            alt={`${project.title} project image ${
                                                selectedImageIndex +
                                                1
                                            }`}
                                            className="project-details-lightbox-image"
                                        />

                                    </div>


                                    {/* Next Button */}

                                    {sortedProjectImages.length >
                                        1 && (
                                        <button
                                            type="button"
                                            className="project-details-lightbox-next"
                                            onClick={
                                                showNextImage
                                            }
                                            aria-label="Next image"
                                        >
                                            ›
                                        </button>
                                    )}


                                    {/* Image Counter */}

                                    <div className="project-details-lightbox-counter">
                                        {selectedImageIndex + 1} /{" "}
                                        {sortedProjectImages.length}
                                    </div>


                                    {/* Thumbnail Navigation */}

                                    {sortedProjectImages.length >
                                        1 && (
                                        <div className="project-details-lightbox-thumbnails">

                                            {sortedProjectImages.map(
                                                (
                                                    image,
                                                    index
                                                ) => (
                                                    <button
                                                        type="button"
                                                        key={
                                                            image.id
                                                        }
                                                        className={`project-details-lightbox-thumbnail ${
                                                            index ===
                                                            selectedImageIndex
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            setSelectedImageIndex(
                                                                index
                                                            )
                                                        }
                                                        aria-label={`View image ${
                                                            index +
                                                            1
                                                        }`}
                                                    >

                                                        <img
                                                            src={getImageUrl(
                                                                image.imageUrl
                                                            )}
                                                            alt=""
                                                        />

                                                    </button>
                                                )
                                            )}

                                        </div>
                                    )}

                                </div>

                            </div>
                        )}


                    {/* =================================================
                        PROJECT OVERVIEW + BUSINESS PROBLEM
                    ================================================= */}

                    <section className="project-details-two-column">

                        {project.description && (
                            <article className="project-details-content-card">

                                <div className="project-details-card-icon">
                                    <span>↗</span>
                                </div>

                                <div>

                                    <p className="project-details-eyebrow">
                                        Overview
                                    </p>

                                    <h2>
                                        Project Overview
                                    </h2>

                                    <p className="project-details-body">
                                        {project.description}
                                    </p>

                                </div>

                            </article>
                        )}


                        {project.businessProblem && (
                            <article className="project-details-content-card">

                                <div className="project-details-card-icon">
                                    <span>?</span>
                                </div>

                                <div>

                                    <p className="project-details-eyebrow">
                                        Business Need
                                    </p>

                                    <h2>
                                        Business Problem
                                    </h2>

                                    <p className="project-details-body">
                                        {project.businessProblem}
                                    </p>

                                </div>

                            </article>
                        )}

                    </section>


                    {/* =================================================
                        METHODOLOGY
                    ================================================= */}

                    {project.methodology && (
                        <section className="project-details-section-card project-details-methodology">

                            <div className="project-details-section-header">

                                <div className="project-details-section-icon">
                                    ↗
                                </div>

                                <div>

                                    <h2 className="project-details-section-heading">
                                        Methodology
                                    </h2>

                                    <p className="project-details-section-description">
                                        The approach used to transform
                                        the raw data into meaningful
                                        business insights.
                                    </p>

                                </div>

                            </div>


                            <div className="project-details-methodology-card">

                                <div className="project-details-methodology-line"></div>

                                <div className="project-details-methodology-content">

                                    <div className="project-details-methodology-dot"></div>

                                    <p>
                                        {project.methodology}
                                    </p>

                                </div>

                            </div>

                        </section>
                    )}


                    {/* =================================================
                        DATASET
                    ================================================= */}

                    {project.datasetDescription && (
                        <section className="project-details-section-card project-details-dataset-section">

                            <div className="project-details-section-header">

                                <div className="project-details-section-icon">
                                    ◫
                                </div>

                                <div>

                                    <h2 className="project-details-section-heading">
                                        Dataset
                                    </h2>

                                    <p className="project-details-section-description">
                                        The data used for the analysis
                                        and dashboard development.
                                    </p>

                                </div>

                            </div>


                            <div className="project-details-dataset">

                                <div className="project-details-dataset-icon">
                                    ◫
                                </div>

                                <div className="project-details-dataset-content">

                                    <p>
                                        {project.datasetDescription}
                                    </p>

                                </div>

                            </div>

                        </section>
                    )}


                    {/* =================================================
                        KEY INSIGHTS + STRATEGIC RECOMMENDATIONS
                    ================================================= */}

                    <section className="project-details-analysis">

                        <div className="project-details-analysis-grid">

                            {/* KEY INSIGHTS */}

                            <div className="project-details-analysis-card project-details-insights-card">

                                <div className="project-details-analysis-header">

                                    <div className="project-details-analysis-icon">
                                        ↗
                                    </div>

                                    <div>

                                        <h3>
                                            Key Insights
                                        </h3>

                                        <p>
                                            What the data reveals
                                        </p>

                                    </div>

                                </div>


                                <div className="project-details-analysis-list">

                                    {insights.length === 0 ? (
                                        <p className="project-details-empty">
                                            No key insights have
                                            been added yet.
                                        </p>
                                    ) : (
                                        insights.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <div
                                                    className="project-details-analysis-item"
                                                    key={
                                                        item.id
                                                    }
                                                >

                                                    <div className="project-details-analysis-number">
                                                        {String(
                                                            index + 1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </div>

                                                    <p>
                                                        {
                                                            item.insight
                                                        }
                                                    </p>

                                                </div>
                                            )
                                        )
                                    )}

                                </div>

                            </div>


                            {/* STRATEGIC RECOMMENDATIONS */}

                            <div className="project-details-analysis-card project-details-recommendations-card">

                                <div className="project-details-analysis-header">

                                    <div className="project-details-analysis-icon">
                                        ✓
                                    </div>

                                    <div>

                                        <h3>
                                            Strategic Recommendations
                                        </h3>

                                        <p>
                                            Actions informed by the data
                                        </p>

                                    </div>

                                </div>


                                <div className="project-details-analysis-list">

                                    {recommendations.length ===
                                    0 ? (
                                        <p className="project-details-empty">
                                            No strategic
                                            recommendations have
                                            been added yet.
                                        </p>
                                    ) : (
                                        recommendations.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <div
                                                    className="project-details-analysis-item"
                                                    key={
                                                        item.id
                                                    }
                                                >

                                                    <div className="project-details-analysis-number">
                                                        {String(
                                                            index + 1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </div>

                                                    <p>
                                                        {
                                                            item.recommendation
                                                        }
                                                    </p>

                                                </div>
                                            )
                                        )
                                    )}

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        PROJECT INFORMATION
                    ================================================= */}

                    <section className="project-details-section-card project-details-information">

                        <div className="project-details-section-header">

                            <div className="project-details-section-icon">
                                ℹ
                            </div>

                            <div>

                                <h2 className="project-details-section-heading">
                                    Project Information
                                </h2>

                                <p className="project-details-section-description">
                                    Key information about this project.
                                </p>

                            </div>

                        </div>


                        <div className="project-details-information-grid">

                            {project.category && (
                                <div className="project-details-information-item">

                                    <span>
                                        Category
                                    </span>

                                    <strong>
                                        {project.category}
                                    </strong>

                                </div>
                            )}


                            {project.startDate && (
                                <div className="project-details-information-item">

                                    <span>
                                        Start Date
                                    </span>

                                    <strong>
                                        {new Date(
                                            project.startDate
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                year: "numeric",
                                                month: "long",
                                            }
                                        )}
                                    </strong>

                                </div>
                            )}


                            {project.endDate && (
                                <div className="project-details-information-item">

                                    <span>
                                        End Date
                                    </span>

                                    <strong>
                                        {new Date(
                                            project.endDate
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                year: "numeric",
                                                month: "long",
                                            }
                                        )}
                                    </strong>

                                </div>
                            )}

                        </div>

                    </section>


                    {/* =================================================
                        PROJECT LINKS
                    ================================================= */}

                    {(project.githubUrl ||
                        project.liveUrl) && (
                        <section className="project-details-links-section">

                            <div className="project-details-links-content">

                                <div>

                                    <p className="project-details-eyebrow">
                                        Explore
                                    </p>

                                    <h2>
                                        View the Project
                                    </h2>

                                    <p>
                                        Explore the source code or
                                        view the live project.
                                    </p>

                                </div>


                                <div className="project-details-links">

                                    {project.githubUrl && (
                                        <a
                                            href={
                                                project.githubUrl
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="project-details-link-button"
                                        >
                                            View on GitHub
                                            <span>
                                                ↗
                                            </span>
                                        </a>
                                    )}


                                    {project.liveUrl && (
                                        <a
                                            href={
                                                project.liveUrl
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="project-details-link-button project-details-live-button"
                                        >
                                            View Live Project
                                            <span>
                                                ↗
                                            </span>
                                        </a>
                                    )}

                                </div>

                            </div>

                        </section>
                    )}


                    {/* =================================================
                        BOTTOM NAVIGATION
                    ================================================= */}

                    <div className="project-details-bottom-navigation">

                        <Link
                            to={`/${portfolioSlug}/projects`}
                            className="project-details-back-link"
                        >
                            <span>←</span>
                            Back to All Projects
                        </Link>

                    </div>

                </div>

            </div>

            <Footer />
        </>
    );
}

export default ProjectDetails;