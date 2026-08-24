// Umbraco 13 view of the same figures the Lit dashboard shows on 17.
//
// What was here before was a placeholder: a save() that set a flag after a setTimeout and
// reported "Settings saved successfully" without calling anything. There was also no
// package.manifest, so this file was never loaded by Umbraco either way.
angular.module("umbraco").controller("AnalyticsDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        var api = "/umbraco/backoffice/api/AnalyticsApi";

        $scope.loading = true;
        $scope.error = null;
        $scope.days = 30;
        $scope.summary = null;
        $scope.entry = [];
        $scope.exit = [];
        $scope.visits = null;

        function fail(response) {
            // Saying which call failed and why beats an empty dashboard that looks like a
            // site with no traffic.
            $scope.error =
                response && response.status === 401
                    ? "You are not authorised to read analytics."
                    : "Could not load analytics" +
                      (response && response.status ? " — the server returned " + response.status + "." : ".");
        }

        $scope.chartHeight = function (count) {
            if (!$scope.summary || !$scope.summary.daily || !$scope.summary.daily.length) return 0;
            var peak = 1;
            $scope.summary.daily.forEach(function (d) { if (d.count > peak) peak = d.count; });
            return Math.round((count / peak) * 100);
        };

        $scope.load = function () {
            $scope.loading = true;
            $scope.error = null;

            $http.get(api + "/summary?days=" + $scope.days)
                .then(function (r) { $scope.summary = r.data; }, fail);

            $http.get(api + "/by-entry-url?take=10")
                .then(function (r) { $scope.entry = r.data; }, fail);

            $http.get(api + "/by-exit-url?take=10")
                .then(function (r) { $scope.exit = r.data; }, fail);

            $http.get(api + "/visits?page=1&pageSize=20")
                .then(function (r) { $scope.visits = r.data; }, fail)
                ["finally"](function () { $scope.loading = false; });
        };

        $scope.setDays = function (days) {
            $scope.days = days;
            $scope.load();
        };

        $scope.load();
    }
]);
