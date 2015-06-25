new (Class (paella.userTracking.SaverPlugIn, {
	getName: function() { return "es.upv.paella.matterhorn.userTrackingSaverPlugIn"; },
	
	checkEnabled: function(onSuccess) {
		paella.ajax.get({url:'/usertracking/detailenabled'},
			function(data, contentType, returnCode) {
				if (data == 'true') {
					onSuccess(true); 					
				}
				else {
					onSuccess(false); 
				}
			},
			function(data, contentType, returnCode) {
				onSuccess(false);
			}
		);	
	},
	
	log: function(event, params) {
		var videoCurrentTime = parseInt(paella.player.videoContainer.currentTime() + paella.player.videoContainer.trimStart());		
		var matterhornLog = {
			_method: 'PUT',
			'id': paella.player.videoIdentifier,
			'type': undefined,
			'in': videoCurrentTime,
			'out': videoCurrentTime,
			'playing': !paella.player.videoContainer.paused()
		};
		
		switch (event) {
			case paella.events.play:
				matterhornLog.type = 'PLAY';
				break;
			case paella.events.pause:
				matterhornLog.type = 'PAUSE';
				break;
			case paella.events.seekTo:
			case paella.events.seekToTime:
				matterhornLog.type = 'SEEK';
				break;
			case paella.events.resize:
				matterhornLog.type = "RESIZE-TO-" + params.width + "x" + params.height;
				break;
			case "paella:searchService:search":
				matterhornLog.type = "SEARCH-" + params;
				break;
			default:
				matterhornLog.type = event;
				opt = params;
				if (opt != undefined) {				
					if (typeof(params) == "object") {
						opt = JSON.stringify(params);
					}
					matterhornLog.type = event + ';' + opt;
				}
				break;
		}	
		//console.log(matterhornLog);
		paella.ajax.get( {url: '/usertracking/', params: matterhornLog });			
	}
}))();
