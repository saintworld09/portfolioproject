import { useEffect, useState } from "react";
import "../styles/SocialLinks.css";

import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/api/social-links`;

const PLATFORM_OPTIONS = [
    {
        value: "LinkedIn",
        label: "LinkedIn",
        icon: "linkedin",
    },
    {
        value: "GitHub",
        label: "GitHub",
        icon: "github",
    },
    {
        value: "Facebook",
        label: "Facebook",
        icon: "facebook",
    },
    {
        value: "Instagram",
        label: "Instagram",
        icon: "instagram",
    },
    {
        value: "X",
        label: "X",
        icon: "x",
    },
    {
        value: "YouTube",
        label: "YouTube",
        icon: "youtube",
    },
    {
        value: "WhatsApp",
        label: "WhatsApp",
        icon: "whatsapp",
    },
    {
        value: "TikTok",
        label: "TikTok",
        icon: "tiktok",
    },
    {
        value: "Telegram",
        label: "Telegram",
        icon: "telegram",
    },
    {
        value: "Medium",
        label: "Medium",
        icon: "medium",
    },
    {
        value: "Behance",
        label: "Behance",
        icon: "behance",
    },
    {
        value: "Dribbble",
        label: "Dribbble",
        icon: "dribbble",
    },
    {
        value: "Other",
        label: "Other",
        icon: "link",
    },
];


const getPlatformIcon = (platform) => {
    const foundPlatform = PLATFORM_OPTIONS.find(
        (item) =>
            item.value.toLowerCase() ===
            String(platform || "").toLowerCase()
    );

    return foundPlatform?.icon || "link";
};


const getInitialFormData = () => ({
    platform: "",
    url: "",
    icon: "",
    sortOrder: 0,
});


function SocialLinks() {
    const [socialLinks, setSocialLinks] = useState([]);

    const [formData, setFormData] = useState(
        getInitialFormData()
    );

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [deleteModal, setDeleteModal] = useState({
        open: false,
        id: null,
        platform: "",
    });


    /* =========================================================
       GET TOKEN
    ========================================================= */

    const getToken = () => {
        return localStorage.getItem("token");
    };


    /* =========================================================
       FETCH SOCIAL LINKS
       ADMIN ONLY - CURRENT USER'S SOCIAL LINKS
    ========================================================= */

    const fetchSocialLinks = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Your session has expired. Please log in again."
                );
            }

            const response = await fetch(
                `${API_URL}/me`,
                {
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
                        "Failed to fetch social links."
                );
            }

            const sortedLinks = Array.isArray(data)
                ? [...data].sort(
                      (a, b) =>
                          Number(a.sortOrder || 0) -
                          Number(b.sortOrder || 0)
                  )
                : [];

            setSocialLinks(sortedLinks);
        } catch (err) {
            console.error(
                "Error fetching social links:",
                err
            );

            setError(
                err.message ||
                    "Unable to load social links."
            );
        } finally {
            setLoading(false);
        }
    };


    /* =========================================================
       INITIAL LOAD
       ADMIN ONLY - CURRENT USER'S SOCIAL LINKS
    ========================================================= */

    useEffect(() => {
        let cancelled = false;

        const loadSocialLinks = async () => {
            try {
                setLoading(true);
                setError("");

                const token = getToken();

                if (!token) {
                    throw new Error(
                        "Your session has expired. Please log in again."
                    );
                }

                const response = await fetch(
                    `${API_URL}/me`,
                    {
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
                            "Failed to fetch social links."
                    );
                }

                const sortedLinks = Array.isArray(data)
                    ? [...data].sort(
                          (a, b) =>
                              Number(a.sortOrder || 0) -
                              Number(b.sortOrder || 0)
                      )
                    : [];

                if (!cancelled) {
                    setSocialLinks(
                        sortedLinks
                    );
                }
            } catch (err) {
                console.error(
                    "Error fetching social links:",
                    err
                );

                if (!cancelled) {
                    setError(
                        err.message ||
                            "Unable to load social links."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadSocialLinks();

        return () => {
            cancelled = true;
        };
    }, []);


    /* =========================================================
       FORM HANDLERS
    ========================================================= */

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };


    const resetForm = () => {
        setFormData(
            getInitialFormData()
        );

        setEditingId(null);
        setShowForm(false);
        setError("");
    };


    const handleAddNew = () => {
        setFormData({
            platform: "",
            url: "",
            icon: "",
            sortOrder: socialLinks.length,
        });

        setEditingId(null);
        setError("");
        setSuccess("");
        setShowForm(true);
    };


    const handleEdit = (socialLink) => {
        setFormData({
            platform:
                socialLink.platform || "",

            url:
                socialLink.url || "",

            icon:
                socialLink.icon ||
                getPlatformIcon(
                    socialLink.platform
                ),

            sortOrder:
                socialLink.sortOrder !== undefined
                    ? socialLink.sortOrder
                    : 0,
        });

        setEditingId(
            socialLink.id
        );

        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    /* =========================================================
       VALIDATION
    ========================================================= */

    const validateForm = () => {
        if (!formData.platform.trim()) {
            setError(
                "Please select a platform."
            );

            return false;
        }

        if (!formData.url.trim()) {
            setError(
                "Please enter the social profile URL."
            );

            return false;
        }

        try {
            const parsedUrl = new URL(
                formData.url.trim()
            );

            if (
                parsedUrl.protocol !== "http:" &&
                parsedUrl.protocol !== "https:"
            ) {
                setError(
                    "Please enter a valid HTTP or HTTPS URL."
                );

                return false;
            }
        } catch {
            setError(
                "Please enter a valid social profile URL."
            );

            return false;
        }

        if (
            formData.sortOrder !== "" &&
            Number.isNaN(
                Number(formData.sortOrder)
            )
        ) {
            setError(
                "Sort order must be a valid number."
            );

            return false;
        }

        return true;
    };


    /* =========================================================
       CREATE / UPDATE
    ========================================================= */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const token = getToken();

            if (!token) {
                setError(
                    "Your session has expired. Please log in again."
                );

                return;
            }

            const payload = {
                platform:
                    formData.platform.trim(),

                url:
                    formData.url.trim(),

                icon:
                    formData.icon.trim() ||
                    getPlatformIcon(
                        formData.platform
                    ),

                sortOrder:
                    formData.sortOrder === ""
                        ? 0
                        : Number(
                              formData.sortOrder
                          ),
            };

            const endpoint = editingId
                ? `${API_URL}/${editingId}`
                : API_URL;

            const method = editingId
                ? "PUT"
                : "POST";

            const response = await fetch(
                endpoint,
                {
                    method,

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body:
                        JSON.stringify(
                            payload
                        ),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save social link."
                );
            }

            if (editingId) {
                setSuccess(
                    "Social link updated successfully."
                );
            } else {
                setSuccess(
                    "Social link created successfully."
                );
            }

            resetForm();

            await fetchSocialLinks();

            setTimeout(() => {
                setSuccess("");
            }, 4000);
        } catch (err) {
            console.error(
                "Error saving social link:",
                err
            );

            setError(
                err.message ||
                    "Failed to save social link."
            );
        } finally {
            setSaving(false);
        }
    };


    /* =========================================================
       DELETE
    ========================================================= */

    const openDeleteModal = (
        socialLink
    ) => {
        setDeleteModal({
            open: true,
            id: socialLink.id,
            platform:
                socialLink.platform,
        });

        setError("");
        setSuccess("");
    };


    const closeDeleteModal = () => {
        if (deletingId) {
            return;
        }

        setDeleteModal({
            open: false,
            id: null,
            platform: "",
        });
    };


    const handleDelete = async () => {
        if (!deleteModal.id) {
            return;
        }

        try {
            setDeletingId(
                deleteModal.id
            );

            setError("");

            const token = getToken();

            if (!token) {
                setError(
                    "Your session has expired. Please log in again."
                );

                return;
            }

            const response = await fetch(
                `${API_URL}/${deleteModal.id}`,
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
                        "Failed to delete social link."
                );
            }

            setSuccess(
                "Social link deleted successfully."
            );

            setDeleteModal({
                open: false,
                id: null,
                platform: "",
            });

            await fetchSocialLinks();

            setTimeout(() => {
                setSuccess("");
            }, 4000);
        } catch (err) {
            console.error(
                "Error deleting social link:",
                err
            );

            setError(
                err.message ||
                    "Failed to delete social link."
            );
        } finally {
            setDeletingId(null);
        }
    };


    /* =========================================================
       HELPERS
    ========================================================= */

    const getPlatformDetails = (
        platform
    ) => {
        return (
            PLATFORM_OPTIONS.find(
                (item) =>
                    item.value.toLowerCase() ===
                    String(
                        platform || ""
                    ).toLowerCase()
            ) || {
                label:
                    platform ||
                    "Social Link",
                icon: "link",
            }
        );
    };


    const formatUrl = (url) => {
        if (!url) {
            return "";
        }

        try {
            const parsedUrl =
                new URL(url);

            return parsedUrl.hostname
                .replace(
                    /^www\./,
                    ""
                );
        } catch {
            return url;
        }
    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="admin-social-links-page">

            {/* =============================================
                PAGE HEADER
            ============================================= */}

            <div className="admin-social-links-header">

                <div className="admin-social-links-header-content">

                    <div className="admin-social-links-eyebrow">
                        ADMIN / SOCIAL LINKS
                    </div>

                    <h1 className="admin-social-links-title">
                        Social Links
                    </h1>

                    <p className="admin-social-links-subtitle">
                        Manage the social platforms and
                        online profiles displayed across
                        your portfolio.
                    </p>

                </div>

                <div className="admin-social-links-header-action">

                    {!showForm && (
                        <button
                            type="button"
                            className="admin-social-links-add-button"
                            onClick={
                                handleAddNew
                            }
                        >
                            <span className="admin-social-links-add-icon">
                                +
                            </span>

                            Add Social Link
                        </button>
                    )}

                </div>

            </div>


            {/* =============================================
                STATUS MESSAGES
            ============================================= */}

            {success && (
                <div
                    className="admin-social-links-alert admin-social-links-alert-success"
                    role="status"
                >
                    <span className="admin-social-links-alert-icon">
                        ✓
                    </span>

                    <span>
                        {success}
                    </span>
                </div>
            )}


            {error && (
                <div
                    className="admin-social-links-alert admin-social-links-alert-error"
                    role="alert"
                >
                    <span className="admin-social-links-alert-icon">
                        !
                    </span>

                    <span>
                        {error}
                    </span>
                </div>
            )}


            {/* =============================================
                MAIN CONTENT
            ============================================= */}

            <div className="admin-social-links-content">

                {/* =========================================
                    FORM CARD
                ========================================= */}

                {showForm && (
                    <section className="admin-social-links-form-card">

                        <div className="admin-social-links-form-header">

                            <div>
                                <span className="admin-social-links-section-label">
                                    {editingId
                                        ? "EDIT PROFILE"
                                        : "NEW PROFILE"}
                                </span>

                                <h2>
                                    {editingId
                                        ? "Edit social link"
                                        : "Add a social link"}
                                </h2>

                                <p>
                                    Add the profile information
                                    that should appear on your
                                    public portfolio.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="admin-social-links-close-button"
                                onClick={
                                    resetForm
                                }
                                aria-label="Close form"
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="admin-social-links-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="admin-social-links-form-grid">

                                {/* PLATFORM */}

                                <div className="admin-social-links-field">

                                    <label htmlFor="platform">
                                        Platform
                                        <span>*</span>
                                    </label>

                                    <select
                                        id="platform"
                                        name="platform"
                                        value={
                                            formData.platform
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select platform
                                        </option>

                                        {PLATFORM_OPTIONS.map(
                                            (
                                                platform
                                            ) => (
                                                <option
                                                    key={
                                                        platform.value
                                                    }
                                                    value={
                                                        platform.value
                                                    }
                                                >
                                                    {
                                                        platform.label
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                </div>


                                {/* URL */}

                                <div className="admin-social-links-field">

                                    <label htmlFor="url">
                                        Profile URL
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="url"
                                        id="url"
                                        name="url"
                                        value={
                                            formData.url
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="https://linkedin.com/in/your-profile"
                                        disabled={
                                            saving
                                        }
                                        required
                                    />

                                </div>


                                {/* ICON */}

                                <div className="admin-social-links-field">

                                    <label htmlFor="icon">
                                        Icon
                                        <span className="optional">
                                            Optional
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        id="icon"
                                        name="icon"
                                        value={
                                            formData.icon
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="linkedin"
                                        disabled={
                                            saving
                                        }
                                    />

                                    <small>
                                        Leave blank to use the
                                        default platform icon name.
                                    </small>

                                </div>


                                {/* SORT ORDER */}

                                <div className="admin-social-links-field">

                                    <label htmlFor="sortOrder">
                                        Display Order
                                    </label>

                                    <input
                                        type="number"
                                        id="sortOrder"
                                        name="sortOrder"
                                        min="0"
                                        value={
                                            formData.sortOrder
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />

                                    <small>
                                        Lower numbers appear
                                        first.
                                    </small>

                                </div>

                            </div>


                            {/* FORM ACTIONS */}

                            <div className="admin-social-links-form-actions">

                                <button
                                    type="button"
                                    className="admin-social-links-secondary-button"
                                    onClick={
                                        resetForm
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-social-links-primary-button"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving ? (
                                        <>
                                            <span className="admin-social-links-button-spinner" />
                                            Saving...
                                        </>
                                    ) : editingId ? (
                                        "Update Social Link"
                                    ) : (
                                        "Create Social Link"
                                    )}
                                </button>

                            </div>

                        </form>

                    </section>
                )}


                {/* =========================================
                    SOCIAL LINKS LIST
                ========================================= */}

                <section className="admin-social-links-list-section">

                    <div className="admin-social-links-list-header">

                        <div>
                            <span className="admin-social-links-section-label">
                                YOUR PROFILES
                            </span>

                            <h2>
                                Connected social links
                            </h2>

                            <p>
                                These profiles are available
                                for display on your public
                                portfolio.
                            </p>
                        </div>

                        <div className="admin-social-links-count">
                            <strong>
                                {
                                    socialLinks.length
                                }
                            </strong>

                            <span>
                                {
                                    socialLinks.length ===
                                    1
                                        ? "Profile"
                                        : "Profiles"
                                }
                            </span>
                        </div>

                    </div>


                    {/* LOADING */}

                    {loading ? (
                        <div className="admin-social-links-loading">

                            <span className="admin-social-links-spinner" />

                            <p>
                                Loading social links...
                            </p>

                        </div>
                    ) : socialLinks.length ===
                      0 ? (

                        /* EMPTY */

                        <div className="admin-social-links-empty">

                            <div className="admin-social-links-empty-icon">
                                <span>
                                    ↗
                                </span>
                            </div>

                            <h3>
                                No social links yet
                            </h3>

                            <p>
                                Add your first social profile
                                to make it available on your
                                portfolio.
                            </p>

                            <button
                                type="button"
                                className="admin-social-links-empty-button"
                                onClick={
                                    handleAddNew
                                }
                            >
                                Add Your First Link
                            </button>

                        </div>

                    ) : (

                        /* LIST */

                        <div className="admin-social-links-grid">

                            {socialLinks.map(
                                (
                                    socialLink,
                                    index
                                ) => {
                                    const platformDetails =
                                        getPlatformDetails(
                                            socialLink.platform
                                        );

                                    return (
                                        <article
                                            key={
                                                socialLink.id
                                            }
                                            className="admin-social-link-card"
                                        >

                                            {/* CARD TOP */}

                                            <div className="admin-social-link-card-top">

                                                <div className="admin-social-link-platform-icon">
                                                    <span>
                                                        {platformDetails.icon ===
                                                        "linkedin"
                                                            ? "in"
                                                            : platformDetails.icon ===
                                                              "github"
                                                            ? "GH"
                                                            : platformDetails.icon ===
                                                              "facebook"
                                                            ? "f"
                                                            : platformDetails.icon ===
                                                              "instagram"
                                                            ? "◎"
                                                            : platformDetails.icon ===
                                                              "youtube"
                                                            ? "▶"
                                                            : platformDetails.icon ===
                                                              "whatsapp"
                                                            ? "◔"
                                                            : platformDetails.icon ===
                                                              "tiktok"
                                                            ? "♪"
                                                            : platformDetails.icon ===
                                                              "telegram"
                                                            ? "➤"
                                                            : platformDetails.icon ===
                                                              "x"
                                                            ? "𝕏"
                                                            : "↗"}
                                                    </span>
                                                </div>

                                                <div className="admin-social-link-card-number">
                                                    {String(
                                                        index +
                                                            1
                                                    ).padStart(
                                                        2,
                                                        "0"
                                                    )}
                                                </div>

                                            </div>


                                            {/* CARD CONTENT */}

                                            <div className="admin-social-link-card-content">

                                                <div className="admin-social-link-card-heading-row">

                                                    <h3>
                                                        {
                                                            socialLink.platform
                                                        }
                                                    </h3>

                                                    <span className="admin-social-link-order">
                                                        #
                                                        {Number(
                                                            socialLink.sortOrder ||
                                                                0
                                                        )}
                                                    </span>

                                                </div>

                                                <a
                                                    href={
                                                        socialLink.url
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="admin-social-link-url"
                                                >
                                                    <span>
                                                        {formatUrl(
                                                            socialLink.url
                                                        )}
                                                    </span>

                                                    <span className="admin-social-link-external-icon">
                                                        ↗
                                                    </span>
                                                </a>

                                            </div>


                                            {/* CARD ACTIONS */}

                                            <div className="admin-social-link-card-footer">

                                                <button
                                                    type="button"
                                                    className="admin-social-link-edit-button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            socialLink
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        socialLink.id
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="admin-social-link-delete-button"
                                                    onClick={() =>
                                                        openDeleteModal(
                                                            socialLink
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        socialLink.id
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </article>
                                    );
                                }
                            )}

                        </div>

                    )}

                </section>

            </div>


            {/* =============================================
                DELETE CONFIRMATION MODAL
            ============================================= */}

            {deleteModal.open && (
                <div
                    className="admin-social-links-modal-overlay"
                    onMouseDown={
                        closeDeleteModal
                    }
                >

                    <div
                        className="admin-social-links-delete-modal"
                        onMouseDown={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="admin-social-links-delete-icon">
                            !
                        </div>

                        <span className="admin-social-links-section-label">
                            DELETE PROFILE
                        </span>

                        <h2>
                            Remove{" "}
                            {
                                deleteModal.platform
                            }?
                        </h2>

                        <p>
                            This social link will be permanently
                            removed from your portfolio. This
                            action cannot be undone.
                        </p>

                        <div className="admin-social-links-modal-actions">

                            <button
                                type="button"
                                className="admin-social-links-secondary-button"
                                onClick={
                                    closeDeleteModal
                                }
                                disabled={Boolean(
                                    deletingId
                                )}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="admin-social-links-danger-button"
                                onClick={
                                    handleDelete
                                }
                                disabled={Boolean(
                                    deletingId
                                )}
                            >
                                {deletingId ? (
                                    <>
                                        <span className="admin-social-links-button-spinner" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete Profile"
                                )}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default SocialLinks;