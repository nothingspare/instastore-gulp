(function () {
  'use strict';

  angular
      .module('instastore')
      .directive('kScroll', Scroll);

  Scroll.$inject = ['$window'];

  /* @ngInject */
  function Scroll($window) {
    var directive = {
      link: link,
      restrict: 'A'
    };
    return directive;

    function link(scope, element, attrs) {
      angular.element($window).bind("scroll", function () {
        if (this.pageYOffset >= 100) {
          scope.boolChangeClass = true;
        } else {
          scope.boolChangeClass = false;
        }
        scope.$apply();
      });
    }
  }
})();