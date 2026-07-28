(function () {
    'use strict';

    angular.module('umbraco.resources').factory('splatWorkflow.resource', ['$http', '$q', function ($http, $q) {
        var base = '/umbraco/backoffice/SplatDevWorkflow';

        function get(url, params) {
            return $http.get(base + url, { params: params }).then(function (r) { return r.data; });
        }
        function post(url, body) {
            return $http.post(base + url, body).then(function (r) { return r.data; });
        }

        return {
            listInstances: function (filter) { return get('/WorkflowInstances/List', filter); },
            getInstance: function (id) { return get('/WorkflowInstances/Get/' + id); },
            transition: function (id, actionKey) { return post('/WorkflowInstances/Transition/' + id, { actionKey: actionKey }); },
            createInstance: function (workflowKey, metadataJson) { return post('/WorkflowInstances/Create', { workflowKey: workflowKey, metadataJson: metadataJson }); },
            listDefinitions: function () { return get('/WorkflowDefinitions/List'); },
            getDefinition: function (key) { return get('/WorkflowDefinitions/Get/' + key); },
            saveDefinition: function (def) { return post('/WorkflowDefinitions/Save', def); },
            listThemes: function () { return get('/WorkflowThemes/List'); },
            getTheme: function (name) { return get('/WorkflowThemes/Get/' + name); }
        };
    }]);
})();
