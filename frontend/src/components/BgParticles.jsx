import { useEffect, useRef } from 'react'

export default function BgParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const parts = Array.from({length:60}, () => ({
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      r: 0.5+Math.random()*1.5,
      vx: (Math.random()-0.5)*0.2,
      vy: (Math.random()-0.5)*0.2,
      a: 0.1+Math.random()*0.3
    }))

    let animId
    const frame = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      parts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy
        if(p.x<0) p.x=canvas.width; if(p.x>canvas.width) p.x=0
        if(p.y<0) p.y=canvas.height; if(p.y>canvas.height) p.y=0
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(0,200,255,${p.a})`; ctx.fill()
      })
      animId = requestAnimationFrame(frame)
    }
    animId = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0,opacity:0.3}} />
}
