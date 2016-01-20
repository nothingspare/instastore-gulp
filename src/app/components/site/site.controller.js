'use strict';

angular.module('instastore')
    .controller('SiteLogin', ['$scope', '$rootScope', 'rest', 'errorService', '$state', '$auth', 'UserService', 'SStorage',
        function ($scope, $rootScope, rest, errorService, $state, $auth, UserService, SStorage) {

            if (!UserService.isGuest()) {
                if (!UserService.goToLastRouteFromProfile()) {
                    UserService.goToMainStore();
                }
            }

            $scope.isSession = SStorage.isSessionStorageAvailable();

            $scope.authenticate = function (provider) {
                $auth.authenticate(provider).then(function (res) {
                    UserService.login(res.data.token);
                    UserService.setFacebookProfile(res.data.facebookProfile);
                    res.data.profile.stores = res.data.stores;
                    if (res.data.store) {
                        res.data.profile.store = res.data.store;
                        UserService.setBg(res.data.store.bg_url);
                        UserService.setAvatar(res.data.store.avatar_url);
                    }
                    else {
                        res.data.profile.store = {};
                    }
                    UserService.setProfile(res.data.profile);
                    if (UserService.getInvitedStatus()) {
                        $state.go('grid', {mode: res.data.profile.seller ? '' : 'feed'});
                    }
                    else {
                        $state.go('storeselect');
                    }
                }, errorService.satellizerAlert);
            };

        }])
    .controller('SiteHeader', ['$scope', '$state', 'ngDialog', 'UserService', '$stateParams', '$location', '$anchorScroll',
        '$auth', 'errorService', '$mdDialog', '$mdMedia',
        function ($scope, $state, ngDialog, UserService, $stateParams, $location, $anchorScroll, $auth, errorService,
                  $mdDialog, $mdMedia) {
            UserService.initStore();

            $scope.profile = UserService.getProfile();
            $scope.sellerAllowed = $scope.profile.seller;

            $scope.logout = function () {
                UserService.logout();
                $mdDialog.hide();
                $state.go('login');
            };

            $scope.isSeller = UserService.isYourStore();

            $scope.goToProfile = function () {
                if (UserService.isGuest()) {
                    UserService.saveLastRouteToProfile({from: $state.current, fromParams: $stateParams});
                    $auth.authenticate('facebook').then(function (res) {
                        if (UserService.getProfile().lastRoute) {
                            var lastRoute = UserService.getProfile().lastRoute;
                        }
                        UserService.login(res.data.token);
                        UserService.setFacebookProfile(res.data.facebookProfile);
                        res.data.profile.stores = res.data.stores;
                        if (res.data.store) {
                            res.data.profile.store = res.data.store;
                            UserService.setBg(res.data.store.bg_url);
                            UserService.setAvatar(res.data.store.avatar_url);
                        }
                        res.data.profile.lastRoute = lastRoute;
                        UserService.setProfile(res.data.profile);
                        $scope.profile = res.data.profile;
                        $state.go('profile');
                    }, errorService.satellizerAlert);
                }
                else {
                    $state.go('profile');
                }
            };

            $scope.clickToOpen = function () {
                ngDialog.open({template: 'app/components/item/view-tab-add.html', controller: 'ItemAdd'});
            };

            $scope.showProfile = function (ev) {
                $mdDialog.show({
                    controller: 'ProfileIndex',
                    templateUrl: 'app/components/profile/profile.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: $mdMedia('xs')
                })
                    .then(function (answer) {
                        $scope.status = 'You said the information was "' + answer + '".';
                    }, function () {
                        $scope.status = 'Yo u cancelled the dialog.';
                    });
            };

            $scope.goBack = function () {
                if ($state.includes('store')) {
                    UserService.goToMainStore();
                }
                else {
                    $state.go('grid', {storeurl: $stateParams.storeurl, mode: $scope.profile.seller ? '' : 'feed'});
                }
            };

            $scope.scrollToTop = function () {
                $location.hash('start');
                $anchorScroll();
            };

        }])

    .controller('SellOrBuy', ['$scope', 'UserService', '$state', function ($scope, UserService, $state) {

        $scope.facebookProfile = UserService.getFacebookProfile();

        var profile = UserService.getProfile();
        $scope.sellerAllowed = profile.seller;

        $scope.goAsBuyer = function () {
            UserService.setIsSeller(false);
            $state.go('grid', {storeurl: profile.seller ? profile.store.store_url : profile.inviter_url, mode: 'feed'});
        };

        $scope.goAsSeller = function () {
            UserService.setIsSeller(true);
            $state.go('grid', {storeurl: profile.store.store_url});
        };
    }])
    .controller('SiteStoreSelect', ['$scope', 'UserService', '$state', 'rest', 'errorService', 'toaster', function ($scope, UserService, $state, rest, errorService, toaster) {
        $scope.profile = UserService.getProfile();
        $scope.selectStore = function (inviter_id) {
            $scope.profile.inviter_id = inviter_id;
            rest.path = 'v1/profiles';
            rest.putModel($scope.profile).success(function (profile) {
                UserService.setProfile(profile);
                toaster.pop('success', 'Saved');
                $state.go('sellorbuy');
            }).error(errorService.alert);
        };
    }]);