paella.plugins.SingleVideoExportEditorPlugin = Class.create(paella.editor.TrackPlugin,{
	tracks:[],
	selectedTrackItem:null,
	
	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},

	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Breaks':'Descansos',
				'Break':'Descanso',
				'Create a new track in the current position': 'Añade un track en el instante actual',
				'Delete selected track': 'Borra el track seleccionado'
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
		if (this.selectedTrackItem && toolName=='delete' && this.selectedTrackItem) {
			paella.events.trigger(paella.events.documentChanged);
			this.tracks.splice(this.tracks.indexOf(this.selectedTrackItem),1);
			return true;
		}
		else if (toolName=='create') {
			paella.events.trigger(paella.events.documentChanged);
			var start = paella.player.videoContainer.currentTime();			
			var end = start + 30;
			if (end > paella.player.videoContainer.duration() ) { end = paella.player.videoContainer.duration(); }
			for (var i=0; i<this.tracks.length; ++i) {
				var track = this.tracks[i];
				if ( (track.s>start) && (track.s<end) ) {
					end = track.s;
				}
			}				
			
			var id = this.getTrackUniqueId();
			var content = paella.dictionary.translate('Video 1');
			this.tracks.push({id:id,s:start,e:end,content:content,name:content});
			return true;
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
		return paella.dictionary.translate("Multiple Video Export ");
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
		var data = {
			breaks:this.tracks
		}
		//paella.data.write('breaks',{id:paella.initDelegate.getId()},data,function(response,status) {
		//	paella.plugins.breaksPlayerPlugin.breaks = data.breaks;
		//	success(status);
		//});
		
		success(true);
	}
});

paella.plugins.singleVideoExportEditorPlugin = new paella.plugins.SingleVideoExportEditorPlugin();


