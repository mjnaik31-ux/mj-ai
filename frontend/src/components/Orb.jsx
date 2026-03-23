import { useEffect, useRef } from 'react'

const PALETTE = [
  {r:0,g:200,b:255},{r:124,g:58,b:255},{r:255,g:61,b:160},
  {r:0,g:229,b:192},{r:80,g:120,b:255},{r:200,g:80,b:255}
]

function lerpColor(a,b,f){ return {r:a.r+(b.r-a.r)*f,g:a.g+(b.g-a.g)*f,b:a.b+(b.b-a.b)*f} }
function sampleColor(pos){ pos=((pos%1)+1)%1; const idx=pos*PALETTE.length,i=Math.floor(idx)%PALETTE.length; return lerpColor(PALETTE[i],PALETTE[(i+1)%PALETTE.length],idx-Math.floor(idx)) }
function toRgba(c,a){ return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${a})` }

export default function Orb({ isListening, isSpeaking }) {
  const canvasRef = useRef(null)
  const stateRef  = useRef({ isListening, isSpeaking })

  useEffect(() => { stateRef.current = { isListening, isSpeaking } }, [isListening, isSpeaking])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap   = canvas.parentElement
    const ctx    = canvas.getContext('2d')

    const resize = () => { canvas.width = wrap.offsetWidth; canvas.height = wrap.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    let orbT=0, orbMX=0, orbMY=0, orbInside=false
    let orbSX=canvas.width/2, orbSY=canvas.height/2
    let orbEnergy=0, orbPull=0
    const orbTrail=[], orbRipples=[], orbSparks=[]
    let animId

    const OW=()=>canvas.width, OH=()=>canvas.height
    const OCX=()=>OW()/2, OCY=()=>OH()/2

    canvas.addEventListener('mousemove', e => { const r=canvas.getBoundingClientRect(); orbMX=e.clientX-r.left; orbMY=e.clientY-r.top; orbInside=true })
    canvas.addEventListener('mouseleave', () => { orbInside=false })
    canvas.addEventListener('click', () => { if(window.toggleMic) window.toggleMic() })

    const frame = () => {
      const { isListening, isSpeaking } = stateRef.current
      orbT += 0.016
      const tSX=orbInside?orbMX:OCX(), tSY=orbInside?orbMY:OCY()
      orbSX+=(tSX-orbSX)*0.1; orbSY+=(tSY-orbSY)*0.1

      const R=Math.min(OW(),OH())*0.42
      const dx=orbSX-OCX(), dy=orbSY-OCY()
      const dist=Math.sqrt(dx*dx+dy*dy)
      const tE=orbInside?Math.min(dist/60,1):(isListening?0.6:isSpeaking?0.8:0)
      orbEnergy+=(tE-orbEnergy)*0.05
      const tP=orbInside?Math.min(dist/(R*2),1):0
      orbPull+=(tP-orbPull)*0.06

      if(orbInside) orbTrail.push({x:orbSX,y:orbSY,life:1,color:sampleColor(orbT*0.1)})
      if(orbTrail.length>20) orbTrail.shift()
      for(let i=orbTrail.length-1;i>=0;i--){ orbTrail[i].life-=0.05; if(orbTrail[i].life<=0) orbTrail.splice(i,1) }

      for(let i=orbRipples.length-1;i>=0;i--){ const rp=orbRipples[i]; rp.r+=(rp.maxR-rp.r)*0.06; rp.life-=0.02; if(rp.life<=0) orbRipples.splice(i,1) }

      if(isListening&&Math.random()<0.3){ const ang=Math.random()*Math.PI*2,spd=1+Math.random()*3; orbSparks.push({x:OCX(),y:OCY(),vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,life:1,size:1+Math.random()*2.5,color:sampleColor(Math.random())}) }
      for(let i=orbSparks.length-1;i>=0;i--){ const s=orbSparks[i]; s.x+=s.vx; s.y+=s.vy; s.vx*=0.95; s.vy*=0.95; s.life-=0.025; if(s.life<=0) orbSparks.splice(i,1) }

      ctx.clearRect(0,0,OW(),OH())

      // BG
      const c1=sampleColor(orbT*0.04),c2=sampleColor(orbT*0.04+0.5)
      const gr=ctx.createRadialGradient(OCX(),OCY(),0,OCX(),OCY(),R*1.5)
      gr.addColorStop(0,toRgba(c1,0.10+orbEnergy*0.10)); gr.addColorStop(1,toRgba(c2,0))
      ctx.fillStyle=gr; ctx.fillRect(0,0,OW(),OH())
      ;[1.4,1.25,1.12].forEach((sc,i)=>{ const pulse=0.3+0.3*Math.sin(orbT*0.8+i*1.2); const c=sampleColor(orbT*0.05+i*0.25); ctx.beginPath(); ctx.arc(OCX(),OCY(),R*sc,0,Math.PI*2); ctx.strokeStyle=toRgba(c,(0.06+orbEnergy*0.08)*pulse); ctx.lineWidth=1; ctx.stroke() })

      // Ripples
      orbRipples.forEach(rp=>{ ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2); ctx.strokeStyle=toRgba(rp.color,rp.life*0.35); ctx.lineWidth=1.5*rp.life; ctx.stroke() })

      // Trail
      orbTrail.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,3*p.life,0,Math.PI*2); ctx.fillStyle=toRgba(p.color,p.life*0.45); ctx.fill() })

      // Sparks
      orbSparks.forEach(s=>{ ctx.beginPath(); ctx.arc(s.x,s.y,s.size*s.life,0,Math.PI*2); ctx.fillStyle=toRgba(s.color,s.life*0.8); ctx.fill() })

      // Shape
      const dX=dx*orbPull*0.15, dY=dy*orbPull*0.15
      const mAng=Math.atan2(dy,dx)
      for(let wi=0;wi<5;wi++){
        const wT=orbT*0.6+wi*(Math.PI*2/5), wR=R*(0.60+0.30*(wi/5))
        const c=sampleColor((orbT*0.05+wi*0.2)%1), alpha=0.55-wi*0.07
        ctx.beginPath()
        for(let i=0;i<=200;i++){
          const a=(i/200)*Math.PI*2; let r=wR
          r+=Math.sin(a*3+wT)*R*0.10; r+=Math.sin(a*5-wT*1.3)*R*0.06
          r+=Math.sin(a*7+wT*0.7)*R*0.04; r+=Math.sin(a*2-wT*0.5)*R*0.05
          if(isListening) r+=Math.sin(orbT*8+a*2)*R*0.06*orbEnergy
          if(isSpeaking)  r+=Math.sin(orbT*12+a*3)*R*0.08*orbEnergy
          if(orbInside){ const prox=Math.max(0,Math.cos(a-mAng)); r+=prox*orbPull*R*(0.10+orbEnergy*0.15) }
          const px=OCX()+dX+Math.cos(a)*r, py=OCY()+dY+Math.sin(a)*r
          i===0?ctx.moveTo(px,py):ctx.lineTo(px,py)
        }
        ctx.closePath()
        const gx=OCX()+dX, gy=OCY()+dY
        const grd=ctx.createRadialGradient(gx,gy,R*0.1,gx,gy,wR*1.15)
        grd.addColorStop(0,toRgba(c,alpha*0.6)); grd.addColorStop(0.5,toRgba(c,alpha)); grd.addColorStop(1,toRgba(c,0))
        ctx.fillStyle=grd; ctx.fill()
      }
      for(let b=0;b<3;b++){
        const bT=orbT*0.4+b*1.3, bc=sampleColor((orbT*0.06+b*0.33)%1)
        ctx.beginPath()
        for(let i=0;i<=220;i++){
          const a=(i/220)*Math.PI*2; let r=R*(0.70+b*0.07)
          r+=Math.sin(a*4+bT)*R*0.12; r+=Math.sin(a*6-bT*1.2)*R*0.07; r+=Math.sin(a*2+bT*0.4)*R*0.05
          if(orbInside){ const prox=Math.max(0,Math.cos(a-mAng)); r+=prox*orbPull*R*(0.07+orbEnergy*0.10) }
          const px=OCX()+dX+Math.cos(a)*r, py=OCY()+dY+Math.sin(a)*r
          i===0?ctx.moveTo(px,py):ctx.lineTo(px,py)
        }
        ctx.closePath(); ctx.strokeStyle=toRgba(bc,0.5+orbEnergy*0.25); ctx.lineWidth=1.5+orbEnergy*1.5; ctx.stroke()
      }
      const gc=sampleColor((orbT*0.07)%1), gc2=sampleColor((orbT*0.07+0.4)%1)
      const gx2=OCX()+dX, gy2=OCY()+dY
      const igr=ctx.createRadialGradient(gx2,gy2,0,gx2,gy2,R*0.75)
      igr.addColorStop(0,toRgba(gc,0.4+orbEnergy*0.25)); igr.addColorStop(0.45,toRgba(gc2,0.2)); igr.addColorStop(1,toRgba(gc,0))
      ctx.beginPath(); ctx.arc(gx2,gy2,R*0.75,0,Math.PI*2); ctx.fillStyle=igr; ctx.fill()
      for(let j=0;j<3;j++){
        const sa=orbT*0.5+j*(Math.PI*2/3)
        const sx=OCX()+dX+Math.cos(sa)*R*0.3, sy=OCY()+dY+Math.sin(sa)*R*0.3
        const sc2=sampleColor((orbT*0.08+j*0.3)%1)
        const sgr=ctx.createRadialGradient(sx,sy,0,sx,sy,R*0.38)
        sgr.addColorStop(0,toRgba(sc2,0.3+orbEnergy*0.15)); sgr.addColorStop(1,toRgba(sc2,0))
        ctx.beginPath(); ctx.arc(sx,sy,R*0.38,0,Math.PI*2); ctx.fillStyle=sgr; ctx.fill()
      }
      // Highlight
      const hx=OCX()+dX-R*0.2, hy=OCY()+dY-R*0.25
      const hgr=ctx.createRadialGradient(hx,hy,0,hx,hy,R*0.4)
      hgr.addColorStop(0,'rgba(255,255,255,0.16)'); hgr.addColorStop(1,'rgba(255,255,255,0)')
      ctx.beginPath(); ctx.arc(hx,hy,R*0.4,0,Math.PI*2); ctx.fillStyle=hgr; ctx.fill()

      // Beam
      if(orbInside&&orbPull>0.05&&Math.sqrt(dx*dx+dy*dy)>R*0.85){
        const bc=sampleColor(orbT*0.09), tdx=OCX()-orbSX, tdy=OCY()-orbSY
        for(let i=0;i<12;i++){
          const f=i/12,nf=(i+1)/12
          const ox=orbSX+tdx*f+Math.sin(orbT*4+i*0.8)*8*(1-f)*orbPull
          const oy=orbSY+tdy*f+Math.cos(orbT*3+i*0.9)*8*(1-f)*orbPull
          const nx=orbSX+tdx*nf+Math.sin(orbT*4+(i+1)*0.8)*8*(1-nf)*orbPull
          const ny=orbSY+tdy*nf+Math.cos(orbT*3+(i+1)*0.9)*8*(1-nf)*orbPull
          ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(nx,ny)
          ctx.strokeStyle=toRgba(bc,orbPull*0.35*(1-f)); ctx.lineWidth=1.5*(1-f); ctx.stroke()
        }
      }

      animId = requestAnimationFrame(frame)
    }

    animId = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}} />
}
