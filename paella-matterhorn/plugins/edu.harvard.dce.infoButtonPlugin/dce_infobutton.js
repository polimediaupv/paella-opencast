Class ('paella.plugins.InfoPlugin', paella.ButtonPlugin,{
  getAlignment: function () { return 'right'; },
  getSubclass: function () { return "showInfoPluginButton"; },
  getIndex: function () { return 501; },
  getMinWindowSize: function () { return 300; },
  getName: function () { return "edu.harvard.dce.paella.infoPlugin"; },
  checkEnabled: function (onSuccess) { onSuccess(true); },
  getDefaultToolTip: function () {
    return paella.dictionary.translate("Help and Information about this page");
  },
  getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },

  buildContent: function (domElement) {
    var thisClass = this;

    var popUp = jQuery('<div id="dce-info-popup"></div>');
    var buttonActions =[ 'Help with this player', 'Feedback', 'All Course Videos' ];

    buttonActions.forEach(function(item){
      jQuery(popUp).append(thisClass.getItemButton(item));
    });
    jQuery(domElement).append(popUp);
  },

  getItemButton: function (buttonAction) {
    var thisClass = this;
    var elem = jQuery('<div />');
    jQuery(elem).attr({class: 'infoItemButton'}).text(buttonAction);
    jQuery(elem).click(function (event) {
      thisClass.onItemClick(buttonAction);
    });
    return elem;
  },

  onItemClick: function (buttonAction) {
    switch (buttonAction) {
      case ('Help with this player'):
        location.href = 'watchAbout.shtml';
        break;
      case ('Feedback'):
        var params = 'ref=' + this.getVideoUrl() + '&server=MH';
        if (paella.matterhorn && paella.matterhorn.episode) {
          params += paella.matterhorn.episode.dcIsPartOf ? '&offeringId=' + paella.matterhorn.episode.dcIsPartOf : '';
          params += paella.matterhorn.episode.dcType ? '&typeNum=' + paella.matterhorn.episode.dcType : '';
          params += paella.matterhorn.episode.dcContributor ? '&ps=' + paella.matterhorn.episode.dcContributor : '';
          params += paella.matterhorn.episode.dcCreated ? '&cDate=' + paella.matterhorn.episode.dcCreated : '';
          params += paella.matterhorn.episode.dcSpatial ? '&cAgent=' + paella.matterhorn.episode.dcSpatial : '';
        }
        window.open('http://cm.dce.harvard.edu/forms/feedback.shtml?' + params);
        break;
      case ('All Course Videos'):
        if (paella.matterhorn && paella.matterhorn.episode && paella.matterhorn.episode.dcIsPartOf){
          var seriesId = paella.matterhorn.episode.dcIsPartOf;
          location.href = '../ui/publicationListing.shtml?seriesId=' + seriesId;
        } 
        else {
          message = 'No other lectures found.';
          paella.messageBox.showMessage(message);
        }
    }
    paella.events.trigger(paella.events.hidePopUp, {
      identifier: this.getName()
    });
  },

  getVideoUrl: function () {
    return document.location.href;
  }
});

paella.plugins.infoPlugin = new paella.plugins.InfoPlugin();
