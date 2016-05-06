(function () {
  'use strict';

  angular
      .module('instastore')
      .service('VerifyService', VerifyService);

  VerifyService.$inject = ['rest', 'messageService'];

  /* @ngInject */
  function VerifyService(rest, messageService) {
    this.phone = phone;
    this.address = address;
    this.sendCode = sendCode;

    ////////////////

    function phone(phoneNumber) {
      rest.path = 'v1/link/verify-phone';
      var params = {
        phone: phoneNumber
      };
      if (phoneNumber.substring(0, 4) === '+380') {
        params.country = 'UA';
      }
      return rest.models(params)
          .error(messageService.profile);
    }

    function address(profile) {
      rest.path = 'v1/link/verify-address';
      return rest.postModel({
            address: profile.address,
            city: profile.city,
            state: profile.state,
            zipcode: profile.zipcode,
            apartment: profile.apartment
          })
          .error(messageService.profile);
    }

    function sendCode(code) {
      rest.path = 'v1/link/confirm-phone';
      return rest.models({code: code})
          .error(messageService.profile);
    }
  }

})();
