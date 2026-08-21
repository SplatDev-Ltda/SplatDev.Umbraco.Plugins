angular.module("umbraco").controller("ForumsDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        $scope.loading = true;
        $scope.categories = [];
        $scope.selectedCategory = null;
        $scope.threads = [];
        $scope.totalThreads = 0;
        $scope.page = 1;
        $scope.pageSize = 20;
        $scope.activeTab = "categories";

        $scope.loadCategories = function () {
            $scope.loading = true;
            $http.get("/umbraco/api/forums/GetCategories")
                .then(function (response) {
                    $scope.categories = response.data || [];
                })
                .catch(function () {
                    $scope.categories = [];
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.selectCategory = function (category) {
            $scope.selectedCategory = category;
            $scope.page = 1;
            $scope.loadThreads();
            $scope.activeTab = "threads";
        };

        $scope.loadThreads = function () {
            if (!$scope.selectedCategory) return;
            $scope.loading = true;
            var url = "/umbraco/api/forums/GetThreads?categoryId=" + $scope.selectedCategory.id
                + "&page=" + $scope.page + "&pageSize=" + $scope.pageSize;
            $http.get(url)
                .then(function (response) {
                    $scope.threads = response.data.threads || [];
                    $scope.totalThreads = response.data.total || 0;
                })
                .catch(function () {
                    $scope.threads = [];
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.lockThread = function (thread) {
            $http.post("/umbraco/api/forums/LockThread?threadId=" + thread.id + "&locked=" + !thread.isLocked)
                .then(function () {
                    thread.isLocked = !thread.isLocked;
                });
        };

        $scope.pinThread = function (thread) {
            $http.post("/umbraco/api/forums/PinThread?threadId=" + thread.id + "&pinned=" + !thread.isPinned)
                .then(function () {
                    thread.isPinned = !thread.isPinned;
                });
        };

        $scope.deleteThread = function (threadId) {
            if (!confirm("Delete this thread?")) return;
            $http.delete("/umbraco/api/forums/DeleteThread?threadId=" + threadId)
                .then(function () {
                    $scope.threads = $scope.threads.filter(function (t) { return t.id !== threadId; });
                    $scope.totalThreads--;
                });
        };

        $scope.setTab = function (tab) {
            $scope.activeTab = tab;
        };

        $scope.nextPage = function () {
            if ($scope.page * $scope.pageSize < $scope.totalThreads) {
                $scope.page++;
                $scope.loadThreads();
            }
        };

        $scope.prevPage = function () {
            if ($scope.page > 1) {
                $scope.page--;
                $scope.loadThreads();
            }
        };

        $scope.formatDate = function (dateStr) {
            if (!dateStr) return "";
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric"
            });
        };

        $scope.loadCategories();
    }
]);
