(function($, undefined) {

  module.exports = function(app) {

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

  }

})(window.jQuery);
