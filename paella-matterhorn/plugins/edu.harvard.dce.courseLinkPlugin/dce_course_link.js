
// #DCE Display Course number, lecture title, and link to course web site
// See notes above getButtonType

paella.plugins.CourseLinkPlugin = Class.create(paella.ButtonPlugin,{
    buttonItems: null,
    
    containerId: 'paella_plugin_CourseLinkPlugin',
    container: null,
    enabled: true,
    
    SERIES_SERVICE: "series/",
    SEARCH_SERIES_JSON: "/search/series.json",
    DUBLINCORE_NS_URI: 'http://purl.org/dc/terms/',
    OC_NS_URI: 'http://www.opencastproject.org/matterhorn/',
    dceCourseTitleHtml: "",
    hasSeriesData: false,
    hasEventData: false,
    heightBuffer: 15,
    isHidden:true,
    
    getSubclass: function () {
        return "courseLinkPlugin";
    },
    getName: function () {
        return "edu.harvard.dce.paella.CourseLinkPlugin";
    },
    checkEnabled: function (onSuccess) {
        onSuccess(true);
    },
    // The Course Number content appears in the timeline bar
    // there is a hidden dummy control button to enable using the timeline bar
    // but that button is not used to show and hide.
    //  This div controls itself: This class listens to the
    // info button click.
    // Both the info popup and this course data are shown.
    getButtonType: function () {
        return paella.ButtonPlugin.type.timeLineButton;
    },
    
    courseLinkPluginData: {
    },
    
    getAlignment: function () {
        return 'right';
    },
    getIndex: function () {
        return 600;
    },
    getDefaultToolTip: function () {
        return paella.dictionary.translate("Show course link");
    },
    getMinWindowSize: function () {
        return 700;
    },
    
    initialize: function (id) {
        var style = {
        };
        this.parent('div', id, style);
        
        this.container = document.createElement('div');
        this.container.className = "courseLinkPlugin";
        this.container.id = this.containerId;
        
        this.buildContent(this.container);
        
        var thisClass = this;
        paella.events.bind(paella.events.hidePopUp, function (event, params) {
            if (params.identifier == "edu.harvard.dce.paella.infoPlugin") {
                thisClass.hideCourseLink();
            }
        });
        // this happens on info button click
        paella.events.bind(paella.events.showPopUp, function (event, params) {
            if (params.identifier == "edu.harvard.dce.paella.infoPlugin") {
                // show Popup up happens when it's being shown or hidden
                thisClass.hideOrShow();
            } else {
                // hide the course link for any other button click
                thisClass.hideCourseLink();
            }
        });
    },
    
    setHidden: function (hidden) {
        this.isHidden = hidden;
    },
    
    hideOrShow: function () {
        var thisClass = this;
        // show Popup up happens when it's being shown or hidden
        // so differentiate by the height of the courseLink container
        if ($(".courseLinkPluginContainer").height() == 0) {
            thisClass.showCourseLink();
        } else {
            thisClass.hideCourseLink();
        }
    },
    
    // Show course here
    showCourseLink: function () {
        var thisClass = this;
        paella.events.trigger(paella.events.beforeShowPopUp, { identifier: thisClass.getName() }); 
        $(".courseLinkPlugin").show();
        var courseLinkHeight = $(".courseLinkPlugin").height();
        var timeLineContainerHeight = $(".timelinePluginContainer").height();
        $(".timelinePluginContainer").height(timeLineContainerHeight + courseLinkHeight + thisClass.heightBuffer);
        thisClass.setHidden(false);
    },
    
    hideCourseLink: function () {
        var thisClass = this;
        // only hide if not already hidden
        if (!thisClass.isHidden){
            $(".courseLinkPlugin").hide();
            var courseLinkHeight = $(".courseLinkPlugin").height();
            var timeLineContainerHeight = $(".timelinePluginContainer").height();
            $(".timelinePluginContainer").height(timeLineContainerHeight - courseLinkHeight - thisClass.heightBuffer);
            thisClass.setHidden(true);
        }
    },
    
    // try build the content, if series does not exist, just show the event title
    buildContent: function (domElement) {
        var thisClass = this;
        var container = document.createElement('div');
        container.className = 'courseLinkPluginContainer';
        container.id = "dce-series";
        
        if (paella.matterhorn && paella.matterhorn.episode && paella.matterhorn.episode.dcTitle) {
            thisClass.buildEventTitleUI(paella.matterhorn.episode.dcTitle, container);
            thisClass.hasEventData = true;
            if (paella.matterhorn.serie) {
               thisClass.buildCourseLinkUI(paella.matterhorn.episode.dcTitle, paella.matterhorn.serie, container);
               thisClass.hasSeriesData = true;
            } 
        }
        domElement.appendChild(container);
    },
    
    // make sure the content is ready, only build if series exists
    willShowContent: function () {
        var thisClass = this;
         if (! thisClass.hasEventData && paella.matterhorn && paella.matterhorn.episode && paella.matterhorn.episode.dcTitle) {
            buildEventTitleUI(paella.matterhorn.episode.dcTitle, container);
            thisClass.hasEventData = true;
        }
       if (! thisClass.hasSeriesData && paella.matterhorn && paella.matterhorn.serie) {
            thisClass.buildCourseLinkUI(paella.matterhorn.episode.dcTitle, paella.matterhorn.serie, container);
            thisClass.hasSeriesData = true;
        }
    },

    buildEventTitleUI: function(title, parent) {
        // Add course title
        var event_title = "";
        if (title && title.length > 0){
            event_title = title;
        }
        var dceEventTitleHtml  = $("<div />").attr({
            "id": "dce-evnet-title", "class": "h1 dce-h1"
        }).html(event_title);
        $(parent).append($(dceEventTitleHtml));
       
    },
    
    buildCourseLinkUI: function (title, data, parent) {
        var thisClass = this;
        paella.debug.log('build Harvrd course link UI element');
        var series_dce_courseNumber = "";
        var series_dce_title = "";
        var series_dce_courseUrl = "/";

        if (typeof (data) == 'string') {
            data = JSON.parse(data);
        }
        
        // Append course link
        if (data[thisClass.DUBLINCORE_NS_URI]) {
            
            data = data[thisClass.DUBLINCORE_NS_URI];
            paella.debug.log(data[ 'identifier'][0].value);
            
            for (var key in data) {
                if (key == "title") {
                    series_dce_title = data[key][0].value;
                    paella.debug.log("hi title " + series_dce_title);
                } else if (key == "description") {
                    series_dce_courseUrl = data[key][0].value;
                    paella.debug.log("hi courseUrl  " + series_dce_courseUrl);
                } else if (key == "subject") {
                    series_dce_courseNumber = data[key][0].value;
                    paella.debug.log("hi courseNumber  " + series_dce_courseNumber);
                }
            }
            
            var dceCourseUrlHtml = $("<div />").attr({
                "id": "dce-course-url", "class": "h2 dce-h2"
            }).append($("<a />").attr({
                "title": "Go to " + series_dce_title + " course web site",
                "href": series_dce_courseUrl,
                "id": "dce-course-link"
            }).append($("<div />").attr({
                "id": "dce-course-number"
            }).html(series_dce_courseNumber)));
            
            var dceCourseTitleHtml = $("<div />").attr({
                "id": "dce-course-title", "class": "h1 dce-h1"
            }).html(series_dce_title);


            paella.debug.log("dceCourseTitleHtml = " + dceCourseTitleHtml);
            
            // append to parent
            // $(parent).append($(dceCourseTitleHtml));
            $(parent).append($(dceCourseUrlHtml));
        } 
    }
});

paella.plugins.courseLinkPluginPlugin = new paella.plugins.CourseLinkPlugin();