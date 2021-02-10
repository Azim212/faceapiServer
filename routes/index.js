var router = require("express-promise-router")();
var faceapi = require("face-api.js")
var fetch = require("node-fetch");
var path = require("path")

faceapi.env.monkeyPatch({ fetch: fetch })

/* GET home page. */
router.get('/', function (req, res, next) {
  var jsonData = {
    "name": "Azim",
    "adminNo": "183574a"
  }
  res.json(jsonData)
});

router.post('/face', function (req, res, next) {
  const MODEL_URL = path.join(__dirname, '/../public/models/face-api')

  async function loadModels() {
    // loading faceapi models
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    // Load the face landmark models
    await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(MODEL_URL);
    // Load the face recognition models
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
  };

  loadModels().then(nothing => {
    var image = 'data:image/jpeg;base64,' + req.body.face
    var jsonData = {
      "name": "Azim",
      "adminNo": "183574a",
      "face": image
    }
    res.json(jsonData)
  });


})

module.exports = router;
