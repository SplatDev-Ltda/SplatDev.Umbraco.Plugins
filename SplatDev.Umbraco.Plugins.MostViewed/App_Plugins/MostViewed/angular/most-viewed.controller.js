(function () {
    "use strict";

    angular
        .module("umbraco")
        .controller("MostViewed.DashboardController", MostViewedDashboardController);

    MostViewedDashboardController.$inject = ["$scope", "$http"];

    function MostViewedDashboardController($scope, $http) {
        var vm = this;

        vm.loading = false;
        vm.pages = [];
        vm.error = null;
        vm.count = 10;
        vm.days = 30;

        vm.load = load;

        function load() {
            vm.loading = true;
            vm.error = null;

            $http.get("/umbraco/api/mostviewed/GetMostViewed?count=" + vm.count + "&days=" + vm.days)
                .then(function (response) {
                    vm.pages = response.data;
                })
                .catch(function (err) {
                    vm.error = "Failed to load most-viewed data. " + (err.statusText || "");
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        load();
    }
})();
