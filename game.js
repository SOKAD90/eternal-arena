const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

canvas.width = 1300
canvas.height = 730

const W = canvas.width
const H = canvas.height

function resizeGame(){
const scale = Math.min(
window.innerWidth / canvas.width,
window.innerHeight / canvas.height
)

canvas.style.width = canvas.width * scale + "px"
canvas.style.height = canvas.height * scale + "px"
}

window.addEventListener("resize", resizeGame)
resizeGame()

let gameStart=false
let gameOver=false

let points=0
let level=1
let goldscore=40

let goldEvent=false

const ACC=0.6
const FRICTION=0.90

let MAX_SPEED=5

const keys={}

document.addEventListener("keydown",e=>{
keys[e.key.toLowerCase()]=true

if(!gameStart && e.key===" "){
gameStart=true
music.play()
}
})

document.addEventListener("keyup",e=>{
keys[e.key.toLowerCase()]=false
})

function img(src){
let i=new Image()
i.src="assets/"+src
return i
}

const bg=img("bakgrunn.png")
const titleImg=img("tittel.png")
const gameOverImg=img("game over.png")
const flag=img("flag.png")
const goldFlag=img("gold-flag.png")
const playerImg=img("player-icon.png")
const playerLeft=img("player-left-icon.png")
const enemyImg=img("fiende1-icon.png")
const enemyLeft=img("fiende1-left-icon.png")

const sword=new Audio("assets/sword_slash.mp3")
const crowd=new Audio("assets/crowd-20-seconds.mp3")
const crowdShort=new Audio("assets/crowd-brøl.mp3")
const music=new Audio("assets/Game-music.mp3")
music.loop=true

function ellipse(){

return{

cx:(W/20)+(W*0.9)/2,
cy:-(H/50)+H/2,
rx:(W*0.9)/2,
ry:H/2

}

}

class ObjectBase{

constructor(x,y,fx,fy,r){

this.x=x
this.y=y
this.fx=fx
this.fy=fy
this.r=r

}

}

class Player extends ObjectBase{

update(){

if(keys["w"]||keys["arrowup"])this.fy-=ACC
if(keys["s"]||keys["arrowdown"])this.fy+=ACC
if(keys["a"]||keys["arrowleft"])this.fx-=ACC
if(keys["d"]||keys["arrowright"])this.fx+=ACC

this.fx=Math.max(-MAX_SPEED,Math.min(MAX_SPEED,this.fx))
this.fy=Math.max(-MAX_SPEED,Math.min(MAX_SPEED,this.fy))

this.fx*=FRICTION
this.fy*=FRICTION

this.moveEllipse()

this.x+=this.fx
this.y+=this.fy

}

moveEllipse(){

const {cx,cy,rx,ry}=ellipse()

const v=((this.x-cx)**2)/(rx**2)+((this.y-cy)**2)/(ry**2)

if(v>=1){

let dx=(this.x-cx)/rx
let dy=(this.y-cy)/ry

let len=Math.sqrt(dx*dx+dy*dy)

let nx=dx/len
let ny=dy/len

let vn=this.fx*nx+this.fy*ny

this.fx-=vn*nx
this.fy-=vn*ny

this.x=cx+rx*nx
this.y=cy+ry*ny

}

}

draw(){

let img=this.fx>=0?playerImg:playerLeft

ctx.fillStyle="black"
ctx.beginPath()
ctx.arc(this.x,this.y,this.r+8,0,Math.PI*2)
ctx.fill()

ctx.drawImage(img,this.x-27,this.y-27,55,55)

}

}

class Enemy extends ObjectBase{

constructor(x,y,fx,fy,r){

super(x,y,fx,fy,r)
this.dead=false

}

update(){

const {cx,cy,rx,ry}=ellipse()

if(((this.x-cx)**2)/(rx**2)+((this.y-cy)**2)/(ry**2)>=1){

let dx=(this.x-cx)/rx
let dy=(this.y-cy)/ry

let len=Math.sqrt(dx*dx+dy*dy)

let nx=dx/len
let ny=dy/len

let vn=this.fx*nx+this.fy*ny

if(vn>0){

this.fx-=2*vn*nx
this.fy-=2*vn*ny

}

}

this.x+=this.fx*(level-((level-1)/2))
this.y+=this.fy*(level-((level-1)/2))

}

draw(){

let img=this.fx>=0?enemyImg:enemyLeft

ctx.fillStyle="black"
ctx.beginPath()
ctx.arc(this.x,this.y,this.r+6,0,Math.PI*2)
ctx.fill()

ctx.drawImage(img,this.x-this.r,this.y-this.r,this.r*2,this.r*2)

}

}

class Collectible extends ObjectBase{

draw(){

let f=(points!=0 && (points+1)%goldscore==0)?goldFlag:flag

ctx.strokeStyle="yellow"
ctx.lineWidth=3
ctx.beginPath()
ctx.arc(this.x,this.y,this.r,0,Math.PI*2)
ctx.stroke()

ctx.drawImage(f,this.x-7,this.y-47,50,50)

}

}

const player=new Player(W/2,H*0.7,0,0,20)

let enemies=[]
let collectibles=[]

function spawnEnemy(){

let r=Math.random()*15+15

let corner=Math.floor(Math.random()*4)

let x,y,fx,fy

if(corner===0){

x=r+200
y=r+100
fx=Math.random()
fy=Math.random()

}

else if(corner===1){

x=W-(r+200)
y=r+100
fx=-Math.random()
fy=Math.random()

}

else if(corner===2){

x=r+200
y=H-(r+100)
fx=Math.random()
fy=-Math.random()

}

else{

x=W-(r+200)
y=H-(r+100)
fx=-Math.random()
fy=-Math.random()

}

enemies.push(new Enemy(x,y,fx,fy,r))

}

function spawnCollectible(){

let r=25

let x=W*0.3+Math.random()*W*0.3
let y=H*0.2+Math.random()*H*0.6

collectibles.push(new Collectible(x,y,0,0,r))

}

spawnCollectible()

function dist(a,b){

let dx=a.x-b.x
let dy=a.y-b.y

return Math.sqrt(dx*dx+dy*dy)

}

function collide(a,b){

return dist(a,b)<=a.r+b.r

}

function enemyEnemyCollision(e1,e2){

if(!collide(e1,e2))return

sword.play()

let dx=e1.x-e2.x
let dy=e1.y-e2.y

let d=Math.sqrt(dx*dx+dy*dy)

if(d===0)return

let nx=dx/d
let ny=dy/d

let v1=e1.fx*nx+e1.fy*ny
let v2=e2.fx*nx+e2.fy*ny

let m1=Math.PI*e1.r*e1.r
let m2=Math.PI*e2.r*e2.r

let nv1=(v1*(m1-m2)+2*m2*v2)/(m1+m2)
let nv2=(v2*(m2-m1)+2*m1*v1)/(m1+m2)

e1.fx+=(nv1-v1)*nx
e1.fy+=(nv1-v1)*ny

e2.fx+=(nv2-v2)*nx
e2.fy+=(nv2-v2)*ny

}

function update(){

if(!gameStart || gameOver) return

player.update()

collectibles.forEach(c=>{

if(collide(player,c)){

points++

if((points+1)%goldscore===0){

goldEvent=true
level++
crowdShort.play()

}else{

spawnEnemy()
crowd.play()

}

collectibles.splice(collectibles.indexOf(c),1)
spawnCollectible()

}

})

enemies.forEach(e=>e.update())

for(let i=0;i<enemies.length;i++){

for(let j=i+1;j<enemies.length;j++){

enemyEnemyCollision(enemies[i],enemies[j])

}

}

enemies.forEach(e=>{

if(collide(player,e) && !goldEvent){

gameOver=true

}

})

}

function draw(){

ctx.drawImage(bg,0,0,W,H)

if(!gameStart){

ctx.drawImage(titleImg,W/2-300,H/2-150,600,300)

ctx.fillStyle="white"
ctx.font="30px Arial"
ctx.fillText("Press SPACE to start",W/2-140,H/2+200)

return
}

if(gameOver){

ctx.drawImage(gameOverImg,W/2-250,H/2-120,500,240)

ctx.fillStyle="white"
ctx.font="30px Arial"
ctx.fillText("Refresh page to restart",W/2-150,H/2+180)

return
}

player.draw()

collectibles.forEach(c=>c.draw())
enemies.forEach(e=>e.draw())

ctx.fillStyle="white"
ctx.font="40px Impact"
ctx.fillText("Score: "+points,40,50)
ctx.fillText("Level "+level,W-200,50)

}

function loop(){

update()
draw()

requestAnimationFrame(loop)

}

loop()
