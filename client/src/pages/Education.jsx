import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "../styles/PublicEducation.css";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { API_BASE_URL } from "../config";

function Education() {
    /*
    =========================================================
    PORTFOLIO CONTEXT
    =========================================================

    The public education page is portfolio-specific.

    Example:
        /john-doe/education
        /jane-doe/education

    The portfolioSlug identifies which user's education and
    certifications should be displayed.
    =========================================================
    */

    const { portfolioSlug } = useParams();


    /* =========================================================
       STATE
    ========================================================= */

    const [educations, setEducations] = useState([]);

    const [certifications, setCertifications] =
        useState([]);

    const [loadingEducation, setLoadingEducation] =
        useState(true);

    const [loadingCertifications, setLoadingCertifications] =
        useState(true);

    const [educationError, setEducationError] =
        useState("");

    const [certificationError, setCertificationError] =
        useState("");


    /* =========================================================
       PORTFOLIO QUERY PARAMETER
    =========================================================

    All public portfolio data is scoped by portfolioSlug.

    Example:

        /api/education?portfolioSlug=john-doe

        /api/certifications?portfolioSlug=john-doe

    ========================================================= */

    const portfolioQuery = portfolioSlug
        ? `?portfolioSlug=${encodeURIComponent(
              portfolioSlug
          )}`
        : "";


    /* =========================================================
       FETCH EDUCATION
    ========================================================= */

    useEffect(() => {
        let cancelled = false;

        const loadEducations = async () => {
            /*
             * Do not attempt a generic public request when the
             * portfolio slug is missing.
             */
            if (!portfolioSlug) {
                if (!cancelled) {
                    setEducations([]);
                    setEducationError(
                        "Portfolio information is missing."
                    );
                    setLoadingEducation(false);
                }

                return;
            }

            try {
                setLoadingEducation(true);
                setEducationError("");

                const response = await fetch(
                    `${API_BASE_URL}/api/education${portfolioQuery}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to fetch education."
                    );
                }

                if (!cancelled) {
                    /*
                     * The API should return only education records
                     * belonging to the requested portfolio.
                     */
                    setEducations(
                        Array.isArray(data)
                            ? data
                            : []
                    );

                    setLoadingEducation(false);
                }
            } catch (error) {
                console.error(
                    "Error fetching education:",
                    error
                );

                if (!cancelled) {
                    setEducationError(
                        error.message ||
                            "Unable to load education at the moment."
                    );

                    setEducations([]);
                    setLoadingEducation(false);
                }
            }
        };

        loadEducations();

        return () => {
            cancelled = true;
        };
    }, [portfolioSlug, portfolioQuery]);


    /* =========================================================
       FETCH CERTIFICATIONS
    ========================================================= */

    useEffect(() => {
        let cancelled = false;

        const loadCertifications = async () => {
            /*
             * Do not fetch unscoped certification records.
             */
            if (!portfolioSlug) {
                if (!cancelled) {
                    setCertifications([]);
                    setCertificationError(
                        "Portfolio information is missing."
                    );
                    setLoadingCertifications(false);
                }

                return;
            }

            try {
                setLoadingCertifications(true);
                setCertificationError("");

                const response = await fetch(
                    `${API_BASE_URL}/api/certifications${portfolioQuery}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to load certifications."
                    );
                }

                if (!cancelled) {
                    /*
                     * The API should return only certifications
                     * belonging to the requested portfolio.
                     */
                    setCertifications(
                        Array.isArray(data)
                            ? data
                            : []
                    );

                    setLoadingCertifications(false);
                }
            } catch (error) {
                console.error(
                    "Error fetching certifications:",
                    error
                );

                if (!cancelled) {
                    setCertificationError(
                        error.message ||
                            "Unable to load certifications at the moment."
                    );

                    setCertifications([]);
                    setLoadingCertifications(false);
                }
            }
        };

        loadCertifications();

        return () => {
            cancelled = true;
        };
    }, [portfolioSlug, portfolioQuery]);


    /* =========================================================
       FORMAT DATE
    ========================================================= */

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return new Date(date).toLocaleDateString(
            "en-US",
            {
                month: "short",
                year: "numeric",
            }
        );
    };


    /* =========================================================
       GET CERTIFICATE URL
    ========================================================= */

    const getCertificateUrl = (
        certificateUrl
    ) => {
        if (!certificateUrl) {
            return "";
        }

        if (
            certificateUrl.startsWith(
                "http://"
            ) ||
            certificateUrl.startsWith(
                "https://"
            )
        ) {
            return certificateUrl;
        }

        return `${API_BASE_URL}${certificateUrl}`;
    };


    /* =========================================================
       CHECK CERTIFICATE IMAGE
    ========================================================= */

    const isImageCertificate = (
        certificateUrl
    ) => {
        if (!certificateUrl) {
            return false;
        }

        const cleanUrl =
            certificateUrl
                .split("?")[0]
                .toLowerCase();

        return (
            cleanUrl.endsWith(".jpg") ||
            cleanUrl.endsWith(".jpeg") ||
            cleanUrl.endsWith(".png") ||
            cleanUrl.endsWith(".webp")
        );
    };


    /* =========================================================
       RENDER CERTIFICATE PREVIEW
    ========================================================= */

    const renderCertificatePreview = (
        certification
    ) => {
        const certificateUrl =
            getCertificateUrl(
                certification.certificateUrl
            );

        /*
         * IMAGE CERTIFICATE
         */

        if (
            certificateUrl &&
            isImageCertificate(
                certification.certificateUrl
            )
        ) {
            return (
                <img
                    src={certificateUrl}
                    alt={`${certification.name} certificate`}
                    className="public-education-certificate-image"
                />
            );
        }


        /*
         * PDF / DOCUMENT CERTIFICATE
         */

        if (certificateUrl) {
            return (
                <div className="public-education-certificate-document">

                    <div className="public-education-certificate-document-icon">
                        PDF
                    </div>

                    <span>
                        Certificate
                    </span>

                </div>
            );
        }


        /*
         * NO CERTIFICATE FILE
         */

        return (
            <div className="public-education-certificate-placeholder">

                <div className="public-education-certificate-placeholder-icon">
                    ✓
                </div>

                <span>
                    Professional
                    Certification
                </span>

            </div>
        );
    };


    /* =========================================================
       CERTIFICATION GROUPS
    ========================================================= */

    const featuredCertifications =
        certifications.filter(
            (certification) =>
                certification.featured
        );

    const regularCertifications =
        certifications.filter(
            (certification) =>
                !certification.featured
        );


    /* =========================================================
       MAIN PAGE
    ========================================================= */

    return (
        <div className="public-education-page">

            {/* =================================================
                SHARED PUBLIC HEADER
            ================================================= */}

            <Header />


            <main>

                {/* =================================================
                    HERO
                ================================================= */}

                <section className="public-education-hero">

                    <div className="public-education-container">

                        <div className="public-education-hero-content">

                            <span className="public-education-eyebrow">
                                Education & Credentials
                            </span>

                            <h1>
                                Education & Certifications
                            </h1>

                            <p>
                                My academic foundation and
                                professional certifications
                                that support my continued growth
                                in data analytics, business
                                intelligence, and technology.
                            </p>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    PAGE CONTENT
                ================================================= */}

                <section className="public-education-section">

                    <div className="public-education-container">


                        {/* =================================================
                            EDUCATION
                        ================================================= */}

                        <div className="public-education-block">


                            {/* SECTION HEADER */}

                            <div className="public-education-section-header">

                                <div>

                                    <span className="public-education-section-label">
                                        Academic Background
                                    </span>

                                    <h2>
                                        My Education
                                    </h2>

                                </div>

                                <span className="public-education-section-count">

                                    {educations.length}

                                    {educations.length === 1
                                        ? " Qualification"
                                        : " Qualifications"}

                                </span>

                            </div>


                            {/* EDUCATION LOADING */}

                            {loadingEducation && (
                                <div className="public-education-loading">

                                    <div className="public-education-spinner" />

                                    <p>
                                        Loading education...
                                    </p>

                                </div>
                            )}


                            {/* EDUCATION ERROR */}

                            {!loadingEducation &&
                                educationError && (
                                    <div className="public-education-error">

                                        <div className="public-education-error-icon">
                                            !
                                        </div>

                                        <div>

                                            <h3>
                                                Unable to load education
                                            </h3>

                                            <p>
                                                {
                                                    educationError
                                                }
                                            </p>

                                        </div>

                                    </div>
                                )}


                            {/* EDUCATION EMPTY */}

                            {!loadingEducation &&
                                !educationError &&
                                educations.length === 0 && (
                                    <div className="public-education-empty">

                                        <div className="public-education-empty-icon">
                                            +
                                        </div>

                                        <h3>
                                            Education information
                                            coming soon
                                        </h3>

                                        <p>
                                            Academic qualifications
                                            will be displayed here.
                                        </p>

                                    </div>
                                )}


                            {/* EDUCATION CONTENT */}

                            {!loadingEducation &&
                                !educationError &&
                                educations.length > 0 && (
                                    <div className="public-education-list">

                                        {educations.map(
                                            (
                                                education,
                                                index
                                            ) => (
                                                <article
                                                    key={
                                                        education.id
                                                    }
                                                    className="public-education-card"
                                                >

                                                    {/* CARD NUMBER */}

                                                    <div className="public-education-card-number">

                                                        <span>
                                                            {String(
                                                                index +
                                                                    1
                                                            ).padStart(
                                                                2,
                                                                "0"
                                                            )}
                                                        </span>

                                                    </div>


                                                    {/* CARD MAIN CONTENT */}

                                                    <div className="public-education-card-main">


                                                        {/* TOP ROW */}

                                                        <div className="public-education-card-top">


                                                            {/* EDUCATION HEADING */}

                                                            <div className="public-education-card-heading">

                                                                <div className="public-education-degree-row">

                                                                    <h3>
                                                                        {
                                                                            education.degree
                                                                        }
                                                                    </h3>

                                                                    {education.isCurrent && (
                                                                        <span className="public-education-current-badge">
                                                                            Current
                                                                        </span>
                                                                    )}

                                                                </div>


                                                                <div className="public-education-institution">

                                                                    <span className="public-education-institution-name">
                                                                        {
                                                                            education.institution
                                                                        }
                                                                    </span>

                                                                    {education.fieldOfStudy && (
                                                                        <>
                                                                            <span className="public-education-separator">
                                                                                •
                                                                            </span>

                                                                            <span className="public-education-field">
                                                                                {
                                                                                    education.fieldOfStudy
                                                                                }
                                                                            </span>
                                                                        </>
                                                                    )}

                                                                </div>

                                                            </div>


                                                            {/* DATE */}

                                                            <div className="public-education-date">

                                                                <span>
                                                                    {formatDate(
                                                                        education.startDate
                                                                    )}
                                                                </span>

                                                                <span className="public-education-date-arrow">
                                                                    →
                                                                </span>

                                                                <span>
                                                                    {education.isCurrent
                                                                        ? "Present"
                                                                        : formatDate(
                                                                              education.endDate
                                                                          )}
                                                                </span>

                                                            </div>

                                                        </div>


                                                        {/* DESCRIPTION */}

                                                        {education.description && (
                                                            <div className="public-education-description">

                                                                <p>
                                                                    {
                                                                        education.description
                                                                    }
                                                                </p>

                                                            </div>
                                                        )}


                                                        {/* COMPLETION STATUS */}

                                                        <div className="public-education-card-footer">

                                                            <span className="public-education-status">

                                                                <span className="public-education-status-dot" />

                                                                {education.isCurrent
                                                                    ? "Currently studying"
                                                                    : "Completed"}

                                                            </span>

                                                        </div>

                                                    </div>

                                                </article>
                                            )
                                        )}

                                    </div>
                                )}

                        </div>


                        {/* =================================================
                            DIVIDER
                        ================================================= */}

                        <div className="public-education-section-divider">
                            <span />
                        </div>


                        {/* =================================================
                            CERTIFICATIONS
                        ================================================= */}

                        <div className="public-education-block public-education-certifications-block">


                            {/* SECTION HEADER */}

                            <div className="public-education-section-header">

                                <div>

                                    <span className="public-education-section-label">
                                        Professional Development
                                    </span>

                                    <h2>
                                        Certifications
                                    </h2>

                                </div>

                                <span className="public-education-section-count">

                                    {certifications.length}

                                    {certifications.length === 1
                                        ? " Certification"
                                        : " Certifications"}

                                </span>

                            </div>


                            {/* CERTIFICATION LOADING */}

                            {loadingCertifications && (
                                <div className="public-education-loading">

                                    <div className="public-education-spinner" />

                                    <p>
                                        Loading certifications...
                                    </p>

                                </div>
                            )}


                            {/* CERTIFICATION ERROR */}

                            {!loadingCertifications &&
                                certificationError && (
                                    <div className="public-education-error">

                                        <div className="public-education-error-icon">
                                            !
                                        </div>

                                        <div>

                                            <h3>
                                                Unable to load
                                                certifications
                                            </h3>

                                            <p>
                                                {
                                                    certificationError
                                                }
                                            </p>

                                        </div>

                                    </div>
                                )}


                            {/* CERTIFICATION EMPTY */}

                            {!loadingCertifications &&
                                !certificationError &&
                                certifications.length === 0 && (
                                    <div className="public-education-empty">

                                        <div className="public-education-empty-icon">
                                            ✓
                                        </div>

                                        <h3>
                                            Certifications coming
                                            soon
                                        </h3>

                                        <p>
                                            Professional credentials
                                            and certifications will
                                            appear here.
                                        </p>

                                    </div>
                                )}


                            {/* =================================================
                                FEATURED CERTIFICATIONS
                            ================================================= */}

                            {!loadingCertifications &&
                                !certificationError &&
                                featuredCertifications.length >
                                    0 && (

                                    <div className="public-education-featured-section">


                                        {/* FEATURED HEADING */}

                                        <div className="public-education-subsection-heading">

                                            <div>

                                                <span>
                                                    Featured
                                                </span>

                                                <h3>
                                                    Featured
                                                    Certifications
                                                </h3>

                                            </div>

                                        </div>


                                        {/* FEATURED GRID */}

                                        <div className="public-education-featured-grid">

                                            {featuredCertifications.map(
                                                (
                                                    certification
                                                ) => (

                                                    <article
                                                        key={
                                                            certification.id
                                                        }
                                                        className="public-education-certification-card public-education-certification-card-featured"
                                                    >


                                                        {/* PREVIEW */}

                                                        <div className="public-education-certificate-preview">

                                                            {renderCertificatePreview(
                                                                certification
                                                            )}

                                                            <span className="public-education-featured-badge">
                                                                Featured
                                                            </span>

                                                        </div>


                                                        {/* CONTENT */}

                                                        <div className="public-education-certification-content">


                                                            {/* HEADING */}

                                                            <div className="public-education-certification-heading">

                                                                <h3>
                                                                    {
                                                                        certification.name
                                                                    }
                                                                </h3>

                                                                <span className="public-education-certification-organization">
                                                                    {
                                                                        certification.issuingOrganization
                                                                    }
                                                                </span>

                                                            </div>


                                                            {/* DATE */}

                                                            <div className="public-education-certification-date">

                                                                <span>
                                                                    Issued{" "}
                                                                    {formatDate(
                                                                        certification.issueDate
                                                                    )}
                                                                </span>

                                                                {certification.expirationDate && (
                                                                    <>
                                                                        <span className="public-education-certification-date-dot">
                                                                            •
                                                                        </span>

                                                                        <span>
                                                                            Expires{" "}
                                                                            {formatDate(
                                                                                certification.expirationDate
                                                                            )}
                                                                        </span>
                                                                    </>
                                                                )}

                                                            </div>


                                                            {/* DESCRIPTION */}

                                                            {certification.description && (
                                                                <p className="public-education-certification-description">
                                                                    {
                                                                        certification.description
                                                                    }
                                                                </p>
                                                            )}


                                                            {/* CREDENTIAL ID */}

                                                            {certification.credentialId && (
                                                                <div className="public-education-certification-credential">

                                                                    <span>
                                                                        Credential
                                                                        ID
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            certification.credentialId
                                                                        }
                                                                    </strong>

                                                                </div>
                                                            )}


                                                            {/* ACTIONS */}

                                                            <div className="public-education-certification-actions">

                                                                {certification.certificateUrl && (
                                                                    <a
                                                                        href={getCertificateUrl(
                                                                            certification.certificateUrl
                                                                        )}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="public-education-certification-button public-education-certification-button-primary"
                                                                    >
                                                                        View
                                                                        Certificate
                                                                    </a>
                                                                )}

                                                                {certification.credentialUrl && (
                                                                    <a
                                                                        href={
                                                                            certification.credentialUrl
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="public-education-certification-button public-education-certification-button-secondary"
                                                                    >
                                                                        View
                                                                        Credential
                                                                    </a>
                                                                )}

                                                            </div>

                                                        </div>

                                                    </article>

                                                )
                                            )}

                                        </div>

                                    </div>
                                )}


                            {/* =================================================
                                ALL / REGULAR CERTIFICATIONS
                            ================================================= */}

                            {!loadingCertifications &&
                                !certificationError &&
                                regularCertifications.length >
                                    0 && (

                                    <div className="public-education-all-certifications">


                                        {/* SUBSECTION HEADING */}

                                        <div className="public-education-subsection-heading">

                                            <div>

                                                <span>
                                                    Credentials
                                                </span>

                                                <h3>
                                                    Professional
                                                    Certifications
                                                </h3>

                                            </div>

                                        </div>


                                        {/* CERTIFICATION GRID */}

                                        <div className="public-education-certifications-grid">

                                            {regularCertifications.map(
                                                (
                                                    certification
                                                ) => (

                                                    <article
                                                        key={
                                                            certification.id
                                                        }
                                                        className="public-education-certification-card"
                                                    >


                                                        {/* PREVIEW */}

                                                        <div className="public-education-certificate-preview">

                                                            {renderCertificatePreview(
                                                                certification
                                                            )}

                                                        </div>


                                                        {/* CONTENT */}

                                                        <div className="public-education-certification-content">


                                                            {/* HEADING */}

                                                            <div className="public-education-certification-heading">

                                                                <h3>
                                                                    {
                                                                        certification.name
                                                                    }
                                                                </h3>

                                                                <span className="public-education-certification-organization">
                                                                    {
                                                                        certification.issuingOrganization
                                                                    }
                                                                </span>

                                                            </div>


                                                            {/* DATE */}

                                                            <div className="public-education-certification-date">

                                                                <span>
                                                                    Issued{" "}
                                                                    {formatDate(
                                                                        certification.issueDate
                                                                    )}
                                                                </span>

                                                                {certification.expirationDate && (
                                                                    <>
                                                                        <span className="public-education-certification-date-dot">
                                                                            •
                                                                        </span>

                                                                        <span>
                                                                            Expires{" "}
                                                                            {formatDate(
                                                                                certification.expirationDate
                                                                            )}
                                                                        </span>
                                                                    </>
                                                                )}

                                                            </div>


                                                            {/* DESCRIPTION */}

                                                            {certification.description && (
                                                                <p className="public-education-certification-description">
                                                                    {
                                                                        certification.description
                                                                    }
                                                                </p>
                                                            )}


                                                            {/* CREDENTIAL ID */}

                                                            {certification.credentialId && (
                                                                <div className="public-education-certification-credential">

                                                                    <span>
                                                                        Credential
                                                                        ID
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            certification.credentialId
                                                                        }
                                                                    </strong>

                                                                </div>
                                                            )}


                                                            {/* ACTIONS */}

                                                            <div className="public-education-certification-actions">

                                                                {certification.certificateUrl && (
                                                                    <a
                                                                        href={getCertificateUrl(
                                                                            certification.certificateUrl
                                                                        )}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="public-education-certification-button public-education-certification-button-primary"
                                                                    >
                                                                        View
                                                                        Certificate
                                                                    </a>
                                                                )}

                                                                {certification.credentialUrl && (
                                                                    <a
                                                                        href={
                                                                            certification.credentialUrl
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="public-education-certification-button public-education-certification-button-secondary"
                                                                    >
                                                                        View
                                                                        Credential
                                                                    </a>
                                                                )}

                                                            </div>

                                                        </div>

                                                    </article>

                                                )
                                            )}

                                        </div>

                                    </div>
                                )}

                        </div>

                    </div>

                </section>

            </main>


            {/* =================================================
                SHARED PUBLIC FOOTER
            ================================================= */}

            <Footer />

        </div>
    );
}

export default Education;