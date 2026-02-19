/**
 * Jest unit tests for jQuery SmartCart v4
 */

// We use jsdom environment — jQuery works with it
const $ = require('jquery');
global.jQuery = $;
global.$ = $;

// Import utilities directly (these are pure functions)
const { getMoneyFormatted, getUniqueKey, formatTemplate, isObjectsEqual, getValidateNumber } = require('../src/ts/util');

describe('Utility: getMoneyFormatted', () => {
    const currencySettings = {
        locales: 'en-US',
        currencyOptions: { style: 'currency', currency: 'USD', currencyDisplay: 'symbol' },
    };

    test('formats integer price', () => {
        expect(getMoneyFormatted(50, currencySettings)).toBe('$50.00');
    });

    test('formats floating price', () => {
        expect(getMoneyFormatted(9.99, currencySettings)).toBe('$9.99');
    });

    test('formats string coercible to number', () => {
        expect(getMoneyFormatted('19.50', currencySettings)).toBe('$19.50');
    });

    test('handles 0', () => {
        expect(getMoneyFormatted(0, currencySettings)).toBe('$0.00');
    });
});

describe('Utility: getUniqueKey', () => {
    test('returns a number', () => {
        expect(typeof getUniqueKey()).toBe('number');
    });

    test('two calls return different values', () => {
        const a = getUniqueKey();
        const b = getUniqueKey();
        expect(a).not.toBe(b);
    });
});

describe('Utility: formatTemplate', () => {
    test('replaces single placeholder', () => {
        expect(formatTemplate('Hello {name}!', { name: 'World' })).toBe('Hello World!');
    });

    test('replaces multiple placeholders', () => {
        const result = formatTemplate('{qty} × {price}', { qty: 2, price: '$10.00' });
        expect(result).toBe('2 × $10.00');
    });

    test('replaces missing key with empty string', () => {
        expect(formatTemplate('{unknown}', {})).toBe('');
    });

    test('leaves non-placeholder text intact', () => {
        expect(formatTemplate('No placeholders here', {})).toBe('No placeholders here');
    });
});

describe('Utility: isObjectsEqual', () => {
    test('equal objects return true', () => {
        const a = { product_id: '1', product_price: '9.99', unique_key: 1000 };
        const b = { product_id: '1', product_price: '9.99', unique_key: 2000 };
        expect(isObjectsEqual(a, b, 'product_quantity')).toBe(true);
    });

    test('different product IDs return false', () => {
        const a = { product_id: '1', product_price: '9.99', unique_key: 1000 };
        const b = { product_id: '2', product_price: '9.99', unique_key: 1000 };
        expect(isObjectsEqual(a, b, 'product_quantity')).toBe(false);
    });

    test('ignores unique_key differences', () => {
        const a = { product_id: '1', unique_key: 111 };
        const b = { product_id: '1', unique_key: 999 };
        expect(isObjectsEqual(a, b, 'product_quantity')).toBe(true);
    });

    test('different number of keys returns false', () => {
        const a = { product_id: '1', product_price: '9.99', unique_key: 1 };
        const b = { product_id: '1', unique_key: 1 };
        expect(isObjectsEqual(a, b, 'product_quantity')).toBe(false);
    });
});

describe('Utility: getValidateNumber', () => {
    test('positive number returns true', () => {
        expect(getValidateNumber(5)).toBe(true);
    });

    test('zero returns false', () => {
        expect(getValidateNumber(0)).toBe(false);
    });

    test('negative returns false', () => {
        expect(getValidateNumber(-1)).toBe(false);
    });

    test('string numeric returns true', () => {
        expect(getValidateNumber('3')).toBe(true);
    });

    test('non-numeric string returns false', () => {
        expect(getValidateNumber('abc')).toBe(false);
    });
});
