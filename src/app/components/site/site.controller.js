//'use strict';

angular.module('instastore')
    .controller('SiteLogin', ['$scope', '$rootScope', 'rest', 'toaster', '$state', '$auth', 'UserService',
        function ($scope, $rootScope, rest, toaster, $state, $auth, UserService) {

            if (!UserService.isGuest()) $state.go('item');

            rest.path = 'v1/user/login';

            $scope.authenticate = function (provider) {
                $auth.authenticate(provider).then(function (res) {
                    UserService.login(res.data.token);
                    UserService.setFacebookProfile(res.data.facebookProfile);
                    res.data.profile.store = res.data.store;
                    res.data.profile.stores = res.data.stores;
                    if (res.data.store) {
                        UserService.setBg(res.data.store.bg_url);
                        UserService.setAvatar(res.data.store.avatar_url);
                    }
                    UserService.setProfile(res.data.profile);
                    var name = res.data.profile.first_name ? res.data.profile.first_name : res.data.facebookProfile.first_name;
                    toaster.pop('success', "Welcome, " + name + "!");
                    if (UserService.getInvitedStatus()) $state.go('sellorbuy');
                    else $state.go('storeselect');
                }, handleError);
            };

            function handleError(err) {
                if (err.data) toaster.pop('error', err.data);
            }
        }])
    .controller('SiteHeader', ['$scope', '$state', 'ngDialog', 'UserService', function ($scope, $state, ngDialog, UserService) {
        UserService.initStore();
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

        $scope.facebookProfile = UserService.getFacebookProfile();

        $scope.goAsBuyer = function () {
            var profile = UserService.getProfile();
            UserService.setIsSeller(false);
            $state.go('item', {storeurl: profile.store.store_url});
        };

        $scope.goAsSeller = function () {
            UserService.setIsSeller(true);
            $state.go('item');
        };

    }])
    .controller('SiteStoreSelect', ['$scope', 'UserService', '$state', 'rest', 'errorService', 'toaster', function ($scope, UserService, $state, rest, errorService, toaster) {
        $scope.profile = UserService.getProfile();
        $scope.selectStore = function (inviter_id) {
            $scope.profile.inviter_id = inviter_id;
            rest.path = 'v1/profiles';
            rest.putModel($scope.profile).success(function () {
                toaster.pop('success', "Saved");
                $state.go('sellorbuy');
            }).error(errorService.alert);
        };
    }]);