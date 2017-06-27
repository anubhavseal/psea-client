'use strict';
angular.module('base')
	.factory('$gridService', [function(){
		return {
			register: register,
			moveUp: moveUp,
			moveDown: moveDown,
			deleteRow: deleteRow,
			addRow: addRow,
			updateDisplaySequence: updateDisplaySequence
		};
		
		function register(scope) {
			if (scope == null) {
				return;
			}
			scope.moveUp = moveUp;
			scope.moveDown = moveDown;
			scope.deleteRow = deleteRow;
			scope.addRow = addRow;
		}
		
		function move(data, origin, destination) {
			var temp = data[destination];
			data[destination] = data[origin];
			data[origin] = temp;
		}

		function moveUp(data, $index){			
			move(data, $index, $index - 1);
		}

		function moveDown(data, $index){					
			move(data, $index, $index + 1);
		}

		function deleteRow(data, item, index) {
			if (item.__row_mode == 'N') {
				data.splice(index, 1);
				return;
			}
			if (item.__row_mode !== 'D') {
				item.__old_row_mode = item.__row_mode || 'B';
			}
			item.__row_mode = item.__row_mode === 'D' ? item.__old_row_mode : 'D';
		}
		
		function addRow(data, defaultFields) {
			var record = {'__row_mode' : 'N'};
			defaultFields = defaultFields || [];
			for(var i=0; i<defaultFields.length; i++) {
				var field = defaultFields[i];
				if (field.field == null || field.field === '') {
					continue;
				}
				if (field.value == null || field.value === '') {
					continue;
				}
				record[field.field] = field.value;
			}
			data.push(record);
		}

		function updateDisplaySequence(data, sequenceField) {
			if (sequenceField) {
				for(var i=0, j=0; i<data.length; i++) {
					var record = data[i];
					if (record.__row_mode != 'D') {
						j++;
					}
					record[sequenceField] = j;
				}
			}
		}
	}]);