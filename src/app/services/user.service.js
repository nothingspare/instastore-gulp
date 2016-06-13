(function () {
  'use strict';

  angular
      .module('instastore')
      .factory('UserService', UserService);

  UserService.$inject = ['$rootScope', '$injector', '$cookies', '$window'];

  /* @ngInject */
  function UserService($rootScope, $injector, $cookies, $window) {
    var currentUser = {};

    var service = {
      currentUser: currentUser,
      fromInstaimport: false,

      init: init,
      initMyStoreSettings: initMyStoreSettings,
      initStore: initStore,
      initBgAndAvatar: initBgAndAvatar,
      initBgFilter: initBgFilter,
      initIsSeller: initIsSeller,

      saveProfile: saveProfile,

      getToken: getToken,

      login: login,
      logout: logout,

      isGuest: isGuest,
      isYourStore: isYourStore,

      getIsManageStore: getIsManageStore,
      toggleIsManageStore: toggleIsManageStore,

      checkStoreUrl: checkStoreUrl,

      setAvatar: setAvatar,
      setProfile: setProfile,
      setBg: setBg,
      setIsSeller: setIsSeller,
      isSeller: isSeller,
      setFacebookProfile: setFacebookProfile,

      getProfile: getProfile,
      getUserRole: getUserRole,
      getUserFullName: getUserFullName,
      getProfileAuth: getProfileAuth,
      getInvitedStatus: getInvitedStatus,
      getMainStoreUrl: getMainStoreUrl,
      goToStoreProfile: goToStoreProfile,
      getFacebookProfile: getFacebookProfile,

      routeStoreurlCheck: routeStoreurlCheck,
      goToStream: goToStream,
      goToMainStore: goToMainStore,
      goToInstaimport: goToInstaimport,

      //For redirects from socials
      saveLastRouteToProfile: saveLastRouteToProfile,
      goToLastRouteFromProfile: goToLastRouteFromProfile
    };
    return service;

    ////////////////

    function saveProfile(profile) {
      if (!angular.equals(profile, currentUser)) {
        angular.copy(profile, currentUser)
      }
    }

    function init() {
      initBgFilter();
    }

    function login(token) {
      $cookies._auth = token;
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

    function getIsManageStore() {
      return isManageStore;
    }

    function toggleIsManageStore() {
      isManageStore = !isManageStore;
      if (isManageStore) {
        goToMainStore();
      }
      else {
        goToStream();
      }
    }

    function goToStream() {
      var profile = getProfile();
      var state = $injector.get('$state');
      state.go('stream', {storeurl: profile.store.store_url, view: 'ms'});
    }

    function getUserRole() {
      var profile = getProfile();
      return profile.seller;
    }

    function getUserFullName() {
      var profile = getProfile();
      /*jshint camelcase: false */
      return profile.first_name + ' ' + profile.last_name;
    }

    function setBg(bgUrl) {
      var profile = getProfile();
      if (profile.store) {
        profile.store.bg_url = bgUrl;
        setProfile(profile);
        $cookies.bgUrl = $rootScope.bgUrl = bgUrl;
      }
    }

    //instaimport part
    function goToInstaimport() {
      var profile = getProfile();
      var state = $injector.get('$state');
      state.go('instaimport', {storeurl: profile.seller ? profile.store.store_url : profile.inviter_url});
    }

    //go to your store as seller, go to inviter's store as buyer
    function goToMainStore() {
      var profile = getProfile();
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
      var profile = getProfile();
      return profile.seller ? profile.store.store_url : profile.inviter_url;
    }

    function goToStoreProfile(storeUrl) {
      var profile = getProfile();
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
        goToMainStore();
        return false;
      } else
        return stateParams.storeurl;
    }

    function isYourStore() {
      var profile = getProfile();
      var storeUrl = checkStoreUrl();
      if (storeUrl && profile.store) {
        return profile.store.store_url === storeUrl;
      }
      else {
        return false;
      }
    }

    function initMyStoreSettings() {
      var profile = getProfile();
      $rootScope.store = profile.store;
      $rootScope.isSeller = !!profile.seller;
      initBgAndAvatar();
    }

    function initStore() {
      if (routeStoreurlCheck()) {
        var state = $injector.get('$state');
        var profile = getProfile();
        var facebookProfile = getFacebookProfile();
        var stateParams = $injector.get('$stateParams');
        var rest = $injector.get('rest');
        var messageService = $injector.get('messageService');
        if (stateParams.storeurl) {
          if (!isYourStore(stateParams.storeurl)) {
            rest.path = isGuest() ? 'v1/stores' : 'v1/my-stores';
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
      var profile = getProfile();
      if (profile.store) {
        profile.store.avatar_url = avatarUrl;
        setProfile(profile);
        $cookies.avatarUrl = avatarUrl;
      }
    }

    function initBgAndAvatar() {
      var profile = getProfile();
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

    function initIsSeller() {
      $rootScope.isSeller = String($cookies.isSeller) === 'true';
    }

    function isSeller() {
      return !!(String($cookies.isSeller) === 'true' && isYourStore());
    }

    function setIsSeller(value) {
      $cookies.isSeller = $rootScope.isSeller = value;
    }

    function setProfile(profile) {
      $cookies.profileId = profile.id;
      saveProfile(profile);
    }

    function getProfile() {
      return service.currentUser;
    }

    function getProfileAuth() {
      var rest = $injector.get('rest');
      rest.path = 'v1/profiles/' + $cookies.profileId;
      return rest.models({})
          .error(function (e) {
            console.log(e);
          });
    }

    function getInvitedStatus() {
      return !!isInvited;
    }

    function setFacebookProfile(profile) {
      // $window.sessionStorage.facebookProfile = JSON.stringify(profile);
    }

    function getFacebookProfile() {
      if ($window.sessionStorage.facebookProfile)
        return JSON.parse($window.sessionStorage.facebookProfile);
      else return {};
    }

    //For redirects from socials
    function saveLastRouteToProfile(route) {
      var profile = getProfile();
      profile.lastRoute = route;
      setProfile(profile);
    }

    function goToLastRouteFromProfile() {
      var state = $injector.get('$state');
      var profile = getProfile();
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

