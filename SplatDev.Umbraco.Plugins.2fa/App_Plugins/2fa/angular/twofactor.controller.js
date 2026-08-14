angular.module("umbraco").controller("TwoFactorDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        // Administrative view only. Enrolment (SetupTotp / VerifyTotp) and backup-code
        // generation deliberately live on the member self-service endpoints and are not
        // reachable from here: an administrator who could read a member's TOTP secret or
        // mint their backup codes could sign in as them, which defeats the point of 2FA.
        // What an administrator legitimately needs is to see status and to revoke access
        // for someone who has lost their device.
        var api = "/umbraco/api/twofactor/admin";

        $scope.loading = false;
        $scope.memberId = null;
        $scope.status = null;
        $scope.message = null;

        function fail(text) {
            return function () {
                $scope.message = { type: "error", text: text };
            };
        }

        $scope.checkStatus = function () {
            if (!$scope.memberId) return;
            $scope.loading = true;
            $scope.message = null;
            $http.get(api + "/IsEnabled?memberId=" + encodeURIComponent($scope.memberId))
                .then(function (r) {
                    $scope.status = r.data.enabled;
                }, fail("Could not read 2FA status for that member."))
                .finally(function () { $scope.loading = false; });
        };

        $scope.disable = function () {
            if (!confirm("Revoke 2FA for this member? They will need to enrol again.")) return;
            $scope.loading = true;
            $http.post(api + "/Disable?memberId=" + encodeURIComponent($scope.memberId))
                .then(function () {
                    $scope.status = false;
                    $scope.message = { type: "success", text: "2FA revoked for member." };
                }, fail("Could not revoke 2FA."))
                .finally(function () { $scope.loading = false; });
        };
    }
]);
