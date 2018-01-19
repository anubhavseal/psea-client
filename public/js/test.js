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

function upadteReady(worker) {
	toastr.info('<button type="button" class=" btn btn-success clear btn-toastr">Refresh</button>' +
	'<button type="button" class=" btn btn-default clear btn-toastr">Dismiss</button>' , 'New content available');
	debugger
	$('#toast-container > div').css('opacity', 100);
	var toast = toastView().then(function(){
		worker.postMessage({action: 'skipWaiting'});
	}, function() {})
}


function toastView() {
	return new Promise(function(resolve, reject) {
		$('body').on('click','.toast-message',  function(event){
			debugger
			if(event.target.textContent == 'Refresh')
				resolve('refresh');
			else if(event.target.textContent == 'Dismiss') {
				reject('dismiss');
			}
		})
	})
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
  "positionClass": "toast-bottom-center",
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