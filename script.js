var app = angular.module('myApp', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider
                .when('/', {
                    templateUrl: './login.html',
                    controller: 'loginCntrl'
                })
                .when('/register', {
                    templateUrl: './register.html',
                    controller: 'regCntrl'
                })
                .when('/home/:id', {
                    templateUrl: './home.html',
                    controller: 'homeCntrl',
                    resolve: {
                        loggedIn: onlyLoggedIn
                    }
                })
                .when('/postjob/:id', {
                    templateUrl: './postjob.html',
                    controller: 'postCntrl',
                    resolve: {
                        loggedIn: onlyLoggedIn
                    }
                })
                .when('/search/:id', {
                    templateUrl: './search.html',
                    controller: 'searchCntrl',
                    resolve: {
                        loggedIn: onlyLoggedIn
                    }
                })
                .when('/logout', {
                    templateUrl: 'login.html',
                    controller: 'loginCntrl'
                })
                .otherwise({
                    redirectTo: '/'
                });

    }]);


var onlyLoggedIn = function ($location, $q, Auth) {
    var deferred = $q.defer();
    if (Auth.isLogin()) {
        deferred.resolve();
    } else {
        deferred.reject();

        $location.url('/');
    }
    return deferred.promise;
};



app.factory('Auth', function () {
    var user;

    return {
        setUser: function (aUser) {
            localStorage.setItem('MyUser', aUser);

        },
        isLogin: function () {
            user = localStorage.getItem('MyUser');
            return (user) ? user : false;
        }
    };
});

app.controller('homeCntrl', ['$scope', '$location', '$routeParams', '$http', function ($scope, $location, $routeParams, $http) {

        $scope.menuID = $routeParams.id;
        $scope.config = {
            params: {
                id: $scope.menuID
            }
        };

        $http.get("/getUserData", $scope.config)
                .then(function (response) {

                    if (response.data['type'] === "company") {
                        $scope.mylink = "postjob";
                        $scope.mylinkview = "Post a job";
                    } else {
                        $scope.mylink = "search";
                        $scope.mylinkview = "Search jobs";
                    }

                });

    }]);


app.controller('searchCntrl', ['$scope', '$location', '$routeParams', '$http', function ($scope, $location, $routeParams, $http) {

 $scope.menuID = $routeParams.id;
        $http.get("/getjobsData")
                .then(function (response) {
                    $scope.temp = response.data;

                    $scope.batKicks = $scope.temp.filter(function (el) {
                        return (el.myposts.length > 0);
                    });

                    $myjobsArr = [];
                    $scope.batKicks.map(function (obj) {

                        obj.myposts.map(function (i) {
                            $myjobsArr.push(i);
                        });
                    });
                    
                    $scope.jobs = $myjobsArr;
                });
                

    }]);


app.controller('postCntrl', ['$scope', '$location', '$routeParams', '$http', function ($scope, $location, $routeParams, $http) {

        $scope.postjob = function () {

            $scope.menuID = $routeParams.id;
            $scope.config = {
                params: {
                    id: $scope.menuID
                }
            };


            $http.get("/getUserData", $scope.config)
                    .then(function (response) {

                        $scope.Mypostobj = {
                            "id": $scope.menuID,
                            "title": $scope.title,
                            "description": $scope.description,
                            "keywords": $scope.keywords,
                            "location": $scope.location
                        };

                        $http.post('/updatepost', $scope.Mypostobj);


                    });

        };



    }]);


app.controller('loginCntrl', ['$scope', '$location', '$http', '$filter', 'Auth', function ($scope, $location, $http, $filter, Auth) {



        if (localStorage.getItem('MyUser') !== null) {
            localStorage.removeItem('MyUser');
            $location.url('/');
        }
        $scope.login = function () {


            $http.get("/getData")
                    .then(function (response) {
                        $scope.temp = response.data;

                        $scope.myloginObjects = $filter('filter')($scope.temp, {
                            "username": $scope.uname,
                            "password": $scope.password
                        });


                        if ($scope.myloginObjects.length > 0) {

                            Auth.setUser($scope.myloginObjects[0]._id);

                            $location.path('/home/' + $scope.myloginObjects[0]._id);
                        } else {
                            alert('not existing');

                        }

                    });

        };


    }]);

app.controller('regCntrl', ['$scope', '$location', '$http', '$filter', function ($scope, $location, $http, $filter) {

        $scope.reg = function () {

            $scope.Mydataobj = {
                "username": $scope.username,
                "password": $scope.password,
                "email": $scope.email,
                "location": $scope.location,
                "type": $scope.utype,
                "phone": $scope.phone
            };

            $http.get("/getData")
                    .then(function (response) {
                        $scope.temp = response.data;

                        $scope.myRedObjects = $filter('filter')($scope.temp, {
                            "username": $scope.username
                        });

                        if ($scope.myRedObjects.length > 0) {
                            alert("username already exists");
                        } else {

                            $http.post('/postData', $scope.Mydataobj);
                            $location.path('/');
                        }

                    });

        };
    }]);