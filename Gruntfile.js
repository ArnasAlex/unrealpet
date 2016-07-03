/// <reference path="backend/typings/refs.d.ts" />
var names = require('./tasks/taskNames');
(module).exports = function (grunt) {
    grunt.initConfig({
        ts: {
            frontend: {
                src: ['frontend/js/app/**/*.ts', 'test/frontend/spec/**/*.ts'],
                options: {
                    module: 'amd'
                }
            },
            backend: {
                src: ['backend/**/*.ts', 'tasks/**/*.ts', 'test/backend/spec/**/*.ts'],
                options: {
                    module: 'commonjs'
                }
            },
            mlt: {
                src: ['backend/core/multilang/**/*.ts'],
                options: {
                    module: 'commonjs'
                }
            }
        },
        jasmine_nodejs: {
            options: {
                specNameSuffix: "spec.js",
                helperNameSuffix: "helper.js",
                useHelpers: false,
                stopOnFailure: false,
                reporters: {
                    console: {
                        colors: true,
                        cleanStack: 1,
                        verbosity: 3,
                        listStyle: "indent",
                        activity: false
                    }
                },
                customReporters: []
            },
            your_target: {
                options: {
                    useHelpers: false
                },
                specs: [
                    "test/backend/spec/**/*"
                ],
                helpers: [
                    "test/helpers/**"
                ]
            }
        },
        requirejs: {
            compile: {
                options: {
                    name: 'requireConfig',
                    baseUrl: "./frontend/js/app",
                    mainConfigFile: "./frontend/js/app/requireConfig.js",
                    out: "./frontend/js/app/requireConfig-built.js"
                }
            }
        },
        execute: {
            bundle: {
                options: {
                    args: ['-o', 'build/bundleAndMinify.js']
                },
                src: ['./node_modules/requirejs/bin/r.js']
            }
        },
        nightwatch: {
            options: {
                standalone: true,
                jar_version: '2.42.2',
                jar_path: 'test/e2e/selenium/server.jar',
                jar_url: 'https://selenium-release.storage.googleapis.com/2.42/selenium-server-standalone-2.42.2.jar',
                src_folders: ['test/e2e/specs'],
                output_folder: 'test/e2e/report',
                test_settings: {
                    chrome_driver: "node_modules/chromedriver/lib/chromedriver/chromedriver",
                    desiredCapabilities: {
                        "browserName": "chrome",
                        "javascriptEnabled": true,
                        "acceptSslCerts": true,
                        "chromeOptions": {
                            "args": ["window-size=1280,800", "disable-web-security"]
                        }
                    },
                    selenium: {
                        "cli_args": {
                            "webdriver.chrome.driver": "node_modules/chromedriver/lib/chromedriver/chromedriver"
                        }
                    }
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-jasmine-nodejs');
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-nightwatch');
    grunt.loadTasks('./tasks/updateMultilang');
    grunt.loadTasks('./tasks/deploy');
    grunt.loadTasks('./tasks/backup');
    grunt.registerTask('compileFront', ['ts:frontend']);
    grunt.registerTask('compileBack', ['ts:backend']);
    grunt.registerTask('mlt', [names.TaskNames.updateMlt, 'ts:mlt']);
    grunt.registerTask('testBack', ['jasmine_nodejs']);
    grunt.registerTask('cb', ['compileBack']);
    grunt.registerTask('tb', ['testBack']);
    grunt.registerTask('ctb', ['compileBack', 'testBack']);
    grunt.registerTask('cf', ['compileFront']);
    grunt.registerTask('bundle', ['execute:bundle']);
};
//# sourceMappingURL=Gruntfile.js.map