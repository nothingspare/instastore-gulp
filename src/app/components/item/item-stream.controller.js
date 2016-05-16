(function () {
  'use strict';

  angular
      .module('instastore')
      .controller('ItemStream', ItemStream);

  ItemStream.$inject = [
    '$scope',
    'UserService',
    'StreamService'
  ];

  /* @ngInject */
  function ItemStream($scope,
                      UserService,
                      StreamService) {

    var vm = this;

    vm.StreamService = StreamService;

    activate();

    ////////////////

    function activate() {
      UserService.initMyStoreSettings();

      StreamService.init('v1/streams');
    }
  }

})();
