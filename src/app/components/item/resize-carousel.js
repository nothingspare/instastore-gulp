'use strict';

angular.module('instastore')
    .directive('imageContainerHeight', function ($rootScope) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(
                    function () {
                        return [element[0].offsetWidth, element[0].offsetHeight].join('x');
                    },
                    function (value) {
                        console.log('directive got resized:', value.split('x'));
                        $rootScope.curImageHeight = element[0].offsetHeight < 640 ? element[0].offsetHeight : 640;
                    }
                );
            }
        };
    });