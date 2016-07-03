var Controller = (function () {
    function Controller() {
    }
    Controller.prototype.getConfig = function () {
        throw Error('Implement getConfig() on controller');
    };
    Controller.prototype.getPayload = function (req) {
        var payload;
        if (req.method === 'POST') {
            payload = req.body;
        }
        else {
            payload = req.query;
        }
        if (req.user && req.user.id) {
            payload.accountId = req.user.id;
        }
        return payload;
    };
    return Controller;
})();
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map