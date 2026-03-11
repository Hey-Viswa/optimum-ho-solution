const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');

function getBlobExtension(originalName, mimeType) {
    const extFromName = path.extname(originalName || '').toLowerCase();
    if (extFromName) {
        return extFromName;
    }

    const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
    };

    return mimeToExt[mimeType] || '.jpg';
}

function buildBlobName(originalName, mimeType) {
    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 10);
    const ext = getBlobExtension(originalName, mimeType);
    return `ticket-${stamp}-${rand}${ext}`;
}

async function uploadBufferToBlob({ buffer, originalName, mimeType }) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'ticket-image';

    if (!connectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING is not configured.');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists({ access: 'blob' });

    const blobName = buildBlobName(originalName, mimeType);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
            blobContentType: mimeType || 'application/octet-stream',
        },
    });

    return {
        blobName,
        blobUrl: blockBlobClient.url,
    };
}

module.exports = {
    uploadBufferToBlob,
};
