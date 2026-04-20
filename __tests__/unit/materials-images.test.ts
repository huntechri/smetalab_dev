import { describe, it, expect } from 'vitest';
import { buildMaterialImageObjectKey, isAllowedImageUrl, chunkArray, normalizeImageUrl } from '@/lib/services/materials-image-storage';

describe('materials image storage', () => {
    it('should reject non-http protocols and local addresses', () => {
        expect(isAllowedImageUrl('file:///etc/passwd')).toBe(false);
        expect(isAllowedImageUrl('http://localhost:3000/image.png')).toBe(false);
        expect(isAllowedImageUrl('http://127.0.0.1/image.png')).toBe(false);
        expect(isAllowedImageUrl('http://192.168.0.10/image.png')).toBe(false);
    });

    it('should allow public https urls', () => {
        expect(isAllowedImageUrl('https://example.com/image.jpg')).toBe(true);
    });

    it('should normalize schemeless urls', () => {
        expect(normalizeImageUrl('example.com/img.png')).toBe('https://example.com/img.png');
        expect(normalizeImageUrl('//example.com/img.png')).toBe('https://example.com/img.png');
    });

    it('should build a safe object key', () => {
        const key = buildMaterialImageObjectKey(42, 'AC 12/3', '.png');
        expect(key).toBe('materials/42/ac-12-3.png');
    });

    it('should split array into chunks', () => {
        const chunks = chunkArray([1, 2, 3, 4, 5], 2);
        expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
    });
});