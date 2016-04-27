(function () {
  'use strict';

  angular
      .module('instastore')
      .service('ItemService', ItemService);

  ItemService.$inject = ['rest', 'ITEM_STATUS'];

  /* @ngInject */
  function ItemService(rest, ITEM_STATUS) {
    this.all = all;

    ////////////////

    function all(userId) {
      rest.path = 'v1/items';
      return rest.models({
        user_id: userId,
        status: ITEM_STATUS.active,
        'per-page': 3
      });
    }
  }

})();

