angular.module('base')
	.directive('helpText', ['$helpContent', '$modal', function($helpContent, $modal){
	return {
		restrict: 'A',
		link: function(scope, element, attrs){
			var fncShowHelp = function(interpolatedValue) {
				var groupId = attrs.helpGroupId;
				var controlId = attrs.helpControlId;
				var style = attrs.helpStyle || '';
				var helpSize = attrs.helpSize || 'lg';
				$helpContent.get(groupId, controlId, function(helpContents){
					var helpContent = null;
					try{
						helpContent = helpContents[0].content;
					}catch(e){
					}
					
					if (helpContent == null || helpContent == '') {
						element.hide();
						return null;
					} else {
						element.show();
					}
					
					element.html('<span style="cursor:pointer;' + style + '" class="helptext"><i class="fa fa-info-circle fa-2x"></i></span>');
					
					element.on('click', function(templateURL, templateController, inputParams, size){
						$modal.open({
							templateUrl: '/views/base/help/view',
							controller: 'base.help.modal.controller',
							size: helpSize,
							resolve: {
								params: function () {
									return {'groupId': groupId, 'controlId': controlId};
								}
							}
						});
					});
				});
            };
			
			attrs.$observe('helpGroupId', fncShowHelp);
		}
	};
}]);