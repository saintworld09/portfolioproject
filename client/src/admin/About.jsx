import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/AdminAbout.css";

import { API_BASE_URL } from "../config";

function About() {
    const [processItems, setProcessItems] = useState([]);
    const [skillItems, setSkillItems] = useState([]);
    const [focusItems, setFocusItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingProcessId, setEditingProcessId] =
        useState(null);

    const [editingSkillId, setEditingSkillId] =
        useState(null);

    const [editingFocusId, setEditingFocusId] =
        useState(null);

    // ========================================
    // DELETE MODAL
    // ========================================

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: "",
        id: null,
        title: "",
    });

    // ========================================
    // PROCESS FORM
    // ========================================

    const [processForm, setProcessForm] = useState({
        stepNumber: "",
        title: "",
        description: "",
        icon: null,
        sortOrder: "",
        isActive: true,
    });

    // ========================================
    // SKILL FORM
    // ========================================

    const [skillForm, setSkillForm] = useState({
        title: "",
        description: "",
        icon: null,
        sortOrder: "",
        isActive: true,
    });

    // ========================================
    // FOCUS FORM
    // ========================================

    const [focusForm, setFocusForm] = useState({
        title: "",
        description: "",
        icon: null,
        sortOrder: "",
        isActive: true,
    });

    // ========================================
    // GET AUTH TOKEN
    // ========================================

    const getToken = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error(
                "You are not authenticated. Please log in again."
            );
        }

        return token;
    };

    // ========================================
    // GET IMAGE URL
    // ========================================

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) {
            return null;
        }

        if (imageUrl.startsWith("http")) {
            return imageUrl;
        }

        return `${API_BASE_URL}${imageUrl}`;
    };

    // ========================================
    // GET FILE PREVIEW URL
    // ========================================

    const getFilePreviewUrl = (file) => {
        if (!file) {
            return null;
        }

        return URL.createObjectURL(file);
    };

    // ========================================
    // LOAD ABOUT CONTENT
    // ========================================

    useEffect(() => {
        const fetchAboutContent = async () => {
            try {
                setLoading(true);
                setError("");

                const token = getToken();

                const [
                    processResponse,
                    skillsResponse,
                    focusResponse,
                ] = await Promise.all([
                    fetch(
                        `${API_BASE_URL}/api/about/process`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    ),

                    fetch(
                        `${API_BASE_URL}/api/about/skills`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    ),

                    fetch(
                        `${API_BASE_URL}/api/about/focus`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    ),
                ]);

                const processData =
                    await processResponse.json();

                const skillsData =
                    await skillsResponse.json();

                const focusData =
                    await focusResponse.json();

                if (!processResponse.ok) {
                    throw new Error(
                        processData.message ||
                            "Failed to load About process."
                    );
                }

                if (!skillsResponse.ok) {
                    throw new Error(
                        skillsData.message ||
                            "Failed to load About skills."
                    );
                }

                if (!focusResponse.ok) {
                    throw new Error(
                        focusData.message ||
                            "Failed to load About focus."
                    );
                }

                setProcessItems(
                    Array.isArray(processData)
                        ? processData
                        : []
                );

                setSkillItems(
                    Array.isArray(skillsData)
                        ? skillsData
                        : []
                );

                setFocusItems(
                    Array.isArray(focusData)
                        ? focusData
                        : []
                );
            } catch (error) {
                console.error(
                    "Error loading About content:",
                    error
                );

                setError(
                    error.message ||
                        "Failed to load About content."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAboutContent();
    }, []);

    // ========================================
    // PROCESS FORM CHANGE
    // ========================================

    const handleProcessChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
            files,
        } = event.target;

        setProcessForm((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "file"
                    ? files?.[0] || null
                    : value,
        }));

        setError("");
        setSuccess("");
    };

    // ========================================
    // SKILL FORM CHANGE
    // ========================================

    const handleSkillChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
            files,
        } = event.target;

        setSkillForm((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "file"
                    ? files?.[0] || null
                    : value,
        }));

        setError("");
        setSuccess("");
    };

    // ========================================
    // FOCUS FORM CHANGE
    // ========================================

    const handleFocusChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
            files,
        } = event.target;

        setFocusForm((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "file"
                    ? files?.[0] || null
                    : value,
        }));

        setError("");
        setSuccess("");
    };

    // ========================================
    // RESET PROCESS FORM
    // ========================================

    const resetProcessForm = () => {
        setProcessForm({
            stepNumber: "",
            title: "",
            description: "",
            icon: null,
            sortOrder: "",
            isActive: true,
        });

        setEditingProcessId(null);
    };

    // ========================================
    // RESET SKILL FORM
    // ========================================

    const resetSkillForm = () => {
        setSkillForm({
            title: "",
            description: "",
            icon: null,
            sortOrder: "",
            isActive: true,
        });

        setEditingSkillId(null);
    };

    // ========================================
    // RESET FOCUS FORM
    // ========================================

    const resetFocusForm = () => {
        setFocusForm({
            title: "",
            description: "",
            icon: null,
            sortOrder: "",
            isActive: true,
        });

        setEditingFocusId(null);
    };

    // ========================================
    // SAVE PROCESS
    // ========================================

    const handleProcessSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const token = getToken();

            const url = editingProcessId
                ? `${API_BASE_URL}/api/about/process/${editingProcessId}`
                : `${API_BASE_URL}/api/about/process`;

            const method = editingProcessId
                ? "PUT"
                : "POST";

            const formData = new FormData();

            formData.append(
                "stepNumber",
                Number(processForm.stepNumber)
            );

            formData.append(
                "title",
                processForm.title
            );

            formData.append(
                "description",
                processForm.description
            );

            formData.append(
                "sortOrder",
                processForm.sortOrder
                    ? Number(processForm.sortOrder)
                    : 0
            );

            formData.append(
                "isActive",
                processForm.isActive
            );

            if (processForm.icon instanceof File) {
                formData.append(
                    "icon",
                    processForm.icon
                );
            }

            const response = await fetch(
                url,
                {
                    method,
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save process item."
                );
            }

            if (editingProcessId) {
                setProcessItems(
                    (current) =>
                        current.map(
                            (item) =>
                                item.id ===
                                editingProcessId
                                    ? data.process
                                    : item
                        )
                );

                setSuccess(
                    "Process item updated successfully."
                );
            } else {
                setProcessItems(
                    (current) => [
                        ...current,
                        data.process,
                    ]
                );

                setSuccess(
                    "Process item created successfully."
                );
            }

            resetProcessForm();
        } catch (error) {
            console.error(
                "Error saving process item:",
                error
            );

            setError(
                error.message ||
                    "Failed to save process item."
            );
        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // SAVE SKILL
    // ========================================

    const handleSkillSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const token = getToken();

            const url = editingSkillId
                ? `${API_BASE_URL}/api/about/skills/${editingSkillId}`
                : `${API_BASE_URL}/api/about/skills`;

            const method = editingSkillId
                ? "PUT"
                : "POST";

            const formData = new FormData();

            formData.append(
                "title",
                skillForm.title
            );

            formData.append(
                "description",
                skillForm.description
            );

            formData.append(
                "sortOrder",
                skillForm.sortOrder
                    ? Number(skillForm.sortOrder)
                    : 0
            );

            formData.append(
                "isActive",
                skillForm.isActive
            );

            if (skillForm.icon instanceof File) {
                formData.append(
                    "icon",
                    skillForm.icon
                );
            }

            const response = await fetch(
                url,
                {
                    method,
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save skill."
                );
            }

            if (editingSkillId) {
                setSkillItems(
                    (current) =>
                        current.map(
                            (item) =>
                                item.id ===
                                editingSkillId
                                    ? data.skill
                                    : item
                        )
                );

                setSuccess(
                    "Skill updated successfully."
                );
            } else {
                setSkillItems(
                    (current) => [
                        ...current,
                        data.skill,
                    ]
                );

                setSuccess(
                    "Skill created successfully."
                );
            }

            resetSkillForm();
        } catch (error) {
            console.error(
                "Error saving skill:",
                error
            );

            setError(
                error.message ||
                    "Failed to save skill."
            );
        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // SAVE FOCUS
    // ========================================

    const handleFocusSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const token = getToken();

            const url = editingFocusId
                ? `${API_BASE_URL}/api/about/focus/${editingFocusId}`
                : `${API_BASE_URL}/api/about/focus`;

            const method = editingFocusId
                ? "PUT"
                : "POST";

            const formData = new FormData();

            formData.append(
                "title",
                focusForm.title
            );

            formData.append(
                "description",
                focusForm.description
            );

            formData.append(
                "sortOrder",
                focusForm.sortOrder
                    ? Number(focusForm.sortOrder)
                    : 0
            );

            formData.append(
                "isActive",
                focusForm.isActive
            );

            if (focusForm.icon instanceof File) {
                formData.append(
                    "icon",
                    focusForm.icon
                );
            }

            const response = await fetch(
                url,
                {
                    method,
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save focus item."
                );
            }

            if (editingFocusId) {
                setFocusItems(
                    (current) =>
                        current.map(
                            (item) =>
                                item.id ===
                                editingFocusId
                                    ? data.focus
                                    : item
                        )
                );

                setSuccess(
                    "Focus item updated successfully."
                );
            } else {
                setFocusItems(
                    (current) => [
                        ...current,
                        data.focus,
                    ]
                );

                setSuccess(
                    "Focus item created successfully."
                );
            }

            resetFocusForm();
        } catch (error) {
            console.error(
                "Error saving focus item:",
                error
            );

            setError(
                error.message ||
                    "Failed to save focus item."
            );
        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // EDIT PROCESS
    // ========================================

    const handleEditProcess = (item) => {
        setEditingProcessId(item.id);

        setProcessForm({
            stepNumber:
                item.stepNumber,
            title:
                item.title,
            description:
                item.description,
            icon:
                null,
            sortOrder:
                item.sortOrder,
            isActive:
                item.isActive,
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ========================================
    // EDIT SKILL
    // ========================================

    const handleEditSkill = (item) => {
        setEditingSkillId(item.id);

        setSkillForm({
            title:
                item.title,
            description:
                item.description,
            icon:
                null,
            sortOrder:
                item.sortOrder,
            isActive:
                item.isActive,
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ========================================
    // EDIT FOCUS
    // ========================================

    const handleEditFocus = (item) => {
        setEditingFocusId(item.id);

        setFocusForm({
            title:
                item.title,
            description:
                item.description,
            icon:
                null,
            sortOrder:
                item.sortOrder,
            isActive:
                item.isActive,
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ========================================
    // OPEN DELETE MODAL - PROCESS
    // ========================================

    const handleDeleteProcess = (id, title) => {
        setDeleteModal({
            isOpen: true,
            type: "process",
            id,
            title,
        });
    };

    // ========================================
    // OPEN DELETE MODAL - SKILL
    // ========================================

    const handleDeleteSkill = (id, title) => {
        setDeleteModal({
            isOpen: true,
            type: "skill",
            id,
            title,
        });
    };

    // ========================================
    // OPEN DELETE MODAL - FOCUS
    // ========================================

    const handleDeleteFocus = (id, title) => {
        setDeleteModal({
            isOpen: true,
            type: "focus",
            id,
            title,
        });
    };

    // ========================================
    // CLOSE DELETE MODAL
    // ========================================

    const closeDeleteModal = () => {
        if (saving) {
            return;
        }

        setDeleteModal({
            isOpen: false,
            type: "",
            id: null,
            title: "",
        });
    };

    // ========================================
    // CONFIRM DELETE
    // ========================================

    const confirmDelete = async () => {
        if (
            !deleteModal.id ||
            !deleteModal.type
        ) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const token = getToken();

            let endpoint = "";
            let successMessage = "";

            if (
                deleteModal.type ===
                "process"
            ) {
                endpoint =
                    `${API_BASE_URL}/api/about/process/${deleteModal.id}`;

                successMessage =
                    "Process item deleted successfully.";
            }

            if (
                deleteModal.type ===
                "skill"
            ) {
                endpoint =
                    `${API_BASE_URL}/api/about/skills/${deleteModal.id}`;

                successMessage =
                    "Skill deleted successfully.";
            }

            if (
                deleteModal.type ===
                "focus"
            ) {
                endpoint =
                    `${API_BASE_URL}/api/about/focus/${deleteModal.id}`;

                successMessage =
                    "Focus item deleted successfully.";
            }

            const response = await fetch(
                endpoint,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to delete item."
                );
            }

            if (
                deleteModal.type ===
                "process"
            ) {
                setProcessItems(
                    (current) =>
                        current.filter(
                            (item) =>
                                item.id !==
                                deleteModal.id
                        )
                );
            }

            if (
                deleteModal.type ===
                "skill"
            ) {
                setSkillItems(
                    (current) =>
                        current.filter(
                            (item) =>
                                item.id !==
                                deleteModal.id
                        )
                );
            }

            if (
                deleteModal.type ===
                "focus"
            ) {
                setFocusItems(
                    (current) =>
                        current.filter(
                            (item) =>
                                item.id !==
                                deleteModal.id
                        )
                );
            }

            setSuccess(
                successMessage
            );

            setDeleteModal({
                isOpen: false,
                type: "",
                id: null,
                title: "",
            });
        } catch (error) {
            console.error(
                "Error deleting item:",
                error
            );

            setError(
                error.message ||
                    "Failed to delete item."
            );
        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // LOADING STATE
    // ========================================

    if (loading) {
        return (
            <div className="about-admin-page">

                <div className="about-admin-page-header">

                    <div className="about-admin-top-navigation">

                        <Link
                            to="/admin/dashboard"
                            className="about-admin-dashboard-link"
                        >
                            ← Dashboard
                        </Link>

                    </div>

                    <div className="about-admin-page-heading">

                        <h1>About</h1>

                        <p>
                            Manage the content
                            displayed on your
                            About page.
                        </p>

                    </div>

                </div>

                <div className="about-admin-form-card">

                    <div className="about-admin-loading">
                        Loading About content...
                    </div>

                </div>

            </div>
        );
    }

    // ========================================
    // MAIN PAGE
    // ========================================

    return (
        <div className="about-admin-page">

            {/* ========================================
                PAGE HEADER
            ======================================== */}

            <div className="about-admin-page-header">

                <div className="about-admin-top-navigation">

                    <Link
                        to="/admin/dashboard"
                        className="about-admin-dashboard-link"
                    >
                        ← Dashboard
                    </Link>

                </div>

                <div className="about-admin-page-heading">

                    <h1>About</h1>

                    <p>
                        Manage the content
                        displayed on your
                        About page.
                    </p>

                </div>

            </div>

            {/* ========================================
                GLOBAL MESSAGES
            ======================================== */}

            {error && (
                <div className="about-admin-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="about-admin-success">
                    {success}
                </div>
            )}

            {/* ========================================
                HOW I WORK
            ======================================== */}

            <section className="about-admin-section">

                <div className="about-admin-section-header">

                    <div>
                        <h2>
                            How I Work
                        </h2>

                        <p>
                            Manage the process
                            steps displayed in
                            the About page.
                        </p>
                    </div>

                </div>

                <div className="about-admin-form-card">

                    <form
                        onSubmit={
                            handleProcessSubmit
                        }
                    >

                        <div className="about-admin-form-row">

                            <div className="about-admin-form-group">

                                <label htmlFor="stepNumber">
                                    Step Number
                                </label>

                                <input
                                    id="stepNumber"
                                    name="stepNumber"
                                    type="number"
                                    min="1"
                                    value={
                                        processForm.stepNumber
                                    }
                                    onChange={
                                        handleProcessChange
                                    }
                                    required
                                />

                            </div>

                            <div className="about-admin-form-group">

                                <label htmlFor="processSortOrder">
                                    Sort Order
                                </label>

                                <input
                                    id="processSortOrder"
                                    name="sortOrder"
                                    type="number"
                                    min="0"
                                    value={
                                        processForm.sortOrder
                                    }
                                    onChange={
                                        handleProcessChange
                                    }
                                />

                            </div>

                        </div>

                        <div className="about-admin-form-group">

                            <label htmlFor="processTitle">
                                Title
                            </label>

                            <input
                                id="processTitle"
                                name="title"
                                type="text"
                                value={
                                    processForm.title
                                }
                                onChange={
                                    handleProcessChange
                                }
                                placeholder="Frame the Problem"
                                required
                            />

                        </div>

                        <div className="about-admin-form-group">

                            <label htmlFor="processDescription">
                                Description
                            </label>

                            <textarea
                                id="processDescription"
                                name="description"
                                rows="4"
                                value={
                                    processForm.description
                                }
                                onChange={
                                    handleProcessChange
                                }
                                placeholder="Define the business question, decision, and success criteria."
                                required
                            />

                        </div>

                        {/* PROCESS ICON UPLOAD */}

                        <div className="about-admin-form-group">

                            <label htmlFor="processIcon">
                                Icon Image
                            </label>

                            <input
                                id="processIcon"
                                name="icon"
                                type="file"
                                accept="image/*"
                                onChange={
                                    handleProcessChange
                                }
                            />

                            <small>
                                Upload an image to use
                                as the process icon.
                            </small>

                            {editingProcessId &&
                                processItems.find(
                                    (item) =>
                                        item.id ===
                                        editingProcessId
                                )?.icon && (
                                    <div className="about-admin-image-preview">

                                        <span>
                                            Current Icon
                                        </span>

                                        <img
                                            src={getImageUrl(
                                                processItems.find(
                                                    (item) =>
                                                        item.id ===
                                                        editingProcessId
                                                )?.icon
                                            )}
                                            alt="Current process icon"
                                        />

                                    </div>
                                )}

                            {processForm.icon instanceof File && (
                                <div className="about-admin-image-preview">

                                    <span>
                                        New Icon Preview
                                    </span>

                                    <img
                                        src={getFilePreviewUrl(
                                            processForm.icon
                                        )}
                                        alt="New process icon preview"
                                    />

                                </div>
                            )}

                        </div>

                        <label className="about-admin-checkbox">

                            <input
                                type="checkbox"
                                name="isActive"
                                checked={
                                    processForm.isActive
                                }
                                onChange={
                                    handleProcessChange
                                }
                            />

                            <span>
                                Active
                            </span>

                        </label>

                        <div className="about-admin-form-actions">

                            <button
                                type="submit"
                                className="about-admin-save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingProcessId
                                    ? "Update Process"
                                    : "Add Process"}
                            </button>

                            {editingProcessId && (
                                <button
                                    type="button"
                                    className="about-admin-cancel-button"
                                    onClick={
                                        resetProcessForm
                                    }
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>

                </div>

                <div className="about-admin-items">

                    {processItems.length === 0 ? (
                        <div className="about-admin-empty">
                            No process items have
                            been added yet.
                        </div>
                    ) : (
                        processItems.map(
                            (item) => (
                                <div
                                    key={item.id}
                                    className="about-admin-item"
                                >

                                    <div className="about-admin-item-content">

                                        <span className="about-admin-item-number">
                                            {
                                                item.stepNumber
                                            }
                                        </span>

                                        <div>

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

                                            {item.icon && (
                                                <img
                                                    className="about-admin-item-icon"
                                                    src={getImageUrl(
                                                        item.icon
                                                    )}
                                                    alt={`${item.title} icon`}
                                                />
                                            )}

                                            <span
                                                className={
                                                    item.isActive
                                                        ? "about-admin-status active"
                                                        : "about-admin-status inactive"
                                                }
                                            >
                                                {item.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>

                                        </div>

                                    </div>

                                    <div className="about-admin-item-actions">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEditProcess(
                                                    item
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteProcess(
                                                    item.id,
                                                    item.title
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>
                            )
                        )
                    )}

                </div>

            </section>

            {/* ========================================
                WHAT I BRING
            ======================================== */}

            <section className="about-admin-section">

                <div className="about-admin-section-header">

                    <div>

                        <h2>
                            What I Bring
                        </h2>

                        <p>
                            Manage the skills
                            and professional
                            strengths displayed
                            on the About page.
                        </p>

                    </div>

                </div>

                <div className="about-admin-form-card">

                    <form
                        onSubmit={
                            handleSkillSubmit
                        }
                    >

                        <div className="about-admin-form-group">

                            <label htmlFor="skillTitle">
                                Title
                            </label>

                            <input
                                id="skillTitle"
                                name="title"
                                type="text"
                                value={
                                    skillForm.title
                                }
                                onChange={
                                    handleSkillChange
                                }
                                placeholder="Business Thinking"
                                required
                            />

                        </div>

                        <div className="about-admin-form-group">

                            <label htmlFor="skillDescription">
                                Description
                            </label>

                            <textarea
                                id="skillDescription"
                                name="description"
                                rows="4"
                                value={
                                    skillForm.description
                                }
                                onChange={
                                    handleSkillChange
                                }
                                placeholder="Connect analytical work to business goals, decisions, and measurable outcomes."
                                required
                            />

                        </div>

                        <div className="about-admin-form-row">

                            <div className="about-admin-form-group">

                                <label htmlFor="skillIcon">
                                    Icon Image
                                </label>

                                <input
                                    id="skillIcon"
                                    name="icon"
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handleSkillChange
                                    }
                                />

                                <small>
                                    Upload an image to
                                    use as the skill
                                    icon.
                                </small>

                                {editingSkillId &&
                                    skillItems.find(
                                        (item) =>
                                            item.id ===
                                            editingSkillId
                                    )?.icon && (
                                    <div className="about-admin-image-preview">

                                        <span>
                                            Current Icon
                                        </span>

                                        <img
                                            src={getImageUrl(
                                                skillItems.find(
                                                    (item) =>
                                                        item.id ===
                                                        editingSkillId
                                                )?.icon
                                            )}
                                            alt="Current skill icon"
                                        />

                                    </div>
                                )}

                                {skillForm.icon instanceof File && (
                                    <div className="about-admin-image-preview">

                                        <span>
                                            New Icon Preview
                                        </span>

                                        <img
                                            src={getFilePreviewUrl(
                                                skillForm.icon
                                            )}
                                            alt="New skill icon preview"
                                        />

                                    </div>
                                )}

                            </div>

                            <div className="about-admin-form-group">

                                <label htmlFor="skillSortOrder">
                                    Sort Order
                                </label>

                                <input
                                    id="skillSortOrder"
                                    name="sortOrder"
                                    type="number"
                                    min="0"
                                    value={
                                        skillForm.sortOrder
                                    }
                                    onChange={
                                        handleSkillChange
                                    }
                                />

                            </div>

                        </div>

                        <label className="about-admin-checkbox">

                            <input
                                type="checkbox"
                                name="isActive"
                                checked={
                                    skillForm.isActive
                                }
                                onChange={
                                    handleSkillChange
                                }
                            />

                            <span>
                                Active
                            </span>

                        </label>

                        <div className="about-admin-form-actions">

                            <button
                                type="submit"
                                className="about-admin-save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingSkillId
                                    ? "Update Skill"
                                    : "Add Skill"}
                            </button>

                            {editingSkillId && (
                                <button
                                    type="button"
                                    className="about-admin-cancel-button"
                                    onClick={
                                        resetSkillForm
                                    }
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>

                </div>

                <div className="about-admin-items">

                    {skillItems.length === 0 ? (
                        <div className="about-admin-empty">
                            No skills have been
                            added yet.
                        </div>
                    ) : (
                        skillItems.map(
                            (item) => (
                                <div
                                    key={item.id}
                                    className="about-admin-item"
                                >

                                    <div className="about-admin-item-content">

                                        <div>

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

                                            {item.icon && (
                                                <img
                                                    className="about-admin-item-icon"
                                                    src={getImageUrl(
                                                        item.icon
                                                    )}
                                                    alt={`${item.title} icon`}
                                                />
                                            )}

                                            <span
                                                className={
                                                    item.isActive
                                                        ? "about-admin-status active"
                                                        : "about-admin-status inactive"
                                                }
                                            >
                                                {item.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>

                                        </div>

                                    </div>

                                    <div className="about-admin-item-actions">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEditSkill(
                                                    item
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteSkill(
                                                    item.id,
                                                    item.title
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>
                            )
                        )
                    )}

                </div>

            </section>

            {/* ========================================
                SELECTED FOCUS
            ======================================== */}

            <section className="about-admin-section">

                <div className="about-admin-section-header">

                    <div>

                        <h2>
                            Selected Focus
                        </h2>

                        <p>
                            Manage the analytical
                            areas displayed on
                            the About page.
                        </p>

                    </div>

                </div>

                <div className="about-admin-form-card">

                    <form
                        onSubmit={
                            handleFocusSubmit
                        }
                    >

                        <div className="about-admin-form-group">

                            <label htmlFor="focusTitle">
                                Title
                            </label>

                            <input
                                id="focusTitle"
                                name="title"
                                type="text"
                                value={
                                    focusForm.title
                                }
                                onChange={
                                    handleFocusChange
                                }
                                placeholder="Healthcare Analytics"
                                required
                            />

                        </div>

                        <div className="about-admin-form-group">

                            <label htmlFor="focusDescription">
                                Description
                            </label>

                            <textarea
                                id="focusDescription"
                                name="description"
                                rows="4"
                                value={
                                    focusForm.description
                                }
                                onChange={
                                    handleFocusChange
                                }
                                placeholder="Use data to understand patient trends, clinical patterns, and operational performance."
                                required
                            />

                        </div>

                        <div className="about-admin-form-row">

                            <div className="about-admin-form-group">

                                <label htmlFor="focusIcon">
                                    Icon Image
                                </label>

                                <input
                                    id="focusIcon"
                                    name="icon"
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handleFocusChange
                                    }
                                />

                                <small>
                                    Upload an image to
                                    use as the focus
                                    icon.
                                </small>

                                {editingFocusId &&
                                    focusItems.find(
                                        (item) =>
                                            item.id ===
                                            editingFocusId
                                    )?.icon && (
                                    <div className="about-admin-image-preview">

                                        <span>
                                            Current Icon
                                        </span>

                                        <img
                                            src={getImageUrl(
                                                focusItems.find(
                                                    (item) =>
                                                        item.id ===
                                                        editingFocusId
                                                )?.icon
                                            )}
                                            alt="Current focus icon"
                                        />

                                    </div>
                                )}

                                {focusForm.icon instanceof File && (
                                    <div className="about-admin-image-preview">

                                        <span>
                                            New Icon Preview
                                        </span>

                                        <img
                                            src={getFilePreviewUrl(
                                                focusForm.icon
                                            )}
                                            alt="New focus icon preview"
                                        />

                                    </div>
                                )}

                            </div>

                            <div className="about-admin-form-group">

                                <label htmlFor="focusSortOrder">
                                    Sort Order
                                </label>

                                <input
                                    id="focusSortOrder"
                                    name="sortOrder"
                                    type="number"
                                    min="0"
                                    value={
                                        focusForm.sortOrder
                                    }
                                    onChange={
                                        handleFocusChange
                                    }
                                />

                            </div>

                        </div>

                        <label className="about-admin-checkbox">

                            <input
                                type="checkbox"
                                name="isActive"
                                checked={
                                    focusForm.isActive
                                }
                                onChange={
                                    handleFocusChange
                                }
                            />

                            <span>
                                Active
                            </span>

                        </label>

                        <div className="about-admin-form-actions">

                            <button
                                type="submit"
                                className="about-admin-save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingFocusId
                                    ? "Update Focus"
                                    : "Add Focus"}
                            </button>

                            {editingFocusId && (
                                <button
                                    type="button"
                                    className="about-admin-cancel-button"
                                    onClick={
                                        resetFocusForm
                                    }
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>

                </div>

                <div className="about-admin-items">

                    {focusItems.length === 0 ? (
                        <div className="about-admin-empty">
                            No focus areas have
                            been added yet.
                        </div>
                    ) : (
                        focusItems.map(
                            (item) => (
                                <div
                                    key={item.id}
                                    className="about-admin-item"
                                >

                                    <div className="about-admin-item-content">

                                        <div>

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

                                            {item.icon && (
                                                <img
                                                    className="about-admin-item-icon"
                                                    src={getImageUrl(
                                                        item.icon
                                                    )}
                                                    alt={`${item.title} icon`}
                                                />
                                            )}

                                            <span
                                                className={
                                                    item.isActive
                                                        ? "about-admin-status active"
                                                        : "about-admin-status inactive"
                                                }
                                            >
                                                {item.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>

                                        </div>

                                    </div>

                                    <div className="about-admin-item-actions">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEditFocus(
                                                    item
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteFocus(
                                                    item.id,
                                                    item.title
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>
                            )
                        )
                    )}

                </div>

            </section>

            {/* ========================================
                DELETE CONFIRMATION MODAL
            ======================================== */}

            {deleteModal.isOpen && (
                <div
                    className="about-admin-delete-overlay"
                    onClick={closeDeleteModal}
                >
                    <div
                        className="about-admin-delete-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="about-admin-delete-icon">
                            <span>!</span>
                        </div>

                        <div className="about-admin-delete-content">

                            <span className="about-admin-delete-label">
                                DELETE ITEM
                            </span>

                            <h2>
                                Delete this item?
                            </h2>

                            <p>
                                Are you sure you want
                                to delete{" "}
                                <strong>
                                    "{deleteModal.title}"
                                </strong>
                                ? This action cannot
                                be undone.
                            </p>

                        </div>

                        <div className="about-admin-delete-actions">

                            <button
                                type="button"
                                className="about-admin-delete-cancel"
                                onClick={
                                    closeDeleteModal
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="about-admin-delete-confirm"
                                onClick={
                                    confirmDelete
                                }
                                disabled={saving}
                            >
                                {saving
                                    ? "Deleting..."
                                    : "Yes, Delete"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default About;