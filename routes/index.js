var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  var jsonData = {
    "name": "Azim",
    "adminNo": "183574a"
  }
  res.json(jsonData)
});

router.post('/face', function (req, res, next) {
  var jsonData = {
    "name": "Azim",
    "adminNo": "183574a",
    "face": req.body.face
  }
  // console.log(req.body.face)
  res.json(jsonData)
})

module.exports = router;
