function onHeaderSearch(){
	var headerSearchInput = $('#paellaExtendedHeaderSearchInput')[0]
	window.location.href="index.html?q="+headerSearchInput.value;
}

function insertHeaderToDomNode(parentNodeName) {
	var parentNode = document.getElementById(parentNodeName);

	var paellaExtendedHeader = document.createElement('div');
	paellaExtendedHeader.id = 'paellaExtendedHeader';
	
	var paellaExtendedHeaderLogoDiv = document.createElement('div');
	paellaExtendedHeaderLogoDiv.id = 'paellaExtendedHeaderLogoDiv';
	paellaExtendedHeader.appendChild(paellaExtendedHeaderLogoDiv);	
	var paellaExtendedHeaderLogo = document.createElement('a');
	paellaExtendedHeaderLogo.id = 'paellaExtendedHeaderLogo';
	paellaExtendedHeaderLogo.title = '';
	paellaExtendedHeaderLogo.setAttribute("tabindex", "-1");
	paellaExtendedHeaderLogo.href = 'index.html';
	paellaExtendedHeaderLogoDiv.appendChild(paellaExtendedHeaderLogo);	
	var paellaExtendedHeaderLogoImg = document.createElement('img');
	paellaExtendedHeaderLogoImg.id = 'paellaExtendedHeaderLogoImg';
	paellaExtendedHeaderLogoImg.src = 'config/profiles/resources/logo.png';
	paellaExtendedHeaderLogo.appendChild(paellaExtendedHeaderLogoImg);	


	var paellaExtendedHeaderSearch = document.createElement('div');
	paellaExtendedHeaderSearch.id = 'paellaExtendedHeaderSearch';
	paellaExtendedHeader.appendChild(paellaExtendedHeaderSearch);	

	var paellaExtendedHeaderSearchForm = document.createElement('form');
	paellaExtendedHeaderSearchForm.id = 'paellaExtendedHeaderSearchForm';
	$(paellaExtendedHeaderSearchForm).submit(function(event) {onHeaderSearch(); return false;});
	paellaExtendedHeaderSearch.appendChild(paellaExtendedHeaderSearchForm);	

	var paellaExtendedHeaderSearchInputDiv = document.createElement('div');
	paellaExtendedHeaderSearchInputDiv.id = 'paellaExtendedHeaderSearchInputDiv';
	paellaExtendedHeaderSearchForm.appendChild(paellaExtendedHeaderSearchInputDiv);	
	var paellaExtendedHeaderSearchInput = document.createElement('input');
	paellaExtendedHeaderSearchInput.id = 'paellaExtendedHeaderSearchInput';
	paellaExtendedHeaderSearchInput.setAttribute("tabindex", "100");
	paellaExtendedHeaderSearchInput.type = 'text';
	paellaExtendedHeaderSearchInput.tabIndex = 1;
	paellaExtendedHeaderSearchInput.title = 'Search';
	paellaExtendedHeaderSearchInput.setAttribute('dir','lrt');
	paellaExtendedHeaderSearchInput.spellcheck = 'false';
	paellaExtendedHeaderSearchInput.setAttribute('x-webkit-speech','');
	paellaExtendedHeaderSearchInputDiv.appendChild(paellaExtendedHeaderSearchInput);	

	
	var paellaExtendedHeaderSearchButtonDiv = document.createElement('div');
	paellaExtendedHeaderSearchButtonDiv.id = 'paellaExtendedHeaderSearchButtonDiv';
	paellaExtendedHeaderSearchForm.appendChild(paellaExtendedHeaderSearchButtonDiv);	
	var paellaExtendedHeaderSearchButton = document.createElement('input');
	paellaExtendedHeaderSearchButton.id = 'paellaExtendedHeaderSearchButton';
	paellaExtendedHeaderSearchButton.type = 'submit';
	paellaExtendedHeaderSearchButton.value = paella.dictionary.translate('Search');
	paellaExtendedHeaderSearchButton.setAttribute("tabindex", "101");	
	paellaExtendedHeaderSearchButtonDiv.appendChild(paellaExtendedHeaderSearchButton);	


	var paellaExtendedHeaderLogin = document.createElement('div');
	paellaExtendedHeaderLogin.id = 'paellaExtendedHeaderLogin';
	paellaExtendedHeader.appendChild(paellaExtendedHeaderLogin);	
	var paellaExtendedHeaderLoginButton = document.createElement('div');
	paellaExtendedHeaderLoginButton.setAttribute("tabindex", "102");	
	paellaExtendedHeaderLoginButton.id = 'paellaExtendedHeaderLoginButton';
	if (paella.matterhorn.me.username === "anonymous") {	
		paellaExtendedHeaderLoginButton.innerHTML = paella.dictionary.translate("Login");
		var redirectTo = window.location.href;
		$(paellaExtendedHeaderLogin).click(function(event) {window.location.href="auth.html?redirect="+encodeURIComponent(redirectTo);});
		$(paellaExtendedHeaderLogin).keyup(function(event) {
			if (event.keyCode == 13) { window.location.href="/login.html"; }
		});
	}
	else {
		paellaExtendedHeaderLoginButton.innerHTML = paella.dictionary.translate("Logout");
		$(paellaExtendedHeaderLogin).click(function(event) {window.location.href="/j_spring_security_logout";});
		$(paellaExtendedHeaderLogin).keyup(function(event) {
			if (event.keyCode == 13) { window.location.href="/j_spring_security_logout"; } 
		});
	}
	paellaExtendedHeaderLogin.appendChild(paellaExtendedHeaderLoginButton);	




	parentNode.appendChild(paellaExtendedHeader);
}

