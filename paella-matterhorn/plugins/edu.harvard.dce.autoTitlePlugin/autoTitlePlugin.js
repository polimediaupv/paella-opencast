Class ("paella.plugins.AutoTitlePlugin",paella.EventDrivenPlugin,{
  getEvents: function(){
    return [paella.events.loadPlugins];
  },

  _createSeriesTitleNode: function(){
    var nodeToInsert = '';
    try {
      var dcObj = paella.matterhorn.serie['http://purl.org/dc/terms/'];
      nodeToInsert = jQuery('<div class="seriesInfo" />').append(
          jQuery('<a />').attr({
            'title': 'Go to ' + dcObj.title[0].value,
            'href': dcObj.description[0].value
          }).html(
            dcObj.title[0].value
            ).append(
              jQuery('<span class="seriesTitle" />').text(' :: ' + dcObj.subject[0].value)
              )
          );
    } catch(err) {
      console.log(err.message);
    }
    return nodeToInsert;
  },

  onEvent: function(event, params) {
    jQuery('#dceHeader .primary').after(this._createSeriesTitleNode());
  }
});

paella.plugins.autoTitlePlugin = new paella.plugins.AutoTitlePlugin();
