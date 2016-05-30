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
      count: 0,
      notView: notView,
      startListen: startListen,
      getCountNotView: getCountNotView,
      updateView: updateView
    };
    return service;

    ////////////////

    function startListen() {
      var time = 120000;
      getCommentsCount();
      setInterval(function () {
        getCommentsCount();
      }, time);
    }

    function getCommentsCount() {
      notView().then(function () {
        getCountNotView();
      });
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
      }).success(function (res) {
        service.count = res.length;
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

