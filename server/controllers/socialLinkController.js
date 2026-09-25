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
Get public portfolio user
---------------------------------------------------------

The public portfolio is identified by portfolioSlug.

This helper returns ONLY the user ID so that all
public social-link queries can be restricted to
that specific portfolio owner.
---------------------------------------------------------
*/

const getPublicUserByPortfolioSlug = async (
    portfolioSlug
) => {
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
CREATE SOCIAL LINK
ADMIN ONLY
=========================================================
*/

const createSocialLink = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const {
            platform,
            url,
            icon,
            sortOrder,
        } = req.body;

        /*
        -------------------------------------------------
        VALIDATION
        -------------------------------------------------
        */

        if (
            typeof platform !== "string" ||
            !platform.trim() ||
            typeof url !== "string" ||
            !url.trim()
        ) {
            return res.status(400).json({
                message:
                    "Platform and URL are required",
            });
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
        CREATE SOCIAL LINK
        -------------------------------------------------
        */

        const socialLink =
            await prisma.socialLink.create({
                data: {
                    userId,

                    platform:
                        platform.trim(),

                    url:
                        url.trim(),

                    icon:
                        typeof icon === "string" &&
                        icon.trim()
                            ? icon.trim()
                            : null,

                    sortOrder:
                        validatedSortOrder,
                },
            });

        return res.status(201).json({
            message:
                "Social link created successfully",
            socialLink,
        });
    } catch (error) {
        console.error(
            "Error creating social link:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to create social link",
        });
    }
};

/*
=========================================================
GET MY SOCIAL LINKS
ADMIN ONLY
=========================================================
*/

const getMySocialLinks = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const socialLinks =
            await prisma.socialLink.findMany({
                where: {
                    userId,
                },

                orderBy: [
                    {
                        sortOrder: "asc",
                    },
                    {
                        id: "asc",
                    },
                ],
            });

        return res.status(200).json(
            socialLinks
        );
    } catch (error) {
        console.error(
            "Error fetching authenticated user's social links:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch social links",
        });
    }
};

/*
=========================================================
GET SOCIAL LINKS FOR PUBLIC PORTFOLIO
PUBLIC
=========================================================

Expected request:

GET /api/social-links?portfolioSlug=user-one

The portfolioSlug determines which user's social
links are returned.

IMPORTANT:
Never use an unrestricted findMany() here.
=========================================================
*/

const getSocialLinks = async (req, res) => {
    try {
        /*
        -------------------------------------------------
        GET PORTFOLIO SLUG
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
            await getPublicUserByPortfolioSlug(
                portfolioSlug
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "Portfolio not found",
            });
        }

        /*
        -------------------------------------------------
        GET ONLY THIS USER'S SOCIAL LINKS
        -------------------------------------------------
        */

        const socialLinks =
            await prisma.socialLink.findMany({
                where: {
                    userId: user.id,
                },

                orderBy: [
                    {
                        sortOrder: "asc",
                    },
                    {
                        id: "asc",
                    },
                ],
            });

        return res.status(200).json(
            socialLinks
        );
    } catch (error) {
        console.error(
            "Error fetching public social links:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch social links",
        });
    }
};

/*
=========================================================
UPDATE SOCIAL LINK
ADMIN ONLY
=========================================================
*/

const updateSocialLink = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const { id } = req.params;

        const socialLinkId = Number(id);

        /*
        -------------------------------------------------
        VALIDATE ID
        -------------------------------------------------
        */

        if (
            !Number.isInteger(socialLinkId) ||
            socialLinkId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Invalid social link ID",
            });
        }

        const {
            platform,
            url,
            icon,
            sortOrder,
        } = req.body;

        /*
        -------------------------------------------------
        FIND SOCIAL LINK
        -------------------------------------------------
        */

        const existingSocialLink =
            await prisma.socialLink.findUnique({
                where: {
                    id: socialLinkId,
                },
            });

        if (!existingSocialLink) {
            return res.status(404).json({
                message:
                    "Social link not found",
            });
        }

        /*
        -------------------------------------------------
        OWNERSHIP CHECK
        -------------------------------------------------
        */

        if (
            existingSocialLink.userId !== userId
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to update this social link",
            });
        }

        /*
        -------------------------------------------------
        VALIDATION
        -------------------------------------------------
        */

        if (
            typeof platform !== "string" ||
            !platform.trim() ||
            typeof url !== "string" ||
            !url.trim()
        ) {
            return res.status(400).json({
                message:
                    "Platform and URL are required",
            });
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
        UPDATE SOCIAL LINK
        -------------------------------------------------
        */

        const updatedSocialLink =
            await prisma.socialLink.update({
                where: {
                    id: socialLinkId,
                },

                data: {
                    platform:
                        platform.trim(),

                    url:
                        url.trim(),

                    icon:
                        typeof icon === "string" &&
                        icon.trim()
                            ? icon.trim()
                            : null,

                    sortOrder:
                        validatedSortOrder,
                },
            });

        return res.status(200).json({
            message:
                "Social link updated successfully",

            socialLink:
                updatedSocialLink,
        });
    } catch (error) {
        console.error(
            "Error updating social link:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to update social link",
        });
    }
};

/*
=========================================================
DELETE SOCIAL LINK
ADMIN ONLY
=========================================================
*/

const deleteSocialLink = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const { id } = req.params;

        const socialLinkId = Number(id);

        /*
        -------------------------------------------------
        VALIDATE ID
        -------------------------------------------------
        */

        if (
            !Number.isInteger(socialLinkId) ||
            socialLinkId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Invalid social link ID",
            });
        }

        /*
        -------------------------------------------------
        FIND SOCIAL LINK
        -------------------------------------------------
        */

        const existingSocialLink =
            await prisma.socialLink.findUnique({
                where: {
                    id: socialLinkId,
                },
            });

        if (!existingSocialLink) {
            return res.status(404).json({
                message:
                    "Social link not found",
            });
        }

        /*
        -------------------------------------------------
        OWNERSHIP CHECK
        -------------------------------------------------
        */

        if (
            existingSocialLink.userId !== userId
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to delete this social link",
            });
        }

        /*
        -------------------------------------------------
        DELETE SOCIAL LINK
        -------------------------------------------------
        */

        await prisma.socialLink.delete({
            where: {
                id: socialLinkId,
            },
        });

        return res.status(200).json({
            message:
                "Social link deleted successfully",
        });
    } catch (error) {
        console.error(
            "Error deleting social link:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete social link",
        });
    }
};

/*
=========================================================
EXPORTS
=========================================================
*/

module.exports = {
    createSocialLink,
    getMySocialLinks,
    getSocialLinks,
    updateSocialLink,
    deleteSocialLink,
};