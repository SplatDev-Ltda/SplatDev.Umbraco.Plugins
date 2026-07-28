(function () {
    'use strict';

    angular.module('umbraco').directive('splatPizzaChart', ['splatWorkflow.themeService', function (themeService) {
        return {
            restrict: 'E',
            scope: {
                steps: '=',
                currentIndex: '=',
                themeName: '@'
            },
            link: function (scope, element) {
                element.attr('data-swf-theme', scope.themeName || 'classic');
            },
            templateUrl: function (_, attrs) {
                var t = themeService.layoutForComponent(attrs.themeName || 'classic', 'chart');
                return '/App_Plugins/SplatDev.Workflow/directives/pizzaChart.template-' + t + '.html';
            }
        };
    }]);
})();
