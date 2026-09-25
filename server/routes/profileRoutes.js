const express = require("express");

const {
    getProfile,
    getMyProfile,
    createProfile,
    updateProfile,
} = require("../controllers/profileController");

const {
    authenticateToken,
    authorizeAdmin,
} = require("../middleware/authMiddleware");

const uploadProfileImage =
    require("../middleware/profileUploadMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET AUTHENTICATED USER PROFILE
|--------------------------------------------------------------------------
| IMPORTANT:
| This route MUST come before "/:portfolioSlug".
|
| Otherwise Express will treat "me" as a portfolioSlug.
|--------------------------------------------------------------------------
*/

router.get(
    "/me",
    authenticateToken,
    authorizeAdmin,
    getMyProfile
);

/*
|--------------------------------------------------------------------------
| PUBLIC PROFILE
|--------------------------------------------------------------------------
| Example:
| GET /api/profile/babatunde
|--------------------------------------------------------------------------
*/

router.get(
    "/:portfolioSlug",
    getProfile
);

/*
|--------------------------------------------------------------------------
| CREATE PROFILE
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    authenticateToken,
    authorizeAdmin,
    uploadProfileImage.single("profileImage"),
    createProfile
);

/*
|--------------------------------------------------------------------------
| UPDATE PROFILE
|--------------------------------------------------------------------------
*/

router.put(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    uploadProfileImage.single("profileImage"),
    updateProfile
);

module.exports = router;