/*!
* jQuery SmartCart v4.0.1
* Interactive shopping cart plugin for jQuery
* https://www.techlaboratory.net/jquery-smartcart
*
* Created by Dipu Raj (http://dipu.me)
*
* Licensed under the terms of the MIT License
* https://github.com/techlab/jquery-smartcart/blob/master/LICENSE
*/
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if ( jQuery === undefined ) {
                // require('jQuery') returns a factory that requires window to
                // build a jQuery instance, we normalize how we use modules
                // that require this pattern but the window provided is a noop
                // if it's defined (how jquery works)
                if ( typeof window !== 'undefined' ) {
                    jQuery = require('jquery');
                }
                else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    "use strict";

    // Default options
    const defaults = {
        // lists: ['cart'],
        products: [],
        
        productListSelector: '#product-list',
        productListItemSelector: '.product-item',
        productDataElementSelector: '.sc-item-data',
        addToListBtnSelector: '.sc-add-to-list',


        productTemplate: `<div class="col">
                            <div class="product-item card h-100">
                                <img src="{{image}}" class="card-img-top" alt="...">
                                <div class="card-body">
                                    <h5 class="card-title">{{name}}</h5>
                                    <p class="card-text">{{description}}</p>

                                    <div>
                                        <div class="form-group">
                                            <label>Size: </label>
                                            <select name="product_size" class="form-control form-control-sm">
                                                <option>S</option>
                                                <option>M</option>
                                                <option>L</option>
                                            </select>
                                        </div>
                                        
                                        <div class="form-group form-group-sm">
                                            <label>Color: </label><br />
                                            <label class="radio-inline">
                                                <input type="radio" class="sc-item-data" name="product_color" value="red"> red
                                            </label>
                                            <label class="radio-inline">
                                                <input type="radio" class="sc-item-data" name="product_color" value="blue"> blue
                                            </label>
                                            <label class="radio-inline">
                                                <input type="radio" class="sc-item-data" name="product_color" value="green"> green
                                            </label>
                                        </div>

                                        <div class="form-group">
                                            <input class="sc-item-data sc-cart-item-qty form-control form-control-sm" name="quantity" min="1" value="1" type="number">
                                        </div>
                                    </div>

                                    <div class="d-md-flex justify-content-md-end">
                                        <strong>{{price|money}}</strong>
                                    </div>
                                    <hr class="line">
                                    <div class="d-md-flex justify-content-md-end mb-2">
                                        <button type="button" class="sc-add-to-list btn btn-default btn-sm"
                                            data-id="{{id}}"
                                            data-price="{{price}}"
                                            data-list="saveList">Save</button>
                                        <button type="button" class="sc-add-to-list btn btn-info btn-sm"
                                            data-id="{{id}}"
                                            data-price="{{price}}"
                                            data-list="wishList">Wishlist</button>
                                    </div>
                                    <div class="d-md-flex justify-content-md-end">
                                        <button type="button" class="sc-add-to-list btn btn-success btn-sm"
                                            data-id="{{id}}"
                                            data-price="{{price}}"
                                            data-list="cart">Add to Cart</button>
                                    </div>
                                </div>
                            </div>
                        </div>`,
        listItemTemplate: `<div class="d-flex justify-content-between">
                                    <img src="{{image}}" alt="{{name}}" width="32" height="32" class="img-responsive rounded me-2">
                                    <div>
                                        <h6 class="my-0">{{name}}</h6>
                                        <small class="text-muted">{{description}}</small>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-end text-muted">
                                    {{price|money}} × <input type="number" min="1" value="{{quantity|number}}" class="ms-2 w-25 h-25 form-control form-control-sm" />
                                </div>`,

        params: { // Map the product basic paramters
            id: 'id',
            name: 'name',
            price: 'price',
            quantity: 'quantity',
        },
        combineProducts: true, // Combine similar products on cart
        combineByKeys: ['id','price'],
        style: { // CSS Class settings
            themePrefixCss: 'sc-theme-',
            btnRemoveCss: 'sc-cart-remove',
            btnClearCss: 'sc-cart-clear',
            btnCheckoutCss: 'sc-cart-checkout'
        },
        theme: 'default', // theme for the cart, related css need to include for other than default theme

        // --------------------------------
        cart: [], // initial products on cart
        resultName: 'cart_list', // Submit name of the cart parameter
        highlightEffect: true, // highlight effect on adding/updating product in cart
        cartItemTemplate: `<img class="img-responsive pull-left" src="{{product_image}}" />
                            <h4 class="list-group-item-heading">{{product_name}}</h4>
                            <p class="list-group-item-text">{{product_desc}}</p>`,

        cartItemQtyTemplate: '{display_price} × {display_quantity} = {display_amount}',
        productContainerSelector: '.sc-product-item',
        productElementSelector: '*', // input, textarea, select, div, p
        addCartSelector: '.sc-add-to-cart',
        
        lang: {  // Language variables
            cartTitle: "Shopping Cart",
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



        toolbar: {
            position: 'bottom', // none|top|bottom|both
            showNextButton: true, // show/hide a Next button
            showPreviousButton: true, // show/hide a Previous button
            extraHtml: '' // Extra html to show on toolbar
        },
        keyboard: {
            keyNavigation: true, // Enable/Disable keyboard navigation(left and right keys are used if enabled)
            keyLeft: [37], // Left key code
            keyRight: [39] // Right key code
        },
        
        getContent: null, // Callback function for content loading
    };

    class SmartCart {

        constructor(element, options) {
            // Merge user settings with default
            this.options            = $.extend(true, {}, defaults, options);
            // List container element
            this.listContainer      = $(element);
            // Product list container element
            this.productContainer   = $(this.options.productListSelector);
            // List contains the added items
            this.lists              = [];


            // Product List
            this.products           = [];//this.container.children('.' + this.options.style.contentPanelCss);
                                  
            
            // TODO Remove            
            // Cart array
            this.cart = [];

            // Is initialiazed
            this.is_init        = false;    

            // Initialize options
            this._init();

            // Load asynchronously
            setTimeout(() => {
                this._load();
            }, 0);
        }

        // Initialize options
        _init() {
            // Set the elements
            this._setElements();

            // Skip if already init
            if (this.is_init === true) return true;

            // Assign plugin events
            this._setEvents();


            // TODO Set initial products
            var mi = this;
            $(this.options.cart).each(function(i, p) {
                p = mi._addToList(p);
            });
            // Call UI sync
            this._renderList('cart');


            this.is_init = true;
            // Trigger the initialized event
            this._triggerEvent("initialized");
        }

        // Initial Load Method
        _load() {
            // Trigger the loaded event
            this._triggerEvent("loaded");
        }

        _setEvents() {
            // Add to list event
            this.productContainer.on("click", this.options.addToListBtnSelector, (e) => {
                e.preventDefault();

                const p = this._getItemData($(e.currentTarget));
                this._addToList(p);
                this._renderList('cart');
            });

            // List actions events
            this.listContainer.on("click", (e) => {
                if ($(e.target).hasClass(this.options.style.btnRemoveCss)) {
                    e.preventDefault();

                    const timeKey = $(e.target).parents('li').attr('data-time-key');
                    this._removeListItem('cart', timeKey);
                    this._renderList('cart');
                }
                return;
            });
            
            // Item quantity change event
            this.listContainer.on( "change", 'input', (e) => {
                e.preventDefault();

                const timeKey = $(e.target).parents('li').attr('data-time-key');
                const p = {}
                p[this.options.params.quantity] = $(e.target).val()

                this._updateListItem('cart', timeKey, p);
                this._renderList('cart');
            });
        }

        /**
         * Set elements
         */
        _setElements() {
            this.listContainer.append(`<ul class="list-group sc-list-cart"></ul>`);
        }

        /**
         * Render the product list
         */
        _renderProductList() {
            if (this.options.products && this.options.products.length > 0) {
                let html = '';
                this.options.products.forEach((p) => {
                    html += this._parseTemplate(this.options.productTemplate, p);
                });
                this.productContainer.append(html);
            }
        }
        
        /**
         * Add product to a list
         * 
         * @param {Object[]} p - Product item data
         * @param {string} listName - The name of the list
         */
        _addToList(p, listName = null) {
            listName = listName ?? p.list ?? 'cart';

            p = this._getMergedItem(p); 

            if (!p.hasOwnProperty(this.options.params.price)) {
                this._logError('Price is not set for the item');
                return false;
            }
                        
            if (!p.hasOwnProperty(this.options.params.quantity)) {
                p[this.options.params.quantity] = 1;
            }

            const itemKey = this._getItemKey(p);
            if (!p.hasOwnProperty('itemKey')) {
                p.itemKey = itemKey;
            }

            let list = this.lists[listName] ?? [];
            let listItem = null;
            let action = "itemAdded";
            if(this.options.combineProducts) {
                listItem = list.filter((item) => {
                    return item.itemKey == itemKey;
                });
            }

            if (listItem && listItem.length > 0) {
                const idx = list.indexOf(listItem[0]);
                list[idx][this.options.params.quantity] = ((list[idx][this.options.params.quantity] ?? 0) - 0) + ((p[this.options.params.quantity] ?? 0) - 0);
                p = list[idx];
                p.timeKeyOld = p.timeKey;
                p.timeKey = Date.now();
                action = "itemUpdated";
            } else {
                p.timeKey = Date.now();
                list.push(p);
            }
            
            this.lists[listName] = list;

            // Trigger event
            this._triggerEvent(action, p);

            // List changed
            this._listChanged(listName);
        }

        /**
         * Handles the changes in the cart 
         */
        _listChanged(listName) {
            this._triggerEvent('listChanged', this._getListData(listName));
            if (this.lists[listName].length == 0) {
                this._triggerEvent("listEmpty", { listName:listName });
            }
        }

        /**
         * Get the list data
         * 
         * @param {string} listName
         * @return {Object} listObj
         */
        _getListData(listName) {
            const list = this.lists[listName] ?? [];
            return {
                "name": listName,
                "items": list,
                "itemCount": list.length,
                "isEmpty": list.length > 0 ? false : true,
                "itemTotal": this._getListTotal(listName),
            };
        }

        /**
         * Calculates the list total
         */
        _getListTotal(listName){
            const list = this.lists[listName] ?? [];
            let total = 0;
            if (list.length > 0) {
                list.forEach((p) => {
                    const price = p[this.options.params.price] ?? 0;
                    const quantity = p[this.options.params.quantity] ?? 1;
                    total += (price - 0) * (quantity - 0); 
                });
            }
            return total;
        }

        /**
         * Parse template
         *
         * @param {string} template - Template string
         * @param {Object} data - Data
         * @return {Object}
         */
        _parseTemplate(template, data) {
            const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
            let text = template.replace(templateMatcher, (substring, value, index) => {
                const chunks = value.split('|');
                return this._getFormatted(data[chunks[0]] ?? null, chunks[1] ?? null);
            });
            return text
        }

        /**
         * Format a value by a type
         * 
         * @param {string|int|float} val - Value to format
         * @param {string|null} type - Format type
         * @return {string}
         */
        _getFormatted(val, type) {
            if (val == null || typeof val == typeof undefined) {
                return '';
            } else if (type == null || typeof type == typeof undefined) {
                return val;
            } else if (type == 'number') {
                return Number((val - 0).toFixed(2));
            } else if (type == 'money') {
                return Number((val - 0).toFixed(2)).toLocaleString(this.options.currencySettings.locales, this.options.currencySettings.currencyOptions);
            } else {
                return val;
            }
        }
        
        /**
         * Event raiser
         *
         * @param {string} name - Event name
         * @param {Object} params - Event parameters
         * @return {Object}
         */
        _triggerEvent(name, params) {
            // Trigger an event
            var e = $.Event(name);
            this.listContainer.trigger(e, params);
            if (e.isDefaultPrevented()) return false;
            return e.result;
        }

        /**
         * Merge the product data with existing product data 
         * 
         * @param {Object} p - Product item data
         * @return {Object}
         */
        _getMergedItem(p) {
            if (this.options.products && this.options.products.length > 0) {
                const pItem = this.options.products.filter((item) => {
                    return item.id == p.id;
                });
                if (pItem && pItem.length > 0) {
                    p = $.extend(true, {}, pItem[0], p);
                }
            }
            return p;
        }

        /* 
         * Get unique item key
         */
        _getItemKey(p) {
            let key = '';
            this.options.combineByKeys.forEach((k) => {
                key += (p[k] ?? '') + '';
            });
            return key;
        }

        /**
         * Clear list
         * 
         * @param {string} listName - The name of the list
         */
        _clearList(listName) {
            this.lists[listName] = [];

            // Trigger "listCleared" event
            this._triggerEvent("listCleared", { listName:listName });

            // List changed
            this._listChanged(listName);
        }

        /**
         * Remove an item from the list
         * 
         * @param {string} listName - The name of the list
         * @param {string} key      - Key of the item
         */        
        _removeListItem(listName, key) {
            if (key == undefined) return;

            let list = this.lists[listName] ?? [];
            let removedItems = [];
            const listItems = list.filter((item) => {
                if (item.itemKey == key || item.timeKey == key) {
                    removedItems.push(item);
                    return false;
                }
                return true;
            });
            this.lists[listName] = listItems;

            // Trigger event
            this._triggerEvent("itemRemoved", { listName: listName, removedItems: removedItems });

            // List changed
            this._listChanged(listName);
        }

        /**
         * Update an item on the list
         * 
         * @param {string} listName - The name of the list
         * @param {string} key      - Key of the item
         * @param {object} p        - Item data
         */        
         _updateListItem(listName, key, p) {
            if (key == undefined) return;

            let list = this.lists[listName] ?? [];
            let updatedItems = [];

            const listItem = list.filter((item) => {
                if (item.itemKey == key || item.timeKey == key) {
                    updatedItems.push(item);
                    return true;
                }
                return false;
            });

            if (listItem && listItem.length > 0) {
                const idx = list.indexOf(listItem[0]);

                p = $.extend(true, {}, list[idx], p);
                p.timeKeyOld = p.timeKey;
                p.timeKey = Date.now();
                list[idx] = p;

                this.lists[listName] = list;

                // Trigger event
                this._triggerEvent("itemUpdated", { listName: listName, updatedItems: [p] });
    
                // List changed
                this._listChanged(listName);
            }
        }

        // UI CODE -----------------

        /**
        * Get the parameters of a product by seaching elements with name attribute/data.
        * Product details will be return as an object
        * @param {Object} 
        */
        _getItemData(elm) {
            const p = elm.data();
            elm.parents(this.options.productListItemSelector)
                .find(this.options.productDataElementSelector)
                .each((i, n) => {
                    const elm = $(n);
                    const key = elm.is('[name]') ? elm.attr('name') : elm.data('name');
                    if (key && typeof key !== typeof undefined) {
                        const val = this._getContent(elm);
                        if(val){
                            p[key] = val;    
                        }
                    }
                });
            return p;
        }

        /* 
         * Get the content of an HTML element irrespective of its type
         */
        _getContent(elm){
            if (elm.is(":checkbox, :radio")) {
                return elm.is(":checked") ? elm.val() : '';
            } else if (elm.is("[value], select")) {
                return elm.val();
            } else if (elm.is("img")) {
                return elm.attr('src');
            } else {
                return elm.text();
            }
        }

        /**
         * Render the shopping list
         * 
         * @param {string} listName - The name of the list
         */
        _renderList(listName = null) {
            listName = listName ?? 'cart';
            const listElm = this.listContainer.find('.sc-list-cart');
            if (listElm.length == 0) {
                return;
            }

            const listData = this.lists[listName] ?? [];
            if (listData.length == 0) {
                listElm.empty();
            } else {
                let timeKeys = [];
                
                // Add list elements
                listData.forEach((p) => {
                    const timeKey = p.timeKey ?? '';
                    timeKeys.push(timeKey);

                    // Find if the item alredy exists in the cart
                    let elmItem = listElm.find("[data-time-key='" + timeKey + "']");
                    if (elmItem.length == 0) {
                        let contentHtml = this._parseTemplate(this.options.listItemTemplate, p);
                        if (contentHtml.length > 0) {
                            elmItem = p.timeKeyOld ? listElm.find("[data-time-key='" + p.timeKeyOld + "']") : null;
                            if (elmItem && elmItem.length > 0) {
                                elmItem.attr('data-time-key', timeKey);
                                elmItem.html(contentHtml);
                            } else {
                                elmItem = $(`<li data-time-key=${timeKey} class="list-group-item d-flex justify-content-between lh-sm">${contentHtml}</li>`);
                                listElm.append(elmItem);
                            }
                            elmItem.append('<button type="button" class="sc-cart-remove">' + this.options.lang.cartRemove + '</button>');

                            this._highlightElement(elmItem);
                        }
                    }
                });

                // Remove reduntant elements
                listElm.children().each( ( index, elm ) => {
                    if (!timeKeys.includes(parseInt($(elm).attr('data-time-key')))) {
                        this._removeElement($(elm));
                    }
                });
            }
        }

        /**
         * Highlight an element
         * 
         * @param {object} elm - Element to highlight
         */
        _highlightElement(elm) {
            // Apply the highlight effect
            if (this.options.highlightEffect === true) {
                elm.addClass('sc-highlight');
                setTimeout(function() {
                    elm.removeClass('sc-highlight');
                },500);
            }
        }

        /**
         * Remove an element
         * 
         * @param {object} elm - Element
         */
        _removeElement(elm) {
            elm.fadeOut( "fast", () => {
                elm.remove();
            });
        }

        // OLD CODE ----------------------------------------------------------------        

        /* 
         * Cart submit functionalities
         */
        _submitCart() {
            var mi = this;
            var formElm = this.listContainer.parents('form');
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
                            // mi._clearCart();
                        }
                    }, this.options.submitSettings.ajaxSettings);

                    $.ajax(ajaxSettings);
                
                    break;
                case 'paypal':
                    formElm.children('.sc-paypal-input').remove();
                    // Add paypal specific fields for cart products
                    $.each(this.cart, function( i, p ) {   
                        var itemNumber = i + 1;
                        formElm.append('<input class="sc-paypal-input" name="item_number_' + itemNumber + '" value="' + mi._getValueOrEmpty(p[mi.options.paramSettings.productId]) + '" type="hidden">')
                               .append('<input class="sc-paypal-input" name="item_name_' + itemNumber + '" value="' + mi._getValueOrEmpty(p[mi.options.paramSettings.productName]) + '" type="hidden">')
                               .append('<input class="sc-paypal-input" name="amount_' + itemNumber + '" value="' + mi._getValueOrEmpty(p[mi.options.paramSettings.productPrice]) + '" type="hidden">')
                               .append('<input class="sc-paypal-input" name="quantity_' + itemNumber + '" value="' + mi._getValueOrEmpty(p[mi.options.paramSettings.productQuantity]) + '" type="hidden">');
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
        }

        /* 
         * Get the value of an element and empty value if the element not exists 
         */
        _getValueOrEmpty(v) {
            return (v && typeof v !== typeof undefined) ? v : '';
        }

        
        /* 
         * Log error to console and terminate execution
         */
        _logError(msg) {
            if(this.options.debug !== true) { return false; }
            // Log error
            $.error(msg);
        }
        // HELPER FUNCTIONS
        

        // PUBLIC FUNCTIONS
        /**
         * Render lists
         */
        render() {
            this._renderProductList();
        }

        /* 
         * Public function to clear the cart
         */
        clear(listName) {
            if (listName == undefined) return;
            
            this._clearList(listName);
            this._renderList(listName);
        }



        /* 
         * Public function to sumbit the cart
         */
        submit() {
            this._submitCart();
        }

        reset() {
            // Reset all
            this._init();
            this._load();
        }

        setOptions(options) {
            this.options  = $.extend(true, {}, this.options, options);
            this._init();
        }

        getOptions() {
            return this.options;
        }

        loader(state) {
            this.listContainer.toggleClass(this.options.style.loaderCss, (state === "show"));
        }
    }

    // Wrapper for the plugin
    $.fn.smartCart = function (options) {
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {
                if (!$.data(this, "smartCart")) {
                    $.data(this, "smartCart", new SmartCart(this, options));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            let instance = $.data(this[0], 'smartCart');

            if (options === 'destroy') {
                $.data(this, 'smartCart', null);
            }

            if (instance instanceof SmartCart && typeof instance[options] === 'function') {
                return instance[options].apply(instance, Array.prototype.slice.call(arguments, 1));
            } else {
                return this;
            }
        }
    };
}));