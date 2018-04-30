var app = angular.module("app", ["ngRoute"])
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "static/html/home.html",
        controller: 'homeCtrl'
    })
    .when("/:id", {
        templateUrl : "static/html/project.html",
        controller: 'projectCtrl'
    })
    .otherwise({redirectTo : '/'})
}).run(() => {
 
})

app.controller('homeCtrl', ['$scope', '$http', '$rootScope', '$route', '$location', function($scope, $http, $rootScope, $route, $location) {
    $(function () {
        $("#datepicker-start").datepicker({ 
                autoclose: true, 
                todayHighlight: true
        }).datepicker('update', new Date())

        $("#datepicker-end").datepicker({ 
            autoclose: true, 
            todayHighlight: true
        }).datepicker('update', new Date())

    })
    $scope.budget_all = 1000000
    
    $http.get('/activities')
    .then(function(res) {
        if(res.data) {
            const data = Object.keys(res.data).map((key) => {
                return {
                    ...res.data[key],
                    key: key
                }
            })
            res.data = data
    
            $scope.activities = res.data
    
            const end_arr = res.data.map((ac) => {
                return ac.end
            })
    
            function getSumBudget(total, ac) {
                return total + ac.budget
            }
    
            function getSumDisburse(total, ac) {
                return total + ac.disburse
            }
    
            const budget_arr = res.data.reduce(getSumBudget, 0)
            const disburse_arr = res.data.reduce(getSumDisburse, 0)
    
            $scope.used_budget = budget_arr
            $scope.used_disburse = disburse_arr
            $scope.percent = ( disburse_arr / budget_arr ) * 100
            $scope.last_month = Math.max(...end_arr)
            return res
        }
        $scope.used_budget = 0
        $scope.used_disburse = 0
        $scope.percent = 0
        $scope.last_month = 0
        return res
    }).then(() => {
        $http.get('/staff').then((res) => {
            if(res.data) {
                const data = Object.keys(res.data).map((key) => {
                    return {
                        ...res.data[key],
                        key: key
                    }
                })
                res.data = data
    
                $scope.staffs = res.data
        
                function getSumSalary(total, ac) {
                    return total + ac.salary
                }
        
                $scope.all_salary = $scope.staffs.reduce(getSumSalary, 0)
                return res
            }
            $scope.all_salary = 0
        })
    })

    $scope.open_adding_activity = () => {
        $scope.activity_name = ""
        $scope.activity_budget = ""
        $scope.activity_start = ""
        $scope.activity_end = ""
        $scope.is_update_activity = false
    }

    $scope.open_adding_staff = () => {
        $scope.staff_name = null
        $scope.staff_department = null
        $scope.staff_type = null
        $scope.staff_position = null
        $scope.staff_salary = null
        $scope.staff_skill = null

        $scope.staff_type = 'บุคลากรหลัก'
        $scope.staff_position = 'หัวหน้าโครงการ'
        $scope.show_main = true
        $scope.staff_salary = 30000
        $scope.show_support = false

        $scope.is_update_staff = false
    }

    $scope.update_staff = () => {
        $http.put('/staff/' + $scope.staff_key, {
            fullname: $scope.staff_name,
            department: $scope.staff_department,
            type: $scope.staff_type,
            position: $scope.staff_position,
            salary: parseInt($scope.staff_salary),
            skill: $scope.staff_skill
        })
        .then(function(res) {
            $route.reload()
        })
    }

    $scope.open_update_activity_modal = (index) => {
        $scope.activity_name = $scope.activities[index].name
        $scope.activity_budget = $scope.activities[index].budget
        $scope.activity_start = $scope.activities[index].start
        $scope.activity_end = $scope.activities[index].end
        $scope.activity_key = $scope.activities[index].key

        $scope.is_update_activity = true
    }

    $scope.open_updating_staff = (index) => {
        $scope.staff_name = $scope.staffs[index].fullname
        $scope.staff_department = $scope.staffs[index].department
        $scope.staff_type = $scope.staffs[index].type
        $scope.staff_position = $scope.staffs[index].position
        $scope.staff_salary = $scope.staffs[index].salary
        $scope.staff_skill = $scope.staffs[index].skill
        $scope.staff_key = $scope.staffs[index].key

        $scope.is_update_staff = true
    }

    $scope.update_activity = () => {
        $http.put('/activities/' + $scope.activity_key , {
            name: $scope.activity_name,
            budget: parseInt($scope.activity_budget),
            start: parseInt($scope.activity_start),
            end: parseInt($scope.activity_end)
        }).then(function(res) {
            $route.reload()
        })
    }
    
    $scope.del_activity = (key) => {
        
        $http.delete('/activities/'+key).then(function(res) {
            $route.reload()
            $('#staff').hide();
            $('#myModal').hide()
        })
    }

    $scope.add_activity = () => {
        $http.post('/activities', {
            name: $scope.activity_name,
            budget: parseInt($scope.activity_budget),
            start: parseInt($scope.activity_start),
            end: parseInt($scope.activity_end),
            disburse:  0
        })
        .then(function(res) {
            $route.reload()
            $('#staff').hide();
            $('#myModal').hide()
        })
    }

    $scope.add_validation = () => {
        return $scope.activity_name && $scope.activity_budget && $scope.activity_start && $scope.activity_end && ($scope.activity_start <= $scope.activity_end)
    }

    $scope.staff_type = 'บุคลากรหลัก'
    $scope.staff_position = 'หัวหน้าโครงการ'
    $scope.show_main = true
    $scope.staff_salary = 30000
    $scope.type_change = () => {
        if($scope.staff_type == 'บุคลากรหลัก') {
            $scope.show_main = true
            $scope.show_support = false
            $scope.staff_position = 'หัวหน้าโครงการ'
            $scope.staff_salary = 30000
        } else {
            $scope.show_main = false
            $scope.show_support = true
            $scope.staff_position = 'ผู้ช่วยนักวิจัย'
            $scope.staff_salary = 20000
        }
    }

    $scope.position_change = () => {
        if($scope.staff_position == 'หัวหน้าโครงการ') {
            $scope.staff_salary = 30000
        } else if ($scope.staff_position == 'นักวิจัย') {
            $scope.staff_salary = 25000
        } else if ($scope.staff_position == 'ผู้ช่วยนักวิจัย') {
            $scope.staff_salary = 20000
        } else {
            $scope.staff_salary = 15000
        }
    }

    $scope.can_add_staff = () => {
        return $scope.staff_position && $scope.staff_type && $scope.staff_name && $scope.staff_department && $scope.staff_salary && $scope.staff_skill
    }

    $scope.add_staff = () => {
        $http.post('/staff', {
            fullname: $scope.staff_name,
            department: $scope.staff_department,
            type: $scope.staff_type,
            position: $scope.staff_position,
            salary: parseInt($scope.staff_salary),
            skill: $scope.staff_skill
        })
        .then(function(res) {
            $(function () {
                $('#staff').hide()
                $('#myModal').hide()
            })
            $route.reload()
        })
    }

    $scope.del_staff = (key) => {
        $http.delete('/staff/'+key).then(() => {
            $route.reload()
        })
    }

    $scope.navigate = (key) => {
        $location.path(key)
    }
}])

app.controller('projectCtrl', ['$scope', '$http', '$rootScope', '$routeParams', '$route', function($scope, $http, $rootScope, $routeParams, $route) {
    
    $(function () {
        $("#datepicker").datepicker({ 
            autoclose: true, 
            todayHighlight: true
        }).datepicker('update', new Date())
    })

    function getSum(total, ac) {
        return total + ac.price
    }

    $http.get('/activities/'+ $routeParams.id )
    .then(function(res) {
        $scope.budget = res.data.budget
        $scope.name = res.data.name
        $scope.sum_price = 0
        
        if(res.data.activities) {
            const data = Object.keys(res.data.activities).map((key) => {
                return {
                    ...res.data.activities[key],
                    key: key
                }
            })
    
            $scope.sum_price = data.reduce(getSum, 0)
            $scope.activities = data
        }
        
    })

    $scope.add_activity = () => {
        $http.post('/activities/'+ $routeParams.id, {
            name: $scope.new_name,
            price: parseInt($scope.new_price),
            date: $scope.new_date,
            condition: $scope.new_condition || '-'
        })
        .then(function(res) {
            $route.reload()
        })
    }

    $scope.validation = () => {
        return $scope.new_name && $scope.new_price && $scope.new_date
    }

    $scope.del_activity = (key) => {
        $http.delete('/activities/'+ $routeParams.id + '/' + key)
        .then(function(res) {
            $route.reload()
        })
    }
}])