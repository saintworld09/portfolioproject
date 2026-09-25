import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/AdminProjects.css";

const API_BASE_URL = "http://localhost:5000";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingProjectId, setEditingProjectId] =
        useState(null);

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);
    const [projectToDelete, setProjectToDelete] =
        useState(null);

    /*
     * =========================================================
     * PROJECT IMAGE STATE
     * =========================================================
     */

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] =
        useState([]);

    const [existingImages, setExistingImages] =
        useState([]);

    const [selectedCoverImageId, setSelectedCoverImageId] =
        useState(null);

    const [selectedNewCoverIndex, setSelectedNewCoverIndex] =
        useState(null);

    const [deletingImageId, setDeletingImageId] =
        useState(null);

    const [showImageDeleteModal, setShowImageDeleteModal] =
        useState(false);

    const [imageToDelete, setImageToDelete] =
        useState(null);

    /*
     * =========================================================
     * FORM DATA
     * =========================================================
     */

    const emptyFormData = {
        title: "",
        slug: "",
        shortDescription: "",
        description: "",
        businessProblem: "",
        methodology: "",
        datasetDescription: "",
        dashboardImageUrl: "",
        githubUrl: "",
        liveUrl: "",
        category: "",
        featured: false,
        startDate: "",
        endDate: "",
    };

    const [formData, setFormData] =
        useState({
            ...emptyFormData,
        });

    /*
     * =========================================================
     * IMAGE URL HELPER
     * =========================================================
     */

    const getImageUrl = (imagePath) => {
        if (!imagePath) {
            return "";
        }

        if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://")
        ) {
            return imagePath;
        }

        return `${API_BASE_URL}${imagePath}`;
    };

    /*
     * =========================================================
     * LOAD PROJECTS
     * =========================================================
     *
     * IMPORTANT:
     * This is an ADMIN page, so the JWT token must be sent.
     *
     * Without the token, the backend treats the request as
     * public and requires portfolioSlug.
     * =========================================================
     */

    useEffect(() => {
        let cancelled = false;

        const loadProjects = async () => {
            try {
                setLoading(true);
                setError("");

                const token =
                    localStorage.getItem(
                        "token"
                    );

                if (!token) {
                    throw new Error(
                        "You are not authenticated. Please log in again."
                    );
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/projects`,
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
                    ) || "";

                const data =
                    contentType.includes(
                        "application/json"
                    )
                        ? await response.json()
                        : {};

                console.log(
                    "Projects API response:",
                    data
                );

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to load projects"
                    );
                }

                /*
                 * The backend now returns the
                 * project array directly.
                 *
                 * Keep the fallback to data.projects
                 * for compatibility.
                 */

                const projectData =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(
                              data.projects
                          )
                        ? data.projects
                        : [];

                if (!cancelled) {
                    setProjects(
                        projectData
                    );

                    setLoading(false);
                }
            } catch (error) {
                console.error(
                    "Error loading projects:",
                    error
                );

                if (!cancelled) {
                    setError(
                        error.message ||
                            "Failed to load projects"
                    );

                    setLoading(false);
                }
            }
        };

        loadProjects();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
     * =========================================================
     * REFRESH PROJECTS
     * =========================================================
     *
     * IMPORTANT:
     * The JWT token must also be sent here.
     * =========================================================
     */

    const refreshProjects = async () => {
        try {
            const token =
                localStorage.getItem(
                    "token"
                );

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `${API_BASE_URL}/api/projects`,
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
                ) || "";

            const data =
                contentType.includes(
                    "application/json"
                )
                    ? await response.json()
                    : {};

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to refresh projects"
                );
            }

            const projectData =
                Array.isArray(data)
                    ? data
                    : Array.isArray(
                          data.projects
                      )
                    ? data.projects
                    : [];

            setProjects(projectData);
        } catch (error) {
            console.error(
                "Error refreshing projects:",
                error
            );

            setError(
                error.message ||
                    "Failed to refresh projects"
            );
        }
    };

    /*
     * =========================================================
     * RESET IMAGE STATE
     * =========================================================
     */

    const resetImageState = () => {
        imagePreviews.forEach(
            (preview) => {
                if (
                    preview.startsWith(
                        "blob:"
                    )
                ) {
                    URL.revokeObjectURL(
                        preview
                    );
                }
            }
        );

        setImageFiles([]);
        setImagePreviews([]);
        setExistingImages([]);

        setSelectedCoverImageId(null);
        setSelectedNewCoverIndex(null);

        setDeletingImageId(null);
    };

    /*
     * =========================================================
     * HANDLE FORM CHANGE
     * =========================================================
     */

    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setFormData(
            (currentData) => ({
                ...currentData,

                [name]:
                    type === "checkbox"
                        ? checked
                        : value,
            })
        );

        setError("");
        setSuccess("");
    };

    /*
     * =========================================================
     * HANDLE MULTIPLE IMAGE SELECTION
     * =========================================================
     */

    const handleImageChange = (
        event
    ) => {
        const selectedFiles =
            Array.from(
                event.target.files || []
            );

        if (
            selectedFiles.length === 0
        ) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (
            selectedFiles.length > 10
        ) {
            setError(
                "You can upload a maximum of 10 new images at a time."
            );

            event.target.value = "";

            return;
        }

        const invalidTypeFile =
            selectedFiles.find(
                (file) =>
                    !allowedTypes.includes(
                        file.type
                    )
            );

        if (invalidTypeFile) {
            setError(
                "Only JPG, PNG, and WebP images are allowed."
            );

            event.target.value = "";

            return;
        }

        const oversizedFile =
            selectedFiles.find(
                (file) =>
                    file.size >
                    5 * 1024 * 1024
            );

        if (oversizedFile) {
            setError(
                "Each image must be smaller than 5 MB."
            );

            event.target.value = "";

            return;
        }

        const newPreviewUrls =
            selectedFiles.map(
                (file) =>
                    URL.createObjectURL(
                        file
                    )
            );

        setImageFiles(
            (currentFiles) => [
                ...currentFiles,
                ...selectedFiles,
            ]
        );

        setImagePreviews(
            (currentPreviews) => [
                ...currentPreviews,
                ...newPreviewUrls,
            ]
        );

        if (
            selectedCoverImageId ===
                null &&
            selectedNewCoverIndex ===
                null
        ) {
            const currentFileCount =
                imageFiles.length;

            setSelectedNewCoverIndex(
                currentFileCount
            );
        }

        setError("");
        setSuccess("");

        event.target.value = "";
    };

    /*
     * =========================================================
     * REMOVE NEWLY SELECTED IMAGE
     * =========================================================
     */

    const handleRemoveNewImage = (
        index
    ) => {
        const previewToRemove =
            imagePreviews[index];

        if (
            previewToRemove &&
            previewToRemove.startsWith(
                "blob:"
            )
        ) {
            URL.revokeObjectURL(
                previewToRemove
            );
        }

        setImageFiles(
            (currentFiles) =>
                currentFiles.filter(
                    (_, fileIndex) =>
                        fileIndex !==
                        index
                )
        );

        setImagePreviews(
            (currentPreviews) =>
                currentPreviews.filter(
                    (_, previewIndex) =>
                        previewIndex !==
                        index
                )
        );

        if (
            selectedNewCoverIndex ===
            index
        ) {
            setSelectedNewCoverIndex(
                null
            );

            if (
                selectedCoverImageId !==
                null
            ) {
                return;
            }

            if (
                imageFiles.length >
                1
            ) {
                setSelectedNewCoverIndex(
                    index === 0
                        ? 0
                        : index - 1
                );
            }
        } else if (
            selectedNewCoverIndex !==
                null &&
            index <
                selectedNewCoverIndex
        ) {
            setSelectedNewCoverIndex(
                selectedNewCoverIndex - 1
            );
        }

        setError("");
        setSuccess("");
    };

    /*
     * =========================================================
     * SET NEW IMAGE AS COVER
     * =========================================================
     */

    const handleSetNewImageAsCover = (
        index
    ) => {
        setSelectedCoverImageId(null);

        setSelectedNewCoverIndex(
            index
        );

        setError("");
        setSuccess("");
    };

    /*
     * =========================================================
     * SET EXISTING IMAGE AS COVER
     * =========================================================
     */

    const handleSetExistingImageAsCover =
        async (imageId) => {
            if (
                !editingProjectId
            ) {
                return;
            }

            setError("");
            setSuccess("");
            setDeletingImageId(null);

            try {
                const token =
                    localStorage.getItem(
                        "token"
                    );

                if (!token) {
                    throw new Error(
                        "You are not authenticated. Please log in again."
                    );
                }

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/projects/${editingProjectId}/images/${imageId}/cover`,
                        {
                            method: "PUT",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );

                const contentType =
                    response.headers.get(
                        "content-type"
                    ) || "";

                const data =
                    contentType.includes(
                        "application/json"
                    )
                        ? await response.json()
                        : {};

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to set cover image"
                    );
                }

                /*
                 * The backend returns the entire
                 * updated project directly.
                 */

                const updatedImages =
                    Array.isArray(
                        data.images
                    )
                        ? data.images
                        : [];

                setExistingImages(
                    updatedImages
                );

                setSelectedCoverImageId(
                    imageId
                );

                setSelectedNewCoverIndex(
                    null
                );

                setProjects(
                    (currentProjects) =>
                        currentProjects.map(
                            (project) =>
                                project.id ===
                                editingProjectId
                                    ? data
                                    : project
                        )
                );

                setSuccess(
                    "Cover image updated successfully."
                );
            } catch (error) {
                console.error(
                    "Error setting cover image:",
                    error
                );

                setError(
                    error.message ||
                        "Failed to set cover image"
                );
            }
        };

    /*
     * =========================================================
     * DELETE EXISTING IMAGE
     * =========================================================
     */

    const handleDeleteExistingImage =
        async (imageId) => {
            if (
                !editingProjectId
            ) {
                return;
            }

            setError("");
            setSuccess("");

            setDeletingImageId(
                imageId
            );

            try {
                const token =
                    localStorage.getItem(
                        "token"
                    );

                if (!token) {
                    throw new Error(
                        "You are not authenticated. Please log in again."
                    );
                }

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/projects/${editingProjectId}/images/${imageId}`,
                        {
                            method: "DELETE",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );

                const contentType =
                    response.headers.get(
                        "content-type"
                    ) || "";

                const data =
                    contentType.includes(
                        "application/json"
                    )
                        ? await response.json()
                        : {};

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to delete project image"
                    );
                }

                /*
                 * Backend returns the complete
                 * updated project.
                 */

                const updatedImages =
                    Array.isArray(
                        data.images
                    )
                        ? data.images
                        : [];

                setExistingImages(
                    updatedImages
                );

                const newCover =
                    updatedImages.find(
                        (image) =>
                            image.isCover
                    );

                setSelectedCoverImageId(
                    newCover
                        ? newCover.id
                        : null
                );

                setSelectedNewCoverIndex(
                    null
                );

                setProjects(
                    (currentProjects) =>
                        currentProjects.map(
                            (project) =>
                                project.id ===
                                editingProjectId
                                    ? data
                                    : project
                        )
                );

                setSuccess(
                    "Project image removed successfully."
                );
            } catch (error) {
                console.error(
                    "Error deleting project image:",
                    error
                );

                setError(
                    error.message ||
                        "Failed to delete project image"
                );
            } finally {
                setDeletingImageId(
                    null
                );
            }
        };

    /*
     * =========================================================
     * ADD PROJECT
     * =========================================================
     */

    const handleAddProject = () => {
        setEditingProjectId(
            null
        );

        setFormData({
            ...emptyFormData,
        });

        resetImageState();

        setShowForm(true);

        setError("");
        setSuccess("");
    };

    /*
     * =========================================================
     * EDIT PROJECT
     * =========================================================
     */

    const handleEditProject = (
        project
    ) => {
        setEditingProjectId(
            project.id
        );

        setFormData({
            title:
                project.title || "",

            slug:
                project.slug || "",

            shortDescription:
                project.shortDescription ||
                "",

            description:
                project.description ||
                "",

            businessProblem:
                project.businessProblem ||
                "",

            methodology:
                project.methodology ||
                "",

            datasetDescription:
                project.datasetDescription ||
                "",

            dashboardImageUrl:
                project.dashboardImageUrl ||
                "",

            githubUrl:
                project.githubUrl ||
                "",

            liveUrl:
                project.liveUrl ||
                "",

            category:
                project.category || "",

            featured:
                project.featured ||
                false,

            startDate:
                project.startDate
                    ? project.startDate.substring(
                          0,
                          10
                      )
                    : "",

            endDate:
                project.endDate
                    ? project.endDate.substring(
                          0,
                          10
                      )
                    : "",
        });

        const projectImages =
            Array.isArray(
                project.images
            )
                ? project.images
                : [];

        setExistingImages(
            projectImages
        );

        const currentCover =
            projectImages.find(
                (image) =>
                    image.isCover
            );

        setSelectedCoverImageId(
            currentCover
                ? currentCover.id
                : null
        );

        setImageFiles([]);
        setImagePreviews([]);
        setSelectedNewCoverIndex(
            null
        );

        setShowForm(true);

        setError("");
        setSuccess("");
    };

    /*
     * =========================================================
     * CANCEL FORM
     * =========================================================
     */

    const handleCancel = () => {
        setShowForm(false);

        setEditingProjectId(null);

        setError("");
        setSuccess("");

        setFormData({
            ...emptyFormData,
        });

        resetImageState();
    };

    /*
     * =========================================================
     * DELETE MODAL
     * =========================================================
     */

    const openDeleteModal = (
        project
    ) => {
        setProjectToDelete(
            project
        );

        setShowDeleteModal(true);

        setError("");
        setSuccess("");
    };

    const closeDeleteModal = () => {
        if (saving) {
            return;
        }

        setShowDeleteModal(
            false
        );

        setProjectToDelete(
            null
        );
    };

    /*
     * =========================================================
     * DELETE PROJECT
     * =========================================================
     */

    const handleDeleteProject =
        async (projectId) => {
            setError("");
            setSuccess("");
            setSaving(true);

            try {
                const token =
                    localStorage.getItem(
                        "token"
                    );

                if (!token) {
                    throw new Error(
                        "You are not authenticated. Please log in again."
                    );
                }

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/projects/${projectId}`,
                        {
                            method: "DELETE",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );

                const contentType =
                    response.headers.get(
                        "content-type"
                    ) || "";

                const data =
                    contentType.includes(
                        "application/json"
                    )
                        ? await response.json()
                        : {};

                console.log(
                    "Delete project API response:",
                    data
                );

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to delete project"
                    );
                }

                await refreshProjects();

                setShowDeleteModal(
                    false
                );

                setProjectToDelete(
                    null
                );

                setSuccess(
                    "Project deleted successfully."
                );
            } catch (error) {
                console.error(
                    "Error deleting project:",
                    error
                );

                setError(
                    error.message ||
                        "Failed to delete project"
                );
            } finally {
                setSaving(false);
            }
        };

    /*
     * =========================================================
     * SUBMIT PROJECT
     * =========================================================
     */

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const token =
                localStorage.getItem(
                    "token"
                );

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const isEditing =
                editingProjectId !==
                null;

            const url = isEditing
                ? `${API_BASE_URL}/api/projects/${editingProjectId}`
                : `${API_BASE_URL}/api/projects`;

            const method = isEditing
                ? "PUT"
                : "POST";

            const data =
                new FormData();

            /*
             * =================================================
             * BASIC INFORMATION
             * =================================================
             */

            data.append(
                "title",
                formData.title
            );

            data.append(
                "slug",
                formData.slug
            );

            data.append(
                "shortDescription",
                formData.shortDescription
            );

            data.append(
                "description",
                formData.description
            );

            /*
             * =================================================
             * PROJECT ANALYSIS
             * =================================================
             */

            data.append(
                "businessProblem",
                formData.businessProblem
            );

            data.append(
                "methodology",
                formData.methodology
            );

            data.append(
                "datasetDescription",
                formData.datasetDescription
            );

            /*
             * =================================================
             * LINKS
             * =================================================
             */

            data.append(
                "githubUrl",
                formData.githubUrl
            );

            data.append(
                "liveUrl",
                formData.liveUrl
            );

            /*
             * =================================================
             * CATEGORY / FEATURED
             * =================================================
             */

            data.append(
                "category",
                formData.category
            );

            data.append(
                "featured",
                String(
                    formData.featured
                )
            );

            /*
             * =================================================
             * DATES
             * =================================================
             */

            data.append(
                "startDate",
                formData.startDate ||
                    ""
            );

            data.append(
                "endDate",
                formData.endDate ||
                    ""
            );

            /*
             * =================================================
             * NEW PROJECT IMAGES
             * =================================================
             */

            imageFiles.forEach(
                (file) => {
                    data.append(
                        "dashboardImages",
                        file
                    );
                }
            );

            /*
             * =================================================
             * COVER IMAGE
             * =================================================
             */

            if (
                selectedCoverImageId !==
                null
            ) {
                data.append(
                    "coverImageId",
                    String(
                        selectedCoverImageId
                    )
                );
            } else if (
                selectedNewCoverIndex !==
                    null &&
                imageFiles.length >
                    0
            ) {
                data.append(
                    "coverImageIndex",
                    String(
                        selectedNewCoverIndex
                    )
                );
            }

            /*
             * =================================================
             * API REQUEST
             * =================================================
             */

            const response =
                await fetch(
                    url,
                    {
                        method,

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: data,
                    }
                );

            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";

            const responseData =
                contentType.includes(
                    "application/json"
                )
                    ? await response.json()
                    : {};

            console.log(
                "Project save API response:",
                responseData
            );

            if (!response.ok) {
                throw new Error(
                    responseData.message ||
                        (isEditing
                            ? "Failed to update project"
                            : "Failed to create project")
                );
            }

            await refreshProjects();

            setSuccess(
                isEditing
                    ? "Project updated successfully."
                    : "Project created successfully."
            );

            setFormData({
                ...emptyFormData,
            });

            resetImageState();

            setEditingProjectId(
                null
            );

            setShowForm(false);
        } catch (error) {
            console.error(
                "Error saving project:",
                error
            );

            setError(
                error.message ||
                    "Failed to save project"
            );
        } finally {
            setSaving(false);
        }
    };

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <div className="projects-page">

            {/* =================================================
                TOP NAVIGATION
            ================================================= */}

            <div className="projects-top-navigation">

                <Link
                    to="/admin/dashboard"
                    className="projects-dashboard-link"
                >
                    ← Dashboard
                </Link>

            </div>

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="projects-page-header">

                <div className="projects-heading">

                    <div>

                        <h1>
                            Projects
                        </h1>

                        <p>
                            Manage the projects displayed
                            on your professional portfolio.
                        </p>

                    </div>

                    {!showForm && (
                        <button
                            className="add-project-button"
                            type="button"
                            onClick={
                                handleAddProject
                            }
                        >
                            + Add Project
                        </button>
                    )}

                </div>

            </div>

            <div className="projects-content">

                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}

                {success && (
                    <div className="projects-success">
                        {success}
                    </div>
                )}

                {/* =================================================
                    PROJECT FORM
                ================================================= */}

                {showForm && (
                    <div className="projects-card project-form-card">

                        <div className="projects-card-header">

                            <div>

                                <h2>
                                    {editingProjectId !==
                                    null
                                        ? "Edit Project"
                                        : "Add New Project"}
                                </h2>

                                <p>
                                    {editingProjectId !==
                                    null
                                        ? "Update the information for this portfolio project."
                                        : "Enter the information for your portfolio project."}
                                </p>

                            </div>

                        </div>

                        <form
                            className="project-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* =================================================
                                BASIC INFORMATION
                            ================================================= */}

                            <div className="project-form-section">

                                <h3>
                                    Basic Information
                                </h3>

                                <div className="project-form-group">

                                    <label htmlFor="title">
                                        Project Title
                                    </label>

                                    <input
                                        id="title"
                                        name="title"
                                        type="text"
                                        value={
                                            formData.title
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Healthcare Analytics Dashboard"
                                        required
                                    />

                                </div>

                                <div className="project-form-row">

                                    <div className="project-form-group">

                                        <label htmlFor="slug">
                                            Slug
                                        </label>

                                        <input
                                            id="slug"
                                            name="slug"
                                            type="text"
                                            value={
                                                formData.slug
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. healthcare-analytics-dashboard"
                                            required
                                        />

                                        <small>
                                            Use lowercase
                                            letters, numbers,
                                            and hyphens.
                                        </small>

                                    </div>

                                    <div className="project-form-group">

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
                                            placeholder="e.g. Power BI, SQL, Excel, Data Analysis"
                                        />

                                    </div>

                                </div>

                                <div className="project-form-group">

                                    <label htmlFor="shortDescription">
                                        Short Description
                                    </label>

                                    <textarea
                                        id="shortDescription"
                                        name="shortDescription"
                                        rows="3"
                                        value={
                                            formData.shortDescription
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. An interactive Power BI dashboard providing insights into patient admissions, clinical outcomes, revenue, and hospital performance."
                                        required
                                    />

                                    <small>
                                        Keep this short because it
                                        may be displayed as a project
                                        preview on your portfolio.
                                    </small>

                                </div>

                                <div className="project-form-group">

                                    <label htmlFor="description">
                                        Project Description
                                    </label>

                                    <textarea
                                        id="description"
                                        name="description"
                                        rows="5"
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. A healthcare analytics project developed for a medical centre to transform patient admission data into actionable business insights."
                                    />

                                </div>

                            </div>

                            {/* =================================================
                                PROJECT ANALYSIS
                            ================================================= */}

                            <div className="project-form-section">

                                <h3>
                                    Project Analysis
                                </h3>

                                <div className="project-form-group">

                                    <label htmlFor="businessProblem">
                                        Business Problem
                                    </label>

                                    <textarea
                                        id="businessProblem"
                                        name="businessProblem"
                                        rows="4"
                                        value={
                                            formData.businessProblem
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. The medical centre needed a clear view of patient demographics, clinical conditions, admissions, billing, revenue, and operational performance."
                                    />

                                    <small>
                                        Describe the business
                                        concern or decision-making
                                        problem the project addresses.
                                    </small>

                                </div>

                                <div className="project-form-group">

                                    <label htmlFor="methodology">
                                        Methodology
                                    </label>

                                    <textarea
                                        id="methodology"
                                        name="methodology"
                                        rows="4"
                                        value={
                                            formData.methodology
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Data cleaning and transformation in Power Query, data modeling with a dedicated date table, DAX measures, interactive Power BI visualizations, and business-focused analysis."
                                    />

                                    <small>
                                        Explain the main tools,
                                        techniques, and process used
                                        to complete the project.
                                    </small>

                                </div>

                                <div className="project-form-group">

                                    <label htmlFor="datasetDescription">
                                        Dataset Description
                                    </label>

                                    <textarea
                                        id="datasetDescription"
                                        name="datasetDescription"
                                        rows="4"
                                        value={
                                            formData.datasetDescription
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Healthcare patient admission dataset containing approximately 55,500 records with information on demographics, medical conditions, admissions, billing, and hospital details."
                                    />

                                    <small>
                                        Mention the dataset size,
                                        source or type, important
                                        fields, and relevant scope.
                                    </small>

                                </div>

                            </div>

                            {/* =================================================
                                LINKS & MEDIA
                            ================================================= */}

                            <div className="project-form-section">

                                <h3>
                                    Links & Media
                                </h3>

                                <div className="project-form-group">

                                    <label htmlFor="dashboardImages">
                                        Project Images
                                    </label>

                                    <input
                                        id="dashboardImages"
                                        name="dashboardImages"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        onChange={
                                            handleImageChange
                                        }
                                    />

                                    <small>
                                        Add JPG, PNG, or WebP images.
                                        Each image must be smaller
                                        than 5 MB. Existing images
                                        remain when you add new ones.
                                    </small>

                                    {/* EXISTING IMAGES */}

                                    {editingProjectId !==
                                        null &&
                                        existingImages.length >
                                            0 && (
                                            <div className="project-image-preview">

                                                <p className="project-image-preview-label">
                                                    Existing Project Images
                                                </p>

                                                <small>
                                                    These images are already
                                                    saved. You can change
                                                    the cover or remove an
                                                    image without re-uploading
                                                    it.
                                                </small>

                                                <div className="project-images-preview-grid">

                                                    {existingImages.map(
                                                        (
                                                            image,
                                                            index
                                                        ) => (
                                                            <div
                                                                className={`project-image-preview-item ${
                                                                    image.isCover
                                                                        ? "is-cover"
                                                                        : ""
                                                                }`}
                                                                key={
                                                                    image.id
                                                                }
                                                            >

                                                                <img
                                                                    src={getImageUrl(
                                                                        image.imageUrl
                                                                    )}
                                                                    alt={`Existing project image ${
                                                                        index +
                                                                        1
                                                                    }`}
                                                                    className="project-image-preview-image"
                                                                />

                                                                {image.isCover && (
                                                                    <span className="project-image-cover-badge">
                                                                        Current Cover
                                                                    </span>
                                                                )}

                                                                <div className="project-image-preview-actions">

                                                                    <button
                                                                        type="button"
                                                                        className="project-image-cover-button"
                                                                        onClick={() =>
                                                                            handleSetExistingImageAsCover(
                                                                                image.id
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            saving ||
                                                                            deletingImageId !==
                                                                                null ||
                                                                            image.isCover
                                                                        }
                                                                    >
                                                                        {image.isCover
                                                                            ? "Current Cover"
                                                                            : "Set as Cover"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="project-image-remove-button"
                                                                        onClick={() => {
                                                                            setImageToDelete(image);
                                                                            setShowImageDeleteModal(true);
                                                                            setError("");
                                                                            setSuccess("");
                                                                        }}
                                                                        disabled={
                                                                            saving ||
                                                                            deletingImageId !==
                                                                                null
                                                                        }
                                                                    >
                                                                        {deletingImageId ===
                                                                        image.id
                                                                            ? "Removing..."
                                                                            : "Remove"}
                                                                    </button>

                                                                </div>

                                                            </div>
                                                        )
                                                    )}

                                                </div>

                                            </div>
                                        )}

                                    {/* NEW IMAGE PREVIEWS */}

                                    {imagePreviews.length >
                                        0 && (
                                        <div className="project-image-preview">

                                            <p className="project-image-preview-label">
                                                New Image Previews
                                            </p>

                                            <small>
                                                These images have not
                                                been saved yet. You can
                                                remove them or choose one
                                                as the new cover.
                                            </small>

                                            <div className="project-images-preview-grid">

                                                {imagePreviews.map(
                                                    (
                                                        preview,
                                                        index
                                                    ) => (
                                                        <div
                                                            className={`project-image-preview-item ${
                                                                selectedNewCoverIndex ===
                                                                index
                                                                    ? "is-cover"
                                                                    : ""
                                                            }`}
                                                            key={
                                                                preview
                                                            }
                                                        >

                                                            <img
                                                                src={
                                                                    preview
                                                                }
                                                                alt={`New project image ${
                                                                    index +
                                                                    1
                                                                }`}
                                                                className="project-image-preview-image"
                                                            />

                                                            {selectedNewCoverIndex ===
                                                                index && (
                                                                <span className="project-image-cover-badge">
                                                                    New Cover
                                                                </span>
                                                            )}

                                                            <div className="project-image-preview-actions">

                                                                <button
                                                                    type="button"
                                                                    className="project-image-cover-button"
                                                                    onClick={() =>
                                                                        handleSetNewImageAsCover(
                                                                            index
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                >
                                                                    {selectedNewCoverIndex ===
                                                                    index
                                                                        ? "Selected as Cover"
                                                                        : "Set as Cover"}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="project-image-remove-button"
                                                                    onClick={() =>
                                                                        handleRemoveNewImage(
                                                                            index
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                >
                                                                    Remove
                                                                </button>

                                                            </div>

                                                        </div>
                                                    )
                                                )}

                                            </div>

                                        </div>
                                    )}

                                </div>

                                <div className="project-form-row">

                                    <div className="project-form-group">

                                        <label htmlFor="githubUrl">
                                            GitHub URL
                                        </label>

                                        <input
                                            id="githubUrl"
                                            name="githubUrl"
                                            type="url"
                                            value={
                                                formData.githubUrl
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. https://github.com/username/project-name"
                                        />

                                    </div>

                                    <div className="project-form-group">

                                        <label htmlFor="liveUrl">
                                            Live Project URL
                                        </label>

                                        <input
                                            id="liveUrl"
                                            name="liveUrl"
                                            type="url"
                                            value={
                                                formData.liveUrl
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. https://yourportfolio.com/projects/project-name"
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                PROJECT DETAILS
                            ================================================= */}

                            <div className="project-form-section">

                                <h3>
                                    Project Details
                                </h3>

                                <div className="project-form-row">

                                    <div className="project-form-group">

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
                                        />

                                        <small>
                                            When you started
                                            working on the project.
                                        </small>

                                    </div>

                                    <div className="project-form-group">

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
                                        />

                                        <small>
                                            Leave empty if the
                                            project is still ongoing.
                                        </small>

                                    </div>

                                </div>

                                <label className="featured-checkbox">

                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={
                                            formData.featured
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <span>
                                        Feature this project
                                    </span>

                                </label>

                            </div>

                            {/* =================================================
                                ERROR
                            ================================================= */}

                            {error && (
                                <div className="projects-error">
                                    {error}
                                </div>
                            )}

                            {/* =================================================
                                FORM ACTIONS
                            ================================================= */}

                            <div className="project-form-actions">

                                <button
                                    type="button"
                                    className="project-cancel-button"
                                    onClick={
                                        handleCancel
                                    }
                                    disabled={
                                        saving ||
                                        deletingImageId !==
                                            null
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="project-save-button"
                                    disabled={
                                        saving ||
                                        deletingImageId !==
                                            null
                                    }
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingProjectId !==
                                            null
                                        ? "Update Project"
                                        : "Create Project"}
                                </button>

                            </div>

                        </form>

                    </div>
                )}

                {/* =================================================
                    LOADING STATE
                ================================================= */}

                {!showForm &&
                    loading && (
                        <div className="projects-card">

                            <div className="projects-loading">
                                Loading projects...
                            </div>

                        </div>
                    )}

                {/* =================================================
                    ERROR STATE
                ================================================= */}

                {!showForm &&
                    !loading &&
                    error && (
                        <div className="projects-card">

                            <div className="projects-error">
                                {error}
                            </div>

                        </div>
                    )}

                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {!showForm &&
                    !loading &&
                    !error &&
                    projects.length === 0 && (
                        <div className="projects-card">

                            <div className="projects-empty">

                                <h2>
                                    No Projects Yet
                                </h2>

                                <p>
                                    You have not added any
                                    projects to your
                                    portfolio yet.
                                </p>

                                <button
                                    className="add-project-button"
                                    type="button"
                                    onClick={
                                        handleAddProject
                                    }
                                >
                                    + Add Your First Project
                                </button>

                            </div>

                        </div>
                    )}

                {/* =================================================
                    PROJECT LIST
                ================================================= */}

                {!showForm &&
                    !loading &&
                    !error &&
                    projects.length > 0 && (
                        <div className="projects-card">

                            <div className="projects-card-header">

                                <div>

                                    <h2>
                                        Portfolio Projects
                                    </h2>

                                    <p>
                                        {
                                            projects.length
                                        }{" "}
                                        {
                                            projects.length ===
                                            1
                                                ? "project"
                                                : "projects"
                                        }{" "}
                                        currently in your
                                        portfolio.
                                    </p>

                                </div>

                            </div>

                            <div className="projects-list">

                                {projects.map(
                                    (
                                        project
                                    ) => (
                                        <div
                                            className="project-item"
                                            key={
                                                project.id
                                            }
                                        >

                                            <div className="project-item-main">

                                                <div className="project-item-title">

                                                    <h3>
                                                        {
                                                            project.title
                                                        }
                                                    </h3>

                                                    {project.featured && (
                                                        <span className="featured-badge">
                                                            Featured
                                                        </span>
                                                    )}

                                                </div>

                                                <p className="project-description">
                                                    {project.shortDescription ||
                                                        "No short description available."}
                                                </p>

                                                <div className="project-meta">

                                                    {project.category && (
                                                        <span>
                                                            {
                                                                project.category
                                                            }
                                                        </span>
                                                    )}

                                                    {project.slug && (
                                                        <span>
                                                            /
                                                            {
                                                                project.slug
                                                            }
                                                        </span>
                                                    )}

                                                </div>

                                            </div>

                                            <div className="project-item-actions">

                                                <button
                                                    type="button"
                                                    className="project-action-button"
                                                    onClick={() =>
                                                        handleEditProject(
                                                            project
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="project-action-button delete"
                                                    onClick={() =>
                                                        openDeleteModal(
                                                            project
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>
                    )}

            </div>

            {/* =================================================
                IMAGE DELETE MODAL
            ================================================= */}

            {showImageDeleteModal &&
                imageToDelete && (
                    <div
                        className="delete-modal-overlay"
                        onClick={() => {
                            if (
                                deletingImageId ===
                                null
                            ) {
                                setShowImageDeleteModal(
                                    false
                                );

                                setImageToDelete(
                                    null
                                );
                            }
                        }}
                    >

                        <div
                            className="delete-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <div className="delete-modal-icon">
                                !
                            </div>

                            <h2>
                                Delete Project Image?
                            </h2>

                            <p>
                                Are you sure you want to delete this image?
                            </p>

                            <span className="delete-modal-warning">
                                This action cannot be undone.
                            </span>

                            <div className="delete-modal-actions">

                                <button
                                    type="button"
                                    className="delete-modal-cancel"
                                    onClick={() => {
                                        setShowImageDeleteModal(
                                            false
                                        );

                                        setImageToDelete(
                                            null
                                        );
                                    }}
                                    disabled={
                                        deletingImageId !==
                                        null
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="delete-modal-confirm"
                                    onClick={async () => {
                                        if (
                                            !imageToDelete
                                        ) {
                                            return;
                                        }

                                        await handleDeleteExistingImage(
                                            imageToDelete.id
                                        );

                                        setShowImageDeleteModal(
                                            false
                                        );

                                        setImageToDelete(
                                            null
                                        );
                                    }}
                                    disabled={
                                        deletingImageId !==
                                        null
                                    }
                                >
                                    {deletingImageId !==
                                    null
                                        ? "Deleting..."
                                        : "Delete Image"}
                                </button>

                            </div>

                        </div>

                    </div>
                )}

            {/* =================================================
                PROJECT DELETE MODAL
            ================================================= */}

            {showDeleteModal &&
                projectToDelete && (
                    <div
                        className="delete-modal-overlay"
                        onClick={
                            closeDeleteModal
                        }
                    >

                        <div
                            className="delete-modal"
                            onClick={(
                                event
                            ) =>
                                event.stopPropagation()
                            }
                        >

                            <div className="delete-modal-icon">
                                !
                            </div>

                            <h2>
                                Delete Project?
                            </h2>

                            <p>
                                Are you sure you want
                                to delete{" "}
                                <strong>
                                    {
                                        projectToDelete.title
                                    }
                                </strong>
                                ?
                            </p>

                            <span className="delete-modal-warning">
                                This action cannot be undone.
                            </span>

                            <div className="delete-modal-actions">

                                <button
                                    type="button"
                                    className="delete-modal-cancel"
                                    onClick={
                                        closeDeleteModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="delete-modal-confirm"
                                    onClick={() =>
                                        handleDeleteProject(
                                            projectToDelete.id
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "Deleting..."
                                        : "Delete Project"}
                                </button>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
}

export default Projects;