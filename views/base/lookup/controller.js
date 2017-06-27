'use strict';
angular.module('base')
	.controller('base.lookup.controller', ['$scope', '$modalInstance', '$loader', '$dataService', '$comboService', 'params', '$notifier', '$lookupConfigService', '$gridService', '$accessService', 
	function ($scope, $modalInstance, $loader, $dataService, $comboService, params, $notifier, $lookupConfigService, $gridService, $accessService) {
		var params = params || {};
		var functionId = params.functionId;

		$gridService.register($scope);
		$scope.handleActionClick = handleActionClick;
		$scope.cancel = cancel;
		
		function handleActionClick(actionControl){
			try{
				var action = actionControl.action;
				if (action == undefined || action == null) {
					action = angular.element(actionControl.target).data('action');
				}
				if (action) {
					eval(action);
				}
			} catch(e) {
				alert(e)
			}
		}
		
		function init() {
			$loader.show();
			var id = params.lookupConfigId || params.functionId;
			(params.lookupConfigId ? $lookupConfigService.get : $lookupConfigService.getByFunctionId)(id, loadLookupConfig);
		}
	
		function loadLookupConfig(lookupConfig) {
			lookupConfig = lookupConfig != null && lookupConfig.length > 0 ? lookupConfig[0] : {};
			$scope.modalCaption = "Configure Options - " + lookupConfig.caption;
			$scope.buttons = lookupConfig.buttons || $scope.buttons;
			$scope.lookupConfig = lookupConfig;
			fetchData();
		}
		
		function fetchData() {
			var url = $scope.lookupConfig.dataAPI;
			if ($scope.lookupConfig.tenantSpecific){
				var tenantId = $accessService.getSelectedTenant() == null ? -1 : $accessService.getSelectedTenant().tenantId;
				url = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'tenantId=' + tenantId;
			}
			$dataService.get(url, loadData);
		}
		
		function loadData(data) {
			$scope.data = data;
			$loader.hide();
		}
		
		function save(){
			$loader.show();
			$gridService.updateDisplaySequence($scope.data, $scope.lookupConfig.sequenceField);
			
			if ($scope.lookupConfig.tenantSpecific) {
				var tenantId = $accessService.getSelectedTenant() == null ? -1 : $accessService.getSelectedTenant().tenantId;
				angular.forEach($scope.data, function(record){
					record.tenantId = tenantId;
				});
			}
			
			$dataService.synchronize({	'apiURL' : $scope.lookupConfig.syncApi, 
										'data': $scope.data, 
										'primaryKeyField' : $scope.lookupConfig.primaryKeyField},
									function(response) {
										var errorCount = 0;
										for(var i=0; i<response.length; i++) {
											if (response[i].status === 'E') {
												errorCount++;
											}
										}
										if (errorCount === 0) {
											$modalInstance.dismiss('cancel');
											$loader.hide();
											$notifier.success('Saved successfully');
											return;
										}
										$notifier.error('Error occured...');
									});
		}
		
		function cancel() {
			$modalInstance.dismiss('cancel');
		}
		
		init();
	}]);