(function () {
  'use strict';

  angular
      .module('instastore')
      .service('FollowerService', FollowerService);

  FollowerService.$inject = ['rest', 'messageService'];

  /* @ngInject */
  function FollowerService(rest, messageService) {
    this.follow = follow;
    this.unfollow = unfollow;

    ////////////////

    function follow(storeId) {
      rest.path = 'v1/followers';
      return rest.postModel({store_id: storeId})
          .success(function () {
          })
          .error(messageService.alert);
    }

    function unfollow(storeId) {
      rest.path = 'v1/followers/' + storeId;
      return rest.deleteModel()
          .success(function () {
          })
          .error(messageService.alert);
    }

  }

})();

