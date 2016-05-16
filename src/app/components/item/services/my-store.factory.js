(function () {
  'use strict';

  angular
      .module('instastore')
      .factory('MyStoreFactory', MyStoreFactory);

  MyStoreFactory.$inject = ['StreamService'];

  /* @ngInject */
  function MyStoreFactory(StreamService) {
    var service = {
      items : [],
      busy : true,
      after : '',
      path : path,
      nextPage : StreamService.nextPage,
      all : all,
      init : init
    };
    return service;

    ////////////////

    function functionName() {
      code
    }
  }

})();

