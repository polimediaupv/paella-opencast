
function loadOpencastPaella(containerId) {
	return paella.opencast.getEpisode()
	.then(
		function(episode) {
			var converter = new OpencastToPaellaConverter();
			var data = converter.convertToDataJson(episode);
			paella.load(containerId, {data:data});			
		},
		function(){
			var oacl = new OpencastAccessControl();		
			oacl.userData().then(function(user){
				if (user.isAnonymous) {
					console.log("auth");
					window.location.href = oacl.getAuthenticationUrl();
				}
				else {
					paella.messageBox.showError("Error loading video " + paella.utils.parameters.get('id'));					
				}
			});
		}
	);
}


