(function () {
  'use strict';

  angular
      .module('instastore')
      .factory('MyStoreFactory', MyStoreFactory);

  MyStoreFactory.$inject = ['StreamService'];

  /* @ngInject */
  function MyStoreFactory(StreamService) {
    var service = new StreamService();
    return service;

    ////////////////

  }

})();

