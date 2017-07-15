angular.module('base')
	.controller('base.header.controller', ['$scope', '$location', '$constants', '$window', '$rootScope', '$injector', '$accessService', '$dataService', '$route', 
	function ($scope, $location, $constants, $window, $rootScope, $injector, $accessService, $dataService, $route) {
		var services = {};
		$scope.searchOptions = {"text": ""};
		$scope.showBreadcrumb = showBreadcrumb;
		$scope.onClick = onClick;
		$scope.signIn = signIn;
		$scope.toggleMenu = toggleMenu;
		$scope.logOut = logOut;
		$scope.changePassword = changePassword;
		$scope.onSearchTextKeyPress = onSearchTextKeyPress;
		$scope.search = search;
		$scope.hideSearch = hideSearch;
		$scope.headerLinks = [
			{'caption': 'Switch Tenant', 'action': 'switchTenant()'},
			{'caption': '-'},
			{'caption': 'Change Password', 'action': 'changePassword()'},
			{'caption': 'Logout', 'action': 'logOut()'},			
		];
		$scope.user = null;
		$scope.showItem = showItem;
		$scope.selectModule = selectModule;
		$scope.isModuleActive = isModuleActive;
		$scope.searchPossible = $constants.SearchConfig != null && Array.isArray($constants.SearchConfig) && $constants.SearchConfig.length > 0;
		$scope.gotoHome = gotoHome;
		
		function selectModule(module) {
			$accessService.setSelectedModule($rootScope, module);
			if (module.tenantDependent && $accessService.getSelectedTenant() == null && ('' + $window.location).indexOf($constants.SelectTenantPage) === -1) {
				proceedToMandatoryPage($constants.SelectTenantPage);
			}
		}
		
		function isModuleActive(module) {
			var selectedModule = $accessService.getSelectedModule($rootScope);
			return module != null && selectedModule != null && selectedModule.moduleId == module.moduleId;
		}
		
		function onClick(headerLink) {
			if (headerLink.action != null) {
				eval(headerLink.action)
			}
		}
		
		function toggleMenu() {
			angular.element('body').toggleClass('nav-open');
		}
		
		function changePassword() {
			$location.path($constants.ChangePasswordPage);
		}
		
		function switchTenant() {
			$location.path($constants.SelectTenantPage);
		}
		
		function gotoHome(){
			$location.path($constants.HomePage);
		}
		
		function logOut() {
			//$dataService.post('userActivities', {'activityType': 'logout'}, function(response){
				$accessService.clearSession();
				$location.path($constants.LoginPage);
			//});
		}
		
		function signIn() {
			$location.path($constants.LoginPage);
		}
		
		function showBreadcrumb(breadcrumb) {
			if (breadcrumb.params == null || breadcrumb.params == '') {
				$location.path(breadcrumb.url);
			} else {
				var params = {};
				angular.forEach(breadcrumb.params.split('&'), function(pair){
					var key = '';
					var value = '';
					var equalToIndex = pair.indexOf('=');
					if (equalToIndex >= 0) {
						key = pair.substr(0, equalToIndex);
						value = pair.substr(equalToIndex + 1);
					}
					if (key != '' && value != '') {
						params[decodeURIComponent(key)] = decodeURIComponent(value);
					}
				});
				$location.path(breadcrumb.url).search(params);
			}
		}
		
		function validateAccountExpiry(userAccountExpiryDate){			
			var currentDate = new Date();
			userAccountExpiryDate = userAccountExpiryDate == null || userAccountExpiryDate == "" ? null : new Date(userAccountExpiryDate);
			if(userAccountExpiryDate != null && userAccountExpiryDate < currentDate){
				logOut();	
			}
		}
		
		function proceedToMandatoryPage(page) {
			page += (page.indexOf('?') >= 0 ? '&' : '?') + 'returnURL='+$location.url();
			$window.location.href = page;
		}
		
		function isURLSatisfied(url, routePrefixes){
			if (routePrefixes == null || routePrefixes.length == 0){
				return false;
			}
			
			for(var i=0; i<routePrefixes.length; i++) {
				if (url.indexOf(routePrefixes[i]) != -1) {
					return true;
				}
			}
			
			return false;
		}
						
						 
		function init(){
			var url = '' + $window.location;
			$scope.user = $accessService.getActiveUser();
			var selectableTenants = $accessService.getSelectableTenants();
			
			if (selectableTenants == null || selectableTenants.length <= 1) {
				$scope.headerLinks.splice(0, 2);
			}
			
			validateAccountExpiry($scope.user == null ? null : $scope.user.accountExpiry);
						
			if ($scope.user != null && $scope.user.userId != null && !$scope.user.agreementAccepted) {
				if (url.indexOf($constants.AcceptAgreementPage) === -1) {
					proceedToMandatoryPage($constants.AcceptAgreementPage);
					return;
				}
			} else if ($scope.user != null && $scope.user.userId != null && $scope.user.passwordExpired) {
				if (url.indexOf($constants.ChangePasswordPage) === -1){
					proceedToMandatoryPage($constants.ChangePasswordPage);
					return;
				}
			} else if ($scope.user != null && $scope.user.userId != null && selectableTenants.length > 0 && $accessService.getSelectedTenant() == null && $accessService.getSelectedModule() != null && $accessService.getSelectedModule().tenantDependent) {
				if (url.indexOf($constants.SelectTenantPage) === -1){
					proceedToMandatoryPage($constants.SelectTenantPage);
					return;
				}
			} else {
				executeStartupTasks();
			}
			
			if ($scope.user != null && $scope.user.accessibleModules != null && $scope.user.accessibleModules.length > 1) {
				var headerLinks = [];
				angular.forEach($scope.user.accessibleModules, function(module) {
					if (module.tenantDependent && selectableTenants.length <= 0) {
						return;
					}
					headerLinks.push({'caption': '<i class="fa fa-check" ng-if="isModuleActive(headerLink.module)">&nbsp;</i>' + module.moduleDescription, 'action': 'selectModule(headerLink.module)', 'module': module});
				});
				headerLinks.push({'caption': '-'});
				angular.forEach($scope.headerLinks, function(headerLink) {
					headerLinks.push(headerLink);
				});
				$scope.headerLinks = headerLinks;
			}
			
			//setLayout();
			
			$rootScope.setBreadcrumbsCaptions = setBreadcrumbsCaptions;
			
			$scope.$on('$routeChangeSuccess', function(next, current) {
				var routeAccessible = isRouteAccessible();
				if (!routeAccessible && url.indexOf($constants.LoginPage) === -1) {
					proceedToMandatoryPage($constants.LoginPage);
					return;
				}
				setLayout();
				$rootScope.setBreadcrumbsCaptions();
			});
		}
		
		function isRouteAccessible() {
			var routePath = null;
			try{
				routePath = $route.current.$$route.originalPath;
			}catch(e){
			}
			if ($scope.user == null && $constants.UnsecuredRoutes != null && (routePath == null || $constants.UnsecuredRoutes.indexOf(routePath) == -1)) {
				return false;
			}
			return true;
		}
		
		function executeStartupTasks(index) {
			var tasks = $constants.StartupTasks || [];
			index = index || 0;
			
			if (index >= tasks.length) {
				return;
			}
			
			var task = tasks[index];
			
			if (task.secured && ($scope.user == null || $scope.user.userId == null)) {
				executeStartupTasks(index + 1);
				return;
			}
			
			var service = null;
			try{
				service = getService(task.service)
			}catch(e){
				service = null;
			}
			
			if (service == null || task.method == null || task.method == '' || service[task.method] == null) {
				executeStartupTasks(index + 1);
				return;
			}
			
			service[task.method](function(proceedNext){
				if (proceedNext) {
					executeStartupTasks(index + 1);
				}
				
				return;
			});
		}
		
		function setBreadcrumbsCaptions(pathCaptions) {
			try{
				getService('$operationService').setBreadcrumbs($location.url(), $rootScope, $route.current.$$route.originalPath, pathCaptions);
			}catch(e){
				console.log(e);
			}
		}
		
		function setLayout(){
			var url = '' + $window.location;
			var bHideMenuBar = $accessService.getActiveUser() == null || isURLSatisfied(url, $constants.MenuLessRoutes) || isURLSatisfied(url, [$constants.AcceptAgreementPage, $constants.ChangePasswordPage, $constants.SelectTenantPage]);
			var bHideHeader = isURLSatisfied(url, $constants.HeaderLessRoutes) || isURLSatisfied(url, $constants.UnsecuredRoutes) || isURLSatisfied(url, []);
			
			if (bHideHeader) {
				angular.element('body').addClass('nav-open');
				angular.element('.navbar').css('visibility', 'hidden');
				angular.element('.navigation-dock').css('visibility', 'hidden');
				angular.element('nav').removeClass('navbarWithoutLogin');
			} else if (bHideMenuBar || $constants.HideMenuBar) {
				angular.element('body').addClass('nav-open');
				angular.element('nav').addClass('navbarWithoutLogin');
				angular.element('.navbar-header').css('visibility', 'hidden');
				angular.element('.breadcrumb').css('visibility', 'hidden');
				angular.element('.nav-overlay').css('visibility', 'hidden');
				angular.element('.navbar-form').css('visibility', '');
				angular.element('.navigation-dock').css('visibility', 'hidden');
			} else  {
				angular.element('body').removeClass('nav-open');
				angular.element('.navbar').css('visibility', '');
				angular.element('nav').removeClass('navbarWithoutLogin');
				angular.element('.navigation-dock').css('visibility', '');
				angular.element('.navbar-header').css('visibility', '');
				angular.element('.breadcrumb').css('visibility', '');
				angular.element('.nav-overlay').css('visibility', '');
				angular.element('.navbar-form').css('visibility', 'visible');
			}
		}
		
		function showItem(searchItem) {
			$location.path(searchItem.url);
			angular.element('.searchResult').hide();
		}
		
		function onSearchTextKeyPress($event) {
			if($event.keyCode == 27){
				hideSearch();
				return;
			}
			
			if ($event.keyCode == 13) {
				search();
			}
		}
		
		function hideSearch() {
			angular.element('.searchResult').hide();
		}
		
		function search(){
			var searchText = $scope.searchOptions.text == null ? '' : $scope.searchOptions.text.toLowerCase();
			if (searchText == '') {
				hideSearch();
				return;
			}
			
			$scope.searchInProgress = true;
			angular.element('.searchResult').css('display', 'inline-block');
			populateSearchItems(searchText, function(searchItems){
				$scope.searchItems = searchItems;
				$scope.searchInProgress = false;
			});
		}
		
		function populateSearchItems(searchText, callback, container, index) {
			container = container || [];
			index = index || 0;
			if ($constants.SearchConfig == null || !Array.isArray($constants.SearchConfig) || $constants.SearchConfig.length <= index) {
				callback(container);
				return;
			}
			var searchConfig = $constants.SearchConfig[index];
			var service = null;
			try{
				service = getService(searchConfig.service)
			}catch(e){
				service = null;
			}
			
			if (service == null || service[searchConfig.method || 'search'] == null) {
				populateSearchItems(searchText, callback, container, index + 1);
				return;
			}
			
			service[searchConfig.method || 'search'](searchText, function(searchItems){
				if (searchItems != null) {
					angular.forEach(searchItems, function(searchItem){
						container.push(searchItem);
					});
				}
				populateSearchItems(searchText, callback, container, index + 1);
			});
		}
		
		function getService(serviceName) {
			if (services[serviceName] != null) {
				return services[serviceName];
			}
			services[serviceName] = $injector.get(serviceName);
			return services[serviceName];
		}
		
		$('.nav-overlay').on('click', function() {
			$('body').removeClass('nav-open')
		});
		
		init();
	}]);
