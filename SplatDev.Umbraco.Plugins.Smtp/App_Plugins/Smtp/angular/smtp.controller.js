angular.module("umbraco").controller("SmtpDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        // The Umbraco 13 counterpart of the Lit dashboard. Both read the live
        // configuration and send a real test message; neither can write settings,
        // because they come from IConfiguration.
        var api = "/umbraco/api/smtp";

        $scope.loading = true;
        $scope.sending = false;
        $scope.settings = null;
        $scope.loadError = null;
        $scope.recipient = "";
        $scope.result = null;

        $scope.load = function () {
            $scope.loading = true;
            $scope.loadError = null;
            $http.get(api + "/GetSettings")
                .then(function (r) {
                    $scope.settings = r.data;
                }, function (r) {
                    $scope.loadError = "Could not read the SMTP configuration (" + r.status + ").";
                })
                .finally(function () { $scope.loading = false; });
        };

        $scope.sendTest = function () {
            $scope.sending = true;
            $scope.result = null;
            var q = $scope.recipient
                ? "?to=" + encodeURIComponent($scope.recipient)
                : "";
            $http.post(api + "/SendTest" + q)
                .then(function (r) {
                    $scope.result = r.data;
                }, function (r) {
                    $scope.result = {
                        success: false,
                        message: "The request failed.",
                        error: "HTTP " + r.status
                    };
                })
                .finally(function () { $scope.sending = false; });
        };

        $scope.load();
    }
]);
