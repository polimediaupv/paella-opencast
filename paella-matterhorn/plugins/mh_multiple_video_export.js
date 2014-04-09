paella.plugins.MultipleVideoExportEditorPlugin = Class.create(paella.editor.TrackPlugin,{
	tracks:[],
	sent: null,
	inprogress: null,
	tabContainer: null,	
	selectedTrackItem:null,
	videoCount: 1,
	
	strings: {
		ToEditHeader1: 'This tool exports new videos. It is required that you set the new Title, the Author and the Series in which those videos will be located.',
		ToEditHeader2: 'Please select the area you want to export by clicking on the Create button. You can select multiple parts of the video. Each part will be exported as a new Video.',
	
		SentToProcess1: 'You have requested to export new videos from this. Your request will comply as soon as possible.',
		SentToProcess2: 'If you wish, you can cancel this video exports.',
		
		InProgress1: "The videos waere sent to be processed. When finished you can display the processed videos on the following links.",
		InProgress2: "If you want, you can start a new video exports."
	},	
	
	
	isSentToProccess: function() {
		return this.sent != null;
	},
	isInProgress: function() {
		return this.inprogress != null;
	},	

	checkEnabled:function(onSuccess) {
		this.onRead(function(){onSuccess(true);});	
	},

	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Title':'Título',
				'Presenter':'Ponente',
				'Series': 'Serie',
				'Video':'Video',
				'Multiple Video Export': 'Exportar multiples videos',
				'Can not create a new video segment inside a segment': 'No se puede crear un nuevo segmento de video dentro de un segmento',
				'Send': 'Enviar',
				'Cancel': 'Cancelar',
				'New Video Export': 'Nueva exportación',
				'An error has occurred': 'Ha ocurrido un error'						
			};
			
			esDict[this.strings.ToEditHeader1] = 'Esta herramienta puede exportar nuevos videos. Es necesario que especifiques el nuevo titulo, autor y la serie de cada uno de estos videos.';			
			esDict[this.strings.ToEditHeader2] = 'Por favor, selecciona el area que quieras exportar pulsando el boton de "Crear". Puedes seleccionar multiples partes del video. Cada una de estas partes se exportarán como un nuevo video.';			
			esDict[this.strings.SentToProcess1] = 'Ha solicitado exportar nuevos videos a partir de este. Su petición se atendrá lo más pronto posible.';
			esDict[this.strings.SentToProcess2] = 'Si lo desea puede cancelar la exportación de videos.';
			esDict[this.strings.InProgress1] = 'Los videos se han enviado a procesar. Cuando terminen de procesarse podrá visualizarlos en los siguiente enlaces.';
			esDict[this.strings.InProgress2] = 'Si lo desea puede empezar una nueva exportación.';
			
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
		if (this.isSentToProccess()){
			alert(paella.dictionary.translate('You can not modify the video export settings'));		
		}
		else if (this.isInProgress()){
			alert(paella.dictionary.translate('You can not modify the video export settings'));		
		}
		else{	
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
					var serieId = '';
					var serieTitle = '';

					if (paella.matterhorn.serie) {					
						serieId = paella.matterhorn.serie['http://purl.org/dc/terms/'].identifier[0].value;
						serieTitle = paella.matterhorn.serie['http://purl.org/dc/terms/'].identifier[0].value;
					}
					if ( (paella.matterhorn.episode.mediapackage.creators) && (paella.matterhorn.episode.mediapackage.creators.creator) ) {
						creator = paella.matterhorn.episode.mediapackage.creators.creator;
					}
					
					var metadata = {
						title: paella.dictionary.translate('Video') + ' ' + + this.videoCount,
						presenter: creator,
						serieId: serieId,
						serieTitle: serieTitle
					}
					this.videoCount = this.videoCount +1;
					this.tracks.push({id:id, s:start, e:end, name:metadata.title, metadata: metadata});
					this.selectedTrackItem = this.getTrackItem(id);
					return true;
					break;
			}
		}
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
				url: '/series/series.json?q=%QUERY',
				filter: function(parsedResponse) {
					return jQuery.map(parsedResponse.catalogs, function (serie){
						var serieId = serie['http://purl.org/dc/terms/'].identifier[0].value;
						var title = serie['http://purl.org/dc/terms/'].title[0].value;						
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
		this.selectedTrackItem.metadata.title = title;
		this.selectedTrackItem.name = title;
		// TODO: Repaint
	},
	
	
	
	buildToolTabContentToEdit:function(tabContainer) {
		var thisClass = this;
		var root = document.createElement('div');
		root.id = 'MultipleVideoExportEditorTabBarRoot';
		
		
		var header = document.createElement('div');
		var header1 = document.createElement('p');
		var header2 = document.createElement('p');
		header1.innerText = paella.dictionary.translate(this.strings.ToEditHeader1);
		header2.innerText = paella.dictionary.translate(this.strings.ToEditHeader2);
		header.appendChild(header1);
		header.appendChild(header2);		
		root.appendChild(header);
		

		var basicMetadata = document.createElement('div');
		root.appendChild(basicMetadata);
		basicMetadata.appendChild(this.createAInputEditor(paella.dictionary.translate('Title'), this.selectedTrackItem.metadata.title, function(value){thisClass.changeTitle(value);}));
		basicMetadata.appendChild(this.createAInputEditor(paella.dictionary.translate('Presenter'), this.selectedTrackItem.metadata.presenter, function(value){ thisClass.selectedTrackItem.metadata.presenter = value; }));
		basicMetadata.appendChild(this.createASelectSerie(paella.dictionary.translate('Series'), this.selectedTrackItem.metadata, function(serieId, serieTitle){
			thisClass.selectedTrackItem.metadata.serieId = serieId;
			thisClass.selectedTrackItem.metadata.serieTitle = serieTitle;
		}));
		
		
		var sendDiv = document.createElement('div');
		sendDiv.className = "btn-group";
		root.appendChild(sendDiv);
		var sendButton = document.createElement('button');
		sendButton.className = "btn";
		sendButton.innerHTML = paella.dictionary.translate('Send');
		$(sendButton).click(function(event){
			while (thisClass.tabContainer.firstChild) {
				thisClass.tabContainer.removeChild(thisClass.tabContainer.firstChild);
			}

			thisClass.sent = true;
			thisClass.onSave(function(success){
				if (success == true){
					thisClass.buildToolTabContent(thisClass.tabContainer);
				}
				else {
					thisClass.sent = null;
					alert(paella.dictionary.translate('An error has occurred'));
				}			
			})

		});
		sendDiv.appendChild(sendButton);
		
		
		tabContainer.appendChild(root);
	},	
	
	buildToolTabContentSentToProcess:function(tabContainer) {
		var thisClass = this;
		var root = document.createElement('div');
		root.id = 'MultipleVideoExportEditorTabBarRoot';

		var info = document.createElement('div');
		info.id = "MultipleVideoExportEditorTabBarRoot_ToProcess";
		
		var text = document.createElement('p');
		text.innerText = paella.dictionary.translate(this.strings.SentToProcess1);

		var text2 = document.createElement('p');
		text2.innerText = paella.dictionary.translate(this.strings.SentToProcess2);


		var buttonBar = document.createElement('div');
		buttonBar.className = "btn-group";
		
		var cancelButton = document.createElement('button');
		cancelButton.className = "btn";
		cancelButton.innerHTML = paella.dictionary.translate('Cancel');
		$(cancelButton).click(function(event){
			while (thisClass.tabContainer.firstChild) {
				thisClass.tabContainer.removeChild(thisClass.tabContainer.firstChild);
			}
			var oldSent = thisClass.sent;
			thisClass.sent = null;
			thisClass.onSave(function(success){
				if (success == true){
					thisClass.buildToolTabContent(thisClass.tabContainer);
				}
				else {
					thisClass.sent = oldSent;
					alert(paella.dictionary.translate('An error has occurred'));
				}
			})
		});

		
		info.appendChild(text);
		info.appendChild(text2);
		info.appendChild(buttonBar);
		buttonBar.appendChild(cancelButton);
		
		root.appendChild(info);
		tabContainer.appendChild(root);

	},	
	
	buildToolTabContentInProgress:function(tabContainer) {
		var thisClass = this;
		var root = document.createElement('div');
		root.id = 'MultipleVideoExportEditorTabBarRoot';

		var info = document.createElement('div');
		info.id = "MultipleVideoExportEditorTabBarRoot_InProgress";
		
		var text = document.createElement('p');
		text.innerText = paella.dictionary.translate(this.strings.InProgress1);

		var list = document.createElement('ul');

		for (var i =0 ; i < this.inprogress.length; ++i) {
			var link = "watch.html?id=" + this.inprogress[i].id;
			var videoLink = document.createElement('a');
			videoLink.href = link;
			videoLink.innerText = this.inprogress[i].title;

			var elist = document.createElement('li');
			list.appendChild(elist);
			elist.appendChild(videoLink);
		}

		var text2 = document.createElement('p');
		text2.innerText = paella.dictionary.translate(this.strings.InProgress2);

		var buttonBar = document.createElement('div');
		buttonBar.className = "btn-group";

		var cancelButton = document.createElement('button');
		cancelButton.className = "btn";		
		cancelButton.innerHTML = paella.dictionary.translate('New Video Export');
		$(cancelButton).click(function(event){
			while (thisClass.tabContainer.firstChild) {
				thisClass.tabContainer.removeChild(thisClass.tabContainer.firstChild);
			}
			var olsInprogress = thisClass.inprogress;
			thisClass.inprogress = null;
			thisClass.onSave(function(success){
				if (success == true){
					thisClass.tracks = [];
					paella.events.trigger(paella.events.documentChanged);
					paella.editor.instance.bottomBar.timeline.rebuildTrack(thisClass.getName());
					paella.editor.pluginManager.onTrackChanged(thisClass);
					paella.editor.instance.rightBar.updateCurrentTab();					
				}
				else {
					thisClass.inprogress = oldInprogress;
					alert(paella.dictionary.translate('An error has occurred'));
				}			
			})
		});

		
		info.appendChild(text);
		info.appendChild(list);
		info.appendChild(text2);
		info.appendChild(buttonBar);
		buttonBar.appendChild(cancelButton);
		
		root.appendChild(info);
		tabContainer.appendChild(root);
	},	
	
	buildToolTabContent:function(tabContainer) {
		this.tabContainer = tabContainer;
		
		if (this.selectedTrackItem){
			if (this.isSentToProccess()){
				this.buildToolTabContentSentToProcess(tabContainer);
			}
			else if (this.isInProgress()){
				this.buildToolTabContentInProgress(tabContainer);
			}
			else{	
				this.buildToolTabContentToEdit(tabContainer);
			}
		}		
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
			return "";
		}
		else {
			return "";
		}
	},
	
	onRead:function(onComplete) {
		var thisClass = this;
		paella.data.read('MultipleVideoExport', {id:paella.initDelegate.getId()}, function(data, status) {
			if (data && typeof(data)=='object') {
				
				if(data.trackItems && data.trackItems.length>0) {
					thisClass.tracks = data.trackItems;
				}
				if(data.sent) {
					thisClass.sent = data.sent;
				}
				if(data.inprogress) {
					thisClass.inprogress = data.inprogress;
				}
			}			
						
			onComplete(true);
		});
	},	
	
	onSave:function(onComplete) {
		var data = {
			trackItems:this.tracks,
			sent: this.sent,
			inprogress: this.inprogress
		};
			
		paella.data.write('MultipleVideoExport',{id:paella.initDelegate.getId()}, data, function(response,status) {
			onComplete(status);
		});			
	}
});

paella.plugins.multipleVideoExportEditorPlugin = new paella.plugins.MultipleVideoExportEditorPlugin();


