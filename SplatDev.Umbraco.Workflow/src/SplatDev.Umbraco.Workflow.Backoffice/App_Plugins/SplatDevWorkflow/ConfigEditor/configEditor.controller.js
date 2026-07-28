angular.module("umbraco").controller("SplatDevWorkflow.ConfigEditorController", [
    "$scope", "$http", "$filter",
    function ($scope, $http, $filter) {

        $scope.loading = false;
        $scope.saving = false;
        $scope.workflows = [];
        $scope.editingWorkflow = false;
        $scope.editor = null;
        $scope.toast = null;
        $scope.themes = [
            { key: "default", name: "Default" },
            { key: "high-contrast", name: "High Contrast" },
            { key: "playful", name: "Playful" }
        ];

        $scope.assignmentStrategies = [
            { value: 0, label: "Assign to Group" },
            { value: 1, label: "Assign to Submitter" },
            { value: 2, label: "Manual" }
        ];

        var API_BASE = "/umbraco/api/Workflow";

        function showToast(message, type) {
            $scope.toast = { message: message, type: type || "info" };
            setTimeout(function () { $scope.$apply(function () { $scope.toast = null; }); }, 3500);
        }

        function loadWorkflows() {
            $scope.loading = true;
            $http.get(API_BASE + "/definitions")
                .then(function (r) {
                    $scope.workflows = r.data || [];
                    $scope.workflows.forEach(function (wf) {
                        if (typeof wf.definitionJson === "string") {
                            try { wf._def = JSON.parse(wf.definitionJson); } catch (e) { wf._def = {}; }
                        } else {
                            wf._def = wf.definitionJson || {};
                        }
                    });
                })
                .catch(function () { showToast("Failed to load workflows", "error"); })
                .finally(function () { $scope.loading = false; });
        }

        loadWorkflows();

        // Step count filter
        $filter("stepsCount", function () {
            return function (def) {
                var d = typeof def === "string" ? (function () { try { return JSON.parse(def); } catch (e) { return {}; } })() : (def || {});
                return (d && d.steps && d.steps.length) || 0;
            };
        });

        $scope.createNew = function () {
            $scope.editor = {
                isExisting: false,
                workflow: {
                    key: "",
                    label: "",
                    steps: [],
                    themeKey: "default",
                    queueColumns: []
                }
            };
            $scope.editingWorkflow = true;
        };

        $scope.editWorkflow = function (wf) {
            var def = wf._def || { steps: [], themeKey: wf.themeKey || "default", queueColumns: wf.queueColumns || [] };

            // Hydrate step message strings
            (def.steps || []).forEach(function (step) {
                step.actions = step.actions || [];
                step.preActionMessagesStr = (step.preActionMessages || []).map(function (m) { return m.alias; }).join(", ");
                step.postActionMessagesStr = (step.postActionMessages || []).map(function (m) { return m.alias; }).join(", ");
            });

            $scope.editor = {
                isExisting: true,
                existingWorkflow: wf,
                workflow: {
                    key: wf.key,
                    label: wf.label,
                    steps: def.steps || [],
                    themeKey: def.themeKey || "default",
                    queueColumns: def.queueColumns || []
                }
            };
            $scope.editingWorkflow = true;
        };

        $scope.cancelEdit = function () {
            $scope.editingWorkflow = false;
            $scope.editor = null;
        };

        $scope.addStep = function () {
            $scope.editor.workflow.steps.push({
                key: "",
                label: "",
                department: "",
                group: "",
                actions: [],
                preActionMessages: [],
                postActionMessages: [],
                preActionMessagesStr: "",
                postActionMessagesStr: ""
            });
        };

        $scope.removeStep = function (index) {
            $scope.editor.workflow.steps.splice(index, 1);
        };

        $scope.moveStep = function (index, delta) {
            var newIndex = index + delta;
            if (newIndex < 0 || newIndex >= $scope.editor.workflow.steps.length) return;
            var temp = $scope.editor.workflow.steps[index];
            $scope.editor.workflow.steps[index] = $scope.editor.workflow.steps[newIndex];
            $scope.editor.workflow.steps[newIndex] = temp;
        };

        $scope.addAction = function (step) {
            step.actions.push({
                key: "",
                label: "",
                nextStepKey: "",
                assignment: 0
            });
        };

        $scope.removeAction = function (step, index) {
            step.actions.splice(index, 1);
        };

        $scope.addQueueColumn = function () {
            $scope.editor.workflow.queueColumns = $scope.editor.workflow.queueColumns || [];
            $scope.editor.workflow.queueColumns.push({
                header: "",
                fieldKey: "",
                width: ""
            });
        };

        $scope.removeQueueColumn = function (index) {
            $scope.editor.workflow.queueColumns.splice(index, 1);
        };

        $scope.saveWorkflow = function () {
            if (!$scope.editor.workflow.label || !$scope.editor.workflow.key) {
                showToast("Label and Key are required", "error");
                return;
            }

            // Serialize action messages from comma-separated strings
            $scope.editor.workflow.steps.forEach(function (step) {
                step.preActionMessages = (step.preActionMessagesStr || "")
                    .split(",").map(function (s) { return { alias: s.trim(), label: s.trim(), audience: 0 }; })
                    .filter(function (m) { return m.alias; });
                step.postActionMessages = (step.postActionMessagesStr || "")
                    .split(",").map(function (s) { return { alias: s.trim(), label: s.trim(), audience: 0 }; })
                    .filter(function (m) { return m.alias; });
            });

            var payload = {
                key: $scope.editor.workflow.key,
                label: $scope.editor.workflow.label,
                definitionJson: JSON.stringify({
                    steps: $scope.editor.workflow.steps,
                    themeKey: $scope.editor.workflow.themeKey,
                    queueColumns: $scope.editor.workflow.queueColumns
                })
            };

            $scope.saving = true;
            var promise;
            if ($scope.editor.isExisting) {
                payload.version = ($scope.editor.existingWorkflow.version || 0) + 1;
                promise = $http.put(API_BASE + "/definitions/" + $scope.editor.existingWorkflow.key, payload);
            } else {
                promise = $http.post(API_BASE + "/definitions", payload);
            }

            promise.then(function () {
                showToast("Workflow saved successfully", "success");
                $scope.editingWorkflow = false;
                $scope.editor = null;
                loadWorkflows();
            }).catch(function (err) {
                showToast(err.data && err.data.detail || "Failed to save workflow", "error");
            }).finally(function () {
                $scope.saving = false;
            });
        };

        $scope.deleteWorkflow = function (wf) {
            if (!confirm("Delete workflow '" + wf.label + "'? This cannot be undone.")) return;
            $http.delete(API_BASE + "/definitions/" + wf.key)
                .then(function () {
                    showToast("Workflow deleted", "success");
                    loadWorkflows();
                })
                .catch(function (err) {
                    showToast(err.data && err.data.detail || "Failed to delete workflow", "error");
                });
        };

        $scope.activateWorkflow = function (wf) {
            $http.put(API_BASE + "/definitions/" + wf.key + "/activate")
                .then(function () {
                    showToast("Workflow activated", "success");
                    loadWorkflows();
                })
                .catch(function (err) {
                    showToast(err.data && err.data.detail || "Failed to activate workflow", "error");
                });
        };

    }
]);
