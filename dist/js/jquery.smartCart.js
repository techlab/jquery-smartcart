/*!
 * jQuery SmartCart v3.0.1
 * The awesome jQuery Shopping Cart Plugin with PayPal payment support
 * http://www.techlaboratory.net/smartcart
 *
 * Created by Dipu Raj
 * http://dipuraj.me
 *
 * Licensed under the terms of the MIT License
 * https://github.com/techlab/SmartCart/blob/master/LICENSE
 */

;(function ($, window, document, undefined) {
    "use strict";
    // Default options

    var defaults = {
        cart: [], // initial products in cart
        resultName: 'cart_list',
        theme: 'default', // theme for the cart, related css need to include for other than default theme
        combineProducts: true, // combine similar products on cart
        highlightEffect: true, // highlight effect on adding/updating product in cart
        cartItemTemplate: '<img class="img-responsive pull-left" src="{product_image}" /><h4 class="list-group-item-heading">{product_name}</h4><p class="list-group-item-text">{product_desc}</p>',
        cartItemQtyTemplate: '{display_price} × {display_quantity} = {display_amount}',
        productContainerSelector: '.sc-product-item',
        productElementSelector: '*', // input, textarea, select, div, p
        addCartSelector: '.sc-add-to-cart',
        lang: { // Language variables
            checkout: 'Checkout',
            clear: 'Clear',
            subtotal: 'Subtotal:',
            cartRemove: '×'
        },

        submitType: 'form', // form, paypal, ajax
        ajaxURL: '', // remoteURL

        toolbarSettings: {
            showCheckoutButton: true,
            showClearButton: true,
            checkoutButtonStyle: 'default', // default, paypal
            toolbarPosition: 'bottom', // none, top, bottom, both
            toolbarButtonPosition: 'right', // left, right
            toolbarExtraButtons: [] // Extra buttons to show on toolbar, array of jQuery input/buttons elements
        },
        cartDeleteAnimation: '',
        debug: true
    };

    // The plugin constructor
    function SmartCart(element, options) {
        // Merge user settings with default, recursively
        this.options = $.extend(true, {}, defaults, options);
        // Cart array
        this.cart = [];
        // Cart element
        this.cart_element = $(element);
        this.cart_list_element = null;

        // Call initial method
        this.init();
    }

    $.extend(SmartCart.prototype, {

        init: function () {
            // Set the elements
            this._setElements();
            // Add toolbar
            this._setToolbar();
            // Assign plugin events
            this._setEvents();

            this._hasCartChange();
        },

        // PRIVATE FUNCTIONS

        _setElements: function () {
            this.cart_list_element = $('<input type="hidden" name="' + this.options.resultName + '" id="' + this.options.resultName + '" />');
            this.cart_element.append(this.cart_list_element);
            // Set the cart element
            this.cart_element.addClass('panel panel-default sc-cart sc-theme-' + this.options.theme);
            this.cart_element.append('<div class="panel-heading sc-cart-heading">Shopping Cart <span class="sc-cart-count badge">0</span></div>');
            this.cart_element.append('<div class="list-group sc-cart-item-list"></div>');
        },
        _setToolbar: function () {
            var toolbar = $('<div></div>').addClass('panel-footer');

            var btnCheckout = '';
            switch (this.options.toolbarSettings.checkoutButtonStyle) {
                case 'paypal':
                    btnCheckout = '<button class="sc-button-checkout-paypal sc-cart-checkout" type="submit"><img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/checkout-logo-medium.png" alt="Check out with PayPal" /></button>';
                    break;
                default:
                    btnCheckout = '<button class="btn btn-info sc-cart-checkout" type="button">' + this.options.lang.checkout + '</button> ';
                    break;
            }

            toolbar.append('<div class="sc-cart-summary">' + this.options.lang.subtotal + ' <span class="sc-cart-subtotal">0</span></div>');
            toolbar.append('<div class="sc-cart-toolbar">' + btnCheckout + ' <button class="btn btn-danger sc-cart-clear" type="button">' + this.options.lang.clear + '</button></div>');
            this.cart_element.append(toolbar);
            //this.cart_element.append('  <div class="btn-group2 navbar-btn sw-btn-group-extra" role="group">   </div></div> ');
        },
        _setEvents: function () {
            var mi = this;
            // Capture add to cart button events
            $(this.options.addCartSelector).on("click", function (e) {
                e.preventDefault();
                var p = mi._getProductDetails($(this));
                p = mi._addToCart(p);
                $(this).parents(mi.options.productContainerSelector).addClass('sc-added-item').attr('data-product-unique-key', p.unique_key);
            });

            $(this.cart_element).on("click", '.sc-cart-remove', function (e) {
                e.preventDefault();
                $(this).parents('.sc-cart-item').fadeOut("normal", function () {
                    mi._removeFromCart($(this).data('unique-key'));
                    $(this).remove();
                    mi._hasCartChange();
                });
            });

            $(this.cart_element).on("change", '.sc-cart-item-qty', function (e) {
                e.preventDefault();
                mi._updateCartQuantity($(this).parents('.sc-cart-item').data('unique-key'), $(this).val());
            });

            $(this.cart_element).on("click", '.sc-cart-checkout', function (e) {
                e.preventDefault();
                mi._submitCart();
            });

            $(this.cart_element).on("click", '.sc-cart-clear', function (e) {
                e.preventDefault();
                $('.sc-cart-item-list > .sc-cart-item', this.cart_element).fadeOut("normal", function () {
                    $(this).remove();
                    mi._clearCart();
                    mi._hasCartChange();
                });
            });
        },
        /* 
         * Get the parameters of a product by seaching elements with name attribute/data.
         * Product details will be return as an object
         */
        _getProductDetails: function (elm) {
            var mi = this;
            var p = {};
            elm.parents(this.options.productContainerSelector).find(this.options.productElementSelector).each(function () {
                if ($(this).is('[name]') === true || typeof $(this).data('name') !== typeof undefined) {
                    var key = $(this).attr('name') ? $(this).attr('name') : $(this).data('name');
                    var val = mi._getContent($(this)); // $(this).val() ? $(this).val() : $(this).text(); 
                    if (key && val) {
                        p[key] = val;
                    }
                }
            });
            return p;
        },
        _addToCart: function (p) {
            var mi = this;

            if (!p.hasOwnProperty('product_price')) {
                this._logMessage('Price is not set for the item');
                return false;
            }

            if (!p.hasOwnProperty('unique_key')) {
                p.unique_key = this._getUniqueKey();
            }

            if (!p.hasOwnProperty('product_quantity')) {
                p.product_quantity = 1;
            }

            if (this.options.combineProducts) {
                var pf = $.grep(this.cart, function (n, i) {
                    return mi._isObjectsEqual(n, p);
                });
                if (pf.length > 0) {
                    var idx = this.cart.indexOf(pf[0]);
                    this.cart[idx].product_quantity = this.cart[idx].product_quantity - 0 + (p.product_quantity - 0);
                    p = this.cart[idx];
                    // Trigger "itemUpdated" event
                    this._triggerEvent("itemUpdated", [p]);
                } else {
                    this.cart.push(p);
                    // Trigger "itemAdded" event
                    this._triggerEvent("itemAdded", [p]);
                }
            } else {
                this.cart.push(p);
                // Trigger "itemAdded" event
                this._triggerEvent("itemAdded", [p]);
            }

            this._addUpdateCartItem(p);
            return p;
        },
        _removeFromCart: function (unique_key) {
            var mi = this;
            $.each(this.cart, function (i, n) {
                if (n.unique_key === unique_key) {
                    var itemRemove = mi.cart[i];
                    mi.cart.splice(i, 1);
                    $('*[data-product-unique-key="' + unique_key + '"]').removeClass('sc-added-item');
                    mi._hasCartChange();

                    // Trigger "itemRemoved" event
                    this._triggerEvent("itemRemoved", [itemRemove]);
                    return false;
                }
            });
        },
        _clearCart: function () {
            this.cart = [];
            // Trigger "cartCleared" event
            this._triggerEvent("cartCleared");
            this._hasCartChange();
        },
        _updateCartQuantity: function (unique_key, qty) {
            var mi = this;
            var qv = this._getValidateNumber(qty);
            $.each(this.cart, function (i, n) {
                if (n.unique_key === unique_key) {
                    if (qv) {
                        mi.cart[i].product_quantity = qty;
                    }
                    mi._addUpdateCartItem(mi.cart[i]);
                    // Trigger "cartEmpty" event
                    this._triggerEvent("quantityUpdate", [mi.cart[i], qty]);
                    return false;
                }
            });
        },
        _addUpdateCartItem: function (p) {
            var product_amount = (p.product_quantity - 0) * (p.product_price - 0);
            var cartList = $('.sc-cart-item-list', this.cart_element);
            var elmMain = cartList.find("[data-unique-key='" + p.unique_key + "']");
            if (elmMain && elmMain.length > 0) {
                elmMain.find(".sc-cart-item-qty").val(p.product_quantity);
                elmMain.find(".sc-cart-item-amount").text(this._getMoneyFormatted(product_amount));
            } else {
                elmMain = $('<div></div>').addClass('sc-cart-item list-group-item');
                elmMain.append('<button type="button" class="sc-cart-remove">' + this.options.lang.cartRemove + '</button>');
                elmMain.attr('data-unique-key', p.unique_key);

                elmMain.append(this._formatTemplate(this.options.cartItemTemplate, p));

                var itemSummary = '<div class="sc-cart-item-summary"><span class="sc-cart-item-price">' + this._getMoneyFormatted(p.product_price) + '</span>';
                itemSummary += ' × <input type="number" min="1" max="1000" class="sc-cart-item-qty" value="' + this._getValueOrEmpty(p.product_quantity) + '" />';
                itemSummary += ' = <span class="sc-cart-item-amount">' + this._getMoneyFormatted(product_amount) + '</span></div>';

                elmMain.append(itemSummary);
                cartList.append(elmMain);
            }

            if (this.options.highlightEffect === true) {
                elmMain.addClass('sc-highlight');
                setTimeout(function () {
                    elmMain.removeClass('sc-highlight');
                }, 500);
            }

            this._hasCartChange();
        },
        _hasCartChange: function () {
            $('.sc-cart-count', this.cart_element).text(this.cart.length);
            $('.sc-cart-subtotal', this.element).text('' + this._getCartSubtotal());

            if (this.cart.length === 0) {
                $('.sc-cart-item-list', this.cart_element).empty().append($('<div class="sc-cart-empty-msg">Cart is Empty!<br />Choose your products</div>'));
                $(this.options.productContainerSelector).removeClass('sc-added-item');

                // Trigger "cartEmpty" event
                this._triggerEvent("cartEmpty");
            } else {
                $('.sc-cart-item-list > .sc-cart-empty-msg', this.cart_element).remove();
            }
            $('#' + this.options.resultName, this.cart_element).val(JSON.stringify(this.cart));
        },
        _getCartSubtotal: function () {
            var mi = this;
            var subtotal = 0;
            $.each(this.cart, function (i, p) {
                if (mi._getValidateNumber(p.product_price)) {
                    subtotal += (p.product_price - 0) * (p.product_quantity - 0);
                }
            });
            return this._getMoneyFormatted(subtotal);
        },
        _submitCart: function () {
            var mi = this;
            var formElm = this.cart_element.parents('form');
            if (this.options.submitType === 'ajax') {} else if (this.options.submitType === 'paypal') {
                if (formElm.length > 0) {
                    formElm.children('.sc-paypal-input').remove();
                    // Add paypal specific fields for cart products
                    $.each(this.cart, function (i, p) {
                        var itemNumber = i + 1;
                        formElm.append('<input class="sc-paypal-input" name="item_number_' + itemNumber + '" value="' + mi._getValueOrEmpty(p.product_id) + '" type="hidden">').append('<input class="sc-paypal-input" name="item_name_' + itemNumber + '" value="' + mi._getValueOrEmpty(p.product_name) + '" type="hidden">').append('<input class="sc-paypal-input" name="amount_' + itemNumber + '" value="' + mi._getValueOrEmpty(p.product_price) + '" type="hidden">').append('<input class="sc-paypal-input" name="quantity_' + itemNumber + '" value="' + mi._getValueOrEmpty(p.product_quantity) + '" type="hidden">');
                    });

                    formElm.submit();
                } else {
                    this._logMessage('Form not found to submit to paypal');
                }
            } else {
                if (formElm.length > 0) {
                    formElm.submit();
                } else {
                    this._logMessage('Form not found to submit');
                }
            }
            return true;
        },
        // HELPER FUNCTIONS

        _getContent: function (elm) {
            if (elm.is(":checkbox, :radio")) {
                return elm.is(":checked") ? elm.val() : '';
            } else if (elm.is("[value], select")) {
                return elm.val();
            } else if (elm.is("img")) {
                return elm.attr('src');
            } else {
                return elm.text();
            }
            return '';
        },
        _isObjectsEqual: function (o1, o2) {
            if (Object.getOwnPropertyNames(o1).length !== Object.getOwnPropertyNames(o2).length) {
                return false;
            }
            for (var p in o1) {
                if (p === 'unique_key' || p === 'product_quantity') {
                    continue;
                }
                if (typeof o1[p] === typeof undefined && typeof o2[p] === typeof undefined) {
                    continue;
                }
                if (o1[p] !== o2[p]) {
                    return false;
                }
            }
            return true;
        },
        _getMoneyFormatted: function (n) {
            n = n - 0;
            return Number(n.toFixed(2)).toLocaleString('en-US', { style: 'currency', currency: 'USD', currencyDisplay: 'symbol' });
        },
        _getValueOrEmpty: function (v) {
            return v && typeof v !== typeof undefined ? v : '';
        },
        _getValidateNumber: function (n) {
            n = n - 0;
            if (n && n > 0) {
                return true;
            }
            return false;
        },
        _formatTemplate: function (t, o) {
            var r = t.split("{"),
                fs = '';
            for (var i = 0; i < r.length; i++) {
                var vr = r[i].substring(0, r[i].indexOf("}"));
                if (vr.length > 0) {
                    fs += r[i].replace(vr + '}', this._getValueOrEmpty(o[vr]));
                } else {
                    fs += r[i];
                }
            }
            return fs;
        },
        _triggerEvent: function (name, params) {
            // Trigger an event
            var e = $.Event(name);
            this.cart_element.trigger(e, params);
            if (e.isDefaultPrevented()) {
                return false;
            }
            return e.result;
        },
        _getUniqueKey: function () {
            var d = new Date();
            return d.getTime();
        },
        _logMessage: function (msg) {
            if (this.options.debug !== true) {
                return false;
            }
            // Log message
            $.error(msg);
        },

        // PUBLIC FUNCTIONS

        theme: function (v) {
            if (this.options.theme === v) {
                return false;
            }
            this.cart_element.removeClass('sw-theme-' + this.options.theme);
            this.options.theme = v;
            this.cart_element.addClass('sw-theme-' + this.options.theme);
            // Trigger "themeChanged" event
            this._triggerEvent("themeChanged", [this.options.theme]);
        },
        reset: function () {
            // Trigger "beginReset" event
            if (this._triggerEvent("beginReset") === false) {
                return false;
            }

            // Reset all elements and classes
            this.container.stop(true);
            $(".sw-toolbar", this.cart_element).remove();
            this.steps.removeClass();
            this.steps.data('has-content', false);
            this.init();

            // Trigger "endReset" event
            this._triggerEvent("endReset");
        }
    });

    // Wrapper for the plugin
    $.fn.smartCart = function (options) {
        var args = arguments;
        var instance;

        if (options === undefined || typeof options === 'object') {
            return this.each(function () {
                if (!$.data(this, "smartCart")) {
                    $.data(this, "smartCart", new SmartCart(this, options));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            instance = $.data(this[0], 'smartCart');

            if (options === 'destroy') {
                $.data(this, 'smartCart', null);
            }

            if (instance instanceof SmartCart && typeof instance[options] === 'function') {
                return instance[options].apply(instance, Array.prototype.slice.call(args, 1));
            } else {
                return this;
            }
        }
    };
})(jQuery, window, document);