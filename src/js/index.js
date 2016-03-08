(function(angular, $, _, undefined) {

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
        url: '/projects/:projectId',
        controller: 'ProjectCtrl',
        templateUrl: 'views/project.html'
      });

    }
  ]);

  app.factory('FFService', [
    '$firebaseObject',
    '$firebaseArray',
    function($firebaseObject, $firebaseArray) {
      return {
        'FFProject': $firebaseObject.$extend({
          getTags: function() {
            var tags = this.tags.split(',');
            tags.forEach(function(tag) {
              tag = tag.trim();
            });
            return tags;
          }
        })
      };
    }
  ]);

  app.controller('SiteCtrl', [
    '$scope',
    '$state',
    'firebase',
    '$firebaseArray',
    '$firebaseObject',
    'FFService',
    '$firebaseAuth',
    'ngDialog',
    '$http',
    function($scope, $state, firebase, $firebaseArray, $firebaseObject, FF, $firebaseAuth, ngDialog, $http) {

      var ref = new Firebase(firebase);
      $scope.authObj = $firebaseAuth(ref);

      // Check auth
      $scope.$watch(function() {
        return $scope.authObj.$getAuth();
      }, function(auth) {
        $scope.user = auth;
      });

      $scope.$on('$stateChangeSuccess', function(ev, toState, toParams) {
        if(toParams.projectId) {
          $scope.viewingProject = toParams.projectId;
        } else {
          $scope.viewingProject = false;
        }
      });

      $scope.login = function() {
        $scope.authDialog = ngDialog.open({
          template: 'views/login.html',
          controller: 'AuthCtrl'
        });
      };

      $scope.$on('logged.in', function() {
        if($scope.authDialog) {
          $scope.authDialog.close();
          $scope.authDialog = null;
        }
      });

      var projects = new Firebase(firebase + '/projects');
      $scope.projects = $firebaseArray(projects);

      $scope.projects.$loaded().then(function(projects) {
        projects.forEach(function(project) {
          if(project.github) {
            $http.get('https://api.github.com/repos/'+ project.github + '/stats/commit_activity').then(function(data) {
              project.commitActivity = data.data;
              project.totalCommits = 0;
              data.data.forEach(function(week) {
                project.totalCommits += week.total;
              });
            });
          }
        });
      });

      var about = new Firebase(firebase + '/about');
      $scope.about = $firebaseObject(about);

      $scope.settings = function() {
        $scope.aboutDialog = ngDialog.open({
          template: 'views/settings.html',
          scope: $scope
        });
      };

      $scope.new = function() {
        $scope.project = {};
        $scope.editDialog = ngDialog.open({
          template: 'views/project-edit.html',
          scope: $scope
        });
      };

      $scope.edit = function(project) {
        if(typeof project.$save !== 'function') {
          var project = new Firebase(firebase + '/projects/' + project.$id);
          $scope.project = $firebaseObject(project);
        } else {
          $scope.project = project;
        }
        $scope.editDialog = ngDialog.open({
          template: 'views/project-edit.html',
          scope: $scope
        });
      }

      $scope.remove = function(project) {
        if(confirm('Are you sure?')) {
          $scope.projects.$remove(project);
        }
      }

    }
  ]);

  app.controller('AuthCtrl', [
    'firebase',
    '$rootScope',
    '$scope',
    '$firebaseAuth',
    function(firebase, $rootScope, $scope, $firebaseAuth) {

      var ref = new Firebase(firebase);
      $scope.authObj = $firebaseAuth(ref);

      $scope.auth = function(credentials) {
        $scope.authObj.$authWithPassword(credentials).then(function(data) {
          $rootScope.$broadcast('logged.in');
          console.log('Logged in as: ' + data.uid);
        }, function(err) {
          console.log('Auth failed: ' + err);
        });
      };

    }
  ]);

  app.controller('ProjectCtrl', [
    '$scope',
    '$stateParams',
    'firebase',
    '$firebaseObject',
    'ngDialog',
    '$http',
    function($scope, $stateParams, firebase, $firebaseObject, ngDialog, $http) {

      var project = new Firebase(firebase + '/projects/' + $stateParams.projectId);
      $scope.project = $firebaseObject(project);

      $scope.project.$loaded().then(function(project) {
        if(project.github) {
          $http.get('https://api.github.com/repos/'+ project.github + '/stats/commit_activity').then(function(data) {
            project.commitActivity = data.data;
            project.totalCommits = 0;
            data.data.forEach(function(week) {
              project.totalCommits += week.total;
            });
          });
        }
      });
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

  app.directive('ghChart', [
    '$timeout',
    function($timeout) {
      return {
        restrict: 'E',
        scope: {
          data: '=',
          backgroundColor: '=',
          lineColor: '=',
          width: '=',
          height: '=',
          tooltip: '=',
          full: '='
        },
        replace: true,
        template: '<div></div>',
        link: function(scope, element, attrs) {

          $(element).addClass('gh-chart').highcharts({
            chart: {
              type: 'spline',
              backgroundColor: scope.backgroundColor || '#333',
              width: scope.width,
              height: scope.height,
              renderTo: 'gh-chart',
              events: {
                load: function() {

                  var series = this.series[0];

                  scope.$watch('data', function(data) {
                    var d = [];
                    if(data) {
                      data.forEach(function(item) {
                        d.push([
                          new Date(item.week * 1000).toISOString(),
                          item.total
                        ]);
                      });
                    }
                    series.setData(d);
                  });

                }
              }
            },
            title: false,
            subtitle: false,
            tooltip: {
              enabled: scope.tooltip,
              followPointer: true,
              backgroundColor: scope.backgroundColor || null,
              borderRadius: 0,
              shadow: false,
              style: {
                color: scope.lineColor
              }
            },
            legend: {
              enabled: false,
              color: scope.lineColor
            },
            credits: {
              enabled: false
            },
            xAxis: {
              type: 'datetime',
              dateTimeLabelFormats: {
                month: '%e. %b',
                year: '%b'
              },
              title: 'Date',
              tickInterval: 7 * 24 * 3600 * 1000, // 1 week
              tickWidth: 0,
              visible: false
            },
            yAxis: {
              min: 0,
              title: 'Commits',
              visible: false
            },
            series: [{
              lineWidth: 1,
              marker: {
                enabled: false
              },
              name: 'Commits',
              color: scope.lineColor || null,
              data: []
            }]
          });
        }
      }
    }
  ]);

  app.filter('commaSplit', [
    function() {
      return function(input) {
        input = input || '';
        arr = input.split(',');
        arr.forEach(function(item) {
          item = item.trim();
        });
        return arr;
      }
    }
  ])

  app.filter('toHtml', [
    '$sce',
    function($sce) {
      return function(input) {
        input = input || '';
        return $sce.trustAsHtml(input);
      }
    }
  ]);

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['fishfolio']);
  });


})(window.angular, window.jQuery, window._);
