'use strict';

angular.module('instastore')
    .controller('MyCtrl', function ($scope, $document) {

    })
    .controller('SiteLogin', ['$scope', '$rootScope', 'rest', '$state',
      '$auth', 'UserService', 'SStorage', 'InAppService', '$mdSidenav', '$document', 'messageService',
      'TourService', '$cookies', '$q', '$stateParams', '$http', 'SatellizerConfig', '$location',
      function ($scope, $rootScope, rest, $state,
                $auth, UserService, SStorage, InAppService, $mdSidenav, $document, messageService,
                TourService, $cookies, $q, $stateParams, $http, satellizerConfig, $location) {

        $scope.isInApp = InAppService.isFacebookInApp();

        $scope.facebookAuthConfig = {
          authorizationEndpoint: satellizerConfig.providers.facebook.authorizationEndpoint,
          authUrl: satellizerConfig.baseUrl + satellizerConfig.providers.facebook.url,
          redirectUri: satellizerConfig.providers.facebook.redirectUri,
          clientId: satellizerConfig.providers.facebook.clientId,
        };
        $scope.instagramAuthConfig = {
          authorizationEndpoint: satellizerConfig.providers.instagram.authorizationEndpoint,
          authUrl: satellizerConfig.baseUrl + satellizerConfig.providers.instagram.url,
          redirectUri: satellizerConfig.providers.instagram.redirectUri,
          clientId: satellizerConfig.providers.instagram.clientId,
        };


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
          if ($rootScope.isHomeScreen) {
            var queryParams = $location.search({
              response_type: 'code',
              client_id: $scope.facebookAuthConfig.clientId,
              redirect_uri: $scope.facebookAuthConfig.redirectUri,
              display: 'popup',
              scope: 'email, publish_actions'
            }).$$url;
            window.open($scope.facebookAuthConfig.authorizationEndpoint + queryParams, '_self');
            return;
          }

          sideNavClose();
          $auth.authenticate(provider).then(function (res) {
            getProfile(res.data);
          });
        };

        if ($stateParams.code) {
          if($cookies.authenticateFrom == 'instagram'){
            $cookies.authenticateFrom = '';
            $http.post($scope.instagramAuthConfig.authUrl, {
              code: $stateParams.code,
              clientId: $scope.instagramAuthConfig.clientId,
              redirectUri: $scope.instagramAuthConfig.redirectUri
            })
            .then(function (response) {
              if (response.data && response.data.user && response.data.user.id) {
                UserService.fromInstaimport = true;
                profile.instagramId = response.data.user.id;
                $state.go('instaimport', {storeurl: profile.store.store_url});
              }
            });

          }else{
            $http.post($scope.facebookAuthConfig.authUrl, {
              code: $stateParams.code,
              clientId: $scope.facebookAuthConfig.clientId,
              redirectUri: $scope.facebookAuthConfig.redirectUri
            }).then(function successCallback(res) {
              getProfile(res.data);
            });
          }
        }

        function getProfile(res) {
          UserService.login(res.token);
          UserService.setFacebookProfile(res.facebookProfile);
          res.profile.stores = res.stores;
          if (res.store) {
            TourService.init();
            res.profile.store = res.store;
            UserService.setBg(res.store.bg_url);
            UserService.setAvatar(res.store.avatar_url);
          }
          else {
            res.profile.store = {};
          }
          UserService.setProfile(res.profile);
          UserService.setIsSeller(res.profile.seller);

          if($scope.isInApp){
            $state.go('itemview', JSON.parse($cookies.lastItem));
          }else{
            res.profile.seller ? UserService.goToMainStore() : $state.go('stream', {storeurl: res.store.store_url});
          }

        }
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
    }]);