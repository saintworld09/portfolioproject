const express = require("express");
const cors = require("cors");

const projectRoutes = require("./routes/projectRoutes");
const projectInsightRoutes = require("./routes/projectInsightRoutes");
const projectRecommendationRoutes = require("./routes/projectRecommendationRoutes");
const profileRoutes = require("./routes/profileRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const userRoutes = require("./routes/userRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const educationRoutes = require("./routes/educationRoutes");
const certificationRoutes = require("./routes/certificationRoutes");
const skillRoutes = require("./routes/skillRoutes");
const accomplishmentRoutes = require("./routes/accomplishmentRoutes");
const socialLinkRoutes = require("./routes/socialLinkRoutes");
const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// STATIC UPLOADS
// ========================================

app.use(
    "/uploads",
    express.static("uploads")
);

// ========================================
// REQUEST LOGGER
// ========================================

app.use((req, res, next) => {
    console.log(
        "REQUEST:",
        req.method,
        req.originalUrl,
        "ORIGIN:",
        req.headers.origin
    );

    next();
});

// ========================================
// CORS
// ========================================

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
        res.header(
            "Access-Control-Allow-Origin",
            origin
        );

        res.header(
            "Access-Control-Allow-Methods",
            "GET,POST,PUT,DELETE,OPTIONS"
        );

        res.header(
            "Access-Control-Allow-Headers",
            "Content-Type,Authorization"
        );
    }

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// ========================================
// JSON BODY PARSER
// ========================================

app.use(express.json());

// ========================================
// API ROUTES
// ========================================

app.use("/api/projects", projectRoutes);
app.use("/api/projects", projectInsightRoutes);
app.use("/api/projects", projectRecommendationRoutes);

app.use("/api/profile", profileRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/users", userRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/education", educationRoutes);
app.use(
    "/api/certifications",
    certificationRoutes
);
app.use("/api/skills", skillRoutes);
app.use("/api/accomplishments", accomplishmentRoutes);
app.use("/api/social-links", socialLinkRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);

// ========================================
// ROOT ROUTE
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "Portfolio API is running",
    });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Server running on http://0.0.0.0:${PORT}`
    );
});