'use strict';

angular.module('instastore')
    .controller('LocationIndex', ['$scope', 'rest', 'toaster', function($scope, rest, toaster) {
        $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
    }]);