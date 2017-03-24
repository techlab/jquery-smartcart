describe('Plugin Default Init', function() {
    var el, plugin;

    beforeEach(function(){
        el = $('<div id="test-element"></div>');
        $(document.body).append(el);
        plugin = el.smartCart();
    });
    
    afterEach(function(){
        el.remove();
        el = null;
    });
    
    it('should add default theme to the element', function() {
        expect(el).toHaveClass("sc-theme-default");
    });
});

describe('Plugin with Option Init', function() {
    var el, plugin;

    beforeEach(function(){
        el = $('<div id="test-element"></div>');
        $(document.body).append(el);
        plugin = el.smartCart({ theme: 'blue'});
    });
    
    afterEach(function(){
        el.remove();
        el = null;
    });
    
    it('should add only blue theme to the element', function() {
        expect(el).toHaveClass("sc-theme-blue");
        expect(el).not.toHaveClass("theme-default");
    });
});