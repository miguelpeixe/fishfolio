(function(undefined) {

  module.exports = function(app) {

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

  };

})();
