'use strict';

angular.module('instastore')
    .controller('LocationIndex', ['$scope', '$rootScope', 'uiGmapGoogleMapApi', function ($scope, $rootScope, uiGmapGoogleMapApi) {
        debugger;
        uiGmapGoogleMapApi
            .then(function () {
                if ($rootScope.store) {

                    var regexp = /(^\s)?(\w\s?)+\s?,/g;
                    var city = $rootScope.store.address.match(regexp)[2].replace(',','');

                    if(/\d+/.test(city)) {
                        $scope.city = $rootScope.store.address.match(regexp)[1].replace(',','');
                    } else {
                        $scope.city = city;
                    }

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