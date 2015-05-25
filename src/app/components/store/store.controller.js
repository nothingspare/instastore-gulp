var app = angular.module('instastore');
app
    .controller('StoreIndex', ['$scope', function ($scope) {
        console.log('StoreIndex initialized');
    }])
    .controller('StoreView', ['$scope', 'rest', '$rootScope', function ($scope, rest, $rootScope) {

        rest.path = 'v1/stores';

        $scope.store = {};

        var errorCallback = function (data) {
            toaster.clear();
            if (data.status == undefined) {
                angular.forEach(data, function (error) {
                    toaster.pop('error', "Field: " + error.field, error.message);
                });
            }
            else {
                toaster.pop('error', "code: " + data.code + " " + data.name, data.message);
            }
        };

        rest.models().success(function (data) {
            var store = data[0];
            $rootScope.bgUrl = store.bg_url;
            $rootScope.avatarUrl = store.avatar_url;
            $rootScope.isSeller = false;
        }).error(errorCallback);

    }])
    .controller('StoreAccounts', ['$scope', function ($scope) {
        console.log('StoreAccounts initialized');
    }])
    .controller('urlCtrl', ['$scope', function ($scope) {
        console.log('urlCtrl initialized');
    }]);