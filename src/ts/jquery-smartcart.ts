import { SmartCart } from './smart-cart';
import type { CartOptions } from './types';

// jQuery plugin augmentation
declare global {
    interface JQuery {
        smartCart(options?: Partial<CartOptions>): JQuery;
        smartCart(method: string, ...args: unknown[]): unknown;
    }

    interface JQueryStatic {
        smartCart: {
            defaults: CartOptions;
        };
    }
}

// Register jQuery plugin
(function ($) {
    // We cast to `any` here to satisfy the dual-signature jQuery plugin pattern;
    // the public overload signatures in types.ts enforce correct consumer usage.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ($.fn as any).smartCart = function (options?: Partial<CartOptions> | string, ...args: unknown[]): JQuery | unknown {
        if (options === undefined || typeof options === 'object') {
            // Initialize plugin
            return this.each(function (this: HTMLElement) {
                if (!$.data(this, 'smartCart')) {
                    $.data(this, 'smartCart', new SmartCart(this, options as Partial<CartOptions>));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            // Call a public method
            const instance = $.data(this[0], 'smartCart') as SmartCart;

            if (options === 'destroy') {
                $.data(this[0], 'smartCart', null);
                instance?.destroy();
                return this;
            }

            if (instance instanceof SmartCart && typeof (instance as unknown as Record<string, unknown>)[options] === 'function') {
                return (instance as unknown as Record<string, (...a: unknown[]) => unknown>)[options](...args);
            }
        }
        return this;
    };

    $.smartCart = {
        defaults: SmartCart.defaults,
    };
})(jQuery);
