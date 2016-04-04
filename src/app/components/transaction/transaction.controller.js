(function (angular) {
  'use strict';

  var app = angular
      .module('instastore');

  app.controller('TransactionCtrl', TransactionCtrl);

  TransactionCtrl.$inject = ['$scope', 'transactionService'];

  function TransactionCtrl($scope, TransactionService) {
    var vm = this;

    TransactionService.pagination().then(function (result) {
      $scope.content2 = result.results;
      console.log($scope.content2);
    });

    $scope.headers = [{
      name: '',
      field: 'thumb'
    }, {
      name: 'Status',
      field: 'status'
    }];

    $scope.sortable = ['status'];

    $scope.custom = {
      name: 'bold',
      description: 'grey',
      last_modified: 'grey'
    };

    $scope.content = [
      {
        thumb: 'https://scontent.cdninstagram.com/t51.2885-15/s150x150/e35/c0.134.1080.1080/12965864_1759789007574561_1920660264_n.jpg?ig_cache_key=MTIyMDYxOTcyMjYyNzcwMDI4Mg%3D%3D.2.c',
        status: 'Item bought!',
        description: 'Human',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'https://scontent.cdninstagram.com/t51.2885-15/s150x150/e35/c0.134.1080.1080/12912804_444559819075394_1782400617_n.jpg?ig_cache_key=MTIxODM1NjM1MDg0NjcxOTIxNw%3D%3D.2.c',
        status: 'Item bought!',
        description: 'Robot',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'https://scontent.cdninstagram.com/t51.2885-15/s150x150/e35/12479062_1695457517379592_1502191868_n.jpg?ig_cache_key=MTIxOTQ3NjgwMDkwMTQzNjk1OQ%3D%3D.2',
        status: 'Item bought!',
        description: 'Human',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'https://scontent.cdninstagram.com/t51.2885-15/s150x150/e35/c0.134.1080.1080/12905215_252924808387308_537305983_n.jpg?ig_cache_key=MTIxOTU2NjAwMjkyNjIxMjIwMA%3D%3D.2.c',
        status: 'Item bought!',
        description: 'Human-Robot',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://thatgrapejuice.net/wp-content/uploads/2014/03/lady-gaga-that-grape-juice-televisionjpg.jpg',
        status: 'Item bought!',
        description: 'Undefined',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'https://scontent.cdninstagram.com/t51.2885-15/s150x150/e35/c0.134.1080.1080/12965864_1759789007574561_1920660264_n.jpg?ig_cache_key=MTIyMDYxOTcyMjYyNzcwMDI4Mg%3D%3D.2.c',
        status: 'Item bought!',
        description: 'Human',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'https://scontent.cdninstagram.com/t51.2885-15/s150x150/e35/c0.134.1080.1080/12912804_444559819075394_1782400617_n.jpg?ig_cache_key=MTIxODM1NjM1MDg0NjcxOTIxNw%3D%3D.2.c',
        status: 'Item bought!',
        description: 'Robot',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'https://scontent.cdninstagram.com/t51.2885-15/s150x150/e35/12479062_1695457517379592_1502191868_n.jpg?ig_cache_key=MTIxOTQ3NjgwMDkwMTQzNjk1OQ%3D%3D.2',
        status: 'Item bought!',
        description: 'Human',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'https://scontent.cdninstagram.com/t51.2885-15/s150x150/e35/c0.134.1080.1080/12905215_252924808387308_537305983_n.jpg?ig_cache_key=MTIxOTU2NjAwMjkyNjIxMjIwMA%3D%3D.2.c',
        status: 'Item bought!',
        description: 'Human-Robot',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://thatgrapejuice.net/wp-content/uploads/2014/03/lady-gaga-that-grape-juice-televisionjpg.jpg',
        status: 'Item bought!',
        description: 'Undefined',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'https://scontent.cdninstagram.com/t51.2885-15/s150x150/e35/c0.134.1080.1080/12965864_1759789007574561_1920660264_n.jpg?ig_cache_key=MTIyMDYxOTcyMjYyNzcwMDI4Mg%3D%3D.2.c',
        status: 'Item bought!',
        description: 'Human',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'https://scontent.cdninstagram.com/t51.2885-15/s150x150/e35/c0.134.1080.1080/12912804_444559819075394_1782400617_n.jpg?ig_cache_key=MTIxODM1NjM1MDg0NjcxOTIxNw%3D%3D.2.c',
        status: 'Item bought!',
        description: 'Robot',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'https://scontent.cdninstagram.com/t51.2885-15/s150x150/e35/12479062_1695457517379592_1502191868_n.jpg?ig_cache_key=MTIxOTQ3NjgwMDkwMTQzNjk1OQ%3D%3D.2',
        status: 'Item bought!',
        description: 'Human',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'https://scontent.cdninstagram.com/t51.2885-15/s150x150/e35/c0.134.1080.1080/12905215_252924808387308_537305983_n.jpg?ig_cache_key=MTIxOTU2NjAwMjkyNjIxMjIwMA%3D%3D.2.c',
        status: 'Item bought!',
        description: 'Human-Robot',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://thatgrapejuice.net/wp-content/uploads/2014/03/lady-gaga-that-grape-juice-televisionjpg.jpg',
        status: 'Item bought!',
        description: 'Undefined',
        last_modified: 'Jun 5, 2014'
      }
    ];
  }

})(angular);