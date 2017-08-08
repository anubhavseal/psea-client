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
'$notifier',
function($scope, $dataService, $accessService, $recentProfile, $moment, $loader, $popup,$cache,$notifier) {
	$scope.openCreateProfilePopup = openCreateProfilePopup;
	$scope.deleteProfile = deleteProfile;
	
	function init(){
		$loader.show();
		$scope.recentProfileIndicator = false;
		$dataService.get('CBSprofiles?ownerId='+ $accessService.getUserId(), function(profiles){
			profiles = profiles || [];
			$scope.profiles = profiles;

			var recentProfile = $recentProfile.get();
			if(recentProfile == null){
				$scope.recentProfileIndicator  = true
			}

			var mapProfile = {};
			var mapHierarchy = {};
			angular.forEach($scope.profiles,function(profile){
				mapProfile[profile.cbSprofileId] = profile;
			});
			
			$dataService.getFromCache('hierarchy',function(hierarchies){
				hierarchies = hierarchies || [];
				angular.forEach(hierarchies,function(hierarchy){
					mapHierarchy[hierarchy.hierarchyId] = hierarchy;
				});
				angular.forEach(mapProfile,function(profile){
				var hierarchy = mapHierarchy[profile.homeHierarchyId];
				if(hierarchy){
					profile.homeHierarchyName = hierarchy.hierarchyName;
				}
			})
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
		var numberOfProfiles = $scope.recentProfileIndicator  === true ? profiles.length - 1 : profiles.length;
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

	function deleteProfile(profile){	
		alertify.confirm("Are you sure you want to delete the profile",function (e) {
			if (e) {
				profile.active = false;
				$dataService.remove('CBSprofiles?cbSprofileId='+ profile.cbSprofileId,profile,function(response){
					$notifier.success("Profile Deleted Successfully")
					init();
				})
			}
		});  
	}
	init();	
}]);