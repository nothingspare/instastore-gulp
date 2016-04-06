'use strict';

angular.module('instastore')
    .directive('itemStreamCardHeight', ['$window', '$timeout', function ($window, $timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {

                $timeout(function () {
                    element.parent().css('height', element[0].width + 'px')
                }, 300);

                angular.element($window).bind('resize', function () {
                    //scope.width = $window.innerWidth;
                    // manual $digest required as resize event
                    // is outside of angular
                    console.log(element[0].width);
                    element.parent().css('height', element[0].width + 'px');
                    scope.$digest();
                });
            }
        }
    }]);