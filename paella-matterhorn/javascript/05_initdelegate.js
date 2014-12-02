
function initPaellaMatterhornMe(onSuccess, onError) {

	base.ajax.get({url:'/info/me.json'},
		function(data,contentType,code) {
			paella.matterhorn.me = data;
			if (onSuccess) onSuccess();
		},
		function(data,contentType,code) { if (onError) onError(); }
	);
}

function initPaellaMatterhorn(episodeId, onSuccess, onError) {

	initPaellaMatterhornMe(
		function(){
			base.ajax.get({url:'/search/episode.json', params:{'id': episodeId}},
				function(data,contentType,code) {
					paella.matterhorn.episode = data['search-results'].result;
					var asyncLoader = new paella.AsyncLoader();
		
					if (paella.matterhorn.episode) {
						var serie = paella.matterhorn.episode.mediapackage.series;
						
						if (serie != undefined) {
							asyncLoader.addCallback(new paella.JSONCallback({url:'/series/'+serie+'.json'}), "serie");
							asyncLoader.addCallback(new paella.JSONCallback({url:'/series/'+serie+'/acl.json'}), "acl");
						
							asyncLoader.load(function() {
									//Check for series
									paella.matterhorn.serie = asyncLoader.getCallback("serie").data;
									//Check for acl
									paella.matterhorn.acl = asyncLoader.getCallback("acl").data;
									if (onSuccess) onSuccess();
								},
								function() {
									if (onError) onError();
								}
							);
						}
						else {
							if (onSuccess) onSuccess();						
						}
					}
					else {
						if (onError) onError();
					}
				},
				function(data,contentType,code) { if (onError) onError(); }
			);
		},
		function() { if (onError) onError(); }
	);
}



paella.matterhorn.InitDelegate = Class.create(paella.InitDelegate,{
	loadConfig:function(onSuccess) {
		var configUrl = this.initParams.configUrl;
		var params = {};
		params.url = configUrl;
		paella.ajax.get(params,function(data, type, returnCode, responseRaw) {
				if (typeof(data)=='string') {
					try {
						data = JSON.parse(data);
					}
					catch (e) {
						onSuccess({});
					}
				}
				onSuccess(data);
			},
			function(data, type,returnCode, responseRaw) {
				if (returnCode == 200){
					if (typeof(responseRaw)=='string') {
						try {
							data = JSON.parse(responseRaw);
						}
						catch (e) {
							data = {};
						}
					}
					onSuccess(data);
				}
				else{
					onSuccess({});
				}
			});
	}
});

function loadPaella(containerId, onSuccess) {
	var initDelegate = new paella.matterhorn.InitDelegate({accessControl:new MHAccessControl(),videoLoader:new MHVideoLoader()});
	var id = paella.utils.parameters.get('id');

	initPaellaMatterhorn(id,
		function() {
			initPaellaEngage(containerId,initDelegate);
			if (onSuccess) onSuccess();
		},
		function() {
			if (paella.matterhorn.me.username == "anonymous") {
				window.location.href = "auth.html?redirect=" + encodeURIComponent(window.location.href);
			}
			else {
				paella.messageBox.showError("Error loading video " + id);
			}		
		}
	);
}

function loadPaellaExtended(containerId, onSuccess) {
	var initDelegate = new paella.matterhorn.InitDelegate({accessControl:new MHAccessControl(),videoLoader:new MHVideoLoader()});
	var id = paella.utils.parameters.get('id');

	initPaellaMatterhorn(id,
		function() {
			initPaellaExtended({containerId:containerId,initDelegate:initDelegate});
			new base.Timer(function(timer) {
				if (paella.player) {
					timer.repeat = false;
					paella.player.onresize();
				}
				else {
					timer.repeat = true;
				}
			}, 100);
			if (onSuccess) onSuccess();
		},
		function() {
			if (paella.matterhorn.me.username == "anonymous") {
				window.location.href = "auth.html?redirect=" + encodeURIComponent(window.location.href);
			}
			else {
				paella.messageBox.showError("Error loading video " + id);
			}		
		}
	);
}

function loadPaellaEditor(containerId) {
    var EditorInitDelegate = Class.create(paella.matterhorn.InitDelegate,{
            loadConfig:function(onSuccess) {
				this.parent(function(data) {
					if (data.editor) {
						data.editor.loadOnStartup = true;
					}
					if (onSuccess) { onSuccess(data); }
				});
            }
    });

	var initDelegate = new EditorInitDelegate({accessControl:new MHAccessControl(),videoLoader:new MHVideoLoader()});
	var id = paella.utils.parameters.get('id');

	initPaellaMatterhorn(id, function() {initPaellaEngage(containerId,initDelegate);});
}
