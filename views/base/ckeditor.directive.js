angular.module('base')
	.directive('ckEditor', function () {
		return {
			require: '?ngModel',
			scope: '=',
			link: function (scope, elm, attr, ngModel) {
				if (!ngModel || !scope.formattedHTML) return;
				
				var ck = CKEDITOR.replace(elm[0]);



				ck.on('instanceReady', function () {
					ck.setData(ngModel.$viewValue);
				});

				function updateModel() {
					scope.$apply(function () {
						ngModel.$setViewValue(ck.getData());
					});
				}
				ck.on('instanceReady', function() {
					ck.setData(ngModel.$viewValue);
				});
				ck.on('change', updateModel);
				ck.on('key', updateModel);
				ck.on('dataReady', updateModel);

				ngModel.$render = function (value) {
					ck.setData(ngModel.$viewValue);
				};
			}
		};
	});