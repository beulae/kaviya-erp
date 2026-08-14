import * as React from 'react'
import { Eraser } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export interface SignaturePadProps {
  /** Current signature as a base64 PNG data URL, or empty when blank. */
  value?: string
  onChange: (dataUrl: string) => void
  className?: string
  error?: boolean
}

/**
 * Professional signing field — draws on an HTML canvas using the Pointer
 * Events API (covers mouse, touch and stylus alike, no jQuery / DOM
 * manipulation). Emits the signature as a base64 PNG data URL.
 */
export function SignaturePad({ value, onChange, className, error }: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isDrawing = React.useRef(false)
  const lastPoint = React.useRef<{ x: number; y: number } | null>(null)
  const hasStroke = React.useRef(false)

  const setupCanvas = React.useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ratio = window.devicePixelRatio || 1
    const { width } = container.getBoundingClientRect()
    const height = 180
    canvas.width = width * ratio
    canvas.height = height * ratio
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(ratio, ratio)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 2
      // Canvas doesn't resolve CSS custom properties directly — read the
      // computed value so the ink still matches the design system's
      // foreground token instead of a hard-coded color.
      const resolved = getComputedStyle(container).getPropertyValue('--color-foreground').trim()
      ctx.strokeStyle = resolved || '#1f2933'
    }
  }, [])

  React.useEffect(() => {
    setupCanvas()
    window.addEventListener('resize', setupCanvas)
    return () => window.removeEventListener('resize', setupCanvas)
  }, [setupCanvas])

  // Redraw an existing base64 value (e.g. restored form state) when it changes externally.
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !value) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      const ratio = window.devicePixelRatio || 1
      ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio)
      ctx.drawImage(img, 0, 0, canvas.width / ratio, canvas.height / ratio)
      hasStroke.current = true
    }
    img.src = value
    // Only re-draw on mount / explicit external reset — subsequent local
    // strokes update the canvas directly without going through this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    isDrawing.current = true
    lastPoint.current = getPoint(e)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !lastPoint.current) return
    const point = getPoint(e)
    ctx.beginPath()
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    lastPoint.current = point
    hasStroke.current = true
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (canvas) canvas.releasePointerCapture(e.pointerId)
    isDrawing.current = false
    lastPoint.current = null
    if (hasStroke.current && canvas) {
      onChange(canvas.toDataURL('image/png'))
    }
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const ratio = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio)
    hasStroke.current = false
    onChange('')
  }

  return (
    <div>
      <div
        ref={containerRef}
        className={cn(
          'overflow-hidden rounded-[var(--radius-md)] border bg-[var(--color-surface)]',
          error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]',
          className,
        )}
      >
        <canvas
          ref={canvasRef}
          className="block h-[180px] w-full touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          role="img"
          aria-label="Signature drawing area"
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-[var(--color-muted-foreground)]">Sign using your mouse, stylus or finger.</p>
        <Button type="button" variant="outline" size="sm" onClick={handleClear}>
          <Eraser className="h-4 w-4" /> Clear Signature
        </Button>
      </div>
    </div>
  )
}
