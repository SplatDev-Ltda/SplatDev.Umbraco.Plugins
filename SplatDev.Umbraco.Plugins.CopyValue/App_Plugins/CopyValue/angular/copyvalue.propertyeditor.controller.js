/**
 * Copy Value property editor (Umbraco 13).
 *
 * Fills this property from one or more others on the same item. Reads the sibling values
 * straight off the editor's scope rather than the server, so it works before anything is
 * saved — which is the point: you copy a title into a meta description while writing it,
 * not after publishing.
 *
 * The Umbraco 17 build does the same thing through UMB_PROPERTY_DATASET_CONTEXT.
 */
angular.module("umbraco").controller("SplatDev.CopyValuePropertyEditorController", [
    "$scope",
    "editorState",
    function ($scope, editorState) {
        var vm = this;
        var config = ($scope.model && $scope.model.config) || {};

        vm.sources = (config.sourceAliases || "")
            .split(",")
            .map(function (a) { return (a || "").trim(); })
            .filter(function (a) { return a.length > 0; });

        vm.separator = config.separator !== undefined && config.separator !== null ? config.separator : " ";
        vm.buttonLabel = config.buttonLabel || "Copy from";
        vm.overwrite = config.overwrite === true || config.overwrite === "1";
        vm.readonly = $scope.model && $scope.model.readonly === true;
        vm.preview = "";

        function asText(value) {
            if (value === null || value === undefined) return "";
            if (typeof value === "string") return value.trim();
            if (typeof value === "number" || typeof value === "boolean") return String(value);
            if (Array.isArray(value)) {
                return value.map(asText).filter(Boolean).join(vm.separator);
            }
            if (typeof value === "object") {
                var keys = ["name", "value", "url", "mediaKey"];
                for (var i = 0; i < keys.length; i++) {
                    if (typeof value[keys[i]] === "string") return value[keys[i]].trim();
                }
            }
            return "";
        }

        // Walks the open content item's properties. editorState holds what is on screen,
        // including edits that have not been saved.
        function valueOf(alias) {
            var current = editorState.getCurrent();
            if (!current || !current.variants) return "";
            for (var v = 0; v < current.variants.length; v++) {
                var tabs = current.variants[v].tabs || [];
                for (var t = 0; t < tabs.length; t++) {
                    var props = tabs[t].properties || [];
                    for (var p = 0; p < props.length; p++) {
                        if (props[p].alias === alias) return asText(props[p].value);
                    }
                }
            }
            return "";
        }

        function build() {
            var parts = [];
            for (var i = 0; i < vm.sources.length; i++) {
                var text = valueOf(vm.sources[i]);
                if (text) parts.push(text);
            }
            return parts.join(vm.separator);
        }

        vm.copy = function () {
            if (vm.readonly) return;
            var next = build();
            if (!next) return;

            // Overwriting is the destructive direction, so it is opt-in per data type and
            // confirmed when it would actually discard something.
            if ($scope.model.value && !vm.overwrite) {
                var ok = window.confirm(
                    "Replace what is already here?\n\nCurrent: " + $scope.model.value + "\nNew: " + next);
                if (!ok) return;
            }
            $scope.model.value = next;
        };

        // Keep the preview honest while the other fields are being typed into.
        $scope.$watch(build, function (next) { vm.preview = next; });
    },
]);
