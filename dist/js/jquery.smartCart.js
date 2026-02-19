
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery')) :
    typeof define === 'function' && define.amd ? define(['exports', 'jquery'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.smartCart = {}, global.jQuery));
})(this, (function (exports, $) { 'use strict';

    const defaults = {
        cart: [], // Initial products to add on load
        resultName: 'cart_list', // Name attribute of hidden input containing serialized cart
        theme: 'default', // Theme name — ensure related CSS theme file is included
        displayMode: 'auto', // Display mode: 'auto' | 'dark' | 'light' | 'none'
        combineProducts: true, // Combine duplicate products in cart
        highlightEffect: true, // Flash highlight when item is added/updated
        animationEffect: 'highlight', // 'highlight' | 'slide' | 'bounce' | 'none'
        persistence: false, // Persist cart across page loads: 'localStorage' | 'sessionStorage' | false
        storageKey: 'jquery-smartcart', // Storage key for persisted state
        cartItemTemplate: '<img class="sc-item-img" src="{product_image}" /><h4 class="sc-item-heading">{product_name}</h4><p class="sc-item-desc">{product_desc}</p>',
        cartItemQtyTemplate: '{display_price} × {display_quantity} = {display_amount}',
        quantityStepper: true, // Show +/- buttons for quantity
        addOnDuplicate: 'increase', // 'increase' = add qty on re-click | 'disable' = mark button as used
        productContainerSelector: '.sc-product-item',
        productElementSelector: '*',
        addCartSelector: '.sc-add-to-cart',
        paramSettings: {
            productPrice: 'product_price',
            productQuantity: 'product_quantity',
            productName: 'product_name',
            productId: 'product_id',
        },
        lang: {
            cartTitle: 'Shopping Cart',
            checkout: 'Checkout',
            clear: 'Clear',
            subtotal: 'Subtotal:',
            cartRemove: '×',
            cartEmpty: 'Cart is Empty!<br />Choose your products',
            quantityDecrease: '−',
            quantityIncrease: '+',
        },
        submitSettings: {
            submitType: 'form',
            ajaxURL: '',
            ajaxSettings: {},
        },
        currencySettings: {
            locales: 'en-US',
            currencyOptions: {
                style: 'currency',
                currency: 'USD',
                currencyDisplay: 'symbol',
            },
        },
        toolbarSettings: {
            showToolbar: true,
            showCheckoutButton: true,
            showClearButton: true,
            showCartSummary: true,
            checkoutButtonStyle: 'default',
            checkoutButtonImage: '',
            toolbarExtraButtons: [],
        },
        debug: false,
    };

    /**
     * Format a number as a locale money string
     */
    function getMoneyFormatted(n, settings) {
        const num = Number(n) || 0;
        return Number(num.toFixed(2)).toLocaleString(settings.locales, settings.currencyOptions);
    }
    /**
     * Get a unique key — combines timestamp with an incrementing counter to
     * guarantee uniqueness even when called within the same millisecond.
     */
    let _uniqueCounter = 0;
    function getUniqueKey() {
        return Date.now() + (++_uniqueCounter);
    }
    /**
     * Simple mustache-style template formatter: replaces {key} with obj[key]
     */
    function formatTemplate(template, obj) {
        return template.replace(/\{(\w+)\}/g, (_, key) => {
            return obj[key] !== undefined ? String(obj[key]) : '';
        });
    }
    /**
     * Compare two cart items for equality (ignoring unique_key and productQuantity field)
     */
    function isObjectsEqual(o1, o2, productQuantityKey) {
        const keys1 = Object.getOwnPropertyNames(o1);
        const keys2 = Object.getOwnPropertyNames(o2);
        if (keys1.length !== keys2.length)
            return false;
        for (const p of keys1) {
            if (p === 'unique_key' || p === productQuantityKey)
                continue;
            if (o1[p] !== o2[p])
                return false;
        }
        return true;
    }
    /**
     * Get the value of an element based on its type
     */
    function getContent(elm) {
        if (elm.is(':checkbox, :radio')) {
            return elm.is(':checked') ? elm.val() : '';
        }
        else if (elm.is('[value], select')) {
            return elm.val() ?? '';
        }
        else if (elm.is('img')) {
            return elm.attr('src') ?? '';
        }
        else {
            return elm.text();
        }
    }
    /**
     * Return value if truthy, else empty string
     */
    function getValueOrEmpty(v) {
        return v !== undefined && v !== null && v !== '' ? String(v) : '';
    }
    /**
     * Validate that a value is a positive number
     */
    function getValidateNumber(n) {
        const num = Number(n);
        return !isNaN(num) && num > 0;
    }
    /**
     * Apply display mode class to an element based on displayMode option and system preference
     */
    function applyDisplayMode(element, mode) {
        element.removeAttr('data-theme');
        if (mode === 'none')
            return;
        if (mode === 'auto') {
            const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
            element.attr('data-theme', prefersDark ? 'dark' : 'light');
        }
        else {
            element.attr('data-theme', mode);
        }
    }

    /**
     * SmartCart v4 — jQuery Shopping Cart Plugin (TypeScript)
     */
    class SmartCart {
        constructor(element, options) {
            Object.defineProperty(this, "options", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            Object.defineProperty(this, "cart", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: []
            });
            Object.defineProperty(this, "cartElement", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            this.options = $.extend(true, {}, defaults, options);
            this.cartElement = $(element);
            this.init();
        }
        // =========================================================================
        // Initialization
        // =========================================================================
        init() {
            this._loadPersistedCart();
            this._setElements();
            this._setToolbar();
            this._setDisplayMode();
            this._setEvents();
            // Add initial cart items defined in options
            for (const item of this.options.cart) {
                this._addToCart(item);
            }
            this._syncCartUI();
        }
        // =========================================================================
        // Private: Setup
        // =========================================================================
        _setElements() {
            // Hidden input to hold serialized cart for form submission
            const cartListElement = $('<input type="hidden">')
                .attr('name', this.options.resultName)
                .attr('id', this.options.resultName);
            this.cartElement.append(cartListElement);
            // Cart root classes
            this.cartElement.addClass('sc-cart sc-theme-' + this.options.theme);
            // Cart header
            this.cartElement.append(`<div class="sc-cart-heading">${this.options.lang.cartTitle} <span class="sc-cart-count badge">0</span></div>`);
            // Cart item list
            this.cartElement.append('<div class="sc-cart-item-list"></div>');
        }
        _setToolbar() {
            if (!this.options.toolbarSettings.showToolbar)
                return;
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
        _setDisplayMode() {
            applyDisplayMode(this.cartElement, this.options.displayMode);
            // Watch for system dark mode changes when displayMode is 'auto'
            if (this.options.displayMode === 'auto' && window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                    applyDisplayMode(this.cartElement, 'auto');
                });
            }
        }
        _setEvents() {
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
                            const currentQty = Number(this.cart[idx][qtyKey]) || 1;
                            this.cart[idx][qtyKey] = currentQty + 1;
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
                itemEl.fadeOut(400, function () {
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
                this._updateCartQuantity(uniqueKey, input.val());
            });
            // Quantity stepper: decrease
            this.cartElement.on('click', '.sc-qty-decrease', (e) => {
                e.preventDefault();
                const input = $(e.currentTarget).siblings('.sc-cart-item-qty');
                const uniqueKey = Number(input.closest('.sc-cart-item').data('unique-key'));
                const current = parseInt(input.val(), 10);
                const newQty = current - 1;
                if (newQty > 0) {
                    input.val(newQty);
                    this._updateCartQuantity(uniqueKey, String(newQty));
                }
                else {
                    // Remove when quantity reaches 0 via stepper
                    const itemEl = input.closest('.sc-cart-item');
                    const self2 = this;
                    itemEl.fadeOut(400, function () {
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
                const current = parseInt(input.val(), 10);
                const newQty = current + 1;
                input.val(newQty);
                this._updateCartQuantity(uniqueKey, String(newQty));
            });
            // Checkout
            this.cartElement.on('click', '.sc-cart-checkout', (e) => {
                if ($(e.currentTarget).hasClass('disabled'))
                    return;
                e.preventDefault();
                this._submitCart();
            });
            // Clear cart
            this.cartElement.on('click', '.sc-cart-clear', (e) => {
                if ($(e.currentTarget).hasClass('disabled'))
                    return;
                e.preventDefault();
                this.cartElement.find('.sc-cart-item-list > .sc-cart-item').fadeOut(400, function () {
                    $(this).remove();
                });
                this._clearCart();
                this._syncCartUI();
            });
        }
        // =========================================================================
        // Private: Cart Operations
        // =========================================================================
        _getProductDetails(btn) {
            const p = {};
            btn.closest(this.options.productContainerSelector)
                .find(this.options.productElementSelector)
                .each((_, el) => {
                const elem = $(el);
                const hasName = elem.is('[name]');
                const hasDataName = typeof elem.data('name') !== 'undefined';
                if (hasName || hasDataName) {
                    const key = elem.attr('name') ?? elem.data('name');
                    const val = getContent(elem);
                    if (key && val) {
                        p[key] = val;
                    }
                }
            });
            return p;
        }
        _addToCart(p) {
            const priceKey = this.options.paramSettings.productPrice;
            const qtyKey = this.options.paramSettings.productQuantity;
            if (!Object.prototype.hasOwnProperty.call(p, priceKey)) {
                this._logError('Price is not set for the item');
                return false;
            }
            if (!Object.prototype.hasOwnProperty.call(p, qtyKey)) {
                this._logMessage('Quantity not found, defaulting to 1');
                p[qtyKey] = 1;
            }
            if (!p.unique_key) {
                p.unique_key = getUniqueKey();
            }
            if (this.options.combineProducts) {
                const existing = this.cart.find(n => isObjectsEqual(n, p, qtyKey));
                if (existing) {
                    const idx = this.cart.indexOf(existing);
                    const newQty = (Number(this.cart[idx][qtyKey]) || 0) + (Number(p[qtyKey]) || 0);
                    this.cart[idx][qtyKey] = newQty;
                    p = this.cart[idx];
                    this._triggerEvent('itemUpdated', [p]);
                }
                else {
                    this.cart.push(p);
                    this._triggerEvent('itemAdded', [p]);
                }
            }
            else {
                this.cart.push(p);
                this._triggerEvent('itemAdded', [p]);
            }
            this._renderCartItem(p);
            this._persistCart();
            return p;
        }
        _removeFromCart(uniqueKey) {
            const idx = this.cart.findIndex(n => n.unique_key === uniqueKey);
            if (idx === -1)
                return;
            const removed = this.cart[idx];
            this.cart.splice(idx, 1);
            $(`*[data-product-unique-key="${uniqueKey}"]`).removeClass('sc-added-item');
            this._persistCart();
            this._triggerEvent('itemRemoved', [removed]);
        }
        _clearCart() {
            this.cart = [];
            this._persistCart();
            this._triggerEvent('cartCleared', []);
        }
        _updateCartQuantity(uniqueKey, qty) {
            const idx = this.cart.findIndex(n => n.unique_key === uniqueKey);
            if (idx === -1)
                return;
            if (getValidateNumber(qty)) {
                this.cart[idx][this.options.paramSettings.productQuantity] = qty;
            }
            this._renderCartItem(this.cart[idx]);
            this._persistCart();
            this._triggerEvent('quantityUpdated', [this.cart[idx], qty]);
        }
        // =========================================================================
        // Private: UI Rendering
        // =========================================================================
        _renderCartItem(p) {
            const pRec = p;
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
            }
            else {
                // Create new item element
                itemEl = $('<div>').addClass('sc-cart-item').attr('data-unique-key', p.unique_key);
                // Remove button
                itemEl.append(`<button type="button" class="sc-cart-remove" title="Remove">${this.options.lang.cartRemove}</button>`);
                // Item content from template
                const templateData = {
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
        _applyAnimation(itemEl) {
            const effect = this.options.animationEffect;
            if (effect === 'none')
                return;
            // Remove all animation classes first
            itemEl.removeClass('sc-anim-highlight sc-anim-bounce sc-anim-slide');
            if (effect === 'highlight') {
                itemEl.addClass('sc-anim-highlight');
                setTimeout(() => itemEl.removeClass('sc-anim-highlight'), 600);
            }
            else if (effect === 'bounce') {
                itemEl.addClass('sc-anim-bounce');
                setTimeout(() => itemEl.removeClass('sc-anim-bounce'), 600);
            }
            else if (effect === 'slide') {
                itemEl.hide().slideDown(300);
            }
        }
        _syncCartUI() {
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
            }
            else {
                this.cartElement.find('.sc-cart-item-list > .sc-cart-empty-msg').remove();
                this.cartElement.find('.sc-cart-checkout, .sc-cart-clear').removeClass('disabled');
            }
            // Update hidden cart state input
            this.cartElement.find(`#${this.options.resultName}`).val(JSON.stringify(this.cart));
        }
        _getCartSubtotal() {
            const priceKey = this.options.paramSettings.productPrice;
            const qtyKey = this.options.paramSettings.productQuantity;
            const subtotal = this.cart.reduce((sum, p) => {
                const pRec = p;
                if (getValidateNumber(pRec[priceKey])) {
                    return sum + Number(pRec[priceKey]) * Number(pRec[qtyKey]);
                }
                return sum;
            }, 0);
            return getMoneyFormatted(subtotal, this.options.currencySettings);
        }
        _submitCart() {
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
                        error: (_jqXHR, _status, message) => {
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
                    $.ajax(ajaxSettings);
                    break;
                }
                case 'paypal': {
                    formEl.find('.sc-paypal-input').remove();
                    const priceKey = this.options.paramSettings.productPrice;
                    const qtyKey = this.options.paramSettings.productQuantity;
                    const nameKey = this.options.paramSettings.productName;
                    const idKey = this.options.paramSettings.productId;
                    this.cart.forEach((p, i) => {
                        const pRec = p;
                        const n = i + 1;
                        formEl.append(`<input class="sc-paypal-input" name="item_number_${n}" value="${getValueOrEmpty(pRec[idKey])}" type="hidden">`)
                            .append(`<input class="sc-paypal-input" name="item_name_${n}" value="${getValueOrEmpty(pRec[nameKey])}" type="hidden">`)
                            .append(`<input class="sc-paypal-input" name="amount_${n}" value="${getValueOrEmpty(pRec[priceKey])}" type="hidden">`)
                            .append(`<input class="sc-paypal-input" name="quantity_${n}" value="${getValueOrEmpty(pRec[qtyKey])}" type="hidden">`);
                    });
                    formEl[0].submit();
                    this._triggerEvent('cartSubmitted', [this.cart]);
                    break;
                }
                default:
                    formEl[0].submit();
                    this._triggerEvent('cartSubmitted', [this.cart]);
                    break;
            }
        }
        // =========================================================================
        // Private: Persistence
        // =========================================================================
        _persistCart() {
            if (!this.options.persistence)
                return;
            try {
                const storage = this.options.persistence === 'sessionStorage' ? sessionStorage : localStorage;
                storage.setItem(this.options.storageKey, JSON.stringify(this.cart));
            }
            catch {
                this._logMessage('Could not persist cart to storage');
            }
        }
        _loadPersistedCart() {
            if (!this.options.persistence)
                return;
            try {
                const storage = this.options.persistence === 'sessionStorage' ? sessionStorage : localStorage;
                const raw = storage.getItem(this.options.storageKey);
                if (raw) {
                    this.cart = JSON.parse(raw);
                }
            }
            catch {
                this._logMessage('Could not load persisted cart from storage');
            }
        }
        // =========================================================================
        // Private: Event Helpers
        // =========================================================================
        _triggerEvent(name, params) {
            const e = $.Event(name);
            this.cartElement.trigger(e, params);
            if (e.isDefaultPrevented())
                return false;
            return true;
        }
        _logMessage(msg) {
            if (!this.options.debug)
                return;
            console.log('[SmartCart]', msg);
        }
        _logError(msg) {
            if (!this.options.debug)
                return;
            console.error('[SmartCart]', msg);
        }
        // =========================================================================
        // Public API
        // =========================================================================
        /** Programmatically submit the cart */
        submit() {
            this._submitCart();
        }
        /** Programmatically clear all items from the cart */
        clear() {
            this._clearCart();
            this.cartElement.find('.sc-cart-item-list > .sc-cart-item').remove();
            this._syncCartUI();
        }
        /** Get a copy of the current cart items */
        getCart() {
            return [...this.cart];
        }
        /** Programmatically add an item to the cart */
        addItem(item) {
            return this._addToCart(item);
        }
        /** Programmatically remove an item by its unique_key */
        removeItem(uniqueKey) {
            const self = this;
            this.cartElement.find(`[data-unique-key="${uniqueKey}"]`).fadeOut(400, function () {
                $(this).remove();
                self._removeFromCart(uniqueKey);
                self._syncCartUI();
            });
        }
        /** Update the theme at runtime */
        setTheme(theme) {
            this.cartElement.removeClass((_, cls) => cls.split(' ').filter(c => c.startsWith('sc-theme-')).join(' '));
            this.cartElement.addClass('sc-theme-' + theme);
            this.options.theme = theme;
        }
        /** Update the display mode at runtime */
        setDisplayMode(mode) {
            this.options.displayMode = mode;
            applyDisplayMode(this.cartElement, mode);
        }
        /** Destroy the cart instance and clean up events */
        destroy() {
            this.cartElement.off();
            $(this.options.addCartSelector).off('click');
            this.cartElement.empty().removeClass();
        }
    }
    Object.defineProperty(SmartCart, "defaults", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: defaults
    });

    // Register jQuery plugin
    (function ($) {
        // We cast to `any` here to satisfy the dual-signature jQuery plugin pattern;
        // the public overload signatures in types.ts enforce correct consumer usage.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $.fn.smartCart = function (options, ...args) {
            if (options === undefined || typeof options === 'object') {
                // Initialize plugin
                return this.each(function () {
                    if (!$.data(this, 'smartCart')) {
                        $.data(this, 'smartCart', new SmartCart(this, options));
                    }
                });
            }
            else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
                // Call a public method
                const instance = $.data(this[0], 'smartCart');
                if (options === 'destroy') {
                    $.data(this[0], 'smartCart', null);
                    instance?.destroy();
                    return this;
                }
                if (instance instanceof SmartCart && typeof instance[options] === 'function') {
                    return instance[options](...args);
                }
            }
            return this;
        };
        $.smartCart = {
            defaults: SmartCart.defaults,
        };
    })(jQuery);

    exports.SmartCart = SmartCart;

}));
