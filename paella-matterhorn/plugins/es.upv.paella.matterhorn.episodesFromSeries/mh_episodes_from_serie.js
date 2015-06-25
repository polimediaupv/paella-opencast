paella.plugins.EpisodesFromSerie = Class.create(paella.ButtonPlugin,{
	getSubclass:function() { return 'EpisodesFromSerie'; },
	getName:function() { return "es.upv.paella.matterhorn.episodesFromSeries"; },
	
	getIndex:function() { return 10; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Related Videos"); },	
	

	getAlignment:function() { return 'right'; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },	
	
	
	

	buildContent:function(domElement) {
	
		var serieId = paella.matterhorn.episode.mediapackage.series;
		var serieTitle = paella.matterhorn.episode.mediapackage.seriestitle;



		var episodesFromSerieTitle = document.createElement('div');
		episodesFromSerieTitle.id = 'episodesFromSerieTitle';
		episodesFromSerieTitle.className = 'episodesFromSerieTitle';
		if (serieId) {
			episodesFromSerieTitle.innerHTML = "<span class='episodesFromSerieTitle_Bold'>" +paella.dictionary.translate("Videos in this series:")+"</span> " + serieTitle;
		}
		else {
			episodesFromSerieTitle.innerHTML = "<span class='episodesFromSerieTitle_Bold'>" +paella.dictionary.translate("Available videos:")+"</span>";			
		}

		var episodesFromSerieListing = document.createElement('div');
		episodesFromSerieListing.id = 'episodesFromSerieListing';
		episodesFromSerieListing.className = 'episodesFromSerieListing';

	
		domElement.appendChild(episodesFromSerieTitle);
		domElement.appendChild(episodesFromSerieListing);


		var params = {limit:5, page:0, sid:serieId};
		var mySearch = new paella.matterhorn.SearchEpisode(paella.player.config, params);
		mySearch.doSearch(params, document.getElementById('episodesFromSerieListing'));
	}
});

paella.plugins.episodesFromSerie = new paella.plugins.EpisodesFromSerie();