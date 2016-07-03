/// <reference path='../../backend/typings/refs.d.ts' />
import fs = require('fs');

export class DeployHelper {
    public static getConfig(): IDeployConfig {
        var config = JSON.parse(fs.readFileSync('./build/deploy.json', 'utf8'));
        return config;
    }

    public static getPackageJson(){
        var packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        return packageJson;
    }
}