angular.module("umbraco").controller("DefaultValueDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        $scope.loading = true;
        $scope.rules = [];
        $scope.editingRule = null;
        $scope.showForm = false;
        $scope.saving = false;
        $scope.filterAlias = "";

        $scope.loadRules = function () {
            $scope.loading = true;
            $http.get("/umbraco/api/defaultvalue/GetRules")
                .then(function (response) {
                    $scope.rules = response.data || [];
                })
                .catch(function () {
                    $scope.rules = [];
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.filteredRules = function () {
            if (!$scope.filterAlias) return $scope.rules;
            var f = $scope.filterAlias.toLowerCase();
            return $scope.rules.filter(function (r) {
                return r.documentTypeAlias.toLowerCase().indexOf(f) >= 0
                    || r.propertyAlias.toLowerCase().indexOf(f) >= 0;
            });
        };

        $scope.newRule = function () {
            $scope.editingRule = {
                documentTypeAlias: "",
                propertyAlias: "",
                defaultValue: "",
                isEnabled: true,
                priority: 0
            };
            $scope.showForm = true;
        };

        $scope.editRule = function (rule) {
            $scope.editingRule = angular.copy(rule);
            $scope.showForm = true;
        };

        $scope.cancelEdit = function () {
            $scope.editingRule = null;
            $scope.showForm = false;
        };

        $scope.saveRule = function () {
            if (!$scope.editingRule) return;
            $scope.saving = true;
            $http.post("/umbraco/api/defaultvalue/SaveRule", $scope.editingRule)
                .then(function () {
                    $scope.showForm = false;
                    $scope.editingRule = null;
                    $scope.loadRules();
                })
                .catch(function () {
                    alert("Failed to save rule.");
                })
                .finally(function () {
                    $scope.saving = false;
                });
        };

        $scope.deleteRule = function (rule) {
            if (!confirm("Delete this rule?")) return;
            $http.delete("/umbraco/api/defaultvalue/DeleteRule?id=" + rule.id)
                .then(function () {
                    $scope.loadRules();
                });
        };

        // Init
        $scope.loadRules();
    }
]);
