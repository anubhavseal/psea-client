'use strict';

angular.module('base')
	.controller('base.help.modal.controller', ['$scope', '$modalInstance', '$helpContent', 'params',
	function ($scope, $modalInstance, $helpContent, params) {
		var params = params || {};
		$scope.cancel = cancel;
		
		
		function init() {
			$helpContent.get(params.groupId, params.controlId, function(helpContents){
				var helpContent = null;
				try{
					helpContent = helpContents[0].content;
				}catch(e){
				}
				
				helpContent = helpContent == null ? 'Unable to find help content. Please contact administrator to configure the content for <P class="mandatory"><B>Group{' + params.groupId + '}, Control{' + params.controlId + '}</B></P>' : helpContent;
				
				$scope.helpContent = helpContent;
			});
		}

		function cancel() {
			$modalInstance.dismiss('cancel');
		};
		
		init();
	}]);