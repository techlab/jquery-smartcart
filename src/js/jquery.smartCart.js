/*!
 * jQuery SmartCart v3.0.1-beta
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
            paramSettings : { // Map the paramters
                productPrice: 'product_price',
                productQuantity: 'product_quantity',
                productName: 'product_name',
                productId: 'product_id',
            },
            lang: {  // Language variables
                checkout: 'Checkout',
                clear: 'Clear',
                subtotal: 'Subtotal:',
                cartRemove:'×',
                cartEmpty: 'Cart is Empty!<br />Choose your products'
            },
            submitSettings: {
                submitType: 'form', // form, paypal, ajax
                ajaxURL: '', // Ajax submit URL
                ajaxSettings: {} // Ajax extra settings for submit call
            },
            currencySettings: {
                locales: 'en-US', // A string with a BCP 47 language tag, or an array of such strings
                currencyOptions:  {
                    style: 'currency', 
                    currency: 'USD', 
                    currencyDisplay: 'symbol'
                  } // extra settings for the currency formatter. Refer: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
            },
            toolbarSettings: {
                showToolbar: true,
                showCheckoutButton: true,
                showClearButton: true,
                showCartSummary:true,
                checkoutButtonStyle: 'default', // default, paypal, image
                checkoutButtonImage: '', // image for the checkout button
                toolbarExtraButtons: [] // Extra buttons to show on toolbar, array of jQuery input/buttons elements
            },
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
            // Call UI sync
            this._hasCartChange();
        },

// PRIVATE FUNCTIONS

        _setElements: function () {
            var cartListElement = $('<input type="hidden" name="' + this.options.resultName + '" id="' + this.options.resultName + '" />');
            this.cart_element.append(cartListElement);
            // Set the cart element
            this.cart_element.addClass('panel panel-default sc-cart sc-theme-' + this.options.theme);
            this.cart_element.append('<div class="panel-heading sc-cart-heading">Shopping Cart <span class="sc-cart-count badge">0</span></div>');
            this.cart_element.append('<div class="list-group sc-cart-item-list"></div>');
        },
        _setToolbar: function () {
            if(this.options.toolbarSettings.showToolbar !== true) { return false; }
            
            var toolbar = $('<div></div>').addClass('panel-footer');
            var toolbarButtonPanel = $('<div class="sc-cart-toolbar">');
            var toolbarSummaryPanel = $('<div class="sc-cart-summary">');
            
            // Checkout Button
            if(this.options.toolbarSettings.showCheckoutButton){
                var btnCheckout = '';
                switch(this.options.toolbarSettings.checkoutButtonStyle){
                    case 'paypal':
                        btnCheckout = '<button class="sc-button-checkout-paypal sc-cart-checkout" type="submit"><img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/checkout-logo-medium.png" alt="Check out with PayPal" /></button>'; 
                        break;
                    case 'image':
                        btnCheckout = '<button class="sc-button-checkout-paypal sc-cart-checkout" type="submit"><img src="'+this.options.toolbarSettings.checkoutButtonImage+'" alt="Check out" /></button>'; 
                        break;    
                    default:
                        btnCheckout = '<button class="btn btn-info sc-cart-checkout" type="button">' + this.options.lang.checkout + '</button> ';
                        break;
                }
                toolbarButtonPanel.append(btnCheckout);
            }
            
            // Clear Button
            if(this.options.toolbarSettings.showClearButton){
                var btnClear = $('<button class="btn btn-danger sc-cart-clear" type="button">').text(this.options.lang.clear);
                toolbarButtonPanel.append(btnClear);
            }
            
            // Add extra toolbar buttons
            if(this.options.toolbarSettings.toolbarExtraButtons && this.options.toolbarSettings.toolbarExtraButtons.length > 0){
                toolbarButtonPanel.append(this.options.toolbarSettings.toolbarExtraButtons);
            }
            
            // Cart Summary
            if(this.options.toolbarSettings.showCartSummary){
                var panelSubTotal = $('<div class="sc-cart-summary-subtotal">');
                panelSubTotal.append(this.options.lang.subtotal).append(' <span class="sc-cart-subtotal">0</span>');
                toolbarSummaryPanel.append(panelSubTotal);
            }
            
            toolbar.append(toolbarSummaryPanel);
            toolbar.append(toolbarButtonPanel);
            this.cart_element.append(toolbar);
        },
        _setEvents: function () {
            var mi = this;
            // Capture add to cart button events
            $(this.options.addCartSelector).on( "click", function(e) {
                e.preventDefault();
                var p = mi._getProductDetails($(this));
                p = mi._addToCart(p);
                $(this).parents(mi.options.productContainerSelector).addClass('sc-added-item').attr('data-product-unique-key', p.unique_key);
            });
            
            $(this.cart_element).on( "click", '.sc-cart-remove', function(e) {
                e.preventDefault();
                $(this).parents('.sc-cart-item').fadeOut( "normal", function() {
                    mi._removeFromCart($(this).data('unique-key'));
                    $(this).remove();
                    mi._hasCartChange();
                });
            });
            
            $(this.cart_element).on( "change", '.sc-cart-item-qty', function(e) {
                e.preventDefault();
                mi._updateCartQuantity($(this).parents('.sc-cart-item').data('unique-key'), $(this).val());
            });
            
            $(this.cart_element).on( "click", '.sc-cart-checkout', function(e) {
                if($(this).hasClass('disabled')) { return false; }
                e.preventDefault();
                mi._submitCart();
            });
            
            $(this.cart_element).on( "click", '.sc-cart-clear', function(e) {
                if($(this).hasClass('disabled')) { return false; }
                e.preventDefault();
                $('.sc-cart-item-list > .sc-cart-item', this.cart_element).fadeOut( "normal", function() {
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
            elm.parents(this.options.productContainerSelector)
                .find(this.options.productElementSelector)
                .each(function() {
                    if ($(this).is('[name]') === true || typeof $(this).data('name') !== typeof undefined) {
                        var key = $(this).attr('name') ? $(this).attr('name') : $(this).data('name'); 
                        var val = mi._getContent($(this)); // $(this).val() ? $(this).val() : $(this).text(); 
                        if(key && val){
                            p[key] = val;    
                        }
                    }
                });
            return p;
        },
        _addToCart: function (p) {
            var mi = this;
            
            if (!p.hasOwnProperty(this.options.paramSettings.productPrice)) {
                this._logError('Price is not set for the item');
                return false;
            }
            
            if (!p.hasOwnProperty(this.options.paramSettings.productQuantity)) {
                this._logMessage('Quantity not found, default to 1');
                p[this.options.paramSettings.productQuantity] = 1;
            }
            
            if (!p.hasOwnProperty('unique_key')) {
                p.unique_key =  this._getUniqueKey();
            }
            
            if(this.options.combineProducts){
                var pf = $.grep(this.cart, function(n, i){
                    return mi._isObjectsEqual(n, p);
                });
                if(pf.length > 0){
                    var idx = this.cart.indexOf(pf[0]);
                    this.cart[idx][this.options.paramSettings.productQuantity] = (this.cart[idx][this.options.paramSettings.productQuantity] - 0) + (p[this.options.paramSettings.productQuantity] - 0);  
                    p = this.cart[idx];
                    // Trigger "itemUpdated" event
                    this._triggerEvent("itemUpdated", [p]);
                }else{
                    this.cart.push(p); 
                    // Trigger "itemAdded" event
                    this._triggerEvent("itemAdded", [p]);
                }
            }else{
                this.cart.push(p);
                // Trigger "itemAdded" event
                this._triggerEvent("itemAdded", [p]);
            }
            
            this._addUpdateCartItem(p);
            return p;
        },
        _removeFromCart: function (unique_key) {
            var mi = this;
            $.each( this.cart, function( i, n ) {
                if(n.unique_key === unique_key){
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
            $.each( this.cart, function( i, n ) {
                if(n.unique_key === unique_key){
                    if(qv){
                        mi.cart[i][this.options.paramSettings.productQuantity] = qty;   
                    }
                    mi._addUpdateCartItem(mi.cart[i]);
                    // Trigger "cartEmpty" event
                    this._triggerEvent("quantityUpdate", [mi.cart[i], qty]);
                    return false;
                }
            });
        },
        _addUpdateCartItem: function (p) {
            var productAmount = (p[this.options.paramSettings.productQuantity] - 0) * (p[this.options.paramSettings.productPrice] - 0);
            var cartList = $('.sc-cart-item-list',this.cart_element); 
            var elmMain = cartList.find("[data-unique-key='" + p.unique_key + "']");
            if(elmMain && elmMain.length > 0){
                elmMain.find(".sc-cart-item-qty").val(p[this.options.paramSettings.productQuantity]);
                elmMain.find(".sc-cart-item-amount").text(this._getMoneyFormatted(productAmount));
            }else{
                elmMain = $('<div></div>').addClass('sc-cart-item list-group-item');   
                elmMain.append('<button type="button" class="sc-cart-remove">' + this.options.lang.cartRemove + '</button>');
                elmMain.attr('data-unique-key', p.unique_key);
                
                elmMain.append(this._formatTemplate(this.options.cartItemTemplate, p));
                
                var itemSummary = '<div class="sc-cart-item-summary"><span class="sc-cart-item-price">' + this._getMoneyFormatted(p[this.options.paramSettings.productPrice]) + '</span>';
                itemSummary += ' × <input type="number" min="1" max="1000" class="sc-cart-item-qty" value="' + this._getValueOrEmpty(p[this.options.paramSettings.productQuantity]) + '" />';
                itemSummary += ' = <span class="sc-cart-item-amount">' + this._getMoneyFormatted(productAmount) + '</span></div>';
                
                elmMain.append(itemSummary);
                cartList.append(elmMain);
            }
            
            if(this.options.highlightEffect === true){
                elmMain.addClass('sc-highlight');
                setTimeout(function() {
                    elmMain.removeClass('sc-highlight');
                },500);                
            }
            
            this._hasCartChange();
        },
        _hasCartChange: function () {
            $('.sc-cart-count',this.cart_element).text(this.cart.length);
            $('.sc-cart-subtotal',this.element).text( '' + this._getCartSubtotal());
            
            if(this.cart.length === 0){
                $('.sc-cart-item-list',this.cart_element).empty().append($('<div class="sc-cart-empty-msg">' + this.options.lang.cartEmpty + '</div>'));
                $(this.options.productContainerSelector).removeClass('sc-added-item');
                $('.sc-cart-checkout, .sc-cart-clear').addClass('disabled');
                
                // Trigger "cartEmpty" event
                this._triggerEvent("cartEmpty");
            }else{
                $('.sc-cart-item-list > .sc-cart-empty-msg',this.cart_element).remove();
                $('.sc-cart-checkout, .sc-cart-clear').removeClass('disabled');
            }
            $('#' + this.options.resultName, this.cart_element).val(JSON.stringify(this.cart));
        },
        _getCartSubtotal: function () {
            var mi = this;
            var subtotal = 0;
            $.each(this.cart, function( i, p ) {   
                if(mi._getValidateNumber(p[mi.options.paramSettings.productPrice])){
                    subtotal += (p[mi.options.paramSettings.productPrice] - 0) * (p[mi.options.paramSettings.productQuantity] - 0);
                }
            });
            return this._getMoneyFormatted(subtotal);
        },
        _submitCart: function () {
            var mi = this;
            var formElm = this.cart_element.parents('form');
            if(!formElm){
                this._logError( 'Form not found to submit' ); 
                return false;
            }
            
            switch(this.options.submitSettings.submitType){
                case 'ajax':
                    var ajaxURL = (this.options.submitSettings.ajaxURL && this.options.submitSettings.ajaxURL.length > 0) ? this.options.submitSettings.ajaxURL : formElm.attr( 'action' );

                    var ajaxSettings = $.extend(true, {}, {
                        url: ajaxURL,
                        type: "POST",
                        data: formElm.serialize(),
                        beforeSend: function(){
                            mi.cart_element.addClass('loading');
                        },
                        error: function(jqXHR, status, message){
                            mi.cart_element.removeClass('loading');
                            mi._logError(message);
                        },
                        success: function(res){
                            mi.cart_element.removeClass('loading');
                            mi._triggerEvent("cartSubmitted", [mi.cart]);
                            mi._clearCart();
                        }
                    }, this.options.submitSettings.ajaxSettings);

                    $.ajax(ajaxSettings);
                
                    break;
                case 'paypal':
                    formElm.children('.sc-paypal-input').remove();
                    // Add paypal specific fields for cart products
                    $.each(this.cart, function( i, p ) {   
                        var itemNumber = i + 1;
                        formElm.append('<input class="sc-paypal-input" name="item_number_' + itemNumber + '" value="' + mi._getValueOrEmpty(p[this.options.paramSettings.productId]) + '" type="hidden">')
                               .append('<input class="sc-paypal-input" name="item_name_' + itemNumber + '" value="' + mi._getValueOrEmpty(p[this.options.paramSettings.productName]) + '" type="hidden">')
                               .append('<input class="sc-paypal-input" name="amount_' + itemNumber + '" value="' + mi._getValueOrEmpty(p[this.options.paramSettings.productPrice]) + '" type="hidden">')
                               .append('<input class="sc-paypal-input" name="quantity_' + itemNumber + '" value="' + mi._getValueOrEmpty(p[this.options.paramSettings.productQuantity]) + '" type="hidden">');
                    });

                    formElm.submit();
                    this._triggerEvent("cartSubmitted", [this.cart]);
                    
                    break;
                default:
                    formElm.submit();
                    this._triggerEvent("cartSubmitted", [this.cart]);
                    
                    break;
            }
            
            return true;
        },
        
// HELPER FUNCTIONS
        
        _getContent: function (elm) {
            if(elm.is(":checkbox, :radio")){
                return elm.is(":checked") ? elm.val() : '';
            } else if (elm.is("[value], select")){
                return elm.val();
            } else if (elm.is("img")){
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
                if(p === 'unique_key' || p === this.options.paramSettings.productQuantity) {
                    continue; 
                }
                if (typeof o1[p] === typeof undefined && typeof o2[p] === typeof undefined) { 
                    continue; 
                }
                if (o1[p] !== o2[p]){
                    return false;
                }
            }
            return true;
        },
        _getMoneyFormatted: function (n) {
            n = n - 0;
            return Number(n.toFixed(2)).toLocaleString(this.options.currencySettings.locales, this.options.currencySettings.currencyOptions);
        },
        _getValueOrEmpty: function (v) {
            return (v && typeof v !== typeof undefined) ? v : '';
        },
        _getValidateNumber: function (n) {
            n = n - 0;
            if(n && n > 0){
               return true;
            }
            return false;
        },
        _formatTemplate: function (t, o){
            var r = t.split("{"), fs = '';
            for(var i=0; i < r.length; i++){
                var vr = r[i].substring(0, r[i].indexOf("}")); 
                if(vr.length > 0){
                    fs += r[i].replace(vr + '}', this._getValueOrEmpty(o[vr]));
                }else{
                    fs += r[i];
                }
            }
            return fs;
        },
        _triggerEvent: function (name, params) {
            // Trigger an event
            var e = $.Event(name);
            this.cart_element.trigger(e, params);
            if (e.isDefaultPrevented()) { return false; }
            return e.result;
        },
        _getUniqueKey: function () {
            var d = new Date();
            return d.getTime();
        },
        _logMessage: function (msg) {
            if(this.options.debug !== true) { return false; }
            // Log message
            console.log(msg);
        },
        _logError: function (msg) {
            if(this.options.debug !== true) { return false; }
            // Log message
            $.error(msg);
        },

// PUBLIC FUNCTIONS
        submit: function () {
            this._submitCart();
        },
        clear: function () {
            this._clearCart();
        }
    });

    // Wrapper for the plugin
    $.fn.smartCart = function(options) {
        var args = arguments;
        var instance;

        if (options === undefined || typeof options === 'object') {
            return this.each( function() {
                if ( !$.data( this, "smartCart") ) {
                    $.data( this, "smartCart", new SmartCart( this, options ) );
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            instance = $.data(this[0], 'smartCart');

            if (options === 'destroy') {
                $.data(this, 'smartCart', null);
            }

            if (instance instanceof SmartCart && typeof instance[options] === 'function') {
                return instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
            } else {
                return this;
            }
        }
    };

})(jQuery, window, document);