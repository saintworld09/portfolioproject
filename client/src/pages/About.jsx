import { useEffect, useState } from "react";
import {
    Link,
    useParams,
} from "react-router-dom";

import "../styles/About.css";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { API_BASE_URL } from "../config";

/*
 * =========================================================
 * IMAGE / FILE URL HELPER
 * =========================================================
 */

function getResourceUrl(resourceUrl) {
    if (!resourceUrl) {
        return null;
    }

    if (
        resourceUrl.startsWith("http://") ||
        resourceUrl.startsWith("https://")
    ) {
        return resourceUrl;
    }

    return `${API_BASE_URL}${resourceUrl}`;
}


/*
 * =========================================================
 * ICON COMPONENT
 * =========================================================
 */

function DynamicIcon({
    icon,
    type = "default",
}) {
    const normalizedIcon = String(icon || "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");

    const iconMap = {
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
                <path d="M8 11h6" />
                <path d="M11 8v6" />
            </>
        ),

        problem: (
            <>
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v5" />
                <path d="M12 16h.01" />
            </>
        ),

        target: (
            <>
                <circle cx="12" cy="12" r="8" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="12" cy="12" r="1" />
            </>
        ),

        data: (
            <>
                <path d="M4 19V5" />
                <path d="M4 19h16" />
                <path d="M7 15l4-4 3 2 5-6" />
            </>
        ),

        database: (
            <>
                <ellipse
                    cx="12"
                    cy="5"
                    rx="7"
                    ry="3"
                />
                <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
                <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
            </>
        ),

        clean: (
            <>
                <path d="M4 5h16v14H4z" />
                <path d="M8 9h8" />
                <path d="M8 13h5" />
                <path d="M8 16h8" />
            </>
        ),

        chart: (
            <>
                <path d="M4 19V5" />
                <path d="M4 19h16" />
                <path d="M7 15l4-4 3 2 5-6" />
            </>
        ),

        analysis: (
            <>
                <circle
                    cx="9"
                    cy="9"
                    r="4"
                />
                <path d="M15 15l5 5" />
                <path d="M14 14l4-4" />
            </>
        ),

        visualization: (
            <>
                <path d="M4 19V5" />
                <path d="M4 19h16" />
                <rect
                    x="7"
                    y="12"
                    width="2"
                    height="4"
                />
                <rect
                    x="11"
                    y="9"
                    width="2"
                    height="7"
                />
                <rect
                    x="15"
                    y="6"
                    width="2"
                    height="10"
                />
            </>
        ),

        insight: (
            <>
                <path d="M9 18h6" />
                <path d="M10 22h4" />
                <path d="M8 14c-1.2-1-2-2.5-2-4a6 6 0 1112 0c0 1.5-.8 3-2 4-1 .8-1.5 1.6-1.5 3h-5c0-1.4-.5-2.2-1.5-3z" />
            </>
        ),

        business: (
            <>
                <path d="M4 20V7h16v13" />
                <path d="M8 7V4h8v3" />
                <path d="M8 11h2" />
                <path d="M14 11h2" />
                <path d="M8 15h2" />
                <path d="M14 15h2" />
            </>
        ),

        finance: (
            <>
                <circle
                    cx="12"
                    cy="12"
                    r="8"
                />
                <path d="M12 7v10" />
                <path d="M15 9.5c-.7-.8-1.7-1.2-3-1.2-1.6 0-2.7.8-2.7 2s1.1 2 2.7 2 2.7.8 2.7 2-1.1 2-2.7 2c-1.3 0-2.3-.4-3-1.2" />
            </>
        ),

        healthcare: (
            <>
                <path d="M12 21s-7-4.5-7-10.5A4.5 4.5 0 0112 7a4.5 4.5 0 017 3.5C19 16.5 12 21 12 21z" />
                <path d="M12 9v6" />
                <path d="M9 12h6" />
            </>
        ),

        operations: (
            <>
                <circle
                    cx="12"
                    cy="12"
                    r="3"
                />
                <path d="M12 2v3" />
                <path d="M12 19v3" />
                <path d="M2 12h3" />
                <path d="M19 12h3" />
                <path d="M4.9 4.9l2.1 2.1" />
                <path d="M17 17l2.1 2.1" />
                <path d="M19.1 4.9L17 7" />
                <path d="M7 17l-2.1 2.1" />
            </>
        ),

        sales: (
            <>
                <path d="M4 19V5" />
                <path d="M4 19h16" />
                <path d="M7 15l3-4 3 2 4-6" />
            </>
        ),

        check: (
            <>
                <path d="M4 12l5 5L20 6" />
                <path d="M4 6h5" />
            </>
        ),

        recommendation: (
            <>
                <path d="M4 12l5 5L20 6" />
                <path d="M4 6h5" />
            </>
        ),
    };

    let iconContent =
        iconMap[normalizedIcon];

    if (!iconContent) {
        if (type === "process") {
            iconContent = (
                <>
                    <circle
                        cx="12"
                        cy="12"
                        r="8"
                    />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                </>
            );
        } else if (type === "skill") {
            iconContent = (
                <>
                    <path d="M5 4h14v16H5z" />
                    <path d="M8 8h8" />
                    <path d="M8 12h5" />
                    <path d="M8 16h8" />
                </>
            );
        } else {
            iconContent = (
                <>
                    <circle
                        cx="12"
                        cy="12"
                        r="8"
                    />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                </>
            );
        }
    }

    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="about-outline-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {iconContent}
        </svg>
    );
}


/*
 * =========================================================
 * SKILLS ICON HELPER
 * =========================================================
 */

function getTechnologyIcon(skill) {
    const value = `${skill?.name || ""} ${
        skill?.category || ""
    }`
        .trim()
        .toLowerCase();

    if (
        value.includes("sql") ||
        value.includes("database") ||
        value.includes("postgres") ||
        value.includes("mysql")
    ) {
        return "database";
    }

    if (
        value.includes("power bi") ||
        value.includes("powerbi") ||
        value.includes("dashboard") ||
        value.includes("visual")
    ) {
        return "visualization";
    }

    if (
        value.includes("excel") ||
        value.includes("spreadsheet")
    ) {
        return "chart";
    }

    if (
        value.includes("python") ||
        value.includes("programming") ||
        value.includes("coding")
    ) {
        return "data";
    }

    if (
        value.includes("analysis") ||
        value.includes("analytics")
    ) {
        return "analysis";
    }

    if (
        value.includes("business") ||
        value.includes("strategy")
    ) {
        return "business";
    }

    if (
        value.includes("finance") ||
        value.includes("financial")
    ) {
        return "finance";
    }

    if (
        value.includes("health") ||
        value.includes("healthcare")
    ) {
        return "healthcare";
    }

    if (
        value.includes("sales") ||
        value.includes("marketing")
    ) {
        return "sales";
    }

    if (
        value.includes("clean") ||
        value.includes("cleaning") ||
        value.includes("power query")
    ) {
        return "clean";
    }

    if (
        value.includes("insight") ||
        value.includes("report")
    ) {
        return "insight";
    }

    return "skill";
}


/*
 * =========================================================
 * SKILL PROFICIENCY LABEL
 * =========================================================
 */

function getProficiencyLabel(proficiency) {
    if (
        proficiency === null ||
        proficiency === undefined ||
        proficiency === ""
    ) {
        return "Not specified";
    }

    const value = Number(proficiency);

    if (Number.isNaN(value)) {
        return "Not specified";
    }

    if (value >= 90) {
        return "Expert";
    }

    if (value >= 75) {
        return "Advanced";
    }

    if (value >= 50) {
        return "Intermediate";
    }

    if (value >= 25) {
        return "Developing";
    }

    return "Beginner";
}


/*
 * =========================================================
 * SOCIAL LINK ICON HELPER
 * =========================================================
 */

function getSocialIcon(platform) {
    const normalizedPlatform = String(platform || "")
        .trim()
        .toLowerCase();

    const iconMap = {
        linkedin: (
            <>
                <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="3"
                />
                <path d="M8 10v6" />
                <path d="M8 7.5v.01" />
                <path d="M12 16v-3.5a2.5 2.5 0 015 0V16" />
                <path d="M12 10v6" />
            </>
        ),

        github: (
            <>
                <path d="M15 22v-3.3c0-1.1.4-1.8 1-2.2 3.3-.4 6.7-1.6 6.7-7.2 0-1.6-.6-2.9-1.6-4 .2-.4.7-2-.2-4 0 0-1.3-.4-4.1 1.5a14 14 0 00-7.5 0C6.5.9 5.2 1.3 5.2 1.3c-.9 2-.4 3.6-.2 4-1 1.1-1.6 2.4-1.6 4 0 5.6 3.4 6.8 6.7 7.2.6.4 1 .9 1 2.2V22" />
                <path d="M8.5 19c-3.5 1.5-3.5-1.5-5-2" />
            </>
        ),

        facebook: (
            <>
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                />
                <path d="M13.5 8.5h2V6h-2c-2.2 0-3.5 1.3-3.5 3.7V12H8v2.5h2.5V18H13v-3.5h2.2L15.5 12H13v-2c0-.9.2-1.5.5-1.5z" />
            </>
        ),

        instagram: (
            <>
                <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="4"
                />
                <circle
                    cx="12"
                    cy="12"
                    r="4"
                />
                <path d="M17.5 6.5h.01" />
            </>
        ),

        x: (
            <>
                <path d="M5 4l14 16" />
                <path d="M19 4L5 20" />
            </>
        ),

        youtube: (
            <>
                <rect
                    x="3"
                    y="6"
                    width="18"
                    height="12"
                    rx="3"
                />
                <path d="M10 9l5 3-5 3z" />
            </>
        ),

        whatsapp: (
            <>
                <path d="M20 11.5a8 8 0 01-11.8 7L4 20l1.5-4.1A8 8 0 1120 11.5z" />
                <path d="M9 8.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.7c.1.2.1.4 0 .6l-.6.8c.8 1.2 1.7 2 2.9 2.6l.8-.7c.2-.1.4-.2.6-.1l1.6.8c.3.1.4.3.4.6 0 .7-.3 1.4-.9 1.7" />
            </>
        ),

        tiktok: (
            <>
                <path d="M15 4v10.5a3.5 3.5 0 11-3.5-3.5" />
                <path d="M15 4c.5 2.2 1.7 3.6 4 4" />
            </>
        ),

        telegram: (
            <>
                <path d="M21 4L3 11l7 2 2 7 3-5 4 3z" />
                <path d="M10 13l5-5" />
            </>
        ),

        medium: (
            <>
                <circle
                    cx="8"
                    cy="12"
                    r="5"
                />
                <ellipse
                    cx="16"
                    cy="12"
                    rx="3"
                    ry="5"
                />
                <ellipse
                    cx="21"
                    cy="12"
                    rx="1.5"
                    ry="5"
                />
            </>
        ),

        behance: (
            <>
                <path d="M4 6h6a3 3 0 010 6H4z" />
                <path d="M4 12h6a3 3 0 010 6H4z" />
                <path d="M15 9h5" />
                <path d="M14 13h7a4 4 0 00-7 0z" />
                <path d="M14 13c0 3 1.5 5 4.5 5 1.5 0 2.5-.5 3.5-1.5" />
            </>
        ),

        dribbble: (
            <>
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                />
                <path d="M5 6.5c4 2.5 8.5 2.7 13.5 1" />
                <path d="M6 18c3.5-3.5 7.5-5 13-4" />
                <path d="M9 4c3 3 5 7 6 14" />
            </>
        ),

        link: (
            <>
                <path d="M10 13a5 5 0 007.1.1l2-2a5 5 0 00-7.1-7.1l-1.1 1.1" />
                <path d="M14 11a5 5 0 00-7.1-.1l-2 2A5 5 0 0012 20l1.1-1.1" />
            </>
        ),
    };

    return (
        iconMap[normalizedPlatform] ||
        iconMap.link
    );
}


/*
 * =========================================================
 * ABOUT PAGE
 * =========================================================
 */

function About() {

    /*
     * =========================================================
     * CURRENT PORTFOLIO
     * =========================================================
     */

    const { portfolioSlug } = useParams();


    /*
     * =========================================================
     * PAGE STATE
     * =========================================================
     */

    const [profile, setProfile] =
        useState(null);

    const [processItems, setProcessItems] =
        useState([]);

    const [skillItems, setSkillItems] =
        useState([]);

    const [focusItems, setFocusItems] =
        useState([]);

    const [technologyItems, setTechnologyItems] =
        useState([]);

    const [socialLinks, setSocialLinks] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /*
     * =========================================================
     * LOAD PUBLIC ABOUT DATA
     * =========================================================
     *
     * Every request is scoped to the current portfolio.
     *
     * IMPORTANT:
     *
     * Profile:
     * GET /api/profile/:portfolioSlug
     *
     * About:
     * GET /api/about?portfolioSlug=...
     *
     * Skills:
     * GET /api/skills?portfolioSlug=...
     *
     * Social Links:
     * GET /api/social-links?portfolioSlug=...
     *
     * =========================================================
     */

    useEffect(() => {

        /*
         * Do not make requests until the
         * portfolio slug exists.
         */

        if (!portfolioSlug) {
            return;
        }


        let cancelled = false;


        const fetchAboutData = async () => {

            try {

                /*
                 * -----------------------------------------------
                 * PROFILE
                 * -----------------------------------------------
                 */

                const profileResponse =
                    await fetch(
                        `${API_BASE_URL}/api/profile/${encodeURIComponent(
                            portfolioSlug
                        )}`
                    );


                const profileData =
                    await profileResponse
                        .json()
                        .catch(() => ({}));


                if (!profileResponse.ok) {

                    throw new Error(
                        profileData.message ||
                            "Failed to load profile."
                    );

                }


                const profileValue =
                    profileData.profile ||
                    profileData;


                if (
                    !profileValue ||
                    !profileValue.id
                ) {

                    throw new Error(
                        "Profile information was not found."
                    );

                }


                /*
                 * -----------------------------------------------
                 * ABOUT
                 * -----------------------------------------------
                 */

                let aboutValue = {};

                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/about?portfolioSlug=${encodeURIComponent(
                                portfolioSlug
                            )}`
                        );

                    const data =
                        await response
                            .json()
                            .catch(() => ({}));

                    if (response.ok) {

                        aboutValue =
                            data.data ||
                            data.about ||
                            data ||
                            {};

                    } else {

                        console.warn(
                            "About content could not be loaded:",
                            data.message ||
                                "Unknown error"
                        );

                    }

                } catch (aboutError) {

                    console.warn(
                        "About content request failed:",
                        aboutError
                    );

                }


                /*
                 * -----------------------------------------------
                 * SKILLS
                 * -----------------------------------------------
                 */

                let skillsData = [];

                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/skills?portfolioSlug=${encodeURIComponent(
                                portfolioSlug
                            )}`
                        );

                    const data =
                        await response
                            .json()
                            .catch(() => []);

                    if (response.ok) {

                        skillsData =
                            Array.isArray(data)
                                ? data
                                : Array.isArray(
                                      data?.skills
                                  )
                                ? data.skills
                                : [];

                    } else {

                        console.warn(
                            "Skills could not be loaded:",
                            data.message ||
                                "Unknown error"
                        );

                    }

                } catch (skillsError) {

                    console.warn(
                        "Skills request failed:",
                        skillsError
                    );

                }


                /*
                 * -----------------------------------------------
                 * SOCIAL LINKS
                 * -----------------------------------------------
                 */

                let socialLinksData = [];

                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/social-links?portfolioSlug=${encodeURIComponent(
                                portfolioSlug
                            )}`
                        );

                    const data =
                        await response
                            .json()
                            .catch(() => []);

                    if (response.ok) {

                        socialLinksData =
                            Array.isArray(data)
                                ? data
                                : Array.isArray(
                                      data?.socialLinks
                                  )
                                ? data.socialLinks
                                : [];

                    } else {

                        console.warn(
                            "Social links could not be loaded:",
                            data.message ||
                                "Unknown error"
                        );

                    }

                } catch (socialError) {

                    console.warn(
                        "Social links request failed:",
                        socialError
                    );

                }


                /*
                 * -----------------------------------------------
                 * PREPARE ABOUT DATA
                 * -----------------------------------------------
                 */

                const processValue =
                    aboutValue.process ||
                    aboutValue.processItems ||
                    [];

                const skillsValue =
                    aboutValue.skills ||
                    aboutValue.skillItems ||
                    [];

                const focusValue =
                    aboutValue.focus ||
                    aboutValue.focusItems ||
                    [];


                /*
                 * -----------------------------------------------
                 * SORT SOCIAL LINKS
                 * -----------------------------------------------
                 */

                const sortedSocialLinks =
                    Array.isArray(
                        socialLinksData
                    )
                        ? [
                              ...socialLinksData,
                          ].sort(
                              (a, b) =>
                                  Number(
                                      a.sortOrder ||
                                          0
                                  ) -
                                  Number(
                                      b.sortOrder ||
                                          0
                                  )
                          )
                        : [];


                /*
                 * -----------------------------------------------
                 * UPDATE STATE
                 * -----------------------------------------------
                 */

                if (cancelled) {
                    return;
                }

                setProfile(profileValue);

                setProcessItems(
                    Array.isArray(
                        processValue
                    )
                        ? processValue
                        : []
                );

                setSkillItems(
                    Array.isArray(
                        skillsValue
                    )
                        ? skillsValue
                        : []
                );

                setFocusItems(
                    Array.isArray(
                        focusValue
                    )
                        ? focusValue
                        : []
                );

                setTechnologyItems(
                    Array.isArray(
                        skillsData
                    )
                        ? skillsData
                        : []
                );

                setSocialLinks(
                    sortedSocialLinks
                );

                setError("");

            } catch (fetchError) {

                console.error(
                    "Error loading About page:",
                    fetchError
                );

                if (!cancelled) {

                    setError(
                        fetchError.message ||
                            "Failed to load About page."
                    );

                    setProfile(null);
                    setProcessItems([]);
                    setSkillItems([]);
                    setFocusItems([]);
                    setTechnologyItems([]);
                    setSocialLinks([]);

                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }

        };


        fetchAboutData();


        return () => {
            cancelled = true;
        };

    }, [portfolioSlug]);


    /*
     * =========================================================
     * LOADING STATE
     * =========================================================
     */

    if (loading) {

        return (
            <div className="about-page">

                <Header />

                <main>

                    <div className="about-loading">

                        <div className="about-loading-spinner" />

                        <p>
                            Loading About page...
                        </p>

                    </div>

                </main>

                <Footer />

            </div>
        );

    }


    /*
     * =========================================================
     * ERROR STATE
     * =========================================================
     */

    if (error || !profile) {

        return (
            <div className="about-page">

                <Header />

                <main>

                    <div className="about-error">

                        <span>
                            ABOUT ME
                        </span>

                        <h1>
                            Something went wrong
                        </h1>

                        <p>
                            {error ||
                                "Profile information is not available."}
                        </p>

                        <Link
                            to={
                                portfolioSlug
                                    ? `/${portfolioSlug}`
                                    : "/"
                            }
                        >
                            Return Home →
                        </Link>

                    </div>

                </main>

                <Footer />

            </div>
        );

    }


    /*
     * =========================================================
     * PROFILE VALUES
     * =========================================================
     */

    const fullName =
        profile.fullName || "";

    const headline =
        profile.headline || "";

    const bio =
        profile.bio || "";

    const location =
        profile.location || "";

    const email =
        profile.email || "";

    const phone =
        profile.phone || "";

    const linkedinUrl =
        profile.linkedinUrl || "";

    const profileImage =
        getResourceUrl(
            profile.profileImage
        );

    const resumeUrl =
        getResourceUrl(
            profile.resumeUrl
        );


    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (

        <div className="about-page">

            <Header />

            <main>

                {/* =====================================================
                    1. HERO / ABOUT INTRODUCTION
                ===================================================== */}

                <section className="about-hero">

                    <div className="about-hero-container">

                        {/* =========================================
                            LEFT SIDE
                        ========================================= */}

                        <div className="about-hero-content">

                            <span className="about-eyebrow">
                                ABOUT ME
                            </span>


                            <h1 className="about-hero-title">
                                {fullName ||
                                    "About Me"}
                            </h1>


                            {headline && (
                                <p className="about-hero-role">
                                    {headline}
                                </p>
                            )}


                            {bio && (
                                <p className="about-hero-description">
                                    {bio}
                                </p>
                            )}


                            {/* =========================================
                                PROFILE CONTACT INFORMATION
                            ========================================= */}

                            {(location ||
                                email ||
                                phone ||
                                linkedinUrl) && (

                                <div className="about-profile-meta">

                                    {location && (
                                        <div className="about-profile-meta-item">

                                            <span>
                                                Location
                                            </span>

                                            <strong>
                                                {location}
                                            </strong>

                                        </div>
                                    )}


                                    {email && (
                                        <div className="about-profile-meta-item">

                                            <span>
                                                Email
                                            </span>

                                            <a
                                                href={`mailto:${email}`}
                                            >
                                                {email}
                                            </a>

                                        </div>
                                    )}


                                    {phone && (
                                        <div className="about-profile-meta-item">

                                            <span>
                                                Phone
                                            </span>

                                            <a
                                                href={`tel:${phone}`}
                                            >
                                                {phone}
                                            </a>

                                        </div>
                                    )}


                                    {linkedinUrl && (
                                        <div className="about-profile-meta-item">

                                            <span>
                                                LinkedIn
                                            </span>

                                            <a
                                                href={
                                                    linkedinUrl
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View Profile
                                            </a>

                                        </div>
                                    )}

                                </div>
                            )}


                            {/* =========================================
                                SOCIAL LINKS
                            ========================================= */}

                            {socialLinks.length > 0 && (

                                <div className="about-social-links">

                                    <div className="about-social-links-heading">

                                        <span>
                                            FIND ME ONLINE
                                        </span>

                                    </div>


                                    <div className="about-social-links-list">

                                        {socialLinks.map(
                                            (
                                                socialLink,
                                                index
                                            ) => (

                                                <a
                                                    key={
                                                        socialLink.id ||
                                                        index
                                                    }
                                                    href={
                                                        socialLink.url
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="about-social-link"
                                                    aria-label={`Visit ${socialLink.platform}`}
                                                    title={
                                                        socialLink.platform
                                                    }
                                                >

                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        aria-hidden="true"
                                                        className="about-social-link-icon"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.7"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >

                                                        {getSocialIcon(
                                                            socialLink.platform
                                                        )}

                                                    </svg>


                                                    <span className="about-social-link-name">
                                                        {
                                                            socialLink.platform
                                                        }
                                                    </span>


                                                    <span
                                                        className="about-social-link-arrow"
                                                        aria-hidden="true"
                                                    >
                                                        ↗
                                                    </span>

                                                </a>

                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                        </div>


                        {/* =========================================
                            RIGHT SIDE
                        ========================================= */}

                        <div className="about-hero-visual">

                            <div className="about-photo-frame">

                                <div
                                    className="about-photo-grid"
                                    aria-hidden="true"
                                />


                                {profileImage ? (

                                    <img
                                        src={
                                            profileImage
                                        }
                                        alt={
                                            fullName ||
                                            "Profile"
                                        }
                                        className="about-hero-image"
                                    />

                                ) : (

                                    <div className="about-photo-placeholder">

                                        {fullName
                                            ?.charAt(
                                                0
                                            )
                                            .toUpperCase() ||
                                            "A"}

                                    </div>

                                )}


                                <div
                                    className="about-photo-chart"
                                    aria-hidden="true"
                                >

                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                    <span />

                                </div>

                            </div>


                            <div className="about-hero-statement">

                                <span>
                                    Better questions.
                                </span>

                                <span>
                                    Cleaner data.
                                </span>

                                <strong>
                                    Smarter decisions.
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    2. HOW I WORK
                ===================================================== */}

                {processItems.length > 0 && (

                    <section className="about-process">

                        <div className="about-section-container">

                            <div className="about-section-heading">

                                <span className="about-section-eyebrow">
                                    PROCESS
                                </span>

                                <h2>
                                    How I work
                                </h2>

                                <p>
                                    A simple, repeatable
                                    process from problem
                                    to recommendation.
                                </p>

                            </div>


                            <div className="about-process-grid">

                                {processItems.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <div
                                            className="about-process-item"
                                            key={
                                                item.id ||
                                                item._id ||
                                                index
                                            }
                                        >

                                            <div className="about-process-icon">

                                                <DynamicIcon
                                                    icon={
                                                        item.icon
                                                    }
                                                    type="process"
                                                />

                                            </div>


                                            <div className="about-process-number">

                                                {String(
                                                    item.stepNumber ||
                                                        index +
                                                            1
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}

                                            </div>


                                            <h3>
                                                {
                                                    item.title
                                                }
                                            </h3>


                                            <p>
                                                {
                                                    item.description
                                                }
                                            </p>


                                            {index <
                                                processItems.length -
                                                    1 && (

                                                <div
                                                    className="about-process-arrow"
                                                    aria-hidden="true"
                                                >
                                                    →
                                                </div>

                                            )}

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    </section>
                )}


                {/* =====================================================
                    3. WHAT I BRING
                ===================================================== */}

                {skillItems.length > 0 && (

                    <section className="about-skills">

                        <div className="about-section-container">

                            <div className="about-section-heading">

                                <span className="about-section-eyebrow">
                                    CAPABILITIES
                                </span>

                                <h2>
                                    What I bring
                                </h2>

                                <p>
                                    The skills and mindset
                                    I use to create
                                    reliable,
                                    business-focused
                                    analytics.
                                </p>

                            </div>


                            <div className="about-skills-grid">

                                {skillItems.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <article
                                            className="about-skill-card"
                                            key={
                                                item.id ||
                                                item._id ||
                                                index
                                            }
                                        >

                                            <div className="about-card-icon">

                                                <DynamicIcon
                                                    icon={
                                                        item.icon
                                                    }
                                                    type="skill"
                                                />

                                            </div>


                                            <div className="about-card-content">

                                                <h3>
                                                    {
                                                        item.title
                                                    }
                                                </h3>

                                                <p>
                                                    {
                                                        item.description
                                                    }
                                                </p>

                                            </div>

                                        </article>

                                    )
                                )}

                            </div>

                        </div>

                    </section>
                )}


                {/* =====================================================
                    4. TOOLS & TECHNOLOGIES
                ===================================================== */}

                {technologyItems.length > 0 && (

                    <section className="about-technologies">

                        <div className="about-section-container">

                            <div className="about-section-heading">

                                <span className="about-section-eyebrow">
                                    TOOLS & TECHNOLOGIES
                                </span>

                                <h2>
                                    Tools & Technologies
                                </h2>

                                <p>
                                    The tools I use to
                                    analyze data, build
                                    dashboards, and turn
                                    business questions
                                    into actionable
                                    insights.
                                </p>

                            </div>


                            <div className="about-technologies-grid">

                                {technologyItems.map(
                                    (
                                        skill,
                                        index
                                    ) => {

                                        const hasProficiency =
                                            skill.proficiency !==
                                                null &&
                                            skill.proficiency !==
                                                undefined &&
                                            skill.proficiency !==
                                                "";

                                        const proficiency =
                                            hasProficiency
                                                ? Math.min(
                                                      100,
                                                      Math.max(
                                                          0,
                                                          Number(
                                                              skill.proficiency
                                                          )
                                                      )
                                                  )
                                                : null;

                                        const proficiencyLabel =
                                            getProficiencyLabel(
                                                skill.proficiency
                                            );

                                        return (

                                            <article
                                                className="about-technology-card"
                                                key={
                                                    skill.id ||
                                                    index
                                                }
                                            >

                                                <div className="about-technology-icon">

                                                    <DynamicIcon
                                                        icon={getTechnologyIcon(
                                                            skill
                                                        )}
                                                        type="skill"
                                                    />

                                                </div>


                                                <div className="about-technology-content">

                                                    <div className="about-technology-heading">

                                                        <h3>
                                                            {
                                                                skill.name
                                                            }
                                                        </h3>


                                                        {skill.category && (

                                                            <span className="about-technology-category">

                                                                {
                                                                    skill.category
                                                                }

                                                            </span>

                                                        )}

                                                    </div>


                                                    {hasProficiency && (

                                                        <div className="about-technology-proficiency">

                                                            <div className="about-technology-proficiency-header">

                                                                <span>
                                                                    {
                                                                        proficiencyLabel
                                                                    }
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        proficiency
                                                                    }
                                                                    %
                                                                </strong>

                                                            </div>


                                                            <div className="about-technology-progress">

                                                                <span
                                                                    style={{
                                                                        width: `${proficiency}%`,
                                                                    }}
                                                                />

                                                            </div>

                                                        </div>

                                                    )}

                                                </div>

                                            </article>

                                        );

                                    }
                                )}

                            </div>

                        </div>

                    </section>
                )}


                {/* =====================================================
                    5. SELECTED FOCUS
                ===================================================== */}

                {focusItems.length > 0 && (

                    <section className="about-focus">

                        <div className="about-section-container">

                            <div className="about-section-heading">

                                <span className="about-section-eyebrow">
                                    AREAS OF FOCUS
                                </span>

                                <h2>
                                    Selected focus
                                </h2>

                                <p>
                                    Areas I work on based
                                    on real-world
                                    business needs.
                                </p>

                            </div>


                            <div className="about-focus-grid">

                                {focusItems.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <article
                                            className="about-focus-card"
                                            key={
                                                item.id ||
                                                item._id ||
                                                index
                                            }
                                        >

                                            <div className="about-focus-card-top">

                                                <span className="about-focus-number">

                                                    {String(
                                                        index +
                                                            1
                                                    ).padStart(
                                                        2,
                                                        "0"
                                                    )}

                                                </span>


                                                <div className="about-focus-icon">

                                                    <DynamicIcon
                                                        icon={
                                                            item.icon
                                                        }
                                                        type="focus"
                                                    />

                                                </div>

                                            </div>


                                            <h3>
                                                {
                                                    item.title
                                                }
                                            </h3>


                                            <p>
                                                {
                                                    item.description
                                                }
                                            </p>


                                            <div className="about-focus-line" />

                                        </article>

                                    )
                                )}

                            </div>

                        </div>

                    </section>
                )}


                {/* =====================================================
                    6. FINAL CTA
                ===================================================== */}

                <section className="about-cta">

                    <div
                        className="about-data-pattern"
                        aria-hidden="true"
                    >

                        <span className="about-pattern-grid" />

                        <svg
                            className="about-pattern-chart"
                            viewBox="0 0 400 160"
                            preserveAspectRatio="none"
                        >

                            <path
                                d="M0 125 C45 118, 55 90, 95 100 S145 120, 180 82 S235 90, 265 55 S320 70, 350 35 S380 40, 400 15"
                            />

                            <path
                                d="M0 145 C55 135, 75 130, 120 120 S190 135, 220 105 S285 115, 325 85 S370 90, 400 65"
                            />

                        </svg>

                    </div>


                    <div className="about-cta-content">

                        <span className="about-cta-eyebrow">
                            LET'S WORK WITH THE DATA
                        </span>


                        <h2>
                            Have a business
                            question hiding in
                            your data?
                        </h2>


                        <p>
                            Let’s turn it into
                            insights.
                        </p>


                        <div className="about-cta-actions">

                            <Link
                                to={
                                    portfolioSlug
                                        ? `/${portfolioSlug}/projects`
                                        : "/projects"
                                }
                                className="about-cta-primary"
                            >
                                View Case Studies

                                <span>
                                    →
                                </span>

                            </Link>


                            {resumeUrl && (

                                <a
                                    href={
                                        resumeUrl
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="about-cta-secondary"
                                >
                                    Download Résumé
                                </a>

                            )}

                        </div>

                    </div>

                </section>

            </main>


            <Footer />

        </div>
    );
}

export default About;