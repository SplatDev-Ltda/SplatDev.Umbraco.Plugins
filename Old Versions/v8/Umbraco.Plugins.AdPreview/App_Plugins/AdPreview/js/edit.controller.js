angular.module("umbraco").controller("AdPreview.Edit.Controller", function ($scope, editorService, localizationService) {
    'use strict';
    const vm = this;

    vm.buttonState = 'init';
    vm.loading = true;
    vm.model = null;
    vm.content = {
        name: 'Configure Ad',
        description: '',
        nameLocked: true,
        hideAlias: true,
        hideDescription: false,
        descriptionLocked: false,
        hideIcon: true
    }

    vm.close = function () {
        $scope.model.close();
    }
    vm.save = function () {
        $scope.model.submit(vm.model);
    }
    vm.openMediaPicker = function () {
        let mediaPickerOptions = {
            size: 'small',
            multiPicker: false,
            submit: function (model) {
                vm.model.img = model.selection[0].image;
                editorService.close();
            },
            close: function (oldModel) {
                editorService.close();
            }
        };
        editorService.mediaPicker(mediaPickerOptions);
    };

    function onInit() {
        vm.loading = false;
        vm.model = $scope.model.ad;
        localizationService.localize('local_instructions').then(data => {
            vm.content.description = data;
        });
    }

    onInit();
});