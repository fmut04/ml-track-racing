

class NeuralNetwork {
  constructor(a, b, c, d) {
    //Sets up the model
    if (a instanceof tf.Sequential) {
      this.model = a;
      this.input_nodes = b;
      this.hidden_nodes = c;
      this.output_nodes = d;
    } else {
      this.input_nodes = a;
      this.hidden_nodes = b;
      this.output_nodes = c;
      this.model = this.createModel();
    }
  }

  //Copies the model so that other cars can use it
  copy() {
    return tf.tidy(() => {
      const modelCopy = this.createModel();
      const weights = this.model.getWeights();
      const weightCopies = [];
      for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone();
      }
      modelCopy.setWeights(weightCopies);
      return new NeuralNetwork(
        modelCopy,
        this.input_nodes,
        this.hidden_nodes,
        this.output_nodes
      );
    });
  }

  //Has a chance to change some of the weights based on the rate given
  mutate(rate) {
    tf.tidy(() => {
      const weights = this.model.getWeights();
      const mutatedWeights = [];
      for (let i = 0; i < weights.length; i++) {
        let tensor = weights[i];
        let shape = weights[i].shape;
        let values = tensor.dataSync().slice();
        for (let j = 0; j < values.length; j++) {
          if (random(1) < rate) {
            let w = values[j];
            values[j] = w + randomGaussian(0, .5);
          }
        }
        let newTensor = tf.tensor(values, shape);
        mutatedWeights[i] = newTensor;
      }
      this.model.setWeights(mutatedWeights);
    });
  }

  dispose() {
    this.model.dispose();
  }

  //Gives an output based on the inputs and weights
  predict(inputs) {

    return tf.tidy(() => {
      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs);
      const outputs = ys.dataSync();
      return outputs;
    });
  }

  //Creates a NN model
  createModel() {
    const model = tf.sequential();
    const hidden = tf.layers.dense({
      units: this.hidden_nodes,
      inputShape: [this.input_nodes],
      activation: 'sigmoid'
    });
    model.add(hidden);
    const output = tf.layers.dense({
      units: this.output_nodes,
      activation: 'softmax'
    });
    model.add(output);
    return model;
  }
}

function loadPressed()
{
  console.log("Load Best")
  updateResetPoint()
  loadedCar = new Car(bestCar.brain)
  shouldLoadBest=true
  shouldTrain = false
  time=0;
}

function continueTraining() {
  shouldLoadBest = false
  shouldTrain=true
  
  for (let i = carsTraining-1; i >= 0; i--) {
    console.log(cars.length)
    handleTrainingDeath(i)
  }
}

function resetPressed(loadBest)
{
  console.log("Reset")
  shouldLoadBest=loadBest;
  shouldTrain=!loadBest;
  generationCount=1
  time=0
  sensors = [];
  cars = [];
  for (var i = 0; i < savedCars.length; i++) {
    savedCars[i].brain.dispose();
  }
  savedCars = [];

   bestCar=undefined;
   bestGenCar=undefined;
   worseCount = 0;
   setCarsTraining()
   updateResetPoint();
   if(loadBest) {
     loadedCar.rotation=-90;
     loadedCar.pos.set(resetPoint.x,resetPoint.y+random(30))
   }
   else {
     for (var i = 0; i < MAX_CARS; i++) {
       cars.push(new Car());
     }
   }
}

