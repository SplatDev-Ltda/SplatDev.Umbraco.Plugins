// Umbraco 13 half of the Default Value editor.
//
// The Umbraco 7/8 controller assigned the configured value on every load, which discarded
// anything set on the page. The default is applied only when the property is empty.
angular.module("umbraco").controller("splatDev.DefaultValue.Controller", function ($scope) {
    "use strict";
    var vm = this;

    vm.dValue = ($scope.model.config && $scope.model.config.dValue) || null;
    vm.value = $scope.model.value;

    if (vm.dValue !== null && vm.dValue !== "" && (vm.value === null || vm.value === undefined || vm.value === "")) {
        $scope.model.value = vm.dValue;
        vm.value = vm.dValue;
    }
});
