angular.module("umbraco").controller("MemberGroupsDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        $scope.loading = false;
        $scope.activeTab = "groups";
        $scope.memberGroups = [];
        $scope.memberTypes = [];
        $scope.result = null;

        $scope.addModel = {
            email: "",
            group: ""
        };

        $scope.newGroupModel = {
            name: "",
            allowedSectionAliases: [],
            permissions: []
        };

        $scope.userModel = {
            username: ""
        };

        $scope.lookupModel = {
            email: ""
        };

        $scope.foundMember = null;

        $scope.setTab = function (tab) {
            $scope.activeTab = tab;
            $scope.result = null;
            $scope.foundMember = null;
        };

        $scope.loadGroups = function () {
            $scope.loading = true;
            $http.get("/umbraco/api/membergroups/GetMemberGroups")
                .then(function (r) { $scope.memberGroups = r.data || []; })
                .catch(function () { $scope.memberGroups = []; })
                .finally(function () { $scope.loading = false; });
        };

        $scope.loadTypes = function () {
            $http.get("/umbraco/api/membergroups/GetMemberTypes")
                .then(function (r) { $scope.memberTypes = r.data || []; });
        };

        $scope.addToGroup = function () {
            $scope.loading = true;
            $scope.result = null;
            $http.post("/umbraco/api/membergroups/AddToGroup", $scope.addModel)
                .then(function (r) { $scope.result = { success: true, message: r.data.message }; })
                .catch(function (e) { $scope.result = { success: false, message: e.data && e.data.message ? e.data.message : "Failed." }; })
                .finally(function () { $scope.loading = false; });
        };

        $scope.createGroup = function () {
            $scope.loading = true;
            $scope.result = null;
            $http.post("/umbraco/api/membergroups/CreateGroup", $scope.newGroupModel)
                .then(function (r) {
                    $scope.result = { success: true, message: r.data.message };
                    $scope.loadGroups();
                })
                .catch(function (e) { $scope.result = { success: false, message: e.data && e.data.message ? e.data.message : "Failed." }; })
                .finally(function () { $scope.loading = false; });
        };

        $scope.enableUser = function () {
            $scope.loading = true;
            $scope.result = null;
            $http.post("/umbraco/api/membergroups/EnableUser?username=" + encodeURIComponent($scope.userModel.username))
                .then(function (r) { $scope.result = { success: true, message: r.data.message }; })
                .catch(function (e) { $scope.result = { success: false, message: e.data && e.data.message ? e.data.message : "Failed." }; })
                .finally(function () { $scope.loading = false; });
        };

        $scope.disableUser = function () {
            $scope.loading = true;
            $scope.result = null;
            $http.post("/umbraco/api/membergroups/DisableUser?username=" + encodeURIComponent($scope.userModel.username))
                .then(function (r) { $scope.result = { success: true, message: r.data.message }; })
                .catch(function (e) { $scope.result = { success: false, message: e.data && e.data.message ? e.data.message : "Failed." }; })
                .finally(function () { $scope.loading = false; });
        };

        $scope.lookupMember = function () {
            $scope.loading = true;
            $scope.foundMember = null;
            $http.get("/umbraco/api/membergroups/GetMemberByEmail?email=" + encodeURIComponent($scope.lookupModel.email))
                .then(function (r) { $scope.foundMember = r.data; })
                .catch(function () { $scope.foundMember = null; $scope.result = { success: false, message: "Member not found." }; })
                .finally(function () { $scope.loading = false; });
        };

        // Init
        $scope.loadGroups();
        $scope.loadTypes();
    }
]);
