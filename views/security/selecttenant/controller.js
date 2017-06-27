angular.module('security')
	.controller('security.selecttenant.controller', ['$scope', '$notifier', '$dataService', '$accessService', '$rootScope', 
		function ($scope, $notifier, $dataService, $accessService, $rootScope) {
			$scope.tenants = [];
			$scope.selectTenant = selectTenant; 
			$scope.proceed = proceed;
			$scope.isTenantSelected = isTenantSelected;
			
			function init(){
				$scope.selectedTanant = $accessService.getSelectedTenant();
				var selectableTenantIds = $accessService.getSelectableTenantIds();
				$dataService.get('tenants', function(tenants){				  
					$scope.tenants = [];
					angular.forEach(tenants, function(tenant){
						if (selectableTenantIds.indexOf(tenant.tenantId) == -1) {
							return;
						}
						$scope.tenants.push(tenant);
						tenant.selected = $scope.selectedTanant != null && $scope.selectedTanant.tenantId == tenant.tenantId;
						if (tenant.selected) {
							$scope.selectedTanant = tenant;
						}
					});
					if ($scope.tenants.length == 1) {
						selectTenant($scope.tenants[0]);
						proceed();
					}
				});
			}
			
			function isTenantSelected() {
				return $scope.selectedTanant != null;
			}
			
			function selectTenant(tenant){
				if ($scope.selectedTanant != null){
					$scope.selectedTanant.selected = false;
				}
				$scope.selectedTanant = tenant;
				tenant.selected = true;
			}
			
			function proceed() {
				if (!isTenantSelected()) {
					$notifier.error('Please select tenant to go ahead.')
					return;
				}
				$accessService.setSelectedTenant($scope.selectedTanant, $rootScope);
				$accessService.proceedAhead();
			}
			
			init();
}]);

