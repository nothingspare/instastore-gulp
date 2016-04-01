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
      name: 'Name',
      field: 'name'
    }, {
      name: 'Description',
      field: 'description'
    }, {
      name: 'Last Modified',
      field: 'last_modified'
    }];

    $scope.sortable = ['name', 'description', 'last_modified'];

    $scope.custom = {
      name: 'bold',
      description: 'grey',
      last_modified: 'grey'
    };

    $scope.content = [
      {
        thumb: 'https://lh3.googleusercontent.com/-5NfcdlvGQhs/AAAAAAAAAAI/AAAAAAAAABY/ibGrApGYTuQ/photo.jpg',
        name: 'Bruno Mars',
        description: 'Human',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://www.otakia.com/wp-content/uploads/V_1/article_3573/7405.jpg',
        name: 'AT-AT',
        description: 'Robot',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'https://speakerdata.s3.amazonaws.com/photo/image/774492/Mark-Ronson-r24.jpg',
        name: 'Mark Ronson',
        description: 'Human',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'https://lh3.googleusercontent.com/-5NfcdlvGQhs/AAAAAAAAAAI/AAAAAAAAABY/ibGrApGYTuQ/photo.jpg',
        name: 'Daft Punk',
        description: 'Human-Robot',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://thatgrapejuice.net/wp-content/uploads/2014/03/lady-gaga-that-grape-juice-televisionjpg.jpg',
        name: 'Lady Gaga',
        description: 'Undefined',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://thatgrapejuice.net/wp-content/uploads/2014/03/lady-gaga-that-grape-juice-televisionjpg.jpg',
        name: 'Lady Gaga',
        description: 'Undefined',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://thatgrapejuice.net/wp-content/uploads/2014/03/lady-gaga-that-grape-juice-televisionjpg.jpg',
        name: 'Lady Gaga',
        description: 'Undefined',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://thatgrapejuice.net/wp-content/uploads/2014/03/lady-gaga-that-grape-juice-televisionjpg.jpg',
        name: 'Lady Gaga',
        description: 'Undefined',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://thatgrapejuice.net/wp-content/uploads/2014/03/lady-gaga-that-grape-juice-televisionjpg.jpg',
        name: 'Lady Gaga',
        description: 'Undefined',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://thatgrapejuice.net/wp-content/uploads/2014/03/lady-gaga-that-grape-juice-televisionjpg.jpg',
        name: 'Lady Gaga',
        description: 'Undefined',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://thatgrapejuice.net/wp-content/uploads/2014/03/lady-gaga-that-grape-juice-televisionjpg.jpg',
        name: 'Lady Gaga',
        description: 'Undefined',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://thatgrapejuice.net/wp-content/uploads/2014/03/lady-gaga-that-grape-juice-televisionjpg.jpg',
        name: 'Lady Gaga',
        description: 'Undefined',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://thatgrapejuice.net/wp-content/uploads/2014/03/lady-gaga-that-grape-juice-televisionjpg.jpg',
        name: 'Lady Gaga',
        description: 'Undefined',
        last_modified: 'Jun 5, 2014'
      },
      {
        thumb: 'http://thatgrapejuice.net/wp-content/uploads/2014/03/lady-gaga-that-grape-juice-televisionjpg.jpg',
        name: 'Lady Gaga',
        description: 'Undefined',
        last_modified: 'Jun 5, 2014'
      }
    ];
  }

})(angular);