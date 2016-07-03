/// <reference path='./../typings/refs.d.ts' />
import fs = require('fs');
import path = require('path');

export class EnvironmentConfig {
    private static values: IEnvironmentValues;
    private static env: Environment;
    private static mongoUrl: string;

    public static getEnvironment() {
        if (!EnvironmentConfig.env) {
            EnvironmentConfig.resolveEnvironment();
        }

        return EnvironmentConfig.env;
    }

    public static isLocalEnvironment() {
        return this.getEnvironment() === Environment.Local;
    }

    public static getConfig(): IEnvironmentValues {
        if (!EnvironmentConfig.values) {
            EnvironmentConfig.resolveEnvironment();
        }

        return EnvironmentConfig.values;
    }

    public static getConnectionString(): string {
        if (EnvironmentConfig.mongoUrl == null) {
            EnvironmentConfig.resolveEnvironment();
        }

        return EnvironmentConfig.mongoUrl;
    }

    private static resolveEnvironment(){
        if (EnvironmentConfig.existsEnvironmentFile()){
            EnvironmentConfig.resolveConfigFromFile();
        }
        else{
            EnvironmentConfig.resolveConfigStatic();
        }

        EnvironmentConfig.assignVariables();
    }

    private static assignVariables(){
        EnvironmentConfig.env = EnvironmentConfig.values.env;
        EnvironmentConfig.mongoUrl = EnvironmentConfig.values.mongoUrl;
    }

    private static resolveConfigStatic() {
        var env = EnvironmentConfig.getStaticEnvironmentType();

        var configs = [];
        configs[Environment.Local] = EnvironmentConfig.getLocalConfig();
        configs[Environment.Test] = EnvironmentConfig.getTestConfig();
        EnvironmentConfig.values = configs[env];
    }

    private static getStaticEnvironmentType(): Environment {
        var env: Environment;
        if (process.env.OPENSHIFT_NODEJS_PORT){
            env = Environment.Test;
        }
        else{
            env = Environment.Local;
        }

        return env;
    }

    private static existsEnvironmentFile(): boolean {
        var envFilePath = EnvironmentConfig.getEnvironmentConfigFilePath();
        return fs.existsSync(envFilePath);
    }

    private static resolveConfigFromFile() {
        var envFilePath = EnvironmentConfig.getEnvironmentConfigFilePath();
        var cfg: IEnvironmentValues = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));
        EnvironmentConfig.values = cfg;
    }

    private static getEnvironmentConfigFilePath(): string {
        return path.join(__dirname, '../../build/environment.json');
    }

    private static getLocalConfig(): IEnvironmentValues {
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
    }

    private static getTestConfig(): IEnvironmentValues {
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
    }
}

export interface IEnvironmentValues {
    env: Environment;
    ip: string;
    port: number;
    host: string;
    socketPort: number;
    uploadPath: string;
    bundle: boolean;
    google: IGoogleCredentials;
    facebook: IFacebookCredentials;
    mongoUrl: string;
}

export interface IGoogleCredentials {
    clientId: string;
    clientSecret: string;
}

export interface IFacebookCredentials {
    clientId: string;
    clientSecret: string;
}

export enum Environment {
    Local = 1,
    Test = 2,
    Production = 3
}