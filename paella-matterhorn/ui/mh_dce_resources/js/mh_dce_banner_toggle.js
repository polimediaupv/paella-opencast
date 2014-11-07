// #DCE MATT-362 Toggle Summer and Extension School header
// Created for Paella player DCE wrapper
// Oct 28, 2014 - KHD
dce = dce || {};

dce.DceBannerHeader = Class.create({
    // Default to Extension school
    schoolKey: "Harvard Extension School",
    parentDiv: "paellaExtendedHeaderWrap",
    dublincore_ns_uri: "http://purl.org/dc/terms/",
    dceMhBannerMap: {
        "Harvard Extension School": {
            school: "Harvard Extension School",
            href: "http://extension.harvard.edu",
            divId: "header-banner-ext"
        },
        "Harvard Summer School": {
            school: "Harvard Summer School",
            href: "http://summer.harvard.edu",
            divId: "header-banner-sum"
        },
        "Harvard Faculty of Arts and Sciences": {
            school: "Harvard Extension School",
            href: "http://fas.harvard.edu",
            divId: "header-banner-fas"
        }
    },
    initialize: function () {
        var thisClass = this;
        thisClass.insertHeaderToDomNode(thisClass.parentDiv);
        // paella.events.bind(paella.events.loadStarted, function (event, params) {
        //    thisClass.insertHeaderToDomNode(thisClass.parentDiv);
        // });
    },
    getSeriesSchoolKey: function () {
        // paella.matterhorn.serie["http://purl.org/dc/terms/"].creator[0].value
        // Test if series data has been retrieved
        if (paella && paella.matterhorn && paella.matterhorn.serie) {
            // check if creator value is filled
            if (paella.matterhorn.serie[ "http://purl.org/dc/terms/"].creator && paella.matterhorn.serie["http://purl.org/dc/terms/"].creator[0].value.length > 0) {
                var tempKey = paella.matterhorn.serie[ "http://purl.org/dc/terms/"].creator[0].value;
                // check if it is known school
                if (this.dceMhBannerMap[tempKey]) {
                    this.schoolKey = tempKey; // Only take key if it maps into dceMhBannerMap
                }
            }
        }
        return this.schoolKey;
    },
    insertHeaderToDomNode: function (parentNodeName) {
        var schoolName = this.getSeriesSchoolKey();
        if (schoolName.length < 1) {
            // no header
            return false;
        }
        // Container node not
        var parentNode = document.getElementById(parentNodeName);
        if (! parentNode || parentNode.length < 1) {
            return false;
        }
        var paellaExtendedHeader = document.createElement('div');
        paellaExtendedHeader.id = 'paellaExtendedHeader';
        // <div id="header-banner-ext" class="page-banner">
        var paellaExtendedHeaderBannerDiv = document.createElement('div');
        paellaExtendedHeaderBannerDiv.id = this.dceMhBannerMap[schoolName].divId;
        paellaExtendedHeaderBannerDiv.className = 'page-banner';
        //<div id="harvard" class="banner-wrap">
        var paellaExtendedHeaderBannerWrapDiv = document.createElement('div');
        paellaExtendedHeaderBannerWrapDiv.id = 'harvard';
        paellaExtendedHeaderBannerWrapDiv.className = 'banner-wrap';
        //<a class="banner-link" title="Harvard Extension School"
        //              href="http://www.extension.harvard.edu/">Harvard Extension School</a>
        var paellaExtendedHeaderLink = document.createElement('a');
        paellaExtendedHeaderLink.id = 'paellaExtendedHeaderLink';
        paellaExtendedHeaderLink.className = 'banner-link';
        paellaExtendedHeaderLink.title = schoolName;
        paellaExtendedHeaderLink.setAttribute("tabindex", "-1");
        paellaExtendedHeaderLink.href = this.dceMhBannerMap[schoolName].href;
        // Create the non-visible anchor text
        var paellaExtendedHeaderLinkTextNode = document.createTextNode(schoolName);
        // add child to parent, inside out
        paellaExtendedHeaderLink.appendChild(paellaExtendedHeaderLinkTextNode);
        paellaExtendedHeaderBannerWrapDiv.appendChild(paellaExtendedHeaderLink);
        paellaExtendedHeaderBannerDiv.appendChild(paellaExtendedHeaderBannerWrapDiv);
        paellaExtendedHeader.appendChild(paellaExtendedHeaderBannerDiv);
        // TBD: add series text to the header
        // requires adding a placeholder <div id="dce-series"></div>
        // var paellaExtendedHeaderSeriesDiv = document.createElement('div');
        //  paellaExtendedHeaderSeriesDiv.id = 'dce-series';
        //  paellaExtendedHeader.appendChild(paellaExtendedHeaderSeriesDiv);
        // add main div to parent node
        parentNode.appendChild(paellaExtendedHeader);
    },
    
     getSeriesAlt: function (page) {
    
        // Request JSONP data
        $.ajax(
        {
            url: Opencast.Watch.getSeriesSeriesURL(),
            data: 'id=' + series_id + '&episodes=true&limit=20&offset=' + ((page - 1) * 20),
            dataType: 'jsonp',
            jsonp: 'jsonp',
            success: function (data)
            {
                $.log("Series AJAX call: Requesting data succeeded");
                data = createDataForPlugin(data);
                data['search-results'].currentPage = page;
                //add as a plugin
                Opencast.Series_Plugin.addAsPlugin($('#oc_series'), data['search-results']);
            },
            // If no data comes back
            error: function (xhr, ajaxOptions, thrownError)
            {
                $.log("Series Ajax call: Requesting data failed");
                Opencast.Player.addEvent(Opencast.logging.SERIES_PAGE_AJAX_FAILED);
            }
        });
    },
    
    getSeries: function () {
        $.ajax({
            url: seriesUrl,
            data: 'id=' + series_id,
            dataType: 'jsonp',
            jsonp: 'jsonp',
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $.log("Series ("+ series_id +") Ajax call: Requesting data failed, error: " + textStatus);
            },
            success: function (data) {
                data['search-results']; // ...
                $(data.documentElement).children().each(function (index, elm) {
                    var tagName = elm.tagName.split(/:/)[1];
                    if ($(elm).text() != '') {
                        $('#meta-' + tagName).val($(elm).text());
                        if ($('#info-' + tagName).length > 0)
                        $('#info-' + tagName)[0].innerHTML = $(elm).text();
                        if (tagName === "category") {
                            value = $(elm).text();
                            $('#categorySelector').val(value.substr(0, 3));
                            changedCategory();
                            if (value.length > 3) {
                                $('#category').val(value);
                                changedSubCategory();
                            }
                        }
                        if (tagName === "created") {
                            $('#recordDate').datepicker('setDate', new Date($(elm).text()));
                            $('#startTimeHour').val((new Date($(elm).text())).getHours());
                            $('#startTimeMin').val((new Date($(elm).text())).getMinutes());
                        }
                    }
                });
            }
        });
    }
});

// Activate the class
dce.DceBannerHeader = new dce.DceBannerHeader();

/**
 *  To display Harvard DCE course link in Paella player UI
 *  TODO: Toggle between displaying video space and as button option
 *  Last modified Sept, 2013
 */

paella.plugins.HarvardCourseLink = Class.create(DomNode, {
    enabled: true,
    seriesId: "",
    showAsButton: false,
    SERIES_SERVICE: "series/",
    SEARCH_SERIES_JSON: "/search/series.json",
    DUBLINCORE_NS_URI: 'http://purl.org/dc/terms/',
    OC_NS_URI: 'http://www.opencastproject.org/matterhorn/',
    dceCourseTitleHtml: "",
    parentElementId:"dce-series", // hack to add div to body, TODO: fix
    
    initialize: function () {
        var thisClass = this;
        $(document).bind(paella.events.loadComplete, function (event, params) {
            //TODO: enable to button UI toggle from config file
            if ((paella.player.config.HarvardCourseLink) 
            		&& (paella.player.config.HarvardCourseLink.showButton)) {
                
                paella.plugins.HarvardCourseLink.showAsButton = true;
                paella.debug.log('load Harvard course link as button option');
            }
            if ((thisClass.seriesId) && (thisClass.seriesId != "")) {
                thisClass.loadSeriesData();
            } else {
                thisClass.getSeriesAndLoadData();
            }
        });
    },
    
    getSeriesAndLoadData: function () {
        var thisClass = this;        
        var id = paella.utils.parameters.get('id');
        var params = {
            "episodes": "true", "id": id
        };
        // Use the episode Id to find the series Id
        new paella.Ajax(thisClass.SEARCH_SERIES_JSON, params, function (data) {
            if (typeof (data) == 'string') {
                data = JSON.parse(data);
            }
            if (data[ "search-results"] && data[ "search-results"].total 
            		&& parseInt(data[ "search-results"].total) > 0) {
                paella.matterhorn.series.serie = data[ "search-results"].result;
                
                // Use the series Id, if it exists, to retrieve the series data
                if (paella.matterhorn && (paella.matterhorn.series != null) 
                		&& (paella.matterhorn.series.serie != null) 
                		&& (paella.matterhorn.series.serie.dcIsPartOf != null)) {
                    
                    var series_id = paella.matterhorn.series.serie.dcIsPartOf;
                    if (series_id && series_id !== '') {
                    	thisClass.seriesId = series_id;
                    	thisClass.loadSeriesData();
                    }
                }
            }
        }, thisClass.proxyUrl, thisClass.useJsonp); 
    },
    
    loadSeriesData: function () {
        var thisClass = this; 
        paella.debug.log('load series data for Harvard course link');
        this.useJsonp = paella.player.config.proxyLoader.usejsonp;
        if (paella.player.config.proxyLoader && paella.player.config.proxyLoader.enabled) {
            this.proxyUrl = paella.player.config.proxyLoader.url;
        }
        if (thisClass.seriesId && thisClass.seriesId !== '') {
            var restEndpoint = paella.player.config.restServer.url + thisClass.SERIES_SERVICE + thisClass.seriesId + ".json";
            new paella.Ajax(restEndpoint, {
                _method: 'GET'
            },
            function (response) {
                if (thisClass.showAsButton) {
                	thisClass.buildCourseLinkButton(response);
                } else {
                	thisClass.buildCourseLinkUI(response);
                }
            },
            thisClass.proxyUrl, thisClass.useJsonp);
        }
    },
    
    buildCourseLinkUI: function (data) {
        var thisClass = this; 
        paella.debug.log('build Harvrd course link UI element');
        var series_dce_courseNumber = "";
        var series_dce_title = "";
        var series_dce_courseUrl = "/";
        
        if (typeof (data) == 'string') {
            data = JSON.parse(data);
        }
        
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
                "href": series_dce_courseUrl
            }).append($("<div />").attr({
                "id": "dce-course-number"
            }).html(series_dce_courseNumber)));
            
            var dceCourseTitleHtml = $("<div />").attr({
                "id": "dce-course-title", "class": "h1 dce-h1"
            }).html(series_dce_title);
            
            paella.debug.log("dceCourseTitleHtml = " + dceCourseTitleHtml);
            
            //TODO: fix, turn into DomNode class proper
            var dceSeriesDiv = document.getElementById(thisClass.parentElementId);
            if(dceSeriesDiv) {
            	$(dceSeriesDiv).append($(dceCourseTitleHtml));
            	$(dceSeriesDiv).append($(dceCourseUrlHtml));
            }
            
            // Hack to show the title over the video, which may not work here
            $(body).find("#paellaExtendedHeader").css("z-index", "710");
            $(body).find(".playerContainer").css("box-shadow", "none");
        }
    },
    
    addTo: function(){
    	
    },
    
    getIndex: function () {
        return 1000;
    },
    
    getName: function () {
        return "HarvardCourseLinkPlugin";
    }
});

//dceSeries.init("20130333019");
new paella.plugins.HarvardCourseLink();

