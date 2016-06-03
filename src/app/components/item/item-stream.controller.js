(function () {
  'use strict';

  angular
      .module('instastore')
      .controller('ItemStream', ItemStream);

  ItemStream.$inject = [
    'UserService',
    'StreamService',
    'SubscriptionService'
  ];

  /* @ngInject */
  function ItemStream(UserService, StreamService, SubscriptionService) {

    var vm = this;

    vm.StreamService = new StreamService();

    activate();

    ////////////////

    function activate() {
      UserService.initMyStoreSettings();
      vm.StreamService.init('v1/streams');

      // SubscriptionService.count().then(function (count) {
      //   if(!count) {
      //     SubscriptionService.isFollowing()
      //   }
      // });
    }
  }

})();
