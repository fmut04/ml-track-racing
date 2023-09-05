

function nextGeneration() {
  console.log("next generation");
  generationCount++
  calculateFitness();
  evaluateCars();
  createNewCars();
}

//Finds the best cars of the generation and the whole training period
function evaluateCars()
{
	var maxScore = 0;
	for (var k = 0; k < savedCars.length; k++) {
		if (savedCars[k].score > maxScore) {
			maxScore = savedCars[k].score;
			bestGenCar = savedCars[k];
		}
	}

	if (bestCar == undefined) {
    bestCar = bestGenCar;
    return;
  }
	if (bestCar.score < bestGenCar.score) {
			bestCar = bestGenCar;
			worseCount = 0;
	}
	else {
			worseCount++;
	}
}

//Creates new cars for the next generation
//If the cars have gotten worse three generations in a row, all of the next generation is set to the best car since training started
//Removes the cars that have been saved
function createNewCars()
{
  updateResetPoint();

  let useBestCar = worseCount > 3
		for (var i = 0; i < MAX_CARS; i++) {
			cars[i] = pickOne(useBestCar);
		}
// Need two for loops because the pickOne function uses the brain from the savedCars so the savedCar brains have to be disposed
// after the cars are all created 
	for (var i = 0; i < MAX_CARS; i++) {
    if(savedCars[i].brain!=bestCar.brain)
    {
      savedCars[i].brain.dispose();
    }
	}
	savedCars = [];
}


//Creates new cars with a higher likelyhood of cars with a better fitness being picked
function pickOne(useBestCar) {
  let child;
  if (useBestCar) {
    child = new Car(bestCar.brain);
    worseCount = 0 
  }
  else {
    carBrain = selectCarFromPool();
    child = new Car(carBrain);
  }

  child.mutate();
  return child;
}

function selectCarFromPool()
{
  var index = 0;
  var r = random(1);
  while (r > 0) {
    r = r - savedCars[index].fitness;
    index++;
  }
  index--;
  return savedCars[index].brain;
}

//Calculates the fitness of each car and normalizes it between 0-1
function calculateFitness() {
  let sum = 0;
  for (var car of savedCars) {
    sum += car.score;
  }
  for (var car of savedCars) {
    car.fitness = car.score / sum;
  }
}
