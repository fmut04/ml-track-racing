let path = [];
let sensors = [];
let cars = [];
let savedCars = [];
// Scale X,Y is a value used to make the size of the track, cars, etc , adapt to the size of the window
let scaleX=1
let scaleY=1
let loadedCar;
let time=0;
let intersectP;
let bestCar;
let cycles = 1;
let carsTraining;
let bestGenCar;
let scalingFactorX = 1
let scalingFactorY = 1
let shouldTrain=true;
let shouldLoadBest=false;
let worseCount = 0;
//Total amount of cars that will trained at a time
const MAX_CARS = 50;
let lastX;
let xOff = 0;
let noiseWalls=false;
let generationCount=1
let wallOffsetY = 0;
let wallMovementDir = p5.Vector.random2D().mult(.2);
let resetPoint = {
  x:0,
  y:0
};

//Iterates once when program originaly runs
function setup() {
  tf.setBackend("cpu");
  setupCanvas()
  createCycleSlider()
  setMode()
  updateResetPoint();
  makeModeChangers();
  makeButtons();
}

function setupCanvas() {
  canvas = createCanvas(windowWidth-200, windowHeight);
  return canvas
}

  
window.addEventListener('resize', function() 
{
resizeCanvas(window.innerWidth - 200, window.innerHeight)
})

function createCycleSlider() {
  cycles = createSlider(1, 20, 1);
  cycles.parent('slider-container');
  cycles.addClass('slider')
 // cycles.position(undefined, windowHeight - 350);
 
}

//Game loop
function draw() {
  background(30);
    for(var i=0; i<cycles.value(); i++)
    {
      if(shouldTrain) {
      trainCars();
      }
      if(shouldLoadBest) {
        //Loads the best car so far
        loadBest();
      }
      if (!noiseWalls) {
       updateBouncyWalls();
      }
    }
    //DRAWS EVERYTHING TO THE SCREEN
    drawToScreen();
  }

  function drawToScreen()
  {
    let updatedScale = getNewScaleFactor()
      if (noiseWalls) {
        if (!shouldLoadBest) cars[0].show();
        showNoiseWalls();
      }
      else {
        if(!shouldLoadBest) {
          for (c in cars) {
            cars[c].show();
        }
       }
      
      for (p in path) {
        if(updatedScale.x!=1 || updatedScale.y!=1) {
          path[p].updatePoints(updatedScale.x,updatedScale.y)
        }
        path[p].show();
      }
  }
  //stroke(255)
  strokeWeight(0)
  textSize(24)
  fill('white')
    text(`Generation: ${generationCount}`,width*.025,50)
    text(`Steps: ${time}`,width*.025,100)
}

function getNewScaleFactor() {
  let updatedScaleX = (canvas.width/10 / scaleX)
  let updatedScaleY = (canvas.height/10 / scaleY)
  scaleX = canvas.width/10
  scaleY = canvas.height/10
  return {x: updatedScaleX, y: updatedScaleY}
} 

//Sets the reset point for the cars when the next generation starts
function updateResetPoint()
{
  if(noiseWalls)
  {
    resetPoint.x = ((path[0].x1+path[0].x2)/2);
    resetPoint.y = windowHeight-100;
  }
  else {
    resetPoint.x = path[0].x1+50;
    resetPoint.y = (path[0].y1+path[0].y2)/2;
  }
  getNewScaleFactor()
}

//Loads the best car so far
function loadBest()
{
  checkLoadedDeath();
  loadedCar.think();
  loadedCar.show()
}

//If the loaded car dies, it is reset to a new position
//No more training happens to the loaded car
function checkLoadedDeath()
{
  if(!loadedCar.isDead()) { return }  

    loadedCar.vel.set(0,0);
    loadedCar.acc.set(0,0);
    loadedCar.score=0
    if(!noiseWalls) {
    updateResetPoint();
    loadedCar.rotation=0;
  }
  else {
    wallOffsetY=0;
    loadedCar.rotation=-90;
  }
    loadedCar.pos.set(resetPoint.x,resetPoint.y+random(30));
}


function trainCars() {

  checkTrainingDeaths();

  //If generation has been going on for a long time
  //then remove all the cars from training which will start a new generation
if(time>7500) {
  for (let i = 0; i < carsTraining; i++) {
    handleTrainingDeath(i)
  }
}

  if (cars.length == 0) {
    time=0;
    wallOffsetY = 0;
    if(!noiseWalls) carsTraining = MAX_CARS
    nextGeneration();
  }

  time++;

  for(var i = 0; i<carsTraining; i++) {
    cars[i].think()
  }
}

//If noise walls is true then only the first car in the cars array is being shown and updated
function checkTrainingDeaths() {
  for (var i = carsTraining-1; i >=0; i--) {
    if (cars[i].isDead()) {
     handleTrainingDeath(i)
    }
  }
}

function handleTrainingDeath(i) {
  //console.log("death")
  savedCars.push(cars.splice(i, 1)[0]);
  if(noiseWalls) {
    wallOffsetY=0;
    time=0;
  }
  else {
    carsTraining--
  }
}


//Creates the buttons to reset and load the best car
function makeButtons()
{
 let heightPercent = windowHeight/100;

  var loadButton = createButton("Load Best Model");
  loadButton.position(undefined,30*heightPercent);
  loadButton.addClass('model-button');
  loadButton.mouseClicked((btn) => {
    if(!shouldLoadBest) {
      btn.srcElement.innerHTML = "Continue Training"
      loadPressed()
    }
    else {
      btn.srcElement.innerHTML = "Load Best Model"
      continueTraining()
    }
  });

  var resetButton = createButton("Reset Training");
  resetButton.position(undefined,40*heightPercent);
  resetButton.addClass('model-button');
  resetButton.mouseClicked(function() {
  resetPressed(false);
  });
}

//Creates the back and forward mode buttons
function makeModeChangers()
{
var forwardButton = select('#forwardButton');
forwardButton.mouseClicked(() =>  {
changeMode(true, backwardButton, forwardButton);
});

var backwardButton = select('#backwardButton');
backwardButton.mouseClicked(() => {
changeMode(false, forwardButton, backwardButton);
});
}

//Changes mode based on value of arguments
//Makes arrows turn grey and white when one is clicked
function changeMode(moveModeForward,whiteButton,greyButton)
{
  noiseWalls=moveModeForward;
  whiteButton.style('color', 'white')
  greyButton.style('color', 'rgb(50, 50, 50)')
  setMode();
}

function setMode()
{
  path = [];
  wallOffsetY=0;
  setCarsTraining()
  if(noiseWalls)
  {
   createNoisePath()
  }
  else {
    createTrack();
  }
resetPressed(false);
}

function setCarsTraining() {
  carsTraining = noiseWalls ? 1 : MAX_CARS
}

function createNoisePath() {
  let widthBound = canvas.width-150;
  let heightBound = windowHeight-50
  lastX = noise(xOff)*widthBound;
  path.push(new Wall(noise(xOff)*widthBound,heightBound,(noise(xOff)*widthBound)+150,heightBound))
  lastX = addNoisePath(lastX)
 for (var i = 0; i < 5; i++) {
   lastX = addNoisePath(lastX);
 }
}
