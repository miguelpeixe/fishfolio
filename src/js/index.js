(function(angular, $, _, undefined) {

  var app = angular.module('mp', [
    'mp.config',
    'ui.router',
    'firebase'
  ]);

  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    '$httpProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

      $locationProvider.html5Mode({
        enabled: false
      });
      $locationProvider.hashPrefix('!');

      $stateProvider
      .state('home', {
        url: ''
      })
      .state('project', {
        url: '/projects/:id',
        controller: 'ProjectCtrl',
        templateUrl: 'views/project.html'
      });

    }
  ]);

  app.controller('SiteCtrl', [
    '$scope',
    'firebase',
    '$firebaseArray',
    '$firebaseObject',
    function($scope, firebase, $firebaseArray, $firebaseObject) {

      var api = 'https://' + firebase + '.firebaseio.com/';

      var projects = new Firebase(api + 'projects');
      $scope.projects = $firebaseArray(projects);

      var about = new Firebase(api + 'about');
      $scope.about = $firebaseObject(about);
    }
  ]);

  app.controller('ProjectCtrl', [
    '$scope',
    '$stateParams',
    'firebase',
    '$firebaseObject',
    function($scope, $stateParams, firebase, $firebaseObject) {

      var api = 'https://' + firebase + '.firebaseio.com/';

      var project = new Firebase(api + 'projects/' + $stateParams.id);
      $scope.project = $firebaseObject(project);
    }
  ]);

  app.directive('fullWidth', [
    function() {
      return {
        restrict: 'EA',
        scope: {
          offset: '=',
          fixHeight: '='
        },
        link: function(scope, element, attrs) {
          scope.offset = scope.offset || 0;
          $(window).on('resize', function() {
            var offset = $(element).offset();
            var windowWidth = $(window).width();
            $(element).css({
              width: windowWidth - offset.left - scope.offset,
              display: 'block'
            });
            if(scope.fixHeight) {
              $(element).height($(element).find('> *').height());
            }
          });
          $(window).resize();
        }
      }
    }
  ]);

  app.directive('webDevice', [
    '$sce',
    function($sce) {
      return {
        restrict: 'E',
        scope: {
          src: '=',
          width: '=',
          height: '='
        },
        transclude: true,
        replace: true,
        template: '<div class="web-device-container"><div class="web-device-content"><iframe ng-src="{{url}}" frameborder="0"></iframe></div><ng-transclude></ng-transclude</div>',
        link: function(scope, element, attrs) {
          scope.$watch('src', function(src) {
            scope.url = $sce.trustAsResourceUrl(scope.src);
          });
          $(window).on('resize', function() {
            // setTimeout(function() {
              var pWidth = $(element).parent().width();
              var pRatio = pWidth/scope.width;
              $(element).css({
                width: scope.width * pRatio,
                height: scope.height * pRatio
              });
              var elRatio = $(element).find('.web-device-content').width()/scope.width;
              $(element).find('iframe').css({
                width: scope.width,
                height: scope.height,
                'transform-origin': 'top left',
                transform: 'scale(' + elRatio + ')',
                transition: 'all .2s linear',
              });
              // $(element).on('mouseenter', function() {
              //   $(element).find('iframe').css({
              //     transform: 'scale(' + elRatio + ')'
              //   });
              // });
              // $(element).on('mouseleave', function() {
              //   $(element).find('iframe').css({
              //     transform: 'scale(1)'
              //   });
              // });
            // }, 50);
          });
          $(window).resize();
        }
      }
    }
  ]);

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['mp']);
  });


})(window.angular, window.jQuery, window._);
