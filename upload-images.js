import 'dotenv/config';
import { BlobServiceClient } from '@azure/storage-blob';
import sharp from 'sharp';
import { create } from 'exif-parser';
import fg from 'fast-glob';
import { readFileSync, createReadStream } from 'fs';
import { relative } from 'path';

const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME
const IMAGE_DIR = './images'; // Local image directory

async function getMetadata(filePath) {
    const buffer = readFileSync(filePath);
    const image = sharp(buffer);
    const { autoOrient } = await image.metadata();

    // Dominant color
    const { dominant } = await image.stats();
    const toHex = c => c.toString(16).padStart(2, '0');
    const mainColor = `#${toHex(dominant.r)}${toHex(dominant.g)}${toHex(dominant.b)}`;

    // EXIF
    let title = '', date = '';
    try {
        const parser = create(buffer);
        const result = parser.parse();
        title = result.tags.ImageDescription || '';
        const timestamp = result.tags.DateTimeOriginal || '';
        date = timestamp ? new Date(timestamp * 1000).toISOString() : '';
    } catch { /* Skip if no EXIF */ }

    return {
        width: autoOrient.width?.toString() || '',
        height: autoOrient.height?.toString() || '',
        color: mainColor,
        title,
        date
    };
}

async function uploadImage(blobServiceClient, filePath) {
    const relativePath = relative(IMAGE_DIR, filePath).replace(/\\/g, '/');
    const blobName = relativePath;
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const metadata = await getMetadata(filePath);
    const uploadOptions = { metadata };

    const stream = createReadStream(filePath);
    await blockBlobClient.uploadStream(stream, undefined, undefined, uploadOptions);
    console.log(`Uploaded: ${blobName}`);
}

async function main() {
    if (!AZURE_CONNECTION_STRING || !CONTAINER_NAME) {
        console.error('Please set the AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER_NAME environment variables.');
        process.exit(1);
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
    const imagePaths = await fg([`${IMAGE_DIR}/**/*.{jpg,jpeg,png}`], { caseSensitiveMatch: false });

    for (const imagePath of imagePaths) {
        await uploadImage(blobServiceClient, imagePath);
    }
}

main().catch(console.error);
