angular.module("umbraco").controller("GoogleAnalyticsDashboardController", [
    "$scope", "$http",
    function ($scope, $http) {
        $scope.loading = true;
        $scope.saved = false;
        $scope.message = null;
        $scope.settings = { measurementId: "", enabled: true };

        $http.get("/umbraco/api/analytics/GetSettings").then(function (response) {
            $scope.settings = response.data;
        }).catch(function () {
            $scope.message = { type: "error", text: "Unable to load settings." };
        }).finally(function () { $scope.loading = false; });

        $scope.save = function () {
            $scope.loading = true;
            $scope.message = null;
            $http.post("/umbraco/api/analytics/SaveSettings", $scope.settings).then(function () {
                $scope.saved = true;
                $scope.message = { type: "success", text: "Settings saved successfully." };
            }).catch(function () {
                $scope.message = { type: "error", text: "Unable to save settings." };
            }).finally(function () { $scope.loading = false; });
        };
    }
]);
