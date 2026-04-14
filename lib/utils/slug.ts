/**
 * Generates a URL-safe slug from a string.
 * Supports Cyrillic transliteration for Russian text.
 *
 * Example: "Смета на черновые работы" → "smeta-na-chernovye-raboty"
 */

const cyrillicMap: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
    я: 'ya',
};

function transliterate(text: string): string {
    return text
        .split('')
        .map((char) => {
            const lower = char.toLowerCase();
            if (cyrillicMap[lower] !== undefined) {
                return cyrillicMap[lower];
            }
            return lower;
        })
        .join('');
}

export function generateSlug(name: string): string {
    const transliterated = transliterate(name.trim());

    return transliterated
        .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
        .replace(/\s+/g, '-')           // Replace spaces with hyphens
        .replace(/-+/g, '-')            // Collapse multiple hyphens
        .replace(/^-|-$/g, '')          // Trim leading/trailing hyphens
        .slice(0, 80);                  // Limit length
}

/**
 * Generates a unique slug by appending a short suffix if needed.
 * Used when inserting into the DB to handle potential collisions.
 */
export function generateUniqueSlug(name: string): string {
    const base = generateSlug(name);
    const suffix = Date.now().toString(36).slice(-4);
    return `${base}-${suffix}`;
}
