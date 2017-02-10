(function(undefined) {

  module.exports = function(app) {

    app.factory('FFService', [
      '$firebaseObject',
      '$firebaseArray',
      function($firebaseObject, $firebaseArray) {
        return {
          getUniq: function(collection, parameter, split) {
            split = split || false;
            var all = [];
            collection.forEach(function(item) {
              var paramVals = [];
              if(item[parameter]) {
                if(split) {
                  item[parameter].split(split).forEach(function(val) {
                    paramVals.push(val.trim());
                  });
                } else {
                  paramVals.push(item[parameter]);
                }
              }
              all = all.concat(paramVals);
            });
            var obj = {};
            all.forEach(function(val) {
              obj[val] = obj[val] ? (obj[val]) + 1 : 1;
            });
            var tags = [];
            for(var tag in obj) {
              tags.push({
                name: tag,
                count: obj[tag]
              });
            }
            return tags;
          }
        };
      }
    ]);

  };

})();
