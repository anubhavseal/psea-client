angular.module('security')
	.controller('security.menu.controller', ['$scope', '$location', '$dataService', '$accessService', '$tree', '$rootScope', '$constants', '$injector', 
		function ($scope, $location, $dataService, $accessService, $tree, $rootScope, $constants, $injector) {
			var services = [];
			var functionList = [];
			$scope.menuList = [];
			$scope.isMenuActive = isMenuActive;
			
			function init() {
				setMenu();
				$rootScope.setMenu = setMenu;
			}
			
			function setMenu() {
				$scope.user = $accessService.getActiveUser() || {};
				var selectedModule = $accessService.getSelectedModule($rootScope);
				var profile = $scope.user.profile || {};
				var menus = [];
				for(var i=0; profile.accessibleFunctions != null && i<profile.accessibleFunctions.length; i++){
					var accessibleFunction = profile.accessibleFunctions[i];
					if (selectedModule != null && accessibleFunction.modules != null && accessibleFunction.modules.length > 0 && accessibleFunction.modules.indexOf(selectedModule.moduleCode) == -1) {
						continue;
					}
					if (accessibleFunction.type == 'M' || accessibleFunction.type == 'SM') {
						menus.push(accessibleFunction);
					}
				}

				$scope.menus = $tree.convert(menus, "functionId", "parentFunctionId", "childs");
				
				if ($accessService.getActiveUser() != null && $constants.MenuConfig != null && Array.isArray($constants.MenuConfig) && $constants.MenuConfig.length > 0) {
					populateMenus(menus, function(menus){
						$scope.menus = $tree.convert(menus, "functionId", "parentFunctionId", "childs");
					})
				}
			}
		
			function getService(serviceName) {
				if (services[serviceName] != null) {
					return services[serviceName];
				}
				services[serviceName] = $injector.get(serviceName);
				return services[serviceName];
			}
			
			function populateMenus(container, callback, index) {
				container = container || [];
				index = index || 0;
				if ($constants.MenuConfig == null || !Array.isArray($constants.MenuConfig) || $constants.MenuConfig.length <= index) {
					callback(container);
					return;
				}
				var menuConfig = $constants.MenuConfig[index];
				var service = null;
				try{
					service = getService(menuConfig.service)
				}catch(e){
					service = null;
				}
				
				if (service == null || menuConfig.method == null || menuConfig.method == '' || service[menuConfig.method] == null) {
					populateMenus(container, callback, index + 1);
					return;
				}
				
				service[menuConfig.method](function(searchItems){
					if (searchItems != null) {
						angular.forEach(searchItems, function(searchItem){
							container.push(searchItem);
						});
					}
					populateMenus(container, callback, index + 1);
				});
			}
			
			function isMenuActive(path) {
				try{
					if(path){
						return decodeURIComponent($location.path().substr(0, path.length)) == decodeURIComponent(path);
					}else{
						return false;
					}					
				}catch(e){
					return false;
				}				
			}
			
			$scope.isActive = function(path) { 
				if ($location.path().substr(0, path.length) == path) {
					return "active";
				} else {
					return "";
				}
			};
			
			init();
		}
	]);