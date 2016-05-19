(function () {
  'use strict';

  angular
      .module('angularHideHeader', [])
      .directive('hideHeader', hideHeader);

  hideHeader.$inject = ['$window', '$rootScope'];

  /* @ngInject */
  function hideHeader($window, $rootScope) {
    var directive = {
      link: link,
      restrict: 'A',
      scope: {}
    };
    return directive;

    function showHeader(element) {
      element.removeClass('hideh');
      if ($rootScope.isHomeScreen) {
        element.css({'top': "20px"});
      } else {
        element.css({'top': "0px"});
      }
    }

    function hideHeader(element) {
      element.addClass('hideh');
      element.css({
        'top': -height + "px",
        'transition': 'top 0.25s',
        '-webkit-transition': 'top 0.25s',
        '-moz-transition': 'top 0.25s',
        '-ms-transition': 'top 0.25s',
        '-o-transition': 'top 0.25s'
      });
    }

    function link(scope, element, attrs) {
      var scrollposition = 0;
      var hideOffset = attrs.hideOffset;
      angular.element($window).bind("scroll", function () {
        var body = angular.element(document.getElementsByTagName('body'));
        var current_scroll = body[0].scrollTop;
        var hheight = element[0].scrollHeight;
        var pxOffset = parseInt(hideOffset);
        if (current_scroll >= hheight + pxOffset) {
          if (current_scroll <= scrollposition) {
            showHeader(element);
          }
          else {
            hideHeader(element);
          }
        }
        else if (current_scroll >= hheight || current_scroll == 0) {
          showHeader(element);
        }
        scrollposition = body[0].scrollTop;
      });
    }
  }
})();
