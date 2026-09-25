const prisma = require("../prisma");
const fs = require("fs");
const path = require("path");

/*
=========================================================
HELPERS
=========================================================
*/

/*
---------------------------------------------------------
GET AUTHENTICATED USER ID
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
GET PORTFOLIO USER FROM SLUG
---------------------------------------------------------
*/

const getUserByPortfolioSlug = async (
    portfolioSlug
) => {
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


/*
---------------------------------------------------------
DELETE CERTIFICATE FILE FROM DATABASE URL
---------------------------------------------------------
*/

const deleteCertificateFile = (
    certificateUrl
) => {
    if (!certificateUrl) {
        return;
    }

    const filePath = path.join(
        __dirname,
        "..",
        certificateUrl
    );

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};


/*
---------------------------------------------------------
DELETE NEWLY UPLOADED FILE
---------------------------------------------------------
*/

const deleteUploadedFile = (
    filename
) => {
    if (!filename) {
        return;
    }

    const uploadedFilePath = path.join(
        __dirname,
        "..",
        "uploads",
        "certifications",
        filename
    );

    if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
    }
};


/*
=========================================================
CREATE CERTIFICATION
=========================================================
*/

const createCertification = async (
    req,
    res
) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            if (req.file) {
                deleteUploadedFile(
                    req.file.filename
                );
            }

            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const {
            name,
            issuingOrganization,
            issueDate,
            expirationDate,
            credentialId,
            credentialUrl,
            description,
            featured,
            sortOrder,
        } = req.body;

        /*
        -------------------------------------------------
        VALIDATION
        -------------------------------------------------
        */

        if (
            !name ||
            !issuingOrganization ||
            !issueDate
        ) {
            if (req.file) {
                deleteUploadedFile(
                    req.file.filename
                );
            }

            return res.status(400).json({
                message:
                    "Certification name, issuing organization, and issue date are required",
            });
        }

        /*
        -------------------------------------------------
        CERTIFICATE FILE
        -------------------------------------------------
        */

        const certificateUrl =
            req.file
                ? `/uploads/certifications/${req.file.filename}`
                : null;

        /*
        -------------------------------------------------
        CREATE
        -------------------------------------------------
        */

        const certification =
            await prisma.certification.create({
                data: {
                    userId,

                    name,

                    issuingOrganization,

                    issueDate:
                        new Date(issueDate),

                    expirationDate:
                        expirationDate
                            ? new Date(
                                  expirationDate
                              )
                            : null,

                    credentialId:
                        credentialId || null,

                    credentialUrl:
                        credentialUrl || null,

                    description:
                        description || null,

                    certificateUrl,

                    featured:
                        featured === true ||
                        featured === "true",

                    sortOrder:
                        Number(sortOrder) || 0,
                },
            });

        return res.status(201).json({
            message:
                "Certification created successfully",

            certification,
        });
    } catch (error) {
        console.error(
            "Error creating certification:",
            error
        );

        if (req.file) {
            deleteUploadedFile(
                req.file.filename
            );
        }

        return res.status(500).json({
            message:
                "Failed to create certification",
        });
    }
};


/*
=========================================================
GET MY CERTIFICATIONS
=========================================================
ADMIN ONLY

Returns ONLY certifications belonging to the
authenticated admin.
=========================================================
*/

const getMyCertifications = async (
    req,
    res
) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const certifications =
            await prisma.certification.findMany({
                where: {
                    userId,
                },

                orderBy: [
                    {
                        featured: "desc",
                    },
                    {
                        issueDate: "desc",
                    },
                ],
            });

        return res.status(200).json(
            certifications
        );
    } catch (error) {
        console.error(
            "Error fetching authenticated user's certifications:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch certifications",
        });
    }
};


/*
=========================================================
GET PUBLIC CERTIFICATIONS
=========================================================

Public endpoint:

GET /api/certifications?portfolioSlug=babatunde

IMPORTANT:

Only certifications belonging to the user represented
by portfolioSlug are returned.
=========================================================
*/

const getCertifications = async (
    req,
    res
) => {
    try {
        const {
            portfolioSlug,
        } = req.query;

        /*
        -------------------------------------------------
        VALIDATE PORTFOLIO SLUG
        -------------------------------------------------
        */

        if (
            !portfolioSlug ||
            typeof portfolioSlug !== "string"
        ) {
            return res.status(400).json({
                message:
                    "Portfolio slug is required",
            });
        }

        /*
        -------------------------------------------------
        FIND PORTFOLIO USER
        -------------------------------------------------
        */

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

        /*
        -------------------------------------------------
        GET ONLY THAT USER'S CERTIFICATIONS
        -------------------------------------------------
        */

        const certifications =
            await prisma.certification.findMany({
                where: {
                    userId: portfolioUser.id,
                },

                orderBy: [
                    {
                        featured: "desc",
                    },
                    {
                        issueDate: "desc",
                    },
                ],
            });

        return res.status(200).json(
            certifications
        );
    } catch (error) {
        console.error(
            "Error fetching public certifications:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch certifications",
        });
    }
};


/*
=========================================================
GET CERTIFICATION BY ID
=========================================================

This endpoint is intentionally kept portfolio-aware.

Public request:

GET /api/certifications/:id?portfolioSlug=babatunde

The certification must belong to the portfolio represented
by portfolioSlug.
=========================================================
*/

const getCertificationById = async (
    req,
    res
) => {
    try {
        const {
            portfolioSlug,
        } = req.query;

        /*
        -------------------------------------------------
        VALIDATE PORTFOLIO SLUG
        -------------------------------------------------
        */

        if (
            !portfolioSlug ||
            typeof portfolioSlug !== "string"
        ) {
            return res.status(400).json({
                message:
                    "Portfolio slug is required",
            });
        }

        /*
        -------------------------------------------------
        FIND PORTFOLIO USER
        -------------------------------------------------
        */

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

        /*
        -------------------------------------------------
        VALIDATE CERTIFICATION ID
        -------------------------------------------------
        */

        const certificationId =
            Number(req.params.id);

        if (
            !Number.isInteger(
                certificationId
            ) ||
            certificationId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Invalid certification ID",
            });
        }

        /*
        -------------------------------------------------
        GET CERTIFICATION ONLY IF IT BELONGS
        TO THE REQUESTED PORTFOLIO
        -------------------------------------------------
        */

        const certification =
            await prisma.certification.findFirst({
                where: {
                    id: certificationId,

                    userId: portfolioUser.id,
                },
            });

        if (!certification) {
            return res.status(404).json({
                message:
                    "Certification not found",
            });
        }

        return res.status(200).json(
            certification
        );
    } catch (error) {
        console.error(
            "Error fetching certification:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch certification",
        });
    }
};


/*
=========================================================
UPDATE CERTIFICATION
=========================================================
*/

const updateCertification = async (
    req,
    res
) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            if (req.file) {
                deleteUploadedFile(
                    req.file.filename
                );
            }

            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const certificationId =
            Number(req.params.id);

        /*
        -------------------------------------------------
        VALIDATE ID
        -------------------------------------------------
        */

        if (
            !Number.isInteger(
                certificationId
            ) ||
            certificationId <= 0
        ) {
            if (req.file) {
                deleteUploadedFile(
                    req.file.filename
                );
            }

            return res.status(400).json({
                message:
                    "Invalid certification ID",
            });
        }

        const {
            name,
            issuingOrganization,
            issueDate,
            expirationDate,
            credentialId,
            credentialUrl,
            description,
            featured,
            sortOrder,
        } = req.body;

        /*
        -------------------------------------------------
        FIND EXISTING CERTIFICATION
        -------------------------------------------------
        */

        const existingCertification =
            await prisma.certification.findUnique({
                where: {
                    id: certificationId,
                },
            });

        if (!existingCertification) {
            if (req.file) {
                deleteUploadedFile(
                    req.file.filename
                );
            }

            return res.status(404).json({
                message:
                    "Certification not found",
            });
        }

        /*
        -------------------------------------------------
        OWNERSHIP CHECK
        -------------------------------------------------
        */

        if (
            existingCertification.userId !==
            userId
        ) {
            if (req.file) {
                deleteUploadedFile(
                    req.file.filename
                );
            }

            return res.status(403).json({
                message:
                    "You are not authorized to update this certification",
            });
        }

        /*
        -------------------------------------------------
        VALIDATION
        -------------------------------------------------
        */

        if (
            !name ||
            !issuingOrganization ||
            !issueDate
        ) {
            if (req.file) {
                deleteUploadedFile(
                    req.file.filename
                );
            }

            return res.status(400).json({
                message:
                    "Certification name, issuing organization, and issue date are required",
            });
        }

        /*
        -------------------------------------------------
        CERTIFICATE URL
        -------------------------------------------------
        */

        let certificateUrl =
            existingCertification.certificateUrl;

        if (req.file) {
            certificateUrl =
                `/uploads/certifications/${req.file.filename}`;
        }

        /*
        -------------------------------------------------
        UPDATE
        -------------------------------------------------
        */

        const updatedCertification =
            await prisma.certification.update({
                where: {
                    id: certificationId,
                },

                data: {
                    name,

                    issuingOrganization,

                    issueDate:
                        new Date(issueDate),

                    expirationDate:
                        expirationDate
                            ? new Date(
                                  expirationDate
                              )
                            : null,

                    credentialId:
                        credentialId || null,

                    credentialUrl:
                        credentialUrl || null,

                    description:
                        description || null,

                    certificateUrl,

                    featured:
                        featured === true ||
                        featured === "true",

                    sortOrder:
                        Number(sortOrder) || 0,
                },
            });

        /*
        -------------------------------------------------
        DELETE OLD CERTIFICATE FILE
        ONLY AFTER SUCCESSFUL DATABASE UPDATE
        -------------------------------------------------
        */

        if (
            req.file &&
            existingCertification.certificateUrl
        ) {
            deleteCertificateFile(
                existingCertification.certificateUrl
            );
        }

        return res.status(200).json({
            message:
                "Certification updated successfully",

            certification:
                updatedCertification,
        });
    } catch (error) {
        console.error(
            "Error updating certification:",
            error
        );

        if (req.file) {
            deleteUploadedFile(
                req.file.filename
            );
        }

        return res.status(500).json({
            message:
                "Failed to update certification",
        });
    }
};


/*
=========================================================
DELETE CERTIFICATION
=========================================================
*/

const deleteCertification = async (
    req,
    res
) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const certificationId =
            Number(req.params.id);

        /*
        -------------------------------------------------
        VALIDATE ID
        -------------------------------------------------
        */

        if (
            !Number.isInteger(
                certificationId
            ) ||
            certificationId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Invalid certification ID",
            });
        }

        /*
        -------------------------------------------------
        FIND CERTIFICATION
        -------------------------------------------------
        */

        const certification =
            await prisma.certification.findUnique({
                where: {
                    id: certificationId,
                },
            });

        if (!certification) {
            return res.status(404).json({
                message:
                    "Certification not found",
            });
        }

        /*
        -------------------------------------------------
        OWNERSHIP CHECK
        -------------------------------------------------
        */

        if (
            certification.userId !== userId
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to delete this certification",
            });
        }

        /*
        -------------------------------------------------
        DELETE DATABASE RECORD
        -------------------------------------------------
        */

        await prisma.certification.delete({
            where: {
                id: certificationId,
            },
        });

        /*
        -------------------------------------------------
        DELETE CERTIFICATE FILE
        ONLY AFTER DATABASE DELETE
        -------------------------------------------------
        */

        if (
            certification.certificateUrl
        ) {
            deleteCertificateFile(
                certification.certificateUrl
            );
        }

        return res.status(200).json({
            message:
                "Certification deleted successfully",
        });
    } catch (error) {
        console.error(
            "Error deleting certification:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete certification",
        });
    }
};


/*
=========================================================
EXPORTS
=========================================================
*/

module.exports = {
    createCertification,
    getMyCertifications,
    getCertifications,
    getCertificationById,
    updateCertification,
    deleteCertification,
};