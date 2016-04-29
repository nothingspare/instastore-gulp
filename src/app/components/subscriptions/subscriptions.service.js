(function () {
  'use strict';

  angular
      .module('instastore')
      .service('SubscriptionService', SubscriptionService);

  SubscriptionService.$inject = ['rest', 'messageService', 'UserService'];

  /* @ngInject */
  function SubscriptionService(rest, messageService, UserService) {
    this.all = all;
    this.recommended = recommended;
    this.other = other;

    ////////////////

    function all() {
      rest.path = 'v1/subscriptions';
      return rest.models()
          .success(function (data) {
          })
          .error(function (e) {
            messageService.alert(e);
            UserService.goToMainStore();
          });
    }

    function recommended() {
      rest.path = 'v1/subscriptions';
      return rest.models({
            type: 'recommended',
            'per-page': 3
          })
          .success(function (data) {
          })
          .error(function (e) {
            messageService.alert(e);
            UserService.goToMainStore();
          });
    }

    function other() {
      rest.path = 'v1/subscriptions';
      return rest.models({
            type: 'other',
            'per-page': 9
          })
          .success(function (data) {
          })
          .error(function (e) {
            messageService.alert(e);
            UserService.goToMainStore();
          });
    }
  }

})();

