"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

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
  } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = function (root, jQuery) {
      if (jQuery === undefined) {
        // require('jQuery') returns a factory that requires window to
        // build a jQuery instance, we normalize how we use modules
        // that require this pattern but the window provided is a noop
        // if it's defined (how jquery works)
        if (typeof window !== 'undefined') {
          jQuery = require('jquery');
        } else {
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
})(function ($) {
  "use strict"; // Default options

  var defaults = {
    // lists: ['cart'],
    products: [],
    productListSelector: '#product-list',
    productListItemSelector: '.product-item',
    productDataElementSelector: '.sc-item-data',
    addToListBtnSelector: '.sc-add-to-list',
    productTemplate: "<div class=\"col\">\n                            <div class=\"product-item card h-100\">\n                                <img src=\"{{image}}\" class=\"card-img-top\" alt=\"...\">\n                                <div class=\"card-body\">\n                                    <h5 class=\"card-title\">{{name}}</h5>\n                                    <p class=\"card-text\">{{description}}</p>\n\n                                    <div>\n                                        <div class=\"form-group\">\n                                            <label>Size: </label>\n                                            <select name=\"product_size\" class=\"form-control form-control-sm\">\n                                                <option>S</option>\n                                                <option>M</option>\n                                                <option>L</option>\n                                            </select>\n                                        </div>\n                                        \n                                        <div class=\"form-group form-group-sm\">\n                                            <label>Color: </label><br />\n                                            <label class=\"radio-inline\">\n                                                <input type=\"radio\" class=\"sc-item-data\" name=\"product_color\" value=\"red\"> red\n                                            </label>\n                                            <label class=\"radio-inline\">\n                                                <input type=\"radio\" class=\"sc-item-data\" name=\"product_color\" value=\"blue\"> blue\n                                            </label>\n                                            <label class=\"radio-inline\">\n                                                <input type=\"radio\" class=\"sc-item-data\" name=\"product_color\" value=\"green\"> green\n                                            </label>\n                                        </div>\n\n                                        <div class=\"form-group\">\n                                            <input class=\"sc-item-data sc-cart-item-qty form-control form-control-sm\" name=\"quantity\" min=\"1\" value=\"1\" type=\"number\">\n                                        </div>\n                                    </div>\n\n                                    <div class=\"d-md-flex justify-content-md-end\">\n                                        <strong>{{price|money}}</strong>\n                                    </div>\n                                    <hr class=\"line\">\n                                    <div class=\"d-md-flex justify-content-md-end mb-2\">\n                                        <button type=\"button\" class=\"sc-add-to-list btn btn-default btn-sm\"\n                                            data-id=\"{{id}}\"\n                                            data-price=\"{{price}}\"\n                                            data-list=\"saveList\">Save</button>\n                                        <button type=\"button\" class=\"sc-add-to-list btn btn-info btn-sm\"\n                                            data-id=\"{{id}}\"\n                                            data-price=\"{{price}}\"\n                                            data-list=\"wishList\">Wishlist</button>\n                                    </div>\n                                    <div class=\"d-md-flex justify-content-md-end\">\n                                        <button type=\"button\" class=\"sc-add-to-list btn btn-success btn-sm\"\n                                            data-id=\"{{id}}\"\n                                            data-price=\"{{price}}\"\n                                            data-list=\"cart\">Add to Cart</button>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>",
    listItemTemplate: "<div class=\"d-flex justify-content-between\">\n                                    <img src=\"{{image}}\" alt=\"{{name}}\" width=\"32\" height=\"32\" class=\"img-responsive rounded me-2\">\n                                    <div>\n                                        <h6 class=\"my-0\">{{name}}</h6>\n                                        <small class=\"text-muted\">{{description}}</small>\n                                    </div>\n                                </div>\n\n                                <div class=\"d-flex justify-content-end text-muted\">\n                                    {{price|money}} \xD7 <input type=\"number\" min=\"1\" value=\"{{quantity|number}}\" class=\"ms-2 w-25 h-25 form-control form-control-sm\" />\n                                </div>",
    params: {
      // Map the product basic paramters
      id: 'id',
      name: 'name',
      price: 'price',
      quantity: 'quantity'
    },
    combineProducts: true,
    // Combine similar products on cart
    combineByKeys: ['id', 'price'],
    style: {
      // CSS Class settings
      themePrefixCss: 'sc-theme-',
      btnRemoveCss: 'sc-cart-remove',
      btnClearCss: 'sc-cart-clear',
      btnCheckoutCss: 'sc-cart-checkout'
    },
    theme: 'default',
    // theme for the cart, related css need to include for other than default theme
    // --------------------------------
    cart: [],
    // initial products on cart
    resultName: 'cart_list',
    // Submit name of the cart parameter
    highlightEffect: true,
    // highlight effect on adding/updating product in cart
    cartItemTemplate: "<img class=\"img-responsive pull-left\" src=\"{{product_image}}\" />\n                            <h4 class=\"list-group-item-heading\">{{product_name}}</h4>\n                            <p class=\"list-group-item-text\">{{product_desc}}</p>",
    cartItemQtyTemplate: '{display_price} × {display_quantity} = {display_amount}',
    productContainerSelector: '.sc-product-item',
    productElementSelector: '*',
    // input, textarea, select, div, p
    addCartSelector: '.sc-add-to-cart',
    lang: {
      // Language variables
      cartTitle: "Shopping Cart",
      checkout: 'Checkout',
      clear: 'Clear',
      subtotal: 'Subtotal:',
      cartRemove: '×',
      cartEmpty: 'Cart is Empty!<br />Choose your products'
    },
    submitSettings: {
      submitType: 'form',
      // form, paypal, ajax
      ajaxURL: '',
      // Ajax submit URL
      ajaxSettings: {} // Ajax extra settings for submit call

    },
    currencySettings: {
      locales: 'en-US',
      // A string with a BCP 47 language tag, or an array of such strings
      currencyOptions: {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'symbol'
      } // extra settings for the currency formatter. Refer: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString

    },
    toolbarSettings: {
      showToolbar: true,
      showCheckoutButton: true,
      showClearButton: true,
      showCartSummary: true,
      checkoutButtonStyle: 'default',
      // default, paypal, image
      checkoutButtonImage: '',
      // image for the checkout button
      toolbarExtraButtons: [] // Extra buttons to show on toolbar, array of jQuery input/buttons elements

    },
    toolbar: {
      position: 'bottom',
      // none|top|bottom|both
      showNextButton: true,
      // show/hide a Next button
      showPreviousButton: true,
      // show/hide a Previous button
      extraHtml: '' // Extra html to show on toolbar

    },
    keyboard: {
      keyNavigation: true,
      // Enable/Disable keyboard navigation(left and right keys are used if enabled)
      keyLeft: [37],
      // Left key code
      keyRight: [39] // Right key code

    },
    getContent: null // Callback function for content loading

  };

  var SmartCart = /*#__PURE__*/function () {
    function SmartCart(element, options) {
      var _this = this;

      _classCallCheck(this, SmartCart);

      // Merge user settings with default
      this.options = $.extend(true, {}, defaults, options); // List container element

      this.listContainer = $(element); // Product list container element

      this.productContainer = $(this.options.productListSelector); // List contains the added items

      this.lists = []; // Product List

      this.products = []; //this.container.children('.' + this.options.style.contentPanelCss);
      // TODO Remove            
      // Cart array

      this.cart = []; // Is initialiazed

      this.is_init = false; // Initialize options

      this._init(); // Load asynchronously


      setTimeout(function () {
        _this._load();
      }, 0);
    } // Initialize options


    _createClass(SmartCart, [{
      key: "_init",
      value: function _init() {
        // Set the elements
        this._setElements(); // Skip if already init


        if (this.is_init === true) return true; // Assign plugin events

        this._setEvents(); // TODO Set initial products


        var mi = this;
        $(this.options.cart).each(function (i, p) {
          p = mi._addToList(p);
        }); // Call UI sync

        this._renderList('cart');

        this.is_init = true; // Trigger the initialized event

        this._triggerEvent("initialized");
      } // Initial Load Method

    }, {
      key: "_load",
      value: function _load() {
        // Trigger the loaded event
        this._triggerEvent("loaded");
      }
    }, {
      key: "_setEvents",
      value: function _setEvents() {
        var _this2 = this;

        // Add to list event
        this.productContainer.on("click", this.options.addToListBtnSelector, function (e) {
          e.preventDefault();

          var p = _this2._getItemData($(e.currentTarget));

          _this2._addToList(p);

          _this2._renderList('cart');
        }); // List actions events

        this.listContainer.on("click", function (e) {
          if ($(e.target).hasClass(_this2.options.style.btnRemoveCss)) {
            e.preventDefault();
            var timeKey = $(e.target).parents('li').attr('data-time-key');

            _this2._removeListItem('cart', timeKey);

            _this2._renderList('cart');
          }

          return;
        }); // Item quantity change event

        this.listContainer.on("change", 'input', function (e) {
          e.preventDefault();
          var timeKey = $(e.target).parents('li').attr('data-time-key');
          var p = {};
          p[_this2.options.params.quantity] = $(e.target).val();

          _this2._updateListItem('cart', timeKey, p);

          _this2._renderList('cart');
        });
      }
      /**
       * Set elements
       */

    }, {
      key: "_setElements",
      value: function _setElements() {
        this.listContainer.append("<ul class=\"list-group sc-list-cart\"></ul>");
      }
      /**
       * Render the product list
       */

    }, {
      key: "_renderProductList",
      value: function _renderProductList() {
        var _this3 = this;

        if (this.options.products && this.options.products.length > 0) {
          var html = '';
          this.options.products.forEach(function (p) {
            html += _this3._parseTemplate(_this3.options.productTemplate, p);
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

    }, {
      key: "_addToList",
      value: function _addToList(p) {
        var _ref, _listName, _this$lists$listName;

        var listName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        listName = (_ref = (_listName = listName) !== null && _listName !== void 0 ? _listName : p.list) !== null && _ref !== void 0 ? _ref : 'cart';
        p = this._getMergedItem(p);

        if (!p.hasOwnProperty(this.options.params.price)) {
          this._logError('Price is not set for the item');

          return false;
        }

        if (!p.hasOwnProperty(this.options.params.quantity)) {
          p[this.options.params.quantity] = 1;
        }

        var itemKey = this._getItemKey(p);

        if (!p.hasOwnProperty('itemKey')) {
          p.itemKey = itemKey;
        }

        var list = (_this$lists$listName = this.lists[listName]) !== null && _this$lists$listName !== void 0 ? _this$lists$listName : [];
        var listItem = null;
        var action = "itemAdded";

        if (this.options.combineProducts) {
          listItem = list.filter(function (item) {
            return item.itemKey == itemKey;
          });
        }

        if (listItem && listItem.length > 0) {
          var _list$idx$this$option, _p$this$options$param;

          var idx = list.indexOf(listItem[0]);
          list[idx][this.options.params.quantity] = ((_list$idx$this$option = list[idx][this.options.params.quantity]) !== null && _list$idx$this$option !== void 0 ? _list$idx$this$option : 0) - 0 + (((_p$this$options$param = p[this.options.params.quantity]) !== null && _p$this$options$param !== void 0 ? _p$this$options$param : 0) - 0);
          p = list[idx];
          p.timeKeyOld = p.timeKey;
          p.timeKey = Date.now();
          action = "itemUpdated";
        } else {
          p.timeKey = Date.now();
          list.push(p);
        }

        this.lists[listName] = list; // Trigger event

        this._triggerEvent(action, p); // List changed


        this._listChanged(listName);
      }
      /**
       * Handles the changes in the cart 
       */

    }, {
      key: "_listChanged",
      value: function _listChanged(listName) {
        this._triggerEvent('listChanged', this._getListData(listName));

        if (this.lists[listName].length == 0) {
          this._triggerEvent("listEmpty", {
            listName: listName
          });
        }
      }
      /**
       * Get the list data
       * 
       * @param {string} listName
       * @return {Object} listObj
       */

    }, {
      key: "_getListData",
      value: function _getListData(listName) {
        var _this$lists$listName2;

        var list = (_this$lists$listName2 = this.lists[listName]) !== null && _this$lists$listName2 !== void 0 ? _this$lists$listName2 : [];
        return {
          "name": listName,
          "items": list,
          "itemCount": list.length,
          "isEmpty": list.length > 0 ? false : true,
          "itemTotal": this._getListTotal(listName)
        };
      }
      /**
       * Calculates the list total
       */

    }, {
      key: "_getListTotal",
      value: function _getListTotal(listName) {
        var _this$lists$listName3,
            _this4 = this;

        var list = (_this$lists$listName3 = this.lists[listName]) !== null && _this$lists$listName3 !== void 0 ? _this$lists$listName3 : [];
        var total = 0;

        if (list.length > 0) {
          list.forEach(function (p) {
            var _p$_this4$options$par, _p$_this4$options$par2;

            var price = (_p$_this4$options$par = p[_this4.options.params.price]) !== null && _p$_this4$options$par !== void 0 ? _p$_this4$options$par : 0;
            var quantity = (_p$_this4$options$par2 = p[_this4.options.params.quantity]) !== null && _p$_this4$options$par2 !== void 0 ? _p$_this4$options$par2 : 1;
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

    }, {
      key: "_parseTemplate",
      value: function _parseTemplate(template, data) {
        var _this5 = this;

        var templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
        var text = template.replace(templateMatcher, function (substring, value, index) {
          var _data$chunks$, _chunks$;

          var chunks = value.split('|');
          return _this5._getFormatted((_data$chunks$ = data[chunks[0]]) !== null && _data$chunks$ !== void 0 ? _data$chunks$ : null, (_chunks$ = chunks[1]) !== null && _chunks$ !== void 0 ? _chunks$ : null);
        });
        return text;
      }
      /**
       * Format a value by a type
       * 
       * @param {string|int|float} val - Value to format
       * @param {string|null} type - Format type
       * @return {string}
       */

    }, {
      key: "_getFormatted",
      value: function _getFormatted(val, type) {
        if (val == null || _typeof(val) == (typeof undefined === "undefined" ? "undefined" : _typeof(undefined))) {
          return '';
        } else if (type == null || _typeof(type) == (typeof undefined === "undefined" ? "undefined" : _typeof(undefined))) {
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

    }, {
      key: "_triggerEvent",
      value: function _triggerEvent(name, params) {
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

    }, {
      key: "_getMergedItem",
      value: function _getMergedItem(p) {
        if (this.options.products && this.options.products.length > 0) {
          var pItem = this.options.products.filter(function (item) {
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

    }, {
      key: "_getItemKey",
      value: function _getItemKey(p) {
        var key = '';
        this.options.combineByKeys.forEach(function (k) {
          var _p$k;

          key += ((_p$k = p[k]) !== null && _p$k !== void 0 ? _p$k : '') + '';
        });
        return key;
      }
      /**
       * Clear list
       * 
       * @param {string} listName - The name of the list
       */

    }, {
      key: "_clearList",
      value: function _clearList(listName) {
        this.lists[listName] = []; // Trigger "listCleared" event

        this._triggerEvent("listCleared", {
          listName: listName
        }); // List changed


        this._listChanged(listName);
      }
      /**
       * Remove an item from the list
       * 
       * @param {string} listName - The name of the list
       * @param {string} key      - Key of the item
       */

    }, {
      key: "_removeListItem",
      value: function _removeListItem(listName, key) {
        var _this$lists$listName4;

        if (key == undefined) return;
        var list = (_this$lists$listName4 = this.lists[listName]) !== null && _this$lists$listName4 !== void 0 ? _this$lists$listName4 : [];
        var removedItems = [];
        var listItems = list.filter(function (item) {
          if (item.itemKey == key || item.timeKey == key) {
            removedItems.push(item);
            return false;
          }

          return true;
        });
        this.lists[listName] = listItems; // Trigger event

        this._triggerEvent("itemRemoved", {
          listName: listName,
          removedItems: removedItems
        }); // List changed


        this._listChanged(listName);
      }
      /**
       * Update an item on the list
       * 
       * @param {string} listName - The name of the list
       * @param {string} key      - Key of the item
       * @param {object} p        - Item data
       */

    }, {
      key: "_updateListItem",
      value: function _updateListItem(listName, key, p) {
        var _this$lists$listName5;

        if (key == undefined) return;
        var list = (_this$lists$listName5 = this.lists[listName]) !== null && _this$lists$listName5 !== void 0 ? _this$lists$listName5 : [];
        var updatedItems = [];
        var listItem = list.filter(function (item) {
          if (item.itemKey == key || item.timeKey == key) {
            updatedItems.push(item);
            return true;
          }

          return false;
        });

        if (listItem && listItem.length > 0) {
          var idx = list.indexOf(listItem[0]);
          p = $.extend(true, {}, list[idx], p);
          p.timeKeyOld = p.timeKey;
          p.timeKey = Date.now();
          list[idx] = p;
          this.lists[listName] = list; // Trigger event

          this._triggerEvent("itemUpdated", {
            listName: listName,
            updatedItems: [p]
          }); // List changed


          this._listChanged(listName);
        }
      } // UI CODE -----------------

      /**
      * Get the parameters of a product by seaching elements with name attribute/data.
      * Product details will be return as an object
      * @param {Object} 
      */

    }, {
      key: "_getItemData",
      value: function _getItemData(elm) {
        var _this6 = this;

        var p = elm.data();
        elm.parents(this.options.productListItemSelector).find(this.options.productDataElementSelector).each(function (i, n) {
          var elm = $(n);
          var key = elm.is('[name]') ? elm.attr('name') : elm.data('name');

          if (key && _typeof(key) !== (typeof undefined === "undefined" ? "undefined" : _typeof(undefined))) {
            var val = _this6._getContent(elm);

            if (val) {
              p[key] = val;
            }
          }
        });
        return p;
      }
      /* 
       * Get the content of an HTML element irrespective of its type
       */

    }, {
      key: "_getContent",
      value: function _getContent(elm) {
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

    }, {
      key: "_renderList",
      value: function _renderList() {
        var _listName2,
            _this$lists$listName6,
            _this7 = this;

        var listName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        listName = (_listName2 = listName) !== null && _listName2 !== void 0 ? _listName2 : 'cart';
        var listElm = this.listContainer.find('.sc-list-cart');

        if (listElm.length == 0) {
          return;
        }

        var listData = (_this$lists$listName6 = this.lists[listName]) !== null && _this$lists$listName6 !== void 0 ? _this$lists$listName6 : [];

        if (listData.length == 0) {
          listElm.empty();
        } else {
          var timeKeys = []; // Add list elements

          listData.forEach(function (p) {
            var _p$timeKey;

            var timeKey = (_p$timeKey = p.timeKey) !== null && _p$timeKey !== void 0 ? _p$timeKey : '';
            timeKeys.push(timeKey); // Find if the item alredy exists in the cart

            var elmItem = listElm.find("[data-time-key='" + timeKey + "']");

            if (elmItem.length == 0) {
              var contentHtml = _this7._parseTemplate(_this7.options.listItemTemplate, p);

              if (contentHtml.length > 0) {
                elmItem = p.timeKeyOld ? listElm.find("[data-time-key='" + p.timeKeyOld + "']") : null;

                if (elmItem && elmItem.length > 0) {
                  elmItem.attr('data-time-key', timeKey);
                  elmItem.html(contentHtml);
                } else {
                  elmItem = $("<li data-time-key=".concat(timeKey, " class=\"list-group-item d-flex justify-content-between lh-sm\">").concat(contentHtml, "</li>"));
                  listElm.append(elmItem);
                }

                elmItem.append('<button type="button" class="sc-cart-remove">' + _this7.options.lang.cartRemove + '</button>');

                _this7._highlightElement(elmItem);
              }
            }
          }); // Remove reduntant elements

          listElm.children().each(function (index, elm) {
            if (!timeKeys.includes(parseInt($(elm).attr('data-time-key')))) {
              _this7._removeElement($(elm));
            }
          });
        }
      }
      /**
       * Highlight an element
       * 
       * @param {object} elm - Element to highlight
       */

    }, {
      key: "_highlightElement",
      value: function _highlightElement(elm) {
        // Apply the highlight effect
        if (this.options.highlightEffect === true) {
          elm.addClass('sc-highlight');
          setTimeout(function () {
            elm.removeClass('sc-highlight');
          }, 500);
        }
      }
      /**
       * Remove an element
       * 
       * @param {object} elm - Element
       */

    }, {
      key: "_removeElement",
      value: function _removeElement(elm) {
        elm.fadeOut("fast", function () {
          elm.remove();
        });
      } // OLD CODE ----------------------------------------------------------------        

      /* 
       * Cart submit functionalities
       */

    }, {
      key: "_submitCart",
      value: function _submitCart() {
        var mi = this;
        var formElm = this.listContainer.parents('form');

        if (!formElm) {
          this._logError('Form not found to submit');

          return false;
        }

        switch (this.options.submitSettings.submitType) {
          case 'ajax':
            var ajaxURL = this.options.submitSettings.ajaxURL && this.options.submitSettings.ajaxURL.length > 0 ? this.options.submitSettings.ajaxURL : formElm.attr('action');
            var ajaxSettings = $.extend(true, {}, {
              url: ajaxURL,
              type: "POST",
              data: formElm.serialize(),
              beforeSend: function beforeSend() {
                mi.cart_element.addClass('loading');
              },
              error: function error(jqXHR, status, message) {
                mi.cart_element.removeClass('loading');

                mi._logError(message);
              },
              success: function success(res) {
                mi.cart_element.removeClass('loading');

                mi._triggerEvent("cartSubmitted", [mi.cart]); // mi._clearCart();

              }
            }, this.options.submitSettings.ajaxSettings);
            $.ajax(ajaxSettings);
            break;

          case 'paypal':
            formElm.children('.sc-paypal-input').remove(); // Add paypal specific fields for cart products

            $.each(this.cart, function (i, p) {
              var itemNumber = i + 1;
              formElm.append('<input class="sc-paypal-input" name="item_number_' + itemNumber + '" value="' + mi._getValueOrEmpty(p[mi.options.paramSettings.productId]) + '" type="hidden">').append('<input class="sc-paypal-input" name="item_name_' + itemNumber + '" value="' + mi._getValueOrEmpty(p[mi.options.paramSettings.productName]) + '" type="hidden">').append('<input class="sc-paypal-input" name="amount_' + itemNumber + '" value="' + mi._getValueOrEmpty(p[mi.options.paramSettings.productPrice]) + '" type="hidden">').append('<input class="sc-paypal-input" name="quantity_' + itemNumber + '" value="' + mi._getValueOrEmpty(p[mi.options.paramSettings.productQuantity]) + '" type="hidden">');
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

    }, {
      key: "_getValueOrEmpty",
      value: function _getValueOrEmpty(v) {
        return v && _typeof(v) !== (typeof undefined === "undefined" ? "undefined" : _typeof(undefined)) ? v : '';
      }
      /* 
       * Log error to console and terminate execution
       */

    }, {
      key: "_logError",
      value: function _logError(msg) {
        if (this.options.debug !== true) {
          return false;
        } // Log error


        $.error(msg);
      } // HELPER FUNCTIONS
      // PUBLIC FUNCTIONS

      /**
       * Render lists
       */

    }, {
      key: "render",
      value: function render() {
        this._renderProductList();
      }
      /* 
       * Public function to clear the cart
       */

    }, {
      key: "clear",
      value: function clear(listName) {
        if (listName == undefined) return;

        this._clearList(listName);

        this._renderList(listName);
      }
      /* 
       * Public function to sumbit the cart
       */

    }, {
      key: "submit",
      value: function submit() {
        this._submitCart();
      }
    }, {
      key: "reset",
      value: function reset() {
        // Reset all
        this._init();

        this._load();
      }
    }, {
      key: "setOptions",
      value: function setOptions(options) {
        this.options = $.extend(true, {}, this.options, options);

        this._init();
      }
    }, {
      key: "getOptions",
      value: function getOptions() {
        return this.options;
      }
    }, {
      key: "loader",
      value: function loader(state) {
        this.listContainer.toggleClass(this.options.style.loaderCss, state === "show");
      }
    }]);

    return SmartCart;
  }(); // Wrapper for the plugin


  $.fn.smartCart = function (options) {
    if (options === undefined || _typeof(options) === 'object') {
      return this.each(function () {
        if (!$.data(this, "smartCart")) {
          $.data(this, "smartCart", new SmartCart(this, options));
        }
      });
    } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
      var instance = $.data(this[0], 'smartCart');

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
});