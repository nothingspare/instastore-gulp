(function () {
  'use strict';

  angular
      .module('instastore')
      .service('DeviceService', DeviceService);

  DeviceService.$inject = ['deviceDetector'];

  /* @ngInject */
  function DeviceService(deviceDetector) {
    this.isFacebookInApp = isFacebookInApp;
    this.isHomeScreen = isHomeScreen;

    ////////////////

    function isFacebookInApp() {
      var ua = navigator.userAgent || navigator.vendor || window.opera;
      return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
    }

    function isHomeScreen() {
      return deviceDetector.os === 'ios'
          && deviceDetector.browser === 'unknown'
          && deviceDetector.browser_version === '0'
          && deviceDetector.os_version === 'unknown' && !isFacebookInApp();
    }
  }
})();

