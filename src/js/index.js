(function(angular, undefined) {

  var app = angular.module('mp', [
    'ui.router'
  ]);

  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    '$httpProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

      $locationProvider.html5Mode({
        enabled: false,
        requireBase: false
      });
      $locationProvider.hashPrefix('!');

      $stateProvider
      .state('home', {
        url: '/'
      });

    }
  ]);

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['mp']);
  });


})(window.angular);
