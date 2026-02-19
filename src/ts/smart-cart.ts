import $ from 'jquery';
import type { CartItem, CartOptions } from './types';
import { defaults } from './defaults';
import {
    getMoneyFormatted,
    getUniqueKey,
    formatTemplate,
    isObjectsEqual,
    getContent,
    getValueOrEmpty,
    getValidateNumber,
    applyDisplayMode,
} from './util';

/**
 * SmartCart v4 — jQuery Shopping Cart Plugin (TypeScript)
 */
export class SmartCart {
    static defaults: CartOptions = defaults;

    private options: CartOptions;
    private cart: CartItem[] = [];
    private cartElement: JQuery;

    constructor(element: HTMLElement, options?: Partial<CartOptions>) {
        this.options = $.extend(true, {}, defaults, options) as CartOptions;
        this.cartElement = $(element);
        this.init();
    }

    // =========================================================================
    // Initialization
    // =========================================================================

    private init(): void {
        this._loadPersistedCart();
        this._setElements();
        this._setToolbar();
        this._setDisplayMode();
        this._setEvents();

        // Add initial cart items defined in options
        for (const item of this.options.cart) {
            this._addToCart(item as CartItem);
        }

        this._syncCartUI();
    }

    // =========================================================================
    // Private: Setup
    // =========================================================================

    private _setElements(): void {
        // Hidden input to hold serialized cart for form submission
        const cartListElement = $('<input type="hidden">')
            .attr('name', this.options.resultName)
            .attr('id', this.options.resultName);
        this.cartElement.append(cartListElement);

        // Cart root classes
        this.cartElement.addClass('sc-cart sc-theme-' + this.options.theme);

        // Cart header
        this.cartElement.append(
            `<div class="sc-cart-heading">${this.options.lang.cartTitle} <span class="sc-cart-count badge">0</span></div>`
        );

        // Cart item list
        this.cartElement.append('<div class="sc-cart-item-list"></div>');
    }

    private _setToolbar(): void {
        if (!this.options.toolbarSettings.showToolbar) return;

        const toolbar = $('<div>').addClass('sc-toolbar');
        const buttonPanel = $('<div class="sc-cart-toolbar">');
        const summaryPanel = $('<div class="sc-cart-summary">');

        // Checkout button
        if (this.options.toolbarSettings.showCheckoutButton) {
            let btnCheckout = '';
            switch (this.options.toolbarSettings.checkoutButtonStyle) {
                case 'paypal':
                    btnCheckout = `<button class="sc-btn-checkout-paypal sc-cart-checkout" type="submit"><img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/checkout-logo-medium.png" alt="Check out with PayPal" /></button>`;
                    break;
                case 'image':
                    btnCheckout = `<button class="sc-btn-checkout-image sc-cart-checkout" type="submit"><img src="${this.options.toolbarSettings.checkoutButtonImage}" alt="Check out" /></button>`;
                    break;
                default:
                    btnCheckout = `<button class="sc-btn sc-btn-checkout sc-cart-checkout" type="button">${this.options.lang.checkout}</button>`;
                    break;
            }
            buttonPanel.append(btnCheckout);
        }

        // Clear button
        if (this.options.toolbarSettings.showClearButton) {
            const btnClear = $('<button class="sc-btn sc-btn-clear sc-cart-clear" type="button">').text(this.options.lang.clear);
            buttonPanel.append(btnClear);
        }

        // Extra buttons
        if (this.options.toolbarSettings.toolbarExtraButtons.length > 0) {
            buttonPanel.append(...this.options.toolbarSettings.toolbarExtraButtons);
        }

        // Cart summary / subtotal
        if (this.options.toolbarSettings.showCartSummary) {
            const panelSubTotal = $('<div class="sc-cart-summary-subtotal">');
            panelSubTotal.append(this.options.lang.subtotal).append(' <span class="sc-cart-subtotal">0</span>');
            summaryPanel.append(panelSubTotal);
        }

        toolbar.append(summaryPanel);
        toolbar.append(buttonPanel);
        this.cartElement.append(toolbar);
    }

    private _setDisplayMode(): void {
        applyDisplayMode(this.cartElement, this.options.displayMode);

        // Watch for system dark mode changes when displayMode is 'auto'
        if (this.options.displayMode === 'auto' && window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                applyDisplayMode(this.cartElement, 'auto');
            });
        }
    }

    private _setEvents(): void {
        // Add to cart click
        $(this.options.addCartSelector).on('click', (e) => {
            e.preventDefault();
            const btn = $(e.currentTarget);
            const container = btn.closest(this.options.productContainerSelector);

            // Check if this product is already in the cart
            const existingKey = Number(container.data('product-unique-key'));
            const isAlreadyAdded = container.hasClass('sc-added-item') && existingKey;

            if (isAlreadyAdded) {
                if (this.options.addOnDuplicate === 'increase') {
                    // Increase quantity by 1 and update the cart item
                    const idx = this.cart.findIndex(n => n.unique_key === existingKey);
                    if (idx !== -1) {
                        const qtyKey = this.options.paramSettings.productQuantity;
                        const currentQty = Number((this.cart[idx] as Record<string, unknown>)[qtyKey]) || 1;
                        (this.cart[idx] as Record<string, unknown>)[qtyKey] = currentQty + 1;
                        this._renderCartItem(this.cart[idx]);
                        this._persistCart();
                        this._triggerEvent('quantityUpdated', [this.cart[idx], currentQty + 1]);
                    }
                }
                // 'disable': do nothing — block the re-add entirely
                return;
            }

            // First-time add
            const p = this._getProductDetails(btn);
            const added = this._addToCart(p);
            if (added) {
                container
                    .addClass('sc-added-item')
                    .attr('data-product-unique-key', String(added.unique_key));
            }
        });



        // Remove item
        this.cartElement.on('click', '.sc-cart-remove', (e) => {
            e.preventDefault();
            const itemEl = $(e.currentTarget).closest('.sc-cart-item');
            const uniqueKey = Number(itemEl.data('unique-key'));
            const self = this;
            itemEl.fadeOut(400, function (this: HTMLElement) {
                $(this).remove();
                self._removeFromCart(uniqueKey);
                self._syncCartUI();
            });
        });

        // Quantity input change
        this.cartElement.on('change', '.sc-cart-item-qty', (e) => {
            e.preventDefault();
            const input = $(e.currentTarget);
            const uniqueKey = Number(input.closest('.sc-cart-item').data('unique-key'));
            this._updateCartQuantity(uniqueKey, input.val() as string);
        });

        // Quantity stepper: decrease
        this.cartElement.on('click', '.sc-qty-decrease', (e) => {
            e.preventDefault();
            const input = $(e.currentTarget).siblings('.sc-cart-item-qty');
            const uniqueKey = Number(input.closest('.sc-cart-item').data('unique-key'));
            const current = parseInt(input.val() as string, 10);
            const newQty = current - 1;
            if (newQty > 0) {
                input.val(newQty);
                this._updateCartQuantity(uniqueKey, String(newQty));
            } else {
                // Remove when quantity reaches 0 via stepper
                const itemEl = input.closest('.sc-cart-item');
                const self2 = this;
                itemEl.fadeOut(400, function (this: HTMLElement) {
                    $(this).remove();
                    self2._removeFromCart(uniqueKey);
                    self2._syncCartUI();
                });
            }
        });

        // Quantity stepper: increase
        this.cartElement.on('click', '.sc-qty-increase', (e) => {
            e.preventDefault();
            const input = $(e.currentTarget).siblings('.sc-cart-item-qty');
            const uniqueKey = Number(input.closest('.sc-cart-item').data('unique-key'));
            const current = parseInt(input.val() as string, 10);
            const newQty = current + 1;
            input.val(newQty);
            this._updateCartQuantity(uniqueKey, String(newQty));
        });

        // Checkout
        this.cartElement.on('click', '.sc-cart-checkout', (e) => {
            if ($(e.currentTarget).hasClass('disabled')) return;
            e.preventDefault();
            this._submitCart();
        });

        // Clear cart
        this.cartElement.on('click', '.sc-cart-clear', (e) => {
            if ($(e.currentTarget).hasClass('disabled')) return;
            e.preventDefault();
            this.cartElement.find('.sc-cart-item-list > .sc-cart-item').fadeOut(400, function (this: HTMLElement) {
                $(this).remove();
            });
            this._clearCart();
            this._syncCartUI();
        });
    }

    // =========================================================================
    // Private: Cart Operations
    // =========================================================================

    private _getProductDetails(btn: JQuery): CartItem {
        const p: Record<string, unknown> = {};
        btn.closest(this.options.productContainerSelector)
            .find(this.options.productElementSelector)
            .each((_, el) => {
                const elem = $(el);
                const hasName = elem.is('[name]');
                const hasDataName = typeof elem.data('name') !== 'undefined';
                if (hasName || hasDataName) {
                    const key = elem.attr('name') ?? (elem.data('name') as string);
                    const val = getContent(elem);
                    if (key && val) {
                        p[key] = val;
                    }
                }
            });
        return p as unknown as CartItem;
    }

    private _addToCart(p: CartItem): CartItem | false {
        const priceKey = this.options.paramSettings.productPrice;
        const qtyKey = this.options.paramSettings.productQuantity;

        if (!Object.prototype.hasOwnProperty.call(p, priceKey)) {
            this._logError('Price is not set for the item');
            return false;
        }

        if (!Object.prototype.hasOwnProperty.call(p, qtyKey)) {
            this._logMessage('Quantity not found, defaulting to 1');
            (p as Record<string, unknown>)[qtyKey] = 1;
        }

        if (!p.unique_key) {
            p.unique_key = getUniqueKey();
        }

        if (this.options.combineProducts) {
            const existing = this.cart.find(n => isObjectsEqual(n, p, qtyKey));
            if (existing) {
                const idx = this.cart.indexOf(existing);
                const newQty = (Number(this.cart[idx][qtyKey]) || 0) + (Number(p[qtyKey]) || 0);
                (this.cart[idx] as Record<string, unknown>)[qtyKey] = newQty;
                p = this.cart[idx];
                this._triggerEvent('itemUpdated', [p]);
            } else {
                this.cart.push(p);
                this._triggerEvent('itemAdded', [p]);
            }
        } else {
            this.cart.push(p);
            this._triggerEvent('itemAdded', [p]);
        }

        this._renderCartItem(p);
        this._persistCart();
        return p;
    }

    private _removeFromCart(uniqueKey: number): void {
        const idx = this.cart.findIndex(n => n.unique_key === uniqueKey);
        if (idx === -1) return;

        const removed = this.cart[idx];
        this.cart.splice(idx, 1);
        $(`*[data-product-unique-key="${uniqueKey}"]`).removeClass('sc-added-item');
        this._persistCart();
        this._triggerEvent('itemRemoved', [removed]);
    }

    private _clearCart(): void {
        this.cart = [];
        this._persistCart();
        this._triggerEvent('cartCleared', []);
    }

    private _updateCartQuantity(uniqueKey: number, qty: string): void {
        const idx = this.cart.findIndex(n => n.unique_key === uniqueKey);
        if (idx === -1) return;

        if (getValidateNumber(qty)) {
            (this.cart[idx] as Record<string, unknown>)[this.options.paramSettings.productQuantity] = qty;
        }

        this._renderCartItem(this.cart[idx]);
        this._persistCart();
        this._triggerEvent('quantityUpdated', [this.cart[idx], qty]);
    }

    // =========================================================================
    // Private: UI Rendering
    // =========================================================================

    private _renderCartItem(p: CartItem): void {
        const pRec = p as Record<string, unknown>;
        const priceKey = this.options.paramSettings.productPrice;
        const qtyKey = this.options.paramSettings.productQuantity;

        const qty = Number(pRec[qtyKey] ?? 0);
        const price = Number(pRec[priceKey] ?? 0);
        const amount = qty * price;

        const cartList = this.cartElement.find('.sc-cart-item-list');
        let itemEl = cartList.find(`[data-unique-key="${p.unique_key}"]`);

        if (itemEl.length > 0) {
            // Update existing item
            itemEl.find('.sc-cart-item-qty').val(qty);
            itemEl.find('.sc-cart-item-amount').text(getMoneyFormatted(amount, this.options.currencySettings));
        } else {
            // Create new item element
            itemEl = $('<div>').addClass('sc-cart-item').attr('data-unique-key', p.unique_key);

            // Remove button
            itemEl.append(`<button type="button" class="sc-cart-remove" title="Remove">${this.options.lang.cartRemove}</button>`);

            // Item content from template
            const templateData: Record<string, unknown> = {
                ...pRec,
                display_price: getMoneyFormatted(price, this.options.currencySettings),
                display_quantity: qty,
                display_amount: getMoneyFormatted(amount, this.options.currencySettings),
            };
            itemEl.append(formatTemplate(this.options.cartItemTemplate, templateData));

            // Quantity + price summary
            const qtyControl = this.options.quantityStepper
                ? `<button type="button" class="sc-qty-btn sc-qty-decrease">${this.options.lang.quantityDecrease}</button>
                   <input type="number" min="1" max="9999" class="sc-cart-item-qty" value="${getValueOrEmpty(pRec[qtyKey])}" />
                   <button type="button" class="sc-qty-btn sc-qty-increase">${this.options.lang.quantityIncrease}</button>`
                : `<input type="number" min="1" max="9999" class="sc-cart-item-qty" value="${getValueOrEmpty(pRec[qtyKey])}" />`;

            const itemSummary = `<div class="sc-cart-item-summary">
                <span class="sc-cart-item-price">${getMoneyFormatted(price, this.options.currencySettings)}</span>
                <span class="sc-cart-item-qty-wrap">${qtyControl}</span>
                = <span class="sc-cart-item-amount">${getMoneyFormatted(amount, this.options.currencySettings)}</span>
            </div>`;

            itemEl.append(itemSummary);
            cartList.append(itemEl);
        }

        // Apply animation effect
        this._applyAnimation(itemEl);
        this._syncCartUI();
    }

    private _applyAnimation(itemEl: JQuery): void {
        const effect = this.options.animationEffect;
        if (effect === 'none') return;

        // Remove all animation classes first
        itemEl.removeClass('sc-anim-highlight sc-anim-bounce sc-anim-slide');

        if (effect === 'highlight') {
            itemEl.addClass('sc-anim-highlight');
            setTimeout(() => itemEl.removeClass('sc-anim-highlight'), 600);
        } else if (effect === 'bounce') {
            itemEl.addClass('sc-anim-bounce');
            setTimeout(() => itemEl.removeClass('sc-anim-bounce'), 600);
        } else if (effect === 'slide') {
            itemEl.hide().slideDown(300);
        }
    }

    private _syncCartUI(): void {
        // Update count badge
        this.cartElement.find('.sc-cart-count').text(this.cart.length);

        // Update subtotal
        this.cartElement.find('.sc-cart-subtotal').text(this._getCartSubtotal());

        if (this.cart.length === 0) {
            this.cartElement.find('.sc-cart-item-list')
                .empty()
                .append(`<div class="sc-cart-empty-msg">${this.options.lang.cartEmpty}</div>`);

            $(this.options.productContainerSelector).removeClass('sc-added-item');
            this.cartElement.find('.sc-cart-checkout, .sc-cart-clear').addClass('disabled');
            this._triggerEvent('cartEmpty', []);
        } else {
            this.cartElement.find('.sc-cart-item-list > .sc-cart-empty-msg').remove();
            this.cartElement.find('.sc-cart-checkout, .sc-cart-clear').removeClass('disabled');
        }

        // Update hidden cart state input
        this.cartElement.find(`#${this.options.resultName}`).val(JSON.stringify(this.cart));
    }

    private _getCartSubtotal(): string {
        const priceKey = this.options.paramSettings.productPrice;
        const qtyKey = this.options.paramSettings.productQuantity;
        const subtotal = this.cart.reduce((sum, p) => {
            const pRec = p as Record<string, unknown>;
            if (getValidateNumber(pRec[priceKey])) {
                return sum + Number(pRec[priceKey]) * Number(pRec[qtyKey]);
            }
            return sum;
        }, 0);
        return getMoneyFormatted(subtotal, this.options.currencySettings);
    }

    private _submitCart(): void {
        const formEl = this.cartElement.closest('form');
        if (!formEl.length) {
            this._logError('Form not found to submit');
            return;
        }

        switch (this.options.submitSettings.submitType) {
            case 'ajax': {
                const ajaxURL = this.options.submitSettings.ajaxURL || formEl.attr('action') || '';
                const ajaxSettings = $.extend(true, {}, {
                    url: ajaxURL,
                    type: 'POST',
                    data: formEl.serialize(),
                    beforeSend: () => {
                        this.cartElement.addClass('sc-loading');
                    },
                    error: (_jqXHR: JQuery.jqXHR, _status: string, message: string) => {
                        this.cartElement.removeClass('sc-loading');
                        this._logError(message);
                    },
                    success: () => {
                        this.cartElement.removeClass('sc-loading');
                        this._triggerEvent('cartSubmitted', [this.cart]);
                        this._clearCart();
                        this._syncCartUI();
                    },
                }, this.options.submitSettings.ajaxSettings);
                $.ajax(ajaxSettings as JQuery.AjaxSettings);
                break;
            }
            case 'paypal': {
                formEl.find('.sc-paypal-input').remove();
                const priceKey = this.options.paramSettings.productPrice;
                const qtyKey = this.options.paramSettings.productQuantity;
                const nameKey = this.options.paramSettings.productName;
                const idKey = this.options.paramSettings.productId;
                this.cart.forEach((p, i) => {
                    const pRec = p as Record<string, unknown>;
                    const n = i + 1;
                    formEl.append(`<input class="sc-paypal-input" name="item_number_${n}" value="${getValueOrEmpty(pRec[idKey])}" type="hidden">`)
                        .append(`<input class="sc-paypal-input" name="item_name_${n}" value="${getValueOrEmpty(pRec[nameKey])}" type="hidden">`)
                        .append(`<input class="sc-paypal-input" name="amount_${n}" value="${getValueOrEmpty(pRec[priceKey])}" type="hidden">`)
                        .append(`<input class="sc-paypal-input" name="quantity_${n}" value="${getValueOrEmpty(pRec[qtyKey])}" type="hidden">`);
                });
                (formEl[0] as HTMLFormElement).submit();
                this._triggerEvent('cartSubmitted', [this.cart]);
                break;
            }
            default:
                (formEl[0] as HTMLFormElement).submit();
                this._triggerEvent('cartSubmitted', [this.cart]);
                break;
        }
    }

    // =========================================================================
    // Private: Persistence
    // =========================================================================

    private _persistCart(): void {
        if (!this.options.persistence) return;
        try {
            const storage = this.options.persistence === 'sessionStorage' ? sessionStorage : localStorage;
            storage.setItem(this.options.storageKey, JSON.stringify(this.cart));
        } catch {
            this._logMessage('Could not persist cart to storage');
        }
    }

    private _loadPersistedCart(): void {
        if (!this.options.persistence) return;
        try {
            const storage = this.options.persistence === 'sessionStorage' ? sessionStorage : localStorage;
            const raw = storage.getItem(this.options.storageKey);
            if (raw) {
                this.cart = JSON.parse(raw) as CartItem[];
            }
        } catch {
            this._logMessage('Could not load persisted cart from storage');
        }
    }

    // =========================================================================
    // Private: Event Helpers
    // =========================================================================

    private _triggerEvent(name: string, params: unknown[]): boolean {
        const e = $.Event(name);
        this.cartElement.trigger(e, params);
        if (e.isDefaultPrevented()) return false;
        return true;
    }

    private _logMessage(msg: string): void {
        if (!this.options.debug) return;
        console.log('[SmartCart]', msg);
    }

    private _logError(msg: string): void {
        if (!this.options.debug) return;
        console.error('[SmartCart]', msg);
    }

    // =========================================================================
    // Public API
    // =========================================================================

    /** Programmatically submit the cart */
    submit(): void {
        this._submitCart();
    }

    /** Programmatically clear all items from the cart */
    clear(): void {
        this._clearCart();
        this.cartElement.find('.sc-cart-item-list > .sc-cart-item').remove();
        this._syncCartUI();
    }

    /** Get a copy of the current cart items */
    getCart(): CartItem[] {
        return [...this.cart];
    }

    /** Programmatically add an item to the cart */
    addItem(item: CartItem): CartItem | false {
        return this._addToCart(item);
    }

    /** Programmatically remove an item by its unique_key */
    removeItem(uniqueKey: number): void {
        const self = this;
        this.cartElement.find(`[data-unique-key="${uniqueKey}"]`).fadeOut(400, function (this: HTMLElement) {
            $(this).remove();
            self._removeFromCart(uniqueKey);
            self._syncCartUI();
        });
    }

    /** Update the theme at runtime */
    setTheme(theme: string): void {
        this.cartElement.removeClass((_, cls) =>
            cls.split(' ').filter(c => c.startsWith('sc-theme-')).join(' ')
        );
        this.cartElement.addClass('sc-theme-' + theme);
        this.options.theme = theme;
    }

    /** Update the display mode at runtime */
    setDisplayMode(mode: string): void {
        this.options.displayMode = mode as CartOptions['displayMode'];
        applyDisplayMode(this.cartElement, mode);
    }

    /** Destroy the cart instance and clean up events */
    destroy(): void {
        this.cartElement.off();
        $(this.options.addCartSelector).off('click');
        this.cartElement.empty().removeClass();
    }
}
