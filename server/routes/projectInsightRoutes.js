const express = require("express");

const {
    createInsight,
    getInsights,
    updateInsight,
    deleteInsight,
} = require("../controllers/projectInsightController");

const {
    authenticateToken,
    authorizeAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Get project insights
| Public
|--------------------------------------------------------------------------
*/

router.get(
    "/:projectId/insights",
    getInsights
);

/*
|--------------------------------------------------------------------------
| Create project insight
| Admin only
|--------------------------------------------------------------------------
*/

router.post(
    "/:projectId/insights",
    authenticateToken,
    authorizeAdmin,
    createInsight
);

/*
|--------------------------------------------------------------------------
| Update insight
| Admin only
|--------------------------------------------------------------------------
*/

router.put(
    "/insights/:id",
    authenticateToken,
    authorizeAdmin,
    updateInsight
);

/*
|--------------------------------------------------------------------------
| Delete insight
| Admin only
|--------------------------------------------------------------------------
*/

router.delete(
    "/insights/:id",
    authenticateToken,
    authorizeAdmin,
    deleteInsight
);

module.exports = router;