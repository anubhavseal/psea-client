angular.module('base')
	.directive('toggleClass', function() {
		return {
				restrict: 'A',
				link: function(scope, element, attrs, $timeout) {
						element.bind('click', function() {
								angular.element('#navigation').toggleClass('expandedNav');
								element.toggleClass(attrs.toggleClass);
						});
				}
		};
});