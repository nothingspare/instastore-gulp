(function (angular) {
  'use strict';

  angular
      .module('instastore')
      .directive('ioTransactionAction', IoTransactionAction);

  IoTransactionAction.$inject = [
    'ITEMSELLTRANSACTION_STATUS',
    'transactionActionService',
    '$mdDialog',
    '$mdMedia',
    'messageService',
    '$window'
  ];

  function IoTransactionAction(IT_STATUS, transactionActionService, $mdDialog, $mdMedia, messageService, $window) {
    var directive = {
      link: link,
      templateUrl: 'app/components/transaction/directives/io-transaction-action/io-transaction-action.html',
      restrict: 'EA',
      transclude: true,
      scope: {
        transaction: '='
      }
    };
    return directive;

    function link(scope, element, attrs) {
      scope.IT_STATUS = IT_STATUS;
      scope.status = scope.transaction.last_status;

      scope.getLabel = getLabel;
      scope.closeDialog = closeDialog;
      scope.printLabel = printLabel;
      scope.emailLabel = emailLabel;
      scope.changeItemStatus = changeItemStatus;

      function closeDialog() {
        $mdDialog.hide();
      }

      function printLabel() {
        $window.print();
      }

      function emailLabel() {
        transactionActionService.emailLabel(scope.transaction.itemsell_id)
            .success(function () {
              messageService.simpleByCode('item', 'labelSent');
            })
            .error(messageService.alert);
      }

      function getLabel() {
        transactionActionService.getLabel(scope.transaction)
            .success(function (label) {
              scope.label = label;
              scope.isellBox = parseInt(scope.transaction.itemsell_box);

              $mdDialog.show({
                templateUrl: 'app/components/item/label.html',
                parent: angular.element(document.body),
                scope: scope,
                clickOutsideToClose: true,
                fullscreen: $mdMedia('sm')
              });
            })
            .error(messageService.alert);
      }

      function changeItemStatus(boxSize) {
        transactionActionService.changeItemStatus(boxSize, scope.transaction)
            .success(function (result) {
              scope.transaction.last_status = result.status;
            })
            .error(messageService.alert);
      }
    }
  }

})(angular);