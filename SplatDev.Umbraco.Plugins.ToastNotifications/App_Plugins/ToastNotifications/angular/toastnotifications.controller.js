angular.module("umbraco").controller("ToastNotificationsDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        // Umbraco 13 counterpart of the Lit dashboard. The previous v13 view was static
        // HTML with no controller at all — it described the plugin rather than operating it.
        var api = "/umbraco/api/toastnotifications";

        var EMPTY = {
            title: "", body: "", type: "info",
            isActive: true, startDate: null, endDate: null
        };

        $scope.toasts = [];
        $scope.loading = true;
        $scope.busy = false;
        $scope.editingId = null;
        $scope.draft = angular.copy(EMPTY);
        $scope.msg = null;

        $scope.load = function () {
            $scope.loading = true;
            // GetAll, not GetActive: a scheduled or expired toast must still be manageable.
            $http.get(api + "/GetAll")
                .then(function (r) { $scope.toasts = r.data; })
                .finally(function () { $scope.loading = false; });
        };

        $scope.stateOf = function (t) {
            var now = Date.now();
            if (!t.isActive) return "Disabled";
            if (t.startDate && Date.parse(t.startDate) > now) return "Scheduled";
            if (t.endDate && Date.parse(t.endDate) < now) return "Expired";
            return "Showing";
        };

        $scope.edit = function (t) {
            $scope.editingId = t.id;
            $scope.draft = {
                title: t.title, body: t.body, type: t.type,
                isActive: t.isActive, startDate: t.startDate, endDate: t.endDate
            };
            $scope.msg = null;
        };

        $scope.cancel = function () {
            $scope.editingId = null;
            $scope.draft = angular.copy(EMPTY);
            $scope.msg = null;
        };

        $scope.save = function () {
            if (!$scope.draft.title) {
                $scope.msg = { ok: false, text: "Give the toast a title." };
                return;
            }
            $scope.busy = true;
            $scope.msg = null;

            var editing = $scope.editingId !== null;
            var req = editing
                ? $http.put(api + "/Update?id=" + $scope.editingId, $scope.draft)
                : $http.post(api + "/Create", $scope.draft);

            req.then(function () {
                $scope.msg = { ok: true, text: editing ? "Toast updated." : "Toast created." };
                $scope.cancel();
                $scope.load();
            }, function () {
                $scope.msg = { ok: false, text: "Could not save the toast." };
            }).finally(function () { $scope.busy = false; });
        };

        $scope.remove = function (t) {
            if (!confirm('Delete "' + t.title + '"?')) return;
            $scope.busy = true;
            $http.delete(api + "/Delete?id=" + t.id)
                .then(function () {
                    $scope.msg = { ok: true, text: '"' + t.title + '" deleted.' };
                    if ($scope.editingId === t.id) $scope.cancel();
                    $scope.load();
                }, function () {
                    $scope.msg = { ok: false, text: "Could not delete." };
                })
                .finally(function () { $scope.busy = false; });
        };

        $scope.load();
    }
]);
