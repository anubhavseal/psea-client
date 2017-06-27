angular.module('base')	
	.directive('percentageDoughnut', ['$compile', '$parse', function($compile, $parse) {
    return {
        restrict: 'EC',
        link: function($scope, element, attrs) {
			function value() { 
				return JSON.stringify(attrs.percentage); 
			}

			$scope.$watch(value, function() {
				if (element[0].oldChart != null) {
					try{
						element[0].oldChart.destroy();
						element[0].oldChart = null;
					}catch(e){
					}
				}
				
				var percentage = attrs.percentage;
				if (percentage == null) {
					return;
				}
				try{
					percentage = parseInt('' + percentage);
				}catch(e) {
					percentage = null;
				}
				if (percentage == null) {
					return;
				}
				
				if (percentage > 100) {
					percentage = 100;
				} else if (percentage < 0) {
					percentage = 0;
				}
				
				var doughnutData = [{
					value: percentage,
					color: "#2ba3de",
					highlight: "#2ba3de",
					label: "Red"
				}, {
					value: 100 - percentage,
					color: "#e8e9ed",
					highlight: "#e8e9ed",
					label: "Green"
				}];
				var doughnutOptions = {
					segmentShowStroke: false,
					percentageInnerCutout: 80,
					showTooltips: false
				}
				
				var context = $(element[0]).get(0).getContext("2d");
				element[0].oldChart = new Chart(context).Doughnut(doughnutData, doughnutOptions);				
			});
				
			
        }
    }
}]); 
