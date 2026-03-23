import { useEffect, useRef } from 'react'

const PALETTE = [
  {r:0,g:200,b:255},{r:124,g:58,b:255},{r:255,g:61,b:160},{r:0,g:229,b:192}
]
function lerpColor(a,b,f){ return {r:a.r+(b.r-a.r)*f,g:a.g+(b.g-a.g)*f,b:a.b+(b.b-a.b)*f} }
function sampleColor(pos){ pos=((pos%1)+1)%1; const idx=pos*PALETTE.length,i=Math.floor(idx)%PALETTE.length; return lerpColor(PALETTE[i],PALETTE[(i+1)%PALETTE.length],idx-Math.floor(idx)) }
function toRgba(c,a){ return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${a})` }

export default function Cursor() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let mX = window.innerWidth/2, mY = window.innerHeight/2
    let smX = mX, smY = mY, cT = 0, animId

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', e => { mX = e.clientX; mY = e.clientY })

    const frame = () => {
      cT += 0.02
      smX += (mX - smX) * 0.12
      smY += (mY - smY) * 0.12
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const c = sampleColor(cT * 0.1)
      ctx.beginPath(); ctx.arc(smX, smY, 7, 0, Math.PI*2)
      ctx.strokeStyle = toRgba(c, 0.9); ctx.lineWidth = 1.5; ctx.stroke()
      ctx.beginPath(); ctx.arc(smX, smY, 2, 0, Math.PI*2)
      ctx.fillStyle = toRgba(c, 1); ctx.fill()
      animId = requestAnimationFrame(frame)
    }
    animId = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:9999}} />
}
