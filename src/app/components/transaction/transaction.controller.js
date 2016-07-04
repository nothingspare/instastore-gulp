(function (angular) {
  'use strict';

  var app = angular
      .module('instastore');

  app.controller('TransactionCtrl', TransactionCtrl);

  TransactionCtrl.$inject = ['transactionService', 'messageService', 'UserService', '$q', 'CommentFactory'];

  function TransactionCtrl(TransactionService, messageService, UserService, $q, CommentFactory) {
    var vm = this;

    vm.seller = false;
    vm.notification = false;
    vm.comments = false;
    vm.buyer = false;
    vm.isSeller = UserService.isSeller();
    vm.selectTab = selectTab;

    function selectTab(type) {
      if (type == 'buyer') {
        TransactionService.buyer()
            .success(function (result) {
              vm.buyer = result;
              return vm.buyer;
            })
            .error(messageService.alert)
            .then(function () {
              changeViewCountTransaction(vm.buyer);
            });
      } else if (type == 'seller') {
        TransactionService.seller()
            .success(function (result) {
              vm.seller = result;
              return vm.seller;
            })
            .error(messageService.alert)
            .then(function () {
              CommentFactory.notView()
                  .success(function (result) {
                    console.log(result);
                    vm.comments = result.map(function (comment) {
                      return {
                        image_url: comment.authorFacebookAvatar,
                        comment: comment.content,
                        last_status: "New comment",
                        storeUrl: comment.storeUrl,
                        itemUrl: comment.item.item_url,
                        id: comment.id,
                        is_view: comment.is_view
                      }
                    });
                    vm.notification = vm.seller.concat(vm.comments);
                  })
                  .then(function() {
                    changeViewCountTransaction(vm.seller)
                        .then(function () {
                          changeViewCountComments(vm.comments);
                    });
                  });
            });
      }
    }

    function getIdsView(res, field) {
      var ids = _.map(_.filter(res, function (o) {
        return o.is_view == 0;
      }), field);

      return ids;
    }

    function changeViewCountComments(res) {
      var ids = getIdsView(res, 'id');

      if (!ids.length) {
        return $q.when(false);
      }

      return CommentFactory.updateView(ids)
          .then(function (response) {
            CommentFactory.countNotView -= ids.length;
          });
    }

    function changeViewCountTransaction(res) {
      var ids = getIdsView(res, 'itemselltransaction_id');

      if (!ids.length) {
        return $q.when(false);
      }

      return TransactionService.updateView(ids)
          .then(function (response) {
            TransactionService.count -= ids.length;
          });
    }

    vm.headers = [
      {
        name: 'Status',
        field: 'last_status'
      },
      {
        name: '',
        field: 'image_url'
      }
    ];

    vm.sortable = ['last_status'];

    vm.custom = {
      name: 'bold',
      description: 'grey',
      last_modified: 'grey'
    };

  }

})(angular);