paella.matterhorn = {};

paella.pluginList.push('mh_usertracking.js');
paella.pluginList.push('mh_single_video_export.js');
paella.pluginList.push('mh_multiple_video_export.js');
paella.pluginList.push('mh_episodes_from_serie.js');


var MHAccessControl = Class.create(paella.AccessControl,{
	checkAccess:function(onSuccess) {
		this.permissions.canRead = false;
		this.permissions.canWrite = false;
		this.permissions.canContribute = false;
		this.permissions.loadError = false;
		this.permissions.isAnonymous = false;

		if ( (paella.matterhorn) && (paella.matterhorn.me) && (paella.matterhorn.acl) ) {
			var roles = paella.matterhorn.me.roles;
			var aces = paella.matterhorn.acl.acl.ace;
			var adminRole = paella.matterhorn.me.org.adminRole;
			var anonymousRole = paella.matterhorn.me.org.anonymousRole;

			if (!(roles instanceof Array)) { roles = [roles]; }
			if (!(aces instanceof Array)) { aces = [aces]; }

			for (var role_i=0; role_i<roles.length; ++role_i) {
				var currentRole = roles[role_i];
				if (currentRole == anonymousRole) {
					this.permissions.isAnonymous = true;
				}
				if (currentRole == adminRole) {
					this.permissions.canRead = true;
					this.permissions.canWrite = true;
					this.permissions.canContribute = true;
					break;
				}
				else{
					for(var ace_i=0; ace_i<aces.length; ++ace_i) {
						var currentAce = aces[ace_i];
						if (currentRole == currentAce.role) {
							if (currentAce.action == "read") {this.permissions.canRead = true;}
							if (currentAce.action == "write") {this.permissions.canWrite = true;}
						}
					}
				}
			}	
		}
		else {
			this.permissions.loadError = true;
		}

		onSuccess(this.permissions);
	}
});

var MHVideoLoader = Class.create(paella.VideoLoader, {
	isStreaming:function(url) {
		return /rtmp:\/\//.test(url);
	},

	loadVideo:function(videoId,onSuccess) {
		var streamsQuality = {};
		var tracks = paella.matterhorn.episode.mediapackage.media.track;
		var attachments = paella.matterhorn.episode.mediapackage.attachments.attachment;
		if (!(tracks instanceof Array)) { tracks = [tracks]; }
		if (!(attachments instanceof Array)) { attachments = [attachments]; }


		// Read the tracks!!
		for (var i=0;i<tracks.length;++i) {
			var quality = undefined;
			// TODO: Search for quality tag
			var currentTrack = tracks[i];
			var currentQuality = streamsQuality[quality]
			if (currentQuality == undefined) { streamsQuality[quality] = {}; currentQuality = {}; }
			var currentStream = currentQuality[currentTrack.type];
			if (currentStream == undefined) { currentStream = { sources:{} }; }

			if (this.isStreaming(currentTrack.url)) {
				currentStream.sources.rtmp = {
					src:  currentTrack.url,
					type: currentTrack.mimetype
				};
			}
			else{
				switch (currentTrack.mimetype) {
					case 'video/mp4':
					case 'video/ogg':
					case 'video/webm':
						var videotype = currentTrack.mimetype.split("/")[1];
						currentStream.sources[videotype] = {
							src:  currentTrack.url,
							type: currentTrack.mimetype
						};
						break;
					case 'video/x-flv':
						currentStream.sources.flv = {
							src:  currentTrack.url,
							type: currentTrack.mimetype
						};
						break;
					dafault:
						paella.debug.log('MHVideoLoader: MimeType ('+currentTrack.mimetype+') not recognized!');
						break;
				}
			}
			
			currentQuality[currentTrack.type] = currentStream;
			streamsQuality[quality] = currentQuality;
		}
		var qualities = Object.keys(streamsQuality);
		paella.debug.log('MHVideoLoader: Found '+ qualities.length + ' quality/ies for this video: [' + qualities.toString() + ']');
		
		// Read the image stream and the preview images
		var presentationPreview = undefined;
		var presenterPreview = undefined;
		var frameList = {}
		var frameListHD = {}
		var imageSource = {frames:{}, duration: parseInt(paella.matterhorn.episode.mediapackage.duration/1000)}
		var imageSourceHD = {frames:{}, duration: parseInt(paella.matterhorn.episode.mediapackage.duration/1000)}
		for (var i=0;i<attachments.length;++i) {
			var currentAttachment = attachments[i];

			if (currentAttachment.type == "presentation/segment+preview+hires") {
				if (/time=T(\d+):(\d+):(\d+)/.test(currentAttachment.ref)) {
					time = parseInt(RegExp.$1)*60*60 + parseInt(RegExp.$2)*60 + parseInt(RegExp.$3);
					imageSourceHD.frames["frame_"+time] = currentAttachment.url;
                			frameListHD[time] = {id:'frame_'+time, mimetype:currentAttachment.mimetype, time:time, url:currentAttachment.url};
				}
			}
			else if (currentAttachment.type == "presentation/segment+preview") {
				if (/time=T(\d+):(\d+):(\d+)/.test(currentAttachment.ref)) {
					time = parseInt(RegExp.$1)*60*60 + parseInt(RegExp.$2)*60 + parseInt(RegExp.$3);
					imageSourceHD.frames["frame_"+time] = currentAttachment.url;
                			frameList[time] = {id:'frame_'+time, mimetype:currentAttachment.mimetype, time:time, url:currentAttachment.url};
				}
			}
			else if (currentAttachment.type == "presentation/player+preview") {
				presentationPreview = currentAttachment.url;
			}
			else if (currentAttachment.type == "presenter/player+preview") {
				presenterPreview = currentAttachment.url;
			}
		}

		if (frameList != {}) {	this.frameList = frameList; } else { this.frameList = frameListHD; }

		// Set the image stream to all qualities
		for (var i=0; i<qualities.length; ++i){
		
			var presenter = streamsQuality[qualities[i]]["presenter/delivery"];
			var presentation = streamsQuality[qualities[i]]["presentation/delivery"];
			
			if (imageSourceHD.frames != {}) {
				presentation.sources.image = imageSourceHD;
			}
			else if (imageSource.frames != {}) {
				presentation.sources.image = imageSource;
			}
			
			if (presenter) {presenter.preview = presenterPreview;}
			if (presentation) {presentation.preview = presentationPreview;}
		}		


		var qualitySelected = paella.utils.parameters.get('quality');
		if (qualitySelected =='') { qualitySelected = 'undefined'; }
		
		
		paella.debug.log('MHVideoLoader: Trying to use quality: ' + qualitySelected);
		if (qualities.indexOf(qualitySelected) < 0) {
			paella.messageBox.showError(paella.dictionary.translate("This recording can't be accessed with these parameters."));
		}
		else {
			var presenter = streamsQuality[qualitySelected]["presenter/delivery"];
			var presentation = streamsQuality[qualitySelected]["presentation/delivery"];
	
			if (presenter) { this.streams.push(presenter); }
			if (presentation) { this.streams.push(presentation); }

			// Callback
			this.loadStatus = true;
			onSuccess();			
		}	
	}
});



paella.dataDelegates.MHAnnotationServiceDefaultDataDelegate = Class.create(paella.DataDelegate,{
	read:function(context,params,onSuccess) {
		var episodeId = paella.initDelegate.getId();
		paella.ajax.get({url: '/annotation/annotations.json', params: {episode: episodeId, type: "paella/"+context}},	
			function(data, contentType, returnCode) { 
 				var annotations = data.annotations.annotation;
				if (!(annotations instanceof Array)) { annotations = [annotations]; }
				if (annotations.length > 0) {
					if (annotations[0] && annotations[0].value) {
						if (onSuccess) onSuccess(JSON.parse(annotations[0].value), true); 
					}
					else{
						if (onSuccess) onSuccess({}, true);
					}
				}
				else {
					if (onSuccess) onSuccess(undefined, false);
				}
			},
			function(data, contentType, returnCode) { onSuccess(undefined, false); }
		);
	},

	write:function(context,params,value,onSuccess) {
		var episodeId = paella.initDelegate.getId();
		if (typeof(value)=='object') value = JSON.stringify(value);

		paella.ajax.get({url: '/annotation/annotations.json', params: {episode: episodeId, type: "paella/"+context}},	
			function(data, contentType, returnCode) { 
				if (data.annotations.annotation) {
					var annotationId = data.annotations.annotation.annotationId
					paella.ajax.put({ url: '/annotation/'+ annotationId, params: { value: value }},	
						function(data, contentType, returnCode) { onSuccess({}, true); },
						function(data, contentType, returnCode) { onSuccess({}, false); }
					);
				}
				else {
					paella.ajax.put({ url: '/annotation/', 
						params: {
							episode: episodeId, 
							type: 'paella/' + context,
							value: value,
							'in': 0
						}},	
						function(data, contentType, returnCode) { onSuccess({}, true); },
						function(data, contentType, returnCode) { onSuccess({}, false); }
					);
				}
			},
			function(data, contentType, returnCode) { onSuccess({}, false); }
		);
	},
        
	remove:function(context,params,onSuccess) {
		var episodeId = paella.initDelegate.getId();

		paella.ajax.get({url: '/annotation/annotations.json', params: {episode: episodeId, type: "paella/"+context}},	
			function(data, contentType, returnCode) {
 				var annotations = data.annotations.annotation;
				if (!(annotations instanceof Array)) { annotations = [annotations]; }
				var asyncLoader = new paella.AsyncLoader();
				for ( var i=0; i< annotations.length; ++i) {
					var annotationId = data.annotations.annotation.annotationId;
					asyncLoader.addCallback(new paella.JSONCallback({url:'/annotation/'+annotationId}, "DELETE"));
				}
				asyncLoader.load(function(){ if (onSuccess) { onSuccess({}, true); } }, function() { onSuccess({}, false); });
			},
			function(data, contentType, returnCode) { if (onSuccess) { onSuccess({}, false); } }
		);
	}
});

paella.dataDelegates.MHAnnotationServiceTrimmingDataDelegate = Class.create(paella.dataDelegates.MHAnnotationServiceDefaultDataDelegate,{
	read:function(context,params,onSuccess) {
		this.parent(context, params, function(data,success) {
			if (success){
				if (data.trimming) {
					if (onSuccess) { onSuccess(data.trimming, success); }
				}
				else{
					if (onSuccess) { onSuccess(data, success); }
				}
			}
			else {
				if (onSuccess) { onSuccess(data, success); }
			}
		});
	},
	write:function(context,params,value,onSuccess) {
		this.parent(context, params, {trimming: value}, onSuccess);
	}
});


paella.dataDelegates.MHFootPrintsDataDelegate = Class.create(paella.DataDelegate,{
	read:function(context,params,onSuccess) {
		var episodeId = params.id;
		
		paella.ajax.get({url: '/usertracking/footprint.json', params: {id: episodeId}},	
			function(data, contentType, returnCode) { 				
				if ((returnCode == 200) && (contentType == 'application/json')) {
					var footPrintsData = data.footprints.footprint;
					if (data.footprints.total == "1"){
						footPrintsData = [footPrintsData];
					}
					if (onSuccess) { onSuccess(footPrintsData, true); }
				}
				else{
					if (onSuccess) { onSuccess({}, false); }					
				}			
			},
			function(data, contentType, returnCode) {
				if (onSuccess) { onSuccess({}, false); }
			}
		);
	},

	write:function(context,params,value,onSuccess) {
		var thisClass = this;
		var episodeId = params.id;
		paella.ajax.get({url: '/usertracking/', params: {
					_method: 'PUT',
					id: episodeId,
					type:'FOOTPRINT',
					in:value.in,
					out:value.out }
			},	
			function(data, contentType, returnCode) {
				var ret = false;
				if (returnCode == 201) { ret = true; }								
				if (onSuccess) { onSuccess({}, ret); }
			},
			function(data, contentType, returnCode) {
				if (onSuccess) { onSuccess({}, false); }
			}
		);
	}   
});


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
		
					var serie = paella.matterhorn.episode.mediapackage.series;
		
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
				},
				function(data,contentType,code) { if (onError) onError(); }
			);
		},
		function() { if (onError) onError(); }
	);
}



function loadPaella(containerId) {
	var initDelegate = new paella.InitDelegate({accessControl:new MHAccessControl(),videoLoader:new MHVideoLoader()});
	var id = paella.utils.parameters.get('id');

	initPaellaMatterhorn(id, function() {initPaellaEngage(containerId,initDelegate);});
}

function loadPaellaExtended(containerId) {
	var initDelegate = new paella.InitDelegate({accessControl:new MHAccessControl(),videoLoader:new MHVideoLoader()});
	var id = paella.utils.parameters.get('id');

	initPaellaMatterhorn(id, function() {initPaellaExtended({containerId:containerId,initDelegate:initDelegate});});
}

function loadPaellaEditor(containerId) {
    var EditorInitDelegate = Class.create(paella.InitDelegate,{
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



paella.matterhorn.SearchEpisode = Class.create({
	config:null,
	proxyUrl:'',
	recordingEntryID:'',
	useJsonp:false,
	divLoading:null,
	divResults:null,

	AsyncLoaderPublishCallback: Class.create(paella.AsyncLoaderCallback,{
		config:null,
		recording:null,

		initialize:function(config, recording) {
			this.parent("AsyncLoaderPublishCallback");
			this.config = config;
			this.recording = recording;
		},

		load:function(onSuccess,onError) {
			var thisClass = this;
			
			thisClass.recording.entry_published_class = "published";
			onSuccess();
/*
			var loader = new paella.matterhorn.LoaderSaverInfo(thisClass.config);

			loader.loadData(this.recording.id, "paella/publish", function(response) {

				if (response == true){
					thisClass.recording.entry_published_class = "published";
				}
				else if (response == false){
					thisClass.recording.entry_published_class = "unpublished";
				}
				else if (response == "undefined"){
					thisClass.recording.entry_published_class = "pendent";
				}

				onSuccess();
			}, function(){
				thisClass.recording.entry_published_class = "no_publish_info";
				onSuccess();
			});
*/
		}
	}),

	initialize:function(config) {
		this.config = config;
		if (config.proxyLoader && config.proxyLoader.enabled) {
			this.proxyUrl = config.proxyLoader.url;
		}
		this.useJsonp = config.proxyLoader.usejsonp;
	},

	doSearch:function(params, domElement) {
		var thisClass = this;
		var divList = domElement; //document.getElementById(divListId);
		divList.innerHTML = "";

		this.recordingEntryID =	 domElement.id + "_entry_";

		// loading div
		this.divLoading = document.createElement('div');
		this.divLoading.id = thisClass.recordingEntryID + "_loading";
		this.divLoading.className = "recordings_loading";
		this.divLoading.innerHTML = paella.dictionary.translate("Searching...");
		divList.appendChild(this.divLoading);

		// header div
		var divHeader = document.createElement('div');
		divHeader.id = thisClass.recordingEntryID + "_header";
		divHeader.className = "recordings_header";
		divList.appendChild(divHeader);

		this.divResults = document.createElement('div');
		this.divResults.id = thisClass.recordingEntryID + "_header_results";
		this.divResults.className = "recordings_header_results";
		divHeader.appendChild(this.divResults);

		var divNavigation = document.createElement('div');
		divNavigation.id = thisClass.recordingEntryID + "_header_navigation";
		divNavigation.className = "recordings_header_navigation";
		divHeader.appendChild(divNavigation);


		// loading results
		thisClass.setLoading(true);

		paella.debug.log("Params offet: " + params.offset);
		paella.debug.log("Params limit: " + params.limit);
		paella.debug.log("Params q: " + params.q);

		var resultsAvailable = true;
		var restEndpoint = thisClass.config.restServer.url + "search/episode.json";

		new paella.Ajax(restEndpoint, params, function(response) {
			if (typeof(response)=="string") {
				response = JSON.parse(response);
			}

			var resultsAvailable = (response !== undefined) &&
				(response['search-results'] !== undefined) &&
				(response['search-results'].total !== undefined);

			if (resultsAvailable === false) {
				paella.debug.log("Seach failed, respons:  " + response);
				return;
			}


			var totalItems = parseInt(response['search-results'].total);

			if (totalItems === 0) {
				if (params.q === undefined) {
					thisClass.setResults("No recordings");
				} else {
					thisClass.setResults("No recordings found: \"" + params.q + "\"");
				}
			} else {
				var offset = parseInt(response['search-results'].offset);
				var limit = parseInt(response['search-results'].limit);

				var startItem = offset;
				var endItem = offset + limit;
				if (startItem < endItem) {
				  startItem = startItem + 1;
				}

				if (params.q === undefined) {
					thisClass.setResults("Results " + startItem + "-" + endItem + " of " + totalItems);
				} else {
					thisClass.setResults("Results " + startItem + "-" + endItem + " of " + totalItems + " for \"" + params.q + "\"");
				}


				// *******************************
				// *******************************
				// TODO
				var asyncLoader = new paella.AsyncLoader();
				var results = response['search-results'].result;
				var restEndpointDeleteAnnotation = thisClass.config.restServer.url + "annotation/annotations.json";
				//There are annotations of the desired type, deleting...
				for (var i =0; i < results.length; ++i ){
					asyncLoader.addCallback(new thisClass.AsyncLoaderPublishCallback(thisClass.config, results[i]));
				}

				asyncLoader.load(function() {
					// create navigation div
					if (results.length < totalItems) {
						// current page
						var currentPage = 1;
						if (params.offset !== undefined) {
							currentPage = (params.offset / params.limit) + 1;
						}

						// max page
						var maxPage = parseInt(totalItems / params.limit);
						if (totalItems % 10 != 0) maxPage += 1;
						maxPage =  Math.max(1, maxPage);


						// previous link
						var divPrev = document.createElement('div');
						divPrev.id = thisClass.recordingEntryID + "_header_navigation_prev";
						divPrev.className = "recordings_header_navigation_prev";
						if (currentPage > 1) {
							var divPrevLink = document.createElement('a');
							divPrevLink.param_offset = (currentPage - 2) * params.limit;
							divPrevLink.param_limit	= params.limit;
							divPrevLink.param_q = params.q;
							$(divPrevLink).click(function(event) {
								var params = {};
								params.offset = this.param_offset;
								params.limit = this.param_limit;
								params.q = this.param_q;
								thisClass.doSearch(params, divList);
							});
							divPrevLink.innerHTML = paella.dictionary.translate("Previous");
							divPrev.appendChild(divPrevLink);
						} else {
							divPrev.innerHTML = paella.dictionary.translate("Previous");
						}
						divNavigation.appendChild(divPrev);

						var divPage = document.createElement('div');
						divPage.id = thisClass.recordingEntryID + "_header_navigation_page";
						divPage.className = "recordings_header_navigation_page";
						divPage.innerHTML = paella.dictionary.translate("Page:");
						divNavigation.appendChild(divPage);

						// take care for the page buttons
						var spanBeforeSet = false;
						var spanAfterSet = false;
						var offsetPages = 2;
						for (var i = 1; i <= maxPage; i++)	{
							var divPageId = document.createElement('div');
							divPageId.id = thisClass.recordingEntryID + "_header_navigation_pageid_"+i;
							divPageId.className = "recordings_header_navigation_pageid";

							if (!spanBeforeSet && currentPage >= 5 && i > 1 && (currentPage - (offsetPages + 2) != 1)) {
								divPageId.innerHTML = "..."
								i = currentPage - (offsetPages + 1);
								spanBeforeSet = true;
							}
							else if (!spanAfterSet && (i - offsetPages) > currentPage && maxPage - 1 > i && i > 4) {
								divPageId.innerHTML = "..."
								i = maxPage - 1;
								spanAfterSet = true;
							}
							else {
								if (i !== currentPage) {
									var divPageIdLink = document.createElement('a');
									divPageIdLink.param_offset = (i -1) * params.limit;
									divPageIdLink.param_limit = params.limit;
									divPageIdLink.param_q = params.q;
									$(divPageIdLink).click(function(event) {
										var params = {};
										params.offset = this.param_offset;
										params.limit = this.param_limit;
										params.q = this.param_q;
										thisClass.doSearch(params, divList);
									});
									divPageIdLink.innerHTML = i
									divPageId.appendChild(divPageIdLink);
								} else {
									divPageId.innerHTML = i
								}
							}
							divNavigation.appendChild(divPageId);
						}

						// next link
						var divNext = document.createElement('div');
						divNext.id = thisClass.recordingEntryID + "_header_navigation_next";
						divNext.className = "recordings_header_navigation_next";
						if (currentPage < maxPage) {
							var divNextLink = document.createElement('a');
							divNextLink.param_offset = currentPage * params.limit;
							divNextLink.param_limit	= params.limit;
							divNextLink.param_q = params.q;
							$(divNextLink).click(function(event) {
								var params = {};
								params.offset = this.param_offset;
								params.limit = this.param_limit;
								params.q = this.param_q;
								thisClass.doSearch(params, divList);
							});
							divNextLink.innerHTML = paella.dictionary.translate("Next");
							divNext.appendChild(divNextLink);
						} else {
							divNext.innerHTML = paella.dictionary.translate("Next");
						}
						divNavigation.appendChild(divNext);

					}

					// create recording divs
					for (var i =0; i < results.length; ++i ){
						var recording = results[i];

						var divRecording = thisClass.createRecordingEntry(i, recording);
						divList.appendChild(divRecording);
					}
				}, null);
			}
			// finished loading
			thisClass.setLoading(false);
		}, this.proxyUrl, this.useJsonp);
	},

	setLoading:function(loading) {
		if (loading == true) {
			this.divLoading.style.display="block"
		} else {
			this.divLoading.style.display="none"
		}
	},

	setResults:function(results) {
		//var divResults = document.getElementById(this.recordingEntryID + "_header_results");
		this.divResults.innerHTML = results;
	},

	getUrlOfAttachmentWithType:function(recording, type) {
		for (var i =0; i < recording.mediapackage.attachments.attachment.length; ++i ){
			var attachment = recording.mediapackage.attachments.attachment[i];
			if (attachment.type === type) {
				return attachment.url;
			}
		}

		return "";
	},

	createRecordingEntry:function(index, recording) {
		var thisClass = this;
		var rootID = thisClass.recordingEntryID + index;


		var divEntry = document.createElement('div');
		divEntry.id = rootID;


		divEntry.className="recordings_entry " + recording.entry_published_class;
		if (index % 2 == 1) {
			divEntry.className=divEntry.className+" odd_entry";
		} else {
			divEntry.className=divEntry.className+" even_entry";
		}

		var previewUrl = thisClass.getUrlOfAttachmentWithType(recording, "presentation/search+preview");

		var divPreview = document.createElement('div');
		divPreview.id = rootID+"_preview_container";
		divPreview.className = "recordings_entry_preview_container";
		var imgLink = document.createElement('a');
		imgLink.id = rootID+"_preview_link";
		imgLink.className = "recordings_entry_preview_link";
		imgLink.href = "watch.html?id=" + recording.id;
		var imgPreview = document.createElement('img');
		imgPreview.id = rootID+"_preview";
		imgPreview.src = previewUrl;
		imgPreview.className = "recordings_entry_preview";
		imgLink.appendChild(imgPreview);
		divPreview.appendChild(imgLink);
		divEntry.appendChild(divPreview);

		var divResultText = document.createElement('div');
		divResultText.id = rootID+"_text_container";
		divResultText.className = "recordings_entry_text_container";


		// title
		var divResultTitleText = document.createElement('div');
		divResultTitleText.id = rootID+"_text_title_container";
		divResultTitleText.className = "recordings_entry_text_title_container";
		var titleResultText = document.createElement('a');
		titleResultText.id = rootID+"_text_title";
		titleResultText.innerHTML = recording.dcTitle;
		titleResultText.className = "recordings_entry_text_title";
		titleResultText.href = "watch.html?id=" + recording.id;
		divResultTitleText.appendChild(titleResultText);
		divResultText.appendChild(divResultTitleText);


		// author
		var author = "&nbsp;";
		var author_search = "";
		if(recording.dcCreator) {
		  author = "by " + recording.dcCreator;
		  author_search = recording.dcCreator.replace(" ", "+");
		}
		var divResultAuthorText = document.createElement('div');
		divResultAuthorText.id = rootID+"_text_author_container";
		divResultAuthorText.className = "recordings_entry_text_author_container";
		var authorResultText = document.createElement('a');
		authorResultText.id = rootID+"_text_title";
		authorResultText.innerHTML = author;
		authorResultText.className = "recordings_entry_text_title";
		if (author_search != "") {
			authorResultText.href = "?q=" + author_search;
		}
		divResultAuthorText.appendChild(authorResultText);
		divResultText.appendChild(divResultAuthorText);


		// date time
		//var timeDate = recording.mediapackage.start;
		var timeDate = recording.dcCreated;
		if (timeDate) {
			var offsetHours = parseInt(timeDate.substring(20, 22), 10);
			var offsetMinutes = parseInt(timeDate.substring(23, 25), 10);
			if (timeDate.substring(19,20) == "-") {
			  offsetHours = - offsetHours;
			  offsetMinutes = - offsetMinutes;
			}
			var sd = new Date();
			sd.setUTCFullYear(parseInt(timeDate.substring(0, 4), 10));
			sd.setUTCMonth(parseInt(timeDate.substring(5, 7), 10) - 1);
			sd.setUTCDate(parseInt(timeDate.substring(8, 10), 10));
			sd.setUTCHours(parseInt(timeDate.substring(11, 13), 10) - offsetHours);
			sd.setUTCMinutes(parseInt(timeDate.substring(14, 16), 10) - offsetMinutes);
			sd.setUTCSeconds(parseInt(timeDate.substring(17, 19), 10));
			timeDate = sd.toLocaleString();
		} else {
			timeDate = "n.a."
		}


		var divResultDateText = document.createElement('div');
		divResultDateText.id = rootID+"_text_date";
		divResultDateText.className = "recordings_entry_text_date";
		divResultDateText.innerHTML = timeDate;
		divResultText.appendChild(divResultDateText);

		divEntry.appendChild(divResultText);

		return divEntry;
	}

});

