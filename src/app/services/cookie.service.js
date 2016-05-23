(function () {
  'use strict';

  angular
      .module('instastore')
      .service('CookieService', CookieService);

  CookieService.$inject = ['$q', '$timeout', '$cookies'];

  /* @ngInject */
  function CookieService($q, $timeout, $cookie) {
    this.setCookie = setCookie;
    this.getCookie = getCookie;
    this.deleteCookie = deleteCookie;

    ////////////////

    function setCookie(name, value, options) {
      return $q(function (res, rej) {
        options = options || {};

        var expires = options.expires;

        if (typeof expires == "number" && expires) {
          var d = new Date();
          d.setTime(d.getTime() + expires * 1000);
          expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
          options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
          updatedCookie += "; " + propName;
          var propValue = options[propName];
          if (propValue !== true) {
            updatedCookie += "=" + propValue;
          }
        }
        $cookie._auth =  value;
        document.cookie = updatedCookie;
        $timeout(function () {
          res(true);
        }, 1000);
      });
    }

    function getCookie(name) {
      var matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function deleteCookie(name) {
      setCookie(name, "", {
        expires: -1
      })
    }
  }

})();

