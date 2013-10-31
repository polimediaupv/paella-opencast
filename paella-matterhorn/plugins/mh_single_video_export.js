paella.plugins.SingleVideoExportEditorPlugin = Class.create(paella.editor.TrackPlugin,{
	tracks:[],
	metadata: null,
	selectedTrackItem:null,
	
	checkEnabled:function(onSuccess) {
		var thisClass = this;
		paella.data.read('SingleVideoExport', {id:paella.initDelegate.getId()}, function(data, status) {
			if (data && typeof(data)=='object') {
				
				if(data.trackItems && data.trackItems.length>0) {
					thisClass.tracks = data.trackItems;
				}
				if(data.metadata) {
					thisClass.metadata = data.metadata;
				}
			}
			onSuccess(true);
		});
	},

	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Title':'Título',
				'Presenter':'Ponente',
				'Serie': 'Serie',
				'Single Video 1': 'Video 1',
				'Single Video Export': 'Exportar un video',
				'Send': 'Enviar'
			};
			paella.dictionary.addDictionary(esDict);
		}
		if (this.metadata == null) {
			var creator = '';
			var serie = '';
			if (paella.matterhorn.episode.mediapackage.series) {
				serie = paella.matterhorn.episode.mediapackage.series;
			}
			if ( (paella.matterhorn.episode.mediapackage.creators) &&(paella.matterhorn.episode.mediapackage.creators.creator) ) {
				creator = paella.matterhorn.episode.mediapackage.creators.creator;
			}
			
			this.metadata = {
				title: paella.dictionary.translate('Single Video 1'),
				presenter: creator,
				serie: serie
			
			}				
		}
	},

	getTrackItems:function() {
		return this.tracks;
	},
	
	getTools:function() {
		return [
			{name:'create',label:paella.dictionary.translate('Create'),hint:paella.dictionary.translate('Create a new track item in the current position')},
			{name:'delete',label:paella.dictionary.translate('Delete'),hint:paella.dictionary.translate('Delete selected track item')}
		];
	},
	
	isCurrentPositionInsideATrackItem: function(){
		var start = paella.player.videoContainer.currentTime();
		var startInsideTrackItem = false;
		for (var i=0; i<this.tracks.length; ++i) {
			var track = this.tracks[i];
			if ( (track.s<=start) && (start<=track.e) ){
				startInsideTrackItem = true;
				break;
			}
		}
		return startInsideTrackItem;		
	},
	
	isToolEnabled:function(toolName) {
		switch (toolName) {
			case 'create': 
				return (this.isCurrentPositionInsideATrackItem() == false); 
				break;
				
			case 'delete': 
				if (this.selectedTrackItem)
					return true;
				break;
				
			default:
				return true;
		}
		return false;		
	},
	
	onToolSelected:function(toolName) {
		switch (toolName) {
			case 'delete':
				if (this.selectedTrackItem) {
					paella.events.trigger(paella.events.documentChanged);
					this.tracks.splice(this.tracks.indexOf(this.selectedTrackItem),1);
					return true;
				}
				break;
				
			case 'create':
				paella.events.trigger(paella.events.documentChanged);								
				if (this.isCurrentPositionInsideATrackItem() == false) {
					var start = paella.player.videoContainer.currentTime();
					var itemDuration  = paella.player.videoContainer.duration()*0.1;
					itemDuration = itemDuration*100/paella.editor.instance.bottomBar.timeline.zoom;
					var end = start + itemDuration; //paella.editor.instance.bottomBar.timeline.zoom
					if (end > paella.player.videoContainer.duration() ) { end = paella.player.videoContainer.duration(); }
					for (var i=0; i<this.tracks.length; ++i) {
						var track = this.tracks[i];
						if ( (track.s>start) && (track.s<end) ) {
							end = track.s;
						}
					}				
					
					var id = this.getTrackUniqueId();
					var content = this.metadata.title;
					this.tracks.push({id:id, s:start, e:end, name:content});
				}
				else{
					alert ("Can not create a track item.");
				}
				return true;
				break;
		}
	},
	
	createAInputEditor:function(label, defaultValue, callback){
		var root = document.createElement('div');

		var titleTxt = document.createElement('div');
		titleTxt.innerHTML = label
		root.appendChild(titleTxt);
		var titleInput = document.createElement('input');
		titleInput.type = "text";
		titleInput.value = defaultValue;
		$(titleInput).keyup(function(event){callback(event.srcElement.value);});
		root.appendChild(titleInput);	
		
		return root;
	},
	
	changeTitle:function(title) {
		this.metadata.title = title;
		for (var i=0;i<this.tracks.length;++i) {
			this.tracks[i].name = title;
		}
		// TODO: Repaint
	},
	
	buildToolTabContent:function(tabContainer) {
		var thisClass = this;
		var root = document.createElement('div');
		root.id = 'SingleVideoExportEditorTabBarRoot';
		
		var basicMetadata = document.createElement('div');
		root.appendChild(basicMetadata);
		basicMetadata.appendChild(this.createAInputEditor(paella.dictionary.translate('Title'), this.metadata.title, function(value){thisClass.changeTitle(value);}));
		basicMetadata.appendChild(this.createAInputEditor(paella.dictionary.translate('Presenter'), this.metadata.presenter, function(value){thisClass.metadata.presenter = value;}));
		basicMetadata.appendChild(this.createAInputEditor(paella.dictionary.translate('Serie'), this.metadata.serie, function(value){thisClass.metadata.serie = value;}));


		var sendDiv = document.createElement('div');
		root.appendChild(sendDiv);
		var sendButton = document.createElement('button');
		sendButton.innerHTML = paella.dictionary.translate('Send');
		$(sendButton).click(function(event){thisClass.exportVideo();});
		sendDiv.appendChild(sendButton);
		
		
		tabContainer.appendChild(root);
	},
	
	exportVideo:function(){
		paella.messageBox.showMessage("TODO: Upload to matterhorn a new mediapackage!")
	},
	
	getTrackUniqueId:function() {
		var newId = -1;
		if (this.tracks.length==0) return 1;
		for (var i=0;i<this.tracks.length;++i) {
			if (newId<=this.tracks[i].id) {
				newId = this.tracks[i].id + 1;
			}
		}
		return newId;
	},
	
	getName:function() {
		return "es.upv.paella.matterhorn.editor.SingleVideoExportEditorPlugin";
	},
	
	getTrackName:function() {
		return paella.dictionary.translate("Single Video Export");
	},
	
	getColor:function() {
		return 'rgb(176, 214, 118)';
	},
	
	getTextColor:function() {
		return 'rgb(90,90,90)';
	},
	
	onTrackChanged:function(id,start,end) {
		var joinTracks = true;
		paella.events.trigger(paella.events.documentChanged);
		var item = this.getTrackItem(id);
		this.selectedTrackItem = item;
		if (item) {
			if (start < 0) {start = 0;}
			if (end > paella.player.videoContainer.duration() ) { end = paella.player.videoContainer.duration(); }
			
			//check for cancel
			for (var i=0; i<this.tracks.length; ++i) {
				if (this.tracks[i].id != id) {
					if ( (this.tracks[i].s <= start) && (this.tracks[i].e >= end) ){
						return;
					}
					if ( (this.tracks[i].s >= start) && (this.tracks[i].e <= end) ){
						return;
					}
				}
			}

			// check for overlap
			for (var i=0; i<this.tracks.length; ++i) {
				if (this.tracks[i].id != id) {
					if ( (this.tracks[i].s < start) && (this.tracks[i].e > start) ){
						if (joinTracks == null) {
							joinTracks = confirm ("Join Tracks?");
						}
						if (joinTracks){
							this.tracks[i].e = end;
							this.tracks.splice(this.tracks.indexOf(item), 1);
							return;								
						}
						else{
							start = this.tracks[i].e;
						}
					}
					if ( (this.tracks[i].s < end) && (this.tracks[i].e > end) ){
						if (joinTracks == null) {
							joinTracks = confirm ("Join Tracks?");
						}
						if (joinTracks){
							this.tracks[i].s = start;
							this.tracks.splice(this.tracks.indexOf(item), 1);
							return;								
						}
						else {
							end = this.tracks[i].s;
						}
					}	
				}
			
				item.s = start;
				item.e = end;
			}
		}
	},
	
	allowEditContent:function() {
		return false;
	},
	
	getTrackItem:function(id) {
		for (var i=0; i<this.tracks.length; ++i) {
			if (this.tracks[i].id==id) return this.tracks[i];
		}
	},
	
	contextHelpString:function() {
		if (paella.utils.language()=="es") {
			return "Utiliza esta herramienta para crear, borrar y editar descansos. Para crear un descanso, selecciona el instante de tiempo haciendo clic en el fondo de la línea de tiempo, y pulsa el botón 'Crear'. Utiliza esta pestaña para editar el texto de los descansos";
		}
		else {
			return "Use this tool to create, delete and edit breaks. To create a break, select the time instant clicking the timeline's background and press 'create' button. Use this tab to edit the break text.";
		}
	},
	
	onSave:function(success) {
		var data = {
			trackItems:this.tracks,
			metadata: this.metadata
		};
		paella.data.write('SingleVideoExport',{id:paella.initDelegate.getId()}, data, function(response,status) {
			success(status);
		});		
	}
});

paella.plugins.singleVideoExportEditorPlugin = new paella.plugins.SingleVideoExportEditorPlugin();


