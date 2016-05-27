(function () {
  'use strict';

  angular
      .module('instastore')
      .factory('UserService', UserService);

  UserService.$inject = ['$rootScope', '$injector', '$cookies', '$window', 'CookieService'];

  /* @ngInject */
  function UserService($rootScope, $injector, $cookies, $window, CookieService) {
    var service = {
      //instaimport part
      fromInstaimport: false,

      init: init,
      login: login,
      logout: logout,
      getToken: getToken,
      isGuest: isGuest,
      goToStream: goToStream,
      getUserFullName: getUserFullName,
      setBg: setBg,
      //go to your store as seller, go to inviter's store as buyer
      goToMainStore: goToMainStore,
      getMainStoreUrl: getMainStoreUrl,
      goToStoreProfile: goToStoreProfile,
      routeStoreurlCheck: routeStoreurlCheck,
      checkStoreUrl: checkStoreUrl,
      isYourStore: isYourStore,
      initMyStoreSettings: initMyStoreSettings,
      initStore: initStore,
      setAvatar: setAvatar,
      initBgAndAvatar: initBgAndAvatar,
      initBgFilter: initBgFilter,
      isSeller: isSeller,
      setIsSeller: setIsSeller,
      setProfile: setProfile,
      getProfile: getProfile,
      setFacebookProfile: setFacebookProfile,
      getFacebookProfile: getFacebookProfile,
      //For redirects from socials
      saveLastRouteToProfile: saveLastRouteToProfile,
      goToLastRouteFromProfile: goToLastRouteFromProfile
    };
    return service;

    ////////////////

    function init() {
      this.initBgFilter();
    }

    function login(token) {
      return CookieService.setCookie('_auth', token, {expires: 3600 * 24 * 30});
    }

    function logout() {
      delete $cookies._auth;
    }

    function getToken() {
      return $cookies._auth;
    }

    function isGuest() {
      var token = $cookies._auth;
      return !token;
    }

    function goToStream() {
      var profile = this.getProfile();
      var state = $injector.get('$state');
      state.go('stream', {storeurl: profile.store.store_url, view: 'ms'});
    }

    function getUserFullName() {
      var profile = this.getProfile();
      /*jshint camelcase: false */
      return profile.first_name + ' ' + profile.last_name;
    }

    function setBg(bgUrl) {
      var profile = this.getProfile();
      if (profile.store) {
        profile.store.bg_url = bgUrl;
        this.setProfile(profile);
        $cookies.bgUrl = $rootScope.bgUrl = bgUrl;
      }
    }

    //go to your store as seller, go to inviter's store as buyer
    function goToMainStore() {
      var profile = this.getProfile();
      var state = $injector.get('$state');
      var stateParams = $injector.get('$stateParams');
      if (profile.seller || profile.inviter_url) {
        if (profile.seller && $rootScope.bgUrl !== profile.store.bg_url) {
          $rootScope.bgUrl = profile.store.bg_url
        }
        if (profile.store.store_url === stateParams.storeurl) {
          $rootScope.isSeller = true;
        }
        state.go('grid', {
          storeurl: profile.seller ? profile.store.store_url : profile.inviter_url,
          mode: profile.seller ? '' : 'feed'
        });
      }
    }

    function getMainStoreUrl() {
      var profile = this.getProfile();
      return profile.seller ? profile.store.store_url : profile.inviter_url;
    }

    function goToStoreProfile(storeUrl) {
      var profile = this.getProfile();
      var state = $injector.get('$state');
      state.go('store', {
        storeurl: storeUrl ? storeUrl : profile.store.store_url
      });
    }

    function routeStoreurlCheck() {
      var state = $injector.get('$state');
      return state.includes('store') || state.includes('grid') || state.includes('itemview') || state.includes('location') || state.includes('instaimport') ? true : false;
    }

    function checkStoreUrl() {
      var stateParams = $injector.get('$stateParams');
      if (!stateParams.storeurl) {
        this.goToMainStore();
        return false;
      } else
        return stateParams.storeurl;
    }

    function isYourStore() {
      var profile = this.getProfile();
      var storeUrl = this.checkStoreUrl();
      if (storeUrl && profile.store) {
        return profile.store.store_url === storeUrl;
      }
      else {
        return false;
      }
    }

    function initMyStoreSettings() {
      var profile = this.getProfile();
      $rootScope.store = profile.store;
      $rootScope.isSeller = !!profile.seller;
      this.initBgAndAvatar();
    }

    function initStore() {
      if (this.routeStoreurlCheck()) {
        var state = $injector.get('$state');
        var profile = this.getProfile();
        var facebookProfile = this.getFacebookProfile();
        var stateParams = $injector.get('$stateParams');
        var rest = $injector.get('rest');
        var messageService = $injector.get('messageService');
        if (stateParams.storeurl) {
          if (!this.isYourStore(stateParams.storeurl)) {
            rest.path = this.isGuest() ? 'v1/stores' : 'v1/my-stores';
            rest.models({store_url: stateParams.storeurl}).success(function (data) {
              var store = data[0];
              if (!store) {
                messageService.simpleAlert('nostorewithurl');
                state.go('grid');
                return;
              }
              if (!store.avatar_url) store.avatar_url = '../assets/images/background1circle290x290px.jpg';
              if (state.includes('store')) {
                rest.path = 'v1/user-lastitems';
                rest.models({user_id: store.user_id}).success(function (data) {
                  store.items = data;
                  $rootScope.bgUrl = store.bg_url;
                  $rootScope.avatarUrl = store.avatar_url;
                  $rootScope.isSeller = false;
                  $rootScope.store = store;
                }).error(messageService.alert);
              }
              else {
                $rootScope.isSeller = false;
                $rootScope.store = store;
                $rootScope.bgUrl = store.bg_url;
              }
            }).error(messageService.alert);
          }
          else {
            if (!profile.seller && (state.includes('grid'))) state.go('grid', {storeurl: profile.inviter_url});
            if (profile.store) {
              if (!profile.store.avatar_url) profile.store.avatar_url = 'http://graph.facebook.com/' + facebookProfile.id + '/picture?type=large';
              if (state.includes('store')) {
                rest.path = 'v1/user-lastitems';
                rest.models({user_id: profile.id}).success(function (data) {
                  $rootScope.store = profile.store;
                  if (!data) return;
                  $rootScope.store.items = data;
                }).error(messageService.alert);
              }
              else {
                $rootScope.store = profile.store;
                $rootScope.bgUrl = profile.store.bg_url;
              }
            }
          }
        }
      }
    }

    function setAvatar(avatarUrl) {
      var profile = this.getProfile();
      if (profile.store) {
        profile.store.avatar_url = avatarUrl;
        this.setProfile(profile);
        $cookies.avatarUrl = avatarUrl;
      }
    }

    function initBgAndAvatar() {
      var profile = this.getProfile();
      if (profile.store.store_url) {
        $rootScope.bgUrl = profile.store.bg_url;
      }
    }

    function initBgFilter() {
      var stateService = $injector.get('$state');
      if (stateService.includes('store'))
        $rootScope.bgFilter = '-webkit-filter:blur(0px);filter:blur(0px);';
      else if ($rootScope.bgFilter != '-webkit-filter:blur(6px);filter:blur(6px);')
        $rootScope.bgFilter = '-webkit-filter:blur(6px);filter:blur(6px);';
    }

    function isSeller() {
      return !!(String($cookies.isSeller) === 'true' && this.isYourStore());
    }

    function setIsSeller(value) {
      $cookies.isSeller = $rootScope.isSeller = value;
    }

    function setProfile(profile) {
      $cookies.profile = JSON.stringify(profile);
    }

    function getProfile() {
      if ($cookies.profile)
        return JSON.parse($cookies.profile);
      else return {};
    }

    function setFacebookProfile(profile) {
      $window.sessionStorage.facebookProfile = JSON.stringify(profile);
    }

    function getFacebookProfile() {
      if ($window.sessionStorage.facebookProfile)
        return JSON.parse($window.sessionStorage.facebookProfile);
      else return {};
    }

    //For redirects from socials
    function saveLastRouteToProfile(route) {
      var profile = this.getProfile();
      profile.lastRoute = route;
      this.setProfile(profile);
    }

    function goToLastRouteFromProfile() {
      var state = $injector.get('$state');
      var profile = this.getProfile();
      if (profile.lastRoute) {
        var tempRoute = profile.lastRoute;
        profile.lastRoute = {};
        state.go(tempRoute.from.name, tempRoute.fromParams);
      }
      else {
        return false;
      }

    }

  }
})();

