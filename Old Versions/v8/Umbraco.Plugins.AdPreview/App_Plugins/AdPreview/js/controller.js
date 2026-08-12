angular.module("umbraco").controller("AdPreview.Controller", function ($scope, editorService) {
    'use strict';
    const vm = this;
    const defaultModel = {
        img: '',
        title: '',
        description: '',
        url: '',
        tooltip: '',
        referrer: '',
        css: '',
        overlay: false
    };
    vm.model = Object.assign(defaultModel);
    vm.edit = function () {
        const options = {
            title: "Edit Ad Image",
            view: '/App_Plugins/AdPreview/views/edit.html',
            size: 'small',
            ad: vm.model,
            submit: (model) => {
                vm.model = model;
                $scope.model.value = model;
                editorService.close();
            },
            close: () => {
                editorService.close();
            }
        };
        editorService.open(options);
    }
    vm.remove = function () {
        vm.model = Object.assign(defaultModel);
        $scope.model.value = Object.assign(defaultModel);
    };
    function init() {
        if ($scope.model.value !== undefined && $scope.model.value !== '') vm.model = $scope.model.value;
    }
    init();
});