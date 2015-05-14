'use strict';

app
    .factory('authInterceptor', function ($q, $window, UserService, $injector) {
        return {
            request: function (config) {
                if ($window.sessionStorage._auth && config.url.substring(0, 4) == 'http') {
                    config.params = {
                        'access-token': $window.sessionStorage._auth
                    };
                }
                UserService.init();
                return config;
            },
            responseError: function (rejection) {
                if (rejection.status === 401 || rejection.status === 0) {
                    var stateService = $injector.get('$state');
                    stateService.go('main');
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
            condition: undefined,

            models: function () {
                return $http.get(this.baseUrl + this.path + location.search);
            },

            model: function () {
                if ($stateParams.expand != null) {
                    return $http.get(this.baseUrl + this.path + "/" + $stateParams.id + '?expand=' + $stateParams.expand);
                }
                return $http.get(this.baseUrl + this.path + "/" + $stateParams.id);
            },

            get: function () {
                return $http.get(this.baseUrl + this.path);
            },

            postModel: function (model) {
                return $http.post(this.baseUrl + this.path, model);
            },

            putModel: function (model) {
                return $http.put(this.baseUrl + this.path + "/" + $stateParams.id, model);
            },

            deleteModel: function () {
                return $http.delete(this.baseUrl + this.path);
            }
        };
    })
    .factory('UserService', function ($rootScope, $window, $injector) {
        var currentUser;
        return {
            init: function(){
                this.initBgAndAvatar();
                this.initIsSeller();
                this.initBgFilter();
            },
            login: function (token) {
                $window.sessionStorage._auth = token;
            },
            logout: function () {
                $window.sessionStorage.removeItem('_auth');
            },
            isGuest: function () {
                if ($window.sessionStorage._auth) return false;
                else return true;
            },
            setBg: function (bgUrl) {
                $rootScope.bgUrl = $window.sessionStorage.bgUrl = bgUrl;
            },
            setAvatar: function (avatarUrl) {
                $rootScope.avatarUrl = $window.sessionStorage.avatarUrl = avatarUrl;
            },
            initBgAndAvatar: function () {
                if ($window.sessionStorage.avatarUrl) $rootScope.avatarUrl = $window.sessionStorage.avatarUrl;
                if ($window.sessionStorage.bgUrl) $rootScope.bgUrl = $window.sessionStorage.bgUrl;
            },
            initBgFilter: function() {
                var stateService = $injector.get('$state');
                if (stateService.includes('store')) $rootScope.bgFilter = '-webkit-filter:blur(0px);filter:blur(0px);';
                else if ($rootScope.bgFilter != '-webkit-filter:blur(6px);filter:blur(6px);')
                    $rootScope.bgFilter = '-webkit-filter:blur(6px);filter:blur(6px);';
            },
            //sometimes should be deprecated
            initIsSeller: function () {
                if ($window.sessionStorage.isSeller == "true")
                    $rootScope.isSeller = true;
                else
                    $rootScope.isSeller = false;
            },
            isSeller: function(){
                if ($window.sessionStorage.isSeller == "true")
                    return true;
                else
                    return false;
            },
            setIsSeller: function (value) {
                $window.sessionStorage.isSeller = $rootScope.isSeller = value;
            },
            setProfile: function (profile) {
                $window.sessionStorage.facebookProfile = JSON.stringify(profile);
            },
            getProfile: function () {
                if ($window.sessionStorage.facebookProfile)
                    return JSON.parse($window.sessionStorage.facebookProfile);
                else return {};
            },
            currentUser: function () {
                return currentUser;
            }
        };
    });