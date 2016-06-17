(function () {
  'use strict';

  angular
      .module('instastore')
      .controller('SiteHeader', SiteHeader);

  SiteHeader.$inject = ['$scope', '$state', 'UserService', '$stateParams', '$location',
    '$auth', 'messageService', '$mdDialog', '$mdMedia', '$rootScope', 'rest', 'RouterTracker',
    'ModalService', 'transactionService', '$document', 'CommentFactory'];

  /* @ngInject */
  function SiteHeader($scope, $state, UserService, $stateParams, $location, $auth, messageService,
                      $mdDialog, $mdMedia, $rootScope, rest, RouterTracker, ModalService, transactionService, $document, CommentFactory) {
    var vm = this;

    $scope.profile = UserService.getProfile();
    $scope.sellerAllowed = $scope.profile.seller;
    $scope.transactionService = transactionService;

    $scope.CommentFactory = CommentFactory;

    activate();

    //////////////////////////////////

    function activate() {
      CommentFactory.startListen();
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
    
    function transactionInit() {
      var time = 120000;
      checkActiveTransaction(time);
    }

    function checkIsGuest() {
      if (!UserService.isGuest()) {
        transactionInit();
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
        ModalService.show('profile', {}, 'ProfileIndex');
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

  }

})();

