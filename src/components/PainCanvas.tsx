'use client'
import { useRef, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

import type { ClientToServerEvents } from '@/libs/wss/events/client-to-server'
import type { ServerToClientEvents } from '@/libs/wss/events/server-to-client'
import { env } from '@/env.mjs'

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

async function getSocketConnection() {
  socket = io(env.NEXT_PUBLIC_WSS_URL) // KEEP AS IS
}

function PainCanvas() {
  const userIdRef = useRef<string>(Math.random().toString())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const getCurrentCanvasData = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const data = canvas.toDataURL()
    return data
  }

  const loadCanvasData = (data: string) => {
    const img = new Image()
    img.onload = () => {
      const context = canvasRef.current?.getContext('2d')
      context?.drawImage(img, 0, 0)
    }
    img.src = data
  }

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

  useEffect(() => {
    getSocketConnection().then(() => {
      socket.on('connect', () => {
        socket.on('CanvasResponse', async (payload) => {
          const { dataURL } = payload
          loadCanvasData(dataURL)
        })
        socket.emit('CanvasJoin', {
          userId: userIdRef.current,
        })
      })
    })
    return () => {
      socket.disconnect()
      socket.off('connect')
    }
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

    const data = getCurrentCanvasData()
    if (data) {
      socket.emit('CanvasUpdate', { dataURL: data, userId: userIdRef.current })
    }
  }

  const saveDrawingToStorage = () => {
    const data = getCurrentCanvasData()
    if (data) {
      localStorage.setItem('drawing', data)
    }
  }

  const loadDrawingFromStorage = () => {
    const data = localStorage.getItem('drawing')
    if (!data) return
    loadCanvasData(data)
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
          onClick={saveDrawingToStorage}
        >
          SAVE !!
        </button>
        <button
          className="text-lg font-bold p-5 ring-2 ring-pink-500 rounded-lg bg-white"
          onClick={loadDrawingFromStorage}
        >
          LOAD !!
        </button>
      </div>
    </div>
  )
}

export default PainCanvas
