import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Certifications.css";

const API_BASE_URL = "http://localhost:5000";

const initialFormData = {
    name: "",
    issuingOrganization: "",
    issueDate: "",
    expirationDate: "",
    credentialId: "",
    credentialUrl: "",
    description: "",
    featured: false,
    sortOrder: 0,
};

function Certifications() {
    const navigate = useNavigate();

    const [certifications, setCertifications] = useState([]);
    const [formData, setFormData] = useState(initialFormData);
    const [certificateFile, setCertificateFile] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [currentCertificateUrl, setCurrentCertificateUrl] =
        useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Delete confirmation modal
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        certification: null,
    });

    /* =========================================================
       GET TOKEN
    ========================================================= */

    const getToken = () => {
        return localStorage.getItem("token");
    };

    /* =========================================================
       LOAD CERTIFICATIONS
    ========================================================= */

    useEffect(() => {
        let cancelled = false;

        const loadCertifications = async () => {
            try {
                const token = getToken();

                if (!token) {
                    throw new Error(
                        "You are not authenticated. Please log in again."
                    );
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/certifications/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to fetch certifications"
                    );
                }

                if (!cancelled) {
                    setCertifications(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error(
                    "Error fetching certifications:",
                    error
                );

                if (!cancelled) {
                    setError(error.message);
                    setLoading(false);
                }
            }
        };

        loadCertifications();

        return () => {
            cancelled = true;
        };
    }, []);

    /* =========================================================
       REFRESH CERTIFICATIONS
    ========================================================= */

    const fetchCertifications = async () => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `${API_BASE_URL}/api/certifications/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to fetch certifications"
                );
            }

            setCertifications(data);
        } catch (error) {
            console.error(
                "Error refreshing certifications:",
                error
            );

            setError(error.message);
        }
    };

    /* =========================================================
       HANDLE INPUT CHANGES
    ========================================================= */

    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    /* =========================================================
       HANDLE FILE CHANGE
    ========================================================= */

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;

        setCertificateFile(file);
    };

    /* =========================================================
       RESET FORM
    ========================================================= */

    const resetForm = () => {
        setFormData({
            ...initialFormData,
        });

        setCertificateFile(null);
        setEditingId(null);
        setCurrentCertificateUrl("");

        const fileInput =
            document.getElementById("certificate");

        if (fileInput) {
            fileInput.value = "";
        }
    };

    /* =========================================================
       SUBMIT FORM
    ========================================================= */

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const formDataToSend = new FormData();

            formDataToSend.append(
                "name",
                formData.name
            );

            formDataToSend.append(
                "issuingOrganization",
                formData.issuingOrganization
            );

            formDataToSend.append(
                "issueDate",
                formData.issueDate
            );

            if (formData.expirationDate) {
                formDataToSend.append(
                    "expirationDate",
                    formData.expirationDate
                );
            }

            if (formData.credentialId) {
                formDataToSend.append(
                    "credentialId",
                    formData.credentialId
                );
            }

            if (formData.credentialUrl) {
                formDataToSend.append(
                    "credentialUrl",
                    formData.credentialUrl
                );
            }

            if (formData.description) {
                formDataToSend.append(
                    "description",
                    formData.description
                );
            }

            formDataToSend.append(
                "featured",
                String(formData.featured)
            );

            formDataToSend.append(
                "sortOrder",
                String(formData.sortOrder)
            );

            if (certificateFile) {
                formDataToSend.append(
                    "certificate",
                    certificateFile
                );
            }

            const url = editingId
                ? `${API_BASE_URL}/api/certifications/${editingId}`
                : `${API_BASE_URL}/api/certifications`;

            const method = editingId
                ? "PUT"
                : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save certification"
                );
            }

            setSuccess(
                editingId
                    ? "Certification updated successfully."
                    : "Certification added successfully."
            );

            resetForm();

            await fetchCertifications();
        } catch (error) {
            console.error(
                "Error saving certification:",
                error
            );

            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       EDIT CERTIFICATION
    ========================================================= */

    const handleEdit = (certification) => {
        setEditingId(certification.id);

        setFormData({
            name: certification.name || "",

            issuingOrganization:
                certification.issuingOrganization || "",

            issueDate: certification.issueDate
                ? certification.issueDate.split("T")[0]
                : "",

            expirationDate:
                certification.expirationDate
                    ? certification.expirationDate.split("T")[0]
                    : "",

            credentialId:
                certification.credentialId || "",

            credentialUrl:
                certification.credentialUrl || "",

            description:
                certification.description || "",

            featured:
                certification.featured || false,

            sortOrder:
                certification.sortOrder ?? 0,
        });

        setCertificateFile(null);

        setCurrentCertificateUrl(
            certification.certificateUrl || ""
        );

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    /* =========================================================
       OPEN DELETE MODAL
    ========================================================= */

    const openDeleteModal = (certification) => {
        setError("");
        setSuccess("");

        setDeleteModal({
            isOpen: true,
            certification,
        });
    };

    /* =========================================================
       CLOSE DELETE MODAL
    ========================================================= */

    const closeDeleteModal = () => {
        if (deletingId !== null) {
            return;
        }

        setDeleteModal({
            isOpen: false,
            certification: null,
        });
    };

    /* =========================================================
       DELETE CERTIFICATION
    ========================================================= */

    const handleDelete = async () => {
        const certification =
            deleteModal.certification;

        if (!certification) {
            return;
        }

        try {
            setDeletingId(certification.id);
            setError("");
            setSuccess("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `${API_BASE_URL}/api/certifications/${certification.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to delete certification"
                );
            }

            setSuccess(
                "Certification deleted successfully."
            );

            if (
                editingId === certification.id
            ) {
                resetForm();
            }

            setDeleteModal({
                isOpen: false,
                certification: null,
            });

            await fetchCertifications();
        } catch (error) {
            console.error(
                "Error deleting certification:",
                error
            );

            setError(error.message);
        } finally {
            setDeletingId(null);
        }
    };

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

    const getCertificateUrl = (certificateUrl) => {
        if (!certificateUrl) {
            return "";
        }

        if (
            certificateUrl.startsWith("http://") ||
            certificateUrl.startsWith("https://")
        ) {
            return certificateUrl;
        }

        return `${API_BASE_URL}${certificateUrl}`;
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="certifications-page">
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="certifications-page-header">
                <div className="certifications-header-content">
                    <div className="certifications-header-text">
                        <span className="certifications-eyebrow">
                            Portfolio Management
                        </span>

                        <h1>
                            Certifications
                        </h1>

                        <p>
                            Build and manage the
                            professional credentials
                            displayed on your portfolio.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
                        }
                        className="certifications-dashboard-button"
                    >
                        <span className="certifications-dashboard-icon">
                            ←
                        </span>

                        <span>
                            Dashboard
                        </span>
                    </button>
                </div>
            </div>

            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (
                <div className="certifications-alert certifications-alert-error">
                    <span className="certifications-alert-icon">
                        !
                    </span>

                    <div>
                        <strong>
                            Something went wrong
                        </strong>

                        <p>
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        className="certifications-alert-close"
                    >
                        ×
                    </button>
                </div>
            )}

            {success && (
                <div className="certifications-alert certifications-alert-success">
                    <span className="certifications-alert-icon">
                        ✓
                    </span>

                    <div>
                        <strong>
                            Success
                        </strong>

                        <p>
                            {success}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                        className="certifications-alert-close"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* =================================================
                FORM CARD
            ================================================= */}

            <section className="certifications-form-card">
                <div className="certifications-card-header">
                    <div>
                        <span className="certifications-section-label">
                            {editingId
                                ? "Editing Record"
                                : "New Record"}
                        </span>

                        <h2>
                            {editingId
                                ? "Edit Certification"
                                : "Add Certification"}
                        </h2>

                        <p>
                            Add a professional
                            certification or credential
                            to your portfolio.
                        </p>
                    </div>

                    <div className="certifications-card-icon">
                        +
                    </div>
                </div>

                <form
                    className="certifications-form"
                    onSubmit={handleSubmit}
                >
                    {/* CERTIFICATION NAME */}

                    <div className="certifications-form-group certifications-form-full">
                        <label htmlFor="name">
                            Certification Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Google Data Analytics Professional Certificate"
                            required
                        />
                    </div>

                    {/* ISSUING ORGANIZATION */}

                    <div className="certifications-form-group">
                        <label htmlFor="issuingOrganization">
                            Issuing Organization
                        </label>

                        <input
                            id="issuingOrganization"
                            name="issuingOrganization"
                            type="text"
                            value={
                                formData.issuingOrganization
                            }
                            onChange={handleChange}
                            placeholder="e.g. Google"
                            required
                        />
                    </div>

                    {/* ISSUE DATE */}

                    <div className="certifications-form-group">
                        <label htmlFor="issueDate">
                            Issue Date
                        </label>

                        <input
                            id="issueDate"
                            name="issueDate"
                            type="date"
                            value={
                                formData.issueDate
                            }
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* EXPIRATION DATE */}

                    <div className="certifications-form-group">
                        <label htmlFor="expirationDate">
                            Expiration Date
                            <span className="certifications-optional">
                                Optional
                            </span>
                        </label>

                        <input
                            id="expirationDate"
                            name="expirationDate"
                            type="date"
                            value={
                                formData.expirationDate
                            }
                            onChange={handleChange}
                        />
                    </div>

                    {/* CREDENTIAL ID */}

                    <div className="certifications-form-group">
                        <label htmlFor="credentialId">
                            Credential ID
                            <span className="certifications-optional">
                                Optional
                            </span>
                        </label>

                        <input
                            id="credentialId"
                            name="credentialId"
                            type="text"
                            value={
                                formData.credentialId
                            }
                            onChange={handleChange}
                            placeholder="e.g. ABC123XYZ"
                        />
                    </div>

                    {/* CREDENTIAL URL */}

                    <div className="certifications-form-group certifications-form-full">
                        <label htmlFor="credentialUrl">
                            Credential URL
                            <span className="certifications-optional">
                                Optional
                            </span>
                        </label>

                        <input
                            id="credentialUrl"
                            name="credentialUrl"
                            type="url"
                            value={
                                formData.credentialUrl
                            }
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </div>

                    {/* CERTIFICATE FILE */}

                    <div className="certifications-form-group certifications-form-full">
                        <label htmlFor="certificate">
                            Certificate File
                        </label>

                        <input
                            id="certificate"
                            name="certificate"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                        />

                        <small className="certifications-file-help">
                            Accepted formats: PDF, JPG,
                            JPEG, PNG, and WebP. Maximum
                            file size: 10 MB.
                        </small>

                        {currentCertificateUrl && (
                            <div className="certifications-current-file">
                                <span>
                                    Existing certificate:
                                </span>

                                <a
                                    href={getCertificateUrl(
                                        currentCertificateUrl
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Certificate
                                </a>
                            </div>
                        )}

                        {certificateFile && (
                            <div className="certifications-selected-file">
                                Selected file:{" "}
                                <strong>
                                    {
                                        certificateFile.name
                                    }
                                </strong>
                            </div>
                        )}
                    </div>

                    {/* DESCRIPTION */}

                    <div className="certifications-form-group certifications-form-full">
                        <label htmlFor="description">
                            Description
                            <span className="certifications-optional">
                                Optional
                            </span>
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            value={
                                formData.description
                            }
                            onChange={handleChange}
                            placeholder="Add a short description of what the certification covers."
                            rows="5"
                        />
                    </div>

                    {/* FEATURED */}

                    <div className="certifications-featured-wrapper certifications-form-full">
                        <label className="certifications-checkbox-label">
                            <input
                                name="featured"
                                type="checkbox"
                                checked={
                                    formData.featured
                                }
                                onChange={handleChange}
                            />

                            <span className="certifications-custom-checkbox">
                                <span>
                                    ✓
                                </span>
                            </span>

                            <span>
                                <strong>
                                    Feature this certification
                                </strong>

                                <small>
                                    Highlight this
                                    certification on your
                                    public portfolio.
                                </small>
                            </span>
                        </label>
                    </div>

                    {/* SORT ORDER */}

                    <div className="certifications-form-group">
                        <label htmlFor="sortOrder">
                            Sort Order
                        </label>

                        <input
                            id="sortOrder"
                            name="sortOrder"
                            type="number"
                            min="0"
                            value={
                                formData.sortOrder
                            }
                            onChange={handleChange}
                        />

                        <small className="certifications-field-help">
                            Lower numbers appear first.
                        </small>
                    </div>

                    {/* FORM ACTIONS */}

                    <div className="certifications-form-actions certifications-form-full">
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={saving}
                                className="certifications-button certifications-button-secondary"
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="certifications-button certifications-button-primary"
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                ? "Update Certification"
                                : "Add Certification"}
                        </button>
                    </div>
                </form>
            </section>

            {/* =================================================
                CERTIFICATION LIST
            ================================================= */}

            <section className="certifications-list-section">
                <div className="certifications-list-header">
                    <div>
                        <span className="certifications-section-label">
                            Your Credentials
                        </span>

                        <h2>
                            Professional Certifications
                        </h2>

                        <p>
                            Your certifications,
                            credentials, and
                            professional achievements.
                        </p>
                    </div>

                    <div className="certifications-count">
                        <strong>
                            {certifications.length}
                        </strong>

                        <span>
                            {certifications.length === 1
                                ? "Certification"
                                : "Certifications"}
                        </span>
                    </div>
                </div>

                {/* LOADING */}

                {loading ? (
                    <div className="certifications-loading">
                        <div className="certifications-spinner" />

                        <p>
                            Loading certifications...
                        </p>
                    </div>
                ) : certifications.length === 0 ? (
                    /* EMPTY */

                    <div className="certifications-empty">
                        <div className="certifications-empty-icon">
                            +
                        </div>

                        <h3>
                            No certifications yet
                        </h3>

                        <p>
                            Add your first
                            professional
                            certification using
                            the form above.
                        </p>
                    </div>
                ) : (
                    /* CERTIFICATION RECORDS */

                    <div className="certifications-list">
                        {certifications.map(
                            (certification) => (
                                <article
                                    key={
                                        certification.id
                                    }
                                    className="certification-item"
                                >
                                    <div className="certification-item-icon">
                                        <span>
                                            ✓
                                        </span>
                                    </div>

                                    <div className="certification-item-content">
                                        <div className="certification-item-top">
                                            <div>
                                                <div className="certification-item-title-row">
                                                    <h3>
                                                        {
                                                            certification.name
                                                        }
                                                    </h3>

                                                    {certification.featured && (
                                                        <span className="certification-featured-badge">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="certification-organization">
                                                    {
                                                        certification.issuingOrganization
                                                    }
                                                </div>
                                            </div>

                                            <div className="certification-date">
                                                <span>
                                                    Issued{" "}
                                                    {formatDate(
                                                        certification.issueDate
                                                    )}
                                                </span>

                                                {certification.expirationDate && (
                                                    <>
                                                        <span className="certification-date-separator">
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
                                        </div>

                                        {certification.description && (
                                            <p className="certification-description">
                                                {
                                                    certification.description
                                                }
                                            </p>
                                        )}

                                        <div className="certification-meta">
                                            {certification.credentialId && (
                                                <span>
                                                    <strong>
                                                        Credential ID:
                                                    </strong>{" "}
                                                    {
                                                        certification.credentialId
                                                    }
                                                </span>
                                            )}
                                        </div>

                                        <div className="certification-item-actions">
                                            {certification.certificateUrl && (
                                                <a
                                                    href={getCertificateUrl(
                                                        certification.certificateUrl
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="certification-action certification-action-view"
                                                >
                                                    View Certificate
                                                </a>
                                            )}

                                            {certification.credentialUrl && (
                                                <a
                                                    href={
                                                        certification.credentialUrl
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="certification-action certification-action-view"
                                                >
                                                    Credential
                                                </a>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(
                                                        certification
                                                    )
                                                }
                                                className="certification-action certification-action-edit"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openDeleteModal(
                                                        certification
                                                    )
                                                }
                                                disabled={
                                                    deletingId ===
                                                    certification.id
                                                }
                                                className="certification-action certification-action-delete"
                                            >
                                                {deletingId ===
                                                certification.id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            )
                        )}
                    </div>
                )}
            </section>

            {/* =================================================
                DELETE CONFIRMATION MODAL
            ================================================= */}

            {deleteModal.isOpen &&
                deleteModal.certification && (
                    <div
                        className="certifications-modal-overlay"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeDeleteModal();
                            }
                        }}
                    >
                        <div
                            className="certifications-delete-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="certification-delete-title"
                            onMouseDown={(event) =>
                                event.stopPropagation()
                            }
                        >
                            {/* MODAL ICON */}

                            <div className="certifications-delete-icon-wrapper">
                                <div className="certifications-delete-icon">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M3 6H21"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                        />

                                        <path
                                            d="M8 6V4.8C8 4.35817 8.35817 4 8.8 4H15.2C15.6418 4 16 4.35817 16 4.8V6"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                        />

                                        <path
                                            d="M19 6L18.4 19.2C18.355 20.1948 17.5348 21 16.5389 21H7.4611C6.46524 21 5.64498 20.1948 5.64498 19.2L5 6"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />

                                        <path
                                            d="M10 10V17"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                        />

                                        <path
                                            d="M14 10V17"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* MODAL CONTENT */}

                            <div className="certifications-delete-content">
                                <span className="certifications-delete-eyebrow">
                                    Delete Record
                                </span>

                                <h2 id="certification-delete-title">
                                    Delete Certification?
                                </h2>

                                <p>
                                    Are you sure you want
                                    to permanently delete
                                    this certification? This
                                    action cannot be undone.
                                </p>

                                <div className="certifications-delete-record">
                                    <strong>
                                        {
                                            deleteModal
                                                .certification
                                                .name
                                        }
                                    </strong>

                                    <span>
                                        {
                                            deleteModal
                                                .certification
                                                .issuingOrganization
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* MODAL ACTIONS */}

                            <div className="certifications-delete-actions">
                                <button
                                    type="button"
                                    onClick={
                                        closeDeleteModal
                                    }
                                    disabled={
                                        deletingId !== null
                                    }
                                    className="certifications-delete-cancel"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleDelete
                                    }
                                    disabled={
                                        deletingId !== null
                                    }
                                    className="certifications-delete-confirm"
                                >
                                    {deletingId !== null ? (
                                        <>
                                            <span className="certifications-delete-spinner" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            Delete Certification
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Certifications;