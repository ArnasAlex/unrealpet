var http = require('http');
var app = require('./application');
var config = require('../config/environmentConfig');
var WebServer = (function () {
    function WebServer() {
    }
    WebServer.prototype.start = function () {
        var _this = this;
        this.config = config.EnvironmentConfig.getConfig();
        this.application = new app.Application();
        this.application.app.set('port', this.config.port);
        this.server = http.createServer(this.application.app);
        this.server.listen(this.config.port, this.config.ip);
        this.server.on('error', function (err) { _this.onError(err); });
        this.server.on('listening', function () { _this.onListening(); });
    };
    WebServer.prototype.onListening = function () {
        console.log('Web server started on ' + this.config.ip + ':' + this.config.port);
    };
    WebServer.prototype.onError = function (error) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        switch (error.code) {
            case 'EACCES':
                console.error(this.config.port + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(this.config.port + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    };
    return WebServer;
})();
exports.WebServer = WebServer;
//# sourceMappingURL=webServer.js.map