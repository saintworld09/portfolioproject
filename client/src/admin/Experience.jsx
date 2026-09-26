import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Experience.css";

import { API_BASE_URL } from "../config";

const initialFormData = {
    jobTitle: "",
    company: "",
    location: "",
    description: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
};

function Experience() {
    const navigate = useNavigate();

    const [experiences, setExperiences] = useState([]);
    const [formData, setFormData] =
        useState(initialFormData);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Delete confirmation modal
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        experience: null,
    });

    // =========================================================
    // GET AUTH TOKEN
    // =========================================================

    const getToken = () => {
        return localStorage.getItem("token");
    };

    /* =========================================================
       LOAD MY EXPERIENCES
       =========================================================
       IMPORTANT:
       Admin Experience now uses /api/experiences/me
       so the backend returns ONLY the authenticated
       admin's experiences.
    ========================================================= */

    useEffect(() => {
        let cancelled = false;

        const loadExperiences = async () => {
            try {
                const token = getToken();

                if (!token) {
                    throw new Error(
                        "You are not authenticated. Please log in again."
                    );
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/experiences/me`,
                    {
                        method: "GET",
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to fetch experiences"
                    );
                }

                if (!cancelled) {
                    setExperiences(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error(
                    "Error fetching experiences:",
                    error
                );

                if (!cancelled) {
                    setError(error.message);
                    setLoading(false);
                }
            }
        };

        loadExperiences();

        return () => {
            cancelled = true;
        };
    }, []);

    /* =========================================================
       REFRESH MY EXPERIENCES
    ========================================================= */

    const fetchExperiences = async () => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `${API_BASE_URL}/api/experiences/me`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to fetch experiences"
                );
            }

            setExperiences(data);
        } catch (error) {
            console.error(
                "Error refreshing experiences:",
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
       RESET FORM
    ========================================================= */

    const resetForm = () => {
        setFormData({
            ...initialFormData,
        });

        setEditingId(null);
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

            const url = editingId
                ? `${API_BASE_URL}/api/experiences/${editingId}`
                : `${API_BASE_URL}/api/experiences`;

            const method = editingId
                ? "PUT"
                : "POST";

            const response = await fetch(url, {
                method,

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`,
                },

                body: JSON.stringify({
                    jobTitle:
                        formData.jobTitle,

                    company:
                        formData.company,

                    location:
                        formData.location,

                    description:
                        formData.description,

                    startDate:
                        formData.startDate,

                    endDate:
                        formData.isCurrent
                            ? null
                            : formData.endDate ||
                              null,

                    isCurrent:
                        formData.isCurrent,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save experience"
                );
            }

            setSuccess(
                editingId
                    ? "Experience updated successfully."
                    : "Experience added successfully."
            );

            resetForm();

            await fetchExperiences();
        } catch (error) {
            console.error(
                "Error saving experience:",
                error
            );

            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       EDIT EXPERIENCE
    ========================================================= */

    const handleEdit = (experience) => {
        setEditingId(experience.id);

        setFormData({
            jobTitle:
                experience.jobTitle || "",

            company:
                experience.company || "",

            location:
                experience.location || "",

            description:
                experience.description || "",

            startDate:
                experience.startDate
                    ? experience.startDate.split(
                          "T"
                      )[0]
                    : "",

            endDate:
                experience.endDate
                    ? experience.endDate.split(
                          "T"
                      )[0]
                    : "",

            isCurrent:
                experience.isCurrent || false,
        });

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

    const openDeleteModal = (experience) => {
        setError("");
        setSuccess("");

        setDeleteModal({
            isOpen: true,
            experience,
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
            experience: null,
        });
    };

    /* =========================================================
       DELETE EXPERIENCE
    ========================================================= */

    const handleDelete = async () => {
        const experience =
            deleteModal.experience;

        if (!experience) {
            return;
        }

        try {
            setDeletingId(experience.id);
            setError("");
            setSuccess("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `${API_BASE_URL}/api/experiences/${experience.id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to delete experience"
                );
            }

            setSuccess(
                "Experience deleted successfully."
            );

            if (editingId === experience.id) {
                resetForm();
            }

            setDeleteModal({
                isOpen: false,
                experience: null,
            });

            await fetchExperiences();
        } catch (error) {
            console.error(
                "Error deleting experience:",
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
       RENDER
    ========================================================= */

    return (
        <div className="experience-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="experience-page-header">

                <div className="experience-header-content">

                    <div className="experience-header-text">

                        <span className="experience-eyebrow">
                            Portfolio Management
                        </span>

                        <h1>
                            Experience
                        </h1>

                        <p>
                            Build and manage the
                            professional journey
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
                        className="experience-dashboard-button"
                    >

                        <span className="experience-dashboard-icon">
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
                <div className="experience-alert experience-alert-error">

                    <span className="experience-alert-icon">
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
                        className="experience-alert-close"
                    >
                        ×
                    </button>

                </div>
            )}

            {success && (
                <div className="experience-alert experience-alert-success">

                    <span className="experience-alert-icon">
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
                        className="experience-alert-close"
                    >
                        ×
                    </button>

                </div>
            )}

            {/* =================================================
                FORM CARD
            ================================================= */}

            <section className="experience-form-card">

                <div className="experience-card-header">

                    <div>

                        <span className="experience-section-label">
                            {editingId
                                ? "Editing Record"
                                : "New Record"}
                        </span>

                        <h2>
                            {editingId
                                ? "Edit Experience"
                                : "Add Experience"}
                        </h2>

                        <p>
                            Add the details of a
                            professional role to
                            your portfolio.
                        </p>

                    </div>

                    <div className="experience-card-icon">
                        +
                    </div>

                </div>

                <form
                    className="experience-form"
                    onSubmit={handleSubmit}
                >

                    {/* JOB TITLE */}

                    <div className="experience-form-group experience-form-full">

                        <label htmlFor="jobTitle">
                            Job Title
                        </label>

                        <input
                            id="jobTitle"
                            name="jobTitle"
                            type="text"
                            value={
                                formData.jobTitle
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. Data Analytics Instructor"
                            required
                        />

                    </div>

                    {/* COMPANY */}

                    <div className="experience-form-group">

                        <label htmlFor="company">
                            Company
                        </label>

                        <input
                            id="company"
                            name="company"
                            type="text"
                            value={
                                formData.company
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. Picsloop Academy"
                            required
                        />

                    </div>

                    {/* LOCATION */}

                    <div className="experience-form-group">

                        <label htmlFor="location">
                            Location
                        </label>

                        <input
                            id="location"
                            name="location"
                            type="text"
                            value={
                                formData.location
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. Lagos, Nigeria"
                        />

                    </div>

                    {/* START DATE */}

                    <div className="experience-form-group">

                        <label htmlFor="startDate">
                            Start Date
                        </label>

                        <input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={
                                formData.startDate
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                    </div>

                    {/* END DATE */}

                    <div className="experience-form-group">

                        <label htmlFor="endDate">
                            End Date
                        </label>

                        <input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={
                                formData.endDate
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                formData.isCurrent
                            }
                        />

                    </div>

                    {/* CURRENT POSITION */}

                    <div className="experience-current-wrapper experience-form-full">

                        <label className="experience-checkbox-label">

                            <input
                                name="isCurrent"
                                type="checkbox"
                                checked={
                                    formData.isCurrent
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <span className="experience-custom-checkbox">
                                <span>
                                    ✓
                                </span>
                            </span>

                            <span>

                                <strong>
                                    I currently work here
                                </strong>

                                <small>
                                    Mark this role as your
                                    current position.
                                </small>

                            </span>

                        </label>

                    </div>

                    {/* DESCRIPTION */}

                    <div className="experience-form-group experience-form-full">

                        <label htmlFor="description">
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            value={
                                formData.description
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Describe your responsibilities, achievements, and contributions."
                            rows="6"
                        />

                    </div>

                    {/* FORM ACTIONS */}

                    <div className="experience-form-actions experience-form-full">

                        {editingId && (
                            <button
                                type="button"
                                onClick={
                                    resetForm
                                }
                                disabled={
                                    saving
                                }
                                className="experience-button experience-button-secondary"
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={
                                saving
                            }
                            className="experience-button experience-button-primary"
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                ? "Update Experience"
                                : "Add Experience"}
                        </button>

                    </div>

                </form>

            </section>

            {/* =================================================
                EXPERIENCE LIST
            ================================================= */}

            <section className="experience-list-section">

                <div className="experience-list-header">

                    <div>

                        <span className="experience-section-label">
                            Your Career
                        </span>

                        <h2>
                            Professional Experience
                        </h2>

                        <p>
                            Your professional roles
                            and career history.
                        </p>

                    </div>

                    <div className="experience-count">

                        <strong>
                            {experiences.length}
                        </strong>

                        <span>
                            {experiences.length === 1
                                ? "Position"
                                : "Positions"}
                        </span>

                    </div>

                </div>

                {/* LOADING */}

                {loading ? (

                    <div className="experience-loading">

                        <div className="experience-spinner" />

                        <p>
                            Loading experiences...
                        </p>

                    </div>

                ) : experiences.length === 0 ? (

                    /* EMPTY */

                    <div className="experience-empty">

                        <div className="experience-empty-icon">
                            +
                        </div>

                        <h3>
                            No experience yet
                        </h3>

                        <p>
                            Add your first professional
                            experience using the form
                            above.
                        </p>

                    </div>

                ) : (

                    /* EXPERIENCE RECORDS */

                    <div className="experience-list">

                        {experiences.map(
                            (experience) => (
                                <article
                                    key={
                                        experience.id
                                    }
                                    className="experience-item"
                                >

                                    {/* TIMELINE MARKER */}

                                    <div className="experience-item-marker">
                                        <span />
                                    </div>

                                    {/* EXPERIENCE CONTENT */}

                                    <div className="experience-item-content">

                                        <div className="experience-item-top">

                                            <div>

                                                <div className="experience-item-title-row">

                                                    <h3>
                                                        {
                                                            experience.jobTitle
                                                        }
                                                    </h3>

                                                    {experience.isCurrent && (
                                                        <span className="experience-current-badge">
                                                            Current
                                                        </span>
                                                    )}

                                                </div>

                                                <div className="experience-company">

                                                    {
                                                        experience.company
                                                    }

                                                    {experience.location && (
                                                        <>
                                                            <span>
                                                                •
                                                            </span>

                                                            {
                                                                experience.location
                                                            }
                                                        </>
                                                    )}

                                                </div>

                                            </div>

                                            {/* DATE */}

                                            <div className="experience-date">

                                                <span>
                                                    {
                                                        formatDate(
                                                            experience.startDate
                                                        )
                                                    }
                                                </span>

                                                <span className="experience-date-separator">
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

                                        </div>

                                        {/* DESCRIPTION */}

                                        {experience.description && (
                                            <p className="experience-description">
                                                {
                                                    experience.description
                                                }
                                            </p>
                                        )}

                                        {/* ACTIONS */}

                                        <div className="experience-item-actions">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(
                                                        experience
                                                    )
                                                }
                                                className="experience-action experience-action-edit"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openDeleteModal(
                                                        experience
                                                    )
                                                }
                                                disabled={
                                                    deletingId ===
                                                    experience.id
                                                }
                                                className="experience-action experience-action-delete"
                                            >
                                                {deletingId ===
                                                experience.id
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
                deleteModal.experience && (
                    <div
                        className="experience-modal-overlay"
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
                            className="experience-delete-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="experience-delete-title"
                            onMouseDown={(event) =>
                                event.stopPropagation()
                            }
                        >

                            {/* MODAL ICON */}

                            <div className="experience-delete-icon-wrapper">

                                <div className="experience-delete-icon">

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
                                            d="M19 6L18.4 19.2C18.355 20.1948 17.5348 21 16.5389 21H7.4611C6.46524 21 5.64498 20.1948 5.6 19.2L5 6"
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

                            <div className="experience-delete-content">

                                <span className="experience-delete-eyebrow">
                                    Delete Record
                                </span>

                                <h2 id="experience-delete-title">
                                    Delete Experience?
                                </h2>

                                <p>
                                    Are you sure you want
                                    to permanently delete
                                    this professional
                                    experience? This action
                                    cannot be undone.
                                </p>

                                <div className="experience-delete-record">

                                    <strong>
                                        {
                                            deleteModal
                                                .experience
                                                .jobTitle
                                        }
                                    </strong>

                                    <span>
                                        {
                                            deleteModal
                                                .experience
                                                .company
                                        }
                                    </span>

                                </div>

                            </div>

                            {/* MODAL ACTIONS */}

                            <div className="experience-delete-actions">

                                <button
                                    type="button"
                                    onClick={
                                        closeDeleteModal
                                    }
                                    disabled={
                                        deletingId !==
                                        null
                                    }
                                    className="experience-delete-cancel"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleDelete
                                    }
                                    disabled={
                                        deletingId !==
                                        null
                                    }
                                    className="experience-delete-confirm"
                                >

                                    {deletingId !==
                                    null ? (
                                        <>
                                            <span className="experience-delete-spinner" />

                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            Delete Experience
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

export default Experience;