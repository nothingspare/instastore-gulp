(function () {
  'use strict';

  angular
      .module('instastore')
      .service('StoreService', StoreService);

  StoreService.$inject = ['rest', 'messageService'];

  /* @ngInject */
  function StoreService(rest, messageService) {
    this.search = search;

    ////////////////

    function search(text) {
      if (text) {
        rest.path = 'v1/my-stores/search';
        return rest.models({
              store_name: text
            })
            .then(function (response) {
              return response.data;
            })
            .catch(function (e) {
              messageService.alert(e);
            });
      }
    }
  }

})();

