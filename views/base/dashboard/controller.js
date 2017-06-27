angular.module('base')
	.controller('base.dashboard.controller', ['$scope', '$location', '$routeParams', '$loader', '$dataService', '$comboService', '$notifier', '$injector', '$accessService', '$timeout', '$filterService', 'dashboardConfigId', '$http','$operationService', '$cache', '$rootScope', 
	function ($scope, $location, $routeParams, $loader, $dataService, $comboService, $notifier, $injector, $accessService, $timeout, $filterService, dashboardConfigId, $http, $operationService, $cache, $rootScope) {
	    var services = {};
		$scope.user = null;
	    var $dashboard = {
	        getSelectedFilterJSON: getSelectedFilterJSON,
			getSelectedFilter: getSelectedFilter,
			$scope: $scope,
			getData: getData,
			$routeParams: $routeParams,
			setBreadcrumbsCaptions: setBreadcrumbsCaptions
	    };
		
		var refreshTimer = null;

	    $scope.getFilterText = getFilterText;
	    $scope.attachDatePicker = attachDatePicker;
	    $scope.clearFilters = clearFilters;
	    $scope.refreshWidgets = refreshWidgets;
	    $scope.isActionVisible = isActionVisible;
	    $scope.handleActionClick = handleActionClick;
		$scope.getHeight = getHeight;
		$scope.getService = getService;
		$scope.openAutoRefreshPopup = openAutoRefreshPopup;
		$scope.refresh = refresh;
		$scope.toggleAutoRefresh = toggleAutoRefresh;
		$scope.isAutoRefreshEnabled = isAutoRefreshEnabled;
		$scope.getDashboard = getDashboard;
		
		function toggleAutoRefresh() {
			var dashboardSettings = getDashboardSettings();
			dashboardSettings.autoRefresh.enabled = !dashboardSettings.autoRefresh.enabled;
			setDashboardSettings(dashboardSettings);
			setAutoRefresh();
		}
		
		function setBreadcrumbsCaptions(pathCaptions) {
			if ($rootScope.setBreadcrumbsCaptions){
				$rootScope.setBreadcrumbsCaptions(pathCaptions);
			}
		}
		
		function getDashboard() {
			return $dashboard;
		}
		
		function isAutoRefreshEnabled() {
			var dashboardSettings = getDashboardSettings();
			return dashboardSettings != null && dashboardSettings.autoRefresh != null && dashboardSettings.autoRefresh.enabled;
		}
		
		function setAutoRefresh() {
			var dashboardSettings = getDashboardSettings();
			$scope.dashboardSettings = dashboardSettings;
			if (refreshTimer != null) {
				$timeout.cancel(refreshTimer);
				refreshTimer = null;
			}
			if (dashboardSettings != null && dashboardSettings.autoRefresh != null && dashboardSettings.autoRefresh.enabled) {
				var interval = (dashboardSettings.autoRefresh.interval == null || dashboardSettings.autoRefresh.interval <= 0) ? 1 : dashboardSettings.autoRefresh.interval;
				interval *= (dashboardSettings.autoRefresh.intervalType == 'S' ? 1000 : 60000);
				var refreshFunction = function() {
					try{
						refresh();
					}catch(e){
					}
					try{
						$timeout.cancel(refreshTimer);
					}catch(e){
					}
					refreshTimer = null;
					if (isAutoRefreshEnabled()) {
						refreshTimer = $timeout(refreshFunction, interval);
					}
				};
				
				refreshTimer = $timeout(refreshFunction, interval < 10000 ? 10000 : 0);
			}
		}
		
		function getDashboardSettings() {
			var dashboardSettings = $cache.session.get('dashboard', 'settings');
			if (dashboardSettings == null) {
				dashboardSettings = {'autoRefresh' : {'enabled': true, 'interval': 1, 'intervalType': 'M'}};
				setDashboardSettings(dashboardSettings);
			}
			return dashboardSettings;
		}
		
		function setDashboardSettings(dashboardSettings) {
			$cache.session.put('dashboard', 'settings', dashboardSettings);
		}

		function openAutoRefreshPopup(){
			var params = {
				'settings': getDashboardSettings(),
				'callback': function(dashboardSettings) {
					setDashboardSettings(dashboardSettings);
					setAutoRefresh();
				}
			};
			$operationService.openPopup('/views/base/dashboard/settingsView','base.dashboard.settings.controller', {'params': params});
		}

	    function getHeight(status) {
	        $timeout(function(){
				$scope.fixedElementHeight = angular.element('#headerContainer').height() + 5
			}, 0);
	    }

	    function attachDatePicker() {
	    }
		
		function createFunction(functionBody, widget) {
			var fnc = null;
			
			try{
				eval ("fnc = " + functionBody);
			}catch(e){
			}
			
			return fnc;
		}

	    function isActionVisible(actionControl) {
	        var dashboardConfig = $scope.dashboardConfig;
	        if (actionControl.showIf) {
	            try {
	                return eval(actionControl.showIf)
	            } catch (e) {
	            }
	            return false;
	        }
	        return true;
	    }

	    function handleActionClick(actionControl, data) {
	        try {
	            var action = actionControl.action;
	            if (action == undefined || action == null) {
	                action = actionControl.onClick;
	            }
	            if (action == undefined || action == null) {
	                action = actionControl.onclick;
	            }
	            if (action == undefined || action == null) {
	                action = angular.element(actionControl.target).data('action');
	            }
	            if (action) {
	                eval(action);
	            }
	        } catch (e) {
	        }
	    }

	    function parseAPIPArams(apiURL) {
	        apiURL = apiURL || '';
	        var params = {};

	        apiURL.replace(
                new RegExp("([^?=&]+)(=([^&]*))?", "g"),
                function ($0, $1, $2, $3) {
                    params[$1] = $3;
                }
            );

	        return params;
	    };

	    function getSelectedFilterJSON() {
	        return $filterService.getSelectedFilterJSON($scope.dashboardConfig == null ? [] : $scope.dashboardConfig.filters);
	    }

	    function getSelectedFilter(type) {
	        return $filterService.getSelectedFilter($scope.dashboardConfig == null ? [] : $scope.dashboardConfig.filters, type);
	    }

	    function getFilterText() {
	        var filterText = $filterService.getSelectedFilterText($scope.dashboardConfig == null ? [] : $scope.dashboardConfig.filters);
	        if (filterText == null || filterText == '') {
	            filterText = 'None';
	        } else {
	            filterText = ' [' + filterText + ']';
	        }
	        return filterText;
	    }

	    function getService(serviceName) {
	        if (services[serviceName] != null) {
	            return services[serviceName];
	        }
	        services[serviceName] = $injector.get(serviceName);
	        return services[serviceName];
	    }

	    function clearFilters() {
	        $filterService.clearSelectedFilter($scope.dashboardConfig.filters);
	        refresh();
	    }
		
		function refresh() {
			var dashboardConfig = $scope.dashboardConfig;
			var callback = function (data) {
				dashboardConfig.data = data;

				if (dashboardConfig.dataAPI != null && dashboardConfig.dataAPI != '') {
					angular.forEach(dashboardConfig.widgets, function (widget) {
						widget._globalData = data;
						widget.$dashboard = $dashboard;
					});
				}

				$loader.hide();

				
				$filterService.initializeFilterPanel(dashboardConfig.filters);

				$timeout(function(){
					refreshWidgets
				}, 100);
			};

			if (dashboardConfig.dataAPI != null && dashboardConfig.dataAPI != '') {
				var url = dashboardConfig.dataAPI;

				var callbackOnError = function (err) {
					$notifier.error('Error occured while fetching dashboard data.');
					console.log('err', err);
					callback();
				}
				
				if (url != null && url.substr(0, 10).toLowerCase() == 'javascript:') {
					try{
						eval(url.substr(10));
					}catch(err){
						callbackOnError(err, true);
					}
				} else if (url != null && url != ''){
					var filter = $dashboard.getSelectedFilter();
					url += (url.indexOf('?') >= 0 ? '&' : '?') + filter;
					$dataService.get(url, callback, callbackOnError);
				} else {
					callback();
				}
			} else {
				callback();
			}
		}

	    function refreshWidgets() {
	        angular.forEach($scope.dashboardConfig.widgets, function (widget, index) {
	            try {                   
	                var service = widget.service;
	                if (service == null || service == '') {
	                    console.log('Service not provided to render for widget - ' + widget.caption + '[' + widget.id + ']');
	                    return;
	                }
	                var container = $('#' + widget.id);
	                widget.refreshing = true;

	                $timeout(function(){
						getService(service).render($dashboard, container, widget, function () {
	                        widget.refreshing = false;
	                    });
	                }, 0);
					
	            } catch (e) {
	                console.log('Error occured while rendering widget - ' + widget.caption + '[' + widget.id + ']: ', e);
	            }
	        });
	    }

	    function init() {
			$loader.show();
			$scope.user = $accessService.getActiveUser();
	        var widgetURL = 'dashboardConfigurations';
			if (dashboardConfigId == null || dashboardConfigId == '') {
				widgetURL += '/' + $routeParams.dashboardConfigId;
			} else {
				widgetURL += '/' + dashboardConfigId;
			}
	        $dataService
                .get(widgetURL, function (response) {
                        applyDashboardConfig(response);
                    },
                    function (err) {
                        applyDashboardConfig();
                        $notifier.error('Error occured while fetching dashboard configuration');
                    }
                );
	    }
		
		function fetchTemplate(widget) {
			$timeout(function(){
				var template = $cache.session.get('dashboard', 'template$' + widget.templateURI);
				if (template == null) {
					$http.get(widget.templateURI)
						.then(function(response) {
							widget.template = response.data;
							$cache.session.put('dashboard', 'template$' + widget.templateURI, response.data);
						}, function myError(response) {
							widget.template = 'Error occured while fetching template';
						});
				} else {
					widget.template = template;
				}
			}, 0);
		}

		function getData() {
			return $scope.dashboardConfig == null ? null : $scope.dashboardConfig.data;
		}

	    var defaultFilter = [];

	    function applyDashboardConfig(dashboardConfig) {
	        dashboardConfig = dashboardConfig || {};
	        dashboardConfig.header = dashboardConfig.header || "<h3>Applied Filters:<small>{{getFilterText()}}</small></h3>";
	        dashboardConfig.filters = dashboardConfig.filters || defaultFilter;
	        var widgetRows = [];
	        angular.forEach(dashboardConfig.widgets, function (widget, index) {
				if (widget.functions) {
					for(var key in widget.functions) {
						widget[key] = createFunction(widget.functions[key], widget);
					}
				}
				
	            widget.theme = (widget.theme || 'panel').toLowerCase();
	            if (widget != null && widget.showIfAccessible != null && widget.showIfAccessible.functionId != null && widget.showIfAccessible.functionId != '') {
					var accessible = false;
					if (widget.showIfAccessible.access == 'W' || widget.showIfAccessible.access == 'A') {
						accessible = $accessService.isFullAccess(widget.showIfAccessible.functionId);
					} else {
						accessible = $accessService.isHavingAccess(widget.showIfAccessible.functionId);
					}
					if (!accessible) {
	                    return;
	                }
	            }

	            widget.id = widget.id || '__wdgt_' + index;
				widget.user = $scope.user;
				widget.$scope = $scope;
				if ((widget.template == null || widget.template == '') && widget.templateURI != null && widget.templateURI != ''){
					fetchTemplate(widget);
				}
				
	            var row = (widget.row || 1) + -1;
	            var widgetRow = widgetRows[row] || {};
	            var widgets = widgetRow.widgets || [];
				
	            widgets.push(widget);
	            widgetRow.widgets = widgets;
	            widgetRows[row] = widgetRow;
	        });

	        dashboardConfig.widgetRows = widgetRows;
	        dashboardConfig.showAllFilter = false;

	        if (dashboardConfig.actions != null) {
	            angular.forEach(dashboardConfig.actions, function (action) {
	                action.controlType = (action.controlType == null || action.controlType == '') ? 'button' : action.controlType.toLowerCase();
	                if (action.access != null && action.access != '') {
	                    action.accessible = $accessService.checkAccess(action.access);
	                } else {
	                    action.accessible = true;
	                }
	            });
	        }
			
			$scope.dashboardConfig = dashboardConfig;

			refresh();
			
			setAutoRefresh();
	    }

	    init();
	}]);