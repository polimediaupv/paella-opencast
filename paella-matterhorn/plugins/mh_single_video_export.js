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
				'Join Tracks?': '¿Unir los tracks?',
				'Single Video 1': 'Video 1',
				'Single Video Export': 'Exportar un video',
				'Can not create a new video segment inside a segment': 'No se puede crear un nuevo segmento de video dentro de un segmento',
				'Send': 'Enviar'
			};
			paella.dictionary.addDictionary(esDict);
		}
		if (this.metadata == null) {
			var creator = '';
			var serieId = '';
			var serieTitle = '';
			
			if (paella.matterhorn.episode.mediapackage.series) {
				serieId = paella.matterhorn.episode.mediapackage.series;
				serieTitle = "TITLE: " + serieId;
			}
			if ( (paella.matterhorn.episode.mediapackage.creators) && (paella.matterhorn.episode.mediapackage.creators.creator) ) {
				creator = paella.matterhorn.episode.mediapackage.creators.creator;
			}
			
			this.metadata = {
				title: paella.dictionary.translate('Single Video 1'),
				presenter: creator,
				serieId: serieId,
				serieTitle: serieTitle				
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
					alert (paella.dictionary.translate("Can not create a new video segment inside a segment"));
				}
				return true;
				break;
		}
	},
	
	createALabel: function(label) {
		var root = document.createElement('div');
		root.innerHTML = label
		return root;		
	},
	createAInputEditor:function(label, defaultValue, callback){
		var root = document.createElement('div');
		var lab = this.createALabel(label);
		var titleInput = document.createElement('input');
		titleInput.type = "text";
		titleInput.value = defaultValue;
		if (callback) {
			$(titleInput).keyup(function(event){callback(event.srcElement.value);});
		}
		root.appendChild(lab);
		root.appendChild(titleInput);
		
		return root;
	},	
	createASelectSerie: function(label, defaultValue, callback) {		
		var root = document.createElement('div');
		var lab = this.createALabel(label);		


		var typeaheadDiv = document.createElement('div');
		var typeaheadInput = document.createElement('input');
		typeaheadInput.className = "typehead";
		typeaheadInput.type = "text";
		typeaheadInput.value = defaultValue.serieTitle;
		typeaheadInput.setAttribute('serieId',defaultValue.serieId);
		typeaheadInput.setAttribute('serieTitle',defaultValue.serieTitle);
		//typeaheadInput.placeholder = "";


		typeaheadDiv.appendChild(typeaheadInput);

		this.numbers = new Bloodhound({
			datumTokenizer: function(d) {return Bloodhound.tokenizers.whitespace(d.num); },
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: 'http://matterhorn.cc.upv.es:8080/series/series.json?q=%QUERY',
				filter: function(parsedResponse) {
					return jQuery.map(parsedResponse.catalogs, function (serie){
						var serieId = serie['http://purl.org/dc/terms/'].identifier[0].value;
						var title = "TITLE: " + serie['http://purl.org/dc/terms/'].title[0].value;						
						return {identifier: serieId, title:title};
					});
				}
			}
		});
		
		this.numbers.initialize();
		
		$(typeaheadInput).typeahead({
			minLength: 2,
			limit: 5,
			highlight: true,
		}, {
			displayKey: 'title',
			source: this.numbers.ttAdapter()
		});


		$(typeaheadInput).change(function(event){
			if (callback) {
				callback(event.currentTarget.getAttribute("serieId"), event.currentTarget.getAttribute("serieTitle"))
			}
		});
		
		$(typeaheadInput).keyup(function(event){
			if (event.currentTarget.getAttribute("typeaheadOpened") == "1"){	
				event.currentTarget.setAttribute("serieId", "");
				event.currentTarget.setAttribute("serieTitle", event.currentTarget.value);
			}
		});
		$(typeaheadInput).bind('typeahead:opened', function(event) {
			event.currentTarget.setAttribute("typeaheadOpened", "1");
	    });
		$(typeaheadInput).bind('typeahead:closed', function(event) {      
			event.currentTarget.setAttribute("typeaheadOpened", "");
	    });

		$(typeaheadInput).bind('typeahead:selected', function(event, datum, name) {
			event.currentTarget.setAttribute("serieId", datum.identifier);
			event.currentTarget.setAttribute("serieTitle", datum.title);
			event.currentTarget.value = datum.title;
			
			if (callback) {
	   			callback(event.currentTarget.getAttribute("serieId"), event.currentTarget.getAttribute("serieTitle"))
	   		}
	    });

		
		root.appendChild(lab);
		root.appendChild(typeaheadDiv);		
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
		basicMetadata.appendChild(this.createASelectSerie(paella.dictionary.translate('Serie'), this.metadata, function(serieId, serieTitle){
			thisClass.metadata.serieId = serieId;
			thisClass.metadata.serieTitle = serieTitle;
		}));
		

		
		
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
							joinTracks = confirm (paella.dictionary.translate("Join Tracks?"));
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
							joinTracks = confirm (paella.dictionary.translate("Join Tracks?"));
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
			return "";
		}
		else {
			return "";
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


