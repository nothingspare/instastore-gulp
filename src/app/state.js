'use strict';

angular
    .module('instastore')
    .run(configure);

configure.$inject = ['$rootScope', 'UserService'];

/* @ngInject */
function configure($rootScope, UserService) {
  $rootScope.$on('$stateChangeStart',
      function (event, toState, toParams, fromState, fromParams, options) {
        UserService.getStoreViewByUrl(toParams.storeurl)
            .then(function (store) {
              $rootScope.store = store;
            });
      });
}
