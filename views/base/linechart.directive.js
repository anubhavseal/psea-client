angular.module('base')	
	.directive('linechart', ['$compile', '$parse', function($compile, $parse) {
    return {
        restrict: 'EC',
        link: function($scope, element, attrs) {
			var chartOptions = attrs.chartOptions;
			chartOptions = chartOptions != null && chartOptions != '' ? $scope[chartOptions] : null;
			if (chartOptions == null) {
				chartOptions = {

					///Boolean - Whether grid lines are shown across the chart
					scaleShowGridLines: true,

					//String - Colour of the grid lines
					scaleGridLineColor: "#edeef1",

					//Number - Width of the grid lines
					scaleGridLineWidth: 1,

					//Boolean - Whether to show horizontal lines (except X axis)
					scaleShowHorizontalLines: true,

					//Boolean - Whether to show vertical lines (except Y axis)
					scaleShowVerticalLines: false,

					//Boolean - Whether the line is curved between points
					bezierCurve: false,

					//Number - Tension of the bezier curve between points
					bezierCurveTension: 0.4,

					//Boolean - Whether to show a dot for each point
					pointDot: true,

					//Number - Radius of each point dot in pixels
					pointDotRadius: 4,

					//Number - Pixel width of point dot stroke
					pointDotStrokeWidth: 2,

					//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
					pointHitDetectionRadius: 20,

					//Boolean - Whether to show a stroke for datasets
					datasetStroke: true,

					//Number - Pixel width of dataset stroke
					datasetStrokeWidth: 2,

					//Boolean - Whether to fill the dataset with a colour
					datasetFill: false,

					//String - A legend template
					legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

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
						element[0].oldChart = new Chart(context).Line(chartData, chartOptions);
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
