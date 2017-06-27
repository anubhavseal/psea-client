angular.module('base')
	.controller('base.template.controller', 
		function ($scope, $modalInstance, params, $notifier) {
			params.callback = params.callback || function(html) {};
			$scope.saveAccess = params.readOnly != null && params.readOnly === true ? false : true;
			$scope.formattedHTML = params.formattedHTML === false ? false : true;
			$scope.editcontent = params.sourceHTML == 'Define Template' ? '' : params.sourceHTML;
			$scope.modalCaption = params.caption || 'Define Template';
			
			$scope.templates = params.templates || [];
			
			function typeInTextarea(el, newText) {
				CKEDITOR.instances["modifiedHTMLContent"].insertText(newText);
                return;
			}
			
			$scope.insertTemplate = function(template) {
				typeInTextarea($("#modifiedHTMLContent"), template.value);
			};
			
			$scope.ok = function () {
				if (!$scope.saveAccess) {
					$notifier.error('No access to update the configuration.');
					return;
				}
				
				params.callback($scope.editcontent);
				$modalInstance.close();
				return;
			};
			
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
			
			
		});