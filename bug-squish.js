
/**
 * Bug Squish Game
 * Gabriel Votaw
 * 12 February 2021
 */

var bug=[];
var numBugs=100;
var left=0;
var leftUp=45;
var up=90;
var rightUp=135;
var right=180;
var rightDown=225;
var down=270;
var leftDown=315;
var gameHasStarted=false;
var gameHasEnded=false;
let squishPlayer,skitterPlayer,memSynth,reverb,titleEvent,gameEvent,endEvent,note1,note2,note3,AMSynth,polySynth,noise,filter;

function preload(){
    for(var i=0;i<numBugs;i++){
        bug[i]=new Bug(random(1920),random(965),random([left,leftUp,up,rightUp,right,rightDown,down,leftDown]));
    }  
}

function setup(){
    createCanvas(1920,965);
    imageMode(CENTER);
    angleMode(DEGREES);
    textFont("Arial");

    filter = new Tone.Filter(1300,"lowpass").toDestination();

    skitterPlayer = new Tone.Player("skittering.mp3").toDestination();
    skitterPlayer.volume.value = -20;

    squishPlayer = new Tone.Player("squish.mp3").toDestination();
    squishPlayer.volume.value = 0;

    note1 = "C2";
    note2 = "G2";
    note3 = "A2";

    AMSynth = new Tone.AMSynth().toDestination();
    memSynth = new Tone.MembraneSynth().toDestination();
    polySynth = new Tone.PolySynth().toDestination();
    polySynth.set({detune: -2000});
    polySynth.volume.value = 10;
    noise= new Tone.Noise("pink").connect(filter);
    noise.volume.value = -30;

    startEvent = new Tone.ToneEvent((time) => {
        AMSynth.triggerAttackRelease("B2","2n");
        AMSynth.triggerAttackRelease("A2","2n",time + 0.5);
        AMSynth.triggerAttackRelease("G2","2n",time + 1);
        AMSynth.triggerAttackRelease("A2","2n",time+ 1.5);
        AMSynth.triggerAttackRelease("B2","2n",time + 2);
        AMSynth.triggerAttackRelease("D3","2n",time + 2.5);
    })
    startEvent.loop = true;
    startEvent.loopEnd = "2.95m";

    gameEvent = new Tone.ToneEvent((time) => {
        memSynth.volume.value = -10;
        memSynth.triggerAttackRelease(note1,"8n",time);
        memSynth.triggerAttackRelease(note2,"8n",time+0.25)
        memSynth.triggerAttackRelease(note1,"8n",time+0.5);
        memSynth.triggerAttackRelease(note1,"8n",time+1);
        memSynth.triggerAttackRelease(note1,"8n",time+1.5);
        memSynth.triggerAttackRelease(note3,"8n",time+1.75);
        memSynth.triggerAttackRelease(note2,"8n",time+1.85);
    });
    gameEvent.loop = true;
    gameEvent.loopEnd = "1m";

    endEvent = new Tone.ToneEvent((time) => {
        polySynth.triggerAttackRelease(["Eb3","Bb2"],"8n");
        polySynth.triggerAttackRelease("Ab1","8n",time+0.5);
        polySynth.triggerAttackRelease(["B2","Db3"],"8n",time+1);
        polySynth.triggerAttackRelease(["E2","E3"],"8n",time+1.5);
        polySynth.triggerAttackRelease("E2","8n",time+1.75);
        polySynth.triggerAttackRelease(["Eb1","Ab2"],"8n",time+2);

    });
    endEvent.loop = true;
    endEvent.loopEnd = "2m";
    Tone.Transport.start();
}

function mouseClicked(){
    for(var i=0;i<numBugs;i++){
        bug[i].kill(mouseX,mouseY);
    }  
}

function endGame(){
    gameEvent.stop();
    endEvent.start();
    noise.start();
    skitterPlayer.volume.value = -Infinity;
    memSynth.volume.value = -Infinity;
    gameHasStarted=false;
    gameHasEnded=true;
}

function setFinalScore(score){
    finalScore=score;
}

function draw(){ 
    if(gameHasStarted){
        gameEvent.start();
        startEvent.stop();
        AMSynth.volume.value = -Infinity;
        background(171,140,104);
        if(frameCount%160 == 0){
            skitterPlayer.start();
        }
        for(var i=0;i<numBugs;i++){
            bug[i].draw();
        }  
    }
    else if(gameHasEnded){
        background(158,30,30);
        stroke(255,255,255);
        fill(0,0,0);
        textSize(80);
        text("GAME OVER",715,200);
        textSize(40);
        text("Your Score: "+finalScore+"/"+numBugs,780,300);
    }
    else{
        startEvent.start();
        background(0,53,102);
        stroke(255,255,255);
        fill(0,0,0);
        textSize(80);
        text("BUG SQUISH",715,200);
        textSize(20);
        fill(255,255,255);
        text("Created By Gabriel Votaw",1650,900);
        fill(50,50,50);
        rect(845,400,200,60);
        fill(0,0,0);
        textSize(40);
        text("START",875,445);
        if(mouseIsPressed && mouseX>=845 && mouseX<=1045 && mouseY>=400 && mouseY<=460){
            gameHasStarted=true;
        }
    }
  

  
    
}

function Bug(x,y,Direction){
    this.spriteSheet=loadImage("bug.png");//600x350 sprites
    this.x=x;
    this.y=y;
    this.frame=0;
    this.direction=Direction;
    this.moving=1;
    this.dead=0;
    score=0;
    speed=8;
    strokeColor = "white";
    var timer=30;
    

    this.draw=function(){  
        if(timer==0){
            endGame();
            setFinalScore(score);
        }
        if(timer==15){
            strokeColor = "yellow";
            note1 = "C3";
            note2 = "G3";
            note3 = "A3";
        }
        if(timer==5){
            strokeColor = "red";
            note1 = "C4";
            note2 = "G4";
            note3 = "A3";
        }
        textSize(40);
        fill("black");
        text("Score: " + score,1700,50);
        textSize(80);
        stroke(strokeColor);
        text(timer,width/2-20,100);
        if(frameCount%60==0){
            timer--;
        }

        push();
        translate(this.x,this.y);
        rotate(this.direction);
        scale(0.2,0.2);
        if(this.dead==1){
            image(this.spriteSheet,0,0,600,350,0,400,600,350);
        }
        else{
            if(this.frame==0){
                image(this.spriteSheet,0,0,600,350,0,0,600,350);
            }
            if(this.frame==1){
                image(this.spriteSheet,0,0,600,350,600,0,600,350);
            }
            if(this.frame==2){
                image(this.spriteSheet,0,0,600,350,1200,0,600,350);
            }
            if(frameCount%3==0){
                speed = speed + 0.0002;
                this.frame=(this.frame+1)%3;
                if(this.direction==right){
                    this.x=this.x+(speed*this.moving);
                }
                if(this.direction==rightDown){
                    this.x=this.x+(speed*this.moving);
                    this.y=this.y+(speed*this.moving);
                }
                if(this.direction==down){
                    this.y=this.y+(speed*this.moving);
                }
                if(this.direction==leftDown){
                    this.x=this.x-(speed*this.moving);
                    this.y=this.y+(speed*this.moving);
                }
                if(this.direction==left){
                    this.x=this.x-(speed*this.moving);
                }
                if(this.direction==leftUp){
                    this.x=this.x-(speed*this.moving);
                    this.y=this.y-(speed*this.moving);
                }
                if(this.direction==up){
                    this.y=this.y-(speed*this.moving);
                }
                if(this.direction==rightUp){
                    this.x=this.x+(speed*this.moving);
                    this.y=this.y-(speed*this.moving);
                }
                if(this.x<60){
                    this.direction=random([rightUp,right,rightDown]);
                }
                if(this.x>width-60){
                    this.direction=random([leftUp,left,leftDown]);
                }
                if(this.y<60){
                    this.direction=random([rightDown,down,leftDown]);
                }
                if(this.y>height-60){
                    this.direction=random([rightUp,up,leftUp]);
                }
            }
        }
        pop();

        this.kill=function(x,y){
            if(this.x-60<x && x<this.x+40 && this.y-40<y && y<this.y+40 && this.dead==0 && !gameHasEnded){
                this.moving=0;
                this.dead=1;
                score++;
                squishPlayer.start();
            }
        }
    }
}