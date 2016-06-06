'use strict';

var app = angular.module('instastore',
    ['ui.router', 'ngAnimate', 'ngSanitize', 'angular-carousel', 'satellizer',
      'ngFileUpload', 'ngImgCrop', 'angular-loading-bar', 'ngTouch', 'ngCookies', 'uiGmapgoogle-maps',
      'google.places', 'ngClipboard', 'ng.deviceDetector', 'cfp.loadingBar', 'plupload.directive', 'ui.tree',
      'angularMoment', 'payment', 'angular-stripe', 'ngMdIcons', 'ngMaterial', 'ngMessages',
      'angular-parallax', 'duScroll', 'io.services', 'angularHideHeader', 'infinite-scroll'
    ]);

app.value('duScrollDuration', 1000);
app.value('THROTTLE_MILLISECONDS', 500);

app.config(['$locationProvider', '$urlRouterProvider', '$stateProvider', '$httpProvider', '$authProvider',
  'API_URL', 'ngClipProvider', 'uiGmapGoogleMapApiProvider', 'cfpLoadingBarProvider',
  'plUploadServiceProvider', 'stripeProvider', '$mdThemingProvider', 'ngMdIconServiceProvider', 'angularCustomIcons',
  function ($locationProvider, $urlRouterProvider, $stateProvider, $httpProvider,
            $authProvider, API_URL, ngClipProvider, uiGmapGoogleMapApiProvider, cfpLoadingBarProvider,
            plUploadServiceProvider, stripeProvider, $mdThemingProvider, ngMdIconServiceProvider, angularCustomIcons) {

    angularCustomIcons(ngMdIconServiceProvider);

    var modulesPath = 'app/components';

    $urlRouterProvider.otherwise('/');

    $stateProvider.state('main', {
      template: '<ui-view></ui-view>',
      resolve: {
        currentUser: function ($cookies, UserService, $q, TourService) {
          if (UserService.currentUser.id) {
            return $q.when(UserService.currentUser);
          } else if ($cookies.profileId && $cookies.profileId != 'undefined') {
            return UserService.getProfileAuth().then(function (data) {
              var profile = data.data;
              UserService.saveProfile(profile);
              return UserService.currentUser;
            });
          } else {
            return $q.when(UserService.currentUser);
          }
        }
      }

    });

    $stateProvider.state('login', {
      parent: 'main',
      url: '/?code',
      controller: 'SiteLogin',
      templateUrl: modulesPath + '/site/main.html'
    });

    $stateProvider.state('grid', {
      parent: 'main',
      url: '/:storeurl/mode/:mode?profile=true',
      controller: 'ItemIndex as vm',
      templateUrl: function ($stateParams) {
        return $stateParams.mode !== 'feed' ? modulesPath + '/item/item-grid.html' : modulesPath + '/item/stream.html';
      }
    });

    $stateProvider.state('stream', {
      parent: 'main',
      url: '/stream/:storeurl',
      controller: 'ItemStream as vm',
      templateUrl: modulesPath + '/item/stream.html'
    });

    $stateProvider.state('stream-grid', {
      parent: 'main',
      url: '/stream-grid/:storeurl',
      controller: 'ItemGrid as vm',
      templateUrl: modulesPath + '/item/item-grid.html'
    });

    $stateProvider.state('parallax', {
      parent: 'main',
      url: '/parallax/?profile=true',
      controller: 'ItemStream',
      templateUrl: function () {
        return modulesPath + '/item/stream-parallax.html';
      }
    });

    $stateProvider.state('subscriptions', {
      parent: 'main',
      url: '/subscriptions/:storeurl',
      controller: 'SubscriptionsMain as vm',
      templateUrl: modulesPath + '/subscriptions/subscriptions.html'
    });

    $stateProvider.state('sellorbuy', {
      parent: 'main',
      url: '/sellorbuy/',
      controller: 'SellOrBuy',
      templateUrl: modulesPath + '/site/sellorbuy.html'
    });

    $stateProvider.state('itemview', {
      parent: 'main',
      url: '/:storeurl/:itemurl/:tab',
      controller: 'ItemView as vm',
      resolve: {
        urlsThere: function ($stateParams) {
          return ($stateParams.storeurl !== undefined && $stateParams.itemurl !== undefined && $stateParams.itemurl !== 'undefined' && $stateParams.storeurl !== 'undefined');
        }
      },
      templateUrl: modulesPath + '/item/view.html'
    });

    $stateProvider.state('accounts', {
      parent: 'main',
      url: '/accounts/',
      controller: 'StoreAccounts',
      templateUrl: modulesPath + '/store/accounts.html'
    });

    $stateProvider.state('profilestore', {
      parent: 'main',
      url: '/profilestore/',
      controller: 'ProfileStoreIndex',
      templateUrl: modulesPath + '/profile/profilestore.html'
    });

    $stateProvider.state('storeview', {
      parent: 'main',
      url: '/storeview/:storeurl',
      controller: 'StoreView',
      templateUrl: modulesPath + '/item/index.html'
    });

    $stateProvider.state('location', {
      parent: 'main',
      url: '/location/:storeurl',
      controller: 'LocationIndex',
      templateUrl: modulesPath + '/location/index.html'
    });

    $stateProvider.state('store', {
      parent: 'main',
      url: '/store/:storeurl',
      controller: 'StoreIndex',
      templateUrl: modulesPath + '/store/index.html'
    });

    $stateProvider.state('instaimport', {
      parent: 'main',
      url: '/instaimport/:storeurl',
      controller: 'InstagramImport',
      templateUrl: modulesPath + '/item/instaimport.html'
    });

    $stateProvider.state('transaction', {
      parent: 'main',
      url: '/transaction/:storeurl',
      controller: 'TransactionCtrl as vm',
      templateUrl: modulesPath + '/transaction/transaction.html'
    });

    $authProvider.baseUrl = API_URL;
    $authProvider.storage = 'withoutStorage';

    var configFacebook = {
      clientId: '694297854007943',
      url: 'v1/user/auth',
      scope: 'email, publish_actions',
      scopeDelimiter: ',',
      display: 'popup'
    };

    var configPinterest = {
      name: 'pinterest',
      url: '/v1/link/pinterest',
      display: 'popup',
      authorizationEndpoint: 'https://api.pinterest.com/oauth/',
      defaultUrlParams: ['scope', 'redirect_uri', 'response_type', 'client_id'],
      clientId: '4816720832223002845',
      scope: 'read_public,write_public',
      responseType: 'code',
      redirectUri: 'http://instastore.us/'
    };

    var configInstagram = {
      name: 'instagram',
      url: '/v1/link/instagram',
      redirectUri: 'http://instastore.us/',
      clientId: '59429297486f4f2393762a1febf17583',
      requiredUrlParams: ['scope'],
      scope: ['likes'],
      scopeDelimiter: '+',
      authorizationEndpoint: 'https://instagram.com/oauth/authorize',
      display: 'popup'
    };

    switch (window.location.origin) {
      case 'https://isopen.us':
        configFacebook.clientId = '801870543171280';
        configInstagram.clientId = 'a7cf21e1b2dc47d1a77f5f7ce3bbcae5';
        configInstagram.redirectUri = configPinterest.redirectUri = 'https://isopen.us/';
        break;
      case 'http://192.168.0.103:3000':
        configFacebook.clientId = '752257218212006';
        configInstagram.clientId = '7f744b4b4f844419bd49872ac67cf22a';
        configInstagram.redirectUri = configPinterest.redirectUri = 'http://192.168.0.103:3000/';
        break;
      case 'http://localhost:3000':
        configFacebook.clientId = '752257608211967';
        configInstagram.redirectUri = configPinterest.redirectUri = 'http://localhost:3000/';
        break;
      case 'http://192.168.0.104:3000':
        configFacebook.clientId = '787537388017322';
        configInstagram.clientId = '7f744b4b4f844419bd49872ac67cf22a';
        configInstagram.redirectUri = configPinterest.redirectUri = 'http://192.168.0.104:3000/';
        break;
    }

    $authProvider.facebook(configFacebook);
    $authProvider.oauth2(configInstagram);
    $authProvider.oauth2(configPinterest);

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

    stripeProvider.setPublishableKey('pk_live_gAjzCf5vWrdKN8ycRSCbQDan');
    //stripeProvider.setPublishableKey('pk_test_1tDqDLjRoJ6lkeyKoQsQ4ZX0');

    $mdThemingProvider.definePalette('amazingPaletteName', {
      '50': 'ffebee',
      '100': 'ffcdd2',
      '200': 'ef9a9a',
      '300': 'e57373',
      '400': 'f37878',
      '500': 'f37878', //inputs with dirty state
      '600': 'cecece',
      '700': 'd32f2f',
      '800': 'c62828',
      '900': 'b71c1c',
      'A100': '9ec733',
      'A200': 'ff5252',
      'A400': 'ff1744',
      'A700': '9ec733',
      'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                          // on this palette should be dark or light
      'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
        '200', '300', '400', 'A100'],
      'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });

    $mdThemingProvider.theme('default')
        .primaryPalette('amazingPaletteName', {
          'default': '400', // by default use shade 400 from the pink palette for primary intentions
          'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
          'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
          'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
        });
  }]);

app.run(function ($rootScope, $state, $stateParams, $mdMedia, DeviceService) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$mdMedia = $mdMedia;
  $rootScope.isHomeScreen = DeviceService.isHomeScreen();
});


