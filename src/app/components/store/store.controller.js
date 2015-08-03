'use strict';

var app = angular.module('instastore');
app
    .controller('StoreIndex', ['$scope', 'UserService', '$stateParams', 'CLIENT_URL', 'toaster', '$rootScope', function ($scope, UserService, $stateParams, CLIENT_URL, toaster, $rootScope) {

        //clear temp store data if not your store
        if (!UserService.isYourStore()) {
            $rootScope.bgUrl = 'assets/images/background1-blur.jpg';
            $rootScope.store = {};
            $rootScope.store.avatar_url = 'assets/images/background1circle290x290px.jpg';
        }

        UserService.initStore();
        var profile = UserService.getProfile();
        $scope.seller = UserService.isYourStore() && UserService.isSeller() ? profile.seller : false;
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