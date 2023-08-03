'use client'
import { useRef, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import throttle from 'lodash.throttle'
import { v4 as uuid } from 'uuid'
import { TwitterPicker } from 'react-color'

import type { ClientToServerEvents } from '@/libs/wss/events/client-to-server'
import type { ServerToClientEvents } from '@/libs/wss/events/server-to-client'
import { cn } from '@/utils'
import { env } from '@/env.mjs'
import LineWidthSelector from './LineWidthSelector'

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

async function getSocketConnection() {
  socket = io(env.NEXT_PUBLIC_WSS_URL)
}

const getCanvasData = (ele: HTMLCanvasElement | null) => {
  if (!ele) return
  const data = ele.toDataURL()
  return data
}

const loadCanvasData = (data: string, ele: HTMLCanvasElement | null) => {
  const img = new Image()
  img.onload = () => {
    const context = ele?.getContext('2d')
    context?.drawImage(img, 0, 0)
  }
  img.src = data
}

const DEFAULT_COLOR = '#000000'
const DEFAULT_LINE_WIDTH = 5

function PainCanvas() {
  const userIdRef = useRef<string>(uuid())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [isErasing, setIsErasing] = useState<boolean>(false)
  const [color, setColor] = useState<string>(DEFAULT_COLOR)
  const [lineWidth, setLineWidth] = useState<number>(DEFAULT_LINE_WIDTH)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 800
    canvas.height = 800

    const context = canvas.getContext('2d')
    if (!context) return
    context.scale(1, 1)
    context.lineCap = 'round'
    context.strokeStyle = DEFAULT_COLOR
    context.lineWidth = DEFAULT_LINE_WIDTH
    contextRef.current = context
  }, [])

  useEffect(() => {
    getSocketConnection().then(() => {
      socket.on('connect', () => {
        socket.on('CanvasResponse', async (payload) => {
          const { dataURL } = payload
          if (!dataURL) {
            const canvas = canvasRef.current
            const context = contextRef.current
            if (canvas && context) {
              context.clearRect(0, 0, canvas.width, canvas.height)
              return
            }
          }
          loadCanvasData(dataURL, canvasRef.current)
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
    const context = contextRef.current
    if (!context) return
    context.beginPath()
    context.moveTo(offsetX, offsetY)

    setIsDrawing(true)

    if (isErasing) {
      context.globalCompositeOperation = 'destination-out'
      context.lineWidth = 30
    } else {
      context.globalCompositeOperation = 'source-over'
      context.lineWidth = lineWidth
    }
  }

  const finishDrawing = () => {
    contextRef.current?.closePath()
    setIsDrawing(false)
  }

  const throttledEmitCanvas = throttle((data: string) => {
    socket.emit('CanvasUpdate', { dataURL: data, userId: userIdRef.current })
  }, 50)

  const draw = ({ nativeEvent }: { nativeEvent: MouseEvent }) => {
    if (!isDrawing) {
      return
    }
    const { offsetX, offsetY } = nativeEvent
    contextRef.current?.lineTo(offsetX, offsetY)
    contextRef.current?.stroke()

    const data = getCanvasData(canvasRef.current)
    if (data) {
      throttledEmitCanvas(data)
    }
  }

  // const saveDrawingToStorage = () => {
  //   const data = getCanvasData(canvasRef.current)
  //   if (data) {
  //     localStorage.setItem('drawing', data)
  //   }
  // }

  // const loadDrawingFromStorage = () => {
  //   const data = localStorage.getItem('drawing')
  //   if (!data) return
  //   loadCanvasData(data, canvasRef.current)
  // }

  return (
    <div className={cn('relative', isErasing ? 'cursor-eraser' : 'cursor-pen')}>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        ref={canvasRef}
        className="ring-4 ring-black h-[800px] w-[800px]"
      />
      {/* <div className="flex gap-5 absolute top-5 right-5">
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
      </div> */}
      <div className="flex absolute top-5 left-5 gap-3">
        <button
          className="text-lg font-bold p-5 ring-2 ring-pink-500 rounded-lg bg-white w-28"
          onClick={() => {
            setIsErasing((prev) => !prev)
          }}
        >
          {isErasing ? 'pen' : 'eraser'}
        </button>
        <button
          className="text-lg font-bold p-5 ring-2 ring-pink-500 rounded-lg bg-white w-28"
          onClick={() => {
            const canvas = canvasRef.current
            const context = contextRef.current
            if (canvas && context) {
              context.clearRect(0, 0, canvas.width, canvas.height)
              throttledEmitCanvas('')
            }
          }}
        >
          clear
        </button>
      </div>
      <TwitterPicker
        className="top-5 right-5 !ring-pink-500 !ring-2 !absolute !cursor-default"
        color={color}
        colors={[
          '#FF6900',
          '#FCB900',
          '#7BDCB5',
          '#00D084',
          '#8ED1FC',
          '#0693E3',
          '#ABB8C3',
          '#EB144C',
          '#F78DA7',
          '#000000',
        ]}
        onChangeComplete={(c) => {
          const canvas = canvasRef.current
          const context = canvas?.getContext('2d')
          if (context) context.strokeStyle = c.hex
          setColor(c.hex)
          setIsErasing(false)
        }}
        triangle="hide"
        width="50%"
      />
      <LineWidthSelector
        width={lineWidth}
        onChange={(w) => {
          const canvas = canvasRef.current
          const context = canvas?.getContext('2d')
          if (context) context.lineWidth = w
          setLineWidth(w)
        }}
        className="absolute bottom-5 right-5"
      />
    </div>
  )
}

export default PainCanvas
