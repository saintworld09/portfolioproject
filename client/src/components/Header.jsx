import { useEffect, useState } from "react";
import {
    NavLink,
    useParams,
} from "react-router-dom";
import "./Header.css";

const API_BASE_URL = "http://localhost:5000";

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileName, setProfileName] = useState("");

    const { portfolioSlug } = useParams();

    /*
     * =========================================================
     * LOAD PUBLIC PROFILE
     * =========================================================
     *
     * The Header uses Profile.fullName as the displayed name.
     *
     * This means when the name is changed from the Admin
     * Profile page, the public Header automatically reflects
     * the updated name.
     *
     * =========================================================
     */

    useEffect(() => {
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

                const data = await response.json();

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
                    "Error loading header profile:",
                    error
                );

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
     * NAVIGATION LINKS
     * =========================================================
     */

    const navLinks = portfolioSlug
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
     * BRAND INITIALS
     * =========================================================
     */

    const getInitials = (name) => {
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
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();
    };


    const brandInitials =
        getInitials(profileName);


    /*
     * =========================================================
     * CLOSE MOBILE MENU
     * =========================================================
     */

    const closeMenu = () => {
        setMenuOpen(false);
    };


    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <header className="site-header">

            <div className="site-header-container">

                {/* =========================================
                    LOGO / BRAND
                ========================================= */}

                <NavLink
                    to={
                        portfolioSlug
                            ? `/${portfolioSlug}`
                            : "/"
                    }
                    className="site-brand"
                    onClick={closeMenu}
                >
                    <span className="site-brand-mark">
                        {brandInitials}
                    </span>

                    <span className="site-brand-name">
                        {profileName || "Portfolio"}
                    </span>
                </NavLink>


                {/* =========================================
                    DESKTOP NAVIGATION
                ========================================= */}

                <nav className="desktop-navigation">

                    {navLinks.map((link) => (

                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `navigation-link ${
                                    isActive
                                        ? "navigation-link-active"
                                        : ""
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>

                    ))}

                </nav>


                {/* =========================================
                    HEADER CTA
                ========================================= */}

                <NavLink
                    to={
                        portfolioSlug
                            ? `/${portfolioSlug}/about`
                            : "/about"
                    }
                    className="header-contact-button"
                    onClick={closeMenu}
                >
                    <span>
                        Let's Talk
                    </span>

                    <span className="header-contact-arrow">
                        ↗
                    </span>
                </NavLink>


                {/* =========================================
                    MOBILE MENU BUTTON
                ========================================= */}

                <button
                    type="button"
                    className={`mobile-menu-button ${
                        menuOpen
                            ? "mobile-menu-button-open"
                            : ""
                    }`}
                    onClick={() =>
                        setMenuOpen(
                            (previous) => !previous
                        )
                    }
                    aria-label={
                        menuOpen
                            ? "Close navigation menu"
                            : "Open navigation menu"
                    }
                    aria-expanded={menuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

            </div>


            {/* =========================================
                MOBILE NAVIGATION
            ========================================= */}

            <div
                className={`mobile-navigation ${
                    menuOpen
                        ? "mobile-navigation-open"
                        : ""
                }`}
            >
                <div className="mobile-navigation-inner">

                    {navLinks.map((link) => (

                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={closeMenu}
                            className={({ isActive }) =>
                                `mobile-navigation-link ${
                                    isActive
                                        ? "mobile-navigation-link-active"
                                        : ""
                                }`
                            }
                        >
                            <span>
                                {link.label}
                            </span>

                            <span className="mobile-navigation-arrow">
                                ↗
                            </span>
                        </NavLink>

                    ))}


                    <NavLink
                        to={
                            portfolioSlug
                                ? `/${portfolioSlug}/about`
                                : "/about"
                        }
                        onClick={closeMenu}
                        className="mobile-navigation-contact"
                    >
                        Let's Talk

                        <span>
                            ↗
                        </span>
                    </NavLink>

                </div>
            </div>

        </header>
    );
}

export default Header;