'use strict';

var app = angular.module('instastore');

app
    .directive('backgroundImage', function () {
      return function (scope, element, attrs) {
        restrict: 'A',
            attrs.$observe('backgroundImage', function (value) {
              if (!value) {
                value = 'assets/images/background1-blur.jpg';
              }
              var style = '<style> html:before{background-image:url(' + value + ');}</style>';
              element.append(style);
            });
      };
    })
    .directive('backgroundFilter', function () {
      return function (scope, element, attrs) {
        restrict: 'A',
            attrs.$observe('backgroundFilter', function (value) {
              var style = '<style>html:before{' + value + ')}</style>';
              element.append(style);
            });
      };
    })
    .directive('toggleimageheight', function ($rootScope, SLIDER_HEIGHT, SLIDER_HEIGHT_EXTENDED) {
      var isExtHeight;
      return {
        restrict: 'A',
        link: function (scope, elem) {
          elem.bind('click', function () {
            scope.$apply(function () {
              if (isExtHeight) {
                $rootScope.sliderImageHeight = SLIDER_HEIGHT;
              }
              else {
                $rootScope.sliderImageHeight = SLIDER_HEIGHT_EXTENDED;
              }
              isExtHeight = !isExtHeight;
            });
          });
        }
      };
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
        return ((input * 1) === 10) ? 'item-inactive' : 'item-active';
      };
    })
    .filter('getById', function () {
      return function (input, id) {
        var i = 0, len = input.length;
        for (; i < len; i++) {
          if (+input[i].id === +id) {
            return input[i];
          }
        }
        return null;
      };
    })
    .filter('storeAvatar', ['UserService', function (UserService) {
      return function (input) {
        var facebookProfile = UserService.getFacebookProfile();
        return input ? input : 'http://graph.facebook.com/' + facebookProfile.id + '/picture?type=large';
      };
    }])
    .filter('itemTransactionStatus', ['ITEMSELLTRANSACTION_STATUS', function (ITEMSELLTRANSACTION_STATUS) {
      return function (input) {
        input = parseInt(input);

        if (!input) {
          return 'Sold!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.declined) {
          return 'Item Declined!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.send) {
          return 'Send item!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.sendFirstRemainder) {
          return 'Send item!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.sendSecondRemainder) {
          return 'Send item!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.sendThirdRemainder) {
          return 'Send item!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.saleCanceled) {
          return 'Sale Canceled!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.label) {
          return 'Send item!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.receivedInPost) {
          return 'Received in post!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.arrived) {
          return 'Arrived!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.hurryup) {
          return 'Arrived!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.accepted) {
          return 'Item accepted!';
        }
      };
    }])
    .filter('itemBuyerTransactionStatus', ['ITEMSELLTRANSACTION_STATUS', function (ITEMSELLTRANSACTION_STATUS) {
      return function (input) {
        input = parseInt(input);

        if (!input) {
          return 'Item bought!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.declined) {
          return 'Item declined!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.send) {
          return 'Item bought!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.sendFirstRemainder) {
          return 'Seller reminded x1 ';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.sendSecondRemainder) {
          return 'Seller reminded x2 ';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.sendThirdRemainder) {
          return 'Seller reminded x3 ';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.saleCanceled) {
          return 'Sale canceled!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.label) {
          return 'Label printed!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.receivedInPost) {
          return 'Received in post!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.arrived) {
          return 'Arrived!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.hurryup) {
          return 'Hurry up!';
        }
        if (input === ITEMSELLTRANSACTION_STATUS.accepted) {
          return 'Item accepted!';
        }
      };
    }])
    .filter('itemTransactionStatusVisibility', ['ITEMSELLTRANSACTION_STATUS', function (ITEMSELLTRANSACTION_STATUS) {
      return function (input) {
        if (!input) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.declined) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.send) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.sendFirstRemainder) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.sendSecondRemainder) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.sendThirdRemainder) {
          return false;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.label) {
          return false;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.receivedInPost) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.arrived) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.hurryup) {
          return false;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.accepted) {
          return true;
        }
      };
    }])
    .filter('itemBuyerTransactionStatusVisibility', ['ITEMSELLTRANSACTION_STATUS', function (ITEMSELLTRANSACTION_STATUS) {
      return function (input) {
        if (!input) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.declined) {
          return false;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.send) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.sendFirstRemainder) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.sendSecondRemainder) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.sendThirdRemainder) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.label) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.receivedInPost) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.arrived) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.hurryup) {
          return true;
        }
        if (input === ITEMSELLTRANSACTION_STATUS.accepted) {
          return true;
        }
      };
    }])
    .filter('itemSoldBoxSizeVisibility', ['ITEMSELLTRANSACTION_STATUS', function (ITEMSELLTRANSACTION_STATUS) {
      return function (input) {
        if (
            input === ITEMSELLTRANSACTION_STATUS.sold
            || input === ITEMSELLTRANSACTION_STATUS.sendFirstRemainder
            || input === ITEMSELLTRANSACTION_STATUS.sendSecondRemainder
            || input === ITEMSELLTRANSACTION_STATUS.sendThirdRemainder
        ) {
          return true;
        }
        else {
          return false;
        }
      };
    }])
    .filter('unique', function () {
      return function (items, filterOn) {

        if (filterOn === false) {
          return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
          var hashCheck = {}, newItems = [];

          var extractValueToCompare = function (item) {
            if (angular.isObject(item) && angular.isString(filterOn)) {

              var resolveSearch = function (object, keyString) {
                if (typeof object == 'undefined') {
                  return object;
                }
                var values = keyString.split(".");
                var firstValue = values[0];
                keyString = keyString.replace(firstValue + ".", "");
                if (values.length > 1) {
                  return resolveSearch(object[firstValue], keyString);
                } else {
                  return object[firstValue];
                }
              };

              return resolveSearch(item, filterOn);
            } else {
              return item;
            }
          };

          angular.forEach(items, function (item) {
            var valueToCheck, isDuplicate = false;

            for (var i = 0; i < newItems.length; i++) {
              if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                isDuplicate = true;
                break;
              }
            }
            if (!isDuplicate) {
              if (typeof item != 'undefined') {
                newItems.push(item);
              }
            }

          });
          items = newItems;
        }
        return items;
      };
    })
    .filter('tel', function () {
      return function (tel) {
        if (!tel) {
          return '';
        }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
          return tel;
        }

        var country, city, number;

        switch (value.length) {
          case 10: // +1PPP####### -> C (PPP) ###-####
            country = 1;
            city = value.slice(0, 3);
            number = value.slice(3);
            break;

          case 11: // +CPPP####### -> CCC (PP) ###-####
            country = value[0];
            city = value.slice(1, 4);
            number = value.slice(4);
            break;

          case 12: // +CCCPP####### -> CCC (PP) ###-####
            country = value.slice(0, 3);
            city = value.slice(3, 5);
            number = value.slice(5);
            break;

          default:
            return tel;
        }

        if (country == 1) {
          country = "";
        }

        number = number.slice(0, 3) + '-' + number.slice(3);

        return (country + " (" + city + ") " + number).trim();
      };
    })
    .directive('chooseFileButton', function () {
      return {
        restrict: 'E',
        link: function (scope, elem, attrs) {
          var button = elem.find('button');
          var input = elem.find('input');
          input.css({display: 'none'});
          button.bind('click', function () {
            input[0].click();
          });
        }
      };
    });