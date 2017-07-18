var app = angular.module('cbs');

app.controller('cbs.profiles.list.controller', ['$scope', '$dataService', '$accessService', '$recentProfile', '$moment', '$loader', '$popup', function($scope, $dataService, $accessService, $recentProfile, $moment, $loader, $popup) {
	$scope.openCreateProfilePopup = openCreateProfilePopup;

	function init(){
		$loader.show();
		$dataService.get('CBSprofiles?ownerId='+ $accessService.getUserId(), function(profiles){
			profiles = profiles || [];
			var recentProfile = $recentProfile.get();
			if (recentProfile == null && profiles.length > 0) {
				recentProfile = profiles[0];
			}
			$recentProfile.set(recentProfile);
			$recentProfile.show($scope);
			
			$scope.profiles = profiles;
			$loader.hide();
		});
	}

	function openCreateProfilePopup(){
		$popup.open('/views/CBS/profiles/createnew/view', 'cbs.profiles.createnew.controller', {'refreshProfileList': init}, 'md');
	}

	init();
}]);