self.onmessage = function(event) {
    var loader = event.data[2];
    self.x = 10;
    if (loader.length > 0) {
        event.data[2] = '';
        var _ = null;
        var math = null;
        var Decimal = null;
        eval(loader);
        if (typeof(self._) !== 'undefined') {
            _ = self._;
        }
        if (typeof(self.math) !== 'undefined') {
            math = self.math;
        }
        if (typeof(self.Decimal) !== 'undefined') {
            Decimal = self.Decimal;
        }
        // run
        self.onmessage(event);
    }
};
