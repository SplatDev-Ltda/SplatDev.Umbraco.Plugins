(function () {
    'use strict';

    angular.module('umbraco').directive('splatQueueTable', ['splatWorkflow.themeService', function (themeService) {
        return {
            restrict: 'E',
            scope: {
                rows: '=',
                columns: '=',
                themeName: '@'
            },
            link: function (scope, element) {
                element.attr('data-swf-theme', scope.themeName || 'classic');
            },
            templateUrl: function (_, attrs) {
                var t = themeService.layoutForComponent(attrs.themeName || 'classic', 'queue');
                return '/App_Plugins/SplatDev.Workflow/directives/queueTable.template-' + t + '.html';
            }
        };
    }]);
})();
