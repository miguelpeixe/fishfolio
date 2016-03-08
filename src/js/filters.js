(function(undefined) {

  module.exports = function(app) {

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

  }
  
})();
