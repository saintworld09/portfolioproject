import { useEffect, useState } from "react";
import {
    NavLink,
    useParams,
} from "react-router-dom";
import "./Footer.css";

const API_BASE_URL = "http://localhost:5000";


/*
 * =========================================================
 * GET INITIALS FROM FULL NAME
 * =========================================================
 */

function getInitials(name) {
    if (!name) {
        return "AB";
    }

    const words = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 1) {
        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}


/*
 * =========================================================
 * NORMALIZE SOCIAL LINK URL
 * =========================================================
 *
 * Ensures URLs entered without http:// or https://
 * still work correctly.
 *
 * Examples:
 *
 * github.com/user
 *        ↓
 * https://github.com/user
 *
 * https://github.com/user
 *        ↓
 * remains unchanged
 *
 * mailto:example@email.com
 *        ↓
 * remains unchanged
 * =========================================================
 */

function normalizeSocialUrl(url) {
    if (!url || typeof url !== "string") {
        return "#";
    }

    const trimmedUrl = url.trim();

    if (
        trimmedUrl.startsWith("http://") ||
        trimmedUrl.startsWith("https://") ||
        trimmedUrl.startsWith("mailto:") ||
        trimmedUrl.startsWith("tel:") ||
        trimmedUrl.startsWith("whatsapp:")
    ) {
        return trimmedUrl;
    }

    return `https://${trimmedUrl}`;
}


/*
 * =========================================================
 * DETERMINE WHETHER LINK SHOULD OPEN IN NEW TAB
 * =========================================================
 */

function shouldOpenInNewTab(url) {
    if (!url || typeof url !== "string") {
        return false;
    }

    const trimmedUrl = url.trim().toLowerCase();

    return (
        trimmedUrl.startsWith("http://") ||
        trimmedUrl.startsWith("https://")
    );
}


/*
 * =========================================================
 * FOOTER COMPONENT
 * =========================================================
 */

function Footer() {

    const currentYear =
        new Date().getFullYear();

    const { portfolioSlug } =
        useParams();

    const [profileName, setProfileName] =
        useState("");

    const [socialLinks, setSocialLinks] =
        useState([]);


    /*
     * =========================================================
     * LOAD PUBLIC PROFILE
     * =========================================================
     *
     * The public profile endpoint is scoped by the
     * current portfolioSlug.
     *
     * The displayed name comes from Profile.fullName.
     * =========================================================
     */

    useEffect(() => {

        /*
         * If there is no portfolio slug, there is nothing
         * to fetch.
         *
         * IMPORTANT:
         * We do NOT call setProfileName() here because
         * React warns against synchronous setState calls
         * directly inside an effect body.
         */

        if (!portfolioSlug) {
            return;
        }

        let cancelled = false;


        const loadProfile = async () => {

            try {

                const response = await fetch(
                    `${API_BASE_URL}/api/profile/${encodeURIComponent(
                        portfolioSlug
                    )}`
                );


                if (!response.ok) {
                    throw new Error(
                        "Unable to load profile."
                    );
                }


                const data =
                    await response.json();


                if (cancelled) {
                    return;
                }


                const fullName =
                    data?.profile?.fullName?.trim() || "";


                setProfileName(fullName);

            } catch (error) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "Error loading footer profile:",
                    error
                );


                /*
                 * This state update happens asynchronously
                 * after the fetch attempt, so it does not
                 * trigger the synchronous-effect warning.
                 */

                setProfileName("");

            }

        };


        loadProfile();


        return () => {
            cancelled = true;
        };

    }, [portfolioSlug]);


    /*
     * =========================================================
     * LOAD PUBLIC SOCIAL LINKS
     * =========================================================
     *
     * IMPORTANT:
     *
     * The social links are filtered by portfolioSlug
     * on the backend.
     *
     * This means the footer only receives links belonging
     * to the portfolio currently being viewed.
     * =========================================================
     */

    useEffect(() => {

        /*
         * If there is no portfolio slug, there is nothing
         * to fetch.
         *
         * IMPORTANT:
         * We do NOT call setSocialLinks() here because
         * React warns against synchronous setState calls
         * directly inside an effect body.
         */

        if (!portfolioSlug) {
            return;
        }

        let cancelled = false;


        const loadSocialLinks = async () => {

            try {

                const response = await fetch(
                    `${API_BASE_URL}/api/social-links?portfolioSlug=${encodeURIComponent(
                        portfolioSlug
                    )}`
                );


                if (!response.ok) {
                    throw new Error(
                        "Unable to load social links."
                    );
                }


                const data =
                    await response.json();


                if (cancelled) {
                    return;
                }


                /*
                 * -----------------------------------------
                 * The public API returns an array.
                 * -----------------------------------------
                 */

                if (Array.isArray(data)) {

                    setSocialLinks(data);

                } else {

                    setSocialLinks([]);

                }

            } catch (error) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "Error loading footer social links:",
                    error
                );


                /*
                 * This update happens after the
                 * asynchronous fetch operation.
                 */

                setSocialLinks([]);

            }

        };


        loadSocialLinks();


        return () => {
            cancelled = true;
        };

    }, [portfolioSlug]);


    /*
     * =========================================================
     * DISPLAY NAME
     * =========================================================
     */

    const displayName =
        profileName || "Portfolio";


    /*
     * =========================================================
     * DYNAMIC BRAND INITIALS
     * =========================================================
     */

    const brandInitials =
        getInitials(profileName);


    /*
     * =========================================================
     * DYNAMIC FOOTER NAVIGATION
     * =========================================================
     */

    const footerLinks = portfolioSlug
        ? [
              {
                  label: "Home",
                  path: `/${portfolioSlug}`,
              },
              {
                  label: "About",
                  path: `/${portfolioSlug}/about`,
              },
              {
                  label: "Education",
                  path: `/${portfolioSlug}/education`,
              },
              {
                  label: "Experience",
                  path: `/${portfolioSlug}/experience`,
              },
              {
                  label: "Projects",
                  path: `/${portfolioSlug}/projects`,
              },
          ]
        : [];


    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (

        <footer className="site-footer">

            <div className="site-footer-container">


                {/* =========================================
                    FOOTER INTRO
                ========================================= */}

                <div className="footer-intro">

                    <NavLink
                        to={
                            portfolioSlug
                                ? `/${portfolioSlug}`
                                : "/"
                        }
                        className="footer-brand"
                    >

                        <span className="footer-brand-mark">
                            {brandInitials}
                        </span>


                        <span className="footer-brand-name">
                            {displayName}
                        </span>

                    </NavLink>


                    <p className="footer-description">
                        Data Analyst focused on turning
                        complex data into clear insights,
                        practical recommendations, and
                        better business decisions.
                    </p>

                </div>


                {/* =========================================
                    FOOTER NAVIGATION
                ========================================= */}

                <div className="footer-column">

                    <h3 className="footer-column-title">
                        Explore
                    </h3>


                    <nav
                        className="footer-navigation"
                        aria-label="Footer navigation"
                    >

                        {footerLinks.map((link) => (

                            <NavLink
                                key={link.path}
                                to={link.path}
                                className="footer-navigation-link"
                            >
                                {link.label}
                            </NavLink>

                        ))}

                    </nav>

                </div>


                {/* =========================================
                    FOOTER SOCIAL LINKS
                ========================================= */}

                <div className="footer-column">

                    <h3 className="footer-column-title">
                        Connect
                    </h3>


                    <div className="footer-contact-links">

                        {socialLinks.length > 0 ? (

                            socialLinks.map((socialLink) => {

                                const linkUrl =
                                    normalizeSocialUrl(
                                        socialLink.url
                                    );


                                const openInNewTab =
                                    shouldOpenInNewTab(
                                        socialLink.url
                                    );


                                return (

                                    <a
                                        key={socialLink.id}
                                        href={linkUrl}
                                        className="footer-contact-link"
                                        target={
                                            openInNewTab
                                                ? "_blank"
                                                : undefined
                                        }
                                        rel={
                                            openInNewTab
                                                ? "noreferrer"
                                                : undefined
                                        }
                                    >

                                        <span>
                                            {socialLink.platform}
                                        </span>


                                        <span>
                                            ↗
                                        </span>

                                    </a>

                                );

                            })

                        ) : null}

                    </div>

                </div>

            </div>


            {/* =========================================
                FOOTER BOTTOM
            ========================================= */}

            <div className="site-footer-bottom">

                <div className="site-footer-bottom-container">

                    <p>
                        © {currentYear} {displayName}.
                        All rights reserved.
                    </p>


                    <p className="footer-bottom-note">
                        Built with purpose, data, and
                        curiosity.
                    </p>

                </div>

            </div>

        </footer>
    );
}


export default Footer;