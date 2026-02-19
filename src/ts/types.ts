/**
 * Type definitions for jQuery SmartCart v4
 */

// Augment jQuery interface
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

// ============================================================================
// Core Types
// ============================================================================

export type CartTheme = 'default' | 'modern' | 'minimal' | 'dark' | 'glass' | string;
export type DisplayMode = 'auto' | 'dark' | 'light' | 'none';
export type SubmitType = 'form' | 'paypal' | 'ajax';
export type CheckoutButtonStyle = 'default' | 'paypal' | 'image';
export type AnimationEffect = 'highlight' | 'slide' | 'bounce' | 'none';
export type PersistenceMode = 'localStorage' | 'sessionStorage' | false;
export type CartPosition = 'sidebar' | 'inline' | 'floating';
/**
 * Controls what happens when "Add to Cart" is clicked for an item already in the cart.
 * - 'increase' — increases the quantity by 1 and keeps the button active (default)
 * - 'disable'  — marks the product container with `.sc-added-item` (button appears used)
 */
export type AddOnDuplicate = 'increase' | 'disable';

// ============================================================================
// Cart Item
// ============================================================================

/**
 * A cart item — the raw product data read from the DOM or provided programmatically
 */
export interface CartItem {
    /** Unique identifier */
    unique_key: number;
    /** Product price (string coerced from DOM) */
    [key: string]: unknown;
}

// ============================================================================
// Options Interfaces
// ============================================================================

export interface ParamSettings {
    /** HTML name attribute for the product price element */
    productPrice: string;
    /** HTML name attribute for the product quantity element */
    productQuantity: string;
    /** HTML name attribute for the product name element */
    productName: string;
    /** HTML name attribute for the product ID element */
    productId: string;
}

export interface Lang {
    cartTitle: string;
    checkout: string;
    clear: string;
    subtotal: string;
    cartRemove: string;
    cartEmpty: string;
    quantityDecrease: string;
    quantityIncrease: string;
}

export interface SubmitSettings {
    /** Submit mechanism: 'form' | 'paypal' | 'ajax' */
    submitType: SubmitType;
    /** URL for ajax submit */
    ajaxURL: string;
    /** Extra jQuery ajax settings */
    ajaxSettings: Record<string, unknown>;
}

export interface CurrencySettings {
    /** BCP 47 language tag, e.g. 'en-US' */
    locales: string;
    /** Options passed to Number.toLocaleString() */
    currencyOptions: Intl.NumberFormatOptions;
}

export interface ToolbarSettings {
    showToolbar: boolean;
    showCheckoutButton: boolean;
    showClearButton: boolean;
    showCartSummary: boolean;
    checkoutButtonStyle: CheckoutButtonStyle;
    /** URL of image for image-style checkout button */
    checkoutButtonImage: string;
    /** Extra jQuery elements appended to toolbar */
    toolbarExtraButtons: JQuery[];
}

/**
 * Full plugin options interface
 */
export interface CartOptions {
    /** Initial products to add on init */
    cart: CartItem[];
    /** Form field name for hidden cart data input */
    resultName: string;
    /** Theme name — matches a CSS theme file */
    theme: CartTheme;
    /** Display mode: 'auto' respects prefers-color-scheme */
    displayMode: DisplayMode;
    /** Whether to combine identical products (by all fields except qty/unique_key) */
    combineProducts: boolean;
    /** Highlight effect on adding/updating cart items */
    highlightEffect: boolean;
    /** Animation effect for item add/update */
    animationEffect: AnimationEffect;
    /** Persist cart state across page loads */
    persistence: PersistenceMode;
    /** Storage key for persisted cart data */
    storageKey: string;
    /** HTML template for cart item content */
    cartItemTemplate: string;
    /** Template for item quantity/price row */
    cartItemQtyTemplate: string;
    /** Show +/- stepper buttons instead of raw number input */
    quantityStepper: boolean;
    /**
     * Behaviour when "Add to Cart" is clicked for a product already in the cart.
     * - 'increase' — increases the item quantity by 1; button stays active (default)
     * - 'disable'  — adds `.sc-added-item` to the container (button becomes inactive)
     */
    addOnDuplicate: AddOnDuplicate;
    /** Selector for the product container element */
    productContainerSelector: string;
    /** Selector for product data elements within the container */
    productElementSelector: string;
    /** Selector for the "add to cart" trigger button */
    addCartSelector: string;
    /** Mapping of cart field names to HTML name attributes */
    paramSettings: ParamSettings;
    /** Localisation strings */
    lang: Lang;
    /** Form submit configuration */
    submitSettings: SubmitSettings;
    /** Currency formatting */
    currencySettings: CurrencySettings;
    /** Toolbar configuration */
    toolbarSettings: ToolbarSettings;
    /** Enable debug logging */
    debug: boolean;
}
