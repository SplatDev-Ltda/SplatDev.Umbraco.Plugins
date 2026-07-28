(function () {
    'use strict';

    angular.module('umbraco').factory('splatWorkflow.themeService', [function () {
        var currentTheme = 'classic';
        var manifests = {};

        return {
            current: function () { return currentTheme; },
            set: function (name) { currentTheme = name; },
            layoutForComponent: function (themeName, component) {
                var m = manifests[themeName];
                return (m && m.templates && m.templates[component]) || component;
            },
            registerManifest: function (manifest) {
                manifests[manifest.name] = manifest;
            }
        };
    }]);
})();
