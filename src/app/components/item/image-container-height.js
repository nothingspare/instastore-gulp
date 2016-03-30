'use strict';

angular.module('instastore')
    .directive('imageContainerHeight', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                scope.$watch(
                    function () {
                        return [element[0].offsetWidth, element[0].offsetHeight].join('x');
                    },
                    function () {
                        //I have strange bug here in desktop Chrome, sometimes it doesn't show real height of directive,
                        // with this $timeout works much stable
                        $timeout(function () {
                            console.log('timeout');
                            if (element[0].offsetHeight !== 0) {
                                console.log(element.parent().parent().parent());
                                element.parent().parent().parent().css('height', element[0].offsetHeight < 640 ? element[0].offsetHeight + 'px' : '640px');
                            }
                        }, 100);
                    }
                );
            }
        };
    }]);