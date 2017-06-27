'use strict';
angular.module('base')
	.factory('$message', ['$constants', '$log', '$http', function($constants, $log, $http){
		return {
			show: showMessages,
			hide: clearMessages,
			createErrorMessage: createErrorMessage,
			createWarningMessage: createWarningMessage,
			createInfoMessage: createInfoMessage
		};
		
		function createErrorMessage(messageText) {
			messageText = messageText == null || messageText == '' ? 'Blank Error' : messageText;
			return {'type': 'E', 'messageText': messageText};
		}
		
		function createWarningMessage(messageText) {
			messageText = messageText == null || messageText == '' ? 'Blank Warning' : messageText;
			return {'type': 'W', 'messageText': messageText};
		}
		
		function createInfoMessage(messageText) {
			messageText = messageText == null || messageText == '' ? 'Blank Information' : messageText;
			return {'type': 'I', 'messageText': messageText};
		}

		function filterMessages(messages) {
			if (messages == null) {
				return messages;
			}
			if (messages != null && !angular.isArray(messages)) {
				messages = [messages];
			}
			var tempMessages = [];

			angular.forEach(messages, function(message){
				if (message == null) {
					console.log('Null message passed. Filtered.');
				} else  if (message.type != null && message.messageText != null && message.messageText != '') {
					tempMessages.push(message);
				} else if (message.type != null && message.message != null && message.message != '') {
					message.messageText = message.message
					tempMessages.push(message);
				} else if (message.type == null && (message.message != null || message.exceptionMessage != null || message.exceptionType !=null)) {
					var error = '';
					error += (message.message != null ? ' ' + message.message : '');
					error += (message.exceptionType != null ? ' ' + message.exceptionType : '');
					error += (message.exceptionMessage != null ? ' ' + message.exceptionMessage : '');
					tempMessages.push(createErrorMessage(error));
				} else {
					console.log('Invalid message passed. Filtered. Message is %s', JSON.stringify(message));
				}
			});

			return tempMessages;
		}
		
		function showMessages(scope, messages) {
			messages = filterMessages(messages);
			if (messages == null || messages.length == 0) {
				clearMessages(scope);
				return;
			}
			scope.__errorAvailable = false;
			scope.__warningAvailable = false;
			for(var i=0; i<messages.length; i++) {
				if (messages[i].type === 'E') {
					scope.__errorAvailable = true;
					break;
				} else if (messages[i].type === 'W') {
					scope.__warningAvailable = true;
				}
			}
			scope.__messages = messages;
			angular.element('#messageCont').show();
		}
		
		function clearMessages(scope) {
			scope.__messages = [];
			scope.__errorAvailable = false;
			scope.__warningAvailable = false;
			angular.element('#messageCont').hide();
		}
	}]);