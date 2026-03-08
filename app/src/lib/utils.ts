export function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export function parseFeeRange(feeRange: string): { min: number; max: number } {
    switch (feeRange) {
        case '0':
            return { min: 0, max: 0 };
        case '1-99':
            return { min: 1, max: 99 };
        case '100-199':
            return { min: 100, max: 199 };
        case '200+':
            return { min: 200, max: Infinity };
        default:
            return { min: 0, max: Infinity };
    }
}

export function parseBonusValue(value: string): number {
    // Extract numeric value from strings like "up to $150", "$200"
    const match = value.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (match) {
        return parseFloat(match[1].replace(',', ''));
    }
    return 0;
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}
