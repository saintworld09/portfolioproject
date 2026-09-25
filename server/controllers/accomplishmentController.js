const prisma = require("../prisma");

// ========================================
// CREATE ACCOMPLISHMENT
// ========================================

const createAccomplishment = async (req, res) => {
try {
const {
title,
description,
date,
url,
sortOrder,
} = req.body;


    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (!title || !title.trim()) {
        return res.status(400).json({
            message: "Accomplishment title is required",
        });
    }

    // ----------------------------------------
    // GET AUTHENTICATED USER
    // ----------------------------------------

    const userId = Number(req.user.id);

    // ----------------------------------------
    // CREATE ACCOMPLISHMENT
    // ----------------------------------------

    const accomplishment =
        await prisma.accomplishment.create({
            data: {
                title: title.trim(),

                description:
                    description || null,

                date: date
                    ? new Date(date)
                    : null,

                url:
                    url || null,

                sortOrder:
                    sortOrder !== undefined &&
                    sortOrder !== null &&
                    sortOrder !== ""
                        ? Number(sortOrder)
                        : 0,

                userId,
            },
        });

    res.status(201).json({
        message:
            "Accomplishment created successfully",
        accomplishment,
    });
} catch (error) {
    console.error(
        "Error creating accomplishment:",
        error
    );

    res.status(500).json({
        message:
            "Failed to create accomplishment",
    });
}


};

// ========================================
// GET ALL ACCOMPLISHMENTS
// ========================================

const getAccomplishments = async (req, res) => {
try {
const accomplishments =
await prisma.accomplishment.findMany({
orderBy: [
{
sortOrder: "asc",
},
{
date: "desc",
},
],
});


    res.status(200).json(
        accomplishments
    );
} catch (error) {
    console.error(
        "Error fetching accomplishments:",
        error
    );

    res.status(500).json({
        message:
            "Failed to fetch accomplishments",
    });
}


};

// ========================================
// UPDATE ACCOMPLISHMENT
// ========================================

const updateAccomplishment = async (req, res) => {
try {
const { id } = req.params;


    const {
        title,
        description,
        date,
        url,
        sortOrder,
    } = req.body;

    const accomplishmentId = Number(id);

    // ----------------------------------------
    // VALIDATE ID
    // ----------------------------------------

    if (
        Number.isNaN(accomplishmentId) ||
        accomplishmentId <= 0
    ) {
        return res.status(400).json({
            message:
                "Invalid accomplishment ID",
        });
    }

    // ----------------------------------------
    // GET AUTHENTICATED USER
    // ----------------------------------------

    const userId = Number(req.user.id);

    // ----------------------------------------
    // FIND ACCOMPLISHMENT
    // ----------------------------------------

    const existingAccomplishment =
        await prisma.accomplishment.findUnique({
            where: {
                id: accomplishmentId,
            },
        });

    if (!existingAccomplishment) {
        return res.status(404).json({
            message:
                "Accomplishment not found",
        });
    }

    // ----------------------------------------
    // OWNERSHIP CHECK
    // ----------------------------------------

    if (
        Number(
            existingAccomplishment.userId
        ) !== userId
    ) {
        return res.status(403).json({
            message:
                "You are not authorized to update this accomplishment",
        });
    }

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (!title || !title.trim()) {
        return res.status(400).json({
            message:
                "Accomplishment title is required",
        });
    }

    // ----------------------------------------
    // UPDATE ACCOMPLISHMENT
    // ----------------------------------------

    const updatedAccomplishment =
        await prisma.accomplishment.update({
            where: {
                id: accomplishmentId,
            },

            data: {
                title: title.trim(),

                description:
                    description || null,

                date: date
                    ? new Date(date)
                    : null,

                url:
                    url || null,

                sortOrder:
                    sortOrder !== undefined &&
                    sortOrder !== null &&
                    sortOrder !== ""
                        ? Number(sortOrder)
                        : 0,
            },
        });

    res.status(200).json({
        message:
            "Accomplishment updated successfully",
        accomplishment:
            updatedAccomplishment,
    });
} catch (error) {
    console.error(
        "Error updating accomplishment:",
        error
    );

    res.status(500).json({
        message:
            "Failed to update accomplishment",
    });
}


};

// ========================================
// DELETE ACCOMPLISHMENT
// ========================================

const deleteAccomplishment = async (req, res) => {
try {
const { id } = req.params;


    const accomplishmentId = Number(id);

    // ----------------------------------------
    // VALIDATE ID
    // ----------------------------------------

    if (
        Number.isNaN(accomplishmentId) ||
        accomplishmentId <= 0
    ) {
        return res.status(400).json({
            message:
                "Invalid accomplishment ID",
        });
    }

    // ----------------------------------------
    // GET AUTHENTICATED USER
    // ----------------------------------------

    const userId = Number(req.user.id);

    // ----------------------------------------
    // FIND ACCOMPLISHMENT
    // ----------------------------------------

    const existingAccomplishment =
        await prisma.accomplishment.findUnique({
            where: {
                id: accomplishmentId,
            },
        });

    if (!existingAccomplishment) {
        return res.status(404).json({
            message:
                "Accomplishment not found",
        });
    }

    // ----------------------------------------
    // OWNERSHIP CHECK
    // ----------------------------------------

    if (
        Number(
            existingAccomplishment.userId
        ) !== userId
    ) {
        return res.status(403).json({
            message:
                "You are not authorized to delete this accomplishment",
        });
    }

    // ----------------------------------------
    // DELETE ACCOMPLISHMENT
    // ----------------------------------------

    await prisma.accomplishment.delete({
        where: {
            id: accomplishmentId,
        },
    });

    res.status(200).json({
        message:
            "Accomplishment deleted successfully",
    });
} catch (error) {
    console.error(
        "Error deleting accomplishment:",
        error
    );

    res.status(500).json({
        message:
            "Failed to delete accomplishment",
    });
}


};

// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
createAccomplishment,
getAccomplishments,
updateAccomplishment,
deleteAccomplishment,
};
