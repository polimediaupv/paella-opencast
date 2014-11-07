// #DCE Info/Help Page Navigation
paella.plugins.InfoPlugin = Class.create(paella.ButtonPlugin,{
    buttonItems: null,
    
    DUBLINCORE_NS_URI: 'http://purl.org/dc/terms/',
    OC_NS_URI: 'http://www.opencastproject.org/matterhorn/',
    dceCourseTitleHtml: "",
    
    getAlignment: function () {
        return 'right';
    },
    getSubclass: function () {
        return "showInfoPluginButton";
    },
    getIndex: function () {
        return 590;
    },
    getMinWindowSize: function () {
        return 300;
    },
    getName: function () {
        return "edu.harvard.dce.paella.infoPlugin";
    },
    checkEnabled: function (onSuccess) {
        onSuccess(true);
    },
    getDefaultToolTip: function () {
        return paella.dictionary.translate("Help and Information about this page");
    },
    
    getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
    
    buttons:[],
    selected_button: null,
    
    setup: function () {
        var thisClass = this;
    
        // This part is taken from socialPlugin without edits except the class name
        Keys = {
            Tab: 9, Return: 13, Esc: 27, End: 35, Home: 36, Left: 37, Up: 38, Right: 39, Down: 40
        };
        
        // close the info popup if any other popup button is pressed (including timeline)
        paella.events.bind(paella.events.showPopUp, function (event, params) {
            if (params.identifier != thisClass.getName()) {
                // alert to hide the course link
                paella.events.trigger(paella.events.hidePopUp, { identifier: thisClass.getName() }); 
            }
        });
        
        $(this.button).keyup(function (event) {
            if (thisClass.isPopUpOpen()) {
                if (event.keyCode == Keys.Up) {
                    if (thisClass.selected_button > 0) {
                        if (thisClass.selected_button < thisClass.buttons.length)
                        thisClass.buttons[thisClass.selected_button].className = 'infoItemButton ' + thisClass.buttons[thisClass.selected_button].data.mediaData;
                        
                        thisClass.selected_button--;
                        thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className + ' selected';
                    }
                } else if (event.keyCode == Keys.Down) {
                    if (thisClass.selected_button < thisClass.buttons.length -1) {
                        if (thisClass.selected_button >= 0)
                        thisClass.buttons[thisClass.selected_button].className = 'infoItemButton ' + thisClass.buttons[thisClass.selected_button].data.mediaData;
                        
                        thisClass.selected_button++;
                        thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className + ' selected';
                    }
                } else if (event.keyCode == Keys.Return) {
                    thisClass.onItemClick(thisClass.buttons[thisClass.selected_button].data.mediaData);
                }
            }
        });
    },
    
    buildContent: function (domElement) {
        var thisClass = this;
                
        // feedback and about link
        this.buttonItems = {
        };
        
        // <div id="popups">
        var dce_infopopup_elem  = document.createElement('div');
        dce_infopopup_elem.id = "dce-info-popup";
        
        var infoMedia =[ 'about', 'feedback', 'publications'];
        
        for (var media in infoMedia) {
            var mediaData = infoMedia[media];
            var buttonItem = thisClass.getInfoItemButton(mediaData);
            thisClass.buttonItems[media] = buttonItem;
            
            dce_infopopup_elem.appendChild(buttonItem);
            this.buttons.push(buttonItem);
        }
        domElement.appendChild(dce_infopopup_elem);
        this.selected_button = thisClass.buttons.length;
        
    },
    
    getInfoItemButton: function (mediaData) {
        var elem = document.createElement('div');
        elem.className = 'infoItemButton ' + mediaData;
        elem.id = mediaData + '_button';
        elem.title = 'Go to "' + mediaData + '" page'; // tool tip
        elem.data = {
            mediaData: mediaData,
            plugin: this
        };
        $(elem).click(function (event) {
            this.data.plugin.onItemClick(this.data.mediaData);
        });
        
        return elem;
    },
    
    onItemClick: function (mediaData) {
        var url = this.getVideoUrl();
        switch (mediaData) {
            case ('about'):
              location.href = 'watchAbout.shtml';
              break;
            case ('feedback'):
              // ref =  reference URL (i.e. player url + mediapckage id)
              var params = 'ref=' + url + '&server=MH';
              if (paella.matterhorn && paella.matterhorn.episode) {
                  params += paella.matterhorn.episode.dcIsPartOf?'&offeringId=' + paella.matterhorn.episode.dcIsPartOf:'';
                  params += paella.matterhorn.episode.dcType?'&typeNum=' + paella.matterhorn.episode.dcType:'';
                  params += paella.matterhorn.episode.dcContributor?'&ps=' + paella.matterhorn.episode.dcContributor:'';
                  params += paella.matterhorn.episode.dcCreated?'&cDate=' + paella.matterhorn.episode.dcCreated:'';
                  params += paella.matterhorn.episode.dcSpatial?'&cAgent=' + paella.matterhorn.episode.dcSpatial:'';
              }
              // ref url for future use
              window.open('http://cm.dce.harvard.edu/forms/feedback.shtml?' + params);
              break;
            case ('publications'):
              if (paella.matterhorn && paella.matterhorn.episode && paella.matterhorn.episode.dcIsPartOf){
                 var seriesId = paella.matterhorn.episode.dcIsPartOf;
                 location.href = '../ui/publicationListing.shtml?seriesId=' + seriesId;
              } 
              // #DCE, no isPartOf associated to a series, so no other lectures
              else {
                  message = 'No other lectures found.';
                  paella.messageBox.showMessage(message);
              }
         }

        // alert to hide the course link
        paella.events.trigger(paella.events.hidePopUp, {
            identifier: this.getName()
        });
    },
    
    getVideoUrl: function () {
        var url = document.location.href;
        return url;
    }
     
});

paella.plugins.InfoPlugin = new paella.plugins.InfoPlugin();
