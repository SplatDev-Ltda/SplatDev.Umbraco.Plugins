(function () {
    'use strict';

    angular.module('umbraco').controller('SplatWorkflow.QueueController', [
        '$scope', 'splatWorkflow.resource', 'splatWorkflow.themeService',
        function ($scope, resource, themeService) {
            var vm = this;
            vm.filter = { workflowKey: null, status: 0, page: 1, pageSize: 50, assignedToMe: false, freeText: '' };
            vm.theme = themeService.current();
            vm.rows = [];
            vm.total = 0;
            vm.columns = [];

            vm.load = function () {
                resource.listInstances(vm.filter).then(function (result) {
                    vm.rows = result.items;
                    vm.total = result.totalCount;
                });
            };

            vm.transition = function (instanceId, actionKey) {
                resource.transition(instanceId, actionKey).then(vm.load);
            };

            vm.load();
        }]);
})();
