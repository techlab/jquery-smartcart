import type { CartOptions } from './types';

export const defaults: CartOptions = {
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
