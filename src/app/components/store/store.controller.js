var app = angular.module('instastore');
app
    .controller('StoreIndex', ['$scope', 'UserService', '$stateParams', 'CLIENT_URL', 'toaster', function ($scope, UserService, $stateParams, CLIENT_URL, toaster) {

        var profile = UserService.getProfile();
        $scope.seller = profile.seller;
        if (profile.seller) {
            if ($stateParams.storeurl) {
                $scope.store_url = CLIENT_URL + $stateParams.storeurl;
            } else {
                if (profile.store)
                    $scope.store_url = CLIENT_URL + profile.store.store_url;
            }
        } else
            $scope.store_url = CLIENT_URL + profile.inviter_url;

        $scope.getTextToCopy = function () {
            return $scope.store_url;
        }
        $scope.alertCopy = function () {
            toaster.pop('success', 'Copied!');
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
    }]);