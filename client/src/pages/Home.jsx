import { useEffect, useState } from "react";
import {
    Link,
    useParams,
} from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/Home.css";

const API_BASE_URL = "http://localhost:5000";

/*
 * =========================================================
 * IMAGE URL HELPER
 * =========================================================
 */

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


/*
 * =========================================================
 * HOME COMPONENT
 * =========================================================
 */

function Home() {

    /*
     * =========================================================
     * GET CURRENT PORTFOLIO SLUG
     * =========================================================
     *
     * Examples:
     *
     * /babatunde
     * /babatunde-adekola
     *
     * React Router provides the value dynamically.
     *
     * =========================================================
     */

    const { portfolioSlug } = useParams();


    const [projects, setProjects] = useState([]);
    const [experience, setExperience] = useState([]);
    const [education, setEducation] = useState([]);

    const [loadingProjects, setLoadingProjects] =
        useState(true);

    const [loadingExperience, setLoadingExperience] =
        useState(true);

    const [loadingEducation, setLoadingEducation] =
        useState(true);

    const [projectsError, setProjectsError] =
        useState("");


    /*
     * =========================================================
     * LOAD HOMEPAGE DATA
     * =========================================================
     *
     * Every public request is scoped to the current
     * portfolioSlug.
     *
     * =========================================================
     */

    useEffect(() => {

        /*
         * React Router should normally provide the slug
         * because this component is rendered through:
         *
         * /:portfolioSlug
         *
         * If it is temporarily unavailable, simply wait
         * without performing synchronous state updates.
         */

        if (!portfolioSlug) {
            return;
        }


        const encodedPortfolioSlug =
            encodeURIComponent(portfolioSlug);


        /*
         * =====================================================
         * LOAD PROJECTS
         * =====================================================
         */

        const loadProjects = async () => {

            try {

                setLoadingProjects(true);
                setProjectsError("");

                const response = await fetch(
                    `${API_BASE_URL}/api/projects?portfolioSlug=${encodedPortfolioSlug}`
                );

                if (!response.ok) {
                    throw new Error(
                        "Unable to load projects."
                    );
                }

                const data = await response.json();

                setProjects(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    "Error loading projects:",
                    error
                );

                setProjectsError(
                    "Unable to load projects."
                );

                setProjects([]);

            } finally {

                setLoadingProjects(false);

            }
        };


        /*
         * =====================================================
         * LOAD EXPERIENCE
         * =====================================================
         */

        const loadExperience = async () => {

            try {

                setLoadingExperience(true);

                const response = await fetch(
                    `${API_BASE_URL}/api/experiences?portfolioSlug=${encodedPortfolioSlug}`
                );

                if (!response.ok) {
                    throw new Error(
                        "Unable to load experience."
                    );
                }

                const data = await response.json();

                setExperience(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    "Error loading experience:",
                    error
                );

                setExperience([]);

            } finally {

                setLoadingExperience(false);

            }
        };


        /*
         * =====================================================
         * LOAD EDUCATION
         * =====================================================
         */

        const loadEducation = async () => {

            try {

                setLoadingEducation(true);

                const response = await fetch(
                    `${API_BASE_URL}/api/education?portfolioSlug=${encodedPortfolioSlug}`
                );

                if (!response.ok) {
                    throw new Error(
                        "Unable to load education."
                    );
                }

                const data = await response.json();

                setEducation(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    "Error loading education:",
                    error
                );

                setEducation([]);

            } finally {

                setLoadingEducation(false);

            }
        };


        /*
         * =====================================================
         * START ALL HOMEPAGE REQUESTS
         * =====================================================
         */

        loadProjects();
        loadExperience();
        loadEducation();

    }, [portfolioSlug]);


    /*
     * =========================================================
     * PROJECT IMAGE
     * =========================================================
     */

    const getProjectImage = (project) => {

        const coverImage =
            project?.images?.find(
                (image) =>
                    image.isCover === true
            );

        if (coverImage?.imageUrl) {

            return getImageUrl(
                coverImage.imageUrl
            );

        }

        if (project?.dashboardImageUrl) {

            return getImageUrl(
                project.dashboardImageUrl
            );

        }

        return null;
    };


    /*
     * =========================================================
     * FEATURED PROJECTS
     * =========================================================
     */

    const featuredProjects =
        projects.slice(0, 3);


    /*
     * =========================================================
     * FEATURED EXPERIENCE
     * =========================================================
     */

    const featuredExperience =
        experience.slice(0, 2);


    /*
     * =========================================================
     * FEATURED EDUCATION
     * =========================================================
     */

    const featuredEducation =
        education.slice(0, 1);


    /*
     * =========================================================
     * FORMAT EXPERIENCE YEAR
     * =========================================================
     */

    const formatYear = (date) => {

        if (!date) {
            return "";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
        }

        return parsedDate.getFullYear();
    };


    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (

        <div className="home-page">

            <Header />

            <main className="home-main">


                {/* =================================================
                    HERO
                ================================================= */}

                <section className="home-hero">

                    <div className="home-container home-hero-container">

                        <div className="home-hero-content">

                            <div className="home-hero-eyebrow">

                                <span className="home-status-dot"></span>

                                Data Analyst &amp; Business Intelligence

                            </div>


                            <h1 className="home-hero-title">

                                Turning complex data into

                                <span>
                                    {" "}clear decisions.
                                </span>

                            </h1>


                            <p className="home-hero-description">

                                I work with data to uncover patterns,
                                answer business questions, and turn
                                analysis into insights people can
                                actually use.

                            </p>


                            <div className="home-hero-actions">

                                <Link
                                    to={`/${portfolioSlug}/projects`}
                                    className="home-primary-button"
                                >

                                    <span>
                                        View My Work
                                    </span>

                                    <span>
                                        ↗
                                    </span>

                                </Link>


                                <Link
                                    to={`/${portfolioSlug}/about`}
                                    className="home-secondary-button"
                                >

                                    More About Me

                                    <span>
                                        →
                                    </span>

                                </Link>

                            </div>


                            <div className="home-hero-tools">

                                <span>
                                    Working with
                                </span>


                                <div className="home-tool-list">

                                    <span>
                                        Excel
                                    </span>

                                    <span>
                                        SQL
                                    </span>

                                    <span>
                                        Power BI
                                    </span>

                                    <span>
                                        Python
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            HERO DATA VISUAL
                        ================================================= */}

                        <div className="home-hero-visual">

                            <div className="home-visual-card">

                                <div className="home-visual-header">

                                    <div>

                                        <span className="home-visual-label">
                                            ANALYTICS OVERVIEW
                                        </span>

                                        <strong>
                                            From data to insight
                                        </strong>

                                    </div>


                                    <span className="home-visual-menu">
                                        •••
                                    </span>

                                </div>


                                <div className="home-chart">

                                    <div className="home-chart-y-axis">

                                        <span>100</span>
                                        <span>75</span>
                                        <span>50</span>
                                        <span>25</span>
                                        <span>0</span>

                                    </div>


                                    <div className="home-chart-area">

                                        <div className="home-chart-grid">

                                            <span></span>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                            <span></span>

                                        </div>


                                        <div className="home-chart-line">

                                            <span className="chart-point point-one"></span>
                                            <span className="chart-point point-two"></span>
                                            <span className="chart-point point-three"></span>
                                            <span className="chart-point point-four"></span>
                                            <span className="chart-point point-five"></span>
                                            <span className="chart-point point-six"></span>

                                        </div>


                                        <div className="home-chart-bars">

                                            <span
                                                style={{
                                                    height: "38%"
                                                }}
                                            ></span>

                                            <span
                                                style={{
                                                    height: "52%"
                                                }}
                                            ></span>

                                            <span
                                                style={{
                                                    height: "45%"
                                                }}
                                            ></span>

                                            <span
                                                style={{
                                                    height: "68%"
                                                }}
                                            ></span>

                                            <span
                                                style={{
                                                    height: "61%"
                                                }}
                                            ></span>

                                            <span
                                                style={{
                                                    height: "84%"
                                                }}
                                            ></span>

                                        </div>

                                    </div>

                                </div>


                                <div className="home-visual-metrics">

                                    <div className="home-visual-metric">

                                        <span>
                                            Data
                                        </span>

                                        <strong>
                                            Clean
                                        </strong>

                                    </div>


                                    <div className="home-visual-metric">

                                        <span>
                                            Analysis
                                        </span>

                                        <strong>
                                            Focused
                                        </strong>

                                    </div>


                                    <div className="home-visual-metric">

                                        <span>
                                            Output
                                        </span>

                                        <strong>
                                            Actionable
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            <div className="home-floating-card home-floating-card-top">

                                <span className="home-floating-icon">
                                    ↗
                                </span>

                                <div>

                                    <small>
                                        Business Questions
                                    </small>

                                    <strong>
                                        → Insights
                                    </strong>

                                </div>

                            </div>


                            <div className="home-floating-card home-floating-card-bottom">

                                <span className="home-floating-number">
                                    01
                                </span>

                                <div>

                                    <small>
                                        Approach
                                    </small>

                                    <strong>
                                        Ask → Analyze → Act
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    QUICK INTRO
                ================================================= */}

                <section className="home-intro-strip">

                    <div className="home-container home-intro-grid">

                        <div className="home-intro-label">

                            <span>
                                01
                            </span>

                            <p>
                                A little about my work
                            </p>

                        </div>


                        <div className="home-intro-text">

                            <p>
                                Good analysis starts with the right
                                question. I focus on understanding the
                                business problem first, then using
                                structured data work, analysis, and
                                clear communication to turn that
                                question into something measurable.
                            </p>


                            <Link
                                to={`/${portfolioSlug}/about`}
                                className="home-inline-link"
                            >

                                Discover my approach

                                <span>
                                    ↗
                                </span>

                            </Link>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    FEATURED PROJECTS
                ================================================= */}

                <section className="home-projects-section">

                    <div className="home-container">

                        <div className="home-section-header">

                            <div>

                                <p className="home-section-eyebrow">
                                    Selected Work
                                </p>

                                <h2>

                                    Analysis that answers

                                    <span>
                                        {" "}real questions.
                                    </span>

                                </h2>

                            </div>


                            <Link
                                to={`/${portfolioSlug}/projects`}
                                className="home-section-link"
                            >

                                View all projects

                                <span>
                                    ↗
                                </span>

                            </Link>

                        </div>


                        {loadingProjects ? (

                            <div className="home-projects-loading">

                                <div className="home-loading-spinner"></div>

                                <p>
                                    Loading projects...
                                </p>

                            </div>

                        ) : projectsError ? (

                            <div className="home-projects-empty">

                                <p>
                                    {projectsError}
                                </p>

                            </div>

                        ) : featuredProjects.length === 0 ? (

                            <div className="home-projects-empty">

                                <p>
                                    Projects will appear here as
                                    they are added.
                                </p>

                                <Link
                                    to={`/${portfolioSlug}/projects`}
                                >
                                    Explore Projects →
                                </Link>

                            </div>

                        ) : (

                            <div className="home-project-grid">

                                {featuredProjects.map(
                                    (project, index) => {

                                        const image =
                                            getProjectImage(
                                                project
                                            );

                                        return (

                                            <Link
                                                key={project.id}
                                                to={`/${portfolioSlug}/projects/${project.id}`}
                                                className={`home-project-card ${
                                                    index === 0
                                                        ? "home-project-card-featured"
                                                        : ""
                                                }`}
                                            >

                                                <div className="home-project-image">

                                                    {image ? (

                                                        <img
                                                            src={image}
                                                            alt={
                                                                project.title
                                                            }
                                                        />

                                                    ) : (

                                                        <div className="home-project-image-placeholder">

                                                            <span>
                                                                DATA
                                                            </span>

                                                            <strong>
                                                                ANALYSIS
                                                            </strong>

                                                        </div>

                                                    )}


                                                    <div className="home-project-overlay">

                                                        <span>
                                                            View Project ↗
                                                        </span>

                                                    </div>


                                                    {project.category && (

                                                        <span className="home-project-category">

                                                            {
                                                                project.category
                                                            }

                                                        </span>

                                                    )}

                                                </div>


                                                <div className="home-project-content">

                                                    <div>

                                                        <span className="home-project-number">

                                                            {String(
                                                                index + 1
                                                            ).padStart(
                                                                2,
                                                                "0"
                                                            )}

                                                        </span>


                                                        <h3>
                                                            {
                                                                project.title
                                                            }
                                                        </h3>

                                                    </div>


                                                    <p>
                                                        {
                                                            project.shortDescription
                                                        }
                                                    </p>


                                                    <span className="home-project-arrow">
                                                        →
                                                    </span>

                                                </div>

                                            </Link>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================================
                    ANALYTICS PROCESS
                ================================================= */}

                <section className="home-process-section">

                    <div className="home-container">

                        <div className="home-section-header home-process-header">

                            <div>

                                <p className="home-section-eyebrow">
                                    How I Work
                                </p>

                                <h2>

                                    A structured path from

                                    <span>
                                        {" "}question to action.
                                    </span>

                                </h2>

                            </div>


                            <p className="home-section-description">

                                The tools may change from project to
                                project, but the goal remains the same:
                                understand the problem, work carefully
                                with the data, and communicate what it
                                means.

                            </p>

                        </div>


                        <div className="home-process-grid">

                            <article className="home-process-card">

                                <span>01</span>

                                <h3>
                                    Ask
                                </h3>

                                <p>
                                    Understand the business question
                                    and define what needs to be
                                    measured.
                                </p>

                            </article>


                            <article className="home-process-card">

                                <span>02</span>

                                <h3>
                                    Prepare
                                </h3>

                                <p>
                                    Gather, clean, structure, and
                                    validate the data before analysis.
                                </p>

                            </article>


                            <article className="home-process-card">

                                <span>03</span>

                                <h3>
                                    Analyze
                                </h3>

                                <p>
                                    Identify patterns, trends,
                                    relationships, and meaningful
                                    changes.
                                </p>

                            </article>


                            <article className="home-process-card">

                                <span>04</span>

                                <h3>
                                    Share
                                </h3>

                                <p>
                                    Present findings through clear
                                    dashboards, visuals, and concise
                                    explanations.
                                </p>

                            </article>


                            <article className="home-process-card">

                                <span>05</span>

                                <h3>
                                    Act
                                </h3>

                                <p>
                                    Translate insights into practical
                                    recommendations and next steps.
                                </p>

                            </article>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    EXPERIENCE + EDUCATION
                ================================================= */}

                <section className="home-background-section">

                    <div className="home-container">

                        <div className="home-section-header">

                            <div>

                                <p className="home-section-eyebrow">
                                    Background
                                </p>

                                <h2>

                                    Experience, education,

                                    <span>
                                        {" "}continuous growth.
                                    </span>

                                </h2>

                            </div>

                        </div>


                        <div className="home-background-grid">


                            {/* =================================================
                                EXPERIENCE
                            ================================================= */}

                            <div className="home-background-card">

                                <div className="home-background-card-header">

                                    <div>

                                        <span className="home-card-label">
                                            EXPERIENCE
                                        </span>

                                        <h3>
                                            Professional Experience
                                        </h3>

                                    </div>


                                    <Link
                                        to={`/${portfolioSlug}/experience`}
                                        className="home-card-link"
                                    >

                                        View all

                                        <span>
                                            ↗
                                        </span>

                                    </Link>

                                </div>


                                <div className="home-experience-list">

                                    {loadingExperience ? (

                                        <p className="home-muted-text">
                                            Loading experience...
                                        </p>

                                    ) : featuredExperience.length === 0 ? (

                                        <p className="home-muted-text">
                                            Professional experience
                                            will appear here.
                                        </p>

                                    ) : (

                                        featuredExperience.map(
                                            (item, index) => (

                                                <div
                                                    className="home-experience-item"
                                                    key={
                                                        item.id ||
                                                        index
                                                    }
                                                >

                                                    <span className="home-timeline-dot"></span>


                                                    <div>

                                                        <h4>
                                                            {item.jobTitle}
                                                        </h4>


                                                        <p>
                                                            {item.company}
                                                        </p>


                                                        {item.location && (

                                                            <small>
                                                                {item.location}
                                                            </small>

                                                        )}


                                                        {(item.startDate ||
                                                            item.endDate ||
                                                            item.isCurrent) && (

                                                            <small className="home-experience-date">

                                                                {formatYear(
                                                                    item.startDate
                                                                )}

                                                                {" — "}

                                                                {item.isCurrent
                                                                    ? "Present"
                                                                    : formatYear(
                                                                          item.endDate
                                                                      )}

                                                            </small>

                                                        )}

                                                    </div>

                                                </div>

                                            )
                                        )

                                    )}

                                </div>

                            </div>


                            {/* =================================================
                                EDUCATION
                            ================================================= */}

                            <div className="home-background-card">

                                <div className="home-background-card-header">

                                    <div>

                                        <span className="home-card-label">
                                            EDUCATION
                                        </span>

                                        <h3>
                                            Academic Background
                                        </h3>

                                    </div>


                                    <Link
                                        to={`/${portfolioSlug}/education`}
                                        className="home-card-link"
                                    >

                                        View all

                                        <span>
                                            ↗
                                        </span>

                                    </Link>

                                </div>


                                {loadingEducation ? (

                                    <p className="home-muted-text">
                                        Loading education...
                                    </p>

                                ) : featuredEducation.length === 0 ? (

                                    <p className="home-muted-text">
                                        Education information will
                                        appear here.
                                    </p>

                                ) : (

                                    <div className="home-education-preview">

                                        {featuredEducation.map(
                                            (item, index) => (

                                                <div
                                                    className="home-education-item"
                                                    key={
                                                        item.id ||
                                                        index
                                                    }
                                                >

                                                    <div className="home-education-icon">
                                                        ◫
                                                    </div>


                                                    <div>

                                                        <span>
                                                            {item.degree ||
                                                                item.qualification ||
                                                                "Education"}
                                                        </span>


                                                        <h4>
                                                            {item.fieldOfStudy ||
                                                                item.program ||
                                                                item.course ||
                                                                ""}
                                                        </h4>


                                                        <p>
                                                            {item.institution ||
                                                                item.school ||
                                                                item.university ||
                                                                ""}
                                                        </p>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}


                                <div className="home-education-note">

                                    <span>
                                        +
                                    </span>

                                    <p>
                                        Explore my academic journey,
                                        qualifications, and continued
                                        learning.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    TOOLS
                ================================================= */}

                <section className="home-tools-section">

                    <div className="home-container">

                        <div className="home-tools-layout">

                            <div>

                                <p className="home-section-eyebrow">
                                    Toolkit
                                </p>

                                <h2>

                                    The tools behind

                                    <span>
                                        {" "}the analysis.
                                    </span>

                                </h2>


                                <p className="home-tools-description">

                                    I use a combination of spreadsheet,
                                    database, visualization, and
                                    programming tools depending on the
                                    question the data needs to answer.

                                </p>


                                <Link
                                    to={`/${portfolioSlug}/about`}
                                    className="home-inline-link"
                                >

                                    See my capabilities

                                    <span>
                                        ↗
                                    </span>

                                </Link>

                            </div>


                            <div className="home-tools-grid">

                                <div className="home-tool-card">

                                    <span>01</span>

                                    <strong>
                                        Excel
                                    </strong>

                                    <small>
                                        Cleaning &amp; analysis
                                    </small>

                                </div>


                                <div className="home-tool-card">

                                    <span>02</span>

                                    <strong>
                                        SQL
                                    </strong>

                                    <small>
                                        Data querying
                                    </small>

                                </div>


                                <div className="home-tool-card">

                                    <span>03</span>

                                    <strong>
                                        Power BI
                                    </strong>

                                    <small>
                                        BI &amp; dashboards
                                    </small>

                                </div>


                                <div className="home-tool-card">

                                    <span>04</span>

                                    <strong>
                                        Python
                                    </strong>

                                    <small>
                                        Data analysis
                                    </small>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    FINAL CTA
                ================================================= */}

                <section className="home-cta-section">

                    <div className="home-container">

                        <div className="home-cta-card">

                            <div className="home-cta-content">

                                <p className="home-section-eyebrow">
                                    Let's work with the data
                                </p>


                                <h2>

                                    Have a question hidden
                                    somewhere in your data?

                                </h2>


                                <p>

                                    Let's turn it into something
                                    measurable, understandable, and
                                    useful.

                                </p>

                            </div>


                            <div className="home-cta-actions">

                                <Link
                                    to={`/${portfolioSlug}/projects`}
                                    className="home-cta-primary"
                                >

                                    Explore My Work

                                    <span>
                                        ↗
                                    </span>

                                </Link>


                                <Link
                                    to={`/${portfolioSlug}/about`}
                                    className="home-cta-secondary"
                                >

                                    Get to know me

                                    <span>
                                        →
                                    </span>

                                </Link>

                            </div>

                        </div>

                    </div>

                </section>

            </main>


            <Footer />

        </div>

    );
}

export default Home;