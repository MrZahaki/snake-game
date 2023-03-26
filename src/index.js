
class snakePart{
    constructor(x, y, color){
        this.x = x;
        this.y = y;
        this.color = color;
    }

}


class Snake{
    

    static colors = [   "purple", 
                        "silver", 
                        "gray", 
                        "white", 
                        "maroon", 
                        "gray", 
                        "red", 
                        "fuchsia", 
                        "yellow", 
                        "navy", 
                        "blue", 
                        "orange", 
                        "brown", 
                        "crimson", 
                        "darkorange", 
                        "darkslateblue"
                    ]
    
    PI_SCALED = 2 * Math.PI;

    constructor(context, 
                initX, 
                initY, 
                offset, 
                objectSize, 
                tailLength,
                colorRefreshRate,
                collisionDuration){

        this.snakeParts = [];
        this.ctx = context;
        this.headXInit = initX;
        this.headYInit = initY;
        this.headX = initX;
        this.headY = initY;
        this.offset = offset; 
        this.objectSize = objectSize; 
        this.objectRadious = objectSize / 2; 
        this.tailLengthInit = tailLength;
        this.tailLength = tailLength;
        this.xvelocity = 1;
        this.yvelocity = 1;
        this.eyeOffsetScale = 5;
        this.eyeRadious = this.objectRadious / 3;
        this.leftEyeOffset = offset / 3;
        this.rightEyeOffset = this.objectRadious - this.leftEyeOffset;
        this.mouthRadious = this.objectRadious / 1.2;
        this.mouthOffset = this.offset;
        this.mouthLineWidth = 2;
        this.onCollision = false;
        this.collisionDuration = collisionDuration;
        this.collisionCounter = 1;
        this.collisionAnimMaxScale = 1 / 3;
        this.collisionAnimMinScale = 3;
        this.collisionAnimScale = 0;
        this.colorRefreshDuration = 1000 / colorRefreshRate; // to ms
        this.colorRefreshTime = 0;
        this.colorRefreshIdle = 'pink';
        this.exePeriod = 0;
        this.exeTimeBuffer = 0;
        
    }

    draw(){
        
        let colorRefreshFlg = false;

        this.exePeriod = Date.now() - this.exeTimeBuffer;
        this.exeTimeBuffer = Date.now();

        if(Date.now() - this.colorRefreshTime > this.colorRefreshDuration){
            colorRefreshFlg = true;
            this.colorRefreshTime = Date.now();
        }
        //loop through our snakeparts array
        for(let i=0; i < this.snakeParts.length; i++){
            //draw snake parts
            let part = this.snakeParts[i]
            this.ctx.fillStyle = part.color;
            this.ctx.arc(part.x + this.offset, part.y + this.offset, this.objectRadious, 0, this.PI_SCALED );
            this.ctx.fill()
            this.ctx.beginPath();
        }
        

        //add parts to snake --through push
        let headColor;
        if(colorRefreshFlg || !this.snakeParts.length){
            headColor = Snake.colors[getRndInteger(Snake.colors.length)];
        }
        else{
            headColor = this.snakeParts[0].color;
        }
        this.snakeParts.push(new snakePart(this.headX, this.headY, headColor));//put item at the end of list next to the head
        if(this.snakeParts.length > this.tailLength){
            this.snakeParts.shift();//remove furthest item from  snake part if we have more than our tail size
    
        }
        
        this.drawHead(this.headX, this.headY);
        

     }
     
     
     drawHead(xpos, ypos, gameOver){

        this.ctx.fillStyle = 'white';
        this.ctx.arc(xpos + this.offset, ypos + this.offset, this.objectRadious, 0, this.PI_SCALED )
        this.ctx.fill()
        this.ctx.beginPath();

        this.ctx.fillStyle = "black";
        this.ctx.arc(xpos + this.leftEyeOffset, ypos + this.leftEyeOffset, this.eyeRadious, 0, this.PI_SCALED )
        this.ctx.arc(xpos + this.rightEyeOffset, ypos + this.leftEyeOffset, this.eyeRadious, 0, this.PI_SCALED )
        this.ctx.fill()
        this.ctx.beginPath();
        
        if(gameOver){
            this.ctx.font =this.eyeRadious *2.4 + "px verdana";
            this.ctx.textAlign = "center";
            this.ctx.fillText("X", xpos + this.offset, ypos + this.offset * 3);//position our text in center

        }
        else{
            this.drawMouth(xpos, ypos);
        }
        
        this.ctx.beginPath();
     }


     drawMouth(xpos, ypos){

        let mouthAngle = Math.PI;
        let mouthRadious = this.mouthRadious;

        if(this.onCollision){
            if(!this.collisionAnimScale){
                this.collisionAnimScale = Math.abs(this.collisionAnimMinScale - this.collisionAnimMaxScale) * this.exePeriod / this.collisionDuration;
                this.collisionCounter = this.collisionAnimMaxScale;
            }
            mouthAngle =  this.PI_SCALED;
            this.ctx.fillStyle = Snake.colors[getRndInteger(Snake.colors.length)];
            mouthRadious /= this.collisionCounter ;
        }
        else{
            this.ctx.StrokeStyle = "black";
            this.ctx.lineWidth = this.mouthLineWidth;
        }
        this.ctx.arc(xpos + this.offset, ypos + this.mouthOffset, mouthRadious, 0,  mouthAngle)
        if(this.onCollision){
            this.ctx.fill();
            if(this.collisionCounter > this.collisionAnimMinScale){
                this.onCollision = false;
                this.collisionAnimScale = 0;
            }
            else{
                this.collisionCounter += this.collisionAnimScale;
            }
        }
        else{
            this.ctx.stroke()
        }
     }


     reset(){
        this.snakeParts = [];
        this.tailLength = this.tailLengthInit;
        this.xvelocity = 1;
        this.yvelocity = 1;
        this.onCollision = false;
        this.headX = this.headXInit;
        this.headY = this.headYInit;

     }

     updatePosition(xvelocity, yvelocity){
        this.headX = this.headX + xvelocity * this.offset;
        this.headY = this.headY + yvelocity * this.offset;
        this.xvelocity = xvelocity;
        this.yvelocity = yvelocity;
        //console.log('updatePosition xpos', this.headX)
        //console.log('updatePosition ypos', this.headY)

     }

     isCrushed(){
        let retval = false;
        //console.log('isCrushed xpos', this.headX, this.ctx.canvas.width)
        //console.log('isCrushed ypos', this.headY, this.ctx.canvas.height)
        if(
               (this.headX < 0) /*if snake hits left wall*/
            || (this.headX >= this.ctx.canvas.width) /*if snake hits right wall*/
            || (this.headY < 0) /*if snake hits wall at the top*/
            || (this.headY >= this.ctx.canvas.height)
        ){//if snake hits wall at the bottom
            retval=true;
            //console.log('wall colision error')
        }
        else{
            for(let i = 0; i < this.snakeParts.length; i++){
                let part = this.snakeParts[i];
                if(part.x === this.headX && part.y === this.headY){//check whether any part of snake is occupying the same space
                    retval = true;
                    break; // to break out of for loop
                }
            }
        }
        return retval;
     }

     checkCollision(obj){
        let retval  = false;

        
        let xobj = obj.getXPos();
        let yobj = obj.getYPos();

        if(
                (this.headX + this.objectRadious * 2 >= xobj) 
            &&  (this.headX <= xobj + obj.getWidth())
            &&  (this.headY + this.objectRadious * 2 >= yobj) 
            &&  (this.headY <= yobj + obj.getHeight())
            ){
                this.onCollision = true;
                retval = true;
        }
        return retval;
    }

    increaseTailLength(){
        this.tailLength++;
    }

}

class Heart{
    constructor(context, objectSize, ){
        this.snakeParts = [];
        this.ctx = context;
        this.xpos = 0;
        this.ypos = 0;
        this.objectSize = objectSize; 
        this.score = 0;

        this.updatePosition();
    }

    draw(){
        //this.ctx.beginPath();
        //this.ctx.fillStyle="red";
        //this.ctx.fillRect(this.xpos, this.ypos, this.objectSize, this.objectSize)
        this.drawHeart(this.ctx, this.xpos, this.ypos, this.objectSize, this.objectSize, "red") 
    }

    drawHeart(ctx, fromx, fromy, width, height, color) {

        var x = fromx;
        var y = fromy;
      
        ctx.save();
        ctx.beginPath();
        var topCurveHeight = height * 0.3;
        ctx.moveTo(x, y + topCurveHeight);
        // top left curve
        ctx.bezierCurveTo(
          x, y, 
          x - width / 2, y, 
          x - width / 2, y + topCurveHeight
        );
      
        // bottom left curve
        ctx.bezierCurveTo(
          x - width / 2, y + (height + topCurveHeight) / 2, 
          x, y + (height + topCurveHeight) / 2, 
          x, y + height
        );
      
        // bottom right curve
        ctx.bezierCurveTo(
          x, y + (height + topCurveHeight) / 2, 
          x + width / 2, y + (height + topCurveHeight) / 2, 
          x + width / 2, y + topCurveHeight
        );
      
        // top right curve
        ctx.bezierCurveTo(
          x + width / 2, y, 
          x, y, 
          x, y + topCurveHeight
        );
      
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      
      }

    updatePosition(){
        
        this.xpos = getRndInteger(this.ctx.canvas.width - this.objectSize, this.objectSize);
        this.ypos = getRndInteger(this.ctx.canvas.height - this.objectSize, this.objectSize);
     }

     increaseScore(){
        this.score++;
     }

     decreaseScore(){
        this.score--;
     }

     getXPos(){
        return this.xpos;
     }

     getYPos(){
        return this.ypos;
     }

     getScore(){
        return this.score;
     }
     
     setScore(score){
        this.score = score;
     }

     getWidth(){
        return this.objectSize;
     }
    
     getHeight(){
        return this.objectSize;
     }


}
 




function drawCurvedRect(ctx, x, y, width, height, radiusTopLeft, radiusTopRight, borderWidth, borderColor, fillColor) {
    ctx.beginPath();
    ctx.moveTo(x + radiusTopLeft, y);
    ctx.lineTo(x + width - radiusTopRight, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radiusTopRight);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radiusTopLeft);
    ctx.quadraticCurveTo(x, y, x + radiusTopLeft, y);
    ctx.closePath();
    
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    
    if (borderWidth && borderColor) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.stroke();
    }
  }
  
  
  class DeadlyTrain{
    constructor(ctx, minAppearanceTime, maxAppearanceTime, warningTime, trainSpeed, xposRange, yposRange, height, updatePeriod) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.minAppearanceTime = minAppearanceTime;
        this.maxAppearanceTime = maxAppearanceTime;
        this.appearanceTime    = getRndInteger(maxAppearanceTime, minAppearanceTime);
        this.warningTime = warningTime;
        this.trainSpeed = trainSpeed;
        this.updatePeriod = updatePeriod;
        this.updatePeriodBuffer = 0;

        this.appTimeBuffer = Date.now();
        this.warnTimeBuffer = 0;
        this.onWarning = false;
        this.state = false;

        this.xposRange = xposRange
        this.yposRange = yposRange

        
        this.xpos = 0;
        this.trainXPos = 0;
        this.ypos = 0;
        
        this.warnWidth = 0; 
        this.warnHeight = 0; 
        
        this.trainMaxHeight = height; 
        this.train = new Train(this.trainMaxHeight, updatePeriod);
        this.trainAxes = false;
        //this.trainDir = false;

      }

      getXPos(){
        return this.trainXPos;
      }

      getYPos(){
        return this.ypos;
      }

      getWidth(){
        return this.train.getWidth();
      }

      getHeight(){
        return this.train.getHeight();
      }

      draw(){
        if(Date.now() - this.appTimeBuffer > this.appearanceTime){
            if(!this.onWarning){
                this.onWarning = true;
                this.warnTimeBuffer = Date.now();

                this.trainAxes = 0;
                // this.trainAxes = this.warnTimeBuffer % 2;
                //this.trainDir = getRndInteger(2) * 2 - 1;
                //console.log(this.trainDir)

                // if(this.trainAxes){ // x axes
                //     this.xpos = getRndInteger(this.xposRange[1], this.xposRange[0]);
                //     this.ypos = this.yposRange[0];
                //     this.warnWidth = this.trainMaxHeight;
                //     this.warnHeight = this.yposRange[1];
                //     //console.log('x axes ', this.xpos, this.ypos, this.warnWidth, this.warnHeight);
                // }
                // else{ // y axes
                    this.xpos = this.xposRange[0];
                    this.trainXPos = this.xposRange[1];
                    this.ypos = getRndInteger(this.yposRange[1], this.yposRange[0]);
                    this.warnWidth = this.xposRange[1];
                    this.warnHeight = this.trainMaxHeight;
                    //console.log('y axes ', this.xpos, this.ypos, this.warnWidth, this.warnHeight);

                //}
                
            }
            if(this.drawWarning()){
                
            }
            else{
                // if(this.trainAxes){ // xpos
                //     this.ypos += this.trainSpeed;
                // }
                // else{
                //     this.xpos += this.trainSpeed;
                // }
                if(Date.now() - this.updatePeriodBuffer > this.updatePeriod){
                  this.trainXPos -= this.trainSpeed;
                  this.train.updatePosition(this.trainXPos, this.ypos);
                }
                this.train.draw(this.ctx);
                this.ctx.beginPath()
                
                if(this.trainXPos + this.train.getWidth() < 0){
                    this.reset();
                }
                
            }
            this.enable();
            return;
        }

        this.disable();
        return;
      }
      

      drawWarning(){
        if(this.onWarning && (Date.now() - this.warnTimeBuffer < this.warningTime)){
            

            drawCurvedRect(
                this.ctx, 
                this.xpos, 
                this.ypos, 
                this.warnWidth, 
                this.warnHeight, 
                5, 
                5, 
                1, 
                "#666", 
                "#ff00524d");

            this.ctx.beginPath();

            return true;
        }
        return false;
      }

      drawTrain(){

      }

      isEnabled(){
        return this.state;
      }

      enable(){
        this.state = true;
      }

      disable(){
        this.state = false;
      }

      reset(){
        this.appearanceTime    = getRndInteger(this.maxAppearanceTime, this.minAppearanceTime);
        this.appTimeBuffer = Date.now();
        this.onWarning = false;
        this.disable();
        this.train.reset();
      }
  }
  
  class Train {
    constructor(height, updatePeriod) {
      this.x = 0;
      this.y = 0;
      this.engine = 0;
      this.chimney = 0;
      this.carriage = 0;
      this.wheels = 0;
      this.windows =  0;
      this.updatePeriod = updatePeriod;
      

      this.engineHeight = height;
      this.carriageWidth = this.engineHeight * 2; 
      this.engineWidth = this.carriageWidth / 1.2;
      this.windowWidth = this.engineWidth * 0.35;
      this.windowHeight = this.engineHeight * 0.3;
      this.chimneyWidth = this.engineWidth * 0.26;
      this.windowXOffset =  [
        this.windowWidth,                       
        this.carriageWidth / 2 + this.engineWidth / 1.1 
      ]

      this.windowYOffset =   this.engineHeight * 0.2;
      this.wheelSize = ((this.engineWidth < this.engineHeight)? this.engineWidth: this.engineHeight) * 0.3;

      this.engine = new Engine(this.x , this.y, this.engineWidth, this.engineHeight);
        this.chimney = new Chimney(this.chimneyWidth, height * 0.3, updatePeriod);
        this.carriage = [
            new Carriage(this.x, this.y, this.carriageWidth, this.engineHeight), 
            new Carriage(this.x, this.y, this.carriageWidth, this.engineHeight)
        ];
        this.wheels = [ new Wheel(this.x, this.y, this.wheelSize, 5, 10, 2,  "#000", "#333", "#aaa"), 
                        new Wheel(this.x, this.y, this.wheelSize, 5, 10, 2,  "#000", "#333", "#aaa"), 
                        new Wheel(this.x, this.y, this.wheelSize, 5, 10, 2,  "#000", "#333", "#aaa")
                    ];
        this.windows = [
            new Window(this.x, this.y, this.windowWidth, this.windowHeight), 
            new Window(this.x, this.y, this.windowWidth, this.windowHeight)
        ];

    }

    getWidth(){
      return this.engineWidth + this.carriageWidth * this.carriage.length + 10;
    }

    getHeight(){
      return this.engineHeight + this.wheelSize / 2;
    }

    updatePosition(x, y){
        this.x = x;
        this.y = y;
        let carriageOffset = 0;
        // Define the initial x and y position for the first carriage
        let carriageX = x + this.engine.width;
        let carriageY = y;
        let wheelY = y + this.engineHeight;
        let wheelX = x + this.engine.width / 2; //for engine
        let wheelXOffset = this.engine.width + this.carriageWidth / 2; //for engine
       
        this.engine.updatePosition(x, carriageY);
        this.chimney.updatePosition(x + this.engineWidth - this.chimneyWidth - 10, carriageY);

        this.wheels[0].updatePosition(wheelX, wheelY); //update engine wheel
        // Iterate over each carriage in the train
        this.carriage.forEach((carriage) => {
          
          // Update the carriage position based on the offsets
          carriage.updatePosition(carriageX, carriageY);
          
          
          // Increment the carriage offset for the next iteration
          wheelX = x + carriage.width * carriageOffset + wheelXOffset;
          carriageOffset++;
          this.wheels[carriageOffset].updatePosition(wheelX, wheelY);
          
          // Update the x position for the next carriage based on the carriage width and offset
          carriageX += carriageOffset * this.carriageWidth;
          
        });


        // Iterate over each carriage in the train
        for(let i = 0; i < this.windows.length; i++){
          this.windows[i].updatePosition(x + this.windowXOffset[i], y + this.windowYOffset);          
        }

        // this.windows = [
        //     new Window(this.x + 91, this.y + 70, 40, 30), 
        //     new Window(this.x + 175, this.y + 70, 40, 30)
        // ];
        this.COAL_COUNT = 100;
        this.COAL_RADIUS_MIN = 10;
        this.COAL_RADIUS_MAX = 20; 
        this.coal_time_buffer = 0;
        this.coal_offset = 15;
    
        this.coals = [];
        let carriage = this.carriage[this.carriage.length - 1];
         for (let i = 0; i < this.COAL_COUNT; i++) {
             this.coals[i] = [getRndInteger( carriage.width - this.COAL_RADIUS_MAX - this.coal_offset, this.COAL_RADIUS_MAX),
                              getRndInteger(carriage.height - this.COAL_RADIUS_MAX - this.coal_offset, this.COAL_RADIUS_MAX)] ;
    
         }
    
    }

    draw(ctx) {
      
      this.engine.draw(ctx);
  
      this.carriage.forEach((carriage) => {
        carriage.draw(ctx);
      });
      
      this.wheels.forEach((wheel) => {
        wheel.draw(ctx);
      });
      
      this.windows.forEach((window) => {
        window.draw(ctx);
      });
      
      this.chimney.draw(ctx);

      let carriage = this.carriage[this.carriage.length - 1];
            this.coal_time_buffer = Date.now();
            for (let i = 0; i < this.COAL_COUNT; i++) {
                const x = this.coals[i][0];
                const y = this.coals[i][1];
                const radius = getRndInteger(this.COAL_RADIUS_MAX, this.COAL_RADIUS_MIN);
                this.drawCoal(ctx, carriage.x + x + this.coal_offset / 2, carriage.y + y + this.coal_offset / 2, radius, '#333333');
            }
    }
    
    drawCoal(ctx, x, y, radius, color) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    }

    reset(){
      this.x = 0;
      this.y = 0;
      this.chimney.reset();
    }
  }



  class Engine {
    constructor(x = 0, y = 0, width = 100, height = 100) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.lradius = Math.min(this.height * 0.5, 50);
      this.rradius = this.lradius * 0.1;
    }
  
    draw(ctx) {
      ctx.fillStyle = "#444";
      ctx.fillRect(this.x, this.y, this.width, this.height);
  
      drawCurvedRect(
        ctx, 
        this.x + this.width * 0.01,
        this.y + this.height * 0.01,
        this.width - this.width * 0.02,
        this.height - this.height * 0.02,
        this.lradius, 
        this.rradius, 
        this.height * 0.02, 
        "#666", 
        "#aaa");
  
    }
  
    updatePosition(x, y) {
      this.x = x;
      this.y = y;
    }
  }
  

  
class Carriage {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    const offset = height * 0.02;
    this.lradius = offset;
    this.rradius = offset;
    this.xOffset = offset;
    this.yOffset = offset;
    this.widthOffset = offset * 2;
    this.heightOffset = offset * 2;
  }

  updatePosition(newX, newY) {
    this.x = newX;
    this.y = newY;
  }

  draw(ctx) {
    ctx.fillStyle = "#444";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    drawCurvedRect(
      ctx,
      this.x + this.xOffset,
      this.y + this.yOffset,
      this.width - this.widthOffset,
      this.height - this.heightOffset,
      this.lradius,
      this.rradius,
      this.height * 0.09,
      "#666",
      "#aaa"
    );
  }
}

  

class Wheel {
  constructor(x, y, radius, hoodSize, spokeCount, spokeSize, spokeColor, rimColor, tireColor) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.hoodSize = hoodSize;
    this.spokeCount = spokeCount;
    this.spokeSize = spokeSize;
    this.spokeColor = spokeColor;
    this.rimColor = rimColor;
    this.tireColor = tireColor;
    this.angle = 0;
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  draw(ctx) {
    this.angle -= 0.04;
    const options = {
      x: this.x,
      y: this.y,
      radius: this.radius,
      hoodSize: this.hoodSize,
      angle: this.angle,
      spokeCount: this.spokeCount,
      spokeSize: this.spokeSize,
      spokeColor: this.spokeColor,
      rimColor: this.rimColor,
      tireColor: this.tireColor,
    };
    this.drawWheel(ctx, options);
  }

  drawWheel(ctx, options) {
    const spokeAngle = 2 * Math.PI / options.spokeCount;

    ctx.save();
    ctx.translate(options.x, options.y);
    ctx.rotate(options.angle);

    // Draw tire
    ctx.beginPath();
    ctx.arc(0, 0, options.radius, 0, 2 * Math.PI);
    ctx.fillStyle = options.tireColor;
    ctx.fill();

    // Draw rim
    ctx.beginPath();
    ctx.arc(0, 0, options.radius - options.hoodSize, 0, 2 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = options.rimColor;
    ctx.stroke();

    // Draw spokes
    ctx.lineWidth = options.spokeSize;
    ctx.strokeStyle = options.spokeColor;
    for (let i = 0; i < options.spokeCount; i++) {
      ctx.rotate(spokeAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -options.radius + options.hoodSize);
      ctx.stroke();
    }

    ctx.restore();
  }
}

  
  

  class Window {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.faceRadius =  (height < width? height: width) / 2;
    }
  
    draw(ctx) {
      this.drawWindow(ctx);
      this.drawFace(ctx);
    }
  
    drawFace(ctx) {
      const eyeRadius = this.width / 10;
      const mouthWidth = this.width / 3;
      const mouthHeight = this.height / 5;
  
      // Draw face
      ctx.fillStyle = "#f0d9b5";
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.faceRadius, 0, 2 * Math.PI);
      ctx.fill();
  
      // Draw eyes
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(this.x + this.width / 3, this.y + this.height / 2, eyeRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x + 2 * this.width / 3, this.y + this.height / 2, eyeRadius, 0, 2 * Math.PI);
      ctx.fill();
  
      // Draw pupils
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(this.x + this.width / 3, this.y + this.height / 2, eyeRadius / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x + 2 * this.width / 3, this.y + this.height / 2, eyeRadius / 2, 0, 2 * Math.PI);
      ctx.fill();
  
      // Draw mouth
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2 - mouthWidth / 2, this.y + 2 * this.height / 3);
      ctx.quadraticCurveTo(this.x + this.width / 2, this.y + 2 * this.height / 3 + mouthHeight, this.x + this.width / 2 + mouthWidth / 2, this.y + 2 * this.height / 3);
      ctx.fill();
    }
  
    drawWindow(ctx) {
      // Draw window frame
      ctx.fillStyle = "#ddd";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#444";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
  
      // Draw glass
      const glassMargin = 5;
      const glassWidth = this.width - 2 * glassMargin;
      const glassHeight = this.height - 2 * glassMargin;
      ctx.fillStyle = "#fff";
      ctx.fillRect(this.x + glassMargin, this.y + glassMargin, glassWidth, glassHeight);
  
      // Add reflection to glass
      const reflectionSize = 10;
      const reflectionGradient = ctx.createLinearGradient(
                                    this.x + glassMargin,
                                    this.y + glassMargin,
                                    this.x + glassMargin + glassWidth,
                                    this.y + glassMargin
                                );
      
      reflectionGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
      reflectionGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = reflectionGradient;
      ctx.fillRect(this.x + glassMargin, this.y + glassMargin, glassWidth, reflectionSize);
  
      // Add sun glare to glass
      const sunGlareSize = 20;
      const centerX = this.x + glassMargin + glassWidth / 2;
      const centerY = this.y + glassMargin + glassHeight / 2;

      const sunGlareGradient = ctx.createRadialGradient(
        centerX, centerY, 0, centerX, centerY, sunGlareSize
      );

      sunGlareGradient.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      sunGlareGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = sunGlareGradient;
      ctx.beginPath();
      ctx.arc(this.x + glassMargin + glassWidth / 2, this.y + glassMargin + glassHeight / 2, sunGlareSize, 0, 2 * Math.PI);
      ctx.fill();
      }

      updatePosition(x, y) {
        this.x = x;
        this.y = y;
      
    }
    }  
    // ctx.fillStyle = "#777";
    // ctx.fillRect(this.x, this.y, this.width, this.height);

    // ctx.fillStyle = "#aaa";
    // ctx.fillRect(this.x + 10, this.y - 10, 30, 10);

    // ctx.fillStyle = "#999";
    // ctx.fillRect(this.x + 15, this.y - 20, 20, 10);

    // ctx.fillStyle = "#fff";
    // ctx.fillRect(this.x + 20, this.y - 30, 10, 10);

// class Chimney {
//     constructor(x, y, width, height) {
//       this.x = x;
//       this.y = y;
//       this.width = width;
//       this.height = height;
//       this.smokeY = y;
//       this.smokeOffset = 0;

//       let widthStep = width * 0.24;
//       let heightStep = height * 0.9;
//       this.heightStep = heightStep;

//       this.xoffset = [widthStep, widthStep * 1.3, widthStep * 1.6]
//       this.yoffset = [heightStep, heightStep * 2, heightStep * 3]

//       this.smokeXOffset = widthStep * 0.8;
//       this.smokeYOffset = heightStep;
      
//     }
  
//     draw(ctx) {
//       ctx.fillStyle = "#777";
//       ctx.fillRect(this.x, this.y, this.width, this.height);
  
//       ctx.fillStyle = "#aaa";
//       ctx.fillRect(this.x + this.xoffset[0], this.y - this.yoffset[0], this.yoffset[2], this.heightStep);
  
//       ctx.fillStyle = "#999";
//       ctx.fillRect(this.x + this.xoffset[1], this.y - this.yoffset[1], this.yoffset[1], this.heightStep);
  
//       ctx.fillStyle = "#fff";
//       ctx.fillRect(this.x + this.xoffset[2], this.y - this.yoffset[2], this.yoffset[0], this.heightStep);
  
//       this.drawSmoke(ctx);
//     }
  
//     drawSmoke(ctx) {
//       ctx.fillStyle = "#ccc";
//       ctx.beginPath();
//       ctx.moveTo(this.x + this.smokeXOffset, this.smokeY);
//       ctx.quadraticCurveTo(
//         this.x + this.smokeXOffset + this.smokeOffset, 
//         this.smokeY - this.smokeYOffset, 
//         this.x + this.smokeXOffset * 6, 
//         this.smokeY
//         );
//       // ctx.quadraticCurveTo(this.x + 40 + this.smokeOffset, this.smokeY - 20, this.x + 50, this.smokeY);

//       ctx.fill();

//       this.smokeY -= 2;        
//       this.smokeOffset += 0.2;
//       if (this.smokeY < this.y - 50) {
//         this.smokeY = this.y;
//         this.smokeOffset = 0;
//       }

//     }
  
//     updatePosition(x, y) {
//         this.x = x;
//         this.y = y;
      
//     }
//   }



class Chimney {
    constructor(width, height, updatePeriod) {
      this.width = width;
      this.height = height;
      this.rectWidth = width * 0.8;
      this.rectHeight = height * -0.3;
      this.x = 0;
      this.y = 0;

      this.smokeY = 0;
      this.smokeOffset = 0;
      this.smokeXOffset = 0.24 * this.rectWidth;
      this.smokeYOffset = this.rectHeight * 3;

    }
  
    draw(ctx) {
      const x = this.x + this.width * 0.1;
      let y = this.y;
  
      // Draw first rectangle
      ctx.fillStyle = Chimney.COLOR_1;
      ctx.fillRect(x, y, this.rectWidth, this.rectHeight);
  
      // Draw second rectangle
      y += this.rectHeight;
      ctx.fillStyle = Chimney.COLOR_2;
      ctx.fillRect(x + this.rectWidth * 0.1, y, this.rectWidth * 0.8, this.rectHeight);
  
      // Draw third rectangle
      y += this.rectHeight;
      ctx.fillStyle = Chimney.COLOR_3;
      ctx.fillRect(x + this.rectWidth * 0.2, y, this.rectWidth * 0.6, this.rectHeight);

      this.drawSmoke(ctx);
          }
        
      drawSmoke(ctx) {
        ctx.fillStyle = "#ccc";
        ctx.beginPath();
        ctx.moveTo(this.x + this.smokeXOffset, this.smokeY);
        ctx.quadraticCurveTo(
          this.x + this.smokeXOffset + this.smokeOffset, 
          this.smokeY - this.smokeYOffset, 
          this.x + this.smokeXOffset * 6, 
          this.smokeY
          );
        // ctx.quadraticCurveTo(this.x + 40 + this.smokeOffset, this.smokeY - 20, this.x + 50, this.smokeY);
        ctx.fill();
      }
      
    updatePosition(x, y) {
        this.updateTimeBuffer = Date.now();
        this.x = x;
        this.y = y;

        this.smokeY -= 2;        
        this.smokeOffset += 0.2;
        if (this.smokeY < this.y - 50) {
          this.smokeY = this.y;
          this.smokeOffset = 0;
        }
    }

    reset(){
      this.smokeY = 0;
      this.smokeOffset = 0;
    }
  }
  
  Chimney.COLOR_MAIN = "#777";
  Chimney.COLOR_1 = "#aaa";
  Chimney.COLOR_2 = "#999";
  Chimney.COLOR_3 = "#fff";
  Chimney.COLOR_SMOKE = "#ccc";



class UserHandler{

    static keyCodeMap = {
        up: 38,
        right: 39,
        left: 37,
        down: 40,
        W: 87,
        S: 83,
        A: 65,
        D: 68,
    }

    constructor(up, down, left, right){
        document.onkeydown = this.keyDown.bind(this);
        document.ontouchmove = this.touchMoveHandler;
        up.onmousedown = this.toUp.bind(this);
        down.onmousedown = this.toDown.bind(this);
        left.onmousedown = this.toLeft.bind(this);
        right.onmousedown = this.toRight.bind(this);

        this.yvelocity = 0;
        this.xvelocity = 0;
        this.event_flag = false;
    }

    keyDown(event){
    //up
        let keyCodeMap = UserHandler.keyCodeMap;
        let code = event.keyCode;
        if(
                (code == keyCodeMap.W)
            ||  (code == keyCodeMap.up)
        ){
            //prevent snake from moving in opposite direcction
            this.toUp();
            
        }
        //down
        if(
                (code == keyCodeMap.S)
            ||  (code == keyCodeMap.down)
        ){
            this.toDown();
        }

        //left
        if(
                (code == keyCodeMap.A)
            ||  (code == keyCodeMap.left)
        ){
            this.toLeft();
        }
        //right
        if(
                (code == keyCodeMap.D)
            ||  (code == keyCodeMap.right)
        ){
            this.toRight();
        }
    }

    touchMoveHandler(){
        
    }

    toUp(){
        this.event_flag = true;
        if(this.yvelocity == 1)
            return;
        this.yvelocity = -1;
        this.xvelocity = 0;
    }

    toDown(){
        this.event_flag = true;
        if(this.yvelocity == -1)
            return;
        this.yvelocity = 1;
        this.xvelocity = 0;
    }

    toLeft(){
        this.event_flag = true;
        if(this.xvelocity == 1)
            return;
        this.yvelocity = 0;
        this.xvelocity = -1;
    }

    toRight(){
        this.event_flag = true;
        if(this.xvelocity == -1)
                return;
            this.yvelocity = 0;
            this.xvelocity = 1;
    }

    getXDirection(){
        return this.xvelocity;
    }

    getYDirection(){
        return this.yvelocity;
    }

    resetDirection(){
        this.xvelocity = 0;
        this.yvelocity = 0;
    }


    resetEventBuffer(){
        this.event_flag = false;
    }
    
    getEvent(){
        return this.event_flag ;
    }
    
    async waitForEvent(){
        
    }
}


class GameOver{
    static gameOverText = "Game Over!";
    static gameOverHintText = "If you like it!!! Please hit one like.";
    

    constructor(context, duration){
        this.ctx = context;
        this.gameOverTextFontSize = 40;
        this.gameOverHintTextFontSize = 20;
        this.state = false;
        this.timer_stamp = 0;
        this.duration = duration;
        const btnWidth = this.ctx.canvas.width * 0.5;
        this.button = new CanvasButton(context, 'Link to github!', this.ctx.canvas.width / 2 - btnWidth / 2, this.ctx.canvas.height * 6/7, btnWidth, 50, '#FF007F');
    }

    draw(){

        let textXpos = canvas.clientWidth / 2;
        //display text Game Over
        this.ctx.fillStyle = "white";
        this.ctx.font = this.gameOverTextFontSize + "px verdana";
        this.ctx.textAlign = "center";
        this.ctx.fillText(GameOver.gameOverText, textXpos, canvas.clientHeight / 2);//position our text in center
        
        this.ctx.font = this.gameOverHintTextFontSize + "px verdana";
        this.ctx.fillText(GameOver.gameOverHintText, textXpos, canvas.clientHeight - 30);//position our text in center
        this.button.draw(this.ctx);
    }

    updateState(userHandler, snake){
        //Game Over function
        let gameOver=false; 
        //check whether game has started
        if(userHandler.getXDirection() == 0 && userHandler.getYDirection() == 0){
        }      
        //stop game when snake crush to its own body
        else if(snake.isCrushed()){
            gameOver = true;
        }
        this.state = gameOver;// this will stop execution of drawgame method
        return gameOver;

    }

    getState(){
        return this.state;
    }
    
    setState(state){
        this.state = state;
    }

    start(){
        if(this.state){
            this.timer_stamp =  Date.now();
            canvas.addEventListener('mousedown', this.button);
            canvas.addEventListener('mouseup', this.button);
            canvas.addEventListener('touchstart', this.button);
            canvas.addEventListener('touchend', this.button);
            canvas.addEventListener('touchcancel', this.button);
        }
    }
    
    isFinished(){
        let retval = false;
        if(this.state && (Date.now() - this.timer_stamp > this.duration)){
            retval = true;
            canvas.removeEventListener('mousedown', this.button);
            canvas.removeEventListener('mouseup', this.button);
            canvas.removeEventListener('touchstart', this.button);
            canvas.removeEventListener('touchend', this.button);
            canvas.removeEventListener('touchcancel', this.button);
        }
        return retval;
    }

}


class CanvasButton {
  constructor(ctx, text, x, y, width, height, color) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.isPressed = false;
    this.context = ctx;
    this.link = document.createElement('a');
  }

  draw() {
    this.context.save();
    this.context.beginPath();
    this.context.moveTo(this.x, this.y + this.height / 2);
    this.context.quadraticCurveTo(this.x, this.y, this.x + this.width / 2, this.y);
    this.context.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + this.height / 2);
    this.context.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width / 2, this.y + this.height);
    this.context.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height / 2);
    this.context.closePath();
    this.context.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.context.shadowBlur = 8;
    this.context.shadowOffsetX = 2;
    this.context.shadowOffsetY = 2;
    this.context.fillStyle = this.isPressed ? '#1E88E5' : this.color;
    this.context.fill();
    this.context.shadowColor = 'transparent';
    this.context.shadowBlur = 0;
    this.context.shadowOffsetX = 0;
    this.context.shadowOffsetY = 0;
    this.context.fillStyle = 'white';
    this.context.font = 'bold 16px Arial';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    this.context.restore();
  }

  handleEvent(event) {
    switch (event.type) {
      case 'mousedown':
      case 'touchstart':
        if (this.isPointInside(event)) {
          this.isPressed = true;
          this.draw(this.context);
          event.preventDefault();
        }
        break;
      case 'mouseup':
      case 'touchend':
      case 'touchcancel':
        if (this.isPressed) {
          this.isPressed = false;
          this.draw(this.context);
          if (this.isPointInside(event)) {
            this.link.href = 'https://' + 'gi' + 'thu' + 'b.co' + 'm/MrZa' + 'haki/snake-game';
            this.link.target = '_blank';
            this.link.click();
          }
          event.preventDefault();
        }
        break;
    }
  }

  isPointInside(event) {
    let rect = event.target.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
  }
}


function getRndInteger(max, min) {
    if(min == undefined){
        min = 0;
    }
    return Math.floor(Math.random() * (max - min) ) + min;
  }


window.onload = function() {
        
    const canvas = document.getElementById('canvas');
    
    let canvas_size = (screen.availWidth < screen.availHeight)? screen.availWidth : screen.availHeight;
    canvas_size = canvas_size > 1000? 1000: canvas_size;
    canvas_size *= 0.99;
    canvas.height = canvas_size;
    canvas.width = canvas_size;
      
    const ctx = canvas.getContext('2d');
    let up = document.getElementById('up');
    let down = document.getElementById('down'); 
    let left = document.getElementById('left');
    let right = document.getElementById('right');

    let speed = 20; //scale
    let maxSpeed = 50; //scale
    let colorRefreshRate = 20; //Hz
    let collisionDuration = 600; //ms
    let snakeOffset = canvas.width  * .009; 
    let objectSize = canvas.width  * .045;

    let snakeInitXPos = getRndInteger(canvas.width - objectSize, objectSize);
    let snakeInityPos = getRndInteger(canvas.height - objectSize, objectSize);;
    let gameOverDuration = 3000;

    let deadlyTrainHeight = canvas.width * 0.05;

    // array for snake parts

    let tailLength = 2;

    

    var snake = new Snake(  ctx, 
                            snakeInitXPos, 
                            snakeInityPos, 
                            snakeOffset, 
                            objectSize, 
                            tailLength,
                            colorRefreshRate,
                            collisionDuration
                            );
    var heart = new Heart(ctx, objectSize);
    var userHandler = new UserHandler(up, down, left, right);
    var gameOver = new GameOver(ctx, gameOverDuration);
    var deadlyTrain = [
      new DeadlyTrain(
                      ctx, 
                      6000, 
                      30000, 
                      4000, 
                      6, 
                      [0, this.canvas.width], 
                      [deadlyTrainHeight, this.canvas.height - deadlyTrainHeight], 
                      deadlyTrainHeight,
                      10
                      ),
      new DeadlyTrain(
                      ctx, 
                      10000, 
                      40000, 
                      3000, 
                      10, 
                      [0, this.canvas.width], 
                      [deadlyTrainHeight, this.canvas.height - deadlyTrainHeight], 
                      deadlyTrainHeight,
                      10
                      ),
      new DeadlyTrain(
                      ctx, 
                      20000, 
                      50000, 
                      5000, 
                      15, 
                      [0, this.canvas.width], 
                      [deadlyTrainHeight, this.canvas.height - deadlyTrainHeight], 
                      deadlyTrainHeight,
                      10
                      ),
      new DeadlyTrain(
                      ctx, 
                      15000, 
                      60000, 
                      3000, 
                      4, 
                      [0, this.canvas.width], 
                      [deadlyTrainHeight, this.canvas.height - deadlyTrainHeight], 
                      deadlyTrainHeight,
                      10
                      ),
      ]

    drawGame();
    
    // create game loop-to continously update screen
    function drawGame(){


        clearScreen(); 
        drawCurvedRect(ctx, 0, 0, canvas.width,canvas.height, 20, 20, 20,"#999","#444");
        ctx.beginPath();        
        // game over logic
        if(gameOver.getState()){

            snake.drawHead(canvas.clientWidth / 2, canvas.clientHeight  * 3 / 4, true);
            
            gameOver.draw();
            
            if(gameOver.isFinished() && userHandler.getEvent()){
                heart.setScore(0);
                snake.reset();
                userHandler.resetDirection();
                gameOver.setState(false);

                deadlyTrain.forEach(train => {
                  train.reset();
                });
            }
        }
        else{
            snake.updatePosition(userHandler.getXDirection(), userHandler.getYDirection());
            let deathCollision = false;
            deadlyTrain.forEach(train => {
              if(checkDeathCollision(snake, train, gameOver)){
                deathCollision = true;
              }
            });

            if( gameOver.updateState(userHandler, snake) || deathCollision) {
                userHandler.resetEventBuffer();
                gameOver.start();
            }

            snake.draw();
            heart.draw();
            deadlyTrain.forEach(train => {
              train.draw();
            });
            
            checkCollision(snake, heart);
            drawScore(heart.getScore());
            

        }
        let speed_scaler = (speed + heart.getScore() / 2);
        speed_scaler = (speed_scaler > maxSpeed)? maxSpeed: speed_scaler;
        setTimeout(drawGame, 1000 / speed_scaler);//update screen 7 times a second
    }
    
    // score function
    function drawScore(score){
        ctx.fillStyle="white"// set our text color to white
        ctx.font="10px verdena"//set font size to 10px of font family verdena
        ctx.fillText("Score: " + score, canvas.clientWidth - 50, 10);// position our score at right hand corner 

    }

    // clear our screen
    function clearScreen(){

    ctx.fillStyle= 'black'// make screen black
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight); // black color start from 0px left, right to canvas width and canvas height

    }
}




function checkCollision(snake, obj){
        
  if(snake.checkCollision(obj)){
      snake.increaseTailLength();
        obj.updatePosition();
        obj.increaseScore();
  }
}

function checkDeathCollision(snake, obj, gameover){
  
  if(snake.checkCollision(obj)){
    gameover.setState(true);
    return true;
  }
  return false;
}


