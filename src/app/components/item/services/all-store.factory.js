(function () {
  'use strict';

  angular
      .module('instastore')
      .factory('AllStoreFactory', AllStoreFactory);

  AllStoreFactory.$inject = ['StreamService'];

  /* @ngInject */
  function AllStoreFactory(StreamService) {
    var service = new StreamService();
    return service;

    ////////////////

  }

})();

