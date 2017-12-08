//Service to set and get the results of a search, either from the basic title
//search on the navbar or the advanced search.

angular.module('myApp').factory('searchResult', () =>{
  let results = null

  return{
    setResults: function (sr) {results = sr},
    getResults: function () {return results}
  }
})
