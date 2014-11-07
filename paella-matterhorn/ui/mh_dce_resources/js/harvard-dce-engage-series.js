/**
 * Copyright 2009-2011 The Regents of the University of California Licensed
 * under the Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain a
 * copy of the License at
 *
 * http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 */
/**
 *  Harvard DCE, Laods series data into Publication Listing Page
 *  Created July 12, 2013
 */
var SERIES_SERVICE_URL = "/series";
var DUBLINCORE_NS_URI = 'http://purl.org/dc/terms/';
var OC_NS_URI = 'http://www.opencastproject.org/matterhorn/';
var DCE_BANNER_PARENT_DIV_ID = "dce-banner";
var dceSeries = {
    series_dce_courseNumber: "",
    series_dce_title: "",
    series_dce_courseUrl: "",
    series_dce_creator: "",
    // Default to Extension school
    schoolKey:"Harvard Extension School",
    dublincore_ns_uri: "http://purl.org/dc/terms/",
    // dceSeries.init("20130333019");
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
    wind: function (seriesId) {
        var thisClass = this;
        if (seriesId && (seriesId !== '')) {
            $.getJSON(SERIES_SERVICE_URL + "/" + seriesId + ".json", function (data) {
                thisClass.doLoad(data);
                // #DCE MATT-424
                thisClass.dceAddLegacyPubListLink(seriesId);
            }).always(function () {
                thisClass.insertHeaderToDomNode(DCE_BANNER_PARENT_DIV_ID);
            })
        } else {
            // apply the default header (extension school)
            thisClass.insertHeaderToDomNode(DCE_BANNER_PARENT_DIV_ID);
        }
    },
    getSeriesCreator: function () {
        return this.series_dce_creator;
    },
    doLoad: function (dublincore) {
        var thisClass = this;
        var data = dublincore[DUBLINCORE_NS_URI]
        console.log(data[ 'identifier'][0].value);
        for (var key in data) {
            if (key == "title") {
                thisClass.series_dce_title = data[key][0].value;
                console.log("hi title " + thisClass.series_dce_title);
            } else if (key == "description") {
                thisClass.series_dce_courseUrl = data[key][0].value;
                console.log("hi courseUrl  " + thisClass.series_dce_courseUrl);
            } else if (key == "subject") {
                thisClass.series_dce_courseNumber = data[key][0].value;
                console.log("hi courseNumber  " + thisClass.series_dce_courseNumber);
            } else if (key == "creator") {
                thisClass.series_dce_creator = data[key][0].value;
                console.log("hi course creator  " + thisClass.series_dce_creator);
            }
        }
        var dceCourseUrlHtml = $("<div />").attr({
            "id": "dce-course-url", "class": "h2"
        }).append($("<a />").attr({
            "title": "Go to " + thisClass.series_dce_title + " course web site",
            "href": thisClass.series_dce_courseUrl
        }).append($("<div />").attr({
            "id": "dce-course-number"
        }).html(thisClass.series_dce_courseNumber)));
        var dceCourseTitleHtml = $("<div />").attr({
            "id": "dce-course-title", "class": "h1"
        }).html(thisClass.series_dce_title);
        console.log("dceCourseTitleHtml = " + dceCourseTitleHtml);
        if ($("#dce-series").length > 0) {
            $("#dce-series").append($(dceCourseTitleHtml));
            $("#dce-series").append($(dceCourseUrlHtml));
        }
    },
    getSeriesSchoolKey: function () {
        var thisClass = this;
        // Overwrite default with new school if recognized in map
        // paella.matterhorn.serie["http://purl.org/dc/terms/"].creator[0].value
        if (thisClass.series_dce_creator.length > 0) {
            var tempKey = thisClass.series_dce_creator;
            // Only take key if it maps into dceMhBannerMap
            if (thisClass.dceMhBannerMap[tempKey]) {
                thisClass.schoolKey = tempKey;
            }
        } 
        return thisClass.schoolKey;
    },
    
    insertHeaderToDomNode: function (parentNodeName) {
        var thisClass = this;
        var schoolName = thisClass.getSeriesSchoolKey();
        if (schoolName && schoolName.length < 1) {
            // no header if a default schoolKey was not set
            return false;
        }
        // Container node must be informed
        var parentNode = document.getElementById(parentNodeName);
        if (! parentNode || parentNode.length < 1) {
            return false;
        }
        // NOTE: leaving the paella var references to match the player code
        var paellaExtendedHeader = document.createElement('div');
        paellaExtendedHeader.id = 'paellaExtendedHeader';
        // <div id="header-banner-ext" class="page-banner">
        var paellaExtendedHeaderBannerDiv = document.createElement('div');
        paellaExtendedHeaderBannerDiv.id = thisClass.dceMhBannerMap[schoolName].divId;
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
        paellaExtendedHeaderLink.href = thisClass.dceMhBannerMap[schoolName].href;
        // Create the non-visible anchor text
        var paellaExtendedHeaderLinkTextNode = document.createTextNode(schoolName);
        // add child to parent, inside out
        paellaExtendedHeaderLink.appendChild(paellaExtendedHeaderLinkTextNode);
        paellaExtendedHeaderBannerWrapDiv.appendChild(paellaExtendedHeaderLink);
        paellaExtendedHeaderBannerDiv.appendChild(paellaExtendedHeaderBannerWrapDiv);
        paellaExtendedHeader.appendChild(paellaExtendedHeaderBannerDiv);
        // replace header in parent node
        $(parentNode).replaceWith(paellaExtendedHeader);
    },
    // #DCE MATT-424
    // If the student can't find a lecture in the Matterhorn publication listing, they should find it at
    // http://cm.dce.harvard.edu/yyyy/tt/crn/publicationListing.shtml
    // Parse the seriesId and create a legacy link if the seriesId takes the form of a  DCE offering Id.
    // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
    // Example: dceParseCourseLink("20130113300");
    dceAddLegacyPubListLink: function (crnString) {
        var crnPathString;
        var LEGACY_LINK_TEXT_PREFIX = "If you are unable to find a publication, try ";
        var LEGACY_LINK_TEXT = "here";
        var LEGACY_PREFIX = "http://cm.dce.harvard.edu/";
        var LEGACY_POSTFIX = "/publicationListing.shtml";
        var DCE_LEGACY_LINK_DIV = "#dce-legacy-pub-list-link";
        var replacer = function (match, p1, p2, p3, offset, string) {
            // p1, p2, and p3 are the three matching regex groups
            return[p1, p2, p3].join('/');
        };
        // A successful construct is 13 in length, digits with 2 slashes
        var addLink = function (pathString) {
            if ((pathString.length == 13) && ($(DCE_LEGACY_LINK_DIV).length > 0)) {
                var legacyHref = LEGACY_PREFIX + pathString + LEGACY_POSTFIX;
                var legacyPubListLinkText = LEGACY_LINK_TEXT_PREFIX + "<a href='" + legacyHref + "'>" + LEGACY_LINK_TEXT + "</a>.";
                $(DCE_LEGACY_LINK_DIV).html(legacyPubListLinkText);
            } else {
                // debug log that the crn could not be parsed
                console.log("Could not parse " + crnPathString + " as a DCE offering identifier and create a legacy publication listing link.");
            }
        };
        crnPathString = crnString.replace(/(\d{4})(\d{2})(\d{5})/, replacer);
        addLink(crnPathString);
    }
};