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
  console.log("Content-Type: " + type + "req:" + req);
  return 0 == type.indexOf('multipart/form-data');
}

app.get('/login', function(req, res) {

  var args = [req.query.Id, req.query.Password];
  var sql = 'SELECT UserNumber,Id,Name,Rank,Position,Content,PhoneNumber,Status,ImgName from seoungjin_user where Id = ? and Password = ?';

  connection.query(sql, args, function(err, results, fields) {
    if (err) {
      res.sendStatus(400);
      return;
    }
    if (results.length == 0) {
      res.sendStatus(204);
    } else {
      res.status(201).send(results);
      res.end();
    }
  });
});

app.post('/signup', function(req, res) {
  var form = new formidable.IncomingForm();
  var body = {};

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
        console.log(err);
        return;
      }
      res.sendStatus(201);
    });
  });
  form.parse(req);
});

app.post('/update', function(req, res) {
  var form = new formidable.IncomingForm();
  var sql = 'Update seoungjin_user set ' +
    'Name = ?, Rank = ?, Position = ?, Unit = ?, Content = ?, PhoneNumber = ?, Status = ?' +
    'Where Id = ?';
  var body = {};

  form.on('field', function(name, value) {
    body[name] = value;
  });

  form.on('end', function(fields, files) {
    var args = [body.Name,
      body.Rank, body.Position, body.Unit,
      body.Content, body.PhoneNumber, body.Status, body.Id
    ];
    connection.query(sql, args, function(err, results, fields) {
      if (err) {
        res.sendStatus(500);
        console.log(err);
        return;
      }
      res.sendStatus(200);
    });
  });
  form.parse(req);
});

app.post('/starManage', function(req, res) {
  var form = new formidable.IncomingForm();
  var sql = 'Select * From seoungjin_user_star Where Id = ? and StarId = ?';
  var body = {};

  form.on('field', function(name, value) {
    body[name] = value;
  });

  form.on('end', function(fields, files) {
    var args = [body.Id, body.StarId];
    connection.query(sql, args, function(err, results, fields) {
      if (err) {
        console.log("select문 오류");
        res.sendStatus(400);
        return
      }
      if (results.length == 0) {
        sql = 'Insert into seoungjin_user_star' +
          '(Id, StarId)' +
          'values(?,?)';
        connection.query(sql, args, function(err, results, fields) {
          if (err) {
            console.log("insert문 오류");
            res.sendStatus(400);
            return;
          }
          res.sendStatus(201);
        });
      } else {
        sql = 'Delete from seoungjin_user_star Where Id = ? and StarId = ?';
        connection.query(sql, args, function(err, results, fields) {
          if (err) {
            console.log("delete문 오류");
            res.sendStatus(400);
            return;
          }
          res.sendStatus(410);
        });
      }
    });
  });
  form.parse(req);
});

app.get('/loadStarData', function(req, res) {
  var sql = 'SELECT StarId from seoungjin_user_star where Id = ?';
  connection.query(sql, req.query.Id, function(err, rows, fields) {
    if (err) {
      res.sendStatus(400);
      return;
    }
    if (rows.length == 0) {
      res.sendStatus(204);
    } else {
      var check = false;
      for (var i = 0; i < rows.length; i++) {
        sql = 'SELECT UserNumber,Id,Name,Rank,Position,Unit,Content,PhoneNumber,Status,ImgName from seoungjin_user where Id = ?';
        connection.query(sql, rows[i].StarId, function(err, results, fields) {
          if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
          }
          if (results.length != 0) {
            check = true;
            res.status(201).send(results);
          } else res.sendStatus(204);
        });
      }
    }
  });
});

app.get('/loadSearchData', function(req, res) {
  var sql;
  var args = [req.query.Unit, req.query.Name, req.query.Id];
  if (args[1].length == 0) {
    if (args[0] == "전체") {
      var args = [req.query.Id];
      sql = 'SELECT UserNumber,Id,Name,Rank,Position,Unit,Content,PhoneNumber,Status,ImgName from seoungjin_user Where Id <> ?';
      connection.query(sql, args, function(err, results, fields) {
        if (err) {
          console.log(err);
          res.sendStatus(400);
          return;
        }
        if (results.length == 0) {
          res.sendStatus(204);
        } else {
          res.status(201).send(results);
          res.end();
        }
      });
    } else {
      var args = [req.query.Unit, req.query.Id];
      sql = 'SELECT UserNumber,Id,Name,Rank,Position,Unit,Content,PhoneNumber,Status,ImgName from seoungjin_user Where Unit = ? And Id <> ?';
      connection.query(sql, args, function(err, results, fields) {
        if (err) {
          res.sendStatus(400);
          return;
        }
        if (results.length == 0) {
          res.sendStatus(204);
        } else {
          res.status(201).send(results);
          res.end();
        }
      });
    }
  } else {
    if (args[0] == "전체") {
      var args = [req.query.Name, req.query.Id];
      sql = 'SELECT UserNumber,Id,Name,Rank,Position,Unit,Content,PhoneNumber,Status,ImgName from seoungjin_user Where Name = ? And Id <> ?';
      connection.query(sql, args, function(err, results, fields) {
        if (err) {
          res.sendStatus(400);
          return;
        }
        if (results.length == 0) {
          res.sendStatus(204);
        } else {
          res.status(201).send(results);
          res.end();
        }
      });
    } else {
      var args = [req.query.Unit, req.query.Name, req.query.Id];
      sql = 'SELECT UserNumber,Id,Name,Rank,Position,Unit,Content,PhoneNumber,Status,ImgName from seoungjin_user Where Unit = ? And Name = ? And Id <> ?';
      connection.query(sql, args, function(err, results, fields) {
        if (err) {
          res.sendStatus(400);
          return;
        }
        if (results.length == 0) {
          res.sendStatus(204);
        } else {
          res.status(201).send(results);
          res.end();
        }
      });
    }
  }
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
