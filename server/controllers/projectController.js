const prisma = require("../prisma");
const fs = require("fs");
const path = require("path");

/* ==========================================================================
   HELPER: GET AUTHENTICATED USER ID
   ========================================================================== */

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

/* ==========================================================================
   HELPER: CHECK PROJECT OWNERSHIP
   ========================================================================== */

const userOwnsProject = (project, userId) => {
    if (!project || !userId) {
        return false;
    }

    return project.userId === userId;
};

/* ==========================================================================
   HELPER: GET PROJECT WITH ALL RELATED DATA
   ========================================================================== */

const getProjectWithRelations = async (projectId) => {
    return await prisma.project.findUnique({
        where: {
            id: projectId,
        },

        include: {
            insights: {
                orderBy: {
                    sortOrder: "asc",
                },
            },

            recommendations: {
                orderBy: {
                    sortOrder: "asc",
                },
            },

            images: {
                orderBy: {
                    sortOrder: "asc",
                },
            },
        },
    });
};

/* ==========================================================================
   HELPER: DELETE PHYSICAL PROJECT IMAGE FILE
   ========================================================================== */

const deletePhysicalImage = (imageUrl) => {
    if (!imageUrl) {
        return;
    }

    /*
    Only delete files that belong to our
    local uploads directory.
    */

    if (
        !imageUrl.startsWith("/uploads/") &&
        !imageUrl.startsWith("\\uploads\\")
    ) {
        return;
    }

    const relativePath = imageUrl.replace(
        /^[/\\]*uploads[/\\]/,
        ""
    );

    const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        relativePath
    );

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(
            "Error deleting physical image file:",
            error
        );
    }
};

/* ==========================================================================
   HELPER: PARSE BOOLEAN VALUES
   ========================================================================== */

const parseBoolean = (value) => {
    if (
        value === true ||
        value === "true"
    ) {
        return true;
    }

    if (
        value === false ||
        value === "false"
    ) {
        return false;
    }

    return Boolean(value);
};

/* ==========================================================================
   HELPER: PARSE OPTIONAL DATE
   ========================================================================== */

const parseOptionalDate = (value) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    const parsedDate = new Date(value);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return null;
    }

    return parsedDate;
};

/* ==========================================================================
   HELPER: GET PORTFOLIO USER FROM SLUG
   ========================================================================== */

const getUserByPortfolioSlug = async (portfolioSlug) => {
    if (
        !portfolioSlug ||
        typeof portfolioSlug !== "string"
    ) {
        return null;
    }

    return await prisma.user.findUnique({
        where: {
            portfolioSlug:
                portfolioSlug
                    .trim()
                    .toLowerCase(),
        },

        select: {
            id: true,
            name: true,
            email: true,
            portfolioSlug: true,
        },
    });
};

/* ==========================================================================
   GET ALL PROJECTS
   ==========================================================================

   AUTHENTICATED:
   GET /api/projects

   Returns projects belonging to the authenticated user.

   IMPORTANT:
   The authenticated response is returned as a DIRECT ARRAY because
   AdminDashboard.jsx expects:

       const projects = await projectsResponse.json();

       Array.isArray(projects)

   PUBLIC:
   GET /api/projects?portfolioSlug=babatunde

   Returns projects belonging to the specified portfolio.
   ========================================================================== */

const getProjects = async (req, res) => {
    try {
        const authenticatedUserId =
            getAuthenticatedUserId(req);

        /*
        ----------------------------------------------------------------------
        CASE 1: AUTHENTICATED REQUEST
        ----------------------------------------------------------------------
        */

        if (authenticatedUserId) {
            const projects =
                await prisma.project.findMany({
                    where: {
                        userId:
                            authenticatedUserId,
                    },

                    include: {
                        insights: {
                            orderBy: {
                                sortOrder: "asc",
                            },
                        },

                        recommendations: {
                            orderBy: {
                                sortOrder: "asc",
                            },
                        },

                        images: {
                            orderBy: {
                                sortOrder: "asc",
                            },
                        },
                    },

                    orderBy: {
                        createdAt: "desc",
                    },
                });

            /*
            IMPORTANT:
            Return the array directly.

            AdminDashboard.jsx expects:
            Array.isArray(projects) === true
            */

            return res.status(200).json(
                projects
            );
        }

        /*
        ----------------------------------------------------------------------
        CASE 2: PUBLIC PORTFOLIO REQUEST
        ----------------------------------------------------------------------
        */

        const { portfolioSlug } =
            req.query;

        if (!portfolioSlug) {
            return res.status(400).json({
                message:
                    "Portfolio slug is required",
            });
        }

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

        const projects =
            await prisma.project.findMany({
                where: {
                    userId:
                        portfolioUser.id,
                },

                include: {
                    insights: {
                        orderBy: {
                            sortOrder: "asc",
                        },
                    },

                    recommendations: {
                        orderBy: {
                            sortOrder: "asc",
                        },
                    },

                    images: {
                        orderBy: {
                            sortOrder: "asc",
                        },
                    },
                },

                orderBy: {
                    createdAt: "desc",
                },
            });

        /*
        Public project list also returns a direct array.
        */

        return res.status(200).json(
            projects
        );
    } catch (error) {
        console.error(
            "Error fetching projects:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch projects",
        });
    }
};

/* ==========================================================================
   CREATE PROJECT
   ========================================================================== */

const createProject = async (req, res) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const {
            title,
            slug,
            shortDescription,
            description,
            businessProblem,
            methodology,
            datasetDescription,
            dashboardImageUrl,
            githubUrl,
            liveUrl,
            category,
            featured,
            startDate,
            endDate,
            coverImageIndex,
        } = req.body;

        /*
        ----------------------------------------------------------------------
        VALIDATE REQUIRED FIELDS
        ----------------------------------------------------------------------
        */

        if (
            !title?.trim() ||
            !slug?.trim() ||
            !shortDescription?.trim()
        ) {
            return res.status(400).json({
                message:
                    "Title, slug, and short description are required",
            });
        }

        const normalizedTitle =
            title.trim();

        const normalizedSlug =
            slug.trim();

        const normalizedShortDescription =
            shortDescription.trim();

        /*
        ----------------------------------------------------------------------
        CHECK DUPLICATE SLUG
        ----------------------------------------------------------------------
        */

        const existingProject =
            await prisma.project.findUnique({
                where: {
                    userId_slug: {
                        userId,
                        slug:
                            normalizedSlug,
                    },
                },
            });

        if (existingProject) {
            return res.status(409).json({
                message:
                    "A project with this slug already exists in your portfolio",
            });
        }

        const uploadedFiles =
            Array.isArray(req.files)
                ? req.files
                : [];

        /*
        ----------------------------------------------------------------------
        DETERMINE COVER IMAGE
        ----------------------------------------------------------------------
        */

        let parsedCoverIndex = 0;

        if (
            coverImageIndex !== undefined &&
            coverImageIndex !== null &&
            coverImageIndex !== ""
        ) {
            parsedCoverIndex =
                Number(coverImageIndex);

            if (
                !Number.isInteger(
                    parsedCoverIndex
                ) ||
                parsedCoverIndex < 0 ||
                parsedCoverIndex >=
                    uploadedFiles.length
            ) {
                return res.status(400).json({
                    message:
                        "Invalid cover image index",
                });
            }
        }

        /*
        ----------------------------------------------------------------------
        DETERMINE DASHBOARD IMAGE
        ----------------------------------------------------------------------
        */

        const uploadedImagePath =
            uploadedFiles.length > 0
                ? `/uploads/projects/${uploadedFiles[0].filename}`
                : dashboardImageUrl?.trim() ||
                  null;

        /*
        ----------------------------------------------------------------------
        CREATE PROJECT
        ----------------------------------------------------------------------
        */

        const project =
            await prisma.project.create({
                data: {
                    userId,

                    title:
                        normalizedTitle,

                    slug:
                        normalizedSlug,

                    shortDescription:
                        normalizedShortDescription,

                    description:
                        description?.trim() ||
                        null,

                    businessProblem:
                        businessProblem?.trim() ||
                        null,

                    methodology:
                        methodology?.trim() ||
                        null,

                    datasetDescription:
                        datasetDescription?.trim() ||
                        null,

                    dashboardImageUrl:
                        uploadedImagePath,

                    githubUrl:
                        githubUrl?.trim() ||
                        null,

                    liveUrl:
                        liveUrl?.trim() ||
                        null,

                    category:
                        category?.trim() ||
                        null,

                    featured:
                        parseBoolean(
                            featured
                        ),

                    startDate:
                        parseOptionalDate(
                            startDate
                        ),

                    endDate:
                        parseOptionalDate(
                            endDate
                        ),
                },
            });

        /*
        ----------------------------------------------------------------------
        SAVE PROJECT IMAGES
        ----------------------------------------------------------------------
        */

        if (uploadedFiles.length > 0) {
            const images =
                uploadedFiles.map(
                    (file, index) => ({
                        projectId:
                            project.id,

                        imageUrl:
                            `/uploads/projects/${file.filename}`,

                        isCover:
                            index ===
                            parsedCoverIndex,

                        sortOrder:
                            index,
                    })
                );

            await prisma.projectImage.createMany({
                data: images,
            });
        }

        const createdProject =
            await getProjectWithRelations(
                project.id
            );

        return res.status(201).json(
            createdProject
        );
    } catch (error) {
        console.error(
            "Error creating project:",
            error
        );

        if (
            error.code === "P2002"
        ) {
            return res.status(409).json({
                message:
                    "A project with this slug already exists in your portfolio",
            });
        }

        return res.status(500).json({
            message:
                "Failed to create project",
        });
    }
};

/* ==========================================================================
   GET SINGLE PROJECT
   ========================================================================== */

const getProjectById = async (req, res) => {
    try {
        const projectId =
            Number(req.params.id);

        if (
            !Number.isInteger(
                projectId
            ) ||
            projectId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Invalid project ID",
            });
        }

        const project =
            await getProjectWithRelations(
                projectId
            );

        if (!project) {
            return res.status(404).json({
                message:
                    "Project not found",
            });
        }

        /*
        ----------------------------------------------------------------------
        AUTHENTICATED REQUEST
        ----------------------------------------------------------------------
        */

        const authenticatedUserId =
            getAuthenticatedUserId(req);

        if (authenticatedUserId) {
            if (
                project.userId !==
                authenticatedUserId
            ) {
                return res.status(404).json({
                    message:
                        "Project not found",
                });
            }

            /*
            IMPORTANT:
            Return the project directly rather than:

                { success: true, project }

            This keeps the project API response consistent with the
            create/update endpoints and existing frontend usage.
            */

            return res.status(200).json(
                project
            );
        }

        /*
        ----------------------------------------------------------------------
        PUBLIC REQUEST
        ----------------------------------------------------------------------
        */

        const { portfolioSlug } =
            req.query;

        if (!portfolioSlug) {
            return res.status(400).json({
                message:
                    "Portfolio slug is required",
            });
        }

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

        if (
            project.userId !==
            portfolioUser.id
        ) {
            return res.status(404).json({
                message:
                    "Project not found",
            });
        }

        /*
        Public single-project response is also
        returned directly.
        */

        return res.status(200).json(
            project
        );
    } catch (error) {
        console.error(
            "Error fetching project:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch project",
        });
    }
};

/* ==========================================================================
   DELETE PROJECT
   ========================================================================== */

const deleteProject = async (req, res) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const projectId =
            Number(req.params.id);

        if (
            !Number.isInteger(
                projectId
            ) ||
            projectId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Invalid project ID",
            });
        }

        const project =
            await prisma.project.findUnique({
                where: {
                    id: projectId,
                },

                include: {
                    images: true,
                },
            });

        if (!project) {
            return res.status(404).json({
                message:
                    "Project not found",
            });
        }

        if (
            !userOwnsProject(
                project,
                userId
            )
        ) {
            return res.status(403).json({
                message:
                    "You do not have permission to delete this project",
            });
        }

        const imageUrls =
            project.images.map(
                (image) =>
                    image.imageUrl
            );

        await prisma.project.delete({
            where: {
                id: projectId,
            },
        });

        imageUrls.forEach(
            (imageUrl) => {
                deletePhysicalImage(
                    imageUrl
                );
            }
        );

        return res.status(200).json({
            message:
                "Project deleted successfully",
        });
    } catch (error) {
        console.error(
            "Error deleting project:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete project",
        });
    }
};

/* ==========================================================================
   UPDATE PROJECT
   ========================================================================== */

const updateProject = async (req, res) => {
    try {
        const userId =
            getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authenticated user information is required",
            });
        }

        const projectId =
            Number(req.params.id);

        if (
            !Number.isInteger(
                projectId
            ) ||
            projectId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Invalid project ID",
            });
        }

        const {
            title,
            slug,
            shortDescription,
            description,
            businessProblem,
            methodology,
            datasetDescription,
            dashboardImageUrl,
            githubUrl,
            liveUrl,
            category,
            featured,
            startDate,
            endDate,
            coverImageId,
            coverImageIndex,
        } = req.body;

        /*
        ----------------------------------------------------------------------
        FIND PROJECT
        ----------------------------------------------------------------------
        */

        const existingProject =
            await prisma.project.findUnique({
                where: {
                    id: projectId,
                },

                include: {
                    images: {
                        orderBy: {
                            sortOrder:
                                "asc",
                        },
                    },
                },
            });

        if (!existingProject) {
            return res.status(404).json({
                message:
                    "Project not found",
            });
        }

        /*
        ----------------------------------------------------------------------
        OWNERSHIP CHECK
        ----------------------------------------------------------------------
        */

        if (
            !userOwnsProject(
                existingProject,
                userId
            )
        ) {
            return res.status(403).json({
                message:
                    "You do not have permission to update this project",
            });
        }

        /*
        ----------------------------------------------------------------------
        REQUIRED FIELDS
        ----------------------------------------------------------------------
        */

        if (
            !title?.trim() ||
            !slug?.trim() ||
            !shortDescription?.trim()
        ) {
            return res.status(400).json({
                message:
                    "Title, slug, and short description are required",
            });
        }

        const normalizedTitle =
            title.trim();

        const normalizedSlug =
            slug.trim();

        const normalizedShortDescription =
            shortDescription.trim();

        /*
        ----------------------------------------------------------------------
        CHECK DUPLICATE SLUG
        ----------------------------------------------------------------------
        */

        const projectWithSlug =
            await prisma.project.findUnique({
                where: {
                    userId_slug: {
                        userId,
                        slug:
                            normalizedSlug,
                    },
                },
            });

        if (
            projectWithSlug &&
            projectWithSlug.id !==
                projectId
        ) {
            return res.status(409).json({
                message:
                    "A project with this slug already exists in your portfolio",
            });
        }

        const uploadedFiles =
            Array.isArray(req.files)
                ? req.files
                : [];

        const hasCoverImageId =
            coverImageId !== undefined &&
            coverImageId !== null &&
            coverImageId !== "";

        const hasCoverImageIndex =
            coverImageIndex !== undefined &&
            coverImageIndex !== null &&
            coverImageIndex !== "";

        /*
        ----------------------------------------------------------------------
        VALIDATE EXISTING COVER IMAGE
        ----------------------------------------------------------------------
        */

        let selectedExistingImageId =
            null;

        if (hasCoverImageId) {
            selectedExistingImageId =
                Number(coverImageId);

            if (
                !Number.isInteger(
                    selectedExistingImageId
                ) ||
                selectedExistingImageId <= 0
            ) {
                return res.status(400).json({
                    message:
                        "Invalid cover image ID",
                });
            }

            const selectedImage =
                existingProject.images.find(
                    (image) =>
                        image.id ===
                        selectedExistingImageId
                );

            if (!selectedImage) {
                return res.status(400).json({
                    message:
                        "Selected cover image does not belong to this project",
                });
            }
        }

        /*
        ----------------------------------------------------------------------
        VALIDATE NEW COVER IMAGE
        ----------------------------------------------------------------------
        */

        let selectedNewImageIndex =
            null;

        if (hasCoverImageIndex) {
            selectedNewImageIndex =
                Number(coverImageIndex);

            if (
                !Number.isInteger(
                    selectedNewImageIndex
                ) ||
                selectedNewImageIndex < 0 ||
                selectedNewImageIndex >=
                    uploadedFiles.length
            ) {
                return res.status(400).json({
                    message:
                        "Invalid cover image index",
                });
            }
        }

        /*
        ----------------------------------------------------------------------
        UPDATE PROJECT
        ----------------------------------------------------------------------
        */

        const updatedProject =
            await prisma.project.update({
                where: {
                    id: projectId,
                },

                data: {
                    userId,

                    title:
                        normalizedTitle,

                    slug:
                        normalizedSlug,

                    shortDescription:
                        normalizedShortDescription,

                    description:
                        description?.trim() ||
                        null,

                    businessProblem:
                        businessProblem?.trim() ||
                        null,

                    methodology:
                        methodology?.trim() ||
                        null,

                    datasetDescription:
                        datasetDescription?.trim() ||
                        null,

                    dashboardImageUrl:
                        existingProject.dashboardImageUrl ||
                        dashboardImageUrl?.trim() ||
                        null,

                    githubUrl:
                        githubUrl?.trim() ||
                        null,

                    liveUrl:
                        liveUrl?.trim() ||
                        null,

                    category:
                        category?.trim() ||
                        null,

                    featured:
                        parseBoolean(
                            featured
                        ),

                    startDate:
                        parseOptionalDate(
                            startDate
                        ),

                    endDate:
                        parseOptionalDate(
                            endDate
                        ),
                },
            });

        /*
        ----------------------------------------------------------------------
        ADD NEW IMAGES
        ----------------------------------------------------------------------
        */

        let newImages = [];

        if (uploadedFiles.length > 0) {
            const lastImage =
                await prisma.projectImage.findFirst({
                    where: {
                        projectId,
                    },

                    orderBy: {
                        sortOrder:
                            "desc",
                    },
                });

            const nextSortOrder =
                lastImage
                    ? lastImage.sortOrder + 1
                    : 0;

            newImages =
                await Promise.all(
                    uploadedFiles.map(
                        async (
                            file,
                            index
                        ) => {
                            return await prisma.projectImage.create(
                                {
                                    data: {
                                        projectId,

                                        imageUrl:
                                            `/uploads/projects/${file.filename}`,

                                        isCover:
                                            false,

                                        sortOrder:
                                            nextSortOrder +
                                            index,
                                    },
                                }
                            );
                        }
                    )
                );
        }

        /*
        ----------------------------------------------------------------------
        CASE 1: EXISTING IMAGE AS COVER
        ----------------------------------------------------------------------
        */

        if (
            selectedExistingImageId
        ) {
            await prisma.$transaction([
                prisma.projectImage.updateMany({
                    where: {
                        projectId,
                    },

                    data: {
                        isCover: false,
                    },
                }),

                prisma.projectImage.update({
                    where: {
                        id:
                            selectedExistingImageId,
                    },

                    data: {
                        isCover: true,
                    },
                }),
            ]);
        }

        /*
        ----------------------------------------------------------------------
        CASE 2: NEW IMAGE AS COVER
        ----------------------------------------------------------------------
        */

        else if (
            selectedNewImageIndex !==
            null
        ) {
            const selectedNewImage =
                newImages[
                    selectedNewImageIndex
                ];

            await prisma.$transaction([
                prisma.projectImage.updateMany({
                    where: {
                        projectId,
                    },

                    data: {
                        isCover: false,
                    },
                }),

                prisma.projectImage.update({
                    where: {
                        id:
                            selectedNewImage.id,
                    },

                    data: {
                        isCover: true,
                    },
                }),
            ]);
        }

        /*
        ----------------------------------------------------------------------
        CASE 3: NO COVER SELECTED
        ----------------------------------------------------------------------
        */

        else {
            const hasExistingCover =
                existingProject.images.some(
                    (image) =>
                        image.isCover
                );

            if (
                !hasExistingCover &&
                (
                    existingProject.images
                        .length > 0 ||
                    newImages.length > 0
                )
            ) {
                const firstImage =
                    await prisma.projectImage.findFirst({
                        where: {
                            projectId,
                        },

                        orderBy: {
                            sortOrder:
                                "asc",
                        },
                    });

                if (firstImage) {
                    await prisma.$transaction([
                        prisma.projectImage.updateMany({
                            where: {
                                projectId,
                            },

                            data: {
                                isCover: false,
                            },
                        }),

                        prisma.projectImage.update({
                            where: {
                                id:
                                    firstImage.id,
                            },

                            data: {
                                isCover: true,
                            },
                        }),
                    ]);
                }
            }
        }

        /*
        ----------------------------------------------------------------------
        RETURN UPDATED PROJECT
        ----------------------------------------------------------------------
        */

        const project =
            await getProjectWithRelations(
                updatedProject.id
            );

        return res.status(200).json(
            project
        );
    } catch (error) {
        console.error(
            "Error updating project:",
            error
        );

        if (
            error.code === "P2002"
        ) {
            return res.status(409).json({
                message:
                    "A project with this slug already exists in your portfolio",
            });
        }

        return res.status(500).json({
            message:
                "Failed to update project",
        });
    }
};

/* ==========================================================================
   SET PROJECT IMAGE AS COVER
   ========================================================================== */

const setProjectImageCover = async (
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

        const projectId =
            Number(req.params.id);

        const imageId =
            Number(req.params.imageId);

        if (
            !Number.isInteger(
                projectId
            ) ||
            projectId <= 0 ||
            !Number.isInteger(
                imageId
            ) ||
            imageId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Invalid project or image ID",
            });
        }

        const project =
            await prisma.project.findUnique({
                where: {
                    id: projectId,
                },
            });

        if (!project) {
            return res.status(404).json({
                message:
                    "Project not found",
            });
        }

        if (
            !userOwnsProject(
                project,
                userId
            )
        ) {
            return res.status(403).json({
                message:
                    "You do not have permission to modify this project",
            });
        }

        const image =
            await prisma.projectImage.findFirst({
                where: {
                    id: imageId,
                    projectId,
                },
            });

        if (!image) {
            return res.status(404).json({
                message:
                    "Project image not found",
            });
        }

        await prisma.$transaction([
            prisma.projectImage.updateMany({
                where: {
                    projectId,
                },

                data: {
                    isCover: false,
                },
            }),

            prisma.projectImage.update({
                where: {
                    id: imageId,
                },

                data: {
                    isCover: true,
                },
            }),
        ]);

        const updatedProject =
            await getProjectWithRelations(
                projectId
            );

        return res.status(200).json(
            updatedProject
        );
    } catch (error) {
        console.error(
            "Error setting project image cover:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to set project image as cover",
        });
    }
};

/* ==========================================================================
   DELETE PROJECT IMAGE
   ========================================================================== */

const deleteProjectImage = async (
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

        const projectId =
            Number(req.params.id);

        const imageId =
            Number(req.params.imageId);

        if (
            !Number.isInteger(
                projectId
            ) ||
            projectId <= 0 ||
            !Number.isInteger(
                imageId
            ) ||
            imageId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Invalid project or image ID",
            });
        }

        const project =
            await prisma.project.findUnique({
                where: {
                    id: projectId,
                },
            });

        if (!project) {
            return res.status(404).json({
                message:
                    "Project not found",
            });
        }

        if (
            !userOwnsProject(
                project,
                userId
            )
        ) {
            return res.status(403).json({
                message:
                    "You do not have permission to modify this project",
            });
        }

        const image =
            await prisma.projectImage.findFirst({
                where: {
                    id: imageId,
                    projectId,
                },
            });

        if (!image) {
            return res.status(404).json({
                message:
                    "Project image not found",
            });
        }

        const wasCover =
            image.isCover;

        await prisma.projectImage.delete({
            where: {
                id: imageId,
            },
        });

        deletePhysicalImage(
            image.imageUrl
        );

        /*
        If deleted image was the cover,
        automatically choose another image.
        */

        if (wasCover) {
            const remainingImage =
                await prisma.projectImage.findFirst({
                    where: {
                        projectId,
                    },

                    orderBy: {
                        sortOrder:
                            "asc",
                    },
                });

            if (remainingImage) {
                await prisma.$transaction([
                    prisma.projectImage.updateMany({
                        where: {
                            projectId,
                        },

                        data: {
                            isCover: false,
                        },
                    }),

                    prisma.projectImage.update({
                        where: {
                            id:
                                remainingImage.id,
                        },

                        data: {
                            isCover: true,
                        },
                    }),
                ]);
            } else {
                /*
                No images remain.
                Clear dashboardImageUrl only
                when it points to the deleted image.
                */

                if (
                    project.dashboardImageUrl ===
                    image.imageUrl
                ) {
                    await prisma.project.update({
                        where: {
                            id: projectId,
                        },

                        data: {
                            dashboardImageUrl:
                                null,
                        },
                    });
                }
            }
        }

        const updatedProject =
            await getProjectWithRelations(
                projectId
            );

        return res.status(200).json(
            updatedProject
        );
    } catch (error) {
        console.error(
            "Error deleting project image:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete project image",
        });
    }
};

/* ==========================================================================
   EXPORT CONTROLLERS
   ========================================================================== */

module.exports = {
    getProjects,
    createProject,
    getProjectById,
    deleteProject,
    updateProject,
    setProjectImageCover,
    deleteProjectImage,
};