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
    .service('feedHelper', function () {
      return {
        seeMore: false,
        leaveComment: false
      }
    })
    .service('SStorage', ['messageService', '$window',
      function (messageService, $window) {
        this.isSessionStorageAvailable = function () {
          try {
            $window.sessionStorage.world = 'hello';
            delete $window.sessionStorage.world;
            return true;
          } catch (ex) {
            messageService.simpleAlert('lstorageisnotavailable');
          }
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