/////////////////////////////////////////////////
// OCR Segments Search
/////////////////////////////////////////////////
new (Class (paella.SearchServicePlugIn, {
	getName: function() { return "es.upv.paella.matterhorn.searchPlugin"; },

	search: function(text, next) {

		if ((text === '') || (text === undefined)) {
			next(false,[]);
		}
		else {
		
			paella.ajax.get({url:'/search/episode.json', params:{id:paella.matterhorn.episode.id, q:text, limit:1000}},
				function(data, contentType, returnCode) {				
					paella.debug.log("Searching episode="+paella.matterhorn.episode.id + " q="+text);				
	                segmentsAvailable = (data !== undefined) && (data['search-results'] !== undefined) &&
	                    (data['search-results'].result !== undefined) && 
	                    (data['search-results'].result.segments !== undefined) && 
	                    (data['search-results'].result.segments.segment.length > 0);
					
	                var searchResult = [];
					
					if (segmentsAvailable) {
						var segments = data['search-results'].result.segments;					
						var i, segment;
							
						for (i =0; i < segments.segment.length; ++i ) {
							segment = segments.segment[i];
							var relevance = parseInt(segment.relevance);
							
							if (relevance > 0) {
								searchResult.push({
									content: segment.text,
									scote: segment. relevance,
									time: parseInt(segment.time)/1000
								});
							}							
						}
						next(false, searchResult);												
					}
					else {
						paella.debug.log("No Revelance");
						next(false, []);
					}
				},
				function(data, contentType, returnCode) {
					next(true);
				}
			);
		}
	}
}))();
