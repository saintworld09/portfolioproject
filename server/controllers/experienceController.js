const prisma = require("../prisma");

// ========================================
// HELPER — GET AUTHENTICATED USER ID
// ========================================

const getAuthenticatedUserId = (req) => {
    const userId = Number(req.user?.userId);

    if (
        !req.user ||
        !Number.isInteger(userId) ||
        userId <= 0
    ) {
        return null;
    }

    return userId;
};

// ========================================
// HELPER — GET PORTFOLIO USER FROM SLUG
// ========================================

const getUserByPortfolioSlug = async (portfolioSlug) => {
    if (
        !portfolioSlug ||
        typeof portfolioSlug !== "string"
    ) {
        return null;
    }

    const normalizedSlug =
        portfolioSlug.trim().toLowerCase();

    if (!normalizedSlug) {
        return null;
    }

    return await prisma.user.findUnique({
        where: {
            portfolioSlug: normalizedSlug,
        },
        select: {
            id: true,
            name: true,
            portfolioSlug: true,
        },
    });
};

// ========================================
// CREATE EXPERIENCE
// ========================================

const createExperience = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const {
            jobTitle,
            company,
            location,
            description,
            startDate,
            endDate,
            isCurrent,
        } = req.body;

        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

        if (!jobTitle || !company || !startDate) {
            return res.status(400).json({
                message:
                    "Job title, company, and start date are required",
            });
        }

        // ----------------------------------------
        // CREATE EXPERIENCE
        // ----------------------------------------

        const experience =
            await prisma.experience.create({
                data: {
                    userId,
                    jobTitle,
                    company,
                    location: location || null,
                    description: description || null,
                    startDate: new Date(startDate),
                    endDate: endDate
                        ? new Date(endDate)
                        : null,
                    isCurrent:
                        isCurrent === true ||
                        isCurrent === "true",
                },
            });

        return res.status(201).json({
            message:
                "Experience created successfully",
            experience,
        });
    } catch (error) {
        console.error(
            "Error creating experience:",
            error
        );

        return res.status(500).json({
            message: "Failed to create experience",
        });
    }
};

// ========================================
// GET MY EXPERIENCES
// ========================================
// Protected admin endpoint.
//
// Returns ONLY experiences belonging to
// the currently authenticated admin.
// ========================================

const getMyExperiences = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const experiences =
            await prisma.experience.findMany({
                where: {
                    userId,
                },
                orderBy: [
                    {
                        isCurrent: "desc",
                    },
                    {
                        startDate: "desc",
                    },
                ],
            });

        return res.status(200).json(experiences);
    } catch (error) {
        console.error(
            "Error fetching authenticated user's experiences:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch experiences",
        });
    }
};

// ========================================
// GET PUBLIC EXPERIENCES
// ========================================
//
// Public:
// GET /api/experiences?portfolioSlug=babatunde
//
// Public:
// GET /api/experiences?portfolioSlug=babatunde-adekola
//
// IMPORTANT:
// Only experiences belonging to the user
// represented by the portfolioSlug are returned.
// ========================================

const getExperiences = async (req, res) => {
    try {
        const { portfolioSlug } = req.query;

        // ----------------------------------------
        // VALIDATE PORTFOLIO SLUG
        // ----------------------------------------

        if (
            !portfolioSlug ||
            typeof portfolioSlug !== "string"
        ) {
            return res.status(400).json({
                message:
                    "Portfolio slug is required",
            });
        }

        // ----------------------------------------
        // FIND PORTFOLIO USER
        // ----------------------------------------

        const portfolioUser =
            await getUserByPortfolioSlug(
                portfolioSlug
            );

        if (!portfolioUser) {
            return res.status(404).json({
                message:
                    "Portfolio not found",
            });
        }

        // ----------------------------------------
        // GET ONLY THAT USER'S EXPERIENCES
        // ----------------------------------------

        const experiences =
            await prisma.experience.findMany({
                where: {
                    userId: portfolioUser.id,
                },
                orderBy: [
                    {
                        isCurrent: "desc",
                    },
                    {
                        startDate: "desc",
                    },
                ],
            });

        return res.status(200).json(experiences);
    } catch (error) {
        console.error(
            "Error fetching public experiences:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch experiences",
        });
    }
};

// ========================================
// UPDATE EXPERIENCE
// ========================================

const updateExperience = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const experienceId = Number(req.params.id);

        if (
            !Number.isInteger(experienceId) ||
            experienceId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid experience ID",
            });
        }

        const {
            jobTitle,
            company,
            location,
            description,
            startDate,
            endDate,
            isCurrent,
        } = req.body;

        // ----------------------------------------
        // FIND EXPERIENCE
        // ----------------------------------------

        const existingExperience =
            await prisma.experience.findUnique({
                where: {
                    id: experienceId,
                },
            });

        if (!existingExperience) {
            return res.status(404).json({
                message: "Experience not found",
            });
        }

        // ----------------------------------------
        // CHECK OWNERSHIP
        // ----------------------------------------

        if (
            existingExperience.userId !== userId
        ) {
            return res.status(403).json({
                message:
                    "You do not have permission to update this experience",
            });
        }

        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

        if (!jobTitle || !company || !startDate) {
            return res.status(400).json({
                message:
                    "Job title, company, and start date are required",
            });
        }

        // ----------------------------------------
        // UPDATE EXPERIENCE
        // ----------------------------------------

        const updatedExperience =
            await prisma.experience.update({
                where: {
                    id: experienceId,
                },
                data: {
                    jobTitle,
                    company,
                    location: location || null,
                    description:
                        description || null,
                    startDate: new Date(startDate),
                    endDate: endDate
                        ? new Date(endDate)
                        : null,
                    isCurrent:
                        isCurrent === true ||
                        isCurrent === "true",
                },
            });

        return res.status(200).json({
            message:
                "Experience updated successfully",
            experience: updatedExperience,
        });
    } catch (error) {
        console.error(
            "Error updating experience:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to update experience",
        });
    }
};

// ========================================
// DELETE EXPERIENCE
// ========================================

const deleteExperience = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const experienceId = Number(req.params.id);

        if (
            !Number.isInteger(experienceId) ||
            experienceId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid experience ID",
            });
        }

        // ----------------------------------------
        // FIND EXPERIENCE
        // ----------------------------------------

        const existingExperience =
            await prisma.experience.findUnique({
                where: {
                    id: experienceId,
                },
            });

        if (!existingExperience) {
            return res.status(404).json({
                message: "Experience not found",
            });
        }

        // ----------------------------------------
        // CHECK OWNERSHIP
        // ----------------------------------------

        if (
            existingExperience.userId !== userId
        ) {
            return res.status(403).json({
                message:
                    "You do not have permission to delete this experience",
            });
        }

        // ----------------------------------------
        // DELETE EXPERIENCE
        // ----------------------------------------

        await prisma.experience.delete({
            where: {
                id: experienceId,
            },
        });

        return res.status(200).json({
            message:
                "Experience deleted successfully",
        });
    } catch (error) {
        console.error(
            "Error deleting experience:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete experience",
        });
    }
};

module.exports = {
    createExperience,
    getMyExperiences,
    getExperiences,
    updateExperience,
    deleteExperience,
};