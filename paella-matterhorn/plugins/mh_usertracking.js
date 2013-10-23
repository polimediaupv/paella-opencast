paella.plugins.UserTrackingCollectorPlugIn = Class.create(paella.EventDrivenPlugin,{
	heartbeatTimer:null,

	setup:function() {
		this.heartbeatTimer = new paella.Timer(function(timer) {thisClass.addEvent('HEARTBEAT'); }, 30000);
		this.heartbeatTimer.repeat = true;
		//--------------------------------------------------
		var thisClass = this;
		$(window).resize(function(event) { thisClass.onResize(); });
	},
	
	getEvents:function() {
		return [paella.events.play,
				paella.events.pause,
				paella.events.seekTo,
				paella.events.seekToTime
		];
	},
	
	onEvent:function(eventType,params) {
		var currentTime = paella.player.videoContainer.currentTime();

		switch (eventType) {
			case paella.events.play:
				this.addEvent('PLAY');
				break;
			case paella.events.pause:
				this.addEvent('PAUSE');
				break;
			case paella.events.seekTo:
			case paella.events.seekToTime:
				this.addEvent('SEEK');
				break;
		}
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
	},
	
	getName:function() {
		return "es.upv.paella.matterhorn.userTrackingCollectorPlugIn";
	},
	
	onResize:function() {
		var w = $(window);
		var label = "RESIZE-TO-"+w.width()+"x"+w.height();
		this.addEvent(label);
	},
				
	addEvent: function(eventType) {
		var videoCurrentTime = parseInt(paella.player.videoContainer.currentTime() + paella.player.videoContainer.trimStart());
			
		var thisClass = this;
		var playing = !paella.player.videoContainer.paused();
	
		paella.ajax.get( { url: '/usertracking/', 
				params: {
					_method: 'PUT',
					id: paella.player.videoIdentifier,
					type: eventType,
					in: videoCurrentTime,
					out: videoCurrentTime,
					playing: playing
				}
			}
		);
	}
});


paella.plugins.userTrackingCollectorPlugIn = new paella.plugins.UserTrackingCollectorPlugIn();
