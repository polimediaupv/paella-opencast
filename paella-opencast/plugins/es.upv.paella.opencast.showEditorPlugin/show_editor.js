new (Class (paella.VideoOverlayButtonPlugin, {
	getName:function() {
		return "es.upv.paella.opencast.showEditorPlugin";
	},
	getSubclass:function() { return "showEditorButton"; },
	getAlignment:function() { return 'right'; },
	getIndex:function() {return 10;},
	getDefaultToolTip:function() { return base.dictionary.translate("Enter editor mode"); },

	checkEnabled:function(onSuccess) {	
		paella.initDelegate.initParams.accessControl.canWrite()
		.then((canWrite)=>{
			var enabled = (canWrite && !base.userAgent.browser.IsMobileVersion && !paella.player.isLiveStream());
			onSuccess(enabled);
		});	
	},

	action:function(button) {
		var editorPage = this.config.editorPage ? this.config.editorPage: 'editor.html';

		var editorUrl = editorPage + "?id=" + paella.player.videoIdentifier;		
		window.location.href = editorUrl;
	}

}))();
