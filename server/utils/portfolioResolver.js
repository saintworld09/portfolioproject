const prisma = require("../prisma");

 /*                                                                         |
| -------------------------------------------------------------------------- |
| Resolve Portfolio                                                          |
| -------------------------------------------------------------------------- |
| Finds the portfolio owner using the public portfolio slug.                 |
|                                                                            |
| Example:                                                                   |
| /portfolio/babatunde                                                       |
|                                                                            |
| returns the User whose portfolioSlug is "babatunde".                       |
| -------------------------------------------------------------------------- |
| */                                                                         

const resolvePortfolio = async (portfolioSlug) => {
if (!portfolioSlug) {
return null;
}


const normalizedSlug = portfolioSlug
    .trim()
    .toLowerCase();

if (!normalizedSlug) {
    return null;
}

const user = await prisma.user.findUnique({
    where: {
        portfolioSlug: normalizedSlug,
    },
    select: {
        id: true,
        name: true,
        email: true,
        role: true,
        portfolioSlug: true,
    },
});

return user;


};

module.exports = {
resolvePortfolio,
};
