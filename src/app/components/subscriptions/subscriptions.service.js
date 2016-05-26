(function () {
  'use strict';

  angular
      .module('instastore')
      .service('SubscriptionService', SubscriptionService);

  SubscriptionService.$inject = ['rest', 'messageService', 'UserService', '$mdDialog', '$mdMedia', 'ModalService', '$q'];

  /* @ngInject */
  function SubscriptionService(rest, messageService, UserService, $mdDialog, $mdMedia, ModalService, $q) {
    this.all = all;
    this.count = count;
    this.recommended = recommended;
    this.other = other;
    this.following = following;
    this.isFollowing = isFollowing;

    ////////////////

    function all() {
      rest.path = 'v1/subscriptions';
      return rest.models()
          .error(function (e) {
            messageService.alert(e);
            UserService.goToMainStore();
          });
    }

    function count() {
      return all().then(function (response) {
        return response.data.length;
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

    function other(perPage) {
      var perPage = perPage || 9;
      rest.path = 'v1/subscriptions';
      return rest.models({
            type: 'other',
            'per-page': perPage
          })
          .success(function (data) {
          })
          .error(function (e) {
            messageService.alert(e);
            UserService.goToMainStore();
          });
    }

    function isFollowing() {
      var deferred = $q.defer();
      var perPage = 6;
      recommended(perPage)
          .success(function (data) {
            var locals = {
              subsOther: data
            };
            ModalService.show('recommended-stores', locals).then(function () {
              deferred.resolve();
            });
          });

      return deferred.promise;
    }

    function following(stores) {
      rest.path = 'v1/followers/all';
      return rest.postModel({
            stores: stores
          })
          .error(function (e) {
            messageService.alert(e);
            UserService.goToMainStore();
          });
    }
  }

})();


