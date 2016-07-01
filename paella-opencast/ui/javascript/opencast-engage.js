(function() {
	var app = angular.module('opencastEngage', [])
	
	app.directive('opencastEpisode', [function(){
		return {
			restrict: 'E',
			scope: {
				episode: "="
			},		
			templateUrl: 'directives/opencast-episode.html',
			controller: ["$scope", function($scope) {
				$scope.getSearchImage = function() {
					var ret = null;
					if ( ($scope.episode.mediapackage) && ($scope.episode.mediapackage.attachments) && ($scope.episode.mediapackage.attachments.attachment) ) {
						$scope.episode.mediapackage.attachments.attachment.forEach(function(a){
							if (a.type == "presentation/search+preview") {
								ret = a.url;
							}
							if ((ret == null) && (a.type == "presenter/search+preview")) {
								ret = a.url;
							}
						});
					}
					if (ret == null) {
						ret = "images/not_found.png"
					}
					
					return ret;
				};
				
				$scope.viewVideo = function() {
					window.location.href="watch.html?id=" + $scope.episode.id;
				};
				
				$scope.secondsToText = function(ms) {
					var s = ms/1000;
					var m = Math.floor(s/60);
					s = Math.floor(s%60);
					var h = Math.floor(m/60);
					m = Math.floor(m%60);
					
					h = ("0" + h).slice(-2);
					m = ("0" + m).slice(-2);
					s = ("0" + s).slice(-2);					
					
					return h+":"+m+":"+s;
				};
			}]
		};
	}]);
	
	app.controller('OpencastEngageController', ['$scope', '$http', function($scope, $http) {
		$scope.search = function() {
			$scope.q = $scope.newSearch;
			$scope.reloadPage();
		}

		$scope.reloadPage = function() {
			var q = $scope.newSearch || $scope.q || "";
			var limit = parseInt($scope.limitText) || 20;
			var page = $scope.page || 0;
			var sort = $scope.sort || "";			
			var url = '?limit='+limit+'&page='+page+'&q='+q+'&sort='+sort;

			window.location.href = url;			
		}

		$scope.goNextPage = function() {
			$scope.page = $scope.page + 1;
			$scope.reloadPage();
		}

		$scope.goPreviousPage = function() {
			$scope.page = $scope.page - 1;
			$scope.reloadPage();
		}
		
		$scope.login = function() {		
			window.location.href="auth.html?redirect="+encodeURIComponent(window.location.href);	
		}
		
		$scope.logout = function() {
			window.location.href = "/j_spring_security_logout";
		}
	
	
		$scope.getOpencastEpisodes = function() {
			var q = $scope.q || "";
			var limit = parseInt($scope.limitText) || 15;
			var page = $scope.page || 0;
			var offset = page*limit;
			var sort = $scope.sort || "";			
			var url = '/search/episode.json?limit='+limit+'&offset='+offset+'&q='+q+'&sort='+sort;

			$scope.loading = true;
			$http.get(url).then(function(res){
				$scope.searchResult = res.data['search-results'];
				$scope.searchResult.result = [].concat($scope.searchResult.result);

				$scope.lastPage = Math.ceil((parseInt($scope.searchResult.total)/limit)-1).toString();
				$scope.loading = false;
			});
		}	
	
		//Read search params
		var search={};
		window.location.search.slice(1).split("&").forEach(function(x){
			var p = x.split("=");
			search[p[0]]=p[1];
		});
				
		$scope.q = search.q || "";
		$scope.limit = search.limit ? parseInt(search.limit) : 20;
		$scope.page = search.page ? parseInt(search.page) : 0;
		
		
		$scope.isLogged = false;
		$scope.limitText = $scope.limit.toString();		
		$scope.lastPage = 0;
		$scope.lastResult = 0;
		$scope.firstResult = 0;
		$scope.loading = true;
	
		$http.get('/info/me.json').then(function(res){
			$scope.me = res.data;
			if (res.data.userRole == res.data.org.anonymousRole) {
				$scope.isLogged = false;
			}
			else {
				$scope.isLogged = true;				
			}
		});	
	
		$scope.getOpencastEpisodes();
	}]);

})();