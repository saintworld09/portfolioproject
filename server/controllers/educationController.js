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
// CREATE EDUCATION
// ========================================

const createEducation = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const {
            institution,
            degree,
            fieldOfStudy,
            description,
            startDate,
            endDate,
            isCurrent,
        } = req.body;

        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

        if (
            !institution ||
            !degree ||
            !startDate
        ) {
            return res.status(400).json({
                message:
                    "Institution, degree, and start date are required",
            });
        }

        // ----------------------------------------
        // CREATE EDUCATION
        // ----------------------------------------

        const education =
            await prisma.education.create({
                data: {
                    userId,
                    institution,
                    degree,
                    fieldOfStudy:
                        fieldOfStudy || null,
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

        return res.status(201).json({
            message:
                "Education created successfully",
            education,
        });
    } catch (error) {
        console.error(
            "Error creating education:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to create education",
        });
    }
};

// ========================================
// GET MY EDUCATION
// ========================================
// Protected admin endpoint.
//
// Returns ONLY education records belonging
// to the currently authenticated admin.
// ========================================

const getMyEducations = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const educations =
            await prisma.education.findMany({
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

        return res.status(200).json(educations);
    } catch (error) {
        console.error(
            "Error fetching authenticated user's education:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch education",
        });
    }
};

// ========================================
// GET PUBLIC EDUCATION
// ========================================
//
// Public:
// GET /api/education?portfolioSlug=babatunde
//
// Public:
// GET /api/education?portfolioSlug=babatunde-adekola
//
// IMPORTANT:
// Only education belonging to the user
// represented by the portfolioSlug is returned.
// ========================================

const getEducations = async (req, res) => {
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
        // GET ONLY THAT USER'S EDUCATION
        // ----------------------------------------

        const educations =
            await prisma.education.findMany({
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

        return res.status(200).json(educations);
    } catch (error) {
        console.error(
            "Error fetching public education:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch education",
        });
    }
};

// ========================================
// UPDATE EDUCATION
// ========================================

const updateEducation = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const educationId = Number(req.params.id);

        if (
            !Number.isInteger(educationId) ||
            educationId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid education ID",
            });
        }

        const {
            institution,
            degree,
            fieldOfStudy,
            description,
            startDate,
            endDate,
            isCurrent,
        } = req.body;

        // ----------------------------------------
        // FIND EDUCATION
        // ----------------------------------------

        const existingEducation =
            await prisma.education.findUnique({
                where: {
                    id: educationId,
                },
            });

        if (!existingEducation) {
            return res.status(404).json({
                message: "Education not found",
            });
        }

        // ----------------------------------------
        // CHECK OWNERSHIP
        // ----------------------------------------

        if (
            existingEducation.userId !== userId
        ) {
            return res.status(403).json({
                message:
                    "You do not have permission to update this education",
            });
        }

        // ----------------------------------------
        // VALIDATION
        // ----------------------------------------

        if (
            !institution ||
            !degree ||
            !startDate
        ) {
            return res.status(400).json({
                message:
                    "Institution, degree, and start date are required",
            });
        }

        // ----------------------------------------
        // UPDATE EDUCATION
        // ----------------------------------------

        const updatedEducation =
            await prisma.education.update({
                where: {
                    id: educationId,
                },
                data: {
                    institution,
                    degree,
                    fieldOfStudy:
                        fieldOfStudy || null,
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
                "Education updated successfully",
            education: updatedEducation,
        });
    } catch (error) {
        console.error(
            "Error updating education:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to update education",
        });
    }
};

// ========================================
// DELETE EDUCATION
// ========================================

const deleteEducation = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const educationId = Number(req.params.id);

        if (
            !Number.isInteger(educationId) ||
            educationId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid education ID",
            });
        }

        // ----------------------------------------
        // FIND EDUCATION
        // ----------------------------------------

        const existingEducation =
            await prisma.education.findUnique({
                where: {
                    id: educationId,
                },
            });

        if (!existingEducation) {
            return res.status(404).json({
                message: "Education not found",
            });
        }

        // ----------------------------------------
        // CHECK OWNERSHIP
        // ----------------------------------------

        if (
            existingEducation.userId !== userId
        ) {
            return res.status(403).json({
                message:
                    "You do not have permission to delete this education",
            });
        }

        // ----------------------------------------
        // DELETE EDUCATION
        // ----------------------------------------

        await prisma.education.delete({
            where: {
                id: educationId,
            },
        });

        return res.status(200).json({
            message:
                "Education deleted successfully",
        });
    } catch (error) {
        console.error(
            "Error deleting education:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete education",
        });
    }
};

module.exports = {
    createEducation,
    getMyEducations,
    getEducations,
    updateEducation,
    deleteEducation,
};