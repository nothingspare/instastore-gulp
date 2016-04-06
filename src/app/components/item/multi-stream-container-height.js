'use strict';

angular.module('instastore')
    .directive('multistoreStreamContainerHeight', ['$window', function ($window) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                console.log($window.innerHeight);
                element.css('height', $window.innerHeight + 'px');

                angular.element($window).bind('resize', function () {
                    element.css('height', $window.innerHeight + 'px');
                });
            }
        }
    }]);