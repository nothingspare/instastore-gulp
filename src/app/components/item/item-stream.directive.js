'use strict';

angular.module('instastore')
    .directive('itemStream', [function () {
        return {
            restrict: 'A',
            templateUrl: 'app/components/item/item-stream.html',
            scope: {
                item: '=',
                store: '=',
                storeUrl: '='
            },
            controller: 'ItemView',
            link: function (scope, elem, attrs) {

            }
        }
    }]);
