'use strict';

angular.module('instastore')
    .controller('SiteLogin', ['$scope', '$rootScope', 'rest', 'toaster', '$window', '$state', '$auth', 'UserService',
        function ($scope, $rootScope, rest, toaster, $window, $state, $auth, UserService) {

            if (!UserService.isGuest()) $state.go('item');

            $scope.pageClass = 'page-enter1';

            rest.path = 'v1/user/login';

            var errorCallback = function (data) {
                toaster.clear();
                UserService.logout();
                angular.forEach(data, function (error) {
                    toaster.pop('error', "Field: " + error.field, error.message);
                });
            };

            $scope.login = function () {

                rest.path = 'v1/user/login';

                if (!$scope.model) {
                    toaster.pop('error', "Wrong login or password");
                    return;
                }
                rest.postModel($scope.model).success(function (data) {
                    UserService.login(data);
                    toaster.pop('success', "Success");
                    $state.go('sellorbuy');
                }).error(errorCallback);
            };

            $scope.authenticate = function (provider) {
                $auth.authenticate(provider).then(function (res) {

                    UserService.login(res.data.token);
                    UserService.setProfile(res.data.profile);
                    UserService.setBg(res.data.store.bg_url);
                    UserService.setAvatar(res.data.store.avatar_url);

                    toaster.pop('success', "Welcome, " + res.data.profile.first_name + "!");
                    $state.go('sellorbuy');
                }, handleError);
            };

            function handleError(err) {
                toaster.pop('error', err.data);
            }
        }])
    .controller('SiteHeader', ['$scope', '$window', '$state', 'ngDialog', 'UserService', function ($scope, $window, $state, ngDialog, UserService) {

        $scope.logout = function () {
            UserService.logout();
            $state.go("main");
        }

        $scope.profile = function () {
            $state.go("profile");
        };

        $scope.clickToOpen = function () {
            ngDialog.open({template: 'app/components/item/additem.html', controller: 'ItemAdd'});
        };

    }])
    .controller('SellOrBuy', ['$scope', 'UserService', '$state', function ($scope, UserService, $state) {

        $scope.goAsBuyer = function () {
            UserService.setIsSeller(false);
            $state.go('storeselect');
        };

        $scope.goAsSeller = function () {
            UserService.setIsSeller(true);
            $state.go('storeselect');
        };

    }])
    .controller('SiteStoreSelect', ['$scope', '$rootScope', '$state', function ($scope, $rootScope, $state) {
        if ($rootScope.isSeller) $state.go('item');
        $scope.selectStore = function () {
            $state.go('item');
        };
    }]);