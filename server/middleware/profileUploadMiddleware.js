const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ========================================
// PROFILE UPLOAD DIRECTORY
// ========================================

const uploadDirectory = path.join(
    __dirname,
    "../uploads/profile"
);

// Create directory if it does not exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}

// ========================================
// STORAGE CONFIGURATION
// ========================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            `profile-${Date.now()}${path.extname(file.originalname)}`;

        cb(null, uniqueName);
    },
});

// ========================================
// FILE FILTER
// ========================================

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, PNG, and WebP images are allowed."
            ),
            false
        );
    }
};

// ========================================
// MULTER CONFIGURATION
// ========================================

const uploadProfileImage = multer({
    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = uploadProfileImage;