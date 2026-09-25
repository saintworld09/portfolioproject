const express = require("express");

const {
    getProjects,
    createProject,
    getProjectById,
    deleteProject,
    updateProject,
    setProjectImageCover,
    deleteProjectImage,
} = require("../controllers/projectController");

const {
    authenticateToken,
    optionalAuthenticateToken,
    authorizeAdmin,
} = require("../middleware/authMiddleware");

const {
    uploadProjectImage,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public / Optional Authentication Project Routes
|--------------------------------------------------------------------------
|
| These GET routes are public for portfolio visitors.
|
| However, optionalAuthenticateToken allows the same routes to recognize
| a logged-in admin when a valid JWT is provided.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| GET ALL PROJECTS
|--------------------------------------------------------------------------
|
| Public:
| GET /api/projects?portfolioSlug=babatunde
|
| Authenticated admin:
| GET /api/projects
|
| When an admin is authenticated, projectController.js can use
| req.user.userId to return that admin's projects.
|
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    optionalAuthenticateToken,
    getProjects
);

/*
|--------------------------------------------------------------------------
| GET SINGLE PROJECT
|--------------------------------------------------------------------------
|
| Public:
| GET /api/projects/1?portfolioSlug=babatunde
|
| Authenticated admin:
| GET /api/projects/1
|
| optionalAuthenticateToken allows projectController.js to determine
| whether the request belongs to the authenticated admin.
|
|--------------------------------------------------------------------------
*/

router.get(
    "/:id",
    optionalAuthenticateToken,
    getProjectById
);

/*
|--------------------------------------------------------------------------
| Admin Project Routes
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| CREATE PROJECT
|--------------------------------------------------------------------------
|
| Authentication:
| - User must be logged in.
| - User must have ADMIN role.
|
| Images:
| - Up to 10 dashboard images.
|
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    authenticateToken,
    authorizeAdmin,
    uploadProjectImage.array(
        "dashboardImages",
        10
    ),
    createProject
);

/*
|--------------------------------------------------------------------------
| UPDATE PROJECT
|--------------------------------------------------------------------------
|
| Authentication:
| - User must be logged in.
| - User must have ADMIN role.
|
| Existing images are preserved.
| Newly uploaded images are appended.
|
|--------------------------------------------------------------------------
*/

router.put(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    uploadProjectImage.array(
        "dashboardImages",
        10
    ),
    updateProject
);

/*
|--------------------------------------------------------------------------
| DELETE PROJECT
|--------------------------------------------------------------------------
|
| Authentication:
| - User must be logged in.
| - User must have ADMIN role.
|
| Deletes:
| - Project
| - Project images
| - Project insights
| - Project recommendations
| - Physical project image files
|
|--------------------------------------------------------------------------
*/

router.delete(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    deleteProject
);

/*
|--------------------------------------------------------------------------
| PROJECT IMAGE MANAGEMENT
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| SET PROJECT IMAGE AS COVER
|--------------------------------------------------------------------------
|
| PUT:
| /api/projects/:id/images/:imageId/cover
|
|--------------------------------------------------------------------------
*/

router.put(
    "/:id/images/:imageId/cover",
    authenticateToken,
    authorizeAdmin,
    setProjectImageCover
);

/*
|--------------------------------------------------------------------------
| DELETE PROJECT IMAGE
|--------------------------------------------------------------------------
|
| DELETE:
| /api/projects/:id/images/:imageId
|
|--------------------------------------------------------------------------
*/

router.delete(
    "/:id/images/:imageId",
    authenticateToken,
    authorizeAdmin,
    deleteProjectImage
);

module.exports = router;