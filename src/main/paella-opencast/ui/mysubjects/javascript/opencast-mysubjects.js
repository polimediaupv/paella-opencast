(function() {
	var app = angular.module('opencastMySubjects', [])
	
	
	app.controller('OpencastMySubjectsController', ['$scope', '$http', function($scope, $http) {		
		$scope.login = function() {		
			window.location.href="auth.html?redirect="+encodeURIComponent(window.location.href);	
		}
		
		$scope.logout = function() {
			window.location.href = "/j_spring_security_logout";
		}
	
		$scope.getUserName = function() 
		{
			if ($scope.me){
				if ($scope.me.username) {return $scope.me.username; } //opencast 1.6/1.7
				if ($scope.me.user) {
					if ($scope.me.user.username) {
						return $scope.me.user.username;  //opencast 2.0/2.2
					}
				}				
			}
			
			return "-";
		}	
	
		// Start
		$scope.loading = true;
	
		$http.get('/info/me.json').then(function(res){
			$scope.me = res.data;
			
			$scope.subjects = {};
			function createKey(key) {
				if (!(key in $scope.subjects)) {
					$scope.subjects[key] = {subject:key, instrcutor:false};
				}
			}
			$scope.me.roles.forEach(function(r) { 
				if (r.endsWith("_Instructor")) {
					var subject = r.substr(0,r.length-11);
					createKey(subject);
					$scope.subjects[subject].instructor = true;
				}
				else if (r.endsWith("_Learner")) {
					var subject = r.substr(0,r.length-8)
					createKey(subject);
				}
				else if (r.startsWith("ROLE_VA_")) {
					$scope.mysubject = r.substr(8,r.length);
					console.log($scope.mysubject);
				}
			});
			
			if (res.data.user.provider == null) {
				$scope.isLogged = false;
			}
			else {
				$scope.isLogged = true;		
			}
			
			$scope.loading = false;
		});	
	}]);

})();