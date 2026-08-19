angular.module("umbraco").controller("TwoFactorDashboardController", [
    "$scope",
    "$http",
    "editorService",
    function ($scope, $http, editorService) {
        // Administrative view only. Enrolment and backup-code generation deliberately live
        // on the member self-service endpoints and are not reachable from here: an
        // administrator who could read a member's TOTP secret or mint their backup codes
        // could sign in as them, which defeats the point of 2FA. What an administrator
        // legitimately needs is to see status and revoke access for a lost device.
        //
        // The member is picked, not typed. The previous version asked for a numeric member
        // id, which is not shown anywhere in the backoffice — finding one meant querying
        // the database.
        var api = "/umbraco/api/twofactor/admin";

        $scope.loading = false;
        $scope.member = null;
        $scope.status = null;
        $scope.message = null;

        $scope.pickMember = function () {
            editorService.memberPicker({
                multiPicker: false,
                submit: function (model) {
                    var picked = model.selection && model.selection[0];
                    if (picked) {
                        $scope.member = { key: picked.key || picked.udi, name: picked.name };
                        $scope.status = null;
                        $scope.message = null;
                    }
                    editorService.close();
                },
                close: function () { editorService.close(); }
            });
        };

        $scope.checkStatus = function () {
            if (!$scope.member) return;
            $scope.loading = true;
            $scope.message = null;
            $http.get(api + "/IsEnabled?member=" + encodeURIComponent($scope.member.key))
                .then(function (r) {
                    $scope.status = r.data.enabled;
                    if (r.data.memberName) $scope.member.name = r.data.memberName;
                }, function () {
                    $scope.status = null;
                    $scope.message = { type: "error", text: "That member could not be found." };
                })
                .finally(function () { $scope.loading = false; });
        };

        $scope.disable = function () {
            if (!confirm("Revoke 2FA for this member? They will need to enrol again.")) return;
            $scope.loading = true;
            $http.post(api + "/Disable?member=" + encodeURIComponent($scope.member.key))
                .then(function (r) {
                    $scope.status = false;
                    $scope.message = { type: "success", text: r.data.message || "2FA revoked." };
                }, function () {
                    $scope.message = { type: "error", text: "Could not revoke 2FA." };
                })
                .finally(function () { $scope.loading = false; });
        };
    }
]);
