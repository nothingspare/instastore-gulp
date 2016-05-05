'use strict';

angular.module('instastore')
    .value('app-version', '0.0.2')
    .constant('SLIDER_HEIGHT', 310)
    .constant('SLIDER_HEIGHT_EXTENDED', 390)
    .constant('ITEM_STATUS', {temp: 0, inactive: 10, active: 20})
    .constant('PLUPLOAD_RESIZE_CONFIG', {width: 620, height: 620, preserve_headers: false})
    .constant('ITEMSELLTRANSACTION_STATUS', {
      sold: 0,
      declined: 10,
      send: 20,
      sendFirstRemainder: 21,
      sendSecondRemainder: 22,
      sendThirdRemainder: 23,
      saleCanceled: 24,
      label: 30,
      receivedInPost: 40,
      arrived: 50,
      hurryup: 60,
      accepted: 70
    })
    .constant('angularMomentConfig', {
      preprocess: 'unix'
    })
    .constant('angularCustomIcons', function (ngMdIconServiceProvider) {
      ngMdIconServiceProvider
          .addShapes({
            'alert-off': '<g><circle fill="none" stroke="#000000" stroke-miterlimit="10" cx="18.58" cy="18.44" r="17.707" /><path fill="none" stroke="#000000" stroke-miterlimit="10" d="M21.518,28.948c-0.028,0.795-0.343,1.457-0.941,1.998   c-0.6,0.54-1.296,0.794-2.099,0.765c-0.802-0.029-1.485-0.332-2.055-0.918c-0.561-0.583-0.811-1.267-0.781-2.061   c0.028-0.795,0.332-1.467,0.931-2.018c0.608-0.561,1.317-0.82,2.121-0.792c0.798,0.028,1.476,0.341,2.031,0.945   C21.283,27.461,21.546,28.153,21.518,28.948z" /><path fill="none" stroke="#000000" stroke-miterlimit="10" d="M21.611,7.226c-0.025,0.711,0.223,2.225-0.443,6.267   c-0.658,4.041-1.246,7.776-1.604,8.702c-0.416,1.077-1.432,1.077-1.812-0.066c-0.404-1.211-1.678-4.94-2.045-9.017   c-0.35-4.079-0.1-5.396-0.072-6.106c0.031-0.802,0.338-1.488,0.922-2.01c0.58-0.536,1.311-0.785,2.182-0.755   c0.869,0.034,1.572,0.325,2.115,0.902C21.383,5.707,21.645,6.402,21.611,7.226z" /></g>',
            'alert-on': '<circle fill="#EF6262" stroke="#EF6262" stroke-miterlimit="10" cx="12" cy="12" r="11.394"/><path fill="#FFFFFF" d="M13.891,18.762c-0.019,0.512-0.221,0.938-0.605,1.285c-0.386,0.349-0.834,0.512-1.351,0.493 c-0.516-0.02-0.956-0.214-1.322-0.591c-0.36-0.376-0.521-0.815-0.503-1.326s0.214-0.943,0.599-1.298 c0.392-0.36,0.848-0.528,1.365-0.511c0.513,0.02,0.949,0.221,1.307,0.608C13.739,17.806,13.909,18.25,13.891,18.762z"/><path fill="#FFFFFF" d="M13.951,4.785c-0.017,0.457,0.143,1.431-0.285,4.032c-0.424,2.6-0.802,5.004-1.032,5.6 c-0.268,0.692-0.921,0.692-1.167-0.043c-0.26-0.779-1.08-3.179-1.315-5.802C9.927,5.947,10.088,5.1,10.105,4.643 c0.02-0.516,0.217-0.958,0.593-1.293c0.374-0.345,0.843-0.505,1.404-0.486c0.559,0.022,1.011,0.21,1.36,0.581 C13.804,3.807,13.973,4.254,13.951,4.785z"/>',
            'multi-stream': '<g><rect x="3.94" y="2.094" fill="none" stroke="#000000" stroke-miterlimit="10" width="16.246" height="20.322" /><rect x="20.217" y="4.293" fill="none" stroke="#000000" stroke-miterlimit="10" width="3.018" height="15.924" /><rect x="0.827" y="4.293" fill="none" stroke="#000000" stroke-miterlimit="10" width="3.018" height="15.924" /><circle fill="none" stroke="#000000" stroke-miterlimit="10" cx="8.37" cy="6.385" r="1.956" /></g>',
            'following': '<g><circle fill="none" stroke="#000000" stroke-miterlimit="10" cx="5.087" cy="4.959" r="4.407" /><circle fill="none" stroke="#000000" stroke-miterlimit="10" cx="19.002" cy="4.959" r="4.407" /><circle fill="none" stroke="#000000" stroke-miterlimit="10" cx="5.087" cy="18.496" r="4.407" /><circle fill="none" stroke="#000000" stroke-miterlimit="10" cx="19.002" cy="18.496" r="4.407" /></g>',
            'grid': '<g fill="none" fill-rule="evenodd" id="miu" stroke="none" stroke-width="1"><g id="Artboard-1" transform="translate(-431.000000, -479.000000)"><g id="slice" transform="translate(215.000000, 119.000000)"/><path d="M432,480 L432,486 L438,486 L438,480 L432,480 Z M440,480 L440,486 L446,486 L446,480 L440,480 Z M448,480 L448,486 L454,486 L454,480 L448,480 Z M449,481 L449,485 L453,485 L453,481 L449,481 Z M441,481 L441,485 L445,485 L445,481 L441,481 Z M433,481 L433,485 L437,485 L437,481 L433,481 Z M432,488 L432,494 L438,494 L438,488 L432,488 Z M440,488 L440,494 L446,494 L446,488 L440,488 Z M448,488 L448,494 L454,494 L454,488 L448,488 Z M449,489 L449,493 L453,493 L453,489 L449,489 Z M441,489 L441,493 L445,493 L445,489 L441,489 Z M433,489 L433,493 L437,493 L437,489 L433,489 Z M432,496 L432,502 L438,502 L438,496 L432,496 Z M440,496 L440,502 L446,502 L446,496 L440,496 Z M448,496 L448,502 L454,502 L454,496 L448,496 Z M449,497 L449,501 L453,501 L453,497 L449,497 Z M441,497 L441,501 L445,501 L445,497 L441,497 Z M433,497 L433,501 L437,501 L437,497 L433,497 Z" fill="#000000" id="editor-grid-view-block-outline-stroke"/></g></g>'
          })
          .addViewBox('alert-off', '0 0 37.22 37.169');
    })
    // .config(['$compileProvider', function ($compileProvider) {
    //   $compileProvider.debugInfoEnabled(false);
    // }]);

switch (window.location.origin) {
  case 'https://isopen.us':
    angular.module('instastore')
        .constant('API_URL', 'https://api.isopen.us/')
        .constant('CLIENT_URL', 'https://isopen.us/');
    break;
  case 'http://instastore.us':
    angular.module('instastore')
        .constant('API_URL', 'http://api.instastore.us/')
        .constant('CLIENT_URL', 'http://instastore.us/');
    break;
  default:
    angular.module('instastore')
        .constant('API_URL', 'http://api.instastore.us/')
        .constant('CLIENT_URL', 'http://192.168.0.103:3000/');
    break;
}
