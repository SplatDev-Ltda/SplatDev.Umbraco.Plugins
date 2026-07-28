angular.module("umbraco").controller("DictionaryManagerDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        $scope.loading = false;
        $scope.saved = false;
        $scope.message = null;

        $scope.save = function () {
            $scope.loading = true;
            $scope.message = null;
            // TODO: implement save via API
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.loading = false;
                    $scope.saved = true;
                    $scope.message = { type: "success", text: "Settings saved successfully." };
                });
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.saved = false;
                    });
                }, 3000);
            }, 500);
        };
    }
]);
