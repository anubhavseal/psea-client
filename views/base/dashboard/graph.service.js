'use strict';
angular.module('base')
	.factory('base.dashboard.graph.service', ['$dataService', '$injector', '$timeout', function ($dataService, $injector, $timeout) {
		var services = {};
		
		return {
			render: render		  
		};

		function getService(serviceName) {
			if (services[serviceName] != null) {
				return services[serviceName];
			}
			services[serviceName] = $injector.get(serviceName);
			return services[serviceName];
		}
		
		function render($dashboard, container, widget, done) {
			var url = widget.dataAPI;
			if (widget._configDataPresent == null) {
				widget._configDataPresent = (widget.data != null);
				widget._configData = widget.data;
			}
			
			var callback = function (data) {
				postFetchData($dashboard, container, widget, done, data);
			}
			var callbackOnError = function (err) {
				onError($dashboard, container, widget, done, err);
			}
			
			if (url != null && url.substr(0, 11).toLowerCase() == 'javascript:') {
				try{
					eval(url.substr(11));
				}catch(err){
					console.log(err);
					onError($dashboard, container, widget, done, err);
				}
			} else if (url != null && url != ''){
				var filter = $dashboard.getSelectedFilter();
				url += (url.indexOf('?') >= 0 ? '&' : '?') + filter;
				$dataService.get(url, callback, callbackOnError);
			} else {
				
				postFetchData($dashboard, container, widget, done, (widget._configDataPresent ? widget._configData : widget._globalData));
			}
		}
		
		function postFetchData($dashboard, container, widget, done, data) {
			if (widget.validateData != null) {
				try {
					var service = getService(widget.validateData.service);
					var validationResult = service[widget.validateData.method](data);
					if (validationResult != null && validationResult !== true) {
						showMessage(container, widget, validationResult === false ? "Data validation failed." : validationResult);
						done();
						return;
					}
				} catch (e) {
					showMessage(container, widget, "Data validation failed.");
					done();
					return;
				}
			}
			
			widget.data = data;
			
			if (widget.processData != null) {
				try {
					var service = getService(widget.processData.service);
					service[widget.processData.method](widget);
				} catch (e) {
					console.log(e);
					showMessage(container, widget, "Data processing failed.");
					done();
					return;
				}
			}
			
			if (widget.dataKey != null && widget.dataKey != '') {
				$dashboard.$scope[widget.dataKey] = data;
			}

			done();
			
			try{
				$timeout(function(){
					$dashboard.$scope
				}, 1);
			}catch(e){
			}
		}

		function onError($dashboard, container, widget, done, err) {
			showMessage(container, widget, "Error occured.");
			done();			
		}

		function showMessage(container, widget, message) {
			widget.templateMessage = message;
		}

	}]);