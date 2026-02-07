import { basename, extname } from 'node:path';
import http, { IncomingMessage } from 'node:http';
import https from 'node:https';
import { isIP } from 'node:net';
import { put } from '@vercel/blob';
import { isPrivateIp, safeLookup } from './dns-lookup';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const MAX_DOWNLOAD_MS = 15000;
const MAX_DOWNLOAD_ATTEMPTS = 2;
const MATERIALS_BLOB_PREFIX = 'materials';

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function sanitizeFileSegment(value: string): string {
    return value
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase() || 'material';
}

export function isAllowedImageUrl(input: string): boolean {
    const normalized = normalizeImageUrl(input);
    if (!normalized) return false;

    let url: URL;
    try {
        url = new URL(normalized);
    } catch {
        return false;
    }

    if (url.protocol !== 'https:') return false;

    const hostname = url.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return false;

    if (isIP(hostname) && isPrivateIp(hostname)) return false;

    return true;
}

export function normalizeImageUrl(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('//')) return `https:${trimmed}`;

    try {
        // Check if it's already a valid absolute URL with a protocol
        const _ = new URL(trimmed);
        return trimmed;
    } catch {
        // If not, assume it's a domain/path and prepend https://
        return `https://${trimmed}`;
    }
}

export function buildMaterialImageObjectKey(teamId: number, code: string, extension: string): string {
    const safeCode = sanitizeFileSegment(code);
    const safeExt = ALLOWED_EXTENSIONS.has(extension) ? extension : '.jpg';
    const filename = basename(`${safeCode}${safeExt}`);
    return `${MATERIALS_BLOB_PREFIX}/${teamId}/${filename}`;
}

function getExtensionFromUrl(url: URL): string | null {
    const ext = extname(url.pathname).toLowerCase();
    if (!ext) return null;
    if (ALLOWED_EXTENSIONS.has(ext)) return ext;
    if (ext === '.jpeg') return '.jpg';
    return null;
}

function getExtensionFromContentType(contentType?: string | string[]): string | null {
    const normalized = Array.isArray(contentType) ? contentType[0] : contentType;
    if (!normalized) return null;
    const mediaType = normalized.split(';')[0]?.trim().toLowerCase();
    return mediaType ? CONTENT_TYPE_TO_EXT[mediaType] ?? null : null;
}

async function requestWithRedirect(url: URL, redirectCount = 0): Promise<IncomingMessage> {
    return await new Promise((resolve, reject) => {
        const client = url.protocol === 'https:' ? https : http;
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Smetalab/1.0',
                'Accept': 'image/*,*/*;q=0.8'
            },
            lookup: safeLookup
        }, (res) => {
            const status = res.statusCode ?? 0;
            if (status >= 300 && status < 400 && res.headers.location) {
                if (redirectCount >= MAX_REDIRECTS) {
                    res.resume();
                    reject(new Error('Слишком много редиректов'));
                    return;
                }
                const nextUrl = new URL(res.headers.location, url);
                if (!isAllowedImageUrl(nextUrl.toString())) {
                    res.resume();
                    reject(new Error('Редирект на запрещенный URL'));
                    return;
                }
                res.resume();
                requestWithRedirect(nextUrl, redirectCount + 1).then(resolve).catch(reject);
                return;
            }

            if (status !== 200) {
                res.resume();
                reject(new Error(`Не удалось скачать изображение: ${status}`));
                return;
            }

            resolve(res);
        });

        req.setTimeout(MAX_DOWNLOAD_MS, () => {
            req.destroy(new Error('Таймаут загрузки изображения'));
        });

        req.on('error', reject);
    });
}

function getBlobToken(): string {
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    if (!token) throw new Error('Vercel Blob не настроен: отсутствует BLOB_READ_WRITE_TOKEN');
    return token;
}

async function readResponseBuffer(response: IncomingMessage): Promise<Buffer> {
    return await new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        let downloadedBytes = 0;

        response.on('data', (chunk: Buffer) => {
            downloadedBytes += chunk.length;
            if (downloadedBytes > MAX_IMAGE_BYTES) {
                response.destroy(new Error('Изображение слишком большое'));
                reject(new Error('Изображение слишком большое'));
                return;
            }
            chunks.push(chunk);
        });

        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
    });
}

export async function downloadAndStoreMaterialImage(options: {
    teamId: number;
    code: string;
    imageUrl: string;
}): Promise<string | null> {
    const normalizedUrl = normalizeImageUrl(options.imageUrl);
    if (!normalizedUrl || !isAllowedImageUrl(normalizedUrl)) return null;

    const url = new URL(normalizedUrl);
    let response: IncomingMessage | null = null;

    for (let attempt = 1; attempt <= MAX_DOWNLOAD_ATTEMPTS; attempt++) {
        try {
            response = await requestWithRedirect(url);
            break;
        } catch (e) {
            if (attempt === MAX_DOWNLOAD_ATTEMPTS) throw e;
            await new Promise(resolve => setTimeout(resolve, 250 * attempt));
        }
    }

    if (!response) return null;

    const contentLength = Number(response.headers['content-length'] ?? 0);
    if (contentLength && contentLength > MAX_IMAGE_BYTES) {
        response.resume();
        throw new Error('Изображение слишком большое');
    }

    const extFromUrl = getExtensionFromUrl(url);
    const extFromType = getExtensionFromContentType(response.headers['content-type']);
    const extension = extFromUrl ?? extFromType ?? '.jpg';

    const key = buildMaterialImageObjectKey(options.teamId, options.code, extension);
    const buffer = await readResponseBuffer(response);
    const contentType = Array.isArray(response.headers['content-type']) ? response.headers['content-type'][0] : response.headers['content-type'];

    const { url: publicUrl } = await put(key, buffer, {
        access: 'public',
        contentType,
        token: getBlobToken(),
        cacheControlMaxAge: 31536000,
        addRandomSuffix: false
    });

    return publicUrl;
}

export function chunkArray<T>(items: T[], size: number): T[][] {
    if (size <= 0) return [items];
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        result.push(items.slice(i, i + size));
    }
    return result;
}