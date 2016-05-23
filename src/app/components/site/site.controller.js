'use strict';

angular.module('instastore')
    .controller('MyCtrl', function ($scope, $document) {

    })
    .controller('SiteLogin', ['$scope', '$rootScope', 'rest', '$state',
      '$auth', 'UserService', 'SStorage', 'InAppService', '$mdSidenav', '$document', 'messageService', 'TourService', '$cookies',
      function ($scope, $rootScope, rest, $state,
                $auth, UserService, SStorage, InAppService, $mdSidenav, $document, messageService, TourService, $cookies) {

        InAppService.warnIfInApp();
        $scope.isInApp = InAppService.isFacebookInApp();

        var profile = UserService.getProfile();
        $scope.store = profile.store;

        if (!UserService.isGuest()) {
          if (UserService.isSeller()) {
            if (!UserService.goToLastRouteFromProfile()) {
              UserService.goToMainStore();
            }
          } else {
            UserService.goToStream();
          }
        }

        $scope.selected = function () {
          sideNavClose();
        };

        $scope.toggleRight = buildToggler('right');
        $scope.isOpenRight = function () {
          return $mdSidenav('right').isOpen();
        };

        function sideNavClose() {
          var sidenav = $mdSidenav('right');

          if (sidenav.isOpen()) {
            sidenav.close();
          }
        }

        function buildToggler(navID) {
          return function () {
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                });
          }
        }

        $scope.toTheTop = function () {
          $document.scrollTopAnimated(0, 2000).then(function () {
          });
        };

        $scope.isSession = SStorage.isSessionStorageAvailable();

        $scope.authenticate = function (provider) {
          sideNavClose();
          $auth.authenticate(provider).then(function (res) {
            UserService.login(res.data.token)
                .then(function () {
                  UserService.setFacebookProfile(res.data.facebookProfile);
                  res.data.profile.stores = res.data.stores;
                  if (res.data.store) {
                    TourService.init();
                    res.data.profile.store = res.data.store;
                    UserService.setBg(res.data.store.bg_url);
                    UserService.setAvatar(res.data.store.avatar_url);
                  }
                  else {
                    res.data.profile.store = {};
                  }
                  UserService.setProfile(res.data.profile);
                  UserService.setIsSeller(res.data.profile.seller);
                  if (UserService.getInvitedStatus()) {
                    res.data.profile.seller ? UserService.goToMainStore() : $state.go('stream', {storeurl: res.data.store.store_url});
                  }
                  else {
                    $state.go('storeselect');
                  }
                });
          }, messageService.satellizerAlert);
        };

      }])
    .controller('SiteHeader', ['$scope', '$state', 'UserService', '$stateParams', '$location', '$anchorScroll',
      '$auth', 'messageService', '$mdDialog', '$mdMedia', '$rootScope', 'rest', 'InAppService', '$timeout', 'RouterTracker',
      'profileService', 'transactionService', '$document',
      function ($scope, $state, UserService, $stateParams, $location, $anchorScroll, $auth, messageService,
                $mdDialog, $mdMedia, $rootScope, rest, InAppService, $timeout, RouterTracker, profileService, transactionService, $document) {
        $scope.profile = UserService.getProfile();
        $scope.sellerAllowed = $scope.profile.seller;

        activate();

        //////////////////////////////////

        function activate() {
          stateChangeStart();
          checkIsGuest();
          chekIsStates();
          configurateHeader();
          $rootScope.isYourStore = UserService.isYourStore();
        }

        function stateChangeStart() {
          $rootScope.$on('$stateChangeStart',
              function (event, toState, toParams, fromState, fromParams, options) {
                if (toState.name == 'grid') {
                  $scope.configSiteHeader.headerMode = 'editstore';
                } else {
                  $scope.configSiteHeader.headerMode = 'storestream';
                }

                if (toParams.storeurl && $scope.profile.store) {
                  $rootScope.isYourStore = toParams.storeurl === $scope.profile.store.store_url;
                }
              });
        }

        function checkActiveTransaction($time) {
          getActiveTransactionCount();
          setInterval(function () {
            getActiveTransactionCount();
          }, $time);
        }

        function getActiveTransactionCount() {
          transactionService.getCount().then(function () {
            transactionService.getActiveCount();
          });
        }

        function checkIsGuest() {
          if (!UserService.isGuest()) {
            $scope.transactionService = transactionService;
            var time = 120000;
            checkActiveTransaction(time);
          } else {
            UserService.saveLastRouteToProfile({from: $state.current, fromParams: $stateParams});
            if (!($state.includes('grid') || $state.includes('itemview') || $state.includes('location') || $state.includes('store'))) {
              $auth.authenticate('facebook').then(authentificateCallback, messageService.satellizerAlert);
            }
          }
        }

        function chekIsStates() {
          if (!($state.includes('stream') || $state.includes('stream-grid') || $state.includes('subscriptions'))) {
            UserService.initStore();
          } else {
            UserService.initMyStoreSettings();
          }
        }

        function configurateHeader() {
          $scope.configSiteHeader = {
            isYourStore: UserService.isYourStore(),
            isManageStore: UserService.isYourStore() && $state.includes('grid') ? true : false,
            headerMode: UserService.isYourStore() && $state.includes('grid') ? 'editstore' : 'storestream',
            headerPrevState: UserService.isYourStore() && $state.includes('grid') ? 'editstore' : 'storestream'
          };
        }

        function authentificateCallback(res) {
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
        }

        $scope.toggleMenuState = function () {
          if ($scope.configSiteHeader.headerMode !== $scope.configSiteHeader.isManageStore) {
            switch ($scope.configSiteHeader.headerMode) {
              case 'editstore':
                $scope.configSiteHeader.isManageStore = true;
                $scope.configSiteHeader.headerPrevState = 'editstore';
                UserService.goToMainStore();
                break;
              case 'storestream':
                $scope.configSiteHeader.isManageStore = false;
                $scope.configSiteHeader.headerPrevState = 'storestream';
                UserService.goToStream();
                break;
              case 'editprofile':
                $scope.configSiteHeader.headerMode = $scope.configSiteHeader.headerPrevState;
                $scope.showProfile();
                break;
            }
          }
        };

        $scope.showProfile = function (ev) {
          if (UserService.isGuest()) {
            $auth.authenticate('facebook').then(authentificateCallback, messageService.satellizerAlert);
          } else {
            profileService.show(ev);
          }
        };

        $scope.logout = function () {
          UserService.logout();
          $mdDialog.hide();
          $state.go('login');
        };

        $scope.clickToOpen = function (ev) {
          if (UserService.isGuest()) {
            UserService.saveLastRouteToProfile({from: $state.current, fromParams: $stateParams});
            $auth.authenticate('facebook').then(authentificateCallback, messageService.satellizerAlert);
          }
          else {
            $mdDialog.show({
              controller: 'ItemAdd',
              templateUrl: 'app/components/item/view-tab-edit.html',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose: true,
              fullscreen: $mdMedia('xs')
            });
          }
        };

        $scope.goBack = function () {
          RouterTracker.goToLastRoute();
        };

        $scope.goToMainStore = function () {
          UserService.goToMainStore();
        };

        $scope.goToStream = function () {
          UserService.goToStream();
        };

        $scope.scrollToTop = function () {
          $location.hash('start');
          $document.scrollTopAnimated(0, 1000).then(function () {
          });
        };

        $scope.toggleFollowerState = function () {
          if (!$rootScope.store.isFollower) {
            rest.path = 'v1/followers';
            rest.postModel({store_id: $rootScope.store.id}).success(function () {
              $rootScope.store.followersAmount++;
              $rootScope.store.isFollower = true;
            }).error(messageService.alert);
          } else {
            rest.path = 'v1/followers/' + $rootScope.store.id;
            rest.deleteModel().success(function () {
              $rootScope.store.followersAmount--;
              $rootScope.store.isFollower = false;
            }).error(messageService.alert);
          }
        };
      }])

    .controller('SellOrBuy', ['$scope', 'UserService', '$state', function ($scope, UserService, $state) {

      $scope.facebookProfile = UserService.getFacebookProfile();

      var profile = UserService.getProfile();
      $scope.sellerAllowed = profile.seller;

      $scope.goAsBuyer = function () {
        UserService.setIsSeller(false);
        $state.go('grid', {
          storeurl: profile.seller ? profile.store.store_url : profile.inviter_url,
          mode: 'feed'
        });
      };

      $scope.goAsSeller = function () {
        UserService.setIsSeller(true);
        $state.go('grid', {storeurl: profile.store.store_url});
      };
    }])
    .controller('SiteStoreSelect', ['$scope', 'UserService', '$state', 'rest', 'messageService',
      function ($scope, UserService, $state, rest, messageService) {
        $scope.profile = UserService.getProfile();
        $scope.selectStore = function (inviter_id) {
          $scope.profile.inviter_id = inviter_id;
          rest.path = 'v1/profiles';
          rest.putModel($scope.profile).success(function (profile) {
            UserService.setProfile(profile);
            messageService.simpleByCode('store', 'saved');
            $state.go('sellorbuy');
          }).error(messageService.alert);
        };
      }]);