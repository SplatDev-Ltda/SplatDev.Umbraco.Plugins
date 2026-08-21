angular.module("umbraco").controller("MemberRegistrationDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        $scope.loading = false;
        $scope.activeTab = "overview";
        $scope.pendingMembers = [];
        $scope.result = null;

        $scope.registerModel = {
            name: "",
            email: "",
            username: "",
            password: "",
            memberTypeAlias: "Member"
        };

        $scope.verifyModel = {
            email: "",
            token: ""
        };

        $scope.setTab = function (tab) {
            $scope.activeTab = tab;
            $scope.result = null;
            if (tab === "pending") {
                $scope.loadPending();
            }
        };

        $scope.loadPending = function () {
            $scope.loading = true;
            $http.get("/umbraco/api/memberregistration/GetPending")
                .then(function (response) {
                    $scope.pendingMembers = response.data || [];
                })
                .catch(function () {
                    $scope.pendingMembers = [];
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.register = function () {
            $scope.loading = true;
            $scope.result = null;
            $http.post("/umbraco/api/memberregistration/Register", $scope.registerModel)
                .then(function (response) {
                    $scope.result = { success: true, message: response.data.message };
                })
                .catch(function (err) {
                    $scope.result = {
                        success: false,
                        message: err.data && err.data.message ? err.data.message : "Registration failed."
                    };
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.verifyEmail = function () {
            $scope.loading = true;
            $scope.result = null;
            $http.post("/umbraco/api/memberregistration/VerifyEmail", $scope.verifyModel)
                .then(function (response) {
                    $scope.result = { success: true, message: response.data.message };
                })
                .catch(function (err) {
                    $scope.result = {
                        success: false,
                        message: err.data && err.data.message ? err.data.message : "Verification failed."
                    };
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.approveMember = function (memberId) {
            $http.post("/umbraco/api/memberregistration/Approve?memberId=" + memberId)
                .then(function () {
                    $scope.loadPending();
                });
        };

        $scope.formatDate = function (dateStr) {
            if (!dateStr) return "";
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric"
            });
        };

        // Init
        $scope.loadPending();
    }
]);
