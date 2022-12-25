

class Sensor
{
  constructor(x,y)
  {
    this.x=x;
    this.y=y;
    this.intersectPoint;
    this.rotatedLine;
    this.changed=false;
    this.closestPoint = {
    x:-1,
    y:-1
  }
  }

  checkIntersect(car)
  {
    this.changed=false;
    this.rotatedLine = this.getRotatedLine(this.x, this.y, car.rotation)
    for(var j=0; j<path.length; j++)
    {
      this.intersectPoint = intersect(path[j].x1,path[j].y1+wallOffsetY,path[j].x2,path[j].y2+wallOffsetY,car.pos.x,car.pos.y,this.rotatedLine.x+car.pos.x,this.rotatedLine.y+car.pos.y)

      if(this.intersectPoint && !this.checkCheckpointHit(car,j)) {
        this.closestPoint = this.intersectPoint;
        this.changed=true;
      }
    }
    if(this.changed==false)
    {
      this.closestPoint = {
      x:-1,
      y:-1
    }
    }

        //Shows the sensors that make contact with wall
  //   if((this.closestPoint.x!=-1 || this.closestPoint.y!=-1) ) {
  //    line(this.closestPoint.x,this.closestPoint.y,car.pos.x,car.pos.y)
  // }
  }

  // The last element in the path is a checkpoint object. It only checks if the car went the wrong way around the path
  // If the car passes through the checkpoint it should not be considered a wall if it has correctly traversed the track
  checkCheckpointHit(car, index) {

    // Hit a wall not checkpoint
    if(index != path.length-1) return false

    // If the car has a score greater than 100 it passed the track so it is not a collidable object
    // Otherwise the car is going the wrong way so it will collide with it 
    return car.score > 300
  }
  getRotatedLine(x1,y1,angle)
  {
    var x = x1*cos(angle) - y1*sin(angle);
    var y = x1*sin(angle) + y1*cos(angle);
    return {x,y};
  }

  show(car) {
    stroke(255)
    line(this.x,this.y,car.pos.x,car.pos.y)
  }

  getDistTo(obj) {
    return dist(this.closestPoint.x,this.closestPoint.y,obj.x,obj.y)
  }
}
