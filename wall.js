let wallThickness = 3
class Wall {
 constructor(x1, y1, x2, y2) {
   this.x1 = x1;
   this.y1 = y1;
   this.x2 = x2;
   this.y2 = y2;
   if(!noiseWalls) this.updatePoints(scaleX,scaleY)
 }
 show() {
  stroke(150)
  strokeWeight(wallThickness*2)
  line(this.x1, this.y1, this.x2, this.y2);
 }

//If a wall gets off the screen it is removed from the path array
 checkOnscreen(pathIndex)
 {
   if(this.y1>wallOffsetY+50)
   {
     path.splice(pathIndex,1);
   }
 }

//Moves walls in the direction of the wall movement dir vector
 moveWalls()
 {
   this.x1+=wallMovementDir.x/cycles.value();
   this.x2+=wallMovementDir.x/cycles.value();
   this.y1+=wallMovementDir.y/cycles.value();
   this.y2+=wallMovementDir.y/cycles.value();
 }

//Returns true if a wall hits the corners, then it bounces 
 checkWallBounce()
 {
   if(this.x1+wallThickness > canvas.width || this.x1-wallThickness < 0 || this.x2+wallThickness > canvas.width || this.x2-wallThickness < 0)
   {
     wallMovementDir.x*=-1;

     for (var i = 0; i < path.length; i++) {
       path[i].moveWalls()
     }
     return true;
   }
   if(this.y1+wallThickness > windowHeight || this.y1-wallThickness < 0 || this.y2+wallThickness > windowHeight || this.y2-wallThickness < 0)
   {
     wallMovementDir.y*=-1;

     for (var i = 0; i < path.length; i++) {
       path[i].moveWalls()
     }
     return true;
   }
   return false;
 }

 updatePoints(scalingFactorX,scalingFactorY) {
  this.x1*=scalingFactorX
  this.x2*=scalingFactorX
  this.y1*=scalingFactorY
  this.y2*=scalingFactorY
 }
}


class CheckPoint extends Wall {
  constructor(x1,y1,x2,y2) {
    super(x1,y1,x2,y2)
  }
  show() {}
}



function createTrack() {
    scaleX = canvas.width/10
    scaleY = canvas.height/10
//Outer loop
path.push(new Wall(1,1,1,2.5))
path.push(new Wall(1,2.5,2.5,5))
path.push(new Wall(1,1,5.5,2))
path.push(new Wall(5.5,2,7.5,.5))
path.push(new Wall(7.5,.5,9.5,4.5))
path.push(new Wall(9.5,4.5,7,9))
path.push(new Wall(7,9,2.5,9))
path.push(new Wall(2.5,9,2.5,5))

// Inner loop
path.push(new Wall(1.85,2.4,5.5,3.25))
path.push(new Wall(5.5,3.25,7.25,2))
path.push(new Wall(7.25,2,8.5,4.5))
path.push(new Wall(8.5,4.5,6.75,7.9))
path.push(new Wall(6.75,7.9,3.25,7.9))
path.push(new Wall(3.25,7.9,3.25,4.5))
path.push(new Wall(3.25,4.5,1.85,2.4))
path.push(new CheckPoint(1,2.5,1.95,2.5))
}

//Checks if two line segments have intersected
function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  
 let denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

 // Lines are parallel
 if (denominator === 0) {
   return false;
 }

 let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
 let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

 //Checks If the intersection is along the segments
 if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
   return false;
 }
 let x = x1 + ua * (x2 - x1);
 let y = y1 + ua * (y2 - y1);

 return { x, y };
}

//Uses perlin noise to create tracks
function addNoisePath(oldLeftX) {
var xVal = noise(xOff)*(canvas.width-150);
var oldY = path[path.length-1].y2;
path.push(new Wall(oldLeftX,oldY,xVal,oldY-400));
path.push(new Wall(oldLeftX+150,oldY,xVal+150,oldY-400));
xOff+=.8;
return xVal;
}

function updateFinalWall()
{
 path[0].x1 = path[1].x1;
 path[0].x2 = path[2].x1;

 path[0].y1 = path[1].y1;
 path[0].y2 = path[2].y1;
 path[0].show();

}

//Moves all the walls and then checks if any walls hit the borders
function updateBouncyWalls()
{
 for (var i = 0; i < path.length; i++) {
   path[i].moveWalls();
 }
 for (var i = 0; i < path.length; i++) {
   if(path[i].checkWallBounce())
     break;
 }
}

//Draws walls with an offset
function showNoiseWalls()
{
 push()
 translate(0,wallOffsetY)
 for (var i=1; i<path.length; i++)
 {
   path[i].show();
 }
 updateFinalWall();
 pop()

 for(var i=0; i<cycles.value(); i++)
 {
   if(frameCount%40==0)
   {
     lastX = addNoisePath(lastX);
   }
 }
}
