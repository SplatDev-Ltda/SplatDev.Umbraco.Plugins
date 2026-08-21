angular.module("umbraco").controller("FaqsDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        $scope.loading = true;
        $scope.categories = [];
        $scope.items = [];
        $scope.totalItems = 0;
        $scope.searchQuery = "";
        $scope.searchResults = [];
        $scope.activeTab = "categories";

        $scope.loadCategories = function () {
            $scope.loading = true;
            $http.get("/umbraco/api/faqs/GetCategories?publishedOnly=false")
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

        $scope.loadItems = function () {
            $scope.loading = true;
            $http.get("/umbraco/api/faqs/GetItems?publishedOnly=false")
                .then(function (response) {
                    $scope.items = response.data.items || [];
                    $scope.totalItems = response.data.total || 0;
                })
                .catch(function () {
                    $scope.items = [];
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        $scope.search = function () {
            if (!$scope.searchQuery.trim()) {
                $scope.searchResults = [];
                return;
            }
            $http.get("/umbraco/api/faqs/Search?q=" + encodeURIComponent($scope.searchQuery) + "&publishedOnly=false")
                .then(function (response) {
                    $scope.searchResults = response.data || [];
                    $scope.activeTab = "search";
                });
        };

        $scope.togglePublish = function (item) {
            $http.post("/umbraco/api/faqs/PublishItem?id=" + item.id + "&publish=" + !item.isPublished)
                .then(function () {
                    item.isPublished = !item.isPublished;
                });
        };

        $scope.deleteItem = function (id) {
            if (!confirm("Delete this FAQ item?")) return;
            $http.delete("/umbraco/api/faqs/DeleteItem?id=" + id)
                .then(function () {
                    $scope.items = $scope.items.filter(function (i) { return i.id !== id; });
                    $scope.totalItems--;
                });
        };

        $scope.deleteCategory = function (categoryId) {
            if (!confirm("Delete this category and all its FAQ items?")) return;
            $http.delete("/umbraco/api/faqs/DeleteCategory?categoryId=" + categoryId)
                .then(function () {
                    $scope.categories = $scope.categories.filter(function (c) { return c.id !== categoryId; });
                    $scope.loadItems();
                });
        };

        $scope.setTab = function (tab) {
            $scope.activeTab = tab;
        };

        $scope.getCategoryName = function (categoryId) {
            var cat = $scope.categories.find(function (c) { return c.id === categoryId; });
            return cat ? cat.name : "—";
        };

        // Init
        $scope.loadCategories();
        $scope.loadItems();
    }
]);
