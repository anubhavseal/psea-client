var app = angular.module('cbs');

app.controller('cbs.profiles.list.controller', [
'$scope',
'$dataService',
'$accessService',
'$recentProfile',
'$moment',
'$loader',
'$popup',
'$cache',
function($scope, $dataService, $accessService, $recentProfile, $moment, $loader, $popup,$cache) {
	$scope.openCreateProfilePopup = openCreateProfilePopup;
	function init(){
		$loader.show();
		$dataService.get('CBSprofiles?ownerId='+ $accessService.getUserId(), function(profiles){
			profiles = profiles || [];
			$scope.profiles = profiles;
			
			var mapProfile = {};
			angular.forEach($scope.profiles,function(profile){
				mapProfile[profile.homeHierarchyId] = profile;
			});
			
			$dataService.getFromCache('hierarchy',function(hierarchies){
				hierarchies = hierarchies || [];
				angular.forEach(hierarchies,function(hierarchy){
					var profile = mapProfile[hierarchy.hierarchyId];
					if(profile){
						profile.homeHierarchyName = hierarchy.hierarchyName;
					}
				});

				var recentProfile = $recentProfile.get();
				if (recentProfile == null && $scope.profiles.length > 0) {
					recentProfile = $scope.profiles[0];
				}
				$recentProfile.set(recentProfile);
				$recentProfile.show($scope);	
				});
			
			

			setTimeout(paginate,5);
			$loader.hide();
			
		});	
	}
	function openCreateProfilePopup(){
		$popup.open('/views/CBS/profiles/createnew/view', 'cbs.profiles.createnew.controller', {'refreshProfileList': init}, 'md');
	}
	
	function paginate(){
		var profiles = $('.panel-profile-tile');
		var numberOfProfiles = profiles.length;
		var perPage = 9;
		profiles.slice(perPage).hide();
		$('#pagination').pagination({
				items:numberOfProfiles,
				itemsOnPage:perPage,
				cssStyle:"dark-theme",
				onPageClick: function(pageNumber){
					var showFrom = perPage * (pageNumber - 1);
					var showTo = showFrom + perPage;
					profiles.hide()
							.slice(showFrom, showTo).show();
				}
		})
	}

	init();
}]);