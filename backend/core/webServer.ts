import http = require('http');
import app = require('./application');
import config = require('../config/environmentConfig');

export class WebServer {
    private server: http.Server;
    private application: app.Application;
    private config: config.IEnvironmentValues;

    constructor(){}

    start() {
        this.config = config.EnvironmentConfig.getConfig();
        this.application = new app.Application();
        this.application.app.set('port', this.config.port);

        this.server = http.createServer(this.application.app);

        this.server.listen(this.config.port, this.config.ip);

        this.server.on('error', (err) => {this.onError(err);});
        this.server.on('listening', () => {this.onListening();});
    }

    private onListening() {
        console.log('Web server started on ' + this.config.ip + ':' + this.config.port);
    }

    private onError(error) {
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
    }
}