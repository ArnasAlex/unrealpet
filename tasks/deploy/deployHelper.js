/// <reference path='../../backend/typings/refs.d.ts' />
var fs = require('fs');
var DeployHelper = (function () {
    function DeployHelper() {
    }
    DeployHelper.getConfig = function () {
        var config = JSON.parse(fs.readFileSync('./build/deploy.json', 'utf8'));
        return config;
    };
    DeployHelper.getPackageJson = function () {
        var packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        return packageJson;
    };
    return DeployHelper;
})();
exports.DeployHelper = DeployHelper;
//# sourceMappingURL=deployHelper.js.map