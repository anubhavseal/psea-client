angular.module('security')
	.controller('security.signup.controller',['$scope', '$dataService', '$notifier', '$accessService', '$window', '$routeParams', '$loader', '$location', '$comboService', '$lookupService', 'availableTypes', '$constants', 
		function ($scope, $dataService, $notifier, $accessService, $window, $routeParams, $loader, $location, $comboService, $lookupService, availableTypes, $constants) {
			$scope.save = save;
			$scope.reset = resetForm;
			$scope.isNewUser = $routeParams.userId == null || $routeParams.userId == '' || $routeParams.userId == '_new';
			$scope.onChangeUserType = onChangeUserType;
			
			var functionId = $constants.Functions == null ? null : (availableTypes != null && availableTypes.indexOf("V") >= 0 ? $constants.Functions.ManageVendors : $constants.Functions.ManageUsers);
			$scope.saveAccess = functionId == null || $accessService.isFullAccess(functionId);
			var userId = $routeParams.userId;
			var activeUser = $accessService.getActiveUser();
			
			function init(){
				$loader.show();
				fetchUserTypes();
			}
			
			function getUserLevel(type){
				return {'V': 4, 'S': 3, 'A': 2, 'N': 1}[type] || 0;
			}

			function fetchUserTypes() {
				$lookupService.getByType('UserType', function(userTypes){
					var accessibleUserTypes = [];
					angular.forEach(userTypes, function(userType){
						if (availableTypes != null && availableTypes.length > 0 && availableTypes.indexOf(userType.lookupCode) == -1) {
							return;
						}
						if (activeUser.level >= getUserLevel(userType.lookupCode)){
							accessibleUserTypes.push(userType);
						}
					});
					$scope.userTypes = accessibleUserTypes;
					fetchProfiles();
				});
			}
			
			function onChangeUserType() {
				if ($constants.forceSingleAccess) {
					$scope.user.globalProfileVisible = $scope.user != null && $scope.user.userType != null  && $scope.user.userType.lookupCode == 'V';
					$scope.user.tenantSpecificProfileVisible = $scope.user != null && $scope.user.userType != null  && $scope.user.userType.lookupCode != 'V';
				} else {
					$scope.user.globalProfileVisible = true;
					$scope.user.tenantSpecificProfileVisible = true;
				}
			}
			
			function fetchProfiles() {
				$dataService.get('profiles?overrideSelectedTenant=true', function(profiles){
					$scope.allProfiles = profiles || [];
					$scope.profiles = filterProfiles(null);
					fetchTenants();
				});
			}
	
			function fetchTenants() {
				$dataService.get('tenants', function(tenants){
					tenants = tenants || [];
					var accessibleTenantIds = $accessService.getActiveUser().accessibleTenantIds || [];
					$scope.accessibleTenantCount = 0;
					angular.forEach(tenants, function(tenant){
						tenant.accessible = accessibleTenantIds.indexOf(tenant.tenantId) >= 0;
						tenant.profiles = filterProfiles(tenant.tenantId, true);
						
						if (tenant.accessible) {
							$scope.accessibleTenantCount++;
						}
					});
					$scope.tenants = tenants;
					
					resetForm();
				});
			}
			
			function filterProfiles(tenantId, optional) {
				var profiles = [];
				if (optional) {
					profiles.push({"profileId": null, "profileName": "Only Data Access"})
				}
				angular.forEach($scope.allProfiles, function(profile){
					if ((tenantId == null && profile.tenantId == null) || (tenantId != null && profile.tenantId == tenantId)) {
						profiles.push(profile);
					}
				});
				return profiles;
			}
			
			function resetForm() {
				if (!$scope.isNewUser) {
					$dataService.get('users/' + userId + '?' + (availableTypes  != null && availableTypes.length > 0 ? ('type.in=' + availableTypes.join(',')) : ''), 
						function(users){
							if (users == null || users.length == 0) {
								$notifier.error('Unable to find user.');
								return;
							}
							var user = users[0];
							
							$scope.user = user
							$scope.user.accountExpiry = $scope.user.accountExpiry == null ? null : new Date($scope.user.accountExpiry);
							
							$comboService.updateSelectedValues($scope.user, {
								'profile': {'key': 'profileId', 'data': $scope.profiles, 'mappedKey': 'profileId'},
								'userType': {'key': 'type', 'data': $scope.userTypes, 'mappedKey': 'lookupCode'}
							});
							
							var tenantMap = {};
							
							angular.forEach($scope.tenants, function(tenant){
								tenant.userAccess = false;
								tenantMap[tenant.tenantId] = tenant;
							});
							
							angular.forEach($scope.user.permissions || [], function(permission){
								if (permission == null || permission.type !== 'T'){
									return;
								}
								var tenant = tenantMap[permission.referenceId];
								if (tenant == null){
									return;
								}
								tenant.userAccess = tenant.userAccess || (permission.access == null || permission.access == '' || permission.access == 'R' || permission.access == 'A');
								tenant.profile = $comboService.selectRecord(permission.profileId, "profileId", tenant.profiles);
							});
							onChangeUserType();
							$loader.hide();
						}
					);
				} else {
					var today = new Date();
					today.setDate(today.getDate() + 15);
					today = new Date((today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear())
					$scope.user = {
						password: null,
						confirmPassword: null,
						sendActivationMail: true,
						email: null,
						accountExpiry : today
					};
					$scope.user.profile = $scope.profiles.length > 0 ? $scope.profiles[0] : null;
					$scope.user.userType = $scope.userTypes.length > 0 ? $scope.userTypes[0] : null;
					angular.forEach($scope.tenants, function(tenant){
						tenant.userAccess = tenant.accessible && $scope.accessibleTenantCount <= 1;
						if (tenant.accessible && tenant.profiles != null && tenant.profiles.length > 0 && $scope.accessibleTenantCount <= 1) {
							tenant.profile = tenant.profiles[0];
						}
					});
					onChangeUserType();
					$loader.hide();
				}				
			}
			
			function save(validForm) {
				if ($scope.user.userType == null && $scope.userTypes != null && $scope.userTypes.length > 0) {
					$notifier.error('Please select the user type.');
					return;
				}
				
				$scope.user.type = $scope.user.userType != null ? $scope.user.userType.lookupCode : $scope.user.type;
				
				if ($scope.user.profile == null && $scope.profiles != null && $scope.profiles.length > 0 && ($scope.user.type == 'V' && $constants.forceSingleAccess)) {
					$notifier.error('Please select the profile');
					return;
				}
				
				var user = $accessService.getActiveUser();
				if (user == null) {
					return;
				}
				
				var tenantPermissionOK = true;
				
				var permissions = [];
				angular.forEach($scope.tenants, function(tenant){
					if (!tenant.accessible) {
						return;
					}
					if(tenant.profile == null && tenant.userAccess && tenant.profiles != null && tenant.profiles.length > 0 && ($scope.user.type != 'V' && $constants.forceSingleAccess)) {
						$notifier.error('Please select the profile for tenant - ' + tenant.tenantName);
						tenantPermissionOK = false;
						return;
					}
					permissions.push({'type': 'T', 'referenceId': tenant.tenantId, 'access': tenant.userAccess ? 'A' : 'N', 'profileId': (tenant.profile == null ? null : tenant.profile.profileId)});
				});
				
				if (!tenantPermissionOK){
					return;
				}
				
				$scope.user.profileId = $scope.user.profile != null ? $scope.user.profile.profileId : $scope.user.profileId;
				
				if ($constants.forceSingleAccess) {
					if ($scope.user.type != 'V') {
						$scope.user.profileId = null;
					} else {
						angular.forEach(permissions, function(permission){
							if (permission.type == 'T') {
								permission.profileId = null;
							}
						});
					}
				}
				
				if ($scope.isNewUser) {
					if ($scope.user.password != null && $scope.user.password != '' && $scope.user.password != $scope.user.confirmPassword) {
						$notifier.error('Confirm password not matched.');
						return;
					}
					var today = new Date();
					if ($scope.user.accountExpiry < today){
						$notifier.error('Date Should be greater than today\'s date.');
						return;
					}
					
					$scope.user.agreementAccepted = !($scope.user.forceAcceptAgreement == null ? false : $scope.user.forceAcceptAgreement);
					
					$scope.user.createdByUserId = user.userId;
					$scope.user.permissions = permissions;
					$dataService.post(
						'users/signup', 
						$scope.user, 
						function(response) {
							if (response.status == 'error') {
								$notifier.error(response.err);
								return;
							}
							$notifier.success($scope.user.email + ' registered Successfully.');
							userId = response.userId;
							$scope.isNewUser = false;
							resetForm();
						}
					);
				} else {
					var user = {};
					user.name = $scope.user.name;
					user.email = $scope.user.email;
					user.profileId = $scope.user.profileId;
					user.type = $scope.user.type;
					user.accountExpiry = $scope.user.accountExpiry;
					$dataService.put(
						'users/' + $scope.user.userId, 
						user, 
						function(response) {
							if (response.status == 'error') {
								$notifier.error(response.err);
								return;
							}
							
							$dataService.put(
								'users/' + $scope.user.userId + '/permissions', 
								permissions, 
								function(response) {
									if (response.status == 'error') {
										$notifier.error(response.err);
										return;
									}
									
									$notifier.success($scope.user.email + ' updated Successfully.');
									resetForm();
								}
							);
						}
					);
				}
			}
			
			init();
		}
	]);