angular.module('base')	
	.directive('toggle', function(){
		return {
			restrict: 'A',
			link: function(scope, element, attrs){
				if (attrs.toggle === 'tooltip') {
					$(element).hover(function(){
						// on mouseenter
						$(element).tooltip('show');
					}, function(){
						// on mouseleave
						$(element).tooltip('hide');
					});
				}
			}
		};
	});	