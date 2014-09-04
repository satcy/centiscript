var prgs = [
'sz(1200,480)bg(0)frame(){clr()col(170)vl=(h/2)w2=(w/3)for(i,0,w2){col((cos(c*0.01+i*0.25)/2+0.5)*255)x=(i*3)y=(cy)line(x+cos(c*0.021+i*0.07)*vl,y+sin(c*0.021+i*0.11)*vl/3,x+sin(c*0.02+i*0.11)*vl/3,y+cos(c*0.02+i*0.15)*vl)}}'
,'sz(720,360)frame(){clr()cr=(PI*2/3)t=(c/1000)p1=(sin(c*0.003)+1)for(i,0,85){rad=((c*10+i*5)%h)col(255-i*3)for(j,0,3){tlt=(c*0.01+i*p1*0.03)line(cos(t+tlt+cr*j)*rad+cx,sin(t+tlt+cr*j)*rad+cy,cos(t+tlt+cr*(j+1))*rad+cx,sin(t+tlt+cr*(j+1))*rad+cy)}}}'
,'sz(640,320)bg(0)frame(){clr()col(170)vl=(80)w2=(w*2)phase=(0.0023)for(i,0,w2){rad=(w-i)x=(cos((i+c)*phase)*rad+cx)y=(sin((i+c)*phase)*rad+cy)line(x+cos(c*0.09+i*0.022)*vl,y+sin(c*0.11+i*0.015)*vl,x+sin(c*0.1+i*0.03)*vl,y+cos(c*0.13+i*0.02)*vl)}}'
,'sz(1200,300)bg(33,33,33)frame(){clear()for(i,0,w){x=(i)y=(nz(x*0.003,c*0.04)*h*3)col(200,255,abs(y/h)*255)rect(x,cy,1,y)}}'
,'sz(720,360)bg(0)frame(){clr()stroke()arc=((cos(c*0.01)+1)*w/3)for(i,0,100){r=((sin(c*0.02+i*0.03)+1)*w/2)rad=(cos(c*0.013+i*0.05)*PI2)x=(cos(rad)*r)y=(sin(rad)*r)col(0,r/2,255)oval(x+cx,y+cy,arc)}}'
,'sz(720,405)bg(0)frame(){clr()col(170)vl=(10)w2=(w*2)phase=(GOLD/10)for(i,0,w2){rad=(w-i)x=(cos((i+c)*phase)*rad+cx)y=(sin((i+c)*phase)*rad+cy)line(x+cos(c*0.1+i*0.013)*vl,y+sin(c*0.14+i*0.02)*vl,x+sin(c*0.1+i*0.013)*vl,y+cos(c*0.14+i*0.02)*vl)}}'
,'sz(720,360)frame(){clr()cr=(PI*2/3)t=(c/100)for(i,0,85){rad=(i*6)col(255-i*3)for(j,0,3){tlt=0.24*sin((c+i)*0.1)line(cos(t+tlt+cr*j)*rad+cx,sin(t+tlt+cr*j)*rad+cy,cos(t+tlt+cr*(j+1))*rad+cx,sin(t+tlt+cr*(j+1))*rad+cy)}}}'
,'sz(720,360)frame(){clear()step=(6)for(i,0,70){col(255-i*3)stroke()oval(cx+cos(c*0.13+i+0.1)*step,cy+sin(c*0.1+i+0.13)*step,i*step)}}'
,'sz(360,360)bg(0)frame(){clr()col(255)cw=(36)for(i,-1,12){for(j,-1,12){x=(cw*i+sin(c*0.0013)*cw)y=(cw*j+cos(c*0.003)*cw)rect(x,y,1,1)rect(x,y,sin(c*0.033+i*0.1+j*3)*cw,1)rect(x,y,1,cos(c*0.05+i*sin(c*0.01)+j*8.3)*cw)}}}'
,'sz(720,360)frame(){for(i,0,100){col(rnd(255),rnd(100,255),rnd(130,255))x=((c*3+i)%(w+300)-150)line(x+cos(c*0.037+i*0.055)*100,0,x+sin(c*0.013+i*0.037)*100,h)}}'
,'sz(1720,720)frame(){num=(50)for(j,0,5){for(i,0,num){r=((nz(i*0.1,c*0.003)+1)*w/3)rad=((PI2/num)*i+c/283)x=(cos(rad)*r)y=(sin(rad)*r)r=((nz(((i+1)%num)*0.1,c*0.003)+1)*w/3)rad=((PI2/num)*(i+1)+c/283)x2=(cos(rad)*r)y2=(sin(rad)*r)col((c*0.25)%255)line(x+cx,y+cy,x2+cx,y2+cy)}c++}c--}'
,'sz(720,360)frame(){for(i,0,127){col(rnd(255),rnd(255),rnd(255))x=rnd(-100,w+100)line(x,0,x+100,h)}}'
,'size(720,360)frame(){clear()for(i,0,1027){col(0,195,230)x=(w/2)y=(h/2)line(cos(c*0.04+i*0.02)*w+x,sin(c*0.03+i*0.013)*h+y, cos(c*0.032+i*0.013)*w+x,sin(c*0.054+i*0.012)*h+y)}}'
,'sz(1040,520)bg(0)frame(){clr()ww=(520)for(j,0,15){ox=((ww/2)*(j%5))oy=((ww/2)*floor(j/5))for(i,0,150){x=(cos(i*0.2+c*0.1)*ww/4)y=(sin(i*0.2+c*0.1)*ww/4)x2=(cos(i*0.2+c*0.11)*ww/6)y2=(sin(i*(0.4+j*0.025)+c*0.11)*ww/6)col(255)line(ox+x,y+oy,ox+x2,y2+oy)}}}'
,'sz(1040,520)bg(0)frame(){cr=(PI*2/3)num=(90)num3=floor(num/3)cr2=(PI2/num)clr()ww=(130)for(j,0,15){ox=((ww*2)*(j%5))oy=((ww*2)*floor(j/5))for(i,0,num){x=(cos(i*cr2)*ww)y=(sin(i* cr2)*ww)inti=floor(i/num3)x2=(cos(cr*inti+c*0.11)*ww/1.5)y2=(sin(cr*inti+c*(0.1+j*0.002))*ww/1.5)x3=(cos(cr*(inti+1)+c*0.11)*ww/1.5)y3=(sin(cr*(inti+1)+c*(0.1+j*0.002))*ww/1.5)rate=((i%num3)/num3)a=interp(x3,x2,rate)b=interp(y3,y2,rate)col(255)line(ox+x,y+oy,ox+a,oy+b)}}}'
,'sz(270*3,270)bg(0)frame(){clear()ww=(h)for(j,0,3){step=(abs(nz(j,c*0.0031))*0.3+0.001)freq=(nz(3,j,c*0.013)*0.007)for(i,0,3333){rad=(sin(i*freq)*ww/4+ww/4)x=(cos(i*step+c*0.1)*rad+j*ww+ww/2)y=(sin(i*step+c*0.1)*rad+cy)col(255)rect(x,y,1,1)}}}'
,'sz(720,270)bg(0)frame(){clr()num=(w/3)for(i,0,num){ww=(cos(i*0.03+c*0.013)*w/2)hh=(30)push()translate(i*3,cy)rotate(nz(i*0.0015,c*0.002)*60)col(0)fill()rect(-ww/2,-hh/2,ww,hh)col(205,(sin(i*0.06+c*0.03)+1)*128,255)strk()rect(-ww/2,-hh/2,ww,hh)pop()}}'
,'sz(1280,720)frame(){clr()for(i,0,327){col((cos(c*0.1+i*0.01)+1)*128)x=(w/2)y=(h/2)line(cos(c*0.04+i*0.003)*x+x,sin(c*0.03+i*0.013)*y+y,cos(c*0.032+i*0.013)*x+x,sin(c*0.054+i*0.012)*y+y)}}'
,'sz(720,270)bg(0)a=([])v=([])for(i,0,w){a[i]=(0)v[i]=(0)}frame(){clear()for(i,0,w){v[i]+=nz(i*0.004,c*0.01)a[i]+=(v[i])v[i]+=((0-a[i])*0.01)x=(i)y=(a[i])col(rnd(255),rnd(255),rnd(100,255))rect(x,y+h/2,1,y)}}'
,'sz(520,520)bg(0)frame(){clr()for(j,0,3){ox=((h/2)*j-h/2)for(i,0,100){x=(cos(i*0.2+c*0.1)*h/3+cx)y=(sin(i*0.2+c*0.13)*h/4+cy)x2=(cos(i*0.2+c*0.13)*h/4+cx)y2=(sin(i*0.2+c*0.1)*h/3+cy)col(255)line(ox+x,y,ox+x2,y2)}}}'
,'sz(720,270)bg(0)frame(){clr()numX=(40)numY=(5)ww=(w/numX)hh=(h/numY)col(255)for(a,0,numX){for(b,0,numY){ox=(a*ww)oy=(b*hh)for(i,0,2){x=((cos(c*(0.0617+a*0.001+b*0.00833)+i*(a*0.173+b*0.123))*0.5+0.5)*ww)line(ox+x,oy+0,ox+x,oy+hh)}}}}'
,'sz(720,360)s=([])for(j,0,10){s[j]=(3-j*0.3)}frame(){num=(50)sortNum(s)reverse(s)for(j,0,10){push()translate(cx,cy)sc=(s[j])scale(sc,sc)s[j]+=(0.01)s[j]=(s[j]%3)beginShape()for(i,0,num){r=((nz(i*0.19,c*0.0008,sc*0.3)+1)*w/3)rad=((PI2/num)*i)x=(cos(rad)*r)y=(sin(rad)*r)col((sin(c*0.0055+sc)+1)*127,100,(cos(c*0.0025+sc*2)+1)*127)lineTo(x,y)}endShape()pop()c++}c--}'
,'sz(720,360)frame(){drawMe(0,0,w,h,0,-2,w,h)num=(50)cw=(w/(num-1))for(j,0,100){push()translate(0,5*j)col((cos(c*0.01+j*0.03)+1)*127,150,(sin(c*0.011+j*0.01)+1)*127)fill()beginShape()lineTo(0,h)for(i,0,num){x=(i*cw)y=((nz(j*0.1,i*0.03,c*0.01)-1)*h+nz(c*0.05,i*0.3,j)*h*0.05)lineTo(x,y+h)}lineTo(w,h)endShape()pop()push()translate(0,5*j)col(255)strk()beginShape()for(i,0,num){x=(i*cw)y=((nz(j*0.1,i*0.03,c*0.01)-1)*h+nz(c*0.05,i*0.3,j)*h*0.05)lineTo(x,y+h)}endShape()pop()}}'
,'sz(720,360)bg(0)frame(){clr()num=(50)cw=(w/num)for(i,0,num*1.5){ww=(w/3)hh=(h/3)x=(i*cw-w/4)y=(cy)push()translate(x,y)push()strk()n1=sin(c*0.015+1+i*0.07)n2=sin(c*0.03+3-i*0.1)transform(1,n1,-n2,1,0,0)fill()col(0)rect(-ww/2,-hh/2,ww,hh)strk()col((sin(c*0.02+(i)*0.01)+1)*127,(155),(cos(c*0.01+(i)*0.06)+1)*127)rect(-ww/2,-hh/2,ww,hh)pop()pop()}}'
,'sz(720,360)bg(0)NUM=(100)a=([])for(i,0,NUM){a[i]=vec2()a[i].x=rnd(w)a[i].y=rnd(h)a[i].px=(0)a[i].py=(0)a[i].r=rnd(5,20)}frame(){col(0,3)rect(0,0,w,h)for(i,0,NUM){a[i].px=(a[i].x)a[i].py=(a[i].y)x=(a[i].x)y=(a[i].y)for(j,0,NUM){if((i!=j)&&(dist(a[i],a[j])<a[i].r+a[j].r)){x-=((a[j].x-x)*0.05)y-=((a[j].y-y)*0.05)}}x+=(nz(x*0.01,i/10,c*0.01)*5)y+=(nz(i/10,y*0.01,c*0.01)*5)x+=((cx-x)*0.003)y+=((cy-y)*0.003)vx=(x-a[i].px)vy=(y-a[i].py)a[i].x+=(vx)a[i].y+=(vy)}for(i,0,NUM){col(i+155,205,(sin(c*0.01+i*0.1)+1)*128)oval(a[i].x,a[i].y,a[i].r)}}'
,'sz(720,720)bg(0)frame(){fill()col(0,15)rect(0,0,w,h)if(c%(15)==0){strk()num=(100)v1=([rnd(w),rnd(h),rnd(w),rnd(h),rnd(w),rnd(h),rnd(w),rnd(h)])v2=([rnd(w),rnd(h),rnd(w),rnd(h),rnd(w),rnd(h),rnd(w),rnd(h)])a=curves(num,v1)b=curves(num,v2)col(255)for(i,0,num){line(a[i*2],a[i*2+1],b[i*2],b[i*2+1])}col(255,0,0)curve(v1)col(255,255,0)curve(v2)col(0,255,255)for(i,0,3){line(v1[i*2],v1[i*2+1],v1[i*2+2],v1[i*2+3])line(v2[i*2],v2[i*2+1],v2[i*2+2],v2[i*2+3])}}}'
,'sz(720,720)N1=(1000)N2=(50)a=([])b=([])for(i,0,N1){a[i]=vec2()a[i].x=rnd(w)a[i].y=rnd(h)}for(i,0,N2){b[i]=vec2()b[i].x=rnd(w)b[i].y=rnd(h)}tree(a)frame(){clr()for(i,0,N2){x=(b[i].x)y=(b[i].y)aa=nears(b[i],8,1600)nn=(aa.length)for(j,0,nn){p=(aa[j][0])d=(aa[j][1])if(d>0){col(255,170)line(x,y,p.x,p.y)oval(p.x,p.y,3)}}x+=(nz(x*0.02,y*0.023,i+c*0.03)*50)y+=(nz(y*0.01,x*0.03,i+c*0.02)*50)x=wrap(x,0,w)y=wrap(y,0,h)col(80,255,255,170)oval(x,y,7)b[i].x=(x)b[i].y=(y)}}'
,'sz(720,405)bg(0)lw(2)NUM=(150)a=([])for(i,0,NUM){a[i]=vec2()a[i].x=rnd(w)a[i].y=rnd(h)a[i].px=(0)a[i].py=(0)a[i].r=rnd(5,20)}frame(){clr()tree(a)for(i,0,NUM){a[i].px=(a[i].x)a[i].py=(a[i].y)x=(a[i].x)y=(a[i].y)b=nears(a[i],10,1600)nn=(b.length)for(j,0,nn){p=(b[j][0])d=sqrt(b[j][1])if((d>0)){x-=((p.x-x)*0.1)y-=((p.y-y)*0.1)col(255)line(x,y,p.x,p.y)}}x+=(nz(x*0.004,y*0.003,c*0.02)*6)y+=(nz(y*0.002,x*0.003,c*0.03)*6)x+=((cx-x)*0.002)y+=((cy-y)*0.002)vx=(x-a[i].px)vy=(y-a[i].py)a[i].x+=(vx)a[i].y+=(vy)col(nn*70,255,(sin(c*0.07+x*0.01)+1)*128,180)oval(a[i].x,a[i].y,a[i].r)}}'
,'sz(560,560)bg(0)GOLDEN=((1+sqrt(5))/2)RAD=((360/(1+GOLDEN))/180*PI)frame(){clr()a=floor((cos(c*0.01)+1)*1500)for(i,0,a){col(255,(i/3)%(255),(i/6)%(255))x=(cos(RAD*i)*i*0.1+cx)y=(sin(RAD*i)*i*0.1+cy)oval(x,y,i*0.001+1)}}'
,'sz(360,640)frame(){drawMe(0,0,w,h,0,-3,w,h)hh=(h/3)num=(50)cw=(w/(num-1))col((cos(c*0.02)+1)*127,50,(sin(c*0.011)+1)*127)fill()beginShape()lineTo(0,h)for(i,0,num){x=(i*cw)y=((nz(i*0.03,c*0.02)-1)*hh+nz(c*0.07,i*0.3)*hh*0.05)lineTo(x,y+h+hh)}lineTo(w,h)endShape()col(255)strk()beginShape()for(i,0,num){x=(i*cw)y=((nz(i*0.03,c*0.02)-1)*hh+nz(c*0.07,i*0.3)*hh*0.05)lineTo(x,y+h+hh)}endShape()}'
,'sz(720,405)bg(0)NUM=(70)a=([])for(i,0,NUM){a[i]=vec2(rnd(w),-rnd(h))a[i].vx=(0)a[i].vy=(0)a[i].r=rnd(8,30)}frame(){col(0,70)rect(0,0,w,h)tree(a)for(i,0,NUM){x=(a[i].x)y=(a[i].y)vx=(a[i].vx)vy=(a[i].vy)b=nears(a[i],10,3600)nn=(b.length)for(j,0,nn){p=(b[j][0])d=sqrt(b[j][1])if((d>0)&&(d<a[i].r+p.r)){vx-=((p.x-x)*0.05)vy-=((p.y-y)*0.05)}}if(y<cy){vy+=(1)}else{vy-=(1/3)}vx+=(nz(x*0.001,y*0.003,c*0.01))vy+=(nz(y*0.002,x*0.003,c*0.02))a[i].x+=(vx)a[i].y+=(vy)a[i].vx=(vx*0.9)a[i].vy=(vy*0.97)if((a[i].x<0)||(a[i].x>w)){a[i].x=rnd(w)}col(nn*33,235,205)oval(a[i].x,a[i].y,a[i].r)}}'
];


var canvasFull;
var ctxFull;

var winW;
var winH;

var ct;

var CENTI = {
    timer:0,
    posRate:0.001,
    frameCount:0
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
    var numW = Math.ceil(winW/w);
    if ( numW%2 == 0 ) numW ++;
    var numH = Math.ceil(winH/h);
    if ( numH%2 == 0 ) numH++;
    var sX = (winW - w * numW )/2;
    var sY = (winH - h * numH )/2;

    // for ( var i=0; i<numW; i++ ) {
    //     for ( var j=0; j<numH; j++ ) {
    //         ctxFull.drawImage(ct.canvas, sX + i*w, sY + j*h, w, h);
    //     }
    // }

    
    var yy = (winH - h)*(CENTI.posRate);
    var xx = (-sX/450)*(frameCount%450);
    for ( var i=0; i<numW; i++ ) {
            ctxFull.drawImage(ct.canvas, sX + i*w + xx, yy, w, h);
    }
    ctxFull.drawImage(canvasFull, 0, 0, winW, winH, 1, 0, winW, winH);
    ctxFull.drawImage(canvasFull, winW-1, 0, 1, winH, 0, 0, 1, winH);
    // if ( yy > 0 ) ctxFull.drawImage(canvasFull, 0, 0, winW, yy, 0, -1, winW, yy);
    // if ( yy + h < winH ) ctxFull.drawImage(canvasFull, 0, yy + h, winW, winH - (yy + h), 0, yy + h + 1, winW, winH - (yy + h));

    frameCount++;
    if ( frameCount%5000>450 ) {
        var rand = Math.floor(Math.random()*prgs.length);
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
    if ( !ct.init(canvas, getAudioContext()) ) {
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
    ct.c = Math.floor(Math.random()*99999999);
    frameCount = Math.floor(Math.random()*99999999);
    var offset = Math.floor(Math.random()*winW/3 + 5);
    ctxFull.drawImage(canvasFull, 0, 0, winW, winH, offset, 0, winW, winH);
    ctxFull.drawImage(canvasFull, 0, 0, 1, winH, 0, 0, offset, winH);
    if ( ct.parse(tw) ) {
        CENTI.start();
        CENTI.posRate = Math.random()*1.1 - 0.05;
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

