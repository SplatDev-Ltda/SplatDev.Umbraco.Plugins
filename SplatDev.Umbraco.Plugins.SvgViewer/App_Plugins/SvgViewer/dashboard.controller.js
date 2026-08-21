(function () {
    "use strict";

    function SvgViewerController($http, $sce) {
        var vm = this;
        vm.loading = false;
        vm.mediaKey = "";
        vm.items = [];
        vm.error = null;

        var baseUrl = "/umbraco/api/svgviewer/";

        vm.trustSvg = function (content) {
            return $sce.trustAsHtml(content);
        };

        vm.loadSingle = function () {
            vm.error = null;
            vm.items = [];
            $http.get(baseUrl + "GetSvg?mediaKey=" + encodeURIComponent(vm.mediaKey))
                .then(function (r) { vm.items = [r.data]; })
                .catch(function (e) { vm.error = e.data || "Not found."; });
        };

        vm.loadAll = function () {
            vm.error = null;
            vm.items = [];
            vm.loading = true;
            $http.get(baseUrl + "GetAllSvg")
                .then(function (r) {
                    vm.items = r.data;
                    vm.loading = false;
                })
                .catch(function (e) {
                    vm.error = e.data || "Error loading SVGs.";
                    vm.loading = false;
                });
        };
    }

    angular.module("umbraco").controller("SvgViewerController", SvgViewerController);
}());
