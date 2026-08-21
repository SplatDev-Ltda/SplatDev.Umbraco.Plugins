angular.module("umbraco").controller("MemberLoginDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        $scope.loading = false;
        $scope.activeTab = "overview";
        $scope.loginResult = null;
        $scope.resetResult = null;

        $scope.loginModel = {
            username: "",
            password: "",
            rememberMe: false
        };

        $scope.forgotModel = {
            email: ""
        };

        $scope.resetModel = {
            email: "",
            token: "",
            newPassword: ""
        };

        $scope.setTab = function (tab) {
            $scope.activeTab = tab;
            $scope.loginResult = null;
            $scope.resetResult = null;
        };

        $scope.testLogin = function () {
            $scope.loading = true;
            $scope.loginResult = null;
            $http.post("/umbraco/api/memberlogin/Login", $scope.loginModel)
                .then(function (response) {
                    $scope.loginResult = { success: true, message: response.data.message };
                })
                .catch(function (err) {
                    $scope.loginResult = {
                        success: false,
                        message: err.data && err.data.message ? err.data.message : "Login failed.",
                        lockedOut: err.status === 423
                    };
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.sendForgotPassword = function () {
            $scope.loading = true;
            $scope.resetResult = null;
            $http.post("/umbraco/api/memberlogin/ForgotPassword", $scope.forgotModel)
                .then(function (response) {
                    $scope.resetResult = { success: true, message: response.data.message };
                })
                .catch(function () {
                    $scope.resetResult = { success: false, message: "Request failed." };
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.resetPassword = function () {
            $scope.loading = true;
            $scope.resetResult = null;
            $http.post("/umbraco/api/memberlogin/ResetPassword", $scope.resetModel)
                .then(function (response) {
                    $scope.resetResult = { success: true, message: response.data.message };
                })
                .catch(function (err) {
                    $scope.resetResult = {
                        success: false,
                        message: err.data && err.data.message ? err.data.message : "Reset failed."
                    };
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };
    }
]);
