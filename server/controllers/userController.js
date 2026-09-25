const prisma = require("../prisma");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
try {
const {
name,
email,
password,
portfolioSlug,
} = req.body;


    /*
    |--------------------------------------------------------------------------
    | Validate required fields
    |--------------------------------------------------------------------------
    */

    if (!name || !email || !password || !portfolioSlug) {
        return res.status(400).json({
            message:
                "Name, email, password, and portfolio slug are required",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize values
    |--------------------------------------------------------------------------
    */

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedSlug = portfolioSlug
        .trim()
        .toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Validate portfolio slug
    |
    | Allowed:
    | - lowercase letters
    | - numbers
    | - hyphens
    |
    | Examples:
    | babatunde
    | john-doe
    | john-doe123
    |--------------------------------------------------------------------------
    */

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (!slugPattern.test(normalizedSlug)) {
        return res.status(400).json({
            message:
                "Portfolio slug can only contain lowercase letters, numbers, and single hyphens between words",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Check whether email already exists
    |--------------------------------------------------------------------------
    */

    const existingUser = await prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    if (existingUser) {
        return res.status(409).json({
            message: "User with this email already exists",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Check whether portfolio slug already exists
    |--------------------------------------------------------------------------
    */

    const existingSlug = await prisma.user.findUnique({
        where: {
            portfolioSlug: normalizedSlug,
        },
    });

    if (existingSlug) {
        return res.status(409).json({
            message: "This portfolio slug is already in use",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Hash password
    |--------------------------------------------------------------------------
    */

    const passwordHash = await bcrypt.hash(password, 10);

    /*
    |--------------------------------------------------------------------------
    | Create user
    |--------------------------------------------------------------------------
    */

    const user = await prisma.user.create({
        data: {
            name: normalizedName,
            email: normalizedEmail,
            passwordHash,
            portfolioSlug: normalizedSlug,
        },
    });

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
        message: "User created successfully",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            portfolioSlug: user.portfolioSlug,
        },
    });
} catch (error) {
    console.error("Error creating user:", error);

    /*
    |--------------------------------------------------------------------------
    | Handle Prisma unique constraint errors
    |--------------------------------------------------------------------------
    */

    if (error.code === "P2002") {
        const target = error.meta?.target;

        if (
            Array.isArray(target) &&
            target.includes("email")
        ) {
            return res.status(409).json({
                message: "A user with this email already exists",
            });
        }

        if (
            Array.isArray(target) &&
            target.includes("portfolioSlug")
        ) {
            return res.status(409).json({
                message:
                    "This portfolio slug is already in use",
            });
        }

        return res.status(409).json({
            message: "A unique field already exists",
        });
    }

    return res.status(500).json({
        message: "Failed to create user",
    });
}


};

module.exports = {
createUser,
};
