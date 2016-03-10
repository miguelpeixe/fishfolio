(function(_, undefined) {

  module.exports = function(app) {

    app.filter('byCommaTags', [
      function() {
        return function(input, tag, key) {
          if(!input || !tag || !key) {
            return input;
          } else {
            _.filter(input, function(item) {
              return _.find(item[key].split(','), function(t) {
                return t.trim() == tag;
              });
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
    ]);

    app.filter('toHtml', [
      '$sce',
      function($sce) {
        return function(input) {
          input = input || '';
          return $sce.trustAsHtml(input);
        }
      }
    ]);

  }

})(window._);
