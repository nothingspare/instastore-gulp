app
    .factory('authInterceptor', function ($q, UserService, $injector, $cookies) {
        return {
            request: function (config) {
                if ($cookies._auth && config.url.substring(0, 4) == 'http') {
                    config.params = {
                        'access-token': $cookies._auth
                    };
                }
                var stateParamsService = $injector.get('$stateParams');
                if (!stateParamsService.storeurl) UserService.init();
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
                        var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                        str.push(typeof v == "object" ?
                            serialize(v, k) :
                        encodeURIComponent(k) + "=" + encodeURIComponent(v));
                    }
                }
                return str.join("&");
            },

            models: function (filter) {
                if (!filter) return $http.get(this.baseUrl + this.path);
                return $http.get(this.baseUrl + this.path + '?' + this.serialize(filter));
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
                if (model.id) return $http.put(this.baseUrl + this.path + "/" + model.id, model);
                return $http.put(this.baseUrl + this.path + "/" + $stateParams.id, model);
            },

            deleteModel: function () {
                return $http.delete(this.baseUrl + this.path);
            }
        };
    })
    .factory('UserService', function ($rootScope, $injector, $cookies, $window, errorService) {
        var currentUser;
        var isInvited;
        return {
            init: function () {
                this.initBgAndAvatar();
                this.initIsSeller();
                this.initBgFilter();
            },
            login: function (token) {
                $cookies._auth = token;
            },
            logout: function () {
                delete $cookies._auth;
            },
            isGuest: function () {
                var token = $cookies._auth;
                if (token) return false;
                else return true;
            },
            setBg: function (bgUrl) {
                var profile = this.getProfile();
                if (profile.store) {
                    profile.store.bg_url = bgUrl;
                    this.setProfile(profile);
                    $cookies.bgUrl = $rootScope.bgUrl = bgUrl;
                }
            },
            isYourStore: function () {
                var profile = this.getProfile();
                var stateParams = $injector.get('$stateParams');

                return profile.store.store_url === stateParams.storeurl ? true : false;
            },
            initStore: function () {
                var state = $injector.get('$state');
                if (!this.isGuest()) {
                    var profile = this.getProfile();
                    var facebookProfile = this.getFacebookProfile();
                    var stateParams = $injector.get('$stateParams');
                    var rest = $injector.get('rest');
                    if (stateParams.storeurl && !this.isYourStore(stateParams.storeurl)) {
                        rest.path = 'v1/stores';
                        rest.models({store_url: stateParams.storeurl}).success(function (data) {
                            var store = data[0];
                            if (!store) {
                                errorService.simpleAlert('nostorewithurl');
                                state.go('grid');
                                return;
                            }
                            if (!store.avatar_url) store.avatar_url = 'http://graph.facebook.com/' + facebookProfile.id + '/picture?type=large';
                            if (state.includes('store')) {
                                rest.path = 'v1/user-lastitems';
                                rest.models({user_id: store.user_id}).success(function (data) {
                                    store.items = data;
                                    $rootScope.bgUrl = store.bg_url;
                                    $rootScope.avatarUrl = store.avatar_url;
                                    $rootScope.isSeller = false;
                                    $rootScope.store = store;
                                }).error(errorService.alert);
                            }
                            else $rootScope.store = store;
                        }).error(errorService.alert);
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
                                }).error(errorService.alert);
                            }
                            else $rootScope.store = profile.store;
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
            }
            ,
            initBgAndAvatar: function () {
                var bgU = $cookies.bgUrl;
                if (bgU) $rootScope.bgUrl = bgU;
            }
            ,
            initBgFilter: function () {
                var stateService = $injector.get('$state');
                if (stateService.includes('store')) $rootScope.bgFilter = '-webkit-filter:blur(0px);filter:blur(0px);';
                else if ($rootScope.bgFilter != '-webkit-filter:blur(6px);filter:blur(6px);')
                    $rootScope.bgFilter = '-webkit-filter:blur(6px);filter:blur(6px);';
            }
            ,
            initIsSeller: function () {
                if ($cookies.isSeller == "true")
                    $rootScope.isSeller = true;
                else
                    $rootScope.isSeller = false;
            }
            ,
            isSeller: function () {
                if ($cookies.isSeller == "true")
                    return true;
                else
                    return false;
            }
            ,
            setIsSeller: function (value) {
                $cookies.isSeller = $rootScope.isSeller = value;
            }
            ,
            setProfile: function (profile) {
                $cookies.profile = JSON.stringify(profile);
                if (profile.inviter_id) isInvited = true;
            }
            ,
            getProfile: function () {
                if ($cookies.profile)
                    return JSON.parse($cookies.profile);
                else return {};
            }
            ,
            getInvitedStatus: function () {
                if (isInvited) return true;
                else return false;
            }
            ,
            setFacebookProfile: function (profile) {
                $window.sessionStorage.facebookProfile = JSON.stringify(profile);
            }
            ,
            getFacebookProfile: function () {
                if ($window.sessionStorage.facebookProfile)
                    return JSON.parse($window.sessionStorage.facebookProfile);
                else return {};
            }
            ,
            currentUser: function () {
                return currentUser;
            }
        };
    })
    .service('errorService', function (toaster) {
        var messages = {
            nourl: {status: '', name: '', message: 'No url specified!'},
            nostorewithurl: {status: 404, name: 'error', message: 'There is no store with such url'},
            noitemwithurl: {status: 404, name: 'error', message: 'There is no item with such url'},
            fileisntuploaded: {message: 'File is not uploaded!', status: 500, name: 'Ooops!', code: 500},
            noinviterwithurl: {status: 404, name: 'error', message: 'There is no inviter store with such url'}
        };
        return {
            alert: function (data) {
                toaster.clear();
                if (data.status == undefined) {
                    angular.forEach(data, function (error) {
                        toaster.pop('error', "Field: " + error.field, error.message);
                    });
                }
                else {
                    toaster.pop('error', "code: " + data.code + " " + data.name, data.message);
                }
            },
            simpleAlert: function (code) {
                var data = messages[code];
                toaster.clear();
                toaster.pop('error', "status: " + data.status + " " + data.name, data.message);
            }
        }
    })
    .service('feedHelper', function () {
        return {
            seeMore: false,
            leaveComment: false
        }
    })
    .service('Item', function (rest, toaster, errorService) {
        return {
            save: function (item, successCallback) {
                rest.path = 'v1/user-items';
                rest.putModel(item).success(
                    successCallback ? successCallback : function () {
                        toaster.pop('success', "Saved");
                    }).error(errorService.alert);
            }
        }
    });