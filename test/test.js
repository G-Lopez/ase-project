const assert = require('assert');
const chai = require('chai');
let ng_mock = require('ng-mock');
const sinon = require('sinon');
const should = chai.should();
const expect = chai.expect
const https = require('https');
const requestify = require('requestify');

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});

describe('Server Functions', function () {
  it('gets user information', function testSlash(done) {

    requestify.get('http://aseproject-testing.us-east-2.elasticbeanstalk.com/getUserInfo', {
        cookies: {
            'account': 'Testing Account',
            'email': 'gal2129@columbia.edu',
            'name': 'Gabriel Lopez'
        }
    })
      .then(function(response) {
          // Get the response body (JSON parsed or jQuery object for XMLs)
          console.log(JSON.parse(response.body));
          expect(JSON.parse(response.body)).to.have.property('email')
          done()
      });
  });

  it('gets book information with ISBN', function () {
    requestify.post('http://aseproject-testing.us-east-2.elasticbeanstalk.com/bookLookup', {
        cookies: {
            'account': 'Testing Account',
            'email': 'gal2129@columbia.edu',
            'name': 'Gabriel Lopez'
        },
        isbn: 1781100489
    })
      .then(function(response) {
          // Get the response body (JSON parsed or jQuery object for XMLs)
          expect(response.body).to.have.property('volumeInfo')
          done()
      });
  })

  it('gets user requests', function () {
    requestify.get('http://aseproject-testing.us-east-2.elasticbeanstalk.com/userRequests', {
        cookies: {
            'account': 'Testing Account',
            'email': 'gal2129@columbia.edu',
            'name': 'Gabriel Lopez'
        }
    })
      .then(function(response) {
          // Get the response body (JSON parsed or jQuery object for XMLs)
          body = JSON.parse(response.body)
          expect(body.to).to.have.lengthOf.above(0)
          expect(body.from).to.have.lengthOf.above(0)
          done()
      });
  })

  it('Get a user\'s books', function () {
    requestify.get('http://aseproject-testing.us-east-2.elasticbeanstalk.com/userBooks', {
        cookies: {
            'account': 'Testing Account',
            'email': 'gal2129@columbia.edu',
            'name': 'Gabriel Lopez'
        }
    })
      .then(function(response) {
          // Get the response body (JSON parsed or jQuery object for XMLs)
          body = JSON.parse(response.body)
          console.log(body)
          expect(body).to.have.lengthOf.above(0)
          expect(body[0].isbn).to.be.a('number')
          done()
      });
  })




})
