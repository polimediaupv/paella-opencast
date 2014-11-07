paella.plugins.UserTrackingSaverPlugIn = Class.create(paella.EventDrivenPlugin,{
	getName:function() { return "es.upv.paella.matterhorn.userTrackingSaverPlugIn"; },
	getEvents:function() { return [paella.events.userTracking]; },

	
	onEvent:function(eventType, params) {		
		var videoCurrentTime = parseInt(paella.player.videoContainer.currentTime() + paella.player.videoContainer.trimStart());
		
		var matterhornLog = {
			_method: 'PUT',
			'id': paella.player.videoIdentifier,
			'type': params.event,
			'in': params.time,
			'out': params.time,
			'playing': params.playing,
			'resource': paella.matterhorn.resourceId
		};
		
		switch (params.event) {
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
			case "RESIZE-TO":
				matterhornLog.type = "RESIZE-TO-"+params.label;
				break;
			case paella.events.loadComplete:
				this.addEvent('NORMAL_STARTUP');
				break;
		}
		
		paella.ajax.get( {url: '/usertracking/', params: matterhornLog });
	},
	
	checkEnabled:function(onSuccess) {
		paella.ajax.get({url:'/usertracking/detailenabled'},
			function(data, contentType, returnCode) {
				if (data == 'true') { onSuccess(true); } else { onSuccess(false); }
			},
			function(data, contentType, returnCode) {
				onSuccess(false);
			}
		);	
	}
});


paella.plugins.userTrackingSaverPlugIn = new paella.plugins.UserTrackingSaverPlugIn();
