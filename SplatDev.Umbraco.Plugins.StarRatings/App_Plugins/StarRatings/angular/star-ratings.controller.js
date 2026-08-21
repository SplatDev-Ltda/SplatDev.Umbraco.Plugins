(function () {
    "use strict";

    angular
        .module("umbraco")
        .controller("StarRatings.DashboardController", StarRatingsDashboardController);

    StarRatingsDashboardController.$inject = ["$scope", "$http"];

    function StarRatingsDashboardController($scope, $http) {
        var vm = this;

        vm.loading = false;
        vm.topRated = [];
        vm.error = null;
        vm.count = 10;

        vm.load = load;

        function load() {
            vm.loading = true;
            vm.error = null;

            $http.get("/umbraco/api/starratings/GetTopRated?count=" + vm.count)
                .then(function (response) {
                    vm.topRated = response.data;
                })
                .catch(function (err) {
                    vm.error = "Failed to load top-rated content. " + (err.statusText || "");
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        load();
    }
})();
