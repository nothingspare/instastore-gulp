'use strict';

var app = angular.module('instastore');
app
    .controller('StoreIndex', ['$scope', 'UserService', '$stateParams', 'CLIENT_URL', 'toaster', function ($scope, UserService, $stateParams, CLIENT_URL, toaster) {

        var profile = UserService.getProfile();
        $scope.seller = UserService.isSeller()?profile.seller:false;
        if (profile.seller) {
            if ($stateParams.storeurl) {
                $scope.storeUrl = CLIENT_URL + $stateParams.storeurl;
            } else {
                if (profile.store) {
                    $scope.storeUrl = CLIENT_URL + profile.store.store_url;
                }
            }
        } else {
            $scope.storeUrl = CLIENT_URL + profile.inviter_url;
        }

        $scope.getTextToCopy = function () {
            return $scope.storeUrl;
        };
        $scope.alertCopy = function () {
            toaster.pop('success', 'Copied!');
        };
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
    }]);