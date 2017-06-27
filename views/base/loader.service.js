'use strict';
angular.module('base')
	.factory('$loader', ['$constants', '$log', '$http', function($constants, $log, $http){
		return {
			show: show,
			hide: hide,
			setMessage: setMessage
		};
		
		function show() {
			angular.element('.loading-spiner-holder').show();
			setMessage("");
		}
		
		function hide() {
			angular.element('.loading-spiner-holder').hide();
			setMessage("");
		}

		function setMessage (message) {
			angular.element('.loading-spiner-holder #loaderMessage').html(message);
			if (message == null || message === "") {
				angular.element('.loading-spiner-holder #loaderMessage').hide();
			} else {
				angular.element('.loading-spiner-holder #loaderMessage').show();
			}
		}
	}]);