'use strict';

angular.module('base')
	.controller('base.popup.modal.controller', ['$scope', '$modalInstance', '$http', '$constants', '$routeParams', '$loader', '$entityManager', '$dataService', '$comboService', 'params', '$notifier', '$message', '$injector', '$timeout', '$cache', 'Upload',
	function ($scope, $modalInstance, $http, $constants, $routeParams, $loader, $entityManager, $dataService, $comboService, params, $notifier, $message, $injector, $timeout, $cache, Upload) {

		var params = params || {};
		var mode = 'I';
		var apiURL = '';
		var services = {};
		
		$scope.save = save;
		$scope.cancel = cancel;
		$scope.handleActionClick = handleActionClick;
		$scope.refreshDropdown = $comboService.refreshDropdown;
		$scope.filterOptions = filterOptions;

		var $popup = {
			getData: createDataJSON,
			getTemplate: getTemplate,
			getField: getField,
			getFieldValue: getFieldValue,
			setFieldValue: setFieldValue,
			getEntity: getEntity,
			getParams: getParams,
			getScope: getScope,
			getAPIUrl: getAPIUrl,
			saveData: saveData,
			close: closePopup
		};
		$scope.$popup = $popup;
		
		function getAPIUrl(){
			return apiURL;
		}
		
		function getEntity() {
			return $scope.entity;
		}
		
		function getParams() {
			return params;
		}
		
		function getScope() {
			return $scope;
		}
		
		function filterOptions(field) {
			var referenceFields = $scope.template.fields;
			var options = field.options;
			if (field.optionsFilter != null && field.optionsFilter != "") {
				try{
					eval("options=" + field.optionsFilter);
				}catch(e) {
					console.log(e);
				}
			}
			return options;
		}
		
		function getService(serviceName) {
			if (services[serviceName] != null) {
				return services[serviceName];
			}
			services[serviceName] = $injector.get(serviceName);
			return services[serviceName];
		}

		function handleActionClick(actionControl, actionType){
			try{
				actionType = actionType || 'action';
				var action = actionControl[actionType];
				if (action == undefined || action == null) {
					action = angular.element(actionControl.target).data(actionType);
				}
				if (action) {
					eval(action);
				}
			} catch(e) {
				console.log('Error occured: ' + e);
			}
		}

		function loadEntity() {			
			$loader.show();
			var entity = params.entity;
			var entityName = params.entityName;
			
			if ((entityName == null || entityName === '') && entity != null) {
				loadTemplate(entity);
			} else {
				$entityManager.get(
					entityName,
					function(entity){
						loadTemplate(entity);
					}
				);
			}
		}
		
		function fetchData(){
			$loader.show();
			$dataService.get(apiURL + '/' + encodeURIComponent(params.primaryKey), function(data){
				setData(data);
				$loader.hide();
			});
		}
		
		function setData(data){
			data = data || [];
			
			if (data.length != null && data.length > 0) {
				data = data[0];
				mode = 'U';
				if (params.__popupFunctionAccess === 'A') {
					$scope.buttons = $scope.template.buttons || [{'action': 'save()', 'class': 'btn-primary theme-btn-primary', 'caption': 'Update', 'checkForm': true}];
				}
			} else {
				data = {};
				if (params.__popupFunctionAccess === 'A') {
					$scope.buttons = $scope.template.buttons || [{'action': 'save()', 'class': 'btn-primary theme-btn-primary', 'caption': 'Create', 'checkForm': true}];
				}
			}

			angular.forEach($scope.template.fields, function(field){
				setValue(field, data[field.id]);
			});
			
			$comboService.loadDropDownOptions($scope.template.fields);
			
			onLoad();
		}
		
		function loadTemplate(entity) {
			$scope.entity = entity;
			$scope.template = entity.templates[params.viewName || 'default'] || {};
			apiURL = rationalizeAPIURL($scope.template.api || $scope.entity.api);
			$scope.modalCaption = $scope.template.headerTitle;
			
			angular.forEach($scope.template.fields, function(field){
				field.selectedOption = null;
				field.selectedOptionId = null;
				field.writeAccess = (params.__popupFunctionAccess != null && params.__popupFunctionAccess === 'A');
			});
			
			if (params.primaryKey != null && params.primaryKey != '') {
				if ($scope.onData == null || $scope.onData === '') {
					fetchData();
				} else {
					eval($scope.onData);
				}
			} else {
				$comboService.loadDropDownOptions($scope.template.fields);
				if (params.__popupFunctionAccess === 'A') {
					$scope.buttons = $scope.template.buttons || [{'action': 'save()', 'class': 'btn-primary theme-btn-primary', 'caption': 'Create', 'checkForm': true}];
				}
				onLoad();
			}
		}
		
		function onLoad() {
			$loader.hide();
			if ($scope.template.onLoad != null && $scope.template.onLoad !== '') {
				try{
					eval($scope.template.onLoad);
				}catch(e){
					console.log('Error occured while invoking onLoad hook.');
				}
			}
		}
		
		function getTemplate(){
			return $scope.template;
		}
		
		function getField(fieldId){
			var requiredField = null;
			if (fieldId != null && fieldId !== '') {
				angular.forEach($scope.template.fields, function(field){
					if (field.id === fieldId) {
						requiredField = field;
					}
				});
			}
			return requiredField;
		}
		
		function getFieldValue(fieldId){
			return getValue(getField(fieldId));
		}
		
		function setFieldValue(fieldId, value){
			setValue(getField(fieldId), value);
		}
		
		function setValue(field, value) {
			if (field == null){
				return;
			}
			
			var controlType = field.controlType == null || field.controlType === '' ? 'text' : field.controlType.toLowerCase();
			if (controlType === 'dropdown') {
				field.selectedOptionId = value;
				field.selectedOption = null;
				if (field.options != null) {
					angular.forEach(field.options, function(option){
						if ('' + option['id'] == '' + value) {
							field.selectedOption = option;
						}
					});
				}
			} else if (controlType === 'date') {
				try{
					field.selectedOption = value instanceof Date ? value : new Date(value);
				}catch(e){
					field.selectedOption = value;
				}
			} else {
				field.selectedOption = value;
			}
		}
		
		function getValue(field) {
			if (field == null){
				return null;
			}
			var value = null;
			var controlType = field.controlType == null || field.controlType === '' ? 'text' : field.controlType.toLowerCase();
			
			if (controlType === 'dropdown') {
				if (field.selectedOption != null && field.selectedOption.id != null  && field.selectedOption.id !== '') {
					value = field.selectedOption.id;
				}
			} else if (controlType === 'date') {
				value = field.selectedOption != null && field.selectedOption instanceof Date && field.selectedOption.toString() != 'Invalid Date' ? field.selectedOption.toISOString() : field.selectedOption;
			} else if (field.selectedOption != null && field.selectedOption !== ''){
				value = '' + field.selectedOption;
			}
			
			return value;
		}
		
		function evaluateDerivedExpression(expression, item, fields, routeParams) {
			try{
				return eval(expression);
			}catch(e) {
			}
			return null;
		}
		
		function validateValue(field, value, expression) {
			if (expression == null || expression == '') {
				return null;
			}
			try{
				return eval(expression);
			}catch(e) {
				return 'Error occured while validating field[' + field.id + '] : ' + e;
			}
			return null;
		}
		
		function isEmpty(value, defaultValue) {
			return value == null || value == '' ? defaultValue : value;
		}
		
		function isNull(value, defaultValue) {
			return value == null ? defaultValue : value;
		}
		
		function createDataJSON() {
			var data = {};
			
			angular.forEach($scope.template.fields, function(field){
				data[field.column || field.id] = getValue(field);
			});
			
			if (params.defaultFields != null) {
				for(var key in params.defaultFields) {
					var value = params.defaultFields[key];
					
					try{
						for(var replaceKey in params) {
							value = value.replace('{{routeParams.' + replaceKey + '}}', params[replaceKey]);
						}
					}catch(e) {
					}
					
					data[key] = data[key] || value;
				}
			}
			
			var fieldValueMap = {};
			angular.forEach($scope.template.fields, function(field){
				var fieldValue = {};
				fieldValue.value = data[field.column || field.id];
				var text = fieldValue.value;
				var controlType = field.controlType == null || field.controlType === '' ? 'text' : field.controlType.toLowerCase();
				if (controlType === 'dropdown') {
					if (field.selectedOption != null && field.selectedOption.id != null  && field.selectedOption.id !== '') {
						text = field.selectedOption.caption;
					}
				}
				fieldValue.text = text;
				
				fieldValueMap[field.id] = fieldValue;
			});
			
			angular.forEach($scope.template.fields, function(field){
				if (field.derivedExpression) {
					var value = evaluateDerivedExpression(field.derivedExpression, data, fieldValueMap, params);
					fieldValueMap[field.id].value = value;
					data[field.column || field.id] = value;
				}
			});
			
			if (mode === 'U') {
				data[$scope.entity.primaryKeyField] = data[$scope.entity.primaryKeyField] || params.primaryKey;
			}
			return data;
		}
		
		function rationalizeAPIURL(api) {
			if (api.indexOf('?') > -1) {
				api = api.substr(0, api.indexOf('?'));
			} 
			return api;
		}
		
		function defaultSave(){
			saveData(createDataJSON());
		}
		
		function closePopup(){
			$modalInstance.dismiss('ok');
		}
			
		function saveData(data, options){
			$loader.show();	
			$message.hide($scope);
			options = options || {};
			var api = options.apiURL || apiURL;
			var successCallback = options.onSuccess;
			var errorCallback = options.onError;

			var errors = [];
			
			angular.forEach($scope.template.fields, function(field){
				var value = data[field.column || field.id];
				var validationMessage = validateValue(field, value, field.validateExpression);
				if (validationMessage != null && validationMessage != '') {
					errors.push($message.createErrorMessage(validationMessage));
				}
			});
			
			if (errors.length > 0) {
				$loader.hide();
				$message.show($scope, errors);
				if (errorCallback != null) {
					errorCallback(errors);
				}
				return;
			}
			
			(mode === 'I' ? $dataService.post : $dataService.put)(apiURL + (mode === 'I' ? '' : '/' + encodeURIComponent(params.primaryKey)), 
				data,
				function(response) {
					$loader.hide();
					$notifier.success($scope.template.onSuccessMessage || 'Request completed successfully!!!');
					if (successCallback != null) {
						successCallback(response);
					} else {
						try{
							params.refreshParent();
							params.refreshHeader();
						}catch(e){
						}
						closePopup();
					}
				},
				function(err) {
					$loader.hide();
					$message.show($scope, err);
					if (errorCallback != null) {
						errorCallback(err);
					}
				}
			);
		}

		function save() {
			if ($scope.template.onSave != null && $scope.template.onSave !== '') {
				try{
					eval($scope.template.onSave);
				}catch(e){
					console.log('Error occured while invoking onSave hook. - ' + e);
				}
			} else {
				defaultSave();
			}
		};

		function cancel() {
			$modalInstance.dismiss('cancel');
		}

	    $scope.uploadFiles = uploadFiles;
	    function uploadFiles(files, control) {
	        /*$scope.files = files;
	        var data = control;
	        angular.forEach(files, function(file) {
        		$loader.show()
        		$loader.setMessage('Uploading File...')
				file.upload = Upload.upload({
	                url: $constants.APIBasePath + 'projectdocuments/UploadFile',
					headers : {
						'Authorization' : $cache.session.get('security', 'token')
					},
	                data: {file: file}
	            });

	            file.upload.then(function (response) {
	            	var fileURL = response.data[0].fileUrl;
	            	var fileExt = fileURL.split(".").pop().toLowerCase();
	                $timeout(function () {
	                	control.selectedOption = fileURL;
        				$loader.hide()
	                });
	            }, function (response) {
	                if (response.status > 0)
	                    $scope.errorMsg = response.status + ': ' + response.data;
	                	control.selectedOption = null;
						// $message.show($scope, response.statusText);
	                	$notifier.error(response.statusText);
	                	$loader.hide();
	            }, function (evt) {
	                file.progress = Math.min(100, parseInt(100.0 * 
	                                         evt.loaded / evt.total));
	            });
	        });*/
	    }

		loadEntity();
	}]);