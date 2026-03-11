const { getAllTickets, createTicket, updateTicketStatus, getStats } = require('../models/ticketStore');

const ALLOWED_STATUS = ['open', 'in_progress', 'resolved'];

function getTickets(req, res) {
    const { status, category, sort } = req.query;
    let tickets = [...getAllTickets()];

    if (status) {
        tickets = tickets.filter((ticket) => ticket.status === status);
    }

    if (category) {
        tickets = tickets.filter((ticket) => ticket.aiCategory === category);
    }

    // sort=severity → severityScore desc; no sort → createdAt desc
    const sortMap = { severity: 'severityScore' };
    const resolvedField = sort ? (sortMap[sort] || sort) : 'createdAt';
    const sortDirection = sort ? -1 : -1; // both cases descending

    const sortableFields = new Set(['severityScore', 'createdAt']);
    if (sortableFields.has(resolvedField)) {
        tickets.sort((a, b) => {
            if (resolvedField === 'createdAt') {
                return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }
            return (b[resolvedField] - a[resolvedField]);
        });
    }

    return res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets,
    });
}

function postTicket(req, res) {
    const { description, longitude, latitude } = req.body;
    const uploadedPhoto = req.file;
    const photoUrl =
        req.body.photoUrl ||
        (uploadedPhoto
            ? `https://example.com/uploads/${Date.now()}-${uploadedPhoto.originalname || 'issue.jpg'}`
            : undefined);

    if (!photoUrl || longitude === undefined || latitude === undefined) {
        return res.status(400).json({
            success: false,
            error: 'photo (or photoUrl), longitude, and latitude are required.',
        });
    }

    const parsedLongitude = Number(longitude);
    const parsedLatitude = Number(latitude);

    if (Number.isNaN(parsedLongitude) || Number.isNaN(parsedLatitude)) {
        return res.status(400).json({
            success: false,
            error: 'longitude and latitude must be valid numbers.',
        });
    }

    const ticket = createTicket({
        description,
        photoUrl,
        longitude: parsedLongitude,
        latitude: parsedLatitude,
    });

    return res.status(201).json({
        success: true,
        data: ticket,
    });
}

function patchTicketStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'status must be one of: open, in_progress, resolved.',
        });
    }

    const updated = updateTicketStatus(id, status);
    if (!updated) {
        return res.status(404).json({
            success: false,
            error: 'Ticket not found.',
        });
    }

    return res.status(200).json({
        success: true,
        data: updated,
    });
}

function getDashboardStats(req, res) {
    const stats = getStats();
    return res.status(200).json(stats);
}

module.exports = {
    getTickets,
    postTicket,
    patchTicketStatus,
    getDashboardStats,
};
