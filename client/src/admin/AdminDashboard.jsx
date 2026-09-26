import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/AdminDashboard.css";

import { API_BASE_URL } from "../config";

function AdminDashboard() {
    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const token =
        localStorage.getItem("token");

    const [dashboardData, setDashboardData] =
        useState({
            projects: [],
            experiences: [],
            skills: [],
            education: [],
            certifications: [],
        });

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    /* =========================================================
       LOGOUT
    ========================================================= */

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href =
            "/admin/login";
    };

    /* =========================================================
       LOAD DASHBOARD DATA
    ========================================================= */

    useEffect(() => {
        let cancelled = false;

        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                /* -------------------------------------------------
                   Authentication check
                ------------------------------------------------- */

                if (!token) {
                    throw new Error(
                        "You are not authenticated. Please log in again."
                    );
                }

                /* -------------------------------------------------
                   Authentication headers
                ------------------------------------------------- */

                const authHeaders = {
                    Authorization: `Bearer ${token}`,
                };

                /* -------------------------------------------------
                   Request all dashboard data

                   IMPORTANT:
                   Projects uses the authenticated project endpoint.

                   Experience, Skills, Education and Certifications
                   use their authenticated /me endpoints so the
                   dashboard only receives the current admin's data.
                ------------------------------------------------- */

                const [
                    projectsResponse,
                    experiencesResponse,
                    skillsResponse,
                    educationResponse,
                    certificationsResponse,
                ] = await Promise.all([
                    fetch(
                        `${API_BASE_URL}/api/projects`,
                        {
                            method: "GET",
                            headers: authHeaders,
                        }
                    ),

                    fetch(
                        `${API_BASE_URL}/api/experiences/me`,
                        {
                            method: "GET",
                            headers: authHeaders,
                        }
                    ),

                    fetch(
                        `${API_BASE_URL}/api/skills/me`,
                        {
                            method: "GET",
                            headers: authHeaders,
                        }
                    ),

                    fetch(
                        `${API_BASE_URL}/api/education/me`,
                        {
                            method: "GET",
                            headers: authHeaders,
                        }
                    ),

                    fetch(
                        `${API_BASE_URL}/api/certifications/me`,
                        {
                            method: "GET",
                            headers: authHeaders,
                        }
                    ),
                ]);

                /* =================================================
                   CHECK PROJECT RESPONSE
                ================================================= */

                if (!projectsResponse.ok) {
                    const responseText =
                        await projectsResponse.text();

                    console.error(
                        "Projects API error:",
                        projectsResponse.status,
                        responseText
                    );

                    if (
                        projectsResponse.status ===
                        401
                    ) {
                        throw new Error(
                            "Your session has expired. Please log in again."
                        );
                    }

                    if (
                        projectsResponse.status ===
                        403
                    ) {
                        throw new Error(
                            "You do not have permission to view projects."
                        );
                    }

                    throw new Error(
                        `Failed to load projects. Server returned ${projectsResponse.status}.`
                    );
                }

                /* =================================================
                   CHECK EXPERIENCE RESPONSE
                ================================================= */

                if (!experiencesResponse.ok) {
                    const responseText =
                        await experiencesResponse.text();

                    console.error(
                        "Experience API error:",
                        experiencesResponse.status,
                        responseText
                    );

                    if (
                        experiencesResponse.status ===
                        401
                    ) {
                        throw new Error(
                            "Your session has expired. Please log in again."
                        );
                    }

                    if (
                        experiencesResponse.status ===
                        403
                    ) {
                        throw new Error(
                            "You do not have permission to view experience."
                        );
                    }

                    throw new Error(
                        `Failed to load experience. Server returned ${experiencesResponse.status}.`
                    );
                }

                /* =================================================
                   CHECK SKILLS RESPONSE
                ================================================= */

                if (!skillsResponse.ok) {
                    const responseText =
                        await skillsResponse.text();

                    console.error(
                        "Skills API error:",
                        skillsResponse.status,
                        responseText
                    );

                    if (
                        skillsResponse.status ===
                        401
                    ) {
                        throw new Error(
                            "Your session has expired. Please log in again."
                        );
                    }

                    if (
                        skillsResponse.status ===
                        403
                    ) {
                        throw new Error(
                            "You do not have permission to view skills."
                        );
                    }

                    throw new Error(
                        `Failed to load skills. Server returned ${skillsResponse.status}.`
                    );
                }

                /* =================================================
                   CHECK EDUCATION RESPONSE
                ================================================= */

                if (!educationResponse.ok) {
                    const responseText =
                        await educationResponse.text();

                    console.error(
                        "Education API error:",
                        educationResponse.status,
                        responseText
                    );

                    if (
                        educationResponse.status ===
                        401
                    ) {
                        throw new Error(
                            "Your session has expired. Please log in again."
                        );
                    }

                    if (
                        educationResponse.status ===
                        403
                    ) {
                        throw new Error(
                            "You do not have permission to view education."
                        );
                    }

                    throw new Error(
                        `Failed to load education. Server returned ${educationResponse.status}.`
                    );
                }

                /* =================================================
                   CHECK CERTIFICATIONS RESPONSE
                ================================================= */

                if (
                    !certificationsResponse.ok
                ) {
                    const responseText =
                        await certificationsResponse.text();

                    console.error(
                        "Certifications API error:",
                        certificationsResponse.status,
                        responseText
                    );

                    if (
                        certificationsResponse.status ===
                        401
                    ) {
                        throw new Error(
                            "Your session has expired. Please log in again."
                        );
                    }

                    if (
                        certificationsResponse.status ===
                        403
                    ) {
                        throw new Error(
                            "You do not have permission to view certifications."
                        );
                    }

                    throw new Error(
                        `Failed to load certifications. Server returned ${certificationsResponse.status}.`
                    );
                }

                /* =================================================
                   CONVERT RESPONSES TO JSON
                ================================================= */

                const projects =
                    await projectsResponse.json();

                const experiences =
                    await experiencesResponse.json();

                const skills =
                    await skillsResponse.json();

                const education =
                    await educationResponse.json();

                const certifications =
                    await certificationsResponse.json();

                /* =================================================
                   UPDATE DASHBOARD STATE
                ================================================= */

                if (!cancelled) {
                    setDashboardData({
                        projects:
                            Array.isArray(
                                projects
                            )
                                ? projects
                                : [],

                        experiences:
                            Array.isArray(
                                experiences
                            )
                                ? experiences
                                : [],

                        skills:
                            Array.isArray(
                                skills
                            )
                                ? skills
                                : [],

                        education:
                            Array.isArray(
                                education
                            )
                                ? education
                                : [],

                        certifications:
                            Array.isArray(
                                certifications
                            )
                                ? certifications
                                : [],
                    });

                    setLoading(false);
                }
            } catch (error) {
                console.error(
                    "Error loading dashboard data:",
                    error
                );

                if (!cancelled) {
                    setError(
                        error.message ||
                            "Failed to load dashboard data."
                    );

                    setLoading(false);
                }
            }
        };

        loadDashboardData();

        return () => {
            cancelled = true;
        };
    }, [token]);

    /* =========================================================
       COUNTS
    ========================================================= */

    const projectCount =
        dashboardData.projects.length;

    const experienceCount =
        dashboardData.experiences.length;

    const skillCount =
        dashboardData.skills.length;

    const educationCount =
        dashboardData.education.length;

    const certificationCount =
        dashboardData.certifications.length;

    /* =========================================================
       RECENT PORTFOLIO CONTENT
    ========================================================= */

    const recentContent = [];

    /* ---------------------------------------------------------
       PROJECTS
    --------------------------------------------------------- */

    dashboardData.projects.forEach(
        (project) => {
            recentContent.push({
                id: `project-${project.id}`,

                title:
                    project.title ||
                    project.name ||
                    "Untitled Project",

                type: "Project",

                date:
                    project.createdAt ||
                    project.updatedAt ||
                    null,
            });
        }
    );

    /* ---------------------------------------------------------
       EXPERIENCE
    --------------------------------------------------------- */

    dashboardData.experiences.forEach(
        (experience) => {
            recentContent.push({
                id: `experience-${experience.id}`,

                title:
                    experience.jobTitle ||
                    "Untitled Position",

                type: "Experience",

                date:
                    experience.createdAt ||
                    experience.updatedAt ||
                    experience.startDate ||
                    null,
            });
        }
    );

    /* ---------------------------------------------------------
       EDUCATION
    --------------------------------------------------------- */

    dashboardData.education.forEach(
        (education) => {
            recentContent.push({
                id: `education-${education.id}`,

                title:
                    education.degree ||
                    education.institution ||
                    "Education Record",

                type: "Education",

                date:
                    education.createdAt ||
                    education.updatedAt ||
                    education.startDate ||
                    null,
            });
        }
    );

    /* ---------------------------------------------------------
       CERTIFICATIONS
    --------------------------------------------------------- */

    dashboardData.certifications.forEach(
        (certification) => {
            recentContent.push({
                id: `certification-${certification.id}`,

                title:
                    certification.name ||
                    "Certification",

                type: "Certification",

                date:
                    certification.createdAt ||
                    certification.updatedAt ||
                    certification.issueDate ||
                    null,
            });
        }
    );

    /* =========================================================
       SORT MOST RECENT FIRST
    ========================================================= */

    recentContent.sort((a, b) => {
        if (!a.date && !b.date) {
            return 0;
        }

        if (!a.date) {
            return 1;
        }

        if (!b.date) {
            return -1;
        }

        return (
            new Date(b.date) -
            new Date(a.date)
        );
    });

    const displayedRecentContent =
        recentContent.slice(0, 5);

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="admin-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="admin-sidebar">

                <div className="sidebar-logo">

                    <h2>
                        Portfolio
                    </h2>

                    <p>
                        Admin Panel
                    </p>

                </div>

                <nav className="sidebar-nav">

                    <Link
                        to="/admin/dashboard"
                        className="nav-item active"
                    >
                        Dashboard
                    </Link>

                    <Link
                        to="/admin/profile"
                        className="nav-item"
                    >
                        Profile
                    </Link>

                    <Link
                        to="/admin/about"
                        className="nav-item"
                    >
                        About
                    </Link>

                    <Link
                        to="/admin/projects"
                        className="nav-item"
                    >
                        Projects
                    </Link>

                    <Link
                        to="/admin/project-insights"
                        className="nav-item"
                    >
                        Projects Insights
                    </Link>

                    <Link
                        to="/admin/experience"
                        className="nav-item"
                    >
                        Experience
                    </Link>

                    <Link
                        to="/admin/education"
                        className="nav-item"
                    >
                        Education
                    </Link>

                    <Link
                        to="/admin/skills"
                        className="nav-item"
                    >
                        Skills
                    </Link>

                    <Link
                        to="/admin/certifications"
                        className="nav-item"
                    >
                        Certifications
                    </Link>

                    <Link
                        to="/admin/social-links"
                        className="nav-item"
                    >
                        Social Links
                    </Link>

                </nav>

                <div className="sidebar-bottom">

                    <Link
                        to="/admin/settings"
                        className="nav-item"
                    >
                        Settings
                    </Link>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </aside>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="admin-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="admin-header">

                    <div>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Welcome back,{" "}
                            {user?.name ||
                                "Admin"}
                        </p>

                    </div>

                    <div className="admin-user">

                        <span>
                            {user?.name ||
                                "Admin"}
                        </span>

                        <small>
                            {user?.role ||
                                "ADMIN"}
                        </small>

                    </div>

                </header>

                {/* =================================================
                    DASHBOARD CONTENT
                ================================================= */}

                <section className="dashboard-content">

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div
                            className="dashboard-error"
                        >
                            <strong>
                                Dashboard Error
                            </strong>

                            <p>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* =================================================
                        WELCOME CARD
                    ================================================= */}

                    <div className="welcome-card">

                        <h2>
                            Welcome to your
                            Portfolio Admin
                            Panel
                        </h2>

                        <p>
                            Manage your portfolio
                            content, projects,
                            experience, skills,
                            education,
                            certifications, and
                            other professional
                            information from here.
                        </p>

                    </div>

                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <div className="stats-grid">

                        {/* PROJECTS */}

                        <div className="stat-card">

                            <span>
                                Projects
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : projectCount}
                            </strong>

                        </div>

                        {/* EXPERIENCE */}

                        <div className="stat-card">

                            <span>
                                Experience
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : experienceCount}
                            </strong>

                        </div>

                        {/* SKILLS */}

                        <div className="stat-card">

                            <span>
                                Skills
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : skillCount}
                            </strong>

                        </div>

                        {/* EDUCATION */}

                        <div className="stat-card">

                            <span>
                                Education
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : educationCount}
                            </strong>

                        </div>

                        {/* CERTIFICATIONS */}

                        <div className="stat-card">

                            <span>
                                Certifications
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : certificationCount}
                            </strong>

                        </div>

                    </div>

                    {/* =================================================
                        QUICK ACTIONS
                    ================================================= */}

                    <div className="dashboard-section">

                        <div className="section-header">

                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Manage your
                                portfolio content
                            </p>

                        </div>

                        <div className="quick-actions">

                            <Link
                                to="/admin/projects"
                                className="quick-action-button"
                            >
                                Add Project
                            </Link>

                            <Link
                                to="/admin/profile"
                                className="quick-action-button"
                            >
                                Update Profile
                            </Link>

                            <Link
                                to="/admin/experience"
                                className="quick-action-button"
                            >
                                Add Experience
                            </Link>

                            <Link
                                to="/admin/skills"
                                className="quick-action-button"
                            >
                                Manage Skills
                            </Link>

                            <Link
                                to="/admin/certifications"
                                className="quick-action-button"
                            >
                                Add Certification
                            </Link>

                        </div>

                    </div>

                    {/* =================================================
                        RECENT PORTFOLIO CONTENT
                    ================================================= */}

                    <div className="dashboard-section">

                        <div className="section-header">

                            <h2>
                                Recent Portfolio
                                Content
                            </h2>

                            <p>
                                Your latest portfolio
                                information
                            </p>

                        </div>

                        {loading ? (

                            <div className="dashboard-loading">

                                <div className="dashboard-spinner" />

                                <p>
                                    Loading recent
                                    content...
                                </p>

                            </div>

                        ) : displayedRecentContent.length ===
                          0 ? (

                            <div className="dashboard-empty">

                                <strong>
                                    No portfolio
                                    content yet
                                </strong>

                                <p>
                                    Add your first
                                    project,
                                    experience,
                                    education, or
                                    certification.
                                </p>

                            </div>

                        ) : (

                            <div className="activity-list">

                                {displayedRecentContent.map(
                                    (item) => (
                                        <div
                                            className="activity-item"
                                            key={
                                                item.id
                                            }
                                        >

                                            <strong>
                                                {
                                                    item.title
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    item.type
                                                }
                                            </span>

                                        </div>
                                    )
                                )}

                            </div>

                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;