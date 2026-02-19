import type { CartItem, CurrencySettings } from './types';

/**
 * Format a number as a locale money string
 */
export function getMoneyFormatted(n: number | string, settings: CurrencySettings): string {
    const num = Number(n) || 0;
    return Number(num.toFixed(2)).toLocaleString(settings.locales, settings.currencyOptions);
}

/**
 * Get a unique key — combines timestamp with an incrementing counter to
 * guarantee uniqueness even when called within the same millisecond.
 */
let _uniqueCounter = 0;
export function getUniqueKey(): number {
    return Date.now() + (++_uniqueCounter);
}

/**
 * Simple mustache-style template formatter: replaces {key} with obj[key]
 */
export function formatTemplate(template: string, obj: Record<string, unknown>): string {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => {
        return obj[key] !== undefined ? String(obj[key]) : '';
    });
}

/**
 * Compare two cart items for equality (ignoring unique_key and productQuantity field)
 */
export function isObjectsEqual(
    o1: CartItem,
    o2: CartItem,
    productQuantityKey: string
): boolean {
    const keys1 = Object.getOwnPropertyNames(o1);
    const keys2 = Object.getOwnPropertyNames(o2);

    if (keys1.length !== keys2.length) return false;

    for (const p of keys1) {
        if (p === 'unique_key' || p === productQuantityKey) continue;
        if (o1[p] !== o2[p]) return false;
    }
    return true;
}

/**
 * Get the value of an element based on its type
 */
export function getContent(elm: JQuery): string {
    if (elm.is(':checkbox, :radio')) {
        return elm.is(':checked') ? (elm.val() as string) : '';
    } else if (elm.is('[value], select')) {
        return (elm.val() as string) ?? '';
    } else if (elm.is('img')) {
        return elm.attr('src') ?? '';
    } else {
        return elm.text();
    }
}

/**
 * Return value if truthy, else empty string
 */
export function getValueOrEmpty(v: unknown): string {
    return v !== undefined && v !== null && v !== '' ? String(v) : '';
}

/**
 * Validate that a value is a positive number
 */
export function getValidateNumber(n: unknown): boolean {
    const num = Number(n);
    return !isNaN(num) && num > 0;
}

/**
 * Apply display mode class to an element based on displayMode option and system preference
 */
export function applyDisplayMode(element: JQuery, mode: string): void {
    element.removeAttr('data-theme');
    if (mode === 'none') return;

    if (mode === 'auto') {
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        element.attr('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        element.attr('data-theme', mode);
    }
}
