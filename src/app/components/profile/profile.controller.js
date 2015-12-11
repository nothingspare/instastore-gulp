'use strict';
angular.module('instastore')
    .controller('ProfileIndex', ['$scope', 'UserService', 'toaster', 'rest', 'PreviousState', '$state',
        '$rootScope', 'uiGmapGoogleMapApi', 'stripe', 'API_URL', '$http', '$filter',
        function ($scope, UserService, toaster, rest, PreviousState, $state, $rootScope,
                  uiGmapGoogleMapApi, stripe, API_URL, $http, $filter) {
            uiGmapGoogleMapApi
                .then(function () {
                    return uiGmapGoogleMapApi;
                })
                .then(function () {
                    $scope.renderMap = true;
                });

            var initProfile;
            $scope.profile = initProfile = UserService.getProfile();

            $scope.p = {};

            var orderBy = $filter('orderBy');

            $scope.treeConfig = {
                '1': {
                    code: 'name',
                    name: 'Name',
                    toggleThis: false,
                    icon: 'person',
                    subs: [
                        {name: 'FistName LastName'}
                    ]
                },
                phoneNumber: {
                    code: 'phone',
                    name: 'Phone number',
                    toggleThis: true,
                    icon: 'phone',
                    subs: [
                        {name: 'Verify phone number'}
                    ]
                },
                card: {
                    code: 'card',
                    name: 'Your card',
                    toggleThis: true,
                    icon: 'credit_card',
                    subs: [
                        {name: 'Enter your card'}
                    ]
                },
                address: {
                    code: 'address',
                    name: 'Postal address',
                    toggleThis: true,
                    icon: 'location_city',
                    subs: [
                        {name: 'Verify postal address'}
                    ]
                }
            };

            $scope.canToggle = function (code) {
                switch (code) {
                    case 'name':
                        return false;
                    case 'phone':
                        return $scope.profile.phone_validated_at ? false : true;
                    case 'card':
                        return true;
                    case 'address':
                        return true;
                    default:
                        return false;
                }
            };

            $scope.removeSellerCard = function () {
                rest.path = 'v1/link/remove-seller-card';
                rest.deleteModel().success(function () {
                        delete($scope.profile.recipient_id);
                        delete($scope.profile.card_token);
                        delete($scope.profile.card_token_created_at);
                        UserService.setProfile($scope.profile);
                    }
                ).error(errorCallback);
            };

            $scope.removePhone = function () {
                rest.path = 'v1/link/remove-phone';
                rest.deleteModel().success(function () {
                        delete($scope.profile.phone);
                        delete($scope.profile.phone_code);
                        delete($scope.profile.phone_valid_until);
                        delete($scope.profile.phone_validated_at);
                        UserService.setProfile($scope.profile);
                    }
                ).error(errorCallback);
            };

            if ($scope.profile.seller) {
                $scope.slides = [
                    {title: 'first'},
                    {title: 'second'},
                    {title: 'third'},
                    {title: 'fourth'}
                ];
            } else {
                $scope.slides = [
                    {title: 'first'},
                    {title: 'second'},
                    {title: 'third'},
                    {title: 'fourth'}
                ];
            }

            $scope.fullName = $scope.profile.first_name + ' ' + $scope.profile.last_name;

            var errorCallback = function (data) {
                toaster.clear();
                if (data.status == undefined) {
                    if (data.code == 23000) {
                        toaster.pop('error', "Field: Email has already been taken");
                    }
                    else {
                        angular.forEach(data, function (error) {
                            toaster.pop('error', "Field: " + error.field, error.message);
                        });
                    }
                }
                else {
                    toaster.pop('error', "code: " + data.code + " " + data.name, data.message);
                }
            };

            rest.path = 'v1/my-stores';
            rest.model($scope.profile.store.id).success(function (store) {
                $scope.store = store;
                $rootScope.bgUrl = store.bg_url;
            }).error(errorCallback);

            $scope.isFacebookOff = true;

            var facebookUser = UserService.getFacebookProfile();
            $scope.facebookUid = facebookUser.id;
            $scope.facebookLink = facebookUser.link;

            $scope.save = function () {
                rest.path = 'v1/profiles';
                rest.putModel($scope.profile).success(function () {
                        toaster.pop('success', "Profile saved");
                        UserService.setProfile($scope.profile);
                    }
                ).error(errorCallback);
            };

            $scope.saveUrl = function () {
                rest.path = 'v1/my-stores';
                rest.putModel($scope.profile.store).success(function (data) {
                    toaster.pop('success', "Store url saved");
                    $scope.profile.store.store_url = data.store_url;
                    UserService.setProfile($scope.profile);
                }).error(errorCallback);
            };

            $scope.toggleFacebookProfile = function () {
                $scope.isFacebookOff = !$scope.isFacebookOff;
                if ($scope.isFacebookOff) {
                    var user = UserService.getProfile();
                    $scope.profile.first_name = user.first_name;
                    $scope.profile.last_name = user.last_name;
                    $scope.profile.email = user.email;
                }
                else {
                    $scope.profile.first_name = facebookUser.first_name;
                    $scope.profile.last_name = facebookUser.last_name;
                    $scope.profile.email = facebookUser.email;
                }
            };

            $scope.goBack = function () {
                if (PreviousState.Name) {
                    if (PreviousState.Name == 'profilestore/') $state.go('grid');
                    else $state.go(PreviousState.Name, PreviousState.Params);
                }
                else
                    $state.go('grid');
            };

            $scope.makeMeSeller = function (val) {
                if (val === 'demo') {
                    $scope.profile.status = 20;
                    rest.path = 'v1/profiles';
                    rest.putModel($scope.profile).success(function (profile) {
                            toaster.pop('success', "Profile saved");
                            $scope.profile.seller = true;
                            UserService.setProfile($scope.profile);
                            UserService.setIsSeller(true);
                            $state.go('grid', {storeurl: $scope.profile.store.store_url});
                        }
                    ).error(errorCallback);
                }
            };

            $scope.verifyAddress = function () {
                rest.path = 'v1/link/verify-address';
                rest.postModel({
                    address: $scope.profile.address,
                    city: $scope.profile.city,
                    state: $scope.profile.state,
                    zipcode: $scope.profile.zipcode,
                    apartment: $scope.profile.apartment
                }).success(function (data) {
                    if (data.AddressValidateResponse.Address) {
                        toaster.pop('success', "Address verified!");
                        $scope.profile.apartment = data.AddressValidateResponse.Address.Address1;
                        $scope.profile.address = data.AddressValidateResponse.Address.Address2;
                        $scope.profile.state = data.AddressValidateResponse.Address.State;
                        $scope.profile.city = data.AddressValidateResponse.Address.City;
                        $scope.profile.zipcode = data.AddressValidateResponse.Address.Zip5;
                        UserService.setProfile($scope.profile);
                    }
                    else {
                        toaster.pop('error', "Address verification failed!");
                    }
                }).error(errorCallback);
            };

            $scope.textToVerify = function () {
                rest.path = 'v1/link/verify-phone';
                var params = {
                    phone: $scope.profile.phone
                };
                if ($scope.profile.phone.substring(0, 4) === '+380') {
                    params.country = 'UA';
                }
                rest.models(params).error(errorCallback);
            };

            $scope.sendCode = function (code) {
                rest.path = 'v1/link/confirm-phone';
                rest.models({code: code}).success(function (res) {
                    $scope.profile.phone = res.phone;
                    $scope.profile.phone_validated_at = res.phone_validated_at;
                    UserService.setProfile($scope.profile);
                }).error(errorCallback);
            };

            $scope.verifyCard = function (cardNumber, cardExpiry, cardCvc) {
                var card = {
                    number: cardNumber,
                    exp_month: cardExpiry.month,
                    exp_year: cardExpiry.year,
                    cvc: cardCvc
                };

                stripe.card.createToken(card)
                    .then(function (token) {
                        return $http.post(API_URL + 'v1/link/save-tokenized-card?access-token=' + UserService.getToken(), {
                            token: token.id,
                            cardLastDigits: cardNumber.slice(cardNumber.length - 4, cardNumber.length)
                        });
                    }).then(function (res) {
                        $scope.profile.card_token_created_at = res.data.card.card_token_created_at;
                        $scope.profile.card_last_digits = res.data.card.card_last_digits;
                        UserService.setProfile($scope.profile);
                    }).catch(function (res) {
                        toaster.pop('error', "Stripe error", res.data.message);
                    });
            };

        }])
    .controller('ProfileStoreIndex', ['$scope', 'UserService', 'rest', 'toaster', 'uiGmapGoogleMapApi', '$auth', 'CLIENT_URL', '$rootScope',
        function ($scope, UserService, rest, toaster, uiGmapGoogleMapApi, $auth, CLIENT_URL, $rootScope) {

            $scope.CLIENT_URL = CLIENT_URL;

            $scope.treeStoreConfig = {
                '1': {
                    code: 'specialities',
                    name: 'Name, Description, Specialities',
                    toggleThis: true,
                    icon: 'local_mall',
                    subs: [
                        {name: 'Specialities'}
                    ],
                    collapsed: true
                },
                '2': {
                    code: 'location',
                    name: 'Store Location',
                    toggleThis: true,
                    icon: 'place',
                    subs: [
                        {name: 'Verify phone number'}
                    ],
                    collapsed: true
                },
                '3': {
                    code: 'crop',
                    name: 'Crop Background To Store Avatar',
                    toggleThis: true,
                    icon: 'crop',
                    subs: [{name: 'Upload and Crop'}],
                    collapsed: true
                },
                '4': {
                    code: 'instagram',
                    name: 'Instagram Import',
                    toggleThis: true,
                    icon: 'instagram',
                    subs: [{name: 'Instagram Import'}],
                    collapsed: true
                }
            };

            $scope.canToggle = function (code) {
                switch (code) {
                    case 'specialities':
                        return true;
                    case 'location':
                        return true;
                    case 'crop':
                        return true;
                    case 'instagram':
                        return false;
                    default:
                        return false;
                }
            };

            uiGmapGoogleMapApi
                .then(function () {
                    return uiGmapGoogleMapApi;
                })
                .then(function () {
                    $scope.renderMap = true;
                });

            var errorCallback = function (data) {
                toaster.clear();
                if (data.status == undefined) {
                    if (data.code == 23000) {
                        toaster.pop('error', "Field: Paypal Email has already been taken");
                    }
                    else {
                        angular.forEach(data, function (error) {
                            toaster.pop('error', "Field: " + error.field, error.message);
                        });
                    }
                }
                else {
                    toaster.pop('error', "code: " + data.code + " " + data.name, data.message);
                }
            };

            $scope.slides = [
                {title: 'first'},
                {title: 'second'},
                {title: 'third'},
                {title: 'fourth'},
                {title: 'fifth'}
            ];

            $scope.profile = UserService.getProfile();

            $scope.mainStoreUrl = UserService.getMainStoreUrl();

            $scope.save = function () {
                if ($scope.profile.store.place) {
                    if ($scope.profile.store.place.types) {
                        $scope.profile.store.store_long = $scope.profile.store.place.geometry.location.k || $scope.profile.store.place.geometry.location.G;
                        $scope.profile.store.store_lat = $scope.profile.store.place.geometry.location.D || $scope.profile.store.place.geometry.location.K;
                        $scope.profile.store.address = $scope.profile.store.place.formatted_address;
                    } else {
                        toaster.pop('error', 'Invalid address')
                    }
                }
                $scope.profile.store.store_url = $scope.profile.store.store_name;
                rest.path = 'v1/my-stores';
                rest.putModel($scope.profile.store).success(function (store) {
                    toaster.pop('success', "Store saved");
                    delete $scope.profile.store.place;
                    $scope.profile.store = store;
                    UserService.setProfile($scope.profile);
                }).error(errorCallback);
            };

            $scope.linkInstagram = function () {
                $auth.authenticate('instagram')
                    .then(function (response) {
                        if (response.data && response.data.user && response.data.user.id) {
                            UserService.fromInstaimport = true;
                            $scope.profile.instagramId = response.data.user.id;
                            UserService.setProfile($scope.profile);
                        }
                    });
            };
        }])
    .controller('CropUploadCtrl', ['$scope', '$stateParams', 'Upload', 'API_URL', 'toaster', '$window', 'UserService',
        function ($scope, $stateParams, Upload, API_URL, toaster, $window, UserService) {
            $scope.myImage = '';
            $scope.myCroppedImage = '';

            /**
             * Converts data uri to Blob. Necessary for uploading.
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
                        Upload.upload({
                            url: API_URL + 'v1/uploader/store-images',
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
                        }).success(function (data) {
                            if (isAvatar > 0) {
                                UserService.setAvatar(data.image_url);
                            }
                            else {
                                UserService.setBg(data.image_url);
                            }
                            toaster.pop('success', 'File uploaded!');
                            console.log('file uploaded. Response: ' + data.image_url);
                        });
                    }
                }
            };

            $scope.uploadCrop = function () {
                $scope.upload([dataURItoBlob($scope.myCroppedImage)], 1);
                $scope.upload([dataURItoBlob($scope.myImage)], 0);
            };
        }]);