

class Car {
  constructor(brain) {
    //for movement
    this.vel = createVector();
    this.acc = createVector();
    this.pos = createVector(resetPoint.x,resetPoint.y+random(30));
    this.dir = createVector();
    this.rotatedLine = createVector();
    this.heading = 0;
    this.rotation = noiseWalls ? -90 : 0;
    this.sensors = [];
    this.length = .18 * scaleX + 20
    this.width = .15 * scaleY
    //intersect line
    this.sectL;
    this.velMultiplier = 0;
    this.color = color(random()*255,random()*255,random()*255,80)
    //creates sensors that checks wall detection and gives input to nn
    this.createSensors();
    angleMode(DEGREES);
    // Score and fitness evaluates how good a particular car has done
    this.score = 0;
    this.fitness = 0;
    // if brain is given, set brain to a copy of the given brain otherwise create a new brain
    this.brain = brain ? brain.copy() : new NeuralNetwork(3, 10, 3)
  }

   show()
  {
    stroke(255);
    strokeWeight(1)
    fill(this.color);
    rectMode(CENTER);
    push()
    translate(this.pos.x,this.pos.y);
    rotate(this.rotation+90);
    rect(0, 0, this.width, this.length);
    pop()
  }

  update(velLimit)
  {
    //each frame adds to score, the faster it is going the more points it gets
    this.score+=velLimit+2;
    /////gets vector pointing in direction object is facing//////
    this.dir = p5.Vector.fromAngle(radians(this.rotation));

    //////limits vectors and adds them together//////
    this.dir.limit(.8);
    this.acc.limit(2);
    this.vel.add(this.acc);
    this.acc.set(0,0);
    this.vel.limit(velLimit+2);

    //Checks if the car has hit any walls
    for (let i=0; i<this.sensors.length; i++)
    {
       this.sensors[i].checkIntersect(this) 
    }

    //moves the car
    if(noiseWalls) {
      this.pos.x+=this.vel.x;
      wallOffsetY+=abs(this.vel.y);
    }
    else {
      this.pos.add(this.vel);
      this.pos.x+=wallMovementDir.x/cycles.value();
      this.pos.y+=wallMovementDir.y/cycles.value();
    }
  }

  think() {
      //inputs to NN are the distances to the walls from the sensors
      let inputs = [];
      for (let i = 0; i < 3; i++) {
        inputs[i] = this.sensors[i].getDistTo(this.pos);
      }

      let output = this.brain.predict(inputs);

      if (output[0] > output[1] && output[0] > output[2]) {
       this.turn(2.5);
     }
     else if (output[1] > output[0] && output[1] > output[2]) {
       this.turn(-2.5);
     }
     else {
       this.move();
      }
     this.move()
     //The higher the output[2] is, the faster the car is allowed to go
     this.update(output[2]*10);
   }

   mutate()
   {
     this.brain.mutate(.1);
   }

    //Checks if a car has hit a wall or went the wrong way around the track
    isDead()
    {
      for(var i=0; i<this.sensors.length; i++)
      {
        //The first sensor is straight ahead so the distance to contact is half of its length since the car's origin is its center
        // The other ones are at a diagonal and the width of the car is a good aproximation for the contact distance

        let contactDist = i==0 ? this.length/2 : this.width
        if(this.sensors[i].getDistTo(this.pos)<contactDist) return true;
      }
      return false;
    }

  //Adds acc in the direction the car is facing
  move()
  {
      this.acc.add(this.dir);
  }

  //Turns with the strength passed in
  turn(r)
  {
    this.rotation+=r;
  }

  createSensors()
  {
    this.sensors.push(new Sensor(175,0))
    this.sensors.push(new Sensor(75,75))
    this.sensors.push(new Sensor(75,-75))
    this.sensors.push(new Sensor(20,0))
  }
}
