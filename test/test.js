describe('SmartCart Default Options', function() {
    var el, plugin;

    beforeEach(function(){
        jasmine.getFixtures().fixturesPath = 'base/test';
        loadFixtures('test-template.html');

        el = $('#smartcart');
        plugin = el.smartCart();
    });
    
    afterEach(function(){
        el.remove();
        el = null;
    });
    
    it('should add default theme to the main element', function() {
        expect(el).toHaveClass("sc-theme-default");
    });
    
    it('should add cart hidden element', function() {
        expect(el.children('#cart_list')).toExist();
    });
    
    it('should add cart list elements', function() {
        expect(el.children('.sc-cart-heading')).toExist();
        expect(el.children('.sc-cart-item-list')).toExist();
    });
    
    it('should add cart toolbar elements', function() {
        var toolbar = el.children('.sc-toolbar');
        expect(toolbar).toExist();
        expect(toolbar.children('.sc-cart-toolbar')).toExist();
        expect(toolbar.children('.sc-cart-summary')).toExist();
        
        var toolbarBtn = toolbar.children('.sc-cart-toolbar');
        expect(toolbarBtn.children('.sc-cart-checkout')).toExist();
        expect(toolbarBtn.children('.sc-cart-clear')).toExist();
    });
    
});