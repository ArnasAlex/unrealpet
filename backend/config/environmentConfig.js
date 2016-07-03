/// <reference path='./../typings/refs.d.ts' />
var fs = require('fs');
var path = require('path');
var EnvironmentConfig = (function () {
    function EnvironmentConfig() {
    }
    EnvironmentConfig.getEnvironment = function () {
        if (!EnvironmentConfig.env) {
            EnvironmentConfig.resolveEnvironment();
        }
        return EnvironmentConfig.env;
    };
    EnvironmentConfig.isLocalEnvironment = function () {
        return this.getEnvironment() === Environment.Local;
    };
    EnvironmentConfig.getConfig = function () {
        if (!EnvironmentConfig.values) {
            EnvironmentConfig.resolveEnvironment();
        }
        return EnvironmentConfig.values;
    };
    EnvironmentConfig.getConnectionString = function () {
        if (EnvironmentConfig.mongoUrl == null) {
            EnvironmentConfig.resolveEnvironment();
        }
        return EnvironmentConfig.mongoUrl;
    };
    EnvironmentConfig.resolveEnvironment = function () {
        if (EnvironmentConfig.existsEnvironmentFile()) {
            EnvironmentConfig.resolveConfigFromFile();
        }
        else {
            EnvironmentConfig.resolveConfigStatic();
        }
        EnvironmentConfig.assignVariables();
    };
    EnvironmentConfig.assignVariables = function () {
        EnvironmentConfig.env = EnvironmentConfig.values.env;
        EnvironmentConfig.mongoUrl = EnvironmentConfig.values.mongoUrl;
    };
    EnvironmentConfig.resolveConfigStatic = function () {
        var env = EnvironmentConfig.getStaticEnvironmentType();
        var configs = [];
        configs[Environment.Local] = EnvironmentConfig.getLocalConfig();
        configs[Environment.Test] = EnvironmentConfig.getTestConfig();
        EnvironmentConfig.values = configs[env];
    };
    EnvironmentConfig.getStaticEnvironmentType = function () {
        var env;
        if (process.env.OPENSHIFT_NODEJS_PORT) {
            env = Environment.Test;
        }
        else {
            env = Environment.Local;
        }
        return env;
    };
    EnvironmentConfig.existsEnvironmentFile = function () {
        var envFilePath = EnvironmentConfig.getEnvironmentConfigFilePath();
        return fs.existsSync(envFilePath);
    };
    EnvironmentConfig.resolveConfigFromFile = function () {
        var envFilePath = EnvironmentConfig.getEnvironmentConfigFilePath();
        var cfg = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));
        EnvironmentConfig.values = cfg;
    };
    EnvironmentConfig.getEnvironmentConfigFilePath = function () {
        return path.join(__dirname, '../../build/environment.json');
    };
    EnvironmentConfig.getLocalConfig = function () {
        var port = 3000;
        var values = {
            env: Environment.Local,
            port: port,
            ip: '127.0.0.1',
            host: 'localhost:' + port,
            socketPort: port,
            uploadPath: './uploads',
            bundle: false,
            google: {
                clientId: 'xxx',
                clientSecret: 'xxx'
            },
            facebook: {
                clientId: 'xxx',
                clientSecret: 'xxx'
            },
            mongoUrl: 'mongodb://localhost/pet'
        };
        return values;
    };
    EnvironmentConfig.getTestConfig = function () {
        var values = {
            env: Environment.Test,
            ip: process.env.OPENSHIFT_NODEJS_IP,
            port: process.env.OPENSHIFT_NODEJS_PORT,
            host: 'xxx',
            socketPort: 8000,
            uploadPath: process.env.OPENSHIFT_DATA_DIR + '/uploads',
            bundle: false,
            google: {
                clientId: 'xxx',
                clientSecret: 'xxx'
            },
            facebook: {
                clientId: 'xxx',
                clientSecret: 'xxx'
            },
            mongoUrl: 'xxx'
        };
        return values;
    };
    return EnvironmentConfig;
})();
exports.EnvironmentConfig = EnvironmentConfig;
(function (Environment) {
    Environment[Environment["Local"] = 1] = "Local";
    Environment[Environment["Test"] = 2] = "Test";
    Environment[Environment["Production"] = 3] = "Production";
})(exports.Environment || (exports.Environment = {}));
var Environment = exports.Environment;
//# sourceMappingURL=environmentConfig.js.map