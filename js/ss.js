var prgs = [
'sz(1200,480)bg(0)frame(){clr()col(170)vl=(h/2)w2=(w/3)for(i,0,w2){col((cos(c*0.01+i*0.25)/2+0.5)*255)x=(i*3)y=(cy)line(x+cos(c*0.021+i*0.07)*vl,y+sin(c*0.021+i*0.11)*vl/3,x+sin(c*0.02+i*0.11)*vl/3,y+cos(c*0.02+i*0.15)*vl)}}',
'sz(360,360)frame(){clr()cr=(PI*2/3)t=(c/1000)p1=(sin(c*0.003)+1)for(i,0,85){rad=((c*10+i*5)%w)col(255-i*3)for(j,0,3){tlt=(c*0.01+i*p1*0.03)line(cos(t+tlt+cr*j)*rad+cx,sin(t+tlt+cr*j)*rad+cy,cos(t+tlt+cr*(j+1))*rad+cx,sin(t+tlt+cr*(j+1))*rad+cy)}}}',
'sz(480,320)bg(0)frame(){clr()col(170)vl=(80)w2=(w*2)phase=(0.0023)for(i,0,w2){rad=(w-i)x=(cos((i+c)*phase)*rad+cx)y=(sin((i+c)*phase)*rad+cy)line(x+cos(c*0.09+i*0.022)*vl,y+sin(c*0.11+i*0.015)*vl,x+sin(c*0.1+i*0.03)*vl,y+cos(c*0.13+i*0.02)*vl)}}',
'sz(540,300)bg(33,33,33)frame(){clear()for(i,0,w){x=(i)y=(nz(x*0.003,c*0.04)*h*3)col(200,255,abs(y/h)*255)rect(x,h,1,y)}}',
'sz(720,720)bg(0)frame(){clr()stroke()arc=((cos(c*0.01)+1)*w/3)for(i,0,100){r=((sin(c*0.02+i*0.03)+1)*w/2)rad=(cos(c*0.013+i*0.05)*PI2)x=(cos(rad)*r)y=(sin(rad)*r)col(0,r/2,255)oval(x+cx,y+cy,arc)}}',
'sz(1280,720)bg(0)frame(){clr()col(170)vl=(15)w2=(w*2)phase=(0.13)for(i,0,w2){rad=(w-i)x=(cos((i+c)*phase)*rad+cx)y=(sin((i+c)*phase)*rad+cy)line(x+cos(c*0.1+i*0.013)*vl,y+sin(c*0.14+i*0.02)*vl,x+sin(c*0.1+i*0.013)*vl,y+cos(c*0.14+i*0.02)*vl)}}',
'sz(720,360)frame(){clr()cr=(PI*2/3)t=(c/100)for(i,0,85){rad=(i*6)col(255-i*3)for(j,0,3){tlt=0.24*sin((c+i)*0.1)line(cos(t+tlt+cr*j)*rad+cx,sin(t+tlt+cr*j)*rad+cy,cos(t+tlt+cr*(j+1))*rad+cx,sin(t+tlt+cr*(j+1))*rad+cy)}}}',
'sz(720,360)frame(){clear()step=(6)for(i,0,70){col(255-i*3)stroke()oval(cx+cos(c*0.13+i+0.1)*step,cy+sin(c*0.1+i+0.13)*step,i*step)}}',
'sz(720,720)bg(255)frame(){clear()col(0)cw=(72)for(i,-1,12){for(j,-1,12){x=(cw*i+sin(c*0.013)*cw)y=(cw*j+cos(c*0.01)*cw)rect(x,y,cw/5,cw/5)rect(x,y,sin(c*0.023+i+j*10)*cw*2,cw/5)rect(x,y,cw/5,cos(c*0.05+i*sin(c*0.002)+j*8.3)*cw*2)}}}',
'sz(720,360)frame(){for(i,0,100){col(rnd(255),rnd(100,255),rnd(130,255))x=((c*3+i)%(w+300)-150)line(x+cos(c*0.037+i*0.055)*100,0,x+sin(c*0.013+i*0.037)*100,h)}}',
'sz(720,720)bg(0)frame(){stroke()for(i,0,100){r=rnd(w)rad=rnd(PI2)x=(cos(rad)*r)y=(sin(rad)*r)col(r)oval(x+cx,y+cy,100)}}',
'sz(720,360)frame(){for(i,0,127){col(rnd(255),rnd(255),rnd(255))x=rnd(-100,w+100)line(x,0,x+100,h)}}',
'size(720,360)frame(){clear()for(i,0,1027){col(0,195,230)x=(w/2)y=(h/2)line(cos(c*0.04+i*0.02)*w+x,sin(c*0.03+i*0.013)*h+y, cos(c*0.032+i*0.013)*w+x,sin(c*0.054+i*0.012)*h+y)}}',
'sz(1040,520)bg(0)frame(){clr()ww=(520)for(j,0,15){ox=((ww/2)*(j%5))oy=((ww/2)*floor(j/5))for(i,0,150){x=(cos(i*0.2+c*0.1)*ww/4)y=(sin(i*0.2+c*0.1)*ww/4)x2=(cos(i*0.2+c*0.11)*ww/6)y2=(sin(i*(0.4+j*0.025)+c*0.11)*ww/6)col(255)line(ox+x,y+oy,ox+x2,y2+oy)}}}',
'sz(1040,520)bg(0)frame(){cr=(PI*2/3)num=(90)num3=floor(num/3)cr2=(PI2/num)clr()ww=(130)for(j,0,15){ox=((ww*2)*(j%5))oy=((ww*2)*floor(j/5))for(i,0,num){x=(cos(i*cr2)*ww)y=(sin(i* cr2)*ww)inti=floor(i/num3)x2=(cos(cr*inti+c*0.11)*ww/1.5)y2=(sin(cr*inti+c*(0.1+j*0.002))*ww/1.5)x3=(cos(cr*(inti+1)+c*0.11)*ww/1.5)y3=(sin(cr*(inti+1)+c*(0.1+j*0.002))*ww/1.5)rate=((i%num3)/num3)a=interp(x3,x2,rate)b=interp(y3,y2,rate)col(255)line(ox+x,y+oy,ox+a,oy+b)}}}'
];


var canvasFull;
var ctxFull;

var winW;
var winH;

var ct;

var CENTI = {
    timer:0
};


CENTI.start = function(){
    if ( CENTI.timer ) cancelAnimationFrame(CENTI.timer);
    CENTI.timer = requestAnimationFrame(CENTI.onFrame);
} 

CENTI.onFrame = function(){
    CENTI.timer = requestAnimationFrame(CENTI.onFrame);
    ct.update();
    var w = ct.w;
    var h = ct.h;
    var numW = Math.ceil(winW/w) + 1;
    var numH = Math.ceil(winH/h);
    var sX = (winW - w * numW )/2;
    var sY = (winH - h * numH )/2;
    
    for ( var i=0; i<numW; i++ ) {
        for ( var j=0; j<numH; j++ ) {
            ctxFull.drawImage(ct.canvas, sX + i*w, sY + j*h, w, h);
        }
    }
    
    if ( ct.c>450 ) {
        var rand = Math.floor(Math.random()*prgs.length)
        CENTI.setSample(prgs[rand]);
    }
} 


CENTI.resizeCanvas = function() {
    canvasFull.width = window.innerWidth;
    canvasFull.height = window.innerHeight;
    winW = canvasFull.width;
    winH = canvasFull.height;   
}


CENTI.init = function(){
    
    var canvas = document.getElementById("canvas0");
    ct = new Centi();
    if ( !ct.init(canvas) ) {
        return;
    }

    canvasFull = document.getElementById("canvasFull");
    ctxFull = canvasFull.getContext("2d");
    window.addEventListener('resize', CENTI.resizeCanvas, false);
    CENTI.resizeCanvas();

    var rand = Math.floor(Math.random()*prgs.length);
    CENTI.setSample(prgs[rand]);
}

CENTI.run = function(tw){
    ct.reset();
    if ( ct.parse(tw) ) {
        CENTI.start();   
    } else {
        alert("unsuccess");   
    }
}

CENTI.setSample = function(str){
    CENTI.run(str);
}


window.onload = function(){
    CENTI.init();
};

