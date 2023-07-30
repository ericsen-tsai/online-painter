/* eslint-disable no-unused-vars */

export type CanvasJoinPayload = {
  userId: string
}

export type CanvasUpdatePayload = {
  userId: string
  dataURL: string
}

export interface ClientToServerEvents {
  CanvasJoin: (payload: CanvasJoinPayload) => void
  CanvasUpdate: (payload: CanvasUpdatePayload) => void
}
