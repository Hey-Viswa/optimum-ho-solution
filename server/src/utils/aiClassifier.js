const axios = require('axios');

async function classifyImageFromUrl(photoUrl) {
    const baseUrl = process.env.FLASK_API_URL || process.env.AI_SERVICE_URL || 'http://localhost:5000';
    const endpoint = `${baseUrl.replace(/\/$/, '')}/classify`;

    const { data } = await axios.post(
        endpoint,
        { photoUrl },
        {
            timeout: 30000,
        }
    );

    return {
        category: data?.category,
        confidence: data?.confidence,
        severity: data?.severity,
    };
}

module.exports = {
    classifyImageFromUrl,
};
