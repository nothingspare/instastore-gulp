(function () {
  'use strict';

  angular
      .module('instastore')
      .service('ModalService', ModalService);

  ModalService.$inject = ['$mdDialog', '$mdMedia', '$q'];

  /* @ngInject */
  function ModalService($mdDialog, $mdMedia, $q) {
    this.show = show;

    ////////////////

    function show(templateName) {
      var deferred = $q.defer();
      $mdDialog.show({
        controller: 'DialogController as vm',
        templateUrl: 'app/components/modal/templates/' + templateName + '.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        bindToController: true,
        onRemoving: function () {
          deferred.resolve();
        },
        fullscreen: $mdMedia('xs')
      });

      return deferred.promise;
    }
  }

})();

