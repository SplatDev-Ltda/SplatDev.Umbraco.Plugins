(function () {
    "use strict";

    angular
        .module("umbraco")
        .controller("VisitorCounter.DashboardController", VisitorCounterDashboardController);

    VisitorCounterDashboardController.$inject = ["$scope", "$http"];

    function VisitorCounterDashboardController($scope, $http) {
        var vm = this;

        vm.loading = false;
        vm.stats = null;
        vm.dailyCounts = [];
        vm.error = null;
        vm.days = 30;

        vm.load = load;

        function load() {
            vm.loading = true;
            vm.error = null;

            var statsPromise = $http.get("/umbraco/api/visitorcounter/GetStats?days=" + vm.days);
            var dailyPromise = $http.get("/umbraco/api/visitorcounter/GetDailyCounts?days=" + vm.days);

            Promise.all([statsPromise, dailyPromise])
                .then(function (responses) {
                    vm.stats = responses[0].data;
                    vm.dailyCounts = responses[1].data;
                    $scope.$apply();
                })
                .catch(function (err) {
                    vm.error = "Failed to load visitor data. " + (err.statusText || "");
                    $scope.$apply();
                })
                .finally(function () {
                    vm.loading = false;
                    $scope.$apply();
                });
        }

        load();
    }
})();
