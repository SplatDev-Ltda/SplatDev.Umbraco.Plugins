angular.module("umbraco").controller("OnOffDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        $scope.loading = true;
        $scope.features = [];
        $scope.editingFeature = null;
        $scope.showForm = false;
        $scope.saving = false;

        $scope.loadFeatures = function () {
            $scope.loading = true;
            $http.get("/umbraco/api/onoff/GetAll")
                .then(function (response) {
                    $scope.features = response.data || [];
                })
                .catch(function () {
                    $scope.features = [];
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.newFeature = function () {
            $scope.editingFeature = {
                name: "",
                alias: "",
                description: "",
                isEnabled: false,
                scheduledEnableAt: null,
                scheduledDisableAt: null
            };
            $scope.showForm = true;
        };

        $scope.editFeature = function (feature) {
            $scope.editingFeature = angular.copy(feature);
            $scope.showForm = true;
        };

        $scope.cancelEdit = function () {
            $scope.editingFeature = null;
            $scope.showForm = false;
        };

        $scope.saveFeature = function () {
            if (!$scope.editingFeature) return;
            $scope.saving = true;
            $http.post("/umbraco/api/onoff/UpsertFeature", $scope.editingFeature)
                .then(function () {
                    $scope.showForm = false;
                    $scope.editingFeature = null;
                    $scope.loadFeatures();
                })
                .catch(function () {
                    alert("Failed to save feature toggle.");
                })
                .finally(function () {
                    $scope.saving = false;
                });
        };

        $scope.toggleFeature = function (feature) {
            var url = feature.isEnabled
                ? "/umbraco/api/onoff/Disable?alias=" + encodeURIComponent(feature.alias)
                : "/umbraco/api/onoff/Enable?alias=" + encodeURIComponent(feature.alias);
            $http.post(url)
                .then(function () {
                    $scope.loadFeatures();
                });
        };

        $scope.deleteFeature = function (feature) {
            if (!confirm("Delete feature '" + feature.name + "'?")) return;
            $http.delete("/umbraco/api/onoff/Delete?id=" + feature.id)
                .then(function () {
                    $scope.loadFeatures();
                });
        };

        $scope.formatDate = function (dateStr) {
            if (!dateStr) return "—";
            return new Date(dateStr).toLocaleString("en-US", {
                year: "numeric", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit"
            });
        };

        // Init
        $scope.loadFeatures();
    }
]);
