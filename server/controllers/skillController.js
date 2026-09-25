const prisma = require("../prisma");

/*
=========================================================
HELPERS
=========================================================
*/

/*
---------------------------------------------------------
Get authenticated user ID
---------------------------------------------------------
*/

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

/*
---------------------------------------------------------
Get public portfolio user by portfolioSlug
---------------------------------------------------------

Public portfolio content must always be resolved
through the portfolio slug.

This prevents one user's skills from appearing
on another user's public portfolio.
---------------------------------------------------------
*/

const getPublicUserByPortfolioSlug = async (portfolioSlug) => {
    if (
        typeof portfolioSlug !== "string" ||
        !portfolioSlug.trim()
    ) {
        return null;
    }

    return prisma.user.findUnique({
        where: {
            portfolioSlug: portfolioSlug.trim(),
        },
        select: {
            id: true,
        },
    });
};

/*
=========================================================
CREATE SKILL
ADMIN ONLY
=========================================================
*/

const createSkill = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const {
            name,
            category,
            proficiency,
            sortOrder,
        } = req.body;

        /*
        -------------------------------------------------
        SKILL NAME VALIDATION
        -------------------------------------------------
        */

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                message: "Skill name is required",
            });
        }

        /*
        -------------------------------------------------
        PROFICIENCY VALIDATION
        -------------------------------------------------
        */

        let validatedProficiency = null;

        if (
            proficiency !== undefined &&
            proficiency !== null &&
            proficiency !== ""
        ) {
            validatedProficiency = Number(proficiency);

            if (
                Number.isNaN(validatedProficiency) ||
                validatedProficiency < 0 ||
                validatedProficiency > 100
            ) {
                return res.status(400).json({
                    message:
                        "Proficiency must be a number between 0 and 100",
                });
            }
        }

        /*
        -------------------------------------------------
        SORT ORDER VALIDATION
        -------------------------------------------------
        */

        let validatedSortOrder = 0;

        if (
            sortOrder !== undefined &&
            sortOrder !== null &&
            sortOrder !== ""
        ) {
            validatedSortOrder = Number(sortOrder);

            if (
                Number.isNaN(validatedSortOrder) ||
                validatedSortOrder < 0
            ) {
                return res.status(400).json({
                    message:
                        "Sort order must be a non-negative number",
                });
            }
        }

        /*
        -------------------------------------------------
        CREATE SKILL
        -------------------------------------------------
        */

        const skill = await prisma.skill.create({
            data: {
                userId,
                name: name.trim(),
                category:
                    typeof category === "string" &&
                    category.trim()
                        ? category.trim()
                        : null,
                proficiency: validatedProficiency,
                sortOrder: validatedSortOrder,
            },
        });

        return res.status(201).json({
            message: "Skill created successfully",
            skill,
        });
    } catch (error) {
        console.error(
            "Error creating skill:",
            error
        );

        return res.status(500).json({
            message: "Failed to create skill",
        });
    }
};

/*
=========================================================
GET MY SKILLS
ADMIN ONLY
=========================================================
*/

const getMySkills = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const skills = await prisma.skill.findMany({
            where: {
                userId,
            },
            orderBy: [
                {
                    sortOrder: "asc",
                },
                {
                    name: "asc",
                },
            ],
        });

        return res.status(200).json(skills);
    } catch (error) {
        console.error(
            "Error fetching authenticated user's skills:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch skills",
        });
    }
};

/*
=========================================================
GET PUBLIC SKILLS
=========================================================

PUBLIC ENDPOINT

Expected request:

GET /api/skills?portfolioSlug=user-one

IMPORTANT:
Never return all skills here.

The portfolioSlug determines which user's skills
are allowed to be returned.
=========================================================
*/

const getSkills = async (req, res) => {
    try {
        /*
        -------------------------------------------------
        GET PORTFOLIO SLUG FROM QUERY STRING
        -------------------------------------------------
        */

        const portfolioSlug =
            typeof req.query.portfolioSlug === "string"
                ? req.query.portfolioSlug.trim()
                : "";

        /*
        -------------------------------------------------
        REQUIRE PORTFOLIO SLUG
        -------------------------------------------------
        */

        if (!portfolioSlug) {
            return res.status(400).json({
                message: "Portfolio slug is required",
            });
        }

        /*
        -------------------------------------------------
        FIND PORTFOLIO OWNER
        -------------------------------------------------
        */

        const user =
            await getPublicUserByPortfolioSlug(
                portfolioSlug
            );

        if (!user) {
            return res.status(404).json({
                message: "Portfolio not found",
            });
        }

        /*
        -------------------------------------------------
        GET ONLY THAT USER'S SKILLS
        -------------------------------------------------
        */

        const skills = await prisma.skill.findMany({
            where: {
                userId: user.id,
            },
            orderBy: [
                {
                    sortOrder: "asc",
                },
                {
                    name: "asc",
                },
            ],
        });

        return res.status(200).json(skills);
    } catch (error) {
        console.error(
            "Error fetching public skills:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch skills",
        });
    }
};

/*
=========================================================
UPDATE SKILL
ADMIN ONLY
=========================================================
*/

const updateSkill = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const { id } = req.params;
        const numericId = Number(id);

        /*
        -------------------------------------------------
        ID VALIDATION
        -------------------------------------------------
        */

        if (
            !Number.isInteger(numericId) ||
            numericId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid skill ID",
            });
        }

        const {
            name,
            category,
            proficiency,
            sortOrder,
        } = req.body;

        /*
        -------------------------------------------------
        FIND EXISTING SKILL
        -------------------------------------------------
        */

        const existingSkill =
            await prisma.skill.findUnique({
                where: {
                    id: numericId,
                },
            });

        if (!existingSkill) {
            return res.status(404).json({
                message: "Skill not found",
            });
        }

        /*
        -------------------------------------------------
        OWNERSHIP CHECK
        -------------------------------------------------

        A skill can only be updated by the user
        who owns it.
        -------------------------------------------------
        */

        if (existingSkill.userId !== userId) {
            return res.status(403).json({
                message:
                    "You are not authorized to update this skill",
            });
        }

        /*
        -------------------------------------------------
        SKILL NAME VALIDATION
        -------------------------------------------------
        */

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                message: "Skill name is required",
            });
        }

        /*
        -------------------------------------------------
        PROFICIENCY VALIDATION
        -------------------------------------------------
        */

        let validatedProficiency = null;

        if (
            proficiency !== undefined &&
            proficiency !== null &&
            proficiency !== ""
        ) {
            validatedProficiency = Number(proficiency);

            if (
                Number.isNaN(validatedProficiency) ||
                validatedProficiency < 0 ||
                validatedProficiency > 100
            ) {
                return res.status(400).json({
                    message:
                        "Proficiency must be a number between 0 and 100",
                });
            }
        }

        /*
        -------------------------------------------------
        SORT ORDER VALIDATION
        -------------------------------------------------
        */

        let validatedSortOrder = 0;

        if (
            sortOrder !== undefined &&
            sortOrder !== null &&
            sortOrder !== ""
        ) {
            validatedSortOrder = Number(sortOrder);

            if (
                Number.isNaN(validatedSortOrder) ||
                validatedSortOrder < 0
            ) {
                return res.status(400).json({
                    message:
                        "Sort order must be a non-negative number",
                });
            }
        }

        /*
        -------------------------------------------------
        UPDATE SKILL
        -------------------------------------------------
        */

        const updatedSkill =
            await prisma.skill.update({
                where: {
                    id: numericId,
                },
                data: {
                    name: name.trim(),
                    category:
                        typeof category === "string" &&
                        category.trim()
                            ? category.trim()
                            : null,
                    proficiency:
                        validatedProficiency,
                    sortOrder:
                        validatedSortOrder,
                },
            });

        return res.status(200).json({
            message:
                "Skill updated successfully",
            skill: updatedSkill,
        });
    } catch (error) {
        console.error(
            "Error updating skill:",
            error
        );

        return res.status(500).json({
            message: "Failed to update skill",
        });
    }
};

/*
=========================================================
DELETE SKILL
ADMIN ONLY
=========================================================
*/

const deleteSkill = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const { id } = req.params;
        const numericId = Number(id);

        /*
        -------------------------------------------------
        ID VALIDATION
        -------------------------------------------------
        */

        if (
            !Number.isInteger(numericId) ||
            numericId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid skill ID",
            });
        }

        /*
        -------------------------------------------------
        FIND EXISTING SKILL
        -------------------------------------------------
        */

        const existingSkill =
            await prisma.skill.findUnique({
                where: {
                    id: numericId,
                },
            });

        if (!existingSkill) {
            return res.status(404).json({
                message: "Skill not found",
            });
        }

        /*
        -------------------------------------------------
        OWNERSHIP CHECK
        -------------------------------------------------
        */

        if (existingSkill.userId !== userId) {
            return res.status(403).json({
                message:
                    "You are not authorized to delete this skill",
            });
        }

        /*
        -------------------------------------------------
        DELETE SKILL
        -------------------------------------------------
        */

        await prisma.skill.delete({
            where: {
                id: numericId,
            },
        });

        return res.status(200).json({
            message: "Skill deleted successfully",
        });
    } catch (error) {
        console.error(
            "Error deleting skill:",
            error
        );

        return res.status(500).json({
            message: "Failed to delete skill",
        });
    }
};

/*
=========================================================
EXPORTS
=========================================================
*/

module.exports = {
    createSkill,
    getMySkills,
    getSkills,
    updateSkill,
    deleteSkill,
};