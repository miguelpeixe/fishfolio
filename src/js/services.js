(function(undefined) {

  module.exports = function(app) {

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

  };

})();
