let myApp = angular.module('myApp', [])


myApp.controller('navBarController', ['$scope', '$rootScope', 'searchResult', ($scope, $rootScope, searchResult) => {
  $scope.search = function(keywords) {
    console.log(keywords);
    $.post('/search/books', {title:keywords}, function(matches) {
      console.log('Search Results', matches)
      searchResult.setResults(matches)
      $rootScope.$broadcast('switchingViews', 'searchPage')
      $scope.$apply()
    })
  }
  $scope.advancedSearchNavBar = function() {
    $rootScope.$broadcast('switchingViews', 'advancedSearchPage')
    console.log('this shouldnt change anything');
  }

  $scope.goHome = function() {
    $('#navBarSearchBar').val('')
    $rootScope.$broadcast('switchingViews', 'homePage')
  }

  $scope.logout = function () {
    $.get('/logout', (url) =>{
      window.location = 'url'
    })
  }
}])

myApp.controller('addBookController', ['$scope', '$rootScope', 'userInfo',  ($scope, $rootScope, userInfo) => {

  $scope.findBookWithISBN = function(isbn) {
    $scope.searchedBook = null
    console.log(isbn);
    $.post('/bookLookup', {isbn: isbn}, function(book) {
        console.log(book)
        if(typeof(book) == 'object'){
          $scope.searchedBook = book
          $scope.$apply()
        }
    })
  }
  //function to get the url of the image for the HTML display.
  $scope.getBookImage = function() {
    if($scope.searchedBook){
      return $scope.searchedBook.volumeInfo.imageLinks.smallThumbnail ? $scope.searchedBook.volumeInfo.imageLinks.smallThumbnail: 'img_not_available.png'
    }else{
      return ''
    }
  }

  $scope.addBooktoDB = function() {
    if($rootScope.user.books_added >= 5){
      alert('You cannot add anymore books. Please wait until somebody borrows one of your books or remove one.')
    } else{
      console.log($scope.searchedBook);
      $.post('/addBook', {book: JSON.stringify($scope.searchedBook)}, function(response) {
        console.log(response);
        if(response === 'success'){
          $('#addBookModal').modal('hide')
          userInfo.updateUser({books_added: 1}, function(user) {
            $rootScope.user = user
            alert('Saved Successfully')
            $rootScope.$broadcast('switchingViews', 'homePage')
            $scope.$apply()
          })
        } else if(response == 'Already Exists'){
          alert('You have already added this book. Please try again with a different book.')
        } else alert('Something went wrong, please try again.')
      })
    }
  }
}])

myApp.controller('homePageController', ['$scope', '$rootScope', 'userInfo', ($scope, $rootScope, userInfo) => {
  //Initialize Data: Call switching views to home and getting initial user information.
  userInfo.refreshUser(function (user) {
    $rootScope.user = user
    console.log(user);
    $rootScope.$broadcast('switchingViews', 'homePage')
    $scope.$apply()
  })

  $rootScope.$on('switchingViews', function(msg, view) {
    if(view === 'homePage'){
      $scope.home = true
      $.get('/userBooks', (books) =>{
        $scope.ownedBooks = books
        $scope.$apply()
      })
      $.get('/userRequests', (requests) =>{
        $scope.requestsMadeByUser = requests.from
        $scope.requestsToUser = requests.to
        $scope.$apply()
      })
      $.get('/borrowedBooks', (borrBooks) =>{
        $scope.borrowedBooks = borrBooks
        $scope.$apply()
      })
    } else $scope.home = false
  })

  $scope.updateRequest = function(request, update){
    if(update == 'Approved' || update =='Denied'){
      $.post('/updateRequest', {from: request.from, isbn: request.isbn, new_status:update}, function (response) {
        if(response == 'success'){
          $rootScope.$broadcast('switchingViews', 'homePage')
          $scope.$apply()
        }
        else{
          alert('There was an error updating your request, please try again')
        }
      })
    }
  }

  $scope.deleteRequest = function (request) {
    $.post('/deleteRequest', {to: request.to, isbn: request.isbn}, function (response) {
      if(response == 'deleted'){
        $rootScope.$broadcast('switchingViews', 'homePage')
        $scope.$apply()
      }else alert('There was an error deleting your request, please try again')
    })
  }
}])

myApp.controller('searchResultPageController', ['$scope', '$rootScope', 'searchResult', 'userInfo', ($scope, $rootScope, searchResult, userInfo) => {

  $rootScope.$on('switchingViews', function(msg, view) {
    if(view === 'searchPage'){
      $scope.searchPage = true
      $scope.results = searchResult.getResults()
    } else $scope.searchPage = false
  })

  $scope.requestBook = function(owner_email, isbn) {
    if(owner_email === $rootScope.user.email){
      alert('Cannot request a book you own')
    }else if($rootScope.user.books_requested >= 5){
      alert('You have reached your request limit, please resolve some requests before making another')
    }else{
      $.post('/makeRequest', {owner_email: owner_email, isbn: isbn}, function(requestResponse) {
        console.log('request Response', requestResponse);
        if(requestResponse === 'success'){
          userInfo.updateUser({books_requested: 1}, function(user) {
            $rootScope.user = user
            alert('Successfully Requested')
            $rootScope.$broadcast('switchingViews', 'homePage')
            $scope.$apply()
          })
        }
      })
    }
  }
}])

myApp.controller('advancedSearchController', ['$scope', '$rootScope', 'searchResult', ($scope, $rootScope, searchResult) => {
  $rootScope.$on('switchingViews', function(msg, view) {
    if(view === 'advancedSearchPage'){
      $scope.advancedSearchPage = true
    }else $scope.advancedSearchPage = false
  })

  $scope.formInputs = {}

  $scope.advancedSearch = function() {
    console.log($scope.formInputs);

    $.post('/advancedSearch', {mongo: JSON.stringify($scope.formInputs)}, function(response) {
      console.log('REEEEE', response);
      searchResult.setResults(response)
      $rootScope.$broadcast('switchingViews', 'searchPage')
      $scope.$apply()
    })
  }

}])
