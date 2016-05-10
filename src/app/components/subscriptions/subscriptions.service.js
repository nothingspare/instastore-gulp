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
      return count().then(function (count) {
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

  angular
      .module('instastore')
      .controller('DialogController', DialogController);

  DialogController.$inject = ['$mdDialog', 'SubscriptionService'];

  /* @ngInject */
  function DialogController($mdDialog, SubscriptionService) {
    var vm = this;

    vm.selectedItem = [];

    vm.hide = hide;
    vm.select = select;
    vm.following = following;
    ////////////////

    function isSelected(store) {
      return _.findIndex(vm.selectedItem, function (storeSelected) {
        return storeSelected.id == store.id;
      });
    }

    function select(store) {
      var index = isSelected(store);
      if (index >= 0) {
        vm.selectedItem.splice(index, 1);
        store.isSelected = false;
      } else {
        vm.selectedItem.push(store);
        store.isSelected = true;
      }
      console.log(vm.selectedItem);
    }

    function hide() {
      $mdDialog.hide();
    }
    
    function following() {
      SubscriptionService.following(vm.selectedItem).success(function (response) {
        console.log(response);
        if(response) {
          hide();
        }
      })
    }

  }

})();


