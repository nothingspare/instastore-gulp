(function () {
  'use strict';

  angular
      .module('instastore')
      .controller('ItemStream', ItemStream);

  ItemStream.$inject = [
    'UserService',
    'AllStoreFactory',
    'SubscriptionService'
  ];

  /* @ngInject */
  function ItemStream(UserService, AllStoreFactory, SubscriptionService) {

    var vm = this;

    vm.StreamService = AllStoreFactory;

    activate();

    ////////////////

    function activate() {
      UserService.initMyStoreSettings();
      
      SubscriptionService.count().then(function (count) {
        if(!count) {
          SubscriptionService.isFollowing()
        }
        vm.StreamService.init('v1/streams');
      });
    }
  }

})();
