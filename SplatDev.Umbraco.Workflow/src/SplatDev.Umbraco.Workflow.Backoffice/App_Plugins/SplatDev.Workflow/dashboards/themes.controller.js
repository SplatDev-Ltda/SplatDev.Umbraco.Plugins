(function () {
    'use strict';

    angular.module('umbraco').controller('SplatWorkflow.ThemesController', [
        '$scope', 'splatWorkflow.resource', 'splatWorkflow.themeService',
        function ($scope, resource, themeService) {
            var vm = this;
            vm.themes = [];
            vm.selectedTheme = themeService.current();

            vm.load = function () {
                resource.listThemes().then(function (themes) {
                    vm.themes = themes;
                });
            };

            vm.selectTheme = function (name) {
                themeService.set(name);
                vm.selectedTheme = name;
            };

            vm.load();
        }]);
})();
