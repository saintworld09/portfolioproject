const prisma = require("../prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =========================================================
// HELPER — CREATE PORTFOLIO SLUG
// =========================================================

const createPortfolioSlug = async (name) => {
    const baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    let slug = baseSlug || "portfolio";
    let counter = 1;

    while (true) {
        const existingUser = await prisma.user.findUnique({
            where: {
                portfolioSlug: slug,
            },
        });

        if (!existingUser) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
};


// =========================================================
// SIGNUP
// =========================================================

const signup = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
        } = req.body;

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }

        const trimmedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (trimmedName.length < 2) {
            return res.status(400).json({
                message: "Name must be at least 2 characters",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters",
            });
        }

        // -----------------------------------------------------
        // CHECK EXISTING EMAIL
        // -----------------------------------------------------

        const existingUser = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists",
            });
        }

        // -----------------------------------------------------
        // HASH PASSWORD
        // -----------------------------------------------------

        const passwordHash = await bcrypt.hash(
            password,
            10
        );

        // -----------------------------------------------------
        // CREATE PORTFOLIO SLUG
        // -----------------------------------------------------

        const portfolioSlug = await createPortfolioSlug(
            trimmedName
        );

        // -----------------------------------------------------
        // CREATE USER
        // -----------------------------------------------------

        const user = await prisma.user.create({
            data: {
                name: trimmedName,
                email: normalizedEmail,
                passwordHash,
                role: "ADMIN",
                portfolioSlug,
            },
        });

        // -----------------------------------------------------
        // CREATE JWT
        // -----------------------------------------------------

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return res.status(201).json({
            message: "Account created successfully",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                portfolioSlug: user.portfolioSlug,
            },
        });

    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            message: "Signup failed",
        });
    }
};


// =========================================================
// LOGIN
// =========================================================

const login = async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email
            .trim()
            .toLowerCase();

        // -----------------------------------------------------
        // FIND USER
        // -----------------------------------------------------

        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // -----------------------------------------------------
        // CHECK PASSWORD
        // -----------------------------------------------------

        const passwordMatch = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // -----------------------------------------------------
        // CREATE JWT
        // -----------------------------------------------------

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                portfolioSlug: user.portfolioSlug,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Login failed",
        });
    }
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
    signup,
    login,
};