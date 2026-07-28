(function () {
    'use strict';

    angular.module('umbraco').controller('SplatWorkflow.DefinitionEditorController', [
        '$scope', 'splatWorkflow.resource',
        function ($scope, resource) {
            var vm = this;
            vm.definitions = [];
            vm.selected = null;
            vm.isNew = false;
            vm.editJson = '';

            vm.load = function () {
                resource.listDefinitions().then(function (defs) {
                    vm.definitions = defs;
                });
            };

            vm.select = function (def) {
                vm.selected = def;
                vm.isNew = false;
                vm.editJson = def.definitionJson;
            };

            vm.createNew = function () {
                vm.selected = null;
                vm.isNew = true;
                vm.editJson = '{\n  "key": "",\n  "label": "",\n  "version": 1,\n  "steps": []\n}';
            };

            vm.save = function () {
                var def = JSON.parse(vm.editJson);
                resource.saveDefinition({
                    key: def.key,
                    label: def.label,
                    version: def.version,
                    definitionJson: vm.editJson,
                    isActive: true
                }).then(function () {
                    vm.load();
                    vm.isNew = false;
                });
            };

            vm.load();
        }]);
})();
