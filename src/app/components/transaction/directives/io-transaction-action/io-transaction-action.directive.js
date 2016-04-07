(function (angular) {
  'use strict';

  angular
      .module('instastore')
      .directive('ioTransactionAction', IoTransactionAction);

  IoTransactionAction.$inject = ['ITEMSELLTRANSACTION_STATUS', 'transactionActionService'];

  function IoTransactionAction(IT_STATUS, transactionActionService) {
    var templates = {
      viewLabel: {
        url: 'app/components/transaction/directives/io-transaction-action/view-label.html'
      },
      getLabel: {
        url: 'app/components/transaction/directives/io-transaction-action/get-label.html'
      },
      boxSize: {
        url: 'app/components/transaction/directives/io-transaction-action/sold-box-size.html'
      }
    };

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
      
      scope.getLabel = getLabel;

      function getLabel() {
        transactionActionService.getLabel(scope.transaction).success(function () {

        });
      }

      scope.template = getTemplate(scope.transaction.last_status);
    }
    
    function getTemplate(status) {
      if (status == IT_STATUS.label) {
        return templates.viewLabel.url;
      } else if(status == IT_STATUS.sold) {
        return templates.boxSize.url;
      } else if (status >= IT_STATUS.send && status < IT_STATUS.saleCanceled) {
        return templates.getLabel.url;
      }
    }
  }

})(angular);