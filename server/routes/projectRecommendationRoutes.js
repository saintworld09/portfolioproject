const express = require("express");

const {
    createRecommendation,
    getRecommendations,
    updateRecommendation,
    deleteRecommendation,
} = require("../controllers/projectRecommendationController");

const {
    authenticateToken,
    authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Get project recommendations
| Public
|--------------------------------------------------------------------------
*/

router.get(
    "/:projectId/recommendations",
    getRecommendations
);

/*
|--------------------------------------------------------------------------
| Create project recommendation
| Admin only
|--------------------------------------------------------------------------
*/

router.post(
    "/:projectId/recommendations",
    authenticateToken,
    authorizeAdmin,
    createRecommendation
);

/*
|--------------------------------------------------------------------------
| Update recommendation
| Admin only
|--------------------------------------------------------------------------
*/

router.put(
    "/recommendations/:id",
    authenticateToken,
    authorizeAdmin,
    updateRecommendation
);

/*
|--------------------------------------------------------------------------
| Delete recommendation
| Admin only
|--------------------------------------------------------------------------
*/

router.delete(
    "/recommendations/:id",
    authenticateToken,
    authorizeAdmin,
    deleteRecommendation
);

module.exports = router;