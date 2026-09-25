const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ========================================
// CREATE ABOUT UPLOAD DIRECTORY
// ========================================

const uploadDirectory = path.join(
    __dirname,
    "..",
    "uploads",
    "about"
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true,
        }
    );
}

// ========================================
// STORAGE CONFIGURATION
// ========================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension =
            path.extname(file.originalname);

        const baseName =
            path
                .basename(
                    file.originalname,
                    extension
                )
                .replace(
                    /[^a-zA-Z0-9-_]/g,
                    "-"
                )
                .toLowerCase();

        const uniqueName =
            `${Date.now()}-${baseName}${extension}`;

        cb(null, uniqueName);
    },
});

// ========================================
// FILE FILTER
// ========================================

const fileFilter = (
    req,
    file,
    cb
) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/svg+xml",
    ];

    if (
        allowedTypes.includes(
            file.mimetype
        )
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, PNG, WebP, and SVG images are allowed."
            ),
            false
        );
    }
};

// ========================================
// MULTER CONFIGURATION
// ========================================

const uploadAboutIcon =
    multer({
        storage,
        fileFilter,

        limits: {
            fileSize:
                2 * 1024 * 1024,
        },
    });

module.exports =
    uploadAboutIcon;