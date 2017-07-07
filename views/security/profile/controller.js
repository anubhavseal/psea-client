'use strict';
angular.module('security')
	.controller('security.profile.controller', ['$scope', '$notifier', '$loader', '$dataService', '$tree', '$routeParams', '$accessService', '$constants', 'tenantSpecific', '$comboService', 
		function ($scope, $notifier, $loader, $dataService, $tree, $routeParams, $accessService, $constants, tenantSpecific, $comboService) {
		var profileId = $routeParams.profileId;
		$scope.isNew = false;
		$scope.save = save;
		$scope.setAccess = setAccess;
		$scope.headerReadAccess = false;
		$scope.headerWriteAccess = false;
		$scope.tenantSpecific = tenantSpecific;
		$scope.onChangeTenant = onChangeTenant;
		var functionId = $constants.Functions == null ? null : (tenantSpecific && tenantSpecific !== 'both' ? $constants.Functions.ManageTenantSpecificProfile : $constants.Functions.ManageGlobalProfile);
		$scope.saveAccess = functionId == null || $accessService.isFullAccess(functionId);
		var activeUser = $accessService.getActiveUser();
		
		function fetchTenants() {
			$loader.show();
			$dataService.get('tenants', function(tenants){
				tenants = tenants || [];
				var accessibleTenants = [{"tenantId": null, "tenantName": "[Global Profile]"}];
				var accessibleTenantIds = $accessService.getActiveUser().accessibleTenantIds || [];
				angular.forEach(tenants, function(tenant){
					if (accessibleTenantIds.indexOf(tenant.tenantId) >= 0) {
						accessibleTenants.push(tenant);
					}
				});
				$scope.tenants = accessibleTenants;
				
				fetchModules();
			});
		}
		
		function fetchModules() {
			$dataService.get('modules', function(modules){
				var moduleCodes = []
				angular.forEach(modules, function(module){
					if (tenantSpecific !== 'both' && module.tenantDependent !== (tenantSpecific == null ? true : tenantSpecific)) {
						return;
					}
					moduleCodes.push(module.moduleCode);
				});
				$scope.modules = modules;
				fetchFunction(moduleCodes);
			});
		}
		
		function fetchFunction(moduleCodes){
			$dataService.get('functions', function(functions){
				var availableFunctions = [];
				angular.forEach(functions, function(funct){
					if (funct.modules != null && funct.modules.length > 0) {
						var moduleNotAvailable = true;
						
						angular.forEach(moduleCodes, function(moduleCode){
							if (funct.modules.indexOf(moduleCode) >= 0){
								moduleNotAvailable = false;
							}
						});
						
						if (moduleNotAvailable) {
							return;
						}
					}
					availableFunctions.push(funct);
				});
				
				$scope.availableFunctions = availableFunctions;
				
				fetchProfile(availableFunctions);
			});
		}

		function fetchProfile(functions){
			var newProfile = {'profileId': null, 'profileName' : '', 'accessibleFunction': []};
			if (profileId == null || profileId == '' || profileId == '_new') {
				setProfile(newProfile, functions);
				$scope.isNew = true;
			} else {
				$dataService.get('profiles/' + $routeParams.profileId + (tenantSpecific || tenantSpecific === 'both' ? "" : "?overrideselectedtenant=Y"), function(profiles){
					if (profiles == null || profiles.length < 1 || (tenantSpecific != null && tenantSpecific !== 'both' && tenantSpecific != profiles[0].tenantSpecific)) {
						$notifier.error('Profile not available or accessible.');
						$scope.saveAccess = false;
						$loader.hide();
						return;
					}
					setProfile(profiles[0], functions);
				});
			}
		}
		
		function onChangeTenant() {
			var functions = null;
			var tenantDependent = null;
			if (tenantSpecific === 'both') {
				var selectedTenantId = $scope.profile != null && $scope.profile.selectedTenant != null ? $scope.profile.selectedTenant.tenantId : null;
				tenantDependent = (selectedTenantId != null && selectedTenantId != '');
			} else {
				tenantDependent = tenantSpecific == true ? true : false;
			}
			
			var moduleCodes = [];
			angular.forEach($scope.modules, function(module){
				if (module.tenantDependent !== tenantDependent || module.moduleCode == null) {
					return;
				}
				moduleCodes.push(module.moduleCode);
			});
			
			var availableFunctions = [];
			angular.forEach($scope.profileFunctions, function(funct){
				if (funct.modules != null && funct.modules.length > 0) {
					var moduleNotAvailable = true;
					
					angular.forEach(moduleCodes, function(moduleCode){
						if (funct.modules.indexOf(moduleCode) >= 0){
							moduleNotAvailable = false;
						}
					});
					
					if (moduleNotAvailable) {
						return;
					}
				}
				availableFunctions.push(funct);
			});
			
			functions = availableFunctions;
			
			$scope.functions = $tree.convert(functions, 'functionId', 'parentFunctionId', 'children');
		}
		
		function setProfile(profile, functions) {
			profileId = profile.profileId;
			angular.forEach(functions, function(funct){
				funct.accessible = funct.accessibleTo == null || funct.accessibleTo.length == 0 || funct.accessibleTo.indexOf(activeUser.type) >= 0;
			});
			angular.forEach(profile.accessibleFunctions || [], function(accessibleFunction){
				if (accessibleFunction.functionId == null) {
					accessibleFunction = {'functionId': accessibleFunction, 'access': 'A'};
				}
				angular.forEach(functions, function(funct){
					if (accessibleFunction.functionId === funct.functionId) {
						funct.access = accessibleFunction.access;
						funct.readAccess = funct.access === 'R' || funct.access === 'W' || funct.access === 'A';
						funct.writeAccess = funct.access === 'W' || funct.access === 'A';
						funct.accessibleFunctionId = accessibleFunction.accessibleFunctionId;
					}
				});
			});
			
			profile.selectedTenant = $comboService.selectRecord(profile.tenantId, "tenantId", $scope.tenants);
			if (tenantSpecific === 'both' && profile.selectedTenant == null) {
				profile.selectedTenant = $scope.tenants[0];
			}
			$scope.profile = profile;
			$scope.profileFunctions = functions;
			onChangeTenant()
			$loader.hide();
		}

		function setAccess(selectedNode, type) {
			$loader.show();
			var propValue = null;
			var prop = type === 'R' ? 'readAccess' : 'writeAccess';
			if (selectedNode == null) {
				selectedNode = $scope.functions;
				propValue = type === 'R' ? $scope.headerReadAccess : $scope.headerWriteAccess;
			} else {
				propValue = type === 'R' ? selectedNode.readAccess : selectedNode.writeAccess;
			}
			
			$tree.forEach(selectedNode, function(node){
				if (!node.accessible) {
					return;
				}
				if (type === 'R') {
					node.readAccess = propValue;
					if (!propValue) {
						node.writeAccess = false;
					}
				} else {
					node.writeAccess = propValue;
					if (propValue) {
						node.readAccess = true;
					}
				}
			});
			$loader.hide();
		}
		
		function prepareProfileFunctions(profileId) {
			var accessibleFunction = [];
			$tree.forEach($scope.functions, function(node){
				if (node.readAccess || node.writeAccess) {
					accessibleFunction.push(
						{
						'functionId' : node.functionId, 
						'access' : node.writeAccess ? 'A' : 'R'});
				}
			});
			return accessibleFunction;
		}
		
		function save() {
			$loader.show();
			var profile = {'profileName': $scope.profile.profileName};
			profile.accessibleFunctions = prepareProfileFunctions(profileId);
			var url = 'profiles' + ($scope.isNew ? '' : '/' + profileId);
			var operation = ($scope.isNew ? $dataService.post : $dataService.put);
			if ($scope.isNew && tenantSpecific === 'both') {
				profile.tenantId = profile.selectedTenant == null ? null : profile.selectedTenant.tenantId;
			} else if ($scope.isNew && tenantSpecific === true) {
				profile.tenantId = $accessService.getSelectedTenant() != null ? $accessService.getSelectedTenant().tenantId : null;
			}
			operation(url, profile, function(data){
				$loader.hide();
				$notifier.success('Profile saved successfully!!!');
				profileId = data.profileId || $routeParams.profileId;
				fetchProfile($scope.availableFunctions);
			}, function(err){
				$loader.hide();
				$notifier.error('Error occured while saving profile!!!');
				console.log(err);
			});
		}
		
		fetchTenants();
	}]);