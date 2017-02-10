(function(angular, undefined) {

  var app = angular.module('fishfolio', [
    'fishfolio.config',
    'ui.router',
    'ngDialog',
    'firebase',
    'textAngular'
  ]);

  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    '$httpProvider',
    'firebaseConfig',
    function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, firebaseConfig) {

      firebase.initializeApp(firebaseConfig);

      $locationProvider.html5Mode({
        enabled: false
      });
      $locationProvider.hashPrefix('!');

      $stateProvider
      .state('home', {
        url: ''
      })
      .state('project', {
        url: '/projects/:projectId',
        controller: 'ProjectCtrl',
        templateUrl: 'views/project.html'
      });

    }
  ]);

  require('./services')(app);
  require('./controllers')(app);
  require('./directives')(app);
  require('./filters')(app);

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['fishfolio']);
  });

})(window.angular);
