var express = require('express'),
  mysql = require('mysql'),
  formidable = require('formidable'),
  fs = require('fs');

var app = express();
var connection = mysql.createConnection({
  host: 'localhost',
  query: {
    pool: true
  },
  user: 'root',
  password: '1234',
  database: 'OSAM'
});

var savePath = 'C://work//express_test//upload//'

var isFormData = function(req) {
  var type = req.headers['content-type'] || '';
  return 0 == type.indexOf('multipart/form-data');
}

app.post('/login', function(req, res) {
  var form = new formidable.IncomingForm();
  var body = {};

  if (!isFormData(req)) {
    res.status(400).end('Bad Request: expecting multipart/form-data');
    return;
  }
  form.on('field', function(name, value) {
    body[name] = value;
  });

  form.on('end', function(fields, file) {
    var sql = "select distinct Id,Password from seoungjin_user where Id = ? and Password  = ?";
    var args = [body.Id, body.Password];
    connection.query(sql, args, function(err, results, fields) {
      if (err || JSON.stringify(results[0]) == null) {
        res.sendStatus(500);
        console.log('error');
        return;
      }
      console.log("login success");
      console.log("id :" + JSON.stringify(results[0].Id));
      console.log("pw :" + JSON.stringify(results[0].Password));
      res.sendStatus(200);
    });
  });
  form.parse(req);
});

app.post('/signup', function(req, res) {
  var form = new formidable.IncomingForm();
  var body = {};

  if (!isFormData(req)) {
    res.status(400).end('Bad Request: expecting multipart/form-data');
    return;
  }
  form.on('field', function(name, value) {
    body[name] = value;
  });

  form.on('fileBegin', function(name, file) {
    file.path = savePath + body.ImgName;
  });

  form.on('end', function(fields, files) {
    var args = [body.Id, body.Password, body.Name,
      body.Rank, body.Position, body.Unit,
      body.Content, body.PhoneNumber, body.Status,
      body.ImgName
    ];
    var sql = 'Insert into seoungjin_user' +
      '(Id, Password, Name, Rank, Position, Unit, Content, PhoneNumber, Status, ImgName)' +
      'values(?,?,?,?,?,?,?,?,?,?)';

    connection.query(sql, args, function(err, results, fields) {
      if (err) {
        res.sendStatus(500);
        console.log('error');
        return;
      }
      res.sendStatus(200);
    });
  });
  form.parse(req);
});

app.get('/image/:filename', function(req, res) {

  var path = savePath + req.params.filename;
  fs.exists(path, function(exists) {
    if (exists) {
      var stream = fs.createReadStream(savePath + req.params.filename);
      stream.pipe(res);
      stream.on('close', function() {
        res.end();
      });
    } else {
      res.sendStatus(204);
    }
  });
});

app.listen(5013);
