if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('/sw.js',{scope:'/profiles'}).then(function(registration) {
			console.log('ServiceWorker registration successful with scope: ', registration.scope);
			console.log(navigator.serviceWorker.controller);
			debugger
			if(!navigator.serviceWorker.controller) return;

			if(registration.waiting) {
				upadteReady(registration.waiting);
				return;
			}

			if(registration.installing) {
				trackInstalling(registration.installing);
				return;
			}

			registration.addEventListener('updatefound', function() {
				trackInstalling(registration.installing);
			})
		}, function(err) {
			console.log('ServiceWorker registration failed: ', err);
		});
	});
}

function trackInstalling(worker) {
	worker.addEventListener('statechange', function() {
		if(worker.state == 'installed') {
			upadteReady(worker);
		}
	})
}
var sw;
function upadteReady(worker) {
	toastr.info('message <button type="button" id= "refresh" class=" btn clear btn-toastr">OK</button>' , 'Refresh');
	//alert('new sw');
	sw = worker;
}

$(document).on('click','#refresh',function(){
	console.log("here")
	post();
})
function post() {
	sw.postMessage({action: 'skipWaiting'});
}
navigator.serviceWorker.addEventListener('controllerchange', function() {
	debugger
	window.location.reload();
})

toastr.options = {
  "closeButton": false,
  "debug": true,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "30000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}