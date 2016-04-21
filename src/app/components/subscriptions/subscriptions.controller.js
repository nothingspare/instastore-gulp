(function () {
  'use strict';

  angular
      .module('instastore')
      .controller('SubscriptionsMain', SubscriptionsMain);

  SubscriptionsMain.$inject = ['UserService', 'SubscriptionService'];

  /* @ngInject */
  function SubscriptionsMain(UserService, SubscriptionService) {
    var vm = this;

    activate();

    ////////////////

    function activate() {
      UserService.initMyStoreSettings();

      SubscriptionService.all()
          .success(function (data) {
            vm.subs = data;
          })
          .then(function () {
            SubscriptionService.recommended()
                .success(function (data) {
                  vm.subsRecommended = data;
                })
          });
    }
  }

})();
