'use strict';

angular.module('instastore')
    .controller('ProfileIndex', ['$scope', 'UserService', function ($scope, UserService) {
        $scope.slides = [
            {title: 'first'},
            {title: 'second'},
            {title: 'third'},
            {title: 'fourth'}
        ];
        //$scope.facebookProfile = UserService.getProfile();
    }])
    .controller('ProfileStoreIndex', ['$scope', 'UserService', function ($scope, UserService) {
        $scope.slides = [
            {title: 'first'},
            {title: 'second'},
            {title: 'third'},
            {title: 'fourth'},
            {title: 'fifth'}
        ];
        //$scope.facebookProfile = UserService.getProfile();
    }])
    .controller('CropUploadCtrl', ['$scope', '$stateParams', '$upload', 'API_URL', 'toaster', '$window', 'UserService',
        function ($scope, $stateParams, $upload, API_URL, toaster, $window, UserService) {
            $scope.myImage = '';
            $scope.myCroppedImage = '';

            /**
             * Converts data uri to Blob. Necessary for uploading.
             * @see
             *   http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
             * @param  {String} dataURI
             * @return {Blob}
             */
            var dataURItoBlob = function (dataURI) {
                var binary = atob(dataURI.split(',')[1]);
                var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
                var array = [];
                for (var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }
                return new Blob([new Uint8Array(array)], {type: mimeString});
            };

            var handleFileSelect = function (evt) {
                var file = evt.currentTarget.files[0];
                var reader = new FileReader();
                reader.onload = function (evt) {
                    $scope.$apply(function ($scope) {
                        $scope.myImage = evt.target.result;
                    });
                };
                reader.readAsDataURL(file);
            };
            angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);

            $scope.upload = function (files, isAvatar) {
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        $upload.upload({
                            url: API_URL + 'v1/store/upload',
                            fields: {
                                'isAvatar': isAvatar
                            },
                            headers: {
                                'Content-Type': file.type
                            },
                            method: 'POST',
                            data: file,
                            file: file
                        }).progress(function (evt) {
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                        }).success(function (data, status, headers, config) {
                            if (isAvatar > 0) {
                                UserService.setAvatar(data);
                            }
                            else {
                                UserService.setBg(data);
                            }
                            toaster.pop('success', 'File uploaded!');
                            console.log('file uploaded. Response: ' + data);
                        });
                    }
                }
            };

            $scope.uploadCrop = function () {
                $scope.upload([dataURItoBlob($scope.myCroppedImage)], 1);
                $scope.upload([dataURItoBlob($scope.myImage)], 0);
            };
        }]);