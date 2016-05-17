(function () {
  'use strict';

  angular
      .module('instastore')
      .controller('ItemGrid', ItemGrid);

  ItemGrid.$inject = [
    'UserService',
    'AllStoreFactory'
  ];

  /* @ngInject */
  function ItemGrid(UserService,
                    AllStoreFactory) {

    var vm = this;
    vm.StreamService = AllStoreFactory;

    activate();

    ////////////////

    function activate() {
      UserService.initMyStoreSettings();
      vm.StreamService.init('v1/streams');
    }
  }

})();
