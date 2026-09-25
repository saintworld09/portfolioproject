const prisma = require("../prisma");

const fs = require("fs");
const path = require("path");

// ========================================
// AUTHENTICATED USER HELPER
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
// BOOLEAN HELPER
// ========================================

const parseBoolean = (value, fallback = true) => {
    if (value === undefined || value === null) {
        return fallback;
    }

    if (typeof value === "boolean") {
        return value;
    }

    return value === "true";
};

// ========================================
// ABOUT IMAGE HELPERS
// ========================================

const getAboutImageUrl = (file) => {
    if (!file) {
        return null;
    }

    return `/uploads/about/${file.filename}`;
};

const deleteAboutImage = (imageUrl) => {
    if (!imageUrl) {
        return;
    }

    const fileName = path.basename(imageUrl);

    const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "about",
        fileName
    );

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(
            "Error deleting About image:",
            error
        );
    }
};

const deleteUploadedFileIfExists = (file) => {
    if (!file) {
        return;
    }

    deleteAboutImage(
        getAboutImageUrl(file)
    );
};

// ========================================
// GET PUBLIC ABOUT CONTENT
// PUBLIC
// ========================================
//
// Expected:
// GET /api/about?portfolioSlug=:portfolioSlug
//
// The portfolioSlug identifies which user's
// public portfolio should be displayed.
//
// ========================================

const getAboutContent = async (req, res) => {
    try {
        const portfolioSlug =
            typeof req.query.portfolioSlug === "string"
                ? req.query.portfolioSlug.trim()
                : "";

        /*
        -------------------------------------------------
        PORTFOLIO SLUG VALIDATION
        -------------------------------------------------
        */

        if (!portfolioSlug) {
            return res.status(400).json({
                message:
                    "Portfolio slug is required",
            });
        }

        /*
        -------------------------------------------------
        FIND PORTFOLIO OWNER
        -------------------------------------------------
        */

        const user =
            await prisma.user.findUnique({
                where: {
                    portfolioSlug,
                },
                select: {
                    id: true,
                },
            });

        if (!user) {
            return res.status(404).json({
                message:
                    "Portfolio not found",
            });
        }

        /*
        -------------------------------------------------
        GET ONLY THIS USER'S ACTIVE ABOUT CONTENT
        -------------------------------------------------
        */

        const [
            process,
            skills,
            focus,
        ] = await Promise.all([
            prisma.aboutProcess.findMany({
                where: {
                    userId: user.id,
                    isActive: true,
                },

                orderBy: [
                    {
                        sortOrder: "asc",
                    },
                    {
                        stepNumber: "asc",
                    },
                ],
            }),

            prisma.aboutSkill.findMany({
                where: {
                    userId: user.id,
                    isActive: true,
                },

                orderBy: {
                    sortOrder: "asc",
                },
            }),

            prisma.aboutFocus.findMany({
                where: {
                    userId: user.id,
                    isActive: true,
                },

                orderBy: {
                    sortOrder: "asc",
                },
            }),
        ]);

        /*
        -------------------------------------------------
        RETURN PUBLIC ABOUT CONTENT
        -------------------------------------------------
        */

        return res.status(200).json({
            process,
            skills,
            focus,
        });
    } catch (error) {
        console.error(
            "Error fetching public About content:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch About content",
        });
    }
};

// ========================================
// ABOUT PROCESS
// ========================================

// ========================================
// GET ABOUT PROCESS
// ADMIN
// ========================================

const getAboutProcess = async (req, res) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const process =
            await prisma.aboutProcess.findMany({
                where: {
                    userId,
                },
                orderBy: [
                    {
                        sortOrder: "asc",
                    },
                    {
                        stepNumber: "asc",
                    },
                ],
            });

        return res.status(200).json(process);
    } catch (error) {
        console.error(
            "Error fetching About process:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch About process",
        });
    }
};

// ========================================
// CREATE ABOUT PROCESS
// ADMIN ONLY
// ========================================

const createAboutProcess = async (
    req,
    res
) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(401).json({
                message:
                    "Invalid authenticated user",
            });
        }

        const {
            stepNumber,
            title,
            description,
            sortOrder,
            isActive,
        } = req.body;

        if (
            stepNumber === undefined ||
            !title ||
            !description
        ) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(400).json({
                message:
                    "Step number, title, and description are required",
            });
        }

        const icon =
            getAboutImageUrl(req.file);

        const process =
            await prisma.aboutProcess.create({
                data: {
                    userId,

                    stepNumber:
                        Number(stepNumber),

                    title,

                    description,

                    icon,

                    sortOrder:
                        sortOrder !== undefined
                            ? Number(sortOrder)
                            : 0,

                    isActive:
                        parseBoolean(
                            isActive,
                            true
                        ),
                },
            });

        return res.status(201).json({
            message:
                "About process item created successfully",

            process,
        });
    } catch (error) {
        console.error(
            "Error creating About process item:",
            error
        );

        deleteUploadedFileIfExists(
            req.file
        );

        return res.status(500).json({
            message:
                "Failed to create About process item",
        });
    }
};

// ========================================
// UPDATE ABOUT PROCESS
// ADMIN ONLY
// ========================================

const updateAboutProcess = async (
    req,
    res
) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(401).json({
                message:
                    "Invalid authenticated user",
            });
        }

        const id = Number(
            req.params.id
        );

        if (!Number.isInteger(id) || id <= 0) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(400).json({
                message:
                    "Invalid About process item ID",
            });
        }

        const existingProcess =
            await prisma.aboutProcess.findUnique({
                where: {
                    id,
                },
            });

        if (!existingProcess) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(404).json({
                message:
                    "About process item not found",
            });
        }

        if (
            existingProcess.userId !== userId
        ) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(403).json({
                message:
                    "You are not authorized to update this About process item",
            });
        }

        const {
            stepNumber,
            title,
            description,
            sortOrder,
            isActive,
        } = req.body;

        if (
            stepNumber === undefined ||
            !title ||
            !description
        ) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(400).json({
                message:
                    "Step number, title, and description are required",
            });
        }

        const newIcon = req.file
            ? getAboutImageUrl(req.file)
            : existingProcess.icon;

        const process =
            await prisma.aboutProcess.update({
                where: {
                    id,
                },

                data: {
                    stepNumber:
                        Number(stepNumber),

                    title,

                    description,

                    icon: newIcon,

                    sortOrder:
                        sortOrder !== undefined
                            ? Number(sortOrder)
                            : existingProcess.sortOrder,

                    isActive:
                        isActive !== undefined
                            ? parseBoolean(
                                  isActive,
                                  existingProcess.isActive
                              )
                            : existingProcess.isActive,
                },
            });

        if (
            req.file &&
            existingProcess.icon
        ) {
            deleteAboutImage(
                existingProcess.icon
            );
        }

        return res.status(200).json({
            message:
                "About process item updated successfully",

            process,
        });
    } catch (error) {
        console.error(
            "Error updating About process item:",
            error
        );

        deleteUploadedFileIfExists(
            req.file
        );

        return res.status(500).json({
            message:
                "Failed to update About process item",
        });
    }
};

// ========================================
// DELETE ABOUT PROCESS
// ADMIN ONLY
// ========================================

const deleteAboutProcess = async (
    req,
    res
) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Invalid authenticated user",
            });
        }

        const id = Number(
            req.params.id
        );

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message:
                    "Invalid About process item ID",
            });
        }

        const existingProcess =
            await prisma.aboutProcess.findUnique({
                where: {
                    id,
                },
            });

        if (!existingProcess) {
            return res.status(404).json({
                message:
                    "About process item not found",
            });
        }

        if (
            existingProcess.userId !== userId
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to delete this About process item",
            });
        }

        await prisma.aboutProcess.delete({
            where: {
                id,
            },
        });

        if (existingProcess.icon) {
            deleteAboutImage(
                existingProcess.icon
            );
        }

        return res.status(200).json({
            message:
                "About process item deleted successfully",
        });
    } catch (error) {
        console.error(
            "Error deleting About process item:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete About process item",
        });
    }
};

// ========================================
// ABOUT SKILLS
// ========================================

// ========================================
// GET ABOUT SKILLS
// ADMIN
// ========================================

const getAboutSkills = async (req, res) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const skills =
            await prisma.aboutSkill.findMany({
                where: {
                    userId,
                },
                orderBy: {
                    sortOrder: "asc",
                },
            });

        return res.status(200).json(skills);
    } catch (error) {
        console.error(
            "Error fetching About skills:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch About skills",
        });
    }
};

// ========================================
// CREATE ABOUT SKILL
// ADMIN ONLY
// ========================================

const createAboutSkill = async (
    req,
    res
) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(401).json({
                message:
                    "Invalid authenticated user",
            });
        }

        const {
            title,
            description,
            sortOrder,
            isActive,
        } = req.body;

        if (!title || !description) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(400).json({
                message:
                    "Title and description are required",
            });
        }

        const icon =
            getAboutImageUrl(req.file);

        const skill =
            await prisma.aboutSkill.create({
                data: {
                    userId,

                    title,

                    description,

                    icon,

                    sortOrder:
                        sortOrder !== undefined
                            ? Number(sortOrder)
                            : 0,

                    isActive:
                        parseBoolean(
                            isActive,
                            true
                        ),
                },
            });

        return res.status(201).json({
            message:
                "About skill created successfully",

            skill,
        });
    } catch (error) {
        console.error(
            "Error creating About skill:",
            error
        );

        deleteUploadedFileIfExists(
            req.file
        );

        return res.status(500).json({
            message:
                "Failed to create About skill",
        });
    }
};

// ========================================
// UPDATE ABOUT SKILL
// ADMIN ONLY
// ========================================

const updateAboutSkill = async (
    req,
    res
) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(401).json({
                message:
                    "Invalid authenticated user",
            });
        }

        const id = Number(
            req.params.id
        );

        if (!Number.isInteger(id) || id <= 0) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(400).json({
                message:
                    "Invalid About skill ID",
            });
        }

        const existingSkill =
            await prisma.aboutSkill.findUnique({
                where: {
                    id,
                },
            });

        if (!existingSkill) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(404).json({
                message:
                    "About skill not found",
            });
        }

        if (
            existingSkill.userId !== userId
        ) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(403).json({
                message:
                    "You are not authorized to update this About skill",
            });
        }

        const {
            title,
            description,
            sortOrder,
            isActive,
        } = req.body;

        if (!title || !description) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(400).json({
                message:
                    "Title and description are required",
            });
        }

        const newIcon = req.file
            ? getAboutImageUrl(req.file)
            : existingSkill.icon;

        const skill =
            await prisma.aboutSkill.update({
                where: {
                    id,
                },

                data: {
                    title,

                    description,

                    icon: newIcon,

                    sortOrder:
                        sortOrder !== undefined
                            ? Number(sortOrder)
                            : existingSkill.sortOrder,

                    isActive:
                        isActive !== undefined
                            ? parseBoolean(
                                  isActive,
                                  existingSkill.isActive
                              )
                            : existingSkill.isActive,
                },
            });

        if (
            req.file &&
            existingSkill.icon
        ) {
            deleteAboutImage(
                existingSkill.icon
            );
        }

        return res.status(200).json({
            message:
                "About skill updated successfully",

            skill,
        });
    } catch (error) {
        console.error(
            "Error updating About skill:",
            error
        );

        deleteUploadedFileIfExists(
            req.file
        );

        return res.status(500).json({
            message:
                "Failed to update About skill",
        });
    }
};

// ========================================
// DELETE ABOUT SKILL
// ADMIN ONLY
// ========================================

const deleteAboutSkill = async (
    req,
    res
) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Invalid authenticated user",
            });
        }

        const id = Number(
            req.params.id
        );

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message:
                    "Invalid About skill ID",
            });
        }

        const existingSkill =
            await prisma.aboutSkill.findUnique({
                where: {
                    id,
                },
            });

        if (!existingSkill) {
            return res.status(404).json({
                message:
                    "About skill not found",
            });
        }

        if (
            existingSkill.userId !== userId
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to delete this About skill",
            });
        }

        await prisma.aboutSkill.delete({
            where: {
                id,
            },
        });

        if (existingSkill.icon) {
            deleteAboutImage(
                existingSkill.icon
            );
        }

        return res.status(200).json({
            message:
                "About skill deleted successfully",
        });
    } catch (error) {
        console.error(
            "Error deleting About skill:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete About skill",
        });
    }
};

// ========================================
// ABOUT FOCUS
// ========================================

// ========================================
// GET ABOUT FOCUS
// ADMIN
// ========================================

const getAboutFocus = async (req, res) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const focus =
            await prisma.aboutFocus.findMany({
                where: {
                    userId,
                },
                orderBy: {
                    sortOrder: "asc",
                },
            });

        return res.status(200).json(focus);
    } catch (error) {
        console.error(
            "Error fetching About focus:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch About focus",
        });
    }
};

// ========================================
// CREATE ABOUT FOCUS
// ADMIN ONLY
// ========================================

const createAboutFocus = async (
    req,
    res
) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(401).json({
                message:
                    "Invalid authenticated user",
            });
        }

        const {
            title,
            description,
            sortOrder,
            isActive,
        } = req.body;

        if (!title || !description) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(400).json({
                message:
                    "Title and description are required",
            });
        }

        const icon =
            getAboutImageUrl(req.file);

        const focus =
            await prisma.aboutFocus.create({
                data: {
                    userId,

                    title,

                    description,

                    icon,

                    sortOrder:
                        sortOrder !== undefined
                            ? Number(sortOrder)
                            : 0,

                    isActive:
                        parseBoolean(
                            isActive,
                            true
                        ),
                },
            });

        return res.status(201).json({
            message:
                "About focus item created successfully",

            focus,
        });
    } catch (error) {
        console.error(
            "Error creating About focus item:",
            error
        );

        deleteUploadedFileIfExists(
            req.file
        );

        return res.status(500).json({
            message:
                "Failed to create About focus item",
        });
    }
};

// ========================================
// UPDATE ABOUT FOCUS
// ADMIN ONLY
// ========================================

const updateAboutFocus = async (
    req,
    res
) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(401).json({
                message:
                    "Invalid authenticated user",
            });
        }

        const id = Number(
            req.params.id
        );

        if (!Number.isInteger(id) || id <= 0) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(400).json({
                message:
                    "Invalid About focus item ID",
            });
        }

        const existingFocus =
            await prisma.aboutFocus.findUnique({
                where: {
                    id,
                },
            });

        if (!existingFocus) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(404).json({
                message:
                    "About focus item not found",
            });
        }

        if (
            existingFocus.userId !== userId
        ) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(403).json({
                message:
                    "You are not authorized to update this About focus item",
            });
        }

        const {
            title,
            description,
            sortOrder,
            isActive,
        } = req.body;

        if (!title || !description) {
            deleteUploadedFileIfExists(
                req.file
            );

            return res.status(400).json({
                message:
                    "Title and description are required",
            });
        }

        const newIcon = req.file
            ? getAboutImageUrl(req.file)
            : existingFocus.icon;

        const focus =
            await prisma.aboutFocus.update({
                where: {
                    id,
                },

                data: {
                    title,

                    description,

                    icon: newIcon,

                    sortOrder:
                        sortOrder !== undefined
                            ? Number(sortOrder)
                            : existingFocus.sortOrder,

                    isActive:
                        isActive !== undefined
                            ? parseBoolean(
                                  isActive,
                                  existingFocus.isActive
                              )
                            : existingFocus.isActive,
                },
            });

        if (
            req.file &&
            existingFocus.icon
        ) {
            deleteAboutImage(
                existingFocus.icon
            );
        }

        return res.status(200).json({
            message:
                "About focus item updated successfully",

            focus,
        });
    } catch (error) {
        console.error(
            "Error updating About focus item:",
            error
        );

        deleteUploadedFileIfExists(
            req.file
        );

        return res.status(500).json({
            message:
                "Failed to update About focus item",
        });
    }
};

// ========================================
// DELETE ABOUT FOCUS
// ADMIN ONLY
// ========================================

const deleteAboutFocus = async (
    req,
    res
) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Invalid authenticated user",
            });
        }

        const id = Number(
            req.params.id
        );

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message:
                    "Invalid About focus item ID",
            });
        }

        const existingFocus =
            await prisma.aboutFocus.findUnique({
                where: {
                    id,
                },
            });

        if (!existingFocus) {
            return res.status(404).json({
                message:
                    "About focus item not found",
            });
        }

        if (
            existingFocus.userId !== userId
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to delete this About focus item",
            });
        }

        await prisma.aboutFocus.delete({
            where: {
                id,
            },
        });

        if (existingFocus.icon) {
            deleteAboutImage(
                existingFocus.icon
            );
        }

        return res.status(200).json({
            message:
                "About focus item deleted successfully",
        });
    } catch (error) {
        console.error(
            "Error deleting About focus item:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete About focus item",
        });
    }
};

// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
    getAboutContent,

    getAboutProcess,
    createAboutProcess,
    updateAboutProcess,
    deleteAboutProcess,

    getAboutSkills,
    createAboutSkill,
    updateAboutSkill,
    deleteAboutSkill,

    getAboutFocus,
    createAboutFocus,
    updateAboutFocus,
    deleteAboutFocus,
};