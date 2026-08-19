angular.module("umbraco").controller("RestrictedDashboardController", [
    "$scope",
    "$http",
    "editorService",
    function ($scope, $http, editorService) {
        // The Umbraco 13 counterpart of the Lit dashboard. Same rule: nothing is typed by
        // hand. The previous version asked for the node id of the page, the node id of the
        // login page, the node id of the error page, and a comma-separated list of group
        // names — none of which an editor can see anywhere in the backoffice.
        var api = "/umbraco/api/restricted";

        $scope.loading = true;
        $scope.saving = false;
        $scope.restricted = [];
        $scope.result = null;

        $scope.node = null;
        $scope.loginPage = null;
        $scope.errorPage = null;
        $scope.groups = [];

        $scope.load = function () {
            $scope.loading = true;
            $http.get(api + "/GetRestrictedNodes")
                .then(function (r) { $scope.restricted = r.data; })
                .finally(function () { $scope.loading = false; });
        };

        // ── pickers ──────────────────────────────────────────────────────────

        function pickContent(assign) {
            editorService.contentPicker({
                multiPicker: false,
                submit: function (model) {
                    var picked = model.selection && model.selection[0];
                    if (picked) {
                        assign({
                            key: picked.key || picked.udi,
                            name: picked.name
                        });
                    }
                    editorService.close();
                },
                close: function () { editorService.close(); }
            });
        }

        $scope.pickNode = function () {
            pickContent(function (v) { $scope.node = v; });
        };
        $scope.pickLoginPage = function () {
            pickContent(function (v) { $scope.loginPage = v; });
        };
        $scope.pickErrorPage = function () {
            pickContent(function (v) { $scope.errorPage = v; });
        };

        $scope.pickGroups = function () {
            editorService.memberGroupPicker({
                multiPicker: true,
                submit: function (model) {
                    $scope.groups = (model.selectedMemberGroups || model.selection || [])
                        .map(function (g) {
                            return { key: g.key || g.id, name: g.name };
                        });
                    editorService.close();
                },
                close: function () { editorService.close(); }
            });
        };

        $scope.clear = function (field) { $scope[field] = null; };

        // ── commands ─────────────────────────────────────────────────────────

        $scope.canSave = function () {
            return !!$scope.node && !$scope.saving;
        };

        $scope.save = function () {
            $scope.saving = true;
            $scope.result = null;
            $http.post(api + "/RestrictNode", {
                node: $scope.node ? String($scope.node.key) : "",
                loginPage: $scope.loginPage ? String($scope.loginPage.key) : "",
                errorPage: $scope.errorPage ? String($scope.errorPage.key) : "",
                memberGroups: $scope.groups.map(function (g) { return String(g.key); })
            }).then(function (r) {
                $scope.result = r.data;
                $scope.node = null;
                $scope.groups = [];
                $scope.load();
            }, function (r) {
                $scope.result = (r.data && r.data.message)
                    ? r.data
                    : { success: false, message: "The request failed." };
            }).finally(function () { $scope.saving = false; });
        };

        $scope.edit = function (entry) {
            $scope.node = { key: entry.node.key, name: entry.node.name };
            $scope.loginPage = entry.loginPage
                ? { key: entry.loginPage.key, name: entry.loginPage.name } : null;
            $scope.errorPage = entry.errorPage
                ? { key: entry.errorPage.key, name: entry.errorPage.name } : null;
            $scope.groups = entry.memberGroups.filter(function (g) {
                return g.key !== "00000000-0000-0000-0000-000000000000";
            });
            $scope.result = null;
        };

        $scope.remove = function (entry) {
            if (!confirm("Make \"" + entry.node.name + "\" public again? Everything beneath it becomes public too.")) return;
            $scope.result = null;
            $http.delete(api + "/UnrestrictNode?node=" + encodeURIComponent(entry.node.key))
                .then(function (r) {
                    $scope.result = r.data;
                    $scope.load();
                }, function () {
                    $scope.result = { success: false, message: "The request failed." };
                });
        };

        $scope.isMissingGroup = function (g) {
            return g.key === "00000000-0000-0000-0000-000000000000";
        };

        $scope.load();
    }
]);
