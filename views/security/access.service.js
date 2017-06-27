'use strict';
angular.module('security').factory('$accessService', ['$constants', '$log', '$dataService', '$cache', '$moment', '$notifier', '$operationService', '$window',
	function($constants, $log, $dataService, $cache, $moment, $notifier, $operationService, $window){
		return {
			isHavingAccess: isHavingAccess,
			isReadAccess: isReadAccess,
			isFullAccess: isFullAccess,
			isMenu: isMenu,
			getAccessibleFunction: getAccessibleFunction,
			getProfile: getProfile,
			getUserId: getUserId,
			getFilter: getFilter,
			getAPIFilterQS: getAPIFilterQS,
			getUsers: getUsers,
			getUserById: getUserById,
			getActiveUser: getActiveUser,
			isActiveUserVendor: isActiveUserVendor,
			isActiveUserAdministrator: isActiveUserAdministrator,
			clearSession: clearSession,
			setActiveUser: setActiveUser,
			isRouteAccessible: isRouteAccessible,
			checkAccessiblity: checkAccessiblity,
			registerFunctions: registerFunctions,
			checkAccess: checkAccess,
			getSelectedTenant: getSelectedTenant,
			setSelectedTenant: setSelectedTenant,
			setSelectedModule: setSelectedModule,
			getSelectedModule: getSelectedModule,
			getUserPermissions: getUserPermissions,
			proceedAhead: proceedAhead,
			refreshActiveUser: refreshActiveUser,
			getAccessibleTenants: getAccessibleTenants,
			getSelectableTenants: getSelectableTenants,
			getSelectableTenantIds: getSelectableTenantIds, 
			getTenantProfile: getTenantProfile
		};
		
		function setSelectedModule($rootScope, module) {
			if ($rootScope != null) {
				$rootScope.selectedModule = module;
			}
			$cache.session.put('security', 'module', $rootScope.selectedModule);			
			setAccessibleProfile();
			renderMenu($rootScope);
		}
		
		function getSelectedModule($rootScope) {
			var selectedModule = null;
			if ($rootScope != null) {
				selectedModule = $rootScope.selectedModule;
			}
			if (selectedModule == null){
				selectedModule = $cache.session.get('security', 'module');
			}
			return selectedModule;
		}
		
		function getSelectedTenant() {
			var module = getSelectedModule();
			if (module != null && !module.tenantDependent){
				return null;
			}

			return $cache.session.get('security', 'tenant');
		}
		
		function getSelectableTenantIds() {
			var selectableTenantIds = [];
			var selectableTenants = getSelectableTenants();
			for(var i=0; i<selectableTenants.length; i++) {
				selectableTenantIds.push(selectableTenants[i].tenantId);
			}
			return selectableTenantIds;
		}
		
		function getSelectableTenants() {
			var selectableTenants = [];
			
			var user = getActiveUser();
			for(var i=0; user != null && user.accessibleTenants != null && i<user.accessibleTenants.length; i++) {
				var accessibleTenant = user.accessibleTenants[i] || {};
				if (accessibleTenant.profile != null && accessibleTenant.profile.accessibleFunctions != null && accessibleTenant.profile.accessibleFunctions.length > 0) {
					selectableTenants.push(accessibleTenant);
				}
			}
			return selectableTenants;
		}
		
		function getTenantProfile(tenantId) {
			var user = getActiveUser();
			for(var i=0; user != null && user.accessibleTenants != null && i<user.accessibleTenants.length; i++) {
				var accessibleTenant = user.accessibleTenants[i] || {};
				if (tenantId == accessibleTenant.tenantId) {
					return accessibleTenant.profile;
				}
			}
			return null;
		}
		
		function setSelectedTenant(tenant, $rootScope) {
			var user = getActiveUser();
			
			for(var i=0; user != null && user.accessibleTenants != null && i<user.accessibleTenants.length; i++) {
				var accessibleTenant = user.accessibleTenants[i] || {};
				if (tenant.tenantId == accessibleTenant.tenantId) {
					tenant.profile = accessibleTenant.profile || {profileId: -1, profileName: 'N/A', accessibleFunctions: [], accessibleFunction: []};
					break;
				}
			}
			
			
			$cache.session.put('security', 'tenant', tenant);
			setAccessibleProfile();
			renderMenu($rootScope);
		}
		
		function setAccessibleProfile() {
			var module = getSelectedModule();
			var tenant = getSelectedTenant();
			var user = getActiveUser();
			if (module != null && tenant != null && module.tenantDependent && tenant != null) {
				$dataService.setAPIOption('tenantId', tenant.tenantId);
				user.profile = tenant.profile;
				$dataService.setAPIOption('profileId', user.profile == null ? null : user.profile.profileId);
			}else if (module != null && !module.tenantDependent) {
				$dataService.setAPIOption('tenantId', null);
				user.profile = user.defaultProfile;
				$dataService.setAPIOption('profileId', user.profile == null ? null : user.profile.profileId);
			}
			setActiveUser(user);
		}
		
		function renderMenu($rootScope){
			if ($rootScope != null && $rootScope.setMenu) {
				$rootScope.setMenu();
			}
		}
		
		function registerFunctions($scope) {
			$scope.isFullAccess = isFullAccess;
			$scope.isReadAccess = isReadAccess;
			$scope.isHavingAccess = isHavingAccess;
			$scope.checkAccess = checkAccess;
		}

		function getAccessibleTenants() {
			var user = getActiveUser();
			if (user == null){
				return [];
			}
			return user.accessibleTenants || [];
		}
		
		function proceedAhead() {
			var nextURL = $operationService.getURLParam('returnURL');
			
			var activeUser = getActiveUser();
			var accessibleTenantIds = (activeUser == null ? null : activeUser.accessibleTenantIds) || [];
			
			if (accessibleTenantIds != null && accessibleTenantIds.length > 1 && getSelectedTenant() == null && getSelectedModule() != null && getSelectedModule().tenantDependent) {
				var page = $constants.SelectTenantPage;
				if (nextURL != null && nextURL != '') {
					page += (page.indexOf('?') >= 0 ? '&' : '?') + 'returnURL=' + nextURL;
				}
				
				$window.location = page;
				return;
			}

			
			if (nextURL == null || nextURL == '' || !isRouteAccessible(nextURL)) {
				nextURL = $constants.HomePage;
			}
			
			if (nextURL == null || nextURL == '' || !isRouteAccessible(nextURL)) {
				var profile = getProfile();
				if(profile.accessibleFunctions == null || profile.accessibleFunctions.length == 0){
					nextURL = $constants.HomePage;
				}
				for(var i=0; profile.accessibleFunctions != null && i<profile.accessibleFunctions.length; i++){
					var accessibleFunction = profile.accessibleFunctions[i];
					if (accessibleFunction.type == 'M' || accessibleFunction.type == 'SM') {
						nextURL = accessibleFunction.link;
						break;
					}
				}
			}
			$window.location = nextURL;
		}
		
		function getActiveUser() {
			var user = $cache.session.get('security', 'user');
			if (user == null) {
				return null;
			}
			return user;
		}
		
		function isActiveUserVendor() {
			var user = getActiveUser();
			return user != null && user.type == 'V';
		}

		function isActiveUserAdministrator() {
			var user = getActiveUser();
			return user != null && user.type == 'I';
		}

		function isMenu(functionObj) {
			return isMenuType(functionObj.type);
		}

		function isMenuType(type) {
			return type != null && (type.toLowerCase() == 'M' || type.toLowerCase() == 'SM');
		}
		
		function getProfile() {
			var user = getActiveUser();
			if (user == null) {
				return {};
			}
			return user.profile || {};
		}
		
		function getUserPermissions(type) {
			var user = getActiveUser();
			var userPermissions = [];
			angular.forEach(user.permissions, function(userPermission){
				if (type == null || type == '' || userPermission.type == type) {
					userPermissions.push(userPermission);
				}
			});
			return userPermissions;
		}
		
		function clearSession() {
			$cache.session.put('security', 'user', null);
			$cache.session.put('security', 'token', null);
			$cache.put('security', 'user', null);
			$cache.put('security', 'token', null);
			sessionStorage.clear();
		}
		
		function refreshActiveUser() {
			$dataService.get('user/me', function(user, status, headers, config){
				setActiveUser(user);
			});
		}
		
		function setActiveUser(user) {
			$cache.session.put('security', 'user', user);
			if ($cache.get('security', 'user') != null) {
				$cache.put('security', 'user', user);
			}
		}
		
		function canonicalize(input) {
			return input == null ? '' : input.toLowerCase().replace(/ /g, '');
		}
		
		function getFilter(filterType) {
			var profile = getProfile();
			if (profile != null && profile.user != null && profile.user.defaultFilter != null && profile.user.defaultFilter.length > 0) {
				for(var j=0; j<profile.user.defaultFilter.length; j++) {
					var defaultFilter = profile.user.defaultFilter[j];
					if (defaultFilter != null && defaultFilter.type === filterType) {
						return defaultFilter.filter;
					}
				}
			}
			return {};
		}
		
		function getAPIFilterQS(filterType) {
			var filter = getFilter(filterType);
			var qs = '';
			if (filter != null) {
				for(var filterKey in filter) {
					if (qs.length > 0) {
						qs += '&';
					}
					qs += filterKey + '=' + filter[filterKey];
				}
			}
			return qs;
		}
		
		function getUsers(callback) {
			$dataService.getFromCache('users?select.fields=userId,email,companyName,name', callback);
		}
		
		function getUserById(userId, callback) {
			getUsers(function(users){
				var user = {};
				for(var i=0; users != null && i<users.length; i++){
					if (users[i].userId == userId) {
						callback(users[i]);
						return;
					}
				}
				callback(null);
			});
		}
		
		function getUserId() {
			var user = getActiveUser();
			return user == null ? "0" : '' + user.userId;
		}
		
		function getAccessibleFunction(functionId) {
			var accessibleFunctions = getProfile().accessibleFunctions;
			if (accessibleFunctions == null || accessibleFunctions.length == 0 || functionId == null || functionId == '') {
				return null;
			}
			functionId = ('' + functionId).toLowerCase();
			var selectedFunction = null;
			angular.forEach(accessibleFunctions, function(accessibleFunction){
				var accessibleFunctionId = ('' + accessibleFunction.functionId).toLowerCase();
				var accessibleFunctionCode = ('' + accessibleFunction.functionCode).toLowerCase();
				if (selectedFunction == null && (accessibleFunctionId == functionId || accessibleFunctionCode == functionId)) {
					selectedFunction = accessibleFunction;
				}
			});
			return selectedFunction;
		}
		
		function isHavingAccess(functionId) {
			var accessibleFunction = getAccessibleFunction(functionId);
			return accessibleFunction != null && accessibleFunction.access != null && accessibleFunction.access != '' ;
		}
		
		function isReadAccess(functionId) {
			var accessibleFunction = getAccessibleFunction(functionId);
			return accessibleFunction != null && accessibleFunction.access != null && accessibleFunction.access != '' && 'RWA'.indexOf(accessibleFunction.access.toUpperCase()) >= 0;
		}
		
		function isFullAccess(functionId) {
			var accessibleFunction = getAccessibleFunction(functionId);
			return accessibleFunction != null && accessibleFunction.access != null && accessibleFunction.access != '' && 'WA'.indexOf(accessibleFunction.access.toUpperCase()) >= 0;
		}
		
		function isRouteAccessible(url) {
			if (url == null || url == '') {
				return false;
			}
			var accessibleFunctions = getProfile().accessibleFunctions || [];
			for(var i=0; i<accessibleFunctions.length; i++) {
				var accessibleFunction = accessibleFunctions[i];
				if (accessibleFunction.link != null && accessibleFunction.link.toLowerCase() === url.toLowerCase()) {
					return true;
				}
			}
			return false;
		}
		
		function checkAccessiblity(url) {
			return function() {
					if (!isRouteAccessible(url)) {
						$notifier.error('URL not accessible. Please ask administrator to provide access');
						throw 'menu not accessible';
					}
					return true;
				  };
		}
		
		function isInt(n){
			try{
				return Number(n) === n && n % 1 === 0;
			}catch(e){				
			}
			return false;
		}
		function isString(s) {
			return s!= null && (typeof(s) === 'string' || s instanceof String);
		}
		
		function checkAccess(lstAccess) {
			if (lstAccess == null || lstAccess === '' || lstAccess === 0) {
				return true;
			}
			
			if (isInt(lstAccess) || isString(lstAccess)) {
				lstAccess=[{'functionId' : lstAccess}]
			} else if (lstAccess.length == null) {
				lstAccess=[lstAccess]
			}
			
			var bAccess = true;
			
			angular.forEach(lstAccess, function(accessInfo){
				if (accessInfo.functionId != null && accessInfo.functionId != '') {
					var access = accessInfo.access == null ? '' : accessInfo.access.toUpperCase();
					access = access === 'A' || access === 'W' ? 'A' : 'R';
					if (access === 'R' && !isReadAccess(accessInfo.functionId)) {
						bAccess = false;
					}
					if (access === 'A' && !isFullAccess(accessInfo.functionId)) {
						bAccess = false;
					}
				}
			});
			
			return bAccess;
		}
		
		function openFunctionInPopup(functionId, inputParams, options) {
			var funct = getAccessibleFunction(functionId);
			if (funct == null) {
				return;
			}
			var url = funct.link;
			var paramString = '';
			var paramStartIndex = url.indexOf('?');
			if (paramStartIndex > 0) {
				paramString = url.substring(paramStartIndex + 1);
				url = url.substring(0, paramStartIndex);
			}
			paramString = paramString == null ? '' : paramString;
			paramString += (funct.params != null && funct.params.length > 0 ? "&" + funct.params: "");
			var params = {};
			angular.forEach(paramString.split('&'), function(pair){
				pair = pair.split('=');
				if (pair.length > 0 && pair[0].length > 0) {
					params[pair[0]] = pair.length > 1 ? pair[1] : '';
				}
			});
			
			inputParams = inputParams || {};
			options = options || {};
			
			for(var key in inputParams) {
				params[key] = inputParams[key];
			}
			
			params.__popupFunctionAccess = getAccess(functionId);
			
			var templateURL = options.templateURL || url;
			var templateController = options.templateController || funct.controllerName;
			var size = options.size;
			
			inputParams = params;
			$operationService.openPopup(templateURL, templateController, {'params': inputParams}, size);
		}

	}
]);
