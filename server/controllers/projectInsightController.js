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
| Create Insight
|--------------------------------------------------------------------------
*/

const createInsight = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { insight, sortOrder } = req.body;

        const userId = getAuthenticatedUserId(req);
        const numericProjectId = Number(projectId);

        if (!insight || !insight.trim()) {
            return res.status(400).json({
                message: "Insight is required",
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
                    "You are not authorized to add an insight to this project",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Create insight
        |--------------------------------------------------------------------------
        */

        const newInsight = await prisma.projectInsight.create({
            data: {
                insight: insight.trim(),
                sortOrder: sortOrder ?? 0,
                projectId: numericProjectId,
            },
        });

        return res.status(201).json(newInsight);
    } catch (error) {
        console.error("Error creating insight:", error);

        return res.status(500).json({
            message: "Failed to create insight",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Insights
|
| Public endpoint for now.
|
| PortfolioSlug-based filtering will be added when we update the
| public project APIs.
|--------------------------------------------------------------------------
*/

const getInsights = async (req, res) => {
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

        const insights = await prisma.projectInsight.findMany({
            where: {
                projectId: numericProjectId,
            },
            orderBy: {
                sortOrder: "asc",
            },
        });

        return res.status(200).json(insights);
    } catch (error) {
        console.error("Error fetching insights:", error);

        return res.status(500).json({
            message: "Failed to fetch insights",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Update Insight
|--------------------------------------------------------------------------
*/

const updateInsight = async (req, res) => {
    try {
        const { id } = req.params;
        const { insight, sortOrder } = req.body;

        const userId = getAuthenticatedUserId(req);
        const numericId = Number(id);

        if (!insight || !insight.trim()) {
            return res.status(400).json({
                message: "Insight is required",
            });
        }

        if (!Number.isInteger(numericId)) {
            return res.status(400).json({
                message: "Invalid insight ID",
            });
        }

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Find the insight together with its project
        |--------------------------------------------------------------------------
        */

        const existingInsight =
            await prisma.projectInsight.findUnique({
                where: {
                    id: numericId,
                },
                include: {
                    project: true,
                },
            });

        if (!existingInsight) {
            return res.status(404).json({
                message: "Insight not found",
            });
        }

        const project = existingInsight.project;

        /*
        |--------------------------------------------------------------------------
        | Verify parent project ownership
        |--------------------------------------------------------------------------
        */

        if (!project || project.userId !== userId) {
            return res.status(403).json({
                message:
                    "You are not authorized to update this insight",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Update insight
        |--------------------------------------------------------------------------
        */

        const updatedInsight =
            await prisma.projectInsight.update({
                where: {
                    id: numericId,
                },
                data: {
                    insight: insight.trim(),
                    sortOrder:
                        sortOrder ?? existingInsight.sortOrder,
                },
            });

        return res.status(200).json(updatedInsight);
    } catch (error) {
        console.error("Error updating insight:", error);

        return res.status(500).json({
            message: "Failed to update insight",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Delete Insight
|--------------------------------------------------------------------------
*/

const deleteInsight = async (req, res) => {
    try {
        const { id } = req.params;

        const userId = getAuthenticatedUserId(req);
        const numericId = Number(id);

        if (!Number.isInteger(numericId)) {
            return res.status(400).json({
                message: "Invalid insight ID",
            });
        }

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Find the insight together with its project
        |--------------------------------------------------------------------------
        */

        const existingInsight =
            await prisma.projectInsight.findUnique({
                where: {
                    id: numericId,
                },
                include: {
                    project: true,
                },
            });

        if (!existingInsight) {
            return res.status(404).json({
                message: "Insight not found",
            });
        }

        const project = existingInsight.project;

        /*
        |--------------------------------------------------------------------------
        | Verify parent project ownership
        |--------------------------------------------------------------------------
        */

        if (!project || project.userId !== userId) {
            return res.status(403).json({
                message:
                    "You are not authorized to delete this insight",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Delete insight
        |--------------------------------------------------------------------------
        */

        await prisma.projectInsight.delete({
            where: {
                id: numericId,
            },
        });

        return res.status(200).json({
            message: "Insight deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting insight:", error);

        return res.status(500).json({
            message: "Failed to delete insight",
        });
    }
};

module.exports = {
    createInsight,
    getInsights,
    updateInsight,
    deleteInsight,
};