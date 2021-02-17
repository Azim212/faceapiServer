var router = require("express-promise-router")();
var faceapi = require("face-api.js")
var canvas = require("canvas")
var fetch = require("node-fetch");
var path = require("path")
require('@tensorflow/tfjs-node');
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
  };

  async function matchFaces(input) {
    let savedFaceDescriptorsRaw = require('../public/faceDescriptorsMultiple.json');
    let savedFaceDescriptors;
    let tempArr = [];
    let arrFaceDesc = [];

    for (var i = 0; i < savedFaceDescriptorsRaw.length; i++) {
      for (let [key, value] of Object.entries(savedFaceDescriptorsRaw[i])) {
        tempArr.push(value)
        // tempArr.reverse()
      }
      savedFaceDescriptors = Float32Array.from(tempArr)
      tempArr = []
      arrFaceDesc.push(savedFaceDescriptors)
    }

    // console.log(arrFaceDesc)
    let string = 'azim'
    let labelledDescriptor = [
      new faceapi.LabeledFaceDescriptors(string, arrFaceDesc)
    ]

    const maxDescriptorDistance = 0.6
    const faceMatcher = new faceapi.FaceMatcher(labelledDescriptor, maxDescriptorDistance)

    var bestMatch = faceMatcher.findBestMatch(input)
    return bestMatch
  }

  loadModels().then(nothing => {
    var image = "data:image/png;base64, " + req.body.face
    var imgEl = document.getElementById("faceImg")
    imgEl.src = image

    // This api route is supposed to return whether the taken picture's face matches with someone's
    // acc in the db. Return the person's name/id if yes or no.
    // However implementation is not complete as the process of getting people's faces from the db is
    // not done yet. 

    getFaceDescription(imgEl).then(faceDescript => {
      // var jsonData = {
      //   "faceDescriptors": faceDescript
      // }
      if (faceDescript[0] != "N") {
        // if the return is an array of face descriptors...
        matchFaces(faceDescript).then((thing) => {
          console.log(thing.toString())
          res.json(thing)
        }).catch((err) => {
          console.log(err)
          res.json("Error occured while matching faces.")
        })

      } else {
        res.json("No faces were detected in the image.")
      }
      // res.json(jsonData)
    }).catch(err => console.log(err))

  });

})

module.exports = router;
