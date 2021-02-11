var router = require("express-promise-router")();
var faceapi = require("face-api.js")
var canvas = require("canvas")
var fetch = require("node-fetch");
var path = require("path")
const jsdom = require("jsdom")
const { JSDOM } = jsdom;

global.window = new JSDOM(`<!DOCTYPE html><img id="faceImg"/>`,
  {
    pretendToBeVisual: true,
    resources: "usable",
    url: "file:///" + __dirname + "/"
  })
  .window;
global.document = window.document;
global.HTMLImageElement = window.HTMLImageElement

faceapi.env.monkeyPatch({
  fetch: fetch,
  Canvas: window.HTMLCanvasElement,
  Image: window.HTMLImageElement,
  ImageData: canvas.ImageData,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img')
})

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
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    // Load the face recognition models
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
  };

  async function getFaceDescription(input) {
    const fullFaceDescription = await faceapi.detectSingleFace(input)
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!fullFaceDescription) {
      return "No faces found in this image."
    }

    const faceDescriptors = fullFaceDescription.descriptor
    return faceDescriptors
  }

  loadModels().then(nothing => {
    var image = "data:image/png;base64, " + req.body.face
    var imgEl = document.getElementById("faceImg")
    imgEl.src = image

    getFaceDescription(imgEl).then(faceDescript => {
      var jsonData = {
        "faceDescriptors": faceDescript
      }
      res.json(jsonData)
    }).catch(err => console.log(err))

  });

})

module.exports = router;
