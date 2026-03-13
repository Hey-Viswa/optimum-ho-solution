const PHOTO_PLACEHOLDER_URL = 'https://picsum.photos/600/400';

function isValidHttpUrl(value) {
    if (!value || typeof value !== 'string') return false;
    try {
        const parsed = new URL(value.trim());
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

function normalizePhotoUrl(rawValue) {
    if (isValidHttpUrl(rawValue)) {
        return rawValue.trim();
    }

    if (typeof rawValue === 'string') {
        const trimmed = rawValue.trim();
        // Some malformed values miss the protocol but still contain the full Azure host.
        if (trimmed.includes('.blob.core.windows.net/')) {
            const withProtocol = `https://${trimmed.replace(/^https?:\/\//i, '')}`;
            if (isValidHttpUrl(withProtocol)) {
                return withProtocol;
            }
        }
    }

    return PHOTO_PLACEHOLDER_URL;
}

function sanitizeTicketPhoto(ticket) {
    if (!ticket || typeof ticket !== 'object') return ticket;
    ticket.photoUrl = normalizePhotoUrl(ticket.photoUrl);
    return ticket;
}

module.exports = {
    PHOTO_PLACEHOLDER_URL,
    isValidHttpUrl,
    normalizePhotoUrl,
    sanitizeTicketPhoto,
};
