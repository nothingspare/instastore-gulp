'use strict';

var app = angular.module('instastore',
    ['ui.router', 'ngAnimate', 'toaster', 'ngSanitize', 'angular-carousel', 'satellizer',
        'ngFileUpload', 'ngImgCrop', 'angular-loading-bar', 'ngDialog', 'ngTouch', 'ngCookies', 'uiGmapgoogle-maps',
        'google.places', 'ngClipboard', 'ng.deviceDetector', 'cfp.loadingBar', 'plupload.directive', 'ui.tree',
        'angularMoment', 'payment', 'angular-stripe', 'ngMdIcons', 'ngMaterial'
    ]);

app.config(['$locationProvider', '$urlRouterProvider', '$stateProvider', '$httpProvider', '$authProvider',
    'API_URL', 'ngClipProvider', 'uiGmapGoogleMapApiProvider', 'cfpLoadingBarProvider',
    'plUploadServiceProvider', 'stripeProvider',
    function ($locationProvider, $urlRouterProvider, $stateProvider, $httpProvider,
              $authProvider, API_URL, ngClipProvider, uiGmapGoogleMapApiProvider, cfpLoadingBarProvider,
              plUploadServiceProvider, stripeProvider) {

        var modulesPath = 'app/components';

        $urlRouterProvider.otherwise('/');

        $stateProvider.state('login', {
            url: '/',
            controller: 'SiteLogin',
            templateUrl: modulesPath + '/site/main.html'
        });

        $stateProvider.state('grid', {
            url: '/:storeurl/mode/:mode',
            controller: 'ItemIndex',
            templateUrl: function ($stateParams) {
                return $stateParams.mode !== 'feed' ? modulesPath + '/item/item-grid.html' : modulesPath + '/item/index.html';
            }
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


        $stateProvider.state('itemview', {
            url: '/:storeurl/:itemurl/:tab',
            controller: 'ItemView',
            templateUrl: modulesPath + '/item/view.html'
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

        $stateProvider.state('instaimport', {
            url: '/instaimport/:storeurl',
            controller: 'InstagramImport',
            templateUrl: modulesPath + '/item/instaimport.html'
        });

        $authProvider.baseUrl = API_URL;
        $authProvider.storage = 'sessionStorage';

        var configFacebook = {
            clientId: '424453844422139',
            url: 'v1/user/auth',
            scope: 'email',
            scopeDelimiter: ',',
            display: 'popup'
        };

        var configInstagram = {
            name: 'instagram',
            url: '/v1/link/instagram',
            redirectUri: 'http://instastore.us/profilestore/',
            clientId: '59429297486f4f2393762a1febf17583',
            requiredUrlParams: ['scope'],
            scope: ['likes'],
            scopeDelimiter: '+',
            authorizationEndpoint: 'https://instagram.com/oauth/authorize',
            display: 'popup'
        };

        switch (window.location.origin) {
            case 'http://isopen.us':
                configFacebook.clientId = '801870543171280';
                configInstagram.clientId = 'a7cf21e1b2dc47d1a77f5f7ce3bbcae5';
                configInstagram.redirectUri = 'http://isopen.us';
                break;
            case 'http://192.168.0.103:3000':
                //configFacebook.clientId = '694297854007943';
                configInstagram.clientId = '7f744b4b4f844419bd49872ac67cf22a';
                configInstagram.redirectUri = 'http://192.168.0.103:3000/';
                break;
        }

        $authProvider.facebook(configFacebook);
        $authProvider.oauth2(configInstagram);

        $locationProvider.html5Mode(true).hashPrefix('!');

        $httpProvider.interceptors.push('authInterceptor');

        ngClipProvider.setPath('bower_components/zeroclipboard/dist/ZeroClipboard.swf');

        uiGmapGoogleMapApiProvider.configure({
            v: '3.17',
            libraries: 'places'
        });

        plUploadServiceProvider.setConfig('flashPath', 'bower_components/plupload-angular-directive/plupload.flash.swf');
        plUploadServiceProvider.setConfig('silverLightPath', 'bower_components/plupload-angular-directive/plupload.silverlight.xap');
        plUploadServiceProvider.setConfig('resize', {width: 310, height: 390});

        //stripeProvider.setPublishableKey('pk_live_gAjzCf5vWrdKN8ycRSCbQDan');
        stripeProvider.setPublishableKey('pk_test_1tDqDLjRoJ6lkeyKoQsQ4ZX0');


    }]);

app.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
});


