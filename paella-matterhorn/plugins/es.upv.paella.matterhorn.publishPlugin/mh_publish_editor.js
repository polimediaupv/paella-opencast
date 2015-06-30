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

	getName:function() { return "es.upv.paella.matterhorn.editor.publishPlugin"; },

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
				value = "true";
			}
			else if (this.status == "Publish automatically"){
				value = "undefined";
			}
			else if (this.status == "Do not publish"){
				value = "false";
			}
		}	

		paella.data.write('publish', {id:paella.initDelegate.getId()}, value, function(response,status) {
			onSuccess(status);
		});
	}
});

paella.plugins.publishEditorPlugin = new paella.plugins.PublishEditorPlugin();
