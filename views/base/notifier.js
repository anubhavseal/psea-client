'use strict';

angular.module('base').factory('$notifier', ['$constants', '$log', function($constants, $log){
	var toastrOptions = {
		"closeButton": false,
		"debug": false,
		"newestOnTop": true,
		"progressBar": false,
		"positionClass": "toast-top-center",
		"preventDuplicates": false,
		"onclick": null,
		"showDuration": "300",
		"hideDuration": "1000",
		"timeOut": "5000",
		"extendedTimeOut": "1000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut"
	};
	
	return {
		error: error,
		warn: warn,
		success: success,
		notify: notify
	};
	
	function error(message) {
		showMessage(4, 'error', message);
	}
	
	function warn(message) {
		showMessage(3, 'warning', message);
	}
	
	function success(message) {
		showMessage(2, 'success', message);
	}
	
	function notify(message) {
		showMessage(1, 'info', message);
	}
	
	function showMessage(level, type, message) {
		if ($constants.LogLevel != null && $constants.LogLevel > level) {
			return;
		}
		toastr.options = toastrOptions;
		toastr[type](message);
		$log.log(type.toUpperCase() + "# " + new Date() + ": " + message);
	}
}]);
