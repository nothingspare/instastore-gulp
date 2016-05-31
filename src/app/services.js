'use strict';
angular.module('instastore')
    .factory('authInterceptor', function ($q, UserService, $injector, $cookies) {
      return {
        request: function (config) {
          if ($cookies._auth && config.url.substring(0, 4) === 'http') {
            config.params = {
              'access-token': $cookies._auth
            };
          }
          UserService.init();
          return config;
        },
        responseError: function (rejection) {
          if (rejection.status === 401 || rejection.status === 0) {
            var stateService = $injector.get('$state');
            stateService.go('login');
          }
          return $q.reject(rejection);
        }
      };
    })
    // Need set url REST Api in controller!
    .service('rest', function ($http, $location, $stateParams, API_URL) {
      return {
        baseUrl: API_URL,
        path: undefined,

        serialize: function (obj, prefix) {
          var str = [];
          for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
              var k = prefix ? prefix + '[' + p + ']' : p, v = obj[p];
              str.push(typeof v === 'object' ?
                  serialize(v, k) :
              encodeURIComponent(k) + '=' + encodeURIComponent(v));
            }
          }
          return str.join('&');
        },

        models: function (filter) {
          if (!filter) {
            return $http.get(this.baseUrl + this.path);
          }
          return $http.get(this.baseUrl + this.path + '?' + this.serialize(filter));
        },

        model: function (id) {
          if (id)
            return $http.get(this.baseUrl + this.path + '/' + id);
          if ($stateParams.expand != null)
            return $http.get(this.baseUrl + this.path + '/' + $stateParams.id + '?expand=' + $stateParams.expand);
          return $http.get(this.baseUrl + this.path + '/' + $stateParams.id);
        },

        get: function () {
          return $http.get(this.baseUrl + this.path);
        },

        postModel: function (model) {
          return $http.post(this.baseUrl + this.path, model);
        },

        putModel: function (model) {
          if (model.id) return $http.put(this.baseUrl + this.path + '/' + model.id, model);
          return $http.put(this.baseUrl + this.path + '/' + $stateParams.id, model);
        },

        deleteModel: function () {
          return $http.delete(this.baseUrl + this.path);
        }
      };
    })
    .factory('UserService', ['$rootScope', '$injector', '$cookies', '$window',
      function ($rootScope, $injector, $cookies, $window) {
        var isInvited;
        var isManageStore;
        var currentUser = {};

        return {
          currentUser: currentUser,
          init: function () {
            //this.initBgAndAvatar();
            //this.initIsSeller();
            this.initBgFilter();
          },
          login: function (token) {
            $cookies._auth = token;
            // return CookieService.setCookie('_auth', token, {expires: 3600 * 24 * 30});
          },
          logout: function () {
            delete $cookies._auth;
          },
          getToken: function () {
            return $cookies._auth;
          },
          isGuest: function () {
            var token = $cookies._auth;
            return !token;
          },
          getIsManageStore: function () {
            return isManageStore;
          },
          toggleIsManageStore: function () {
            isManageStore = !isManageStore;
            if (isManageStore) {
              this.goToMainStore();
            }
            else {
              this.goToStream();
            }
          },
          goToStream: function () {
            var profile = this.getProfile();
            var state = $injector.get('$state');
            state.go('stream', {storeurl: profile.store.store_url, view: 'ms'});
          },
          getUserRole: function () {
            var profile = this.getProfile();
            return profile.seller;
          },
          getUserFullName: function () {
            var profile = this.getProfile();
            /*jshint camelcase: false */
            return profile.first_name + ' ' + profile.last_name;
          },
          setBg: function (bgUrl) {
            var profile = this.getProfile();
            if (profile.store) {
              profile.store.bg_url = bgUrl;
              this.setProfile(profile);
              $cookies.bgUrl = $rootScope.bgUrl = bgUrl;
            }
          },
          //instaimport part
          fromInstaimport: false,
          goToInstaimport: function () {
            var profile = this.getProfile();
            var state = $injector.get('$state');
            state.go('instaimport', {storeurl: profile.seller ? profile.store.store_url : profile.inviter_url});
          },
          //go to your store as seller, go to inviter's store as buyer
          goToMainStore: function () {
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
          },
          getMainStoreUrl: function () {
            var profile = this.getProfile();
            return profile.seller ? profile.store.store_url : profile.inviter_url;
          },
          goToStoreProfile: function (storeUrl) {
            var profile = this.getProfile();
            var state = $injector.get('$state');
            state.go('store', {
              storeurl: storeUrl ? storeUrl : profile.store.store_url
            });
          },
          routeStoreurlCheck: function () {
            var state = $injector.get('$state');
            return state.includes('store') || state.includes('grid') || state.includes('itemview') || state.includes('location') || state.includes('instaimport') ? true : false;
          },
          checkStoreUrl: function () {
            var stateParams = $injector.get('$stateParams');
            if (!stateParams.storeurl) {
              this.goToMainStore();
              return false;
            } else
              return stateParams.storeurl;
          },
          isYourStore: function () {
            var profile = this.getProfile();
            var storeUrl = this.checkStoreUrl();
            if (storeUrl && profile.store) {
              return profile.store.store_url === storeUrl;
            }
            else {
              return false;
            }
          },
          initMyStoreSettings: function () {
            var profile = this.getProfile();
            $rootScope.store = profile.store;
            $rootScope.isSeller = !!profile.seller;
            this.initBgAndAvatar();
          },
          initStore: function () {
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
          },
          setAvatar: function (avatarUrl) {
            var profile = this.getProfile();
            if (profile.store) {
              profile.store.avatar_url = avatarUrl;
              this.setProfile(profile);
              $cookies.avatarUrl = avatarUrl;
            }
          },
          initBgAndAvatar: function () {
            var profile = this.getProfile();
            if (profile.store.store_url) {
              $rootScope.bgUrl = profile.store.bg_url;
            }
          },
          initBgFilter: function () {
            var stateService = $injector.get('$state');
            if (stateService.includes('store'))
              $rootScope.bgFilter = '-webkit-filter:blur(0px);filter:blur(0px);';
            else if ($rootScope.bgFilter != '-webkit-filter:blur(6px);filter:blur(6px);')
              $rootScope.bgFilter = '-webkit-filter:blur(6px);filter:blur(6px);';
          },
          initIsSeller: function () {
            $rootScope.isSeller = String($cookies.isSeller) === 'true';
          },
          isSeller: function () {
            return !!(String($cookies.isSeller) === 'true' && this.isYourStore());
          },
          setIsSeller: function (value) {
            $cookies.isSeller = $rootScope.isSeller = value;
          },
          setProfile: function (profile) {
            $cookies.profile = profile.id;

            if (!angular.equals(profile, currentUser)) {
              angular.copy(profile, currentUser)
            }
            
            if (profile.inviter_id) isInvited = true;
          },
          getProfile: function () {
            if (this.currentUser.id) {
              return this.currentUser;
            } else if ($cookies.profile) {
              return JSON.parse($cookies.profile);
            }
            return {};
          },
          getInvitedStatus: function () {
            return !!isInvited;
          },
          setFacebookProfile: function (profile) {
            // $window.sessionStorage.facebookProfile = JSON.stringify(profile);
          },
          getFacebookProfile: function () {
            if ($window.sessionStorage.facebookProfile)
              return JSON.parse($window.sessionStorage.facebookProfile);
            else return {};
          },
          //For redirects from socials
          saveLastRouteToProfile: function (route) {
            var profile = this.getProfile();
            profile.lastRoute = route;
            this.setProfile(profile);
          },
          goToLastRouteFromProfile: function () {
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
        };
      }])
    .service('feedHelper', function () {
      return {
        seeMore: false,
        leaveComment: false
      }
    })
    .service('SStorage', ['messageService', '$window',
      function (messageService, $window) {
        this.isSessionStorageAvailable = function () {
          // try {
          //     $window.sessionStorage.world = 'hello';
          //     delete $window.sessionStorage.world;
          //     return true;
          // } catch (ex) {
          //     messageService.simpleAlert('lstorageisnotavailable');
          // }
        };
      }
    ])
    .service('ImageService', [
      function () {
        this.dataURItoBlob = function (dataURI) {
          var binary = atob(dataURI.split(',')[1]);
          var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
          var array = [];
          for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
          }
          return new Blob([new Uint8Array(array)], {type: mimeString});
        };
      }
    ])
    .service('InAppService', ['$mdDialog', '$mdMedia', function ($mdDialog) {
      return {
        isFacebookInApp: function () {
          var ua = navigator.userAgent || navigator.vendor || window.opera;
          return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
        },
        warnIfInApp: function () {
          if (this.isFacebookInApp()) {
            $mdDialog.show({
              templateUrl: 'app/components/item/inapp-warning.html',
              parent: angular.element(document.body),
              clickOutsideToClose: true,
              controller: function ($scope, $mdDialog) {
                $scope.closeDialog = function () {
                  $mdDialog.hide();
                }
              }
            });
          }
        }
      }
    }])
    .factory('RouterTracker', [
      '$rootScope',
      'UserService',
      '$state',
      '$stateParams',
      function ($rootScope,
                UserService,
                $state,
                $stateParams) {
        var profile = UserService.getProfile();
        var routeHistory = [];
        var service = {
          getRouteHistory: getRouteHistory,
          goToLastRoute: goToLastRoute
        };
        var streamRoute = {
          route: {
            name: 'stream'
          },
          routeParams: {
            storeurl: !UserService.isGuest() ? profile.store.store_url : $stateParams.storeurl
          }
        };

        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
          routeHistory.push({route: from, routeParams: fromParams, to: to, toParams: toParams});
        });

        function getRouteHistory() {
          return routeHistory;
        }

        function goToLastRoute() {
          var lastRoute = getLastRoute();
          routeHistory.splice(routeHistory.length - 1);
          $state.go(lastRoute.route.name, lastRoute.routeParams).then(function () {
            routeHistory.splice(routeHistory.length - 1);
          });
        }

        function goToRoute(route) {
          $state.go(route.route.name, route.routeParams);
        }

        function goToStreamRoute() {
          $state.go(streamRoute.route.name, streamRoute.routeParams);
        }

        function getLastRoute() {

          //if page reloading
          if (!routeHistory[routeHistory.length - 1]) {
            return streamRoute;
          }
          else {
            return routeHistory[routeHistory.length - 1];
          }
        }

        return service;
      }]);