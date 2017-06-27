angular.module('security')
	.controller('security.childmenu.controller', ['$scope', '$dataService', '$notifier', '$accessService', '$constants', '$loader','$location', '$rootScope', 'parentFunctionCode', 'parentFunctionId', 
		function ($scope, $dataService, $notifier, $accessService, $constants, $loader, $location, $rootScope, parentFunctionCode, parentFunctionId) {
			$scope.functions = [];
			$scope.navigate = navigate;
			
			function init(){
				parentFunctionCode = parentFunctionCode || '';
				parentFunctionId = parentFunctionId || '';
				
				var functionId = (parentFunctionId == '' ? ($constants.Functions == null ? parentFunctionCode : ($constants.Functions[parentFunctionCode] || parentFunctionCode)) : parentFunctionId)  || -1;
				
				var parentFunction = $accessService.getAccessibleFunction(functionId);
				
				$scope.caption = parentFunction == null ? 'Not Accessible' : parentFunction.caption;
				
				var selectedModule = $accessService.getSelectedModule($rootScope);
				
				$dataService.get('functions?parentFunctionId=' + (parentFunction == null ? -1 : parentFunction.functionId), function(functions){
					angular.forEach(functions, function(funct){
						if (selectedModule != null && funct.modules != null && funct.modules.length > 0 && funct.modules.indexOf(selectedModule.moduleCode) == -1) {
							return;
						}
						if ($accessService.isHavingAccess(funct.functionId) && funct.type == "M") {
							$scope.functions.push(funct);
						}
					});
					
					$loader.hide();
				});
			}
			
			function navigate(funct){
				$location.path(funct.link);
			}
			
			init();
		}
	]);