'use strict';
angular.module('base')
	.factory('$comboService', ['$constants', '$log', '$http', '$cache', '$dataService', function($constants, $log, $http, $cache, $dataService){
		
		return {
			getOptionsList: getOptionsList,
			toOptionsList: toOptionsList,
			loadDropDownOptions: loadDropDownOptions,
			loadDowndownData: loadDropdownData,
			loadDropdownData: loadDropdownData,
			refreshDropdown: refreshDropdown,
			filterAvailableOptions: filterAvailableOptions,
			isOptionMatched: isOptionMatched,
			prepareData: prepareData,
			selectRecord: selectRecord,
			updateSelectedValues: updateSelectedValues
		};
		
		function selectRecord(id, idKey, data){
			var selectedRecord = null;
			if (data == null || !Array.isArray(data) || data.length == 0) {
				return null;
			}
			angular.forEach(data, function(record){
				if (record[idKey] === id) {
					selectedRecord = record;
				}
			});
			return selectedRecord;
		}
		
		function updateSelectedValues(input, mapKeys){
			var records = Array.isArray(input) ? input : [input];
			
			angular.forEach(records, function(record){
				angular.forEach(mapKeys, function(config, key){
					var selectedRecord = selectRecord(record[config.key], config.mappedKey || config.key, config.data);
					if (config.mappedValueKey != null && config.mappedValueKey != '') {
						selectedRecord = selectedRecord[config.mappedValueKey];
					}
					record[key] = selectedRecord;
				});				
			});
			return input;
		}
		
		function prepareData(referenceFields, additionalData){
			var data = {};
			
			angular.forEach(additionalData, function(value, key){
				data[key] = value;
			});
			
			angular.forEach(referenceFields, function(referenceField){
				referenceField = referenceField || {};
				var key = referenceField.column || referenceField.id;
				var controlType = referenceField.controlType;
				var selectedOption = referenceField.selectedOption;
				var value = null;
				if (selectedOption != null && selectedOption != "") {
				    if (controlType === 'multiselect') {
				        if (Array.isArray(selectedOption)) {
				            var value = [];
				            for (var i = 0; i < selectedOption.length; i++) {
				                if (selectedOption[i].id != null && selectedOption[i].id != '') {
				                    value.push(selectedOption[i].id)
				                }
				            }
				        } else {
				            if (selectedOption.id != null && selectedOption.id != '') {
				                value = selectedOption.id
				            }
				        }
				    } else if (controlType === 'dropdown') {
						if (selectedOption.id != null && selectedOption.id != '') {
							value = selectedOption.id
						}
					} else {
						value = selectedOption;
					}
				}
				if (key != null && value != null) {
					data[key] = value;
				}
			});
			
			return data;
		}
		
		function isOptionMatched(option, data, mapper) {
			if (option != null && option.baseObject != null) {
				option = option.baseObject;
			}
			
			var matched = true;
			angular.forEach(mapper, function(target, sourceKey){
				var targetData = null;
				target = target || {};
				if (target.value != null) {
					targetData = target.value;
				} else {
					targetData = data[target.mapWith || sourceKey];
				}
				var sourceData = option[sourceKey];
				if (targetData != null && sourceData != null && '' + sourceData != '' + targetData) {
					matched = false;
				}
			});
			return matched;
		}
		
		function filterAvailableOptions(options, referenceFields, mapper, additionalData) {
			if (mapper == null) {
				return options;
			}
			var data = prepareData(referenceFields, additionalData);
			var filteredOptions = [];
			angular.forEach(options, function(option){
				if (isOptionMatched(option, data, mapper)) {
					filteredOptions.push(option);
				}
			});
			return filteredOptions;
		}
		
		function loadDropDownOptions(fields) {
			for (var j = 0; fields != null && j < fields.length; j++) {
				loadDropdownData(fields[j]);
			}
		}
		
		function refreshDropdown(field, $event){
			if ($event.ctrlKey) {
				loadDropdownData(field, true);
			}
		}
		
		function loadDropdownData(field, bForceRefresh) {
		    if (field.dataAPI != null && field.dataAPI != '' && field.controlType != null && (field.controlType.toLowerCase() === 'dropdown' || field.controlType.toLowerCase() === 'multiselect')) {
		        if (field.selectedOption != null && field.selectedOption != "") {
		            field.selectedOptionId = [];
		            if (Array.isArray(field.selectedOption)) {
		                for (var i = 0; i < field.selectedOption.length; i++) {
		                    if (field.selectedOption[i].id != null && field.selectedOption[i].id != "") {
		                        field.selectedOptionId.push('' + field.selectedOption[i].id);
		                    }
		                }
		            } else {
		                if (field.selectedOption.id != null && field.selectedOption.id != "") {
		                    field.selectedOptionId.push('' + field.selectedOption.id);
		                }
		            }
		            if (field.controlType.toLowerCase() === 'dropdown') {
		                field.selectedOptionId = field.selectedOptionId.length > 0 ? field.selectedOptionId[0] : null;
		            }
		        } else if (field.controlType.toLowerCase() === 'multiselect' && (field.selectedOptionId == null || field.selectedOptionId == '')) {
		            field.selectedOptionId = [];
		        }
		        getOptionsList(field.dataAPI, field, function (optionsList, field) {
		            field.options = optionsList;
		            if (field.controlType.toLowerCase() === 'multiselect') {
		                field.selectedOption = [];
		            }
					
					if (field.selectedOptionId != null && field.selectedOptionId != "") {
                        if (field.controlType.toLowerCase() === 'dropdown') {
					        for (var i = 0; i < optionsList.length; i++) {
					            if ('' + field.selectedOptionId === '' + optionsList[i]['id']) {
					                field.selectedOption = optionsList[i];
					            }
					        }
                        } else {
                            var selectedOptions = [];
                            if (!Array.isArray(field.selectedOptionId)) {
                                field.selectedOptionId = field.selectedOptionId == null ? [] : ('' + field.selectedOptionId).split(',');
                            }

                            for (var j = 0; j < field.selectedOptionId.length; j++) {
                                var selectedOptionId = '' + field.selectedOptionId[j];
                                if (selectedOptionId == null || selectedOptionId == '') {
                                    continue;
                                }
                                for (var i = 0; i < optionsList.length; i++) {
                                    if (selectedOptionId.toLowerCase() === '' + optionsList[i]['id'].toLowerCase() || selectedOptionId.toLowerCase() === '' + optionsList[i]['caption'].toLowerCase()) {
                                        selectedOptions.push(optionsList[i]);
                                        break;
                                    }
                                }
                            }

                            field.selectedOption = selectedOptions;
					    }
                    }
				}, null, bForceRefresh);
			}
		}
		
		function getOptionsList(api, options, successCallback, errorCallback, bForceRefresh) {
			var apiOptions = {};
			if (bForceRefresh) {
				apiOptions.forceRefresh = true;
			}
			(options.useCache === false ? $dataService.get : $dataService.getFromCache)(api, 
				function(data) {
					var optionsList = toOptionsList(data, options);
					if (successCallback != null) {
						successCallback(optionsList, options);
					}
				},
				errorCallback,
				apiOptions
			);
		}
		
		function toOptionsList(data, options) {
			options = options || {};
			var captionKey = options.captionKey || 'caption';
			var idKey = options.idKey || 'value';
			var defaultCaption = options.mandatory === true ? null : options.defaultCaption;
			defaultCaption = defaultCaption === '' ? null : defaultCaption;
			
			var optionsList = [];

			if (defaultCaption != null && defaultCaption != '' && options.controlType !== 'multiselect') {
				var baseObject = {};
				baseObject[idKey] = null;
				baseObject[captionKey] = defaultCaption;
				var option = {'id' : null, 'caption': defaultCaption, 'default': true, baseObject: baseObject};
				options.selectedOption = option;
				optionsList.push(option);
			}
			
			for(var i=0; data != null &&  i < data.length; i++) {
				var option = {};
				option.id = data[i][idKey];
				option.caption = data[i][captionKey];
				option.default = data[i].default || false;
				option.baseObject = data[i];
				optionsList.push(option);
				
				if (option.default) {
				    if (options.controlType === 'multiselect') {
				        options.selectedOption = [option];
				    } else {
				        options.selectedOption = option;
				    }
				}
			}
			
			return optionsList;
		}
	}]);