'use strict';

angular.module('instastore')
    .controller('LocationIndex', ['$scope', '$rootScope', 'uiGmapGoogleMapApi', function ($scope, $rootScope, uiGmapGoogleMapApi) {
        uiGmapGoogleMapApi
            .then(function () {
                return uiGmapGoogleMapApi;
            })
            .then(function () {
                if ($rootScope.store) {
                    var regexp = /(\w+),/g;
                    $scope.city = $rootScope.store.address.match(regexp)[2].replace(',','');
                    $scope.map = {
                        center: {latitude: $rootScope.store.store_long, longitude: $rootScope.store.store_lat},
                        zoom: 14
                    };
                    $scope.staticMarker = {id: 'store-marker'};
                    $scope.staticMarker.coords = {
                        latitude: $rootScope.store.store_long,
                        longitude: $rootScope.store.store_lat
                    };
                }
            });
    }]);