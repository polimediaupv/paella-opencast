paella.plugins.SingleVideoExportEditorPlugin = Class.create(paella.editor.TrackPlugin,{
	tracks:[],
	selectedTrackItem:null,
	videoCount: 1,
	
	checkEnabled:function(onSuccess) {
		var thisClass = this;
		paella.data.read('MultipleVideoExport', {id:paella.initDelegate.getId()}, function(data, status) {
			if (data && typeof(data)=='object' && data.length>0) {
				thisClass.tracks = data;
			}
			onSuccess(true);
		});
	},

	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Video':'Video',
				'Title':'Título',
				'Presenter':'Ponente',
				'Serie': 'Serie',				
				'Multiple Video Export': 'Exportar multiples videos',
				'Send': 'Enviar'				
			};
			paella.dictionary.addDictionary(esDict);
		}
	},

	getTrackItems:function() {
		return this.tracks;
	},
	
	getTools:function() {
		return [
			{name:'create',label:paella.dictionary.translate('Create'),hint:paella.dictionary.translate('Create a new track in the current position')},
			{name:'delete',label:paella.dictionary.translate('Delete'),hint:paella.dictionary.translate('Delete selected track')}
		];
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
				var start = paella.player.videoContainer.currentTime();
				var itemDuration  = paella.player.videoContainer.duration()*0.1;
				itemDuration = itemDuration*100/paella.editor.instance.bottomBar.timeline.zoom;
				var end = start + itemDuration;
				if (end > paella.player.videoContainer.duration() ) { end = paella.player.videoContainer.duration(); }
				for (var i=0; i<this.tracks.length; ++i) {
					var track = this.tracks[i];
					if ( (track.s>start) && (track.s<end) ) {
						end = track.s;
					}
				}				
				
				var id = this.getTrackUniqueId();
				var creator = '';
				var serie = '';
				if (paella.matterhorn.episode.mediapackage.series) {
					serie = paella.matterhorn.episode.mediapackage.series;
				}
				if ( (paella.matterhorn.episode.mediapackage.creators) && (paella.matterhorn.episode.mediapackage.creators.creator) ) {
					creator = paella.matterhorn.episode.mediapackage.creators.creator;
				}
				
				var metadata = {
					title: paella.dictionary.translate('Video') + ' ' + + this.videoCount,
					presenter: creator,
					serie: serie
				}
				this.videoCount = this.videoCount +1;
				this.tracks.push({id:id, s:start, e:end, name:metadata.title, metadata: metadata});
				this.selectedTrackItem = this.getTrackItem(id);
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
		this.selectedTrackItem.metadata.title = title;
		this.selectedTrackItem.name = title;
		// TODO: Repaint
	},
	
	buildToolTabContent:function(tabContainer) {
		if (this.selectedTrackItem) {
			var thisClass = this;
			var root = document.createElement('div');
			root.id = 'SingleVideoExportEditorTabBarRoot';
			
			var basicMetadata = document.createElement('div');
			root.appendChild(basicMetadata);
			basicMetadata.appendChild(this.createAInputEditor(paella.dictionary.translate('Title'), this.selectedTrackItem.metadata.title, function(value){thisClass.changeTitle(value);}));
			basicMetadata.appendChild(this.createAInputEditor(paella.dictionary.translate('Presenter'), this.selectedTrackItem.metadata.presenter, function(value){thisClass.selectedTrackItem.metadata.presenter = value;}));
			basicMetadata.appendChild(this.createAInputEditor(paella.dictionary.translate('Serie'), this.selectedTrackItem.metadata.serie, function(value){thisClass.selectedTrackItem.metadata.serie = value;}));
	
	
			var sendDiv = document.createElement('div');
			root.appendChild(sendDiv);
			var sendButton = document.createElement('button');
			sendButton.innerHTML = paella.dictionary.translate('Send');
			$(sendButton).click(function(event){thisClass.exportVideos();});
			sendDiv.appendChild(sendButton);
			
			
			tabContainer.appendChild(root);
		}
	},	
	
	exportVideos:function(){
	
		for (var i=0; i<this.tracks.length; ++i) {
			paella.debug.log('Exporting track item ' + i.toString());
			this.exportOneVideo(this.tracks[i]);
		}
	
	
		paella.messageBox.showMessage("TODO: Upload to matterhorn a new mediapackage!")
	},	

	ConditionalCallback: Class.create(paella.AsyncLoaderCallback,{
		loaderCallbaback: null,
		conditionalFunc: null,
		
		initialize:function(loaderCallback, condifionalFunc) {
			this.name = "conditionalCallback";
			this.loaderCallback = loaderCallback;
			this.condifionalFunc = condifionalFunc;
		},
		load:function(onSuccess,onError) {
			var cond = true;
			if (this.condifionalFunc && typeof(this.condifionalFunc)=='function') {
				cond = this.condifionalFunc();
			}
			
			if (cond) {
				this.loaderCallback.load(onSuccess,onError);
			}
			else {
				onSuccess();
			}
		}
	}),

	exportOneVideo:function(trackitem) {
		var serieId = null;
		var dc_serie = null;
		var mediapackage = null;

		var asyncLoader = new paella.AsyncLoader();		
	
		// Get the serie XML	
		if (trackitem.metadata.serie) {
			paella.debug.log('Serie ' + trackitem.metadata.serie);
			serieId = trackitem.metadata.serie; //'17387ec5-f072-4161-a327-e452be846d0a';
			
			// 1.- Get the serie http://matterhorn.cc.upv.es:8080/series/17387ec5-f072-4161-a327-e452be846d0a.xml
			var serieCB = new paella.AjaxCallback({url:'/series/'+serieId+'.xml'});
			
			serieCB.didLoadSuccess = function(callback) {
				if (callback.statusCode == 200) {
						dc_serie = callback.rawData;
						paella.debug.log('Seie text: ' + dc_serie);
				}
				return true;
			};
			asyncLoader.addCallback(serieCB, 'serie');		
		}
		else {
			paella.debug.log('No Serie');
		}
		
		
		// Create the mediapackage
		createMediaPackageCB = new paella.AjaxCallback({url:'/ingest/createMediaPackage'});
		createMediaPackageCB.didLoadSuccess = function(callback) { mediapackage = callback.rawData; paella.debug.log('MP: ' + mediapackage); return true;}
		asyncLoader.addCallback(createMediaPackageCB, 'createMediaPackage');	
		
		
		// Add the Serie
		var addSerieCB = new paella.AjaxCallback({},'POST');
		addSerieCB.getParams = function(){
			return {url:'/ingest/addDCCatalog', params: {
				'mediaPackage': mediapackage,
				'dublinCore': dc_serie,
				'flavor': 'dublincore/serie'
				}
			};
		}
		addSerieCB.didLoadSuccess = function(callback) { mediapackage = callback.rawData; paella.debug.log('MP: ' + mediapackage); return true;}
		var conditionalAddSerieCB = new this.ConditionalCallback(addSerieCB, function(){ return (dc_serie != null); });
		asyncLoader.addCallback(conditionalAddSerieCB, 'addSerie');	
		

		// Add the Episode
		var dc_episode = "";
		var addEpisodeCB = new paella.AjaxCallback({},'POST');
		addEpisodeCB.getParams = function(){
			return {url:'/ingest/addDCCatalog', params: {
				'mediaPackage': mediapackage,
				'dublinCore': dc_episode,
				'flavor': 'dublincore/episode'
				}
			};
		}
		addEpisodeCB.didLoadSuccess = function(callback) { mediapackage = callback.rawData; paella.debug.log('MP: ' + mediapackage); return true;}
		asyncLoader.addCallback(addEpisodeCB, 'addEpisode');	

		
		// Add the tracks
		var tracks = paella.matterhorn.episode.mediapackage.media.track;
		for (var i=0; i<tracks.length; ++i) {
			
			var addTrackCB = new paella.AjaxCallback({url:'/ingest/addTrack', params:{
					'mediaPackage': mediapackage, 
					'url': paella.matterhorn.episode.mediapackage.media.track[i].url, 
					'flavor': paella.matterhorn.episode.mediapackage.media.track[i].type}
				}, 'POST');
			addTrackCB.getParams = function(){
				this.params.params.mediaPackage = mediapackage;
				return this.params;
			}
			addTrackCB.didLoadSuccess = function(callback) { mediapackage = callback.rawData; paella.debug.log('MP: ' + mediapackage); return true;}
			asyncLoader.addCallback(addTrackCB, 'addTrack'+i);			
		}

		
		// Add the SMIL 
		
		
		
		// Make all operations
		asyncLoader.load();

		//TODO: Ingest!!!
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
		return "es.upv.paella.matterhorn.editor.MultipleVideoExportEditorPlugin";
	},
	
	getTrackName:function() {
		return paella.dictionary.translate("Multiple Video Export");
	},
	
	getColor:function() {
		return 'rgb(141, 220, 245)';
	},
	
	getTextColor:function() {
		return 'rgb(90,90,90)';
	},
	
	onTrackChanged:function(id,start,end) {
		var joinTracks = null;
		paella.events.trigger(paella.events.documentChanged);
		var item = this.getTrackItem(id);
		this.selectedTrackItem = item;
		if (item) {
			if (start < 0) {start = 0;}
			if (end > paella.player.videoContainer.duration() ) { end = paella.player.videoContainer.duration(); }
			
			item.s = start;
			item.e = end;		
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
		paella.data.write('MultipleVideoExport',{id:paella.initDelegate.getId()}, this.tracks, function(response,status) {
			success(status);
		});			
	}
});

paella.plugins.singleVideoExportEditorPlugin = new paella.plugins.SingleVideoExportEditorPlugin();


