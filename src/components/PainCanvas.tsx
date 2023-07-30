'use client'
import { useRef, useState, useEffect } from 'react'

function PainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 600
    canvas.height = 600

    const context = canvas.getContext('2d')
    if (!context) return
    context.scale(1, 1)
    context.lineCap = 'round'
    context.strokeStyle = 'black'
    context.lineWidth = 5
    contextRef.current = context
  }, [])

  const startDrawing = ({ nativeEvent }: { nativeEvent: MouseEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    contextRef.current?.beginPath()
    contextRef.current?.moveTo(offsetX, offsetY)
    setIsDrawing(true)
  }

  const finishDrawing = () => {
    contextRef.current?.closePath()
    setIsDrawing(false)
  }

  const draw = ({ nativeEvent }: { nativeEvent: MouseEvent }) => {
    if (!isDrawing) {
      return
    }
    const { offsetX, offsetY } = nativeEvent
    contextRef.current?.lineTo(offsetX, offsetY)
    contextRef.current?.stroke()
  }

  const saveDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const data = canvas.toDataURL()
    localStorage.setItem('drawing', data)
  }

  const loadDrawing = () => {
    const data = localStorage.getItem('drawing')
    if (!data) return

    const img = new Image()
    img.onload = () => {
      const context = canvasRef.current?.getContext('2d')
      context?.drawImage(img, 0, 0)
    }
    img.src = data
  }

  return (
    <div className="relative">
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        ref={canvasRef}
        className="ring-4 ring-black h-[600px] w-[600px]"
      />
      <div className="flex gap-5 absolute top-5 right-5">
        <button
          className="text-lg font-bold p-5 ring-2 ring-pink-500 rounded-lg bg-white"
          onClick={saveDrawing}
        >
          SAVE !!
        </button>
        <button
          className="text-lg font-bold p-5 ring-2 ring-pink-500 rounded-lg bg-white"
          onClick={loadDrawing}
        >
          LOAD !!
        </button>
      </div>
    </div>
  )
}

export default PainCanvas
