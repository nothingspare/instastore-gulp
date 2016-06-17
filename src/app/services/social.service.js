(function () {
  'use strict';

  angular
      .module('instastore')
      .service('SocialService', SocialService);

  SocialService.$inject = ['rest'];

  /* @ngInject */
  function SocialService(rest) {
    this.socialExport = socialExport;

    ////////////////

    function socialExport(item_id, post) {
      var post = post || '';
      rest.path = 'v1/link/social-export';
      return rest.postModel({
            item_id: item_id,
            post: post
          });
    }
  }

})();

