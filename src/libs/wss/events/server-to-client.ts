/* eslint-disable no-unused-vars */
export type CanvasResponsePayload = {
  dataURL: string
}

export interface ServerToClientEvents {
  CanvasResponse: (payload: CanvasResponsePayload) => void
}
