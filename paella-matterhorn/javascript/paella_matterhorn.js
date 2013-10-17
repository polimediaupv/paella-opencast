paella.matterhorn = {};



var MHAccessControl = Class.create(paella.AccessControl,{
	checkAccess:function(onSuccess) {
		this.permissions.canRead = false;
		this.permissions.canWrite = false;
		this.permissions.canContribute = false;
		this.permissions.loadError = false;
		this.permissions.isAnonymous = false;

		if ( (paella.matterhorn) && (paella.matterhorn.me) && (paella.matterhorn.acl) ) {
			var roles = paella.matterhorn.me.roles;
			var aces = paella.matterhorn.acl.acl.ace;
			var adminRole = paella.matterhorn.me.org.adminRole;
			var anonymousRole = paella.matterhorn.me.org.anonymousRole;

			if (!(roles instanceof Array)) { roles = [roles]; }
			if (!(aces instanceof Array)) { aces = [aces]; }

			for (var role_i=0; role_i<roles.length; ++role_i) {
				var currentRole = roles[role_i];
				if (currentRole == anonymousRole) {
					this.permissions.isAnonymous = true;
				}
				if (currentRole == adminRole) {
					this.permissions.canRead = true;
					this.permissions.canWrite = true;
					this.permissions.canContribute = true;
					break;
				}
				else{
					for(var ace_i=0; ace_i<aces.length; ++ace_i) {
						var currentAce = aces[ace_i];
						if (currentRole == currentAce.role) {
							if (currentAce.action == "read") {this.permissions.canRead = true;}
							if (currentAce.action == "write") {this.permissions.canWrite = true;}
						}
					}
				}
			}	
		}
		else {
			this.permissions.loadError = true;
		}

		onSuccess(this.permissions);
	}
});

var MHVideoLoader = Class.create(paella.VideoLoader, {
	loadVideo:function(videoId,onSuccess) {
		var streams = {};
		var tracks = paella.matterhorn.episode.mediapackage.media.track;
		var attachments = paella.matterhorn.episode.mediapackage.attachments.attachment;
		if (!(tracks instanceof Array)) { tracks = [tracks]; }
		if (!(attachments instanceof Array)) { attachments = [attachments]; }
	
		for (var i=0;i<tracks.length;++i) {
			var currentTrack = tracks[i];
			var currentStream = streams[currentTrack.type];
			if (currentStream == undefined) { currentStream = { sources:{} }; }

			var videotype = currentTrack.mimetype.split("/");

			if (videotype[0] == "video") {
				currentStream.sources[videotype[1]] = {
					src:  currentTrack.url,
					type: currentTrack.mimetype
				}
			}
			
			streams[currentTrack.type] = currentStream;
		}
	

		var frameList = {}
		var frameListHD = {}
		var imageSource = {frames:{}, duration: parseInt(paella.matterhorn.episode.mediapackage.duration/1000)}
		var imageSourceHD = {frames:{}, duration: parseInt(paella.matterhorn.episode.mediapackage.duration/1000)}
		for (var i=0;i<attachments.length;++i) {
			var currentAttachment = attachments[i];

			if (currentAttachment.type == "presentation/segment+preview+hires") {
				if (/time=T(\d+):(\d+):(\d+)/.test(currentAttachment.ref)) {
					time = parseInt(RegExp.$1)*60*60 + parseInt(RegExp.$2)*60 + parseInt(RegExp.$3);
					imageSourceHD.frames["frame_"+time] = currentAttachment.url;
                			frameListHD[time] = {id:'frame_'+time, mimetype:currentAttachment.mimetype, time:time, url:currentAttachment.url};
				}
			}
			else if (currentAttachment.type == "presentation/segment+preview") {
				if (/time=T(\d+):(\d+):(\d+)/.test(currentAttachment.ref)) {
					time = parseInt(RegExp.$1)*60*60 + parseInt(RegExp.$2)*60 + parseInt(RegExp.$3);
					imageSourceHD.frames["frame_"+time] = currentAttachment.url;
                			frameList[time] = {id:'frame_'+time, mimetype:currentAttachment.mimetype, time:time, url:currentAttachment.url};
				}
			}
			else if (currentAttachment.type == "presentation/player+preview") {
				streams["presentation/delivery"].preview = currentAttachment.url;
			}
			else if (currentAttachment.type == "presenter/player+preview") {
				streams["presenter/delivery"].preview = currentAttachment.url;
			}
		}

		if (frameList != {}) {	this.frameList = frameList; } else { this.frameList = frameListHD; }

		var presenter = streams["presenter/delivery"];
		var presentation = streams["presentation/delivery"];
		
		if (imageSourceHD.frames != {}) {
			presentation.sources.image = imageSourceHD;
		}
		else if (imageSource.frames != {}) {
			presentation.sources.image = imageSource;
		}

		this.streams.push(presenter);
		this.streams.push(presentation);
	
		console.log(presentation);	
		// Callback
		this.loadStatus = true;
		onSuccess();
	}
});



paella.dataDelegates.MHAnnotationServiceDefaultDataDelegate = Class.create(paella.DataDelegate,{
	initialize:function() {
	},

	serializeKey:function(context,params) {
		if (typeof(params)=='object') params = JSON.stringify(params);
		return context + '|' + params;
	},

	read:function(context,params,onSuccess) {
		var episodeId = paella.initDelegate.getId();
		paella.ajax.get({url: '/annotation/annotations.json', params: {episode: episodeId, type: "paella/"+context}},	
			function(data, contentType, returnCode) { 
 				var annotations = data.annotations.annotation;
				if (!(annotations instanceof Array)) { annotations = [annotations]; }
				if (annotations.length > 0) {
					if (annotations[0] && annotations[0].value) {
						onSuccess(JSON.parse(annotations[0].value), true); 
					}
					else{
						onSuccess({}, true);
					}
				}
				else {
					onSuccess(undefined, false);
				}
			},
			function(data, contentType, returnCode) { onSuccess(undefined, false); }
		);
	},

	write:function(context,params,value,onSuccess) {
		var episodeId = paella.initDelegate.getId();
		if (typeof(value)=='object') value = JSON.stringify(value);

		paella.ajax.get({url: '/annotation/annotations.json', params: {episode: episodeId, type: "paella/"+context}},	
			function(data, contentType, returnCode) { 
				if (data.annotations.annotation) {
					var annotationId = data.annotations.annotation.annotationId
					paella.ajax.put({ url: '/anonation/'+ annotationId, params: { value: value }},	
						function(data, contentType, returnCode) { onSuccess({}, true); },
						function(data, contentType, returnCode) { onSuccess({}, false); }
					);
				}
				else {
					paella.ajax.put({ url: '/anonation/', 
						params: {
							episode: episodeId, 
							type: 'paella/' + context,
							value: value,
							'in': 0
						}},	
						function(data, contentType, returnCode) { onSuccess({}, true); },
						function(data, contentType, returnCode) { onSuccess({}, false); }
					);
				}
			},
			function(data, contentType, returnCode) { onSuccess({}, false); }
		);
	},
        
	remove:function(context,params,onSuccess) {
		var episodeId = paella.initDelegate.getId();

		paella.ajax.get({url: '/annotation/annotations.json', params: {episode: episodeId, type: "paella/"+context}},	
			function(data, contentType, returnCode) {
 				var annotations = data.annotations.annotation;
				if (!(annotations instanceof Array)) { annotations = [annotations]; }
				var asyncLoader = new paella.AsyncLoader();
				for ( var i=0; i< annotations.length; ++i) {
					var annotationId = data.annotations.annotation.annotationId;
					asyncLoader.addCallback(new paella.JSONLoader({url:'/annotation/'+annotationId}, "DELETE"));
				}
				asyncLoader.load(function(){ onSuccess({}, true); }, function() { onSuccess({}, false); });
			},
			function(data, contentType, returnCode) { onSuccess({}, false); }
		);
	}
});

paella.dataDelegates.MHAnnotationServiceTrimmingDataDelegate = Class.create(paella.dataDelegates.MHAnnotationServiceDefaultDataDelegate,{
	read:function(context,params,onSuccess) {
		this.parent(context, params, function(data,success) {
			if (success){
				if (data.trimming) {
					onSuccess(data.trimming, success);
				}
				else{
					onSuccess(data, success);
				}
			}
			else {
				onSuccess(data, success);
			}
		});
	},
	write:function(context,params,value,onSuccess) {
		this.parent(context, params, {trimming: value}, onSuccess);
	}
});

function initPaellaMatterhorn(episodeId, onSuccess, onError) {

	base.ajax.get({url:'/search/episode.json', params:{'id': episodeId}},
		function(data,contentType,code) {
			paella.matterhorn.episode = data['search-results'].result;
			var asyncLoader = new paella.AsyncLoader();

			var serie = paella.matterhorn.episode.mediapackage.series;

			asyncLoader.addCallback(new paella.JSONLoader({url:'/series/'+serie+'.json'}), "serie");
			asyncLoader.addCallback(new paella.JSONLoader({url:'/series/'+serie+'/acl.json'}), "acl");
			asyncLoader.addCallback(new paella.JSONLoader({url:'/info/me.json'}), "me");

			asyncLoader.load(function() {
					//Check for series
					paella.matterhorn.serie = asyncLoader.getCallback("serie").data;
					//Check for acl
					paella.matterhorn.acl = asyncLoader.getCallback("acl").data;
					//Check for me
					paella.matterhorn.me = asyncLoader.getCallback("me").data;
					if (onSuccess) onSuccess();
				},
				function() {
					if (onError) onError();
				}
			);
		},
		function(data,contentType,code) { if (onError) onError(); }
	);
}

function loadPaella(containerId) {
	var initDelegate = new paella.InitDelegate({accessControl:new MHAccessControl(),videoLoader:new MHVideoLoader()});
	var id = paella.utils.parameters.get('id');

	initPaellaMatterhorn(id, function() {initPaellaEngage(containerId,initDelegate);});
}

function loadPaellaExtended(containerId) {
	var initDelegate = new paella.InitDelegate({accessControl:new MHAccessControl(),videoLoader:new MHVideoLoader()});
	var id = paella.utils.parameters.get('id');

	initPaellaMatterhorn(id, function() {initPaellaExtended({containerId:containerId,initDelegate:initDelegate});});
}
