angular.module("umbraco").controller("BlogDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        $scope.loading = true;
        $scope.posts = [];
        $scope.categories = [];
        $scope.tags = [];
        $scope.totalPosts = 0;
        $scope.page = 1;
        $scope.pageSize = 10;
        $scope.activeTab = "posts";

        $scope.loadPosts = function () {
            $scope.loading = true;
            $http.get("/umbraco/api/blog/GetPosts?page=" + $scope.page + "&pageSize=" + $scope.pageSize)
                .then(function (response) {
                    $scope.posts = response.data.posts || [];
                    $scope.totalPosts = response.data.total || 0;
                })
                .catch(function () {
                    $scope.posts = [];
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.loadCategories = function () {
            $http.get("/umbraco/api/blog/GetCategories")
                .then(function (response) {
                    $scope.categories = response.data || [];
                });
        };

        $scope.loadTags = function () {
            $http.get("/umbraco/api/blog/GetTags")
                .then(function (response) {
                    $scope.tags = response.data || [];
                });
        };

        $scope.setTab = function (tab) {
            $scope.activeTab = tab;
        };

        $scope.nextPage = function () {
            if ($scope.page * $scope.pageSize < $scope.totalPosts) {
                $scope.page++;
                $scope.loadPosts();
            }
        };

        $scope.prevPage = function () {
            if ($scope.page > 1) {
                $scope.page--;
                $scope.loadPosts();
            }
        };

        $scope.formatDate = function (dateStr) {
            if (!dateStr) return "";
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
            });
        };

        // Init
        $scope.loadPosts();
        $scope.loadCategories();
        $scope.loadTags();
    }
]);
