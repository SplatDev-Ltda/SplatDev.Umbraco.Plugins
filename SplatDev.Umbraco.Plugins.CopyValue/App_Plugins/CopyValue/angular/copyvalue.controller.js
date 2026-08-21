angular.module("umbraco").controller("CopyValueDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        $scope.loading = true;
        $scope.mappings = [];
        $scope.editingMapping = null;
        $scope.showForm = false;
        $scope.saving = false;
        $scope.activeTab = "mappings";

        // Copy operation form
        $scope.copyOp = {
            sourceContentId: null,
            targetContentId: null,
            selectedMappingId: null,
            publish: false,
            result: null
        };

        $scope.loadMappings = function () {
            $scope.loading = true;
            $http.get("/umbraco/api/copyvalue/GetMappings")
                .then(function (response) {
                    $scope.mappings = response.data || [];
                })
                .catch(function () {
                    $scope.mappings = [];
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.newMapping = function () {
            $scope.editingMapping = {
                name: "",
                sourceDocTypeAlias: "",
                targetDocTypeAlias: "",
                propertyMappingsJson: "[]"
            };
            $scope.showForm = true;
        };

        $scope.editMapping = function (mapping) {
            $scope.editingMapping = angular.copy(mapping);
            $scope.showForm = true;
        };

        $scope.cancelEdit = function () {
            $scope.editingMapping = null;
            $scope.showForm = false;
        };

        $scope.saveMapping = function () {
            if (!$scope.editingMapping) return;
            $scope.saving = true;
            $http.post("/umbraco/api/copyvalue/SaveMapping", $scope.editingMapping)
                .then(function () {
                    $scope.showForm = false;
                    $scope.editingMapping = null;
                    $scope.loadMappings();
                })
                .catch(function () {
                    alert("Failed to save mapping.");
                })
                .finally(function () {
                    $scope.saving = false;
                });
        };

        $scope.deleteMapping = function (mapping) {
            if (!confirm("Delete mapping '" + mapping.name + "'?")) return;
            $http.delete("/umbraco/api/copyvalue/DeleteMapping?id=" + mapping.id)
                .then(function () {
                    $scope.loadMappings();
                });
        };

        $scope.executeCopy = function () {
            var selectedMapping = $scope.mappings.find(function (m) {
                return m.id === $scope.copyOp.selectedMappingId;
            });
            if (!selectedMapping) {
                alert("Select a mapping template.");
                return;
            }
            var mappings;
            try {
                mappings = JSON.parse(selectedMapping.propertyMappingsJson);
            } catch (e) {
                alert("Invalid JSON in mapping template.");
                return;
            }
            var payload = {
                sourceContentId: parseInt($scope.copyOp.sourceContentId),
                targetContentId: parseInt($scope.copyOp.targetContentId),
                mappings: mappings,
                publish: $scope.copyOp.publish
            };
            $http.post("/umbraco/api/copyvalue/CopyProperties", payload)
                .then(function (response) {
                    $scope.copyOp.result = { success: true, message: response.data.message };
                })
                .catch(function () {
                    $scope.copyOp.result = { success: false, message: "Failed to copy properties." };
                });
        };

        $scope.setTab = function (tab) {
            $scope.activeTab = tab;
        };

        $scope.formatDate = function (dateStr) {
            if (!dateStr) return "—";
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric"
            });
        };

        // Init
        $scope.loadMappings();
    }
]);
