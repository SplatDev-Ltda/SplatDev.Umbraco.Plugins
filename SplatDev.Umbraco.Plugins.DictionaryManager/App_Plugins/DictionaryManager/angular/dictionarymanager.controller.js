angular.module("umbraco").controller("DictionaryManagerDashboardController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        // The Umbraco 13 counterpart of the Lit dashboard. What was here before was the
        // shared placeholder: a save() that ran a setTimeout, wrote nothing, and then
        // reported "Settings saved successfully" — it carried a
        // "TODO: implement save via API" comment above the line that lies to the user.
        var api = "/umbraco/api/dictionarymanager/";

        $scope.loading = true;
        $scope.busy = null;
        $scope.items = [];
        $scope.languages = [];
        $scope.filter = "";
        $scope.message = null;
        $scope.loadError = null;

        $scope.newItem = { key: "", parentKey: "", translations: {} };
        $scope.overrideOnImport = false;

        function describeFailure(response) {
            if (response && (response.status === 401 || response.status === 403)) {
                return "You are not authorised to manage dictionary items.";
            }
            if (response && response.data && response.data.error) {
                return response.data.error;
            }
            return "The request did not succeed.";
        }

        function collectLanguages(items) {
            var codes = {};
            items.forEach(function (item) {
                Object.keys(item.translations || {}).forEach(function (c) { codes[c] = true; });
            });
            return Object.keys(codes).sort();
        }

        $scope.load = function () {
            $scope.loading = true;
            $http.get(api + "GetAll").then(function (r) {
                $scope.items = r.data || [];
                $scope.languages = collectLanguages($scope.items);
                $scope.loadError = null;
            }).catch(function (err) {
                // A failed load used to leave an empty list behind, which reads as
                // "there are no dictionary items" rather than "the request failed".
                $scope.loadError = describeFailure(err);
            }).finally(function () {
                $scope.loading = false;
            });
        };

        $scope.saveTranslation = function (item, code) {
            $scope.busy = "save:" + item.key + ":" + code;
            $scope.message = null;

            $http.put(api + "Update", item).then(function () {
                $scope.message = { type: "success", text: "Saved " + item.key + " (" + code + ")." };
            }).catch(function (err) {
                $scope.message = { type: "error", text: describeFailure(err) };
            }).finally(function () {
                $scope.busy = null;
            });
        };

        $scope.create = function () {
            var key = ($scope.newItem.key || "").trim();
            if (!key) {
                $scope.message = { type: "error", text: "Give the item a key." };
                return;
            }

            $scope.busy = "create";
            var payload = {
                key: key,
                parentKey: ($scope.newItem.parentKey || "").trim() || null,
                value: "",
                languageCode: $scope.languages[0] || "",
                translations: $scope.newItem.translations || {}
            };

            $http.post(api + "Create", payload).then(function () {
                $scope.message = { type: "success", text: "Created " + key + "." };
                $scope.newItem = { key: "", parentKey: "", translations: {} };
                $scope.load();
            }).catch(function (err) {
                $scope.message = { type: "error", text: describeFailure(err) };
            }).finally(function () {
                $scope.busy = null;
            });
        };

        $scope.remove = function (key) {
            $scope.busy = "delete:" + key;
            $http.delete(api + "Delete?key=" + encodeURIComponent(key)).then(function () {
                $scope.message = { type: "success", text: "Deleted " + key + "." };
                $scope.load();
            }).catch(function (err) {
                $scope.message = { type: "error", text: describeFailure(err) };
            }).finally(function () {
                $scope.busy = null;
            });
        };

        $scope.exportJson = function () {
            $scope.busy = "export";
            $http.get(api + "Export", { responseType: "blob" }).then(function (r) {
                var url = window.URL.createObjectURL(r.data);
                var a = document.createElement("a");
                a.href = url;
                a.download = "dictionary-export.json";
                a.click();
                window.URL.revokeObjectURL(url);
                $scope.message = { type: "success", text: "Exported " + $scope.items.length + " item(s)." };
            }).catch(function (err) {
                $scope.message = { type: "error", text: describeFailure(err) };
            }).finally(function () {
                $scope.busy = null;
            });
        };

        $scope.importJson = function (files) {
            if (!files || !files.length) return;

            var reader = new FileReader();
            reader.onload = function (e) {
                var items;
                try {
                    items = JSON.parse(e.target.result);
                } catch (parseError) {
                    $scope.$apply(function () {
                        $scope.message = { type: "error", text: files[0].name + " is not valid JSON." };
                    });
                    return;
                }

                if (!Array.isArray(items) || !items.length) {
                    $scope.$apply(function () {
                        $scope.message = { type: "error", text: files[0].name + " contains no dictionary items." };
                    });
                    return;
                }

                $scope.$apply(function () { $scope.busy = "import"; });

                $http.post(api + "Import?overrideExisting=" + !!$scope.overrideOnImport, items)
                    .then(function (r) {
                        var results = r.data || [];
                        var failed = results.filter(function (x) { return !x.success; });
                        $scope.message = {
                            type: failed.length ? "error" : "success",
                            text: "Imported " + (results.length - failed.length) + " of " + results.length + " item(s)." +
                                  (failed.length ? " Skipped: " + failed.map(function (f) { return f.key; }).join(", ") + "." : "")
                        };
                        $scope.load();
                    })
                    .catch(function (err) {
                        $scope.message = { type: "error", text: describeFailure(err) };
                    })
                    .finally(function () {
                        $scope.busy = null;
                    });
            };
            reader.readAsText(files[0]);
        };

        $scope.matchesFilter = function (item) {
            var needle = ($scope.filter || "").trim().toLowerCase();
            if (!needle) return true;
            if (item.key.toLowerCase().indexOf(needle) !== -1) return true;
            return Object.keys(item.translations || {}).some(function (c) {
                return (item.translations[c] || "").toLowerCase().indexOf(needle) !== -1;
            });
        };

        $scope.load();
    }
]);
