angular.module("umbraco").controller("CustomLoginDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        $scope.loading = true;
        $scope.saving = false;
        $scope.message = null;
        $scope.settings = {
            brandName: "",
            logoUrl: "",
            backgroundColor: "#ffffff",
            accentColor: "#1a73e8",
            supportEmail: "",
            enableSso: false
        };

        $scope.load = function () {
            $scope.loading = true;
            $http.get("/umbraco/api/customlogin/GetSettings")
                .then(function (response) {
                    $scope.settings = response.data || $scope.settings;
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.save = function () {
            $scope.saving = true;
            $scope.message = null;
            $http.post("/umbraco/api/customlogin/SaveSettings", $scope.settings)
                .then(function () {
                    $scope.message = { type: "success", text: "Settings saved successfully." };
                })
                .catch(function () {
                    $scope.message = { type: "error", text: "Failed to save settings." };
                })
                .finally(function () {
                    $scope.saving = false;
                });
        };

        // Init
        $scope.load();
    }
]);
