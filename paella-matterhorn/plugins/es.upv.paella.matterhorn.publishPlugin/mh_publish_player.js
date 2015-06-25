////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Loader Publish Plugin
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
paella.plugins.PublishPlugin = Class.create(paella.EventDrivenPlugin,{
		
	getSubclass:function() { return "publishPlugin"; },
	getName:function() { return 'es.upv.paella.matterhorn.publishPlugin'; },
	
	
	checkEnabled:function(onSuccess) {
		this.loadPublish();
		onSuccess(true);
	},
		
	getEvents:function() {
		return [paella.events.loadComplete];
	},

	onEvent:function(eventType,params) {
		switch (eventType) {
			case paella.events.loadComplete:
				this.loadPublish();
				break;
		}
	},	
	
	loadPublish:function() {
		var thisClass = this;
		
		paella.data.read('publish',{id:paella.initDelegate.getId()},function(data,status) {
			if (status == true) {
				thisClass.checkPublish(data);
			}
			else {
				thisClass.noPublishInfo();
			}
		});
	},	
	
	checkPublish:function(data) {
		if (paella.initDelegate.initParams.accessControl.permissions.canWrite) {
			if (data == false){
				this.showOverlayMessage("This video is not published. Edit the video to publish it.");
			}
			else if ((data == "undefined") || (data === undefined)) {
				this.showOverlayMessage("This video is not published. It will be published automatically in a few days. Edit the video to change this behaviour.");
			}
		}
		else {
			if ((data == false) || (data == "undefined") || (data == undefined)){
				if (paella.initDelegate.initParams.accessControl.permissions.isAnonymous == true) {
					paella.player.unloadAll(paella.dictionary.translate("This video is not published. If you are the author, Log In to publish it."));
					window.href = "auth.html?redirect="+encodeURIComponent(window.href);
				}
				else {					
					paella.player.unloadAll(paella.dictionary.translate("This video is not published."));
				}						
			}
		}
	},	
		
	showOverlayMessage:function(message) {
		var overlayContainer = paella.player.videoContainer.overlayContainer;
		var rect = {left:40, top:50, width:1200, height:80};
		
		var root = document.createElement("div");
		root.className = 'publishVideoOverlay';
		var element = document.createElement("div");
		element.className = 'publishVideoNotPublished';
		element.innerHTML = paella.dictionary.translate(message);
		
		root.appendChild(element);
		
		overlayContainer.addElement(root, rect);	
	},
	
	noPublishInfo:function() {
		var defaultValue = true;
		if (this.config.defaultValue != undefined) {
			defaultValue = this.config.defaultValue;
		}
		this.checkPublish(defaultValue);
	}
});

paella.plugins.publishPlugin = new paella.plugins.PublishPlugin();
