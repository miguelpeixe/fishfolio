(function(undefined) {

  module.exports = function(app) {

    app.controller('SiteCtrl', [
      '$scope',
      '$state',
      '$firebaseArray',
      '$firebaseObject',
      'FFService',
      '$firebaseAuth',
      'ngDialog',
      '$http',
      function($scope, $state, $firebaseArray, $firebaseObject, FF, $firebaseAuth, ngDialog, $http) {

        var ref = firebase.database().ref();
        $scope.authObj = $firebaseAuth();

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

        $scope.filtered = {};

        $scope.filterProject = function(key, val) {
          $scope.filtered[key] = val;
        };

        var projects = firebase.database().ref().child('projects');
        $scope.projects = $firebaseArray(projects);

        $scope.ghData = {};

        $scope.totalCommits = function(project) {
          var total;
          if($scope.ghData[project.$id])
            total = $scope.ghData[project.$id].totalCommits;
          return total;
        }

        $scope.projects.$loaded().then(function(projects) {
          projects.forEach(function(project) {
            if(project.github) {
              $scope.ghData[project.$id] = {};
              $http.get('https://api.github.com/repos/'+ project.github + '/stats/commit_activity').then(function(data) {
                $scope.ghData[project.$id].commitActivity = data.data;
                $scope.ghData[project.$id].totalCommits = 0;
                data.data.forEach(function(week) {
                  $scope.ghData[project.$id].totalCommits += week.total;
                });
              });
            }
          });
        });

        $scope.projects.$watch(function() {
          $scope.tags = FF.getUniq($scope.projects, 'tags', ',');
          $scope.skills = FF.getUniq($scope.projects, 'skills', ',');
        });

        var about = firebase.database().ref().child('about');
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
            var project = firebase.database().ref().child('projects').child(project.$id);;
            $scope.project = $firebaseObject(project);
          } else {
            $scope.project = project;
          }
          $scope.editDialog = ngDialog.open({
            template: 'views/project-edit.html',
            scope: $scope
          });
        };

        $scope.remove = function(project) {
          if(confirm('Are you sure?')) {
            $scope.projects.$remove(project);
          }
        };

      }
    ]);

    app.controller('AuthCtrl', [
      'firebase',
      '$rootScope',
      '$scope',
      '$firebaseAuth',
      function(firebase, $rootScope, $scope, $firebaseAuth) {

        var ref = firebase.database().ref();
        $scope.authObj = $firebaseAuth();

        $scope.auth = function(credentials) {
          $scope.authObj.$signInWithEmailAndPassword(credentials.email, credentials.password).then(function(data) {
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
      '$firebaseObject',
      'ngDialog',
      '$http',
      function($scope, $stateParams, $firebaseObject, ngDialog, $http) {

        var project = firebase.database().ref().child('projects').child($stateParams.projectId);
        $scope.project = $firebaseObject(project);

        $scope.project.$loaded().then(function(project) {
          if(project.github) {
            $http.get('https://api.github.com/repos/'+ project.github + '/stats/commit_activity').then(function(data) {
              $scope.commitActivity = data.data;
              $scope.totalCommits = 0;
              data.data.forEach(function(week) {
                $scope.totalCommits += week.total;
              });
            });
          }
        });
      }
    ]);

  };

})();
