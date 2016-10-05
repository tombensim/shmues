angular.module('shmuesService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Shmues', ['$http',function($http) {
		return {
			get : function() {
				return $http.get('/api/chat');
			},
			create : function(shmuesData) {
				return $http.post('/api/chat', shmuesData);
			},
			delete : function(id) {
				return $http.delete('/api/chat/' + id);
			}
		}
	}]);