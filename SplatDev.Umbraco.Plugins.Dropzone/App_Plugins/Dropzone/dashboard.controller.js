(function () {
    "use strict";

    function DropzoneController($http) {
        var vm = this;

        vm.loading = false;
        vm.dragging = false;
        vm.parentMediaId = null;
        vm.queue = [];
        vm.mediaItems = [];

        var baseUrl = "/umbraco/api/dropzone/";

        function loadMedia() {
            $http.get(baseUrl + "GetMedia").then(function (r) {
                vm.mediaItems = r.data;
            });
        }

        vm.onFilesSelected = function (files) {
            if (!files) return;
            files.forEach(function (f) {
                vm.queue.push({ file: f, uploading: false, done: false, error: null });
            });
        };

        vm.uploadAll = function () {
            vm.queue.forEach(function (item) {
                if (item.done) return;
                item.uploading = true;
                var fd = new FormData();
                fd.append("file", item.file);
                if (vm.parentMediaId) fd.append("parentMediaId", vm.parentMediaId);
                $http.post(baseUrl + "Upload", fd, {
                    headers: { "Content-Type": undefined },
                    transformRequest: angular.identity
                }).then(function () {
                    item.uploading = false;
                    item.done = true;
                    loadMedia();
                }).catch(function (err) {
                    item.uploading = false;
                    item.error = err.data && err.data.error ? err.data.error : "Upload failed";
                });
            });
        };

        vm.deleteItem = function (key) {
            $http.delete(baseUrl + "Delete?mediaKey=" + key).then(function () {
                loadMedia();
            });
        };

        loadMedia();
    }

    angular.module("umbraco").controller("DropzoneController", DropzoneController);
}());
