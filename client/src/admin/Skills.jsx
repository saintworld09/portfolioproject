import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Skills.css";

import { API_BASE_URL } from "../config";

const initialFormData = {
    name: "",
    category: "",
    proficiency: "",
    sortOrder: 0,
};

function Skills() {
    const navigate = useNavigate();

    const [skills, setSkills] = useState([]);
    const [formData, setFormData] = useState(initialFormData);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Delete confirmation modal
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        skill: null,
    });

    /* =========================================================
       GET TOKEN
    ========================================================= */

    const getToken = () => {
        return localStorage.getItem("token");
    };

    /* =========================================================
       LOAD SKILLS
       ADMIN ONLY - CURRENT USER'S SKILLS
    ========================================================= */

    useEffect(() => {
        let cancelled = false;

        const loadSkills = async () => {
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
                    `${API_BASE_URL}/api/skills/me`,
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
                            "Failed to fetch skills"
                    );
                }

                if (!cancelled) {
                    setSkills(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error(
                    "Error fetching skills:",
                    error
                );

                if (!cancelled) {
                    setError(error.message);
                    setLoading(false);
                }
            }
        };

        loadSkills();

        return () => {
            cancelled = true;
        };
    }, []);

    /* =========================================================
       REFRESH SKILLS
       ADMIN ONLY - CURRENT USER'S SKILLS
    ========================================================= */

    const fetchSkills = async () => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `${API_BASE_URL}/api/skills/me`,
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
                        "Failed to fetch skills"
                );
            }

            setSkills(data);
        } catch (error) {
            console.error(
                "Error refreshing skills:",
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
        } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
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
                ? `${API_BASE_URL}/api/skills/${editingId}`
                : `${API_BASE_URL}/api/skills`;

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
                        name:
                            formData.name.trim(),

                        category:
                            formData.category.trim(),

                        proficiency:
                            formData.proficiency === ""
                                ? null
                                : Number(
                                      formData.proficiency
                                  ),

                        sortOrder:
                            formData.sortOrder === ""
                                ? 0
                                : Number(
                                      formData.sortOrder
                                  ),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save skill"
                );
            }

            setSuccess(
                editingId
                    ? "Skill updated successfully."
                    : "Skill added successfully."
            );

            resetForm();

            await fetchSkills();
        } catch (error) {
            console.error(
                "Error saving skill:",
                error
            );

            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       EDIT SKILL
    ========================================================= */

    const handleEdit = (skill) => {
        setEditingId(skill.id);

        setFormData({
            name:
                skill.name || "",

            category:
                skill.category || "",

            proficiency:
                skill.proficiency !== null &&
                skill.proficiency !== undefined
                    ? String(
                          skill.proficiency
                      )
                    : "",

            sortOrder:
                skill.sortOrder !== null &&
                skill.sortOrder !== undefined
                    ? String(
                          skill.sortOrder
                      )
                    : "0",
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

    const openDeleteModal = (skill) => {
        setError("");
        setSuccess("");

        setDeleteModal({
            isOpen: true,
            skill,
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
            skill: null,
        });
    };

    /* =========================================================
       DELETE SKILL
    ========================================================= */

    const handleDelete = async () => {
        const skill = deleteModal.skill;

        if (!skill) {
            return;
        }

        try {
            setDeletingId(skill.id);
            setError("");
            setSuccess("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `${API_BASE_URL}/api/skills/${skill.id}`,
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
                        "Failed to delete skill"
                );
            }

            setSuccess(
                "Skill deleted successfully."
            );

            if (editingId === skill.id) {
                resetForm();
            }

            setDeleteModal({
                isOpen: false,
                skill: null,
            });

            await fetchSkills();
        } catch (error) {
            console.error(
                "Error deleting skill:",
                error
            );

            setError(error.message);
        } finally {
            setDeletingId(null);
        }
    };

    /* =========================================================
       PROFICIENCY LABEL
    ========================================================= */

    const getProficiencyLabel = (
        proficiency
    ) => {
        if (
            proficiency === null ||
            proficiency === undefined
        ) {
            return "Not specified";
        }

        if (proficiency >= 90) {
            return "Expert";
        }

        if (proficiency >= 75) {
            return "Advanced";
        }

        if (proficiency >= 50) {
            return "Intermediate";
        }

        if (proficiency >= 25) {
            return "Developing";
        }

        return "Beginner";
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="skills-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="skills-page-header">

                <div className="skills-header-content">

                    <div className="skills-header-text">

                        <span className="skills-eyebrow">
                            Portfolio Management
                        </span>

                        <h1>
                            Skills
                        </h1>

                        <p>
                            Build and manage the
                            professional skills
                            displayed on your
                            portfolio.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
                        }
                        className="skills-dashboard-button"
                    >

                        <span className="skills-dashboard-icon">
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
                <div className="skills-alert skills-alert-error">

                    <span className="skills-alert-icon">
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
                        className="skills-alert-close"
                    >
                        ×
                    </button>

                </div>
            )}

            {success && (
                <div className="skills-alert skills-alert-success">

                    <span className="skills-alert-icon">
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
                        className="skills-alert-close"
                    >
                        ×
                    </button>

                </div>
            )}

            {/* =================================================
                SKILL FORM
            ================================================= */}

            <section className="skills-form-card">

                <div className="skills-card-header">

                    <div>

                        <span className="skills-section-label">
                            {editingId
                                ? "Editing Skill"
                                : "New Skill"}
                        </span>

                        <h2>
                            {editingId
                                ? "Edit Skill"
                                : "Add Skill"}
                        </h2>

                        <p>
                            Add a professional skill
                            and define how it should
                            appear on your portfolio.
                        </p>

                    </div>

                    <div className="skills-card-icon">
                        +
                    </div>

                </div>

                <form
                    className="skills-form"
                    onSubmit={handleSubmit}
                >

                    {/* =================================================
                        SKILL NAME
                    ================================================= */}

                    <div className="skills-form-group skills-form-full">

                        <label htmlFor="name">
                            Skill Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={
                                formData.name
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. Power BI"
                            required
                        />

                    </div>

                    {/* =================================================
                        CATEGORY
                    ================================================= */}

                    <div className="skills-form-group">

                        <label htmlFor="category">
                            Category
                        </label>

                        <input
                            id="category"
                            name="category"
                            type="text"
                            value={
                                formData.category
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. Data Analytics"
                        />

                        <small>
                            Examples: Data Analytics,
                            Programming, Database,
                            Visualization
                        </small>

                    </div>

                    {/* =================================================
                        PROFICIENCY
                    ================================================= */}

                    <div className="skills-form-group">

                        <label htmlFor="proficiency">
                            Proficiency
                        </label>

                        <div className="skills-input-with-suffix">

                            <input
                                id="proficiency"
                                name="proficiency"
                                type="number"
                                min="0"
                                max="100"
                                value={
                                    formData.proficiency
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="e.g. 85"
                            />

                            <span>
                                %
                            </span>

                        </div>

                        <small>
                            Enter a value between
                            0 and 100.
                        </small>

                    </div>

                    {/* =================================================
                        SORT ORDER
                    ================================================= */}

                    <div className="skills-form-group">

                        <label htmlFor="sortOrder">
                            Display Order
                        </label>

                        <input
                            id="sortOrder"
                            name="sortOrder"
                            type="number"
                            min="0"
                            value={
                                formData.sortOrder
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. 1"
                        />

                        <small>
                            Lower numbers appear
                            first.
                        </small>

                    </div>

                    {/* =================================================
                        PREVIEW
                    ================================================= */}

                    <div className="skills-preview-wrapper skills-form-full">

                        <div className="skills-preview-label">
                            Live Preview
                        </div>

                        <div className="skills-preview">

                            <div className="skills-preview-main">

                                <div className="skills-preview-icon">
                                    ✦
                                </div>

                                <div>

                                    <strong>
                                        {formData.name ||
                                            "Skill Name"}
                                    </strong>

                                    <span>
                                        {formData.category ||
                                            "Skill Category"}
                                    </span>

                                </div>

                            </div>

                            <div className="skills-preview-level">

                                <div className="skills-preview-level-text">

                                    <span>
                                        Proficiency
                                    </span>

                                    <strong>
                                        {formData.proficiency ===
                                        ""
                                            ? "—"
                                            : `${formData.proficiency}%`}
                                    </strong>

                                </div>

                                <div className="skills-preview-bar">

                                    <span
                                        style={{
                                            width:
                                                `${Math.min(
                                                    Math.max(
                                                        Number(
                                                            formData.proficiency
                                                        ) ||
                                                            0,
                                                        0
                                                    ),
                                                    100
                                                )}%`,
                                        }}
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        FORM ACTIONS
                    ================================================= */}

                    <div className="skills-form-actions skills-form-full">

                        {editingId && (
                            <button
                                type="button"
                                onClick={
                                    resetForm
                                }
                                disabled={
                                    saving
                                }
                                className="skills-button skills-button-secondary"
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={
                                saving
                            }
                            className="skills-button skills-button-primary"
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                ? "Update Skill"
                                : "Add Skill"}
                        </button>

                    </div>

                </form>

            </section>

            {/* =================================================
                SKILLS LIST
            ================================================= */}

            <section className="skills-list-section">

                <div className="skills-list-header">

                    <div>

                        <span className="skills-section-label">
                            Professional Toolkit
                        </span>

                        <h2>
                            Skills Library
                        </h2>

                        <p>
                            Manage the skills,
                            categories, proficiency
                            levels, and display order
                            shown on your portfolio.
                        </p>

                    </div>

                    <div className="skills-count">

                        <strong>
                            {skills.length}
                        </strong>

                        <span>
                            {skills.length === 1
                                ? "Skill"
                                : "Skills"}
                        </span>

                    </div>

                </div>

                {/* =================================================
                    LOADING
                ================================================= */}

                {loading ? (

                    <div className="skills-loading">

                        <div className="skills-spinner" />

                        <p>
                            Loading skills...
                        </p>

                    </div>

                ) : skills.length === 0 ? (

                    /* =================================================
                       EMPTY
                    ================================================= */

                    <div className="skills-empty">

                        <div className="skills-empty-icon">
                            ✦
                        </div>

                        <h3>
                            No skills yet
                        </h3>

                        <p>
                            Add your first professional
                            skill using the form above.
                        </p>

                    </div>

                ) : (

                    /* =================================================
                       SKILLS GRID
                    ================================================= */

                    <div className="skills-grid">

                        {skills.map(
                            (skill) => (
                                <article
                                    key={
                                        skill.id
                                    }
                                    className="skills-item"
                                >

                                    {/* =================================================
                                        CARD TOP
                                    ================================================= */}

                                    <div className="skills-item-top">

                                        <div className="skills-item-icon">
                                            ✦
                                        </div>

                                        <div className="skills-item-heading">

                                            <div className="skills-item-title-row">

                                                <h3>
                                                    {
                                                        skill.name
                                                    }
                                                </h3>

                                                <span className="skills-sort-number">
                                                    #
                                                    {
                                                        skill.sortOrder
                                                    }
                                                </span>

                                            </div>

                                            {skill.category && (
                                                <span className="skills-category">
                                                    {
                                                        skill.category
                                                    }
                                                </span>
                                            )}

                                        </div>

                                    </div>

                                    {/* =================================================
                                        PROFICIENCY
                                    ================================================= */}

                                    <div className="skills-item-proficiency">

                                        <div className="skills-proficiency-header">

                                            <div>

                                                <span>
                                                    Proficiency
                                                </span>

                                                <strong>
                                                    {skill.proficiency !==
                                                    null &&
                                                    skill.proficiency !==
                                                    undefined
                                                        ? `${skill.proficiency}%`
                                                        : "—"}
                                                </strong>

                                            </div>

                                            <span className="skills-proficiency-label">
                                                {getProficiencyLabel(
                                                    skill.proficiency
                                                )}
                                            </span>

                                        </div>

                                        <div className="skills-progress">

                                            <span
                                                style={{
                                                    width:
                                                        `${Math.min(
                                                            Math.max(
                                                                Number(
                                                                    skill.proficiency
                                                                ) ||
                                                                    0,
                                                                0
                                                            ),
                                                            100
                                                        )}%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                    {/* =================================================
                                        ACTIONS
                                    ================================================= */}

                                    <div className="skills-item-footer">

                                        <span className="skills-order-label">
                                            Display order:{" "}
                                            {
                                                skill.sortOrder
                                            }
                                        </span>

                                        <div className="skills-item-actions">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(
                                                        skill
                                                    )
                                                }
                                                className="skills-action skills-action-edit"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openDeleteModal(
                                                        skill
                                                    )
                                                }
                                                disabled={
                                                    deletingId ===
                                                    skill.id
                                                }
                                                className="skills-action skills-action-delete"
                                            >
                                                {deletingId ===
                                                skill.id
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
                deleteModal.skill && (
                    <div
                        className="skills-modal-overlay"
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
                            className="skills-delete-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="skills-delete-title"
                            onMouseDown={(event) =>
                                event.stopPropagation()
                            }
                        >

                            {/* =================================================
                                MODAL ICON
                            ================================================= */}

                            <div className="skills-delete-icon-wrapper">

                                <div className="skills-delete-icon">

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

                            {/* =================================================
                                MODAL CONTENT
                            ================================================= */}

                            <div className="skills-delete-content">

                                <span className="skills-delete-eyebrow">
                                    Delete Skill
                                </span>

                                <h2 id="skills-delete-title">
                                    Delete Skill?
                                </h2>

                                <p>
                                    Are you sure you want
                                    to permanently delete
                                    this skill? This action
                                    cannot be undone.
                                </p>

                                <div className="skills-delete-record">

                                    <strong>
                                        {
                                            deleteModal
                                                .skill
                                                .name
                                        }
                                    </strong>

                                    {deleteModal
                                        .skill
                                        .category && (
                                        <span>
                                            {
                                                deleteModal
                                                    .skill
                                                    .category
                                            }
                                        </span>
                                    )}

                                </div>

                            </div>

                            {/* =================================================
                                MODAL ACTIONS
                            ================================================= */}

                            <div className="skills-delete-actions">

                                <button
                                    type="button"
                                    onClick={
                                        closeDeleteModal
                                    }
                                    disabled={
                                        deletingId !==
                                        null
                                    }
                                    className="skills-delete-cancel"
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
                                    className="skills-delete-confirm"
                                >

                                    {deletingId !==
                                    null ? (
                                        <>
                                            <span className="skills-delete-spinner" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            Delete Skill
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

export default Skills;
