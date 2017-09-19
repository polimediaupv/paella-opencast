(function() { 
	let app = angular.module(paella.editor.APP_NAME);


	let EpisodeChangeMetadataState = {
		episode: undefined,
		serie: undefined,
		subject: undefined,
		privacy: undefined,
		publish: undefined,
		
		newTitle: undefined,
		newPublish: undefined,
		processing: undefined,
	}

	app.value('EpisodeChangeMetadataState', EpisodeChangeMetadataState);	


	app.directive("episodeChangeMetadata",function() {
		return {
			restrict: "E",
			templateUrl:"templates/es.upv.paella.opencast.editor.episodeChangeMetadata/episode-change-metadata.html",
			controller:["$scope","PaellaEditor","EpisodeChangeMetadataState", function($scope, PaellaEditor, EpisodeChangeMetadataState) {			
				$scope.EpisodeChangeMetadataState = EpisodeChangeMetadataState;				
			}]
		}
	});

	class EpisodeChangeMetadataPlugin extends paella.editor.SideBarPlugin {
		getIndex() {
			return 1;
		}
		
		isEnabled() {		
			let videoId = paella.initDelegate.getId();

			return new Promise((resolve, reject) => {
			
				paella.opencast.getEpisode()
				.then((ep) => {
					EpisodeChangeMetadataState.episode = ep;
					
					EpisodeChangeMetadataState.newTitle = ep.mediapackage.title;
					if (ep.mediapackage.series) {
						EpisodeChangeMetadataState.serie = ep.mediapackage.series;
						if ( ep.mediapackage.series.startsWith("SHOW_") || ep.mediapackage.series.startsWith("HIDE_") ) {
							EpisodeChangeMetadataState.serie = ep.mediapackage.series.slice(5);
							EpisodeChangeMetadataState.subject = EpisodeChangeMetadataState.serie;
							
							if (EpisodeChangeMetadataState.serie.startsWith("PUBLIC_")) {EpisodeChangeMetadataState.privacy = "public";}
							else {EpisodeChangeMetadataState.privacy = "sakai";}
						}
					}
					
					paella.data.read('publish',{id:videoId}, function(data, status) {
						EpisodeChangeMetadataState.publish = "autopublish";
						if (status == true) {
							if (data == true)           { EpisodeChangeMetadataState.publish = "publish"; }
							else if (data==false)       { EpisodeChangeMetadataState.publish = "unpublish"; }
							else if (data=="undefined") { EpisodeChangeMetadataState.publish = "autopublish"; }
							EpisodeChangeMetadataState.newPublish = EpisodeChangeMetadataState.publish;
						}
						
						paella.data.read('changeMetadata', {id:videoId}, function(data, status) {
							if (status == true) {
								EpisodeChangeMetadataState.processing = true;
								EpisodeChangeMetadataState.newTitle = data.title || ep.dcTitle;
								EpisodeChangeMetadataState.newPublish = data.publish;
							}
							resolve(true);
						});
					});
				})
				.catch((x) => {
					reject();
				})					
			});
		}

		isVisible(PaellaEditor, PluginManager) {
			return paella.opencast.getEpisode();
		}

		getName() {
			return "episodeChangeMetadataSidebar";
		}

		getTabName() {
			return "Change metadata";
		}

		getDirectiveName() {
			return "episode-change-metadata";
		}
		
		onSave() {
			let videoId = paella.initDelegate.getId();

			return new Promise((resolve, reject) => {							
				if  (	(EpisodeChangeMetadataState.episode.dcTitle == EpisodeChangeMetadataState.newTitle) && 
						( (EpisodeChangeMetadataState.publish == EpisodeChangeMetadataState.newPublish) || (EpisodeChangeMetadataState.newPublish == undefined) )
					) {
					resolve();
				}
				else {
					let metadata = {
						title: EpisodeChangeMetadataState.newTitle,
						publish: EpisodeChangeMetadataState.newPublish,
						serie: EpisodeChangeMetadataState.serie
					};
					paella.data.write('changeMetadata', {id:videoId}, metadata, function(response,status) {
						var pub = undefined;
						
						if (metadata.publish == "publish") { pub = true; }
						if (metadata.publish == "unpublish") { pub = false; }
						
						if (pub != undefined) {
							paella.data.write('publish',{id:videoId}, pub, function(data, status) {
								resolve();
							});
						}
						else {
							resolve();
						}
					});
				}
			});
		}
	}

	new EpisodeChangeMetadataPlugin();
})();