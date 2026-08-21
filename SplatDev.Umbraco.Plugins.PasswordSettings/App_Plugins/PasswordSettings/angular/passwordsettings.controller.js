angular.module("umbraco").controller("PasswordSettingsDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        $scope.loading = true;
        $scope.saving = false;
        $scope.policy = null;
        $scope.validationResult = null;
        $scope.testPassword = "";
        $scope.successMessage = "";
        $scope.errorMessage = "";

        $scope.loadPolicy = function () {
            $scope.loading = true;
            $http.get("/umbraco/api/passwordsettings/GetPolicy")
                .then(function (response) {
                    $scope.policy = response.data;
                })
                .catch(function () {
                    $scope.errorMessage = "Failed to load policy.";
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.savePolicy = function () {
            if (!$scope.policy) return;
            $scope.saving = true;
            $scope.successMessage = "";
            $scope.errorMessage = "";
            $http.post("/umbraco/api/passwordsettings/SavePolicy", $scope.policy)
                .then(function (response) {
                    $scope.policy = response.data;
                    $scope.successMessage = "Policy saved successfully.";
                })
                .catch(function () {
                    $scope.errorMessage = "Failed to save policy.";
                })
                .finally(function () {
                    $scope.saving = false;
                });
        };

        $scope.validatePassword = function () {
            if (!$scope.testPassword) return;
            $http.post("/umbraco/api/passwordsettings/ValidatePassword", { password: $scope.testPassword })
                .then(function (response) {
                    $scope.validationResult = response.data;
                })
                .catch(function () {
                    $scope.validationResult = null;
                });
        };

        // Init
        $scope.loadPolicy();
    }
]);
