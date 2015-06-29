'use strict';

app
    .directive('login', ['$http', function ($http) {
        return {
            transclude: true,
            link: function (scope, element, attrs) {
                scope.isGuest = window.sessionStorage._auth == undefined;
            },

            template: '<a href="login" ng-if="isGuest">Login</a>'
        }
    }])
    .directive('imagesh', function ($q) {

        var URL = window.URL || window.webkitURL;

        var getResizeArea = function () {
            var resizeAreaId = 'fileupload-resize-area';

            var resizeArea = document.getElementById(resizeAreaId);

            if (!resizeArea) {
                resizeArea = document.createElement('canvas');
                resizeArea.id = resizeAreaId;
                resizeArea.style.visibility = 'hidden';
                document.body.appendChild(resizeArea);
            }

            return resizeArea;
        }

        var resizeImage = function (origImage, options) {
            var maxHeight = options.resizeMaxHeight || 300;
            var maxWidth = options.resizeMaxWidth || 250;
            var quality = options.resizeQuality || 0.7;
            var type = options.resizeType || 'image/jpg';

            var canvas = getResizeArea();

            var height = origImage.height;
            var width = origImage.width;

            // calculate the width and height, constraining the proportions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height *= maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width *= maxHeight / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            //draw image on canvas
            var ctx = canvas.getContext("2d");
            ctx.drawImage(origImage, 0, 0, width, height);

            // get the data from canvas as 70% jpg (or specified type).
            return canvas.toDataURL(type, quality);
        };

        var createImage = function (url, callback) {
            var image = new Image();
            image.onload = function () {
                callback(image);
            };
            image.src = url;
        };

        var fileToDataURL = function (file) {
            var deferred = $q.defer();
            var reader = new FileReader();
            reader.onload = function (e) {
                deferred.resolve(e.target.result);
            };
            reader.readAsDataURL(file);
            return deferred.promise;
        };

        return {
            restrict: 'A',
            scope: {
                image: '=imagesh',
                resizeMaxHeight: '@?',
                resizeMaxWidth: '@?',
                resizeQuality: '@?',
                resizeType: '@?'
            },
            link: function postLink(scope, element, attrs, ctrl) {

                var doResizing = function (imageResult, callback) {
                    createImage(imageResult.url, function (image) {
                        var dataURL = resizeImage(image, scope);
                        imageResult.resized = {
                            dataURL: dataURL,
                            type: dataURL.match(/:(.+\/.+);/)[1],
                        };
                        callback(imageResult);
                    });
                };
                var applyScope = function (imageResult) {
                    scope.$apply(function () {
                            if (attrs.multiple) {
                                scope.image.push(imageResult);
                            }
                            else {
                                scope.image = imageResult;
                            }
                        }
                    )
                    ;
                };


                element.bind('change', function (evt) {
                    //when multiple always return an array of images
                    if (attrs.multiple)
                        scope.image = [];

                    var files = evt.target.files;
                    for (var i = 0; i < files.length; i++) {

                        //create a result object for each file in files
                        var imageResult = {
                            file: files[i],
                            url: URL.createObjectURL(files[i])
                        };

                        loadImage.parseMetaData(files[i], function (data) {
                            if (data.exif) {
                                var orientation = data.exif.get('Orientation');
                            }

                            fileToDataURL(files[i]).then(function (dataURL) {
                                imageResult.dataURL = dataURL;
                            });

                            if (scope.resizeMaxHeight || scope.resizeMaxWidth) { //resize image
                                doResizing(imageResult, function (imageResult) {
                                    imageResult.orientation = data.exif.get('Orientation');
                                    applyScope(imageResult, orientation);
                                });
                            }
                            else { //no resizing
                                imageResult.orientation = data.exif.get('Orientation');
                                applyScope(imageResult, orientation);
                            }
                        });
                    }
                });
            }
        }
            ;
    })
    .
    directive('backgroundImage', function () {
        return function (scope, element, attrs) {
            restrict: 'A',
                attrs.$observe('backgroundImage', function (value) {
                    if (!value) value = 'assets/images/background1-blur.jpg';
                    var style = "<style> html:before{background-image:url('" + value + "');}</style>";
                    element.append(style);
                });
        };
    })
    .directive('backgroundFilter', function () {
        return function (scope, element, attrs) {
            restrict: 'A',
                attrs.$observe('backgroundFilter', function (value) {
                    var style = "<style>" +
                        "html:before{" + value + ")}</style>"
                    element.append(style);
                });
        };
    })
    .directive('toggleimageheight', function ($rootScope, SLIDER_HEIGHT, SLIDER_HEIGHT_EXTENDED) {
        var isExtHeight;
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                elem.bind('click', function () {
                    scope.$apply(function () {
                        if (isExtHeight)
                            $rootScope.sliderImageHeight = SLIDER_HEIGHT;
                        else
                            $rootScope.sliderImageHeight = SLIDER_HEIGHT_EXTENDED;
                        isExtHeight = !isExtHeight;
                    });
                });
            }
        }
    })
    .filter('itemPrice', function () {
        return function (input) {
            return input ? input : '---';
        };
    })
    .filter('itemDescription', function () {
        return function (input) {
            return input ? input : 'No description given';
        };
    })
    .filter('itemStatus', function () {
        return function (input) {
            return ((input * 1) == 10) ? 'item-inactive' : 'item-active';
        }
    })
    .filter('getById', function () {
        return function (input, id) {
            var i = 0, len = input.length;
            for (; i < len; i++) {
                if (+input[i].id == +id) {
                    return input[i];
                }
            }
            return null;
        }
    })
    .filter('storeAvatar', function (UserService) {
        return function (input) {
            var facebookProfile = UserService.getFacebookProfile();
            return input ? input : 'http://graph.facebook.com/' + facebookProfile.id + '/picture?type=large';
        }
    });
