angular.module("umbraco").controller("HiddenContentDashboardController", [
    "$scope",
    "$http",
    "editorService",
    function ($scope, $http, editorService) {
        // Umbraco 13 counterpart. The previous version had a "Node ID" number box for the
        // single case and a second box wanting "Node IDs (comma-separated)" for bulk —
        // two ways to type an identifier an editor cannot see. One picker covers both.
        var api = "/umbraco/api/hiddencontent";

        $scope.loading = true;
        $scope.busy = false;
        $scope.hidden = [];
        $scope.selection = [];
        $scope.result = null;

        $scope.load = function () {
            $scope.loading = true;
            $http.get(api + "/GetHiddenNodes")
                .then(function (r) { $scope.hidden = r.data; })
                .finally(function () { $scope.loading = false; });
        };

        $scope.pick = function () {
            editorService.contentPicker({
                multiPicker: true,
                submit: function (model) {
                    $scope.selection = (model.selection || []).map(function (n) {
                        return { key: n.key || n.udi, name: n.name };
                    });
                    editorService.close();
                },
                close: function () { editorService.close(); }
            });
        };

        $scope.clear = function () { $scope.selection = []; };

        function post(action, nodes) {
            $scope.busy = true;
            $scope.result = null;
            $http.post(api + "/" + action, { nodes: nodes })
                .then(function (r) {
                    $scope.result = r.data;
                    $scope.selection = [];
                    $scope.load();
                }, function (r) {
                    $scope.result = (r.data && r.data.message)
                        ? r.data
                        : { success: false, message: "The request failed." };
                })
                .finally(function () { $scope.busy = false; });
        }

        $scope.hide = function () {
            post("Hide", $scope.selection.map(function (n) { return String(n.key); }));
        };

        $scope.show = function () {
            post("Show", $scope.selection.map(function (n) { return String(n.key); }));
        };

        $scope.restoreOne = function (node) {
            post("Show", [String(node.key)]);
        };

        $scope.load();
    }
]);
