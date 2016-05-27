(function () {
  'use strict';

  angular
      .module('instastore')
      .factory('CommentFactory', CommentFactory);

  CommentFactory.$inject = ['rest'];

  /* @ngInject */
  function CommentFactory(rest) {
    var service = {
      countNotView: 0,
      notView: notView,
      startListen: startListen,
      getCountNotView: getCountNotView,
      updateView: updateView
    };
    return service;

    ////////////////

    function startListen() {
      var time = 120000;
      getCountNotView();
      setInterval(function () {
        getCountNotView();
      }, time);
    }

    function getCountNotView() {
      rest.path = 'v1/comments';
      return rest.models({
        type: 'count-not-view'
      }).success(function (res) {
        service.countNotView = res;
      });
    }

    function notView() {
      rest.path = 'v1/comments';
      return rest.models({
        type: 'not-view'
      });
    }

    function updateView(ids) {
      rest.path = 'v1/comments/update-view';
      return rest.postModel({
        ids: ids
      });
    }
  }

})();

