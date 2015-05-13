var app = angular.module('instastore');
app
    .controller('StoreIndex', ['$scope', function ($scope) {
        console.log('StoreIndex initialized');
    }])
    .controller('StoreAccounts', ['$scope', function ($scope) {
        console.log('StoreAccounts initialized');
    }]);