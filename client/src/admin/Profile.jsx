import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/AdminProfile.css";

const API_BASE_URL = "http://localhost:5000";

function getImageUrl(imageUrl) {
    if (!imageUrl) return null;

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    return `${API_BASE_URL}${imageUrl}`;
}

function Profile() {
    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // ========================================
    // CREATE / UPDATE MODE
    // ========================================

    const [isCreating, setIsCreating] = useState(false);

    // ========================================
    // LOAD AUTHENTICATED ADMIN PROFILE
    // ========================================

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError("");
                setSuccess("");

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    throw new Error(
                        "You are not authenticated. Please log in again."
                    );
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/profile/me`,
                    {
                        method: "GET",
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

                const contentType =
                    response.headers.get(
                        "content-type"
                    );

                let data = null;

                if (
                    contentType &&
                    contentType.includes(
                        "application/json"
                    )
                ) {
                    data = await response.json();
                }

                // ========================================
                // NO PROFILE YET
                // ========================================
                //
                // A newly registered admin has a User
                // record but does not have a Profile yet.
                // A 404 from /api/profile/me therefore
                // means we should open the create form.
                // ========================================

                if (response.status === 404) {
                    let loggedInUser = null;

                    try {
                        const storedUser =
                            localStorage.getItem(
                                "user"
                            );

                        if (storedUser) {
                            loggedInUser =
                                JSON.parse(
                                    storedUser
                                );
                        }
                    } catch (storageError) {
                        console.warn(
                            "Could not read stored user information:",
                            storageError
                        );
                    }

                    setProfile({
                        fullName:
                            loggedInUser?.name ||
                            "",

                        headline: "",

                        bio: "",

                        location: "",

                        email:
                            loggedInUser?.email ||
                            "",

                        phone: "",

                        resumeUrl: "",

                        linkedinUrl: "",

                        profileImage: null,
                    });

                    setIsCreating(true);

                    setImagePreview(null);
                    setSelectedImage(null);

                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                            `Profile request failed with status ${response.status}.`
                    );
                }

                if (!data) {
                    throw new Error(
                        "The server returned an invalid profile response."
                    );
                }

                console.log(
                    "Profile API response:",
                    data
                );

                const profileData =
                    data.profile || data;

                if (
                    !profileData ||
                    !profileData.id
                ) {
                    throw new Error(
                        "Profile information was not found."
                    );
                }

                setProfile(profileData);

                setIsCreating(false);

                if (profileData.profileImage) {
                    setImagePreview(
                        getImageUrl(
                            profileData.profileImage
                        )
                    );
                } else {
                    setImagePreview(null);
                }
            } catch (error) {
                console.error(
                    "Error loading profile:",
                    error
                );

                setError(
                    error.message ||
                        "Failed to load profile."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // ========================================
    // HANDLE TEXT INPUT CHANGES
    // ========================================

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setProfile(
            (currentProfile) => ({
                ...currentProfile,
                [name]: value,
            })
        );

        setSuccess("");
        setError("");
    };

    // ========================================
    // HANDLE PROFILE IMAGE
    // ========================================

    const handleImageChange = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setSuccess("");
        setError("");

        // ----------------------------------------
        // CHECK FILE TYPE
        // ----------------------------------------

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Only JPG, PNG, and WebP images are allowed."
            );

            event.target.value = "";
            return;
        }

        // ----------------------------------------
        // CHECK FILE SIZE
        // ----------------------------------------

        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            setError(
                "Profile image must be 5 MB or smaller."
            );

            event.target.value = "";
            return;
        }

        // ----------------------------------------
        // STORE SELECTED IMAGE
        // ----------------------------------------

        setSelectedImage(file);

        // ----------------------------------------
        // CREATE IMAGE PREVIEW
        // ----------------------------------------

        const previewUrl =
            URL.createObjectURL(file);

        setImagePreview(previewUrl);
    };

    // ========================================
    // SAVE PROFILE
    // ========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            if (!profile) {
                throw new Error(
                    "Profile information is unavailable."
                );
            }

            // ----------------------------------------
            // CREATE FORM DATA
            // ----------------------------------------

            const formData =
                new FormData();

            formData.append(
                "fullName",
                profile.fullName || ""
            );

            formData.append(
                "headline",
                profile.headline || ""
            );

            formData.append(
                "bio",
                profile.bio || ""
            );

            formData.append(
                "location",
                profile.location || ""
            );

            formData.append(
                "email",
                profile.email || ""
            );

            formData.append(
                "phone",
                profile.phone || ""
            );

            formData.append(
                "resumeUrl",
                profile.resumeUrl || ""
            );

            formData.append(
                "linkedinUrl",
                profile.linkedinUrl || ""
            );

            // ----------------------------------------
            // ADD NEW IMAGE ONLY IF SELECTED
            // ----------------------------------------

            if (selectedImage) {
                formData.append(
                    "profileImage",
                    selectedImage
                );
            }

            // ----------------------------------------
            // DETERMINE CREATE OR UPDATE
            // ----------------------------------------

            const requestUrl = isCreating
                ? `${API_BASE_URL}/api/profile`
                : `${API_BASE_URL}/api/profile/${profile.id}`;

            const requestMethod = isCreating
                ? "POST"
                : "PUT";

            // ----------------------------------------
            // SEND PROFILE REQUEST
            // ----------------------------------------

            const response = await fetch(
                requestUrl,
                {
                    method: requestMethod,

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: formData,
                }
            );

            const contentType =
                response.headers.get(
                    "content-type"
                );

            let data = null;

            if (
                contentType &&
                contentType.includes(
                    "application/json"
                )
            ) {
                data = await response.json();
            }

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        `Profile ${
                            isCreating
                                ? "creation"
                                : "update"
                        } failed with status ${response.status}.`
                );
            }

            if (!data) {
                throw new Error(
                    "The server returned an invalid profile response."
                );
            }

            const savedProfile =
                data.profile || data;

            if (
                !savedProfile ||
                !savedProfile.id
            ) {
                throw new Error(
                    "The saved profile information is invalid."
                );
            }

            // ----------------------------------------
            // UPDATE LOCAL PROFILE STATE
            // ----------------------------------------

            setProfile(savedProfile);

            // ----------------------------------------
            // SWITCH TO UPDATE MODE
            // ----------------------------------------

            setIsCreating(false);

            // ----------------------------------------
            // RESET IMAGE STATE
            // ----------------------------------------

            setSelectedImage(null);

            if (
                savedProfile.profileImage
            ) {
                setImagePreview(
                    getImageUrl(
                        savedProfile.profileImage
                    )
                );
            } else {
                setImagePreview(null);
            }

            // ----------------------------------------
            // SUCCESS MESSAGE
            // ----------------------------------------

            setSuccess(
                isCreating
                    ? "Profile created successfully."
                    : "Profile updated successfully."
            );
        } catch (error) {
            console.error(
                "Error saving profile:",
                error
            );

            setError(
                error.message ||
                    "Failed to save profile."
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
            <div className="profile-page">

                <div className="profile-page-header">

                    <div className="profile-top-navigation">

                        <Link
                            to="/admin/dashboard"
                            className="profile-dashboard-link"
                        >
                            Dashboard
                        </Link>

                    </div>

                    <div className="profile-page-heading">

                        <h1>Profile</h1>

                        <p>
                            Manage the professional
                            information displayed on
                            your portfolio.
                        </p>

                    </div>

                </div>

                <div className="profile-form-card">

                    <div className="profile-loading">
                        Loading profile information...
                    </div>

                </div>

            </div>
        );
    }

    // ========================================
    // ERROR STATE
    // ========================================

    if (error && !profile) {
        return (
            <div className="profile-page">

                <div className="profile-page-header">

                    <div className="profile-top-navigation">

                        <Link
                            to="/admin/dashboard"
                            className="profile-dashboard-link"
                        >
                            ← Dashboard
                        </Link>

                    </div>

                    <div className="profile-page-heading">

                        <h1>Profile</h1>

                        <p>
                            Manage the professional
                            information displayed on
                            your portfolio.
                        </p>

                    </div>

                </div>

                <div className="profile-form-card">

                    <div className="profile-error">
                        {error}
                    </div>

                </div>

            </div>
        );
    }

    // ========================================
    // NO PROFILE STATE
    // ========================================

    if (!profile) {
        return (
            <div className="profile-page">

                <div className="profile-page-header">

                    <div className="profile-top-navigation">

                        <Link
                            to="/admin/dashboard"
                            className="profile-dashboard-link"
                        >
                            ← Dashboard
                        </Link>

                    </div>

                    <div className="profile-page-heading">

                        <h1>Profile</h1>

                        <p>
                            Manage the professional
                            information displayed on
                            your portfolio.
                        </p>

                    </div>

                </div>

                <div className="profile-form-card">

                    <div className="profile-error">
                        No profile information is
                        available.
                    </div>

                </div>

            </div>
        );
    }

    // ========================================
    // MAIN PROFILE PAGE
    // ========================================

    return (
        <div className="profile-page">

            <div className="profile-page-header">

                <div className="profile-top-navigation">

                    <Link
                        to="/admin/dashboard"
                        className="profile-dashboard-link"
                    >
                        ← Dashboard
                    </Link>

                </div>

                <div className="profile-page-heading">

                    <h1>Profile</h1>

                    <p>
                        Manage the professional
                        information displayed on
                        your portfolio.
                    </p>

                </div>

            </div>

            <div className="profile-form-card">

                <div className="profile-section-header">

                    <h2>
                        Personal Information
                    </h2>

                    <p>
                        Update your basic professional
                        information.
                    </p>

                </div>

                <form onSubmit={handleSubmit}>

                    {/* ========================================
                        FULL NAME
                    ======================================== */}

                    <div className="profile-form-group">

                        <label htmlFor="fullName">
                            Full Name
                        </label>

                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={
                                profile.fullName ||
                                ""
                            }
                            onChange={handleChange}
                            required
                        />

                    </div>

                    {/* ========================================
                        HEADLINE
                    ======================================== */}

                    <div className="profile-form-group">

                        <label htmlFor="headline">
                            Professional Headline
                        </label>

                        <input
                            id="headline"
                            name="headline"
                            type="text"
                            value={
                                profile.headline ||
                                ""
                            }
                            onChange={handleChange}
                            required
                        />

                    </div>

                    {/* ========================================
                        BIO
                    ======================================== */}

                    <div className="profile-form-group">

                        <label htmlFor="bio">
                            Professional Bio
                        </label>

                        <textarea
                            id="bio"
                            name="bio"
                            rows="6"
                            value={
                                profile.bio ||
                                ""
                            }
                            onChange={handleChange}
                            required
                        />

                    </div>

                    {/* ========================================
                        LOCATION + EMAIL
                    ======================================== */}

                    <div className="profile-form-row">

                        <div className="profile-form-group">

                            <label htmlFor="location">
                                Location
                            </label>

                            <input
                                id="location"
                                name="location"
                                type="text"
                                value={
                                    profile.location ||
                                    ""
                                }
                                onChange={handleChange}
                            />

                        </div>

                        <div className="profile-form-group">

                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={
                                    profile.email ||
                                    ""
                                }
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                    {/* ========================================
                        PHONE
                    ======================================== */}

                    <div className="profile-form-group">

                        <label htmlFor="phone">
                            Phone
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={
                                profile.phone ||
                                ""
                            }
                            onChange={handleChange}
                        />

                    </div>

                    {/* ========================================
                        LINKEDIN URL
                    ======================================== */}

                    <div className="profile-form-group">

                        <label htmlFor="linkedinUrl">
                            LinkedIn URL
                        </label>

                        <input
                            id="linkedinUrl"
                            name="linkedinUrl"
                            type="url"
                            value={
                                profile.linkedinUrl ||
                                ""
                            }
                            onChange={handleChange}
                            placeholder="https://www.linkedin.com/in/your-profile"
                        />

                        <small>
                            Your LinkedIn profile URL.
                        </small>

                    </div>

                    {/* ========================================
                        PROFILE IMAGE
                    ======================================== */}

                    <div className="profile-form-group">

                        <label htmlFor="profileImage">
                            Profile Image
                        </label>

                        <div className="profile-image-upload">

                            <div className="profile-image-preview">

                                {imagePreview ||
                                profile.profileImage ? (
                                    <img
                                        src={
                                            imagePreview ||
                                            getImageUrl(
                                                profile.profileImage
                                            )
                                        }
                                        alt="Profile preview"
                                    />
                                ) : (
                                    <div className="profile-image-placeholder">
                                        No Image
                                    </div>
                                )}

                            </div>

                            <div className="profile-image-upload-controls">

                                <label
                                    htmlFor="profileImage"
                                    className="profile-image-upload-button"
                                >
                                    Choose Image
                                </label>

                                <input
                                    id="profileImage"
                                    name="profileImage"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={
                                        handleImageChange
                                    }
                                />

                                <small>
                                    JPG, PNG or WebP.
                                    Maximum size: 5 MB.
                                </small>

                                {selectedImage && (
                                    <small>
                                        Selected:{" "}
                                        {
                                            selectedImage.name
                                        }
                                    </small>
                                )}

                            </div>

                        </div>

                    </div>

                    {/* ========================================
                        RESUME URL
                    ======================================== */}

                    <div className="profile-form-group">

                        <label htmlFor="resumeUrl">
                            Resume URL
                        </label>

                        <input
                            id="resumeUrl"
                            name="resumeUrl"
                            type="url"
                            value={
                                profile.resumeUrl ||
                                ""
                            }
                            onChange={handleChange}
                        />

                        <small>
                            URL where recruiters can
                            access your resume.
                        </small>

                    </div>

                    {/* ========================================
                        MESSAGES
                    ======================================== */}

                    {error && (
                        <div className="profile-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="profile-success">
                            {success}
                        </div>
                    )}

                    {/* ========================================
                        SAVE BUTTON
                    ======================================== */}

                    <div className="profile-form-actions">

                        <button
                            type="submit"
                            className="profile-save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : isCreating
                                    ? "Create Profile"
                                    : "Save Changes"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default Profile;
