import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Education.css";

const API_BASE_URL = "http://localhost:5000";

const initialFormData = {
    institution: "",
    degree: "",
    fieldOfStudy: "",
    description: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
};

function Education() {
    const navigate = useNavigate();

    const [educations, setEducations] = useState([]);
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
        education: null,
    });


    /* =========================================================
       GET TOKEN
    ========================================================= */

    const getToken = () => {
        return localStorage.getItem("token");
    };


    /* =========================================================
       LOAD EDUCATION
    ========================================================= */

    useEffect(() => {
        let cancelled = false;

        const loadEducations = async () => {
            try {
                setLoading(true);
                setError("");

                const token = getToken();

                if (!token) {
                    throw new Error(
                        "You are not authenticated. Please log in again."
                    );
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/education/me`,
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
                            "Failed to fetch education"
                    );
                }

                if (!cancelled) {
                    setEducations(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error(
                    "Error fetching education:",
                    error
                );

                if (!cancelled) {
                    setError(error.message);
                    setLoading(false);
                }
            }
        };

        loadEducations();

        return () => {
            cancelled = true;
        };
    }, []);


    /* =========================================================
       REFRESH EDUCATION
    ========================================================= */

    const fetchEducations = async () => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `${API_BASE_URL}/api/education/me`,
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
                        "Failed to fetch education"
                );
            }

            setEducations(data);
        } catch (error) {
            console.error(
                "Error refreshing education:",
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
                ? `${API_BASE_URL}/api/education/${editingId}`
                : `${API_BASE_URL}/api/education`;

            const method = editingId
                ? "PUT"
                : "POST";

            const response = await fetch(
                url,
                {
                    method,

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        institution:
                            formData.institution,

                        degree:
                            formData.degree,

                        fieldOfStudy:
                            formData.fieldOfStudy,

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
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save education"
                );
            }

            setSuccess(
                editingId
                    ? "Education updated successfully."
                    : "Education added successfully."
            );

            resetForm();

            await fetchEducations();
        } catch (error) {
            console.error(
                "Error saving education:",
                error
            );

            setError(error.message);
        } finally {
            setSaving(false);
        }
    };


    /* =========================================================
       EDIT EDUCATION
    ========================================================= */

    const handleEdit = (education) => {
        setEditingId(education.id);

        setFormData({
            institution:
                education.institution || "",

            degree:
                education.degree || "",

            fieldOfStudy:
                education.fieldOfStudy || "",

            description:
                education.description || "",

            startDate:
                education.startDate
                    ? education.startDate.split(
                          "T"
                      )[0]
                    : "",

            endDate:
                education.endDate
                    ? education.endDate.split(
                          "T"
                      )[0]
                    : "",

            isCurrent:
                education.isCurrent || false,
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

    const openDeleteModal = (education) => {
        setError("");
        setSuccess("");

        setDeleteModal({
            isOpen: true,
            education,
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
            education: null,
        });
    };


    /* =========================================================
       DELETE EDUCATION
    ========================================================= */

    const handleDelete = async () => {
        const education = deleteModal.education;

        if (!education) {
            return;
        }

        try {
            setDeletingId(education.id);
            setError("");
            setSuccess("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `${API_BASE_URL}/api/education/${education.id}`,
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
                        "Failed to delete education"
                );
            }

            setSuccess(
                "Education deleted successfully."
            );

            if (editingId === education.id) {
                resetForm();
            }

            setDeleteModal({
                isOpen: false,
                education: null,
            });

            await fetchEducations();
        } catch (error) {
            console.error(
                "Error deleting education:",
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
        <div className="education-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="education-page-header">

                <div className="education-header-content">

                    <div className="education-header-text">

                        <span className="education-eyebrow">
                            Portfolio Management
                        </span>

                        <h1>
                            Education
                        </h1>

                        <p>
                            Build and manage the
                            academic background
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
                        className="education-dashboard-button"
                    >

                        <span className="education-dashboard-icon">
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
                <div className="education-alert education-alert-error">

                    <span className="education-alert-icon">
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
                        className="education-alert-close"
                    >
                        ×
                    </button>

                </div>
            )}


            {success && (
                <div className="education-alert education-alert-success">

                    <span className="education-alert-icon">
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
                        className="education-alert-close"
                    >
                        ×
                    </button>

                </div>
            )}


            {/* =================================================
                EDUCATION FORM
            ================================================= */}

            <section className="education-form-card">

                <div className="education-card-header">

                    <div>

                        <span className="education-section-label">
                            {editingId
                                ? "Editing Record"
                                : "New Record"}
                        </span>

                        <h2>
                            {editingId
                                ? "Edit Education"
                                : "Add Education"}
                        </h2>

                        <p>
                            Add the details of an
                            academic qualification
                            to your portfolio.
                        </p>

                    </div>

                    <div className="education-card-icon">
                        +
                    </div>

                </div>


                <form
                    className="education-form"
                    onSubmit={handleSubmit}
                >

                    {/* INSTITUTION */}

                    <div className="education-form-group education-form-full">

                        <label htmlFor="institution">
                            Institution
                        </label>

                        <input
                            id="institution"
                            name="institution"
                            type="text"
                            value={
                                formData.institution
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. University of Ibadan"
                            required
                        />

                    </div>


                    {/* DEGREE */}

                    <div className="education-form-group">

                        <label htmlFor="degree">
                            Degree
                        </label>

                        <input
                            id="degree"
                            name="degree"
                            type="text"
                            value={
                                formData.degree
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. Bachelor's Degree"
                            required
                        />

                    </div>


                    {/* FIELD OF STUDY */}

                    <div className="education-form-group">

                        <label htmlFor="fieldOfStudy">
                            Field of Study
                        </label>

                        <input
                            id="fieldOfStudy"
                            name="fieldOfStudy"
                            type="text"
                            value={
                                formData.fieldOfStudy
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. English Language"
                        />

                    </div>


                    {/* START DATE */}

                    <div className="education-form-group">

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

                    <div className="education-form-group">

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


                    {/* CURRENT EDUCATION */}

                    <div className="education-current-wrapper education-form-full">

                        <label className="education-checkbox-label">

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

                            <span className="education-custom-checkbox">
                                <span>
                                    ✓
                                </span>
                            </span>

                            <span>

                                <strong>
                                    I am currently studying here
                                </strong>

                                <small>
                                    Mark this education as
                                    your current program.
                                </small>

                            </span>

                        </label>

                    </div>


                    {/* DESCRIPTION */}

                    <div className="education-form-group education-form-full">

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
                            placeholder="Describe your program, academic focus, relevant coursework, achievements, or other details."
                            rows="6"
                        />

                    </div>


                    {/* FORM ACTIONS */}

                    <div className="education-form-actions education-form-full">

                        {editingId && (
                            <button
                                type="button"
                                onClick={
                                    resetForm
                                }
                                disabled={
                                    saving
                                }
                                className="education-button education-button-secondary"
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={
                                saving
                            }
                            className="education-button education-button-primary"
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                ? "Update Education"
                                : "Add Education"}
                        </button>

                    </div>

                </form>

            </section>


            {/* =================================================
                EDUCATION LIST
            ================================================= */}

            <section className="education-list-section">

                <div className="education-list-header">

                    <div>

                        <span className="education-section-label">
                            Academic Background
                        </span>

                        <h2>
                            Education History
                        </h2>

                        <p>
                            Your academic qualifications
                            and educational background.
                        </p>

                    </div>


                    <div className="education-count">

                        <strong>
                            {educations.length}
                        </strong>

                        <span>
                            {educations.length === 1
                                ? "Record"
                                : "Records"}
                        </span>

                    </div>

                </div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading ? (

                    <div className="education-loading">

                        <div className="education-spinner" />

                        <p>
                            Loading education...
                        </p>

                    </div>

                ) : educations.length === 0 ? (

                    /* =================================================
                       EMPTY
                    ================================================= */

                    <div className="education-empty">

                        <div className="education-empty-icon">
                            +
                        </div>

                        <h3>
                            No education yet
                        </h3>

                        <p>
                            Add your first academic
                            qualification using the
                            form above.
                        </p>

                    </div>

                ) : (

                    /* =================================================
                       EDUCATION RECORDS
                    ================================================= */

                    <div className="education-list">

                        {educations.map(
                            (education) => (
                                <article
                                    key={
                                        education.id
                                    }
                                    className="education-item"
                                >

                                    {/* TIMELINE MARKER */}

                                    <div className="education-item-marker">

                                        <span />

                                    </div>


                                    {/* EDUCATION CONTENT */}

                                    <div className="education-item-content">

                                        <div className="education-item-top">

                                            <div>

                                                <div className="education-item-title-row">

                                                    <h3>
                                                        {
                                                            education.degree
                                                        }
                                                    </h3>

                                                    {education.isCurrent && (
                                                        <span className="education-current-badge">
                                                            Current
                                                        </span>
                                                    )}

                                                </div>


                                                <div className="education-institution">

                                                    <span>
                                                        {
                                                            education.institution
                                                        }
                                                    </span>

                                                    {education.fieldOfStudy && (
                                                        <>
                                                            <span>
                                                                •
                                                            </span>

                                                            <span>
                                                                {
                                                                    education.fieldOfStudy
                                                                }
                                                            </span>
                                                        </>
                                                    )}

                                                </div>

                                            </div>


                                            {/* DATE */}

                                            <div className="education-date">

                                                <span>
                                                    {formatDate(
                                                        education.startDate
                                                    )}
                                                </span>

                                                <span className="education-date-separator">
                                                    —
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
                                            <p className="education-description">
                                                {
                                                    education.description
                                                }
                                            </p>
                                        )}


                                        {/* ACTIONS */}

                                        <div className="education-item-actions">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(
                                                        education
                                                    )
                                                }
                                                className="education-action education-action-edit"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openDeleteModal(
                                                        education
                                                    )
                                                }
                                                disabled={
                                                    deletingId ===
                                                    education.id
                                                }
                                                className="education-action education-action-delete"
                                            >
                                                {deletingId ===
                                                education.id
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
                deleteModal.education && (
                    <div
                        className="education-modal-overlay"
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
                            className="education-delete-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="education-delete-title"
                            onMouseDown={(event) =>
                                event.stopPropagation()
                            }
                        >

                            {/* MODAL ICON */}

                            <div className="education-delete-icon-wrapper">

                                <div className="education-delete-icon">
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

                            <div className="education-delete-content">

                                <span className="education-delete-eyebrow">
                                    Delete Record
                                </span>

                                <h2 id="education-delete-title">
                                    Delete Education?
                                </h2>

                                <p>
                                    Are you sure you want
                                    to permanently delete
                                    this education record?
                                    This action cannot be
                                    undone.
                                </p>

                                <div className="education-delete-record">

                                    <strong>
                                        {
                                            deleteModal
                                                .education
                                                .degree
                                        }
                                    </strong>

                                    <span>
                                        {
                                            deleteModal
                                                .education
                                                .institution
                                        }
                                    </span>

                                </div>

                            </div>


                            {/* MODAL ACTIONS */}

                            <div className="education-delete-actions">

                                <button
                                    type="button"
                                    onClick={
                                        closeDeleteModal
                                    }
                                    disabled={
                                        deletingId !==
                                        null
                                    }
                                    className="education-delete-cancel"
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
                                    className="education-delete-confirm"
                                >

                                    {deletingId !==
                                    null ? (
                                        <>
                                            <span className="education-delete-spinner" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            Delete Education
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

export default Education;


