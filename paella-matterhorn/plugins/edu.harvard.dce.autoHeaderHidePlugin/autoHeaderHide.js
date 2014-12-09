Class ("paella.plugins.AutoHeaderHidePlugin",paella.EventDrivenPlugin,{
  _pausedOnce: false,
  getEvents: function(){
    return [paella.events.play, paella.events.pause];
  },

  onEvent: function(event, params) {
    thisClass = this;
    if(event == 'paella:play'){
      var duration = 1000;
      if(thisClass._pausedOnce == false){
        duration = 3000;
      }
      jQuery('#dceHeader').animate(
          { top: '-60px' },
          duration,
          function() { thisClass._pausedOnce = true; }
      );
    } else if (event == 'paella:pause'){
      jQuery('#dceHeader').animate({ top: '0px' }, 1000);
    }
  }
});

paella.plugins.autoHeaderHidePlugin = new paella.plugins.AutoHeaderHidePlugin();
