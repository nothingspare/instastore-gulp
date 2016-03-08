'use strict';

angular.module('instastore')
    .directive('itemStream', ['$state', function ($state) {
        return {
            restrict: 'A',
            templateUrl: 'app/components/item/item-stream.html',
            scope: {
                item: '=',
                store: '=',
                storeUrl: '='
            },
            link: function (scope) {
                scope.$state = $state;
            }
        }
    }]);
