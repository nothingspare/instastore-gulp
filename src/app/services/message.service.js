// (function (angular) {
  "use strict";
  
  angular
      .module('io.services', ['ngMaterial'])
      .service('messageService', MessageService);
  
  MessageService.$inject = ['$mdToast'];
  
  function MessageService($mdToast) {
    var messages = {
      nourl: {status: 500, name: '', message: 'No url specified!'},
      nostorewithurl: {status: 404, name: 'error', message: 'There is no store with such url'},
      noitemwithurl: {status: 404, name: 'error', message: 'There is no item with such url'},
      fileisntuploaded: {status: 500, name: 'Ooops!', code: 500, message: 'File is not uploaded!'},
      noinviterwithurl: {status: 404, name: 'error', message: 'There is no inviter store with such url'},
      lstorageisnotavailable: {status: 'Ooops!', name: 'error', message: 'Session Storage is not available'},
      inapp: {
        status: 'Ooops',
        name: 'warning',
        message: 'You are using isOpen in Facebook in-app browser, which cuts isopen functionality.' +
        ' You would not be able to login, buy item, etc. Please open isOpen in regular browser. You can click "Share" when viewing the link and choose "Open in Safari"'
      }
    };
    return {
      alert: function (data) {
        toaster.clear();
        if (data.status == undefined) {
          angular.forEach(data, function (error) {
            toaster.pop('error', "Field: " + error.field, error.message);
          });
        }
        else {
          toaster.pop('error', "code: " + data.code + " " + data.name, data.message);
        }
      },
      simpleAlert: function (code) {
        var data = messages[code];
        toaster.clear();
        toaster.pop('error', "status: " + data.status + " " + data.name, data.message);
      },
      exception: function (data) {
        toaster.clear();
        toaster.pop('error', "Error: " + data.message);
      },
      satellizerAlert: function (err) {
        if (err.data) {
          toaster.pop('error', err.data);
        }
      }
    }
  }
  
// })(angular);