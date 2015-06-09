var app = angular.module('instastore');
app
    .controller('StoreIndex', ['$scope', 'rest', 'errorService', '$state', '$stateParams', function ($scope, rest, errorService, $state, $stateParams) {

        $scope.store = {};
        if ($stateParams.storeurl) {
            rest.path = 'v1/stores';
            rest.models({store_url: $stateParams.storeurl}).success(function (data) {
                var store = data[0];
                if (!store) {
                    errorService.simpleAlert({status: 404, name: 'error', message: 'There is no store with such url'});
                    $state.go('item');
                    return;
                }
                rest.path = 'v1/items';
                rest.models({user_id: store.user_id, status: 20}).success(function (data) {
                    $scope.items = data;
                });
            }).error(errorService.simpleAlert);
        }
        else {
            rest.path = 'v1/user-lastitems';
            $scope.items = {};
            rest.models().success(function (data) {
                $scope.items = data;
            }).error(errorService.alert);
        }
    }])
    .controller('StoreView', ['$scope', 'rest', '$rootScope', 'errorService', function ($scope, rest, $rootScope, errorService) {
        rest.path = 'v1/stores';
        $scope.store = {};
        rest.models().success(function (data) {
            var store = data[0];
            $rootScope.bgUrl = store.bg_url;
            $rootScope.avatarUrl = store.avatar_url;
            $rootScope.isSeller = false;
        }).error(errorService.alert);
    }])
    .controller('StoreAccounts', ['$scope', function ($scope) {
        console.log('StoreAccounts initialized');
    }])
    .controller('urlCtrl', ['$scope', function ($scope) {
        console.log('urlCtrl initialized');
    }]);