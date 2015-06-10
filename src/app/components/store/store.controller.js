var app = angular.module('instastore');
app
    .controller('StoreIndex', ['$scope', 'rest', 'errorService', '$state', '$stateParams','UserService', function ($scope, rest, errorService, $state, $stateParams, UserService) {

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