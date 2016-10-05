angular.module('shmuesController', [])

// inject the Todo service factory into our controller
    .controller('mainController', ['$scope', '$http', 'Shmues', function ($scope, $http, Shmues) {
        $scope.formData = {};
        $scope.loading = true;

        // GET =====================================================================
        // when landing on the page, get all shmues and show them
        // use the service to get all the shmues
        Shmues.get()
            .success(function (data) {
                $scope.shmues = data;
                $scope.loading = false;
            });

        // CREATE ==================================================================
        // when submitting the add form, send the text to the node API
        $scope.createShmues = function () {

            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            if ($scope.formData.text != undefined) {
                $scope.loading = true;

                // call the create function from our service (returns a promise object)
                Shmues.create($scope.formData)

                // if successful creation, call our get function to get all the new shmues
                    .success(function (data) {
                        $scope.loading = false;
                        $scope.formData = {}; // clear the form so our user is ready to enter another
                        $scope.shmues = data; // assign our new list of shmues
                    });
            }
        };

        // DELETE ==================================================================
        // delete a todo after checking it
        $scope.deleteShmues = function () {
            console.log('entering delete function')
            $scope.loading = true;
            Shmues.get().success(function (data) {
                console.log(JSON.stringify(data));
                for(var i =0;i<data.length;i++){
                    chat = data[i];
                    console.log('this is what i got from chat' + JSON.stringify(chat));
                    Shmues.delete(chat["_id"]).success(function (data) {
                        $scope.loading = false;
                        $scope.shmues = data; // assign our new list of shmues
                    });
                }
                $scope.loading = false;
            });
        };

    }]);