import 'dotenv/config';
import { BlobServiceClient } from '@azure/storage-blob';
import { writeFileSync, mkdirSync } from 'fs';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

async function main() {
    if (!connectionString || !containerName) {
        console.error('Please set the AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER_NAME environment variables.');
        process.exit(1);
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const images = [];

    for await (const blob of containerClient.listBlobsFlat()) {
        const blobClient = containerClient.getBlobClient(blob.name);
        const properties = await blobClient.getProperties();

        images.push({
            name: blob.name.split('/').pop(),
            album: `/${blob.name.split('/').slice(0, -1).join('/')}`,
            url: `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}/${blob.name}`,
            meta: properties.metadata || {},
        });
    }

    mkdirSync('data', { recursive: true });
    writeFileSync('data/images.json', JSON.stringify(images, null, 2));
}

main().catch(console.error);
