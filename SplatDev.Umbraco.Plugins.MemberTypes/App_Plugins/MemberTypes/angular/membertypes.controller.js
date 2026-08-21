angular.module("umbraco").controller("MemberTypesDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        $scope.loading = true;
        $scope.memberTypes = [];
        $scope.selectedType = null;

        $scope.load = function () {
            $scope.loading = true;
            $http.get("/umbraco/api/membertypes/GetAll")
                .then(function (response) {
                    $scope.memberTypes = response.data || [];
                })
                .catch(function () {
                    $scope.memberTypes = [];
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.selectType = function (type) {
            $scope.loading = true;
            $http.get("/umbraco/api/membertypes/GetByAlias?alias=" + type.alias)
                .then(function (response) {
                    $scope.selectedType = response.data;
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.back = function () {
            $scope.selectedType = null;
        };

        // Init
        $scope.load();
    }
]);
