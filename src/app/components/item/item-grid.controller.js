(function () {
  'use strict';

  angular
      .module('instastore')
      .controller('ItemGrid', ItemGrid);

  ItemGrid.$inject = [
    'UserService',
    'StreamService'
  ];

  /* @ngInject */
  function ItemGrid(UserService,
                    StreamService) {

    var vm = this;
    vm.StreamService = new StreamService();

    activate();

    ////////////////

    function activate() {
      UserService.initMyStoreSettings();
      vm.StreamService.init('v1/streams');
    }
  }

})();
