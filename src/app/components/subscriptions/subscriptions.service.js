(function () {
  'use strict';

  angular
      .module('instastore')
      .service('SubscriptionService', SubscriptionService);

  SubscriptionService.$inject = ['rest', 'messageService', 'UserService', '$mdDialog', '$mdMedia'];

  /* @ngInject */
  function SubscriptionService(rest, messageService, UserService, $mdDialog, $mdMedia) {
    this.all = all;
    this.count = count;
    this.recommended = recommended;
    this.other = other;
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
      count().then(function (count) {
        if (!count) {
          var perPage = 6;
          other(perPage)
              .success(function (data) {
                $mdDialog.show({
                  controller: 'DialogController as vm',
                  templateUrl: 'app/components/subscriptions/modal/recommended-stores.html',
                  parent: angular.element(document.body),
                  clickOutsideToClose: true,
                  bindToController: true,
                  locals: {
                    subsOther: data
                  },
                  fullscreen: $mdMedia('xs')
                });
              });
        }
      });
    }
  }

  angular
      .module('instastore')
      .controller('DialogController', DialogController);

  DialogController.$inject = ['$mdDialog'];

  /* @ngInject */
  function DialogController($mdDialog) {
    var vm = this;

    vm.hide = hide;
    ////////////////

    function hide() {
      $mdDialog.hide();
    }

  }

})();


