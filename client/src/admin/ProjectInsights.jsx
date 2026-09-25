import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/AdminProjectInsights.css";

function ProjectInsights() {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] =
        useState("");

    const [insights, setInsights] = useState([]);
    const [recommendations, setRecommendations] =
        useState([]);

    const [newInsight, setNewInsight] = useState("");
    const [newRecommendation, setNewRecommendation] =
        useState("");

    // Editing state
    const [editingInsightId, setEditingInsightId] =
        useState(null);

    const [editingRecommendationId, setEditingRecommendationId] =
        useState(null);

    const [editingInsightText, setEditingInsightText] =
        useState("");

    const [editingRecommendationText, setEditingRecommendationText] =
        useState("");

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const [itemToDelete, setItemToDelete] =
        useState(null);

    const [deleteType, setDeleteType] =
        useState("");

    /*
     * =========================================================
     * LOAD AUTHENTICATED USER'S PROJECTS
     * =========================================================
     */

    useEffect(() => {
        let cancelled = false;

        const loadProjects = async () => {
            try {
                const token =
                    localStorage.getItem("token");

                if (!token) {
                    throw new Error(
                        "Your session has expired. Please log in again."
                    );
                }

                const response = await fetch(
                    "http://localhost:5000/api/projects",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    const data =
                        await response.json().catch(
                            () => ({})
                        );

                    throw new Error(
                        data.message ||
                        "Failed to fetch projects"
                    );
                }

                const data =
                    await response.json();

                if (!cancelled) {
                    setProjects(data);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        "Error fetching projects:",
                        error
                    );
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
     * LOAD INSIGHTS AND RECOMMENDATIONS
     * =========================================================
     */

    const handleProjectChange = async (event) => {
        const projectId = event.target.value;

        setSelectedProjectId(projectId);

        setInsights([]);
        setRecommendations([]);

        // Reset editing state when changing projects
        setEditingInsightId(null);
        setEditingRecommendationId(null);
        setEditingInsightText("");
        setEditingRecommendationText("");

        if (!projectId) {
            return;
        }

        try {
            const [
                insightsResponse,
                recommendationsResponse,
            ] = await Promise.all([
                fetch(
                    `http://localhost:5000/api/projects/${projectId}/insights`
                ),

                fetch(
                    `http://localhost:5000/api/projects/${projectId}/recommendations`
                ),
            ]);

            if (!insightsResponse.ok) {
                throw new Error(
                    "Failed to fetch project insights"
                );
            }

            if (!recommendationsResponse.ok) {
                throw new Error(
                    "Failed to fetch project recommendations"
                );
            }

            const insightsData =
                await insightsResponse.json();

            const recommendationsData =
                await recommendationsResponse.json();

            setInsights(insightsData);
            setRecommendations(
                recommendationsData
            );
        } catch (error) {
            console.error(
                "Error fetching project insights and recommendations:",
                error
            );
        }
    };

    /*
     * =========================================================
     * ADD KEY INSIGHT
     * =========================================================
     */

    const handleAddInsight = async (event) => {
        event.preventDefault();

        if (!newInsight.trim()) {
            return;
        }

        if (!selectedProjectId) {
            return;
        }

        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `http://localhost:5000/api/projects/${selectedProjectId}/insights`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        insight:
                            newInsight.trim(),
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to add insight"
                );
            }

            setInsights([
                ...insights,
                data,
            ]);

            setNewInsight("");
        } catch (error) {
            console.error(
                "Error adding insight:",
                error
            );
        }
    };

    /*
     * =========================================================
     * ADD STRATEGIC RECOMMENDATION
     * =========================================================
     */

    const handleAddRecommendation = async (
        event
    ) => {
        event.preventDefault();

        if (!newRecommendation.trim()) {
            return;
        }

        if (!selectedProjectId) {
            return;
        }

        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `http://localhost:5000/api/projects/${selectedProjectId}/recommendations`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        recommendation:
                            newRecommendation.trim(),
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to add recommendation"
                );
            }

            setRecommendations([
                ...recommendations,
                data,
            ]);

            setNewRecommendation("");
        } catch (error) {
            console.error(
                "Error adding recommendation:",
                error
            );
        }
    };

    /*
     * =========================================================
     * START EDITING INSIGHT
     * =========================================================
     */

    const handleStartEditInsight = (item) => {
        setEditingInsightId(item.id);
        setEditingInsightText(item.insight);

        // Make sure recommendation edit mode is closed
        setEditingRecommendationId(null);
        setEditingRecommendationText("");
    };

    /*
     * =========================================================
     * CANCEL EDITING INSIGHT
     * =========================================================
     */

    const handleCancelEditInsight = () => {
        setEditingInsightId(null);
        setEditingInsightText("");
    };

    /*
     * =========================================================
     * SAVE EDITED INSIGHT
     * =========================================================
     */

    const handleSaveInsight = async (id) => {
        if (!editingInsightText.trim()) {
            return;
        }

        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `http://localhost:5000/api/projects/insights/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        insight:
                            editingInsightText.trim(),
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update insight"
                );
            }

            setInsights(
                insights.map((item) =>
                    item.id === id
                        ? data
                        : item
                )
            );

            setEditingInsightId(null);
            setEditingInsightText("");
        } catch (error) {
            console.error(
                "Error updating insight:",
                error
            );
        }
    };

    /*
     * =========================================================
     * START EDITING RECOMMENDATION
     * =========================================================
     */

    const handleStartEditRecommendation = (
        item
    ) => {
        setEditingRecommendationId(item.id);
        setEditingRecommendationText(
            item.recommendation
        );

        // Make sure insight edit mode is closed
        setEditingInsightId(null);
        setEditingInsightText("");
    };

    /*
     * =========================================================
     * CANCEL EDITING RECOMMENDATION
     * =========================================================
     */

    const handleCancelEditRecommendation = () => {
        setEditingRecommendationId(null);
        setEditingRecommendationText("");
    };

    /*
     * =========================================================
     * SAVE EDITED RECOMMENDATION
     * =========================================================
     */

    const handleSaveRecommendation = async (
        id
    ) => {
        if (!editingRecommendationText.trim()) {
            return;
        }

        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `http://localhost:5000/api/projects/recommendations/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        recommendation:
                            editingRecommendationText.trim(),
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update recommendation"
                );
            }

            setRecommendations(
                recommendations.map((item) =>
                    item.id === id
                        ? data
                        : item
                )
            );

            setEditingRecommendationId(null);
            setEditingRecommendationText("");
        } catch (error) {
            console.error(
                "Error updating recommendation:",
                error
            );
        }
    };

    /*
     * =========================================================
     * OPEN DELETE MODAL
     * =========================================================
     */

    const openDeleteModal = (
        item,
        type
    ) => {
        setItemToDelete(item);
        setDeleteType(type);
        setShowDeleteModal(true);
    };

    /*
     * =========================================================
     * CLOSE DELETE MODAL
     * =========================================================
     */

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
        setDeleteType("");
    };

    /*
     * =========================================================
     * DELETE KEY INSIGHT
     * =========================================================
     */

    const handleDeleteInsight = async (
        id
    ) => {
        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `http://localhost:5000/api/projects/insights/${id}`,
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
                    "Failed to delete insight"
                );
            }

            setInsights(
                insights.filter(
                    (item) =>
                        item.id !== id
                )
            );
        } catch (error) {
            console.error(
                "Error deleting insight:",
                error
            );
        }
    };

    /*
     * =========================================================
     * DELETE STRATEGIC RECOMMENDATION
     * =========================================================
     */

    const handleDeleteRecommendation = async (
        id
    ) => {
        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please log in again."
                );
            }

            const response = await fetch(
                `http://localhost:5000/api/projects/recommendations/${id}`,
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
                    "Failed to delete recommendation"
                );
            }

            setRecommendations(
                recommendations.filter(
                    (item) =>
                        item.id !== id
                )
            );
        } catch (error) {
            console.error(
                "Error deleting recommendation:",
                error
            );
        }
    };

    /*
     * =========================================================
     * CONFIRM DELETE
     * =========================================================
     */

    const confirmDelete = async () => {
        if (!itemToDelete) {
            return;
        }

        if (deleteType === "insight") {
            await handleDeleteInsight(
                itemToDelete.id
            );
        }

        if (
            deleteType ===
            "recommendation"
        ) {
            await handleDeleteRecommendation(
                itemToDelete.id
            );
        }

        closeDeleteModal();
    };

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <div className="project-insights-page">

            {/* =================================================
                TOP NAVIGATION
                ================================================= */}

            <div className="project-insights-top-navigation">

                <Link
                    to="/admin/dashboard"
                    className="project-insights-dashboard-link"
                >
                    ← Dashboard
                </Link>

            </div>


            {/* =================================================
                PAGE HEADING
                ================================================= */}

            <div className="project-insights-page-heading">

                <div>

                    <h1>
                        Project Insights
                    </h1>

                    <p>
                        Manage key insights and strategic
                        recommendations for your portfolio
                        projects.
                    </p>

                </div>

            </div>


            {/* =================================================
                PROJECT SELECTION
                ================================================= */}

            <section className="project-insights-card">

                <div className="project-insights-section-heading">

                    <div>

                        <h2>
                            Select Project
                        </h2>

                        <p>
                            Choose a project to manage its
                            insights and recommendations.
                        </p>

                    </div>

                </div>


                <div className="project-insights-form-group">

                    <label htmlFor="project">
                        Project
                    </label>

                    <select
                        id="project"
                        value={
                            selectedProjectId
                        }
                        onChange={
                            handleProjectChange
                        }
                    >

                        <option value="">
                            Select a project
                        </option>

                        {projects.map(
                            (project) => (
                                <option
                                    key={
                                        project.id
                                    }
                                    value={
                                        project.id
                                    }
                                >
                                    {
                                        project.title
                                    }
                                </option>
                            )
                        )}

                    </select>

                </div>

            </section>


            {/* =================================================
                PROJECT MANAGEMENT
                ================================================= */}

            {selectedProjectId && (
                <>

                    {/* =================================================
                        KEY INSIGHTS
                        ================================================= */}

                    <section className="project-insights-card">

                        <div className="project-insights-section-heading">

                            <div>

                                <h2>
                                    Key Insights
                                </h2>

                                <p>
                                    Highlight the most important
                                    findings from this project.
                                </p>

                            </div>

                        </div>


                        {/* Add Insight Form */}

                        <form
                            className="project-insights-add-form"
                            onSubmit={
                                handleAddInsight
                            }
                        >

                            <div className="project-insights-form-group">

                                <label htmlFor="newInsight">
                                    Add Key Insight
                                </label>

                                <textarea
                                    id="newInsight"
                                    value={
                                        newInsight
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewInsight(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Enter a key insight from this project..."
                                    rows="3"
                                />

                            </div>


                            <button
                                type="submit"
                                className="project-insights-primary-button"
                            >
                                Add Insight
                            </button>

                        </form>


                        {/* Insights List */}

                        <div className="project-insights-list">

                            {insights.length ===
                            0 ? (
                                <div className="project-insights-empty">

                                    <span>
                                        •
                                    </span>

                                    <p>
                                        No key insights have
                                        been added yet.
                                    </p>

                                </div>
                            ) : (
                                insights.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <div
                                            className="project-insight-item"
                                            key={
                                                item.id
                                            }
                                        >

                                            <div className="project-insight-number">
                                                {
                                                    index +
                                                    1
                                                }
                                            </div>


                                            <div className="project-insight-content">

                                                {editingInsightId ===
                                                item.id ? (
                                                    <textarea
                                                        className="project-insight-edit-textarea"
                                                        value={
                                                            editingInsightText
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setEditingInsightText(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        rows="3"
                                                    />
                                                ) : (
                                                    <p>
                                                        {
                                                            item.insight
                                                        }
                                                    </p>
                                                )}

                                            </div>


                                            <div className="project-insight-actions">

                                                {editingInsightId ===
                                                item.id ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="project-insight-save"
                                                            onClick={() =>
                                                                handleSaveInsight(
                                                                    item.id
                                                                )
                                                            }
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="project-insight-cancel"
                                                            onClick={
                                                                handleCancelEditInsight
                                                            }
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="project-insight-edit"
                                                            onClick={() =>
                                                                handleStartEditInsight(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="project-insight-delete"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    item,
                                                                    "insight"
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}

                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                    </section>


                    {/* =================================================
                        STRATEGIC RECOMMENDATIONS
                        ================================================= */}

                    <section className="project-insights-card">

                        <div className="project-insights-section-heading">

                            <div>

                                <h2>
                                    Strategic Recommendations
                                </h2>

                                <p>
                                    Add practical recommendations
                                    based on the project findings.
                                </p>

                            </div>

                        </div>


                        {/* Add Recommendation Form */}

                        <form
                            className="project-insights-add-form"
                            onSubmit={
                                handleAddRecommendation
                            }
                        >

                            <div className="project-insights-form-group">

                                <label htmlFor="newRecommendation">
                                    Add Strategic Recommendation
                                </label>

                                <textarea
                                    id="newRecommendation"
                                    value={
                                        newRecommendation
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewRecommendation(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Enter a strategic recommendation..."
                                    rows="3"
                                />

                            </div>


                            <button
                                type="submit"
                                className="project-insights-primary-button"
                            >
                                Add Recommendation
                            </button>

                        </form>


                        {/* Recommendations List */}

                        <div className="project-insights-list">

                            {recommendations.length ===
                            0 ? (
                                <div className="project-insights-empty">

                                    <span>
                                        •
                                    </span>

                                    <p>
                                        No strategic
                                        recommendations have
                                        been added yet.
                                    </p>

                                </div>
                            ) : (
                                recommendations.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <div
                                            className="project-insight-item"
                                            key={
                                                item.id
                                            }
                                        >

                                            <div className="project-insight-number">
                                                {
                                                    index +
                                                    1
                                                }
                                            </div>


                                            <div className="project-insight-content">

                                                {editingRecommendationId ===
                                                item.id ? (
                                                    <textarea
                                                        className="project-insight-edit-textarea"
                                                        value={
                                                            editingRecommendationText
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setEditingRecommendationText(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        rows="3"
                                                    />
                                                ) : (
                                                    <p>
                                                        {
                                                            item.recommendation
                                                        }
                                                    </p>
                                                )}

                                            </div>


                                            <div className="project-insight-actions">

                                                {editingRecommendationId ===
                                                item.id ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="project-insight-save"
                                                            onClick={() =>
                                                                handleSaveRecommendation(
                                                                    item.id
                                                                )
                                                            }
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="project-insight-cancel"
                                                            onClick={
                                                                handleCancelEditRecommendation
                                                            }
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="project-insight-edit"
                                                            onClick={() =>
                                                                handleStartEditRecommendation(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="project-insight-delete"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    item,
                                                                    "recommendation"
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}

                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                    </section>

                </>
            )}


            {/* =================================================
                DELETE CONFIRMATION MODAL
                ================================================= */}

            {showDeleteModal && (
                <div className="project-insights-modal-overlay">

                    <div className="project-insights-delete-modal">

                        <div className="project-insights-modal-icon">
                            !
                        </div>


                        <div className="project-insights-modal-content">

                            <h3>
                                Delete{" "}
                                {deleteType ===
                                "insight"
                                    ? "Key Insight"
                                    : "Strategic Recommendation"}
                                ?
                            </h3>

                            <p>
                                Are you sure you want
                                to delete this{" "}
                                {deleteType ===
                                "insight"
                                    ? "key insight"
                                    : "strategic recommendation"}
                                ? This action cannot
                                be undone.
                            </p>

                        </div>


                        <div className="project-insights-modal-actions">

                            <button
                                type="button"
                                className="project-insights-modal-cancel"
                                onClick={
                                    closeDeleteModal
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="project-insights-modal-confirm"
                                onClick={
                                    confirmDelete
                                }
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default ProjectInsights;