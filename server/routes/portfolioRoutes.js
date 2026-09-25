const express = require("express");

const { resolvePortfolio } = require("../utils/portfolioResolver");

const router = express.Router();

/*                                                                         |
| -------------------------------------------------------------------------- |
| Resolve Portfolio                                                          |
| -------------------------------------------------------------------------- |
| GET /api/portfolio/:portfolioSlug                                          |
| -------------------------------------------------------------------------- |
| */                                                                        

router.get("/:portfolioSlug", async (req, res) => {
try {
const { portfolioSlug } = req.params;

    const user = await resolvePortfolio(portfolioSlug);

    if (!user) {
        return res.status(404).json({
            message: "Portfolio not found",
        });
    }

    return res.status(200).json({
        message: "Portfolio resolved successfully",
        portfolio: user,
    });
} catch (error) {
    console.error("Error resolving portfolio:", error);

    return res.status(500).json({
        message: "Failed to resolve portfolio",
    });
}


});

module.exports = router;
