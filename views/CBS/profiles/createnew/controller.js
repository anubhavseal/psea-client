var app = angular.module('cbs');

app.controller('cbs.profiles.createnew.controller',[ '$scope', '$accessService', '$dataService', '$modalInstance', '$notifier',  '$popup', '$loader', 'refreshProfileList', function($scope, $accessService, $dataService, $modalInstance, $notifier, $popup, $loader, refreshProfileList){
		$scope.save = save;
		
		function init(){
			$scope.profile = {
				'ownerId': $accessService.getUserId(),
				'profileType': 'EA'
			};
			
			$dataService.getFromCache('hierarchy?hierarchyType=525', function(districts){
				$scope.districts = districts || []; 
				$scope.profile.homeDistrict = districts.length > 0 ? districts[0] : null;
			});
			
			$popup.setCaption($scope, 'Create Profile');
			$popup.registerFunctions($scope, $modalInstance);
			$popup.addButton($scope, 'Save', '$scope.save()', 'btn-primary theme-btn-primary');
		}
		
		function save(){
			if ($scope.profile.cbSprofileName == null || $scope.profile.cbSprofileName == '') {
				$notifier.error('Please select profile name');
				return;
			}
			$scope.profile.homeHierarchyId = $scope.profile.homeDistrict == null ? null : $scope.profile.homeDistrict.hierarchyId;
			$scope.profile.eaespFlag = $scope.profile.profileType == 'EA';
			
			$loader.show();
			
			$dataService.post('CBSprofiles', $scope.profile, function(response){
				$loader.hide();
				$modalInstance.dismiss('ok');
				refreshProfileList();
			});
		}
	   
		init();
}]);