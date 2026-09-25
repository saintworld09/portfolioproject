const express = require("express");

const {
    getCertifications,
    getMyCertifications,
    getCertificationById,
    createCertification,
    updateCertification,
    deleteCertification,
} = require("../controllers/certificationController");

const {
    authenticateToken,
    authorizeAdmin,
} = require("../middleware/authMiddleware");

const uploadCertificationFile = require(
    "../middleware/certificationUploadMiddleware"
);

const router = express.Router();


/*
=========================================================
ADMIN
GET MY CERTIFICATIONS
=========================================================
*/

router.get(
    "/me",
    authenticateToken,
    authorizeAdmin,
    getMyCertifications
);


/*
=========================================================
PUBLIC
GET CERTIFICATIONS FOR A PORTFOLIO
=========================================================

Example:

GET /api/certifications?portfolioSlug=babatunde
=========================================================
*/

router.get(
    "/",
    getCertifications
);


/*
=========================================================
PUBLIC
GET ONE CERTIFICATION
=========================================================

Example:

GET /api/certifications/5?portfolioSlug=babatunde

The controller verifies that certification 5 belongs
to the requested portfolio.
=========================================================
*/

router.get(
    "/:id",
    getCertificationById
);


/*
=========================================================
ADMIN
CREATE CERTIFICATION
=========================================================
*/

router.post(
    "/",
    authenticateToken,
    authorizeAdmin,
    uploadCertificationFile.single(
        "certificate"
    ),
    createCertification
);


/*
=========================================================
ADMIN
UPDATE CERTIFICATION
=========================================================
*/

router.put(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    uploadCertificationFile.single(
        "certificate"
    ),
    updateCertification
);


/*
=========================================================
ADMIN
DELETE CERTIFICATION
=========================================================
*/

router.delete(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    deleteCertification
);


module.exports = router;