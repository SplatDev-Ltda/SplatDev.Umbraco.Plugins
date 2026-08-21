(function () {
    "use strict";

    // The Umbraco 13 counterpart of the Lit dashboard. Same rule as the rest of this
    // repo's v13 bundles: nothing that Umbraco can pick is typed by hand. The destination
    // used to be a "Parent Media ID" number box, which asked an editor for a numeric id
    // the backoffice never shows them.
    function DropzoneController($http, editorService) {
        var vm = this;

        vm.loading = false;
        vm.dragging = false;
        vm.parentFolder = null;
        vm.queue = [];
        vm.mediaItems = [];
        vm.limits = null;
        vm.loadError = null;

        var baseUrl = "/umbraco/api/dropzone/";

        function describeFailure(response) {
            if (response && (response.status === 401 || response.status === 403)) {
                return "You are not authorised to manage media here.";
            }
            if (response && response.data && response.data.error) {
                return response.data.error;
            }
            return "The request did not succeed.";
        }

        function loadLimits() {
            $http.get(baseUrl + "GetOptions").then(function (r) {
                vm.limits = r.data;
            });
        }

        function loadMedia() {
            vm.loading = true;
            $http.get(baseUrl + "GetMedia").then(function (r) {
                vm.mediaItems = r.data;
                vm.loadError = null;
            }).catch(function (err) {
                // A failed load used to leave the previous, usually empty, list on screen,
                // which reads as "no media" rather than "the request failed".
                vm.loadError = describeFailure(err);
            }).finally(function () {
                vm.loading = false;
            });
        }

        // ── picker ───────────────────────────────────────────────────────────

        vm.pickFolder = function () {
            editorService.mediaPicker({
                multiPicker: false,
                onlyImages: false,
                // Restricting to Folder is what makes this a destination picker rather
                // than a media browser.
                filter: "Folder",
                filterExclude: false,
                submit: function (model) {
                    var picked = model.selection && model.selection[0];
                    if (picked) {
                        vm.parentFolder = { key: picked.key || picked.udi, name: picked.name };
                    }
                    editorService.close();
                },
                close: function () { editorService.close(); }
            });
        };

        vm.clearFolder = function () {
            vm.parentFolder = null;
        };

        // ── queue ────────────────────────────────────────────────────────────

        function rejectReason(file) {
            if (!vm.limits) return null;

            if (vm.limits.allowedExtensions && vm.limits.allowedExtensions.length) {
                var ext = (file.name.split(".").pop() || "").toLowerCase();
                var allowed = vm.limits.allowedExtensions.some(function (a) {
                    return a.replace(/^\./, "").toLowerCase() === ext;
                });
                if (!allowed) return "." + ext + " is not allowed";
            }

            if (vm.limits.maxFileSizeBytes > 0 && file.size > vm.limits.maxFileSizeBytes) {
                return "over the " + vm.limits.maxFileSizeMb + " MB limit";
            }

            return null;
        }

        vm.onFilesSelected = function (files) {
            if (!files) return;
            files.forEach(function (f) {
                var reason = rejectReason(f);
                vm.queue.push({
                    file: f,
                    uploading: false,
                    done: false,
                    error: reason
                });
            });
        };

        vm.clearQueue = function () {
            vm.queue = [];
        };

        vm.uploadAll = function () {
            vm.queue.forEach(function (item) {
                if (item.done || item.error) return;
                item.uploading = true;

                var fd = new FormData();
                fd.append("file", item.file);
                if (vm.parentFolder && vm.parentFolder.key) {
                    fd.append("parentMediaKey", vm.parentFolder.key);
                }

                $http.post(baseUrl + "Upload", fd, {
                    headers: { "Content-Type": undefined },
                    transformRequest: angular.identity
                }).then(function (r) {
                    item.uploading = false;
                    item.done = true;
                    item.detail = r.data && r.data.name
                        ? r.data.name + " · " + r.data.mediaTypeAlias
                        : null;
                    loadMedia();
                }).catch(function (err) {
                    item.uploading = false;
                    item.error = describeFailure(err);
                });
            });
        };

        vm.deleteItem = function (key) {
            $http.delete(baseUrl + "Delete?mediaKey=" + key).then(function () {
                loadMedia();
            }).catch(function (err) {
                vm.loadError = describeFailure(err);
            });
        };

        loadLimits();
        loadMedia();
    }

    angular.module("umbraco").controller("DropzoneController", [
        "$http",
        "editorService",
        DropzoneController
    ]);
}());
