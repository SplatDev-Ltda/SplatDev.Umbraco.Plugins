angular.module("umbraco").controller("Backups.DashboardController", [
    "$scope", "$http", "notificationsService",
    function ($scope, $http, notificationsService) {

        var api = "/umbraco/api/backups/";

        $scope.loading = true;
        $scope.backups = [];
        $scope.providers = [];
        $scope.creating = false;
        $scope.restoring = false;
        $scope.deletingName = null;
        $scope.testingId = null;
        $scope.activeTab = "backups";

        $scope.newBackup = {
            name: "",
            scope: 3,
            compress: true,
            encrypt: false,
            encryptionKey: "",
            cloudProviderIds: []
        };

        $scope.scopes = [
            { value: 1, label: "Content only" },
            { value: 2, label: "Media only" },
            { value: 4, label: "Database only" },
            { value: 3, label: "Content & Media" },
            { value: 7, label: "Full (Content, Media & Database)" }
        ];

        function formatBytes(bytes) {
            if (!bytes) return "0 B";
            var units = ["B", "KB", "MB", "GB"];
            var i = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, i)).toFixed(1) + " " + units[Math.min(i, units.length - 1)];
        }
        $scope.formatBytes = formatBytes;

        function loadBackups() {
            $scope.loading = true;
            $http.get(api + "GetAll").then(function (resp) {
                $scope.backups = resp.data || [];
            }, function () {
                notificationsService.error("Backups", "Failed to load backup list.");
            }).finally(function () {
                $scope.loading = false;
            });
        }

        function loadProviders() {
            $http.get(api + "providers").then(function (resp) {
                $scope.providers = resp.data || [];
            }, function () {
                // silently ignore — cloud providers are optional
            });
        }

        $scope.setTab = function (tab) {
            $scope.activeTab = tab;
        };

        $scope.toggleProvider = function (id) {
            var idx = $scope.newBackup.cloudProviderIds.indexOf(id);
            if (idx === -1) {
                $scope.newBackup.cloudProviderIds.push(id);
            } else {
                $scope.newBackup.cloudProviderIds.splice(idx, 1);
            }
        };

        $scope.providerSelected = function (id) {
            return $scope.newBackup.cloudProviderIds.indexOf(id) !== -1;
        };

        $scope.createBackup = function () {
            if ($scope.creating) return;
            $scope.creating = true;

            var payload = angular.copy($scope.newBackup);
            if (!payload.name) {
                payload.name = "backup-" + new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
            }

            $http.post(api + "Create", payload).then(function (resp) {
                notificationsService.success("Backup created", resp.data.name + " saved successfully.");
                $scope.newBackup.name = "";
                $scope.newBackup.cloudProviderIds = [];
                loadBackups();
                $scope.activeTab = "backups";
            }, function (err) {
                var msg = (err.data && err.data.message) ? err.data.message : "Could not create backup.";
                notificationsService.error("Backup failed", msg);
            }).finally(function () {
                $scope.creating = false;
            });
        };

        $scope.deleteBackup = function (name) {
            if ($scope.deletingName) return;
            if (!confirm("Delete backup \"" + name + "\"? This cannot be undone.")) return;

            $scope.deletingName = name;
            $http.delete(api + "Delete?name=" + encodeURIComponent(name)).then(function () {
                notificationsService.success("Deleted", "Backup \"" + name + "\" removed.");
                loadBackups();
            }, function () {
                notificationsService.error("Delete failed", "Could not delete \"" + name + "\".");
            }).finally(function () {
                $scope.deletingName = null;
            });
        };

        $scope.testProvider = function (id) {
            if ($scope.testingId) return;
            $scope.testingId = id;
            $http.post(api + "providers/test?providerId=" + encodeURIComponent(id)).then(function (resp) {
                if (resp.data.valid) {
                    notificationsService.success("Connection OK", "Provider \"" + id + "\" connected successfully.");
                } else {
                    notificationsService.warning("Connection failed", "Provider \"" + id + "\" could not connect.");
                }
            }, function () {
                notificationsService.error("Test failed", "Could not test provider \"" + id + "\".");
            }).finally(function () {
                $scope.testingId = null;
            });
        };

        // init
        loadBackups();
        loadProviders();
    }
]);
