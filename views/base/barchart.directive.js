angular.module('base')	
	.directive('barchart', ['$compile', '$parse', function($compile, $parse) {
    return {
        restrict: 'EC',
        link: function($scope, element, attrs) {
			var chartOptions = attrs.chartOptions;
			chartOptions = chartOptions != null && chartOptions != '' ? $scope[chartOptions] : null;
			if (chartOptions == null) {
				chartOptions = {
					//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
					scaleBeginAtZero: true,

					//Boolean - Whether grid lines are shown across the chart
					scaleShowGridLines: true,

					//String - Colour of the grid lines
					scaleGridLineColor: "rgba(0,0,0,.05)",

					//Number - Width of the grid lines
					scaleGridLineWidth: 1,

					//Boolean - Whether to show horizontal lines (except X axis)
					scaleShowHorizontalLines: true,

					//Boolean - Whether to show vertical lines (except Y axis)
					scaleShowVerticalLines: false,

					//Boolean - If there is a stroke on each bar
					//barShowStroke: true,

					//Number - Pixel width of the bar stroke
					//barStrokeWidth: 2,

					//Number - Spacing between each of the X value sets
					barValueSpacing: 10,

					//Number - Spacing between data sets within X values
					barDatasetSpacing: 1,

					//String - A legend template
					legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

				};
			}
			
			var chartData = attrs.chartData;
			if (chartData != null && chartData != '') {
				function value() { 
					return JSON.stringify($scope[attrs.chartData]); 
				}

				$scope.$watch(value, function() {
					var chartData = $scope[attrs.chartData];
					if (element[0].oldChart != null) {
						try{
							element[0].oldChart.destroy();
							element[0].oldChart = null;
						}catch(e){
						}
					}
					if (chartData != null) {
						var context = $(element[0]).get(0).getContext("2d");
						element[0].oldChart = new Chart(context).Bar(chartData, chartOptions);
					}
				});
			}
			
			var widthSelector = attrs.widthSelector;
			
			if (widthSelector != null && widthSelector != '') {
				$(element[0]).css('width', $(widthSelector).width() + 'px');
			}
        }
    }
}]); 
