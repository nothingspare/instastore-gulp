'use strict';

var app = angular.module('instastore',
    ['ui.router', 'ngAnimate', 'toaster', 'ngSanitize', 'angular-carousel', 'satellizer',
        'angularFileUpload', 'ngImgCrop', 'angular-loading-bar', 'ngDialog', 'ngTouch', 'ngCookies', 'uiGmapgoogle-maps',
        'google.places'
    ]);

app.config(['$locationProvider', '$urlRouterProvider', '$stateProvider', '$httpProvider', '$authProvider', 'API_URL',
    function ($locationProvider, $urlRouterProvider, $stateProvider, $httpProvider, $authProvider, API_URL) {

        var modulesPath = 'app/components';

        $urlRouterProvider.otherwise('/');

        $stateProvider.state('main', {
            url: '/',
            controller: 'SiteLogin',
            templateUrl: modulesPath + '/site/main.html'
        });

        $stateProvider.state('sellorbuy', {
            url: '/sellorbuy/',
            controller: 'SellOrBuy',
            templateUrl: modulesPath + '/site/sellorbuy.html'
        });

        $stateProvider.state('storeselect', {
            url: '/storeselect/',
            controller: 'SiteStoreSelect',
            templateUrl: modulesPath + '/site/storeselect.html'
        });

        $stateProvider.state('item', {
            url: '/{storeurl}',
            controller: 'ItemIndex',
            templateUrl: modulesPath + '/item/index.html'
        });

        $stateProvider.state('itemview', {
            url: '/:storeurl/:itemurl/:tab',
            controller: 'ItemView',
            templateUrl: modulesPath + '/item/view.html'
        });

        $stateProvider.state('grid', {
            url: '/grid/:storeurl',
            controller: 'ItemIndex',
            templateUrl: modulesPath + '/item/item-grid.html'
        });

        $stateProvider.state('accounts', {
            url: '/accounts/',
            controller: 'StoreAccounts',
            templateUrl: modulesPath + '/store/accounts.html'
        });

        $stateProvider.state('profile', {
            url: '/profile/',
            resolve: {
                PreviousState: [
                    '$state',
                    function ($state) {
                        var currentStateData = {
                            Name: $state.current.name,
                            Params: $state.params,
                            URL: $state.href($state.current.name, $state.params)
                        };
                        return currentStateData;
                    }
                ]
            },
            controller: 'ProfileIndex',
            templateUrl: modulesPath + '/profile/index.html'
        });

        $stateProvider.state('profilestore', {
            url: '/profilestore/',
            controller: 'ProfileStoreIndex',
            templateUrl: modulesPath + '/profile/profilestore.html'
        });

        $stateProvider.state('storeview', {
            url: '/storeview/:storeurl',
            controller: 'StoreView',
            templateUrl: modulesPath + '/item/index.html'
        });

        $stateProvider.state('location', {
            url: '/location/:storeurl',
            controller: 'LocationIndex',
            templateUrl: modulesPath + '/location/index.html'
        });

        $stateProvider.state('store', {
            url: '/store/:storeurl',
            controller: 'StoreIndex',
            templateUrl: modulesPath + '/store/index.html'
        });

        $authProvider.baseUrl = API_URL;

        $authProvider.facebook({
            clientId: '352496064951251',
            url: 'v1/user/auth'
        });

        $locationProvider.html5Mode(true).hashPrefix('!');
        $httpProvider.interceptors.push('authInterceptor');
    }]);

app.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
});



