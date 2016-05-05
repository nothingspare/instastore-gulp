(function (angular) {
  'use strict';

  angular
      .module('io.services', ['ngMaterial'])
      .service('messageService', MessageService);

  MessageService.$inject = ['$mdToast'];

  function MessageService($mdToast) {
    var messages = {
      /* Profile */
      profile: {
        emailTaken: 'Field: Email has already been taken',
        saved: 'Profile saved!',
        addressSuccess: 'Address verified!',
        addressError: 'Address verification failed!'
      },
      /* Profile store */
      profileStore: {
        saved: 'Store saved!',
        urlSaved: 'Store url saved!',
        linkAccount: 'You can link account only from PC',
        stripeError: 'Stripe error!',
        addressInvalid: 'Invalid address!'
      },
      store: {
        saved: 'Saved!',
        copied: 'Copied!'
      },
      /* Crop upload */
      cropUpload: {
        fileUploaded: 'File uploaded!'
      },
      /* Item */
      item: {
        successPosted: 'Successfully posted!',
        saved: 'Saved!',
        imageDeleted: 'Image deleted!',
        itemDeleted: 'Item deleted!',
        commented: 'Commented!',
        fileUploaded: 'File uploaded!',
        success: 'Success!',
        verifyAddress: 'You should enter and verify your address in profile section',
        labelSent: 'Label sent!',
        duplicated: 'Duplicated!',
        urlWrongFormat: 'Item or Store url undefined!'
      },
      /* Verify */
      verify: {
        success: 'Verified!'
      },
      /* Other */
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

    function showToast(message) {

      var toast = $mdToast.simple()
          .content(message)
          .position('top right');

      $mdToast.show(toast);
    }

    return {
      simpleByCode: function (area, code, msg) {
        msg = msg ? " " + msg : "";
        showToast(messages[area][code] + msg);
      },
      profile: function (data) {
        if (data.status == undefined) {
          if (data.code == 23000) {
            showToast(messages.profile.emailTaken);
          }
          else {
            angular.forEach(data, function (error) {
              showToast('Field: ' + error.field + ' ' + error.message);
            });
          }
        }
        else {
          showToast('code: ' + data.code + ' ' + data.name + ' ' + data.message);
        }
      },
      alert: function (data) {
        if (data.status == undefined) {
          angular.forEach(data, function (error) {
            showToast('Field: ' + error.field + " " + error.message);
          });
        }
        else {
          showToast('code: ' + data.code + ' ' + data.name + ' ' + data.message);
        }
      },
      simpleAlert: function (code) {
        var data = messages[code];
        showToast('status: ' + data.status + ' ' + data.name + ' ' + data.message);
      },
      exception: function (data) {
        showToast('Error: ' + data.message);
      },
      satellizerAlert: function (err) {
        if (err.data) {
          showToast(err.data);
        }
      }
    }
  }

})(angular);