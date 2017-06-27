'use strict';
angular.module('base')
	.factory('$entityManager', ['$constants', '$log', '$cache', '$dataService', '$loader', function($constants, $log, $cache, $dataService, $loader){
		return {
			get: get,
			getData: getData,
			copyFieldProps: copyFieldProps,
			populateAdditionalFields: populateAdditionalFields,
			sanitizeControlType: sanitizeControlType
		};

		function sanitizeControlType(controlType, defaultControlType) {
		    if (controlType == null || controlType == '') {
		        return defaultControlType;
		    }
		    controlType = controlType.toLowerCase();
		    if (controlType == 'string' || controlType == 'text' || controlType == 't') {
		        controlType = 'text'
		    } else if (controlType == 'date' || controlType == 'dt' || controlType == 'datepicker') {
		        controlType = 'date'
		    } else if (controlType == 'number' || controlType == 'numeric' || controlType == 'integer') {
		        controlType = 'number'
		    } else if (controlType == 'bool' || controlType == 'b' || controlType == 'boolean' || controlType == 'checkbox') {
		        controlType = 'checkbox'
		    } else if (controlType == 'dropdown' || controlType == 'combo' || controlType == 'combobox' || controlType == 'select' || controlType == 'lov' || controlType.substr(0, 3) == 'lov') {
		        controlType = 'dropdown'
		    } else if (controlType == 'multi' || controlType == 'multiselect') {
		        controlType = 'multiselect'
		    }

		    return controlType;
		}
		
		function get(entityName, successCallback, errorCallback) {
			var entity = $constants.ApplicationMode != null && ($constants.ApplicationMode.toUpperCase() === 'DEVELOPMENT' || $constants.ApplicationMode.toUpperCase() === 'INTEGRATION') ? null : $cache.session.get('metamodel_entity', entityName);
			if (entity == null) {
			    $dataService.get('entities/' + encodeURIComponent(entityName), function(entity){
						entity.fieldMap = {};
					
						for (var i = 0; i < entity.fields.length; i++) {
						    var field = entity.fields[i];
						    field.controlType = sanitizeControlType(field.controlType, 'text');
							entity.fieldMap[field.id] = field;
							if (field.controlType == 'dropdown') {
								field.defaultCaption = field.defaultCaption || 'Select ' + field.caption;
							} else {
								field.defaultCaption = field.defaultCaption || 'Enter ' + field.caption;
							}
						}

						entity.templates = entity.templates || {};
						
						for (var key in entity.templates) {
						    copyFieldProps(entity.templates[key].fields, entity);
						}
						
						$cache.session.put('metamodel_entity', entityName, entity);
						
						successCallback(entity);
					}, function(error){
						if (errorCallback != null) {
							errorCallback(error);
						}
					});
			} else {
				successCallback(entity);
			}
		}
		
		function copyFieldProps(fields, entity) {
			var fieldMap = entity.fieldMap || {};
			for (var i=0; fields != null && i<fields.length; i++) {
				var targetField = fields[i];
				var sourceField = fieldMap[targetField.id] || {};
				targetField.field = sourceField;
				for(var key in sourceField) {
				    targetField[key] = targetField[key] || sourceField[key];
				}

				targetField.controlType = sanitizeControlType(targetField.controlType, 'text');
			}
		}
		
		function getData(options, successCallback, errorCallback) {
			options = options || {};
			
			var entity = options.entity;
			
			if (entity != null || entityName == null || entityName == '') {
				getDataForEntity(options, successCallback, errorCallback);
			} else {
				var entityName = options.entityName;
				if (entityName != null && entityName != '') {
					get(entityName, 
						function(entity) {
							options.entity = entity;
							getDataForEntity(options, successCallback, errorCallback);
						},
						errorCallback
					);
				}
			}
		}
		
		function getDataForEntity(options, successCallback, errorCallback) {
			options = options || {};
			var entity = options.entity || {};
			var apiUrl = options.apiUrl || entity.api;
			var bFetchReferences = options.fetchReferences === true;
			
			if (apiUrl == null || apiUrl === '') {
				if (errorCallback != null) {
					errorCallback('API Url not found.');
				}
				return;
			}
			
			$dataService.get(apiUrl,
				function (data, status, headers, config) {
					if (options.entity === null || !bFetchReferences) {
						successCallback(data, options, status, headers, config);
						return;
					}
					$loader.setMessage('Evaluating derived fields...');
					evaluateDerivedFields(data, entity.fields);
					$loader.setMessage('Updating references...');
					fetchReferences(options, data, entity.fields, 0, function (rdata, roptions) {
					    successCallback(rdata, roptions, status, headers, config);
					}, errorCallback);
				}, 
				errorCallback
			);
		}

		function populateAdditionalFields(options, data, entity, successCallback, errorCallback) {
		    $loader.setMessage('Evaluating derived fields...');
		    evaluateDerivedFields(data, entity.fields);
		    if (options.fetchReferences) {
		        $loader.setMessage('Updating references...');
		        fetchReferences(options, data, entity.fields, 0, function (rdata, roptions) {
		            successCallback(rdata);
		        }, errorCallback);
		    } else {
		        successCallback(data);
		    }
		}
		
		function evaluateDerivedFields(data, fields) {
			if (fields == null || fields.length == 0 || data == null || data.length == 0) {
				return;
			}
			for(var i=0; i<fields.length; i++) {
				var field  = fields[i];
				if (field.type == null || field.derivedExpression == null || field.derivedExpression === '' || field.derivedExpression == '-') {
					continue;
				}
				for(var j=0; j < data.length; j++) {
					var item = data[j];
					evaluateDerivedField(data[j], field.column || field.id, field.derivedExpression, data, j);
				} 
			}
		}
		
		function evaluateDerivedField(item, columnName, expression, data, index) {
			try{
				eval('item[columnName] = ' + expression);
			}catch(e){
			}
		}
		
		function isEmptyObject( map ) {
			for (var key in map ) {
				return false;
			}
			return true;
		}
		
		function fetchReferences(options, data, fields, fieldIndex, successCallback, errorCallback){
			options.cache = options.cache || {}
			var tempCache = options.cache;
			
			var field = fields != null && fields.length > fieldIndex ? fields[fieldIndex] : null;
			if (data == null || data.length == 0 || field == null) {
				if (successCallback != null) {
					successCallback(data, options);
				}
				return;
			}
			
			field.dataCaptionField = field.dataCaptionField || '';
			field.referenceFields = field.referenceFields || {};
			
			
			if ((field.dataCaptionField === '' && isEmptyObject(field.referenceFields)) || field.dataAPI == null || field.dataAPI === ''){
				fetchReferences(options, data, fields, fieldIndex + 1, successCallback, errorCallback);
				return;
			}
			
			if (tempCache[field.dataAPI] == null) {
				(field.useCache === false ? $dataService.get : $dataService.getFromCache)(field.dataAPI, 
					function(lookupdata){
						var idKey = field.idKey || 'value';
						var captionKey = field.captionKey || 'caption';
						var map = {};
						var mapObjects = {};
						for(var i=0; i<lookupdata.length; i++) {
							map['' + lookupdata[i][idKey]] = lookupdata[i][captionKey];
							mapObjects['' + lookupdata[i][idKey]] = lookupdata[i];
						}
						tempCache[field.dataAPI] = map;
						tempCache[field.dataAPI + '_object_map'] = mapObjects;
						
						updateReferences(options, data, field, map, mapObjects, fields, fieldIndex, successCallback, errorCallback);
					},
					function(err) {
						console.log('Assuming null as error occured while fetching references: %s, %s', field.dataAPI, err);
						var map = {};
						var mapObjects = {};
						tempCache[field.dataAPI] = map;
						tempCache[field.dataAPI + '_object_map'] = mapObjects;
						updateReferences(options, data, field, map, mapObjects, fields, fieldIndex, successCallback, errorCallback);
					}
				);
			} else {
				var map = tempCache[field.dataAPI];
				var mapObjects = tempCache[field.dataAPI + '_object_map'];
				updateReferences(options, data, field, map, mapObjects, fields, fieldIndex, successCallback, errorCallback);
			}
		}
		
		function updateReferences(options, data, field, map, mapObjects, fields, fieldIndex, successCallback, errorCallback) {
			var updateCaption = field.dataCaptionField !== '';
			var updateReferenceFields = !isEmptyObject(field.referenceFields);
			
			for(var i=0; data != null && i<data.length; i++) {
				var record = data[i];
				var id = '' + record[field.column || field.id];
				id = id == null ? '' : '' + id;
				
				if (updateCaption) {
				    record[field.dataCaptionField] = map[id] || record[field.column || field.id];
				}
				
				if (updateReferenceFields) {
					for(var key in field.referenceFields) {
						var mapObject = mapObjects[id];
						record[key] = (mapObject == null ? null : record[key] || mapObject[field.referenceFields[key]]);
					}
				}
			}
			
			fetchReferences(options, data, fields, fieldIndex + 1, successCallback, errorCallback);
		}
	}]);