const prisma = require("../prisma");

const getAuthenticatedUserId = (req) => {
    const userId = Number(req.user?.userId);

    if (!req.user || !Number.isInteger(userId) || userId <= 0) {
        return null;
    }

    return userId;
};

/*
|--------------------------------------------------------------------------
| Create Recommendation
|--------------------------------------------------------------------------
*/

const createRecommendation = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { recommendation, sortOrder } = req.body;

        const userId = getAuthenticatedUserId(req);
        const numericProjectId = Number(projectId);

        if (!recommendation || !recommendation.trim()) {
            return res.status(400).json({
                message: "Recommendation is required",
            });
        }

        if (!Number.isInteger(numericProjectId)) {
            return res.status(400).json({
                message: "Invalid project ID",
            });
        }

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Find the project
        |--------------------------------------------------------------------------
        */

        const project = await prisma.project.findUnique({
            where: {
                id: numericProjectId,
            },
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Verify project ownership
        |--------------------------------------------------------------------------
        */

        if (project.userId !== userId) {
            return res.status(403).json({
                message:
                    "You are not authorized to add a recommendation to this project",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Create recommendation
        |--------------------------------------------------------------------------
        */

        const newRecommendation =
            await prisma.projectRecommendation.create({
                data: {
                    recommendation: recommendation.trim(),
                    sortOrder: sortOrder ?? 0,
                    projectId: numericProjectId,
                },
            });

        return res.status(201).json(newRecommendation);
    } catch (error) {
        console.error(
            "Error creating recommendation:",
            error
        );

        return res.status(500).json({
            message: "Failed to create recommendation",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Recommendations
|
| Public endpoint for now.
|
| PortfolioSlug-based filtering will be added when we update the
| public project APIs.
|--------------------------------------------------------------------------
*/

const getRecommendations = async (req, res) => {
    try {
        const { projectId } = req.params;
        const numericProjectId = Number(projectId);

        if (!Number.isInteger(numericProjectId)) {
            return res.status(400).json({
                message: "Invalid project ID",
            });
        }

        const project = await prisma.project.findUnique({
            where: {
                id: numericProjectId,
            },
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const recommendations =
            await prisma.projectRecommendation.findMany({
                where: {
                    projectId: numericProjectId,
                },
                orderBy: {
                    sortOrder: "asc",
                },
            });

        return res.status(200).json(recommendations);
    } catch (error) {
        console.error(
            "Error fetching recommendations:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch recommendations",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Update Recommendation
|--------------------------------------------------------------------------
*/

const updateRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const { recommendation, sortOrder } = req.body;

        const userId = getAuthenticatedUserId(req);
        const numericId = Number(id);

        if (!recommendation || !recommendation.trim()) {
            return res.status(400).json({
                message: "Recommendation is required",
            });
        }

        if (!Number.isInteger(numericId)) {
            return res.status(400).json({
                message: "Invalid recommendation ID",
            });
        }

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Find recommendation together with its project
        |--------------------------------------------------------------------------
        */

        const existingRecommendation =
            await prisma.projectRecommendation.findUnique({
                where: {
                    id: numericId,
                },
                include: {
                    project: true,
                },
            });

        if (!existingRecommendation) {
            return res.status(404).json({
                message: "Recommendation not found",
            });
        }

        const project = existingRecommendation.project;

        /*
        |--------------------------------------------------------------------------
        | Verify parent project ownership
        |--------------------------------------------------------------------------
        */

        if (!project || project.userId !== userId) {
            return res.status(403).json({
                message:
                    "You are not authorized to update this recommendation",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Update recommendation
        |--------------------------------------------------------------------------
        */

        const updatedRecommendation =
            await prisma.projectRecommendation.update({
                where: {
                    id: numericId,
                },
                data: {
                    recommendation:
                        recommendation.trim(),
                    sortOrder:
                        sortOrder ??
                        existingRecommendation.sortOrder,
                },
            });

        return res.status(200).json(updatedRecommendation);
    } catch (error) {
        console.error(
            "Error updating recommendation:",
            error
        );

        return res.status(500).json({
            message: "Failed to update recommendation",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Delete Recommendation
|--------------------------------------------------------------------------
*/

const deleteRecommendation = async (req, res) => {
    try {
        const { id } = req.params;

        const userId = getAuthenticatedUserId(req);
        const numericId = Number(id);

        if (!Number.isInteger(numericId)) {
            return res.status(400).json({
                message: "Invalid recommendation ID",
            });
        }

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Find recommendation together with its project
        |--------------------------------------------------------------------------
        */

        const existingRecommendation =
            await prisma.projectRecommendation.findUnique({
                where: {
                    id: numericId,
                },
                include: {
                    project: true,
                },
            });

        if (!existingRecommendation) {
            return res.status(404).json({
                message: "Recommendation not found",
            });
        }

        const project = existingRecommendation.project;

        /*
        |--------------------------------------------------------------------------
        | Verify parent project ownership
        |--------------------------------------------------------------------------
        */

        if (!project || project.userId !== userId) {
            return res.status(403).json({
                message:
                    "You are not authorized to delete this recommendation",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Delete recommendation
        |--------------------------------------------------------------------------
        */

        await prisma.projectRecommendation.delete({
            where: {
                id: numericId,
            },
        });

        return res.status(200).json({
            message:
                "Recommendation deleted successfully",
        });
    } catch (error) {
        console.error(
            "Error deleting recommendation:",
            error
        );

        return res.status(500).json({
            message: "Failed to delete recommendation",
        });
    }
};

module.exports = {
    createRecommendation,
    getRecommendations,
    updateRecommendation,
    deleteRecommendation,
};