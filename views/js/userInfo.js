//Service to update and refesh user info when needed

angular.module('myApp').factory('userInfo', () =>{

  let refreshUser = function(clb) {
    'Is this getting called?'
    $.get('/getUserInfo', (user) =>{
      clb(user)
    })
  }

  let updateUser = function(fields, clb) {
    console.log(fields);
    $.post('/updateUserInfo', {fields: JSON.stringify(fields)}, (user) =>{
      console.log('USER UPDATED USER UPDATED', user)
      clb(user)
    })
  }

  return{
    refreshUser: refreshUser,
    updateUser: updateUser
  }
})
