const express = require('express')
const app = express.Router()

// :: setup
const passport = require('passport')
const cookieOptions = { maxAge : ( 24 * 60 * 60 * 1000 ) } // 1 day

// :: passport setup
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user, done) => done(null, user.id))

// :: Google Auth
const GoogleStrategy = require('passport-google-oauth2').Strategy

function saveUserAndRedirect(req, res) {
  res.cookie('account', req.user.id, cookieOptions)
  res.cookie('name', req.user.displayName, cookieOptions)
  res.cookie('email', req.user.email, cookieOptions)
  console.log('User just logged in:\nEmail: ', req.user.email, '\ndisplayName: ', req.user.displayName)
  res.redirect('/')
}

passport.use(new GoogleStrategy({
  clientID: "752759453106-jal99mv0iqvnh7b1c94ub6adqtdh5qcs.apps.googleusercontent.com",
  clientSecret: "AGafH7M2Fq6bw531zVZ4GrK6",
  callbackURL: "/google/clb"
}, (accessToken, refreshToken, profile, done) => {
  if (profile._json.domain === 'columbia.edu'){
    return done(null, profile)
  }
  done('forbidden: bad email', null)
}))

// :: routes
app.get('/login', passport.authenticate('google', {
  scope: ['profile', 'email']
}))
app.get('/google/clb', passport.authenticate('google', {failureRedirect: '/sorry'}), saveUserAndRedirect)

app.get('/sorry', (res, req) =>{
  res.redirect('Invalid Login')
})

module.exports = app
