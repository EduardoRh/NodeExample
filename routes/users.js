var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const util = require('util');
var sha1 = require('sha1');
var properties = require('properties-reader')('properties.properties');

//Controladores
var user_controller = require('../controllers/usersController');

function getConnection()
{
  var connection = mysql.createPool({
    host: properties.get('mysql.host'),
    user: properties.get('mysql.user'),
    password: properties.get('mysql.password'),
    database: properties.get('mysql.db'),
    port: properties.get('mysql.port'),
    timeout: Number(properties.get('mysql.timeout'))
  });
  return connection;
}
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/Auth', function(req, res, next) {
  console.log("Users/Auth");
  var responseBody = {code: null, message: null, content: null};
  var data = req.body;
  if(data != null && data.usermail != null && data.userpass != null){
    var connection = getConnection();
    connection.query("CALL proc_getUserbyEmail(?);", data.usermail, function (error, result) {
      if(error) throw error;
      else {
        var resultado;
        resultado = result;
        if(resultado.length > 0) {
          if(resultado[0][0].existe == 1) {
            connection.query("CALL proc_userAuth(?,?);", [data.usermail, sha1(data.userpass)], function (error, result) {
              if(error) throw error;
              else {
                var resultado = result;
                if(resultado.length > 0 && resultado[0].length > 0) {
                  var fields = resultado[0][0];
                  responseBody.code = 0;
                  responseBody.message = "login Successful";
                  responseBody.content = fields;
                  res.json(responseBody);
                }
                else {
                  responseBody.code = -4;
                  responseBody.message = "wrong Credentials";
                  res.json(responseBody);
                }
              }
            })
          }
          else {
            responseBody.code = -2;
            responseBody.message = "wrong email";
            res.json(responseBody);
          }
        }
        else {
          responseBody.code = -3;
          responseBody.message = "wrong credentials";
          res.json(responseBody);
        }
      }
    });

  }
  else {
    responseBody.code = -1;
    responseBody.message = "wrong credentials";
    res.json(responseBody);
  }
});

module.exports = router;
