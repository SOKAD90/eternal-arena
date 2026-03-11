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

if(gameOver && e.key===" "){
restartGame()
}

})

document.addEventListener("keyup",e=>{
keys[e.key.toLowerCase()]=false
})

function restartGame(){

points=0
level=1
goldEvent=false

gameOver=false
gameStart=true

enemies=[]
collectibles=[]

player.x=W/2
player.y=H*0.7
player.fx=0
player.fy=0

spawnCollectible()

}

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
ctx.arc(this.x,this.y,this.r+3,0,Math.PI*2)
ctx.fill()

ctx.drawImage(img,this.x-27,this.y-27,55,55)
}
}

class Enemy extends ObjectBase{

constructor(x,y,fx,fy,r){
super(x,y,fx,fy,r)
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
ctx.arc(this.x,this.y,this.r+3,0,Math.PI*2)
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

if(goldEvent) return

let r=Math.random()*15+15

let x=Math.random()*W
let y=Math.random()*H

let fx=(Math.random()-0.5)*2
let fy=(Math.random()-0.5)*2

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

function update(){

if(!gameStart || gameOver) return

player.update()

collectibles.forEach(c=>{

if(collide(player,c)){

points++

let isGold = (points%goldscore===0)

if(isGold){

goldEvent=true
level++

enemies=[]

crowdShort.play()

}else{

goldEvent=false
spawnEnemy()

crowd.play()

}

collectibles.splice(collectibles.indexOf(c),1)

spawnCollectible()
}
})

enemies.forEach(e=>e.update())

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
ctx.fillText("Press SPACE to restart",W/2-140,H/2+180)

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
