////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Loader Publish Plugin
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
paella.plugins.PublishPlugin = Class.create(paella.EventDrivenPlugin,{
		
	getSubclass:function() { return "publishPlugin"; },
	getName:function() { return 'es.upv.paella.matterhorn.publishPlugin'; },
	
	
	checkEnabled:function(onSuccess) {
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
			else if (data == "undefined") {
				this.showOverlayMessage("This video is not published. It will be published automatically in a few days. Edit the video to change this behaviour.");
			}
		}
		else {
			if ((data == false) || (data == "undefined")){
				if (paella.initDelegate.initParams.accessControl.permissions.isAnonymous == true) {
					paella.player.unloadAll(paella.dictionary.translate("This video is not published. If you are the author, Log In to publish it."));						
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





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Editor Publish Plugin
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
paella.plugins.PublishEditorPlugin = Class.create(paella.editor.EditorToolbarPlugin,{
	status:'-',

	initialize:function() {
		this.parent();
		if (paella.utils.language()=='es') {
			paella.dictionary.addDictionary({
				'Publish':'Publicar',
				'Do not publish':'No publicar',
				'Publish automatically':'Publicar automáticamente'
			});
		}
	},

	getName:function() { return "es.upv.paella.matterhorn.publishEditorPlugin"; },

	checkEnabled:function(onSuccess) {
		var thisClass = this;
		
		paella.data.read('publish',{id:paella.initDelegate.getId()},function(data,status) {
			if (status == true) {
				if (data == true){
					thisClass.status = "Publish";
				}
				else if (data==false){
					thisClass.status = "Do not publish";
				}
				else if (data=="undefined"){
					thisClass.status = "Publish automatically";
				}			
			}
			//else {
			//	thisClass.status = "No Publish info";
			//}
		});
				
		onSuccess(true);
	},
	
	
	getButtonName:function() {
		return paella.dictionary.translate(this.status);
	},
	
	getIcon:function() {
		return "icon-share";
	},

	getOptions:function() {
		return [paella.dictionary.translate("Publish"),
				paella.dictionary.translate("Publish automatically"),
				paella.dictionary.translate("Do not publish")];
	},
	
	onOptionSelected:function(optionIndex) {
		switch (optionIndex) {
			case 0:
				this.status = "Publish";
				break;
			case 1:
				this.status = "Publish automatically";
				break;
			case 2:
				this.status = "Do not publish";
				break;
		}
	},
	
	onSave:function(onSuccess) {	
		var value="undefined";
		
		if (this.status != "-") {
			if (this.status == "Publish"){
				value = "true"
			}
			else if (this.status == "Publish automatically"){
				value = "undefined"
			}
			else if (this.status == "Do not publish"){
				value = "false"			
			}
		}	

		paella.data.write('publish', {id:paella.initDelegate.getId()}, value, function(response,status) {
			onSuccess(status);
		});
	}
});

paella.plugins.publishEditorPlugin = new paella.plugins.PublishEditorPlugin();
