({
    appDir: '../frontend',
    baseUrl: 'js/app',
    deps: ['lodash', 'jquery.fileupload', 'knockout', 'bootstrap'],
    dir: '../frontend-built',
    removeCombined: true,
    modules: [
        { name: 'requireConfig' }
    ],
    preserveLicenseComments: false,
    keepBuildDir: false,
    optimizeCss: 'standard',
    mainConfigFile: '../frontend/js/app/requireConfig.js'
})