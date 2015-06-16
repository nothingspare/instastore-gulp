'use strict';

angular.module('instastore')
    .controller('LocationIndex', ['$scope', '$rootScope', function ($scope, $rootScope) {

        $rootScope.$watch($rootScope.store, function () {
            $scope.map = {
                center: {latitude: $rootScope.store.store_long, longitude: $rootScope.store.store_lat},
                zoom: 14
            };
            $scope.staticMarker = {id: 'store-marker'};
            $scope.staticMarker.coords = {latitude: $rootScope.store.store_long, longitude: $rootScope.store.store_lat};
        });

    }]);