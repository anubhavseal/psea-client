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
'$navigation',
function($scope, $dataService, $accessService, $recentProfile, $moment, $loader, $popup,$cache,$notifier,$navigation) {
	console.log($navigation);
	$scope.openCreateProfilePopup = openCreateProfilePopup;
	$scope.deleteProfile = deleteProfile;
	$scope.profilesPlaceholder = [{},{},{},{},{},{},{},{},{}]
	$scope.profiles = []
	console.log('list');
	function init(){
		//$loader.show();
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
				profile.lastAccessedTime = profile.lastAccessedAt + "Z";
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
			//$loader.hide();
		});	

	}
	function openCreateProfilePopup(){
		$popup.open('/views/CBS/profiles/createnew/view', 'cbs.profiles.createnew.controller', {'refreshProfileList': init}, 'md');
	}
	
	function paginate(){
		var profiles = $('.panel-profile-tile');
		var numberOfProfiles = $scope.recentProfileIndicator === true ? profiles.length - 1 : profiles.length;
		$scope.numberOfProfiles = numberOfProfiles;
		//console.log($('.psea-content-container').height()/4);
		console.log('tile',$('.panel-profile-tile').outerHeight(true));
		var a = $('.panel-profile-tile').outerHeight(true);
		console.log(Math.floor($('.psea-content-container').height()/a));
		var perPage	= Math.floor($('.psea-content-container').height()/a)*4;
		//var perPage = 9;
		profiles.slice(perPage).hide();
		$('#pagination').pagination({
				items:numberOfProfiles,
				itemsOnPage:perPage,
				cssStyle:"compact-theme",
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
				$dataService.put('CBSprofiles?cbSprofileId='+ profile.cbSprofileId,profile,function(response){
					$notifier.success("Profile Deleted Successfully");
					init();
				});
			}
		});  
	}

	//setTimeout(init,150000);
	init();	
}]);