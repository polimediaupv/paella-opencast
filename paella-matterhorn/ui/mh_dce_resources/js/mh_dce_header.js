function onHeaderSearch(){
	var headerSearchInput = $('#paellaExtendedHeaderSearchInput')[0]
	window.location.href="index.html?q="+headerSearchInput.value;
}

/*
 *  Creates this HTML within the passed div id ("paellaExtendedHeader" in this case)
 * <div id="paellaExtendedHeader">
 *       <!--Distance Education Header and banner-->
 *           <div id="header-banner-ext" class="page-banner">
 *           <div id="harvard" class="banner-wrap">
 *           <a class="banner-link" title="Harvard Extension School"
 *               href="http://www.extension.harvard.edu/">Harvard Extension School</a>
 *           </div>
 *           </div>
 *       <!-- END #header -->
 *    <!-- <div id="dce-series"></div> --> //removing series div!
 * </div> 
 * 
 */

function insertHeaderToDomNode(parentNodeName) {
	var parentNode = document.getElementById(parentNodeName);

	var paellaExtendedHeader = document.createElement('div');
	paellaExtendedHeader.id = 'paellaExtendedHeader';
	
	// <div id="header-banner-ext" class="page-banner">
	var paellaExtendedHeaderBannerDiv = document.createElement('div');
	paellaExtendedHeaderBannerDiv.id = 'header-banner-ext';
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
	paellaExtendedHeaderLink.title = 'Harvard Extension School';
	paellaExtendedHeaderLink.setAttribute("tabindex", "-1");
	paellaExtendedHeaderLink.href = 'http://www.extension.harvard.edu/';

	var paellaExtendedHeaderLinkTextNode = document.createTextNode('Harvard Extension School');
    
    // add child to parent, inside out
    paellaExtendedHeaderLink.appendChild(paellaExtendedHeaderLinkTextNode);
    paellaExtendedHeaderBannerWrapDiv.appendChild(paellaExtendedHeaderLink);	
    paellaExtendedHeaderBannerDiv.appendChild(paellaExtendedHeaderBannerWrapDiv);	
	paellaExtendedHeader.appendChild(paellaExtendedHeaderBannerDiv);	
	
	// add series tag to the header div
	// <div id="dce-series"></div>
	//var paellaExtendedHeaderSeriesDiv = document.createElement('div');
	// paellaExtendedHeaderSeriesDiv.id = 'dce-series';
	// paellaExtendedHeader.appendChild(paellaExtendedHeaderSeriesDiv);

    // add main div to parent node
	parentNode.appendChild(paellaExtendedHeader);
}

