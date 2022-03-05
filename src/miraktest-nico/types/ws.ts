export type NicoLiveWS =
  | NicoLiveWSRoom
  | NicoLiveWSPing
  | NicoLiveWSSeat
  | NicoLiveWSDisconnect

export type NicoLiveWSRoom = {
  type: "room"
  data: NicoLiveWSRoomData
}

interface NicoLiveWSRoomData {
  name: string
  messageServer: MessageServer
  threadId: string
  isFirst: boolean
  waybackkey: string
  vposBaseTime: string
}

interface MessageServer {
  uri: string
  type: string
}

export type NicoLiveWSPing = {
  type: "ping"
}

export type NicoLiveWSSeat = {
  type: "seat"
  data: {
    keepIntervalSec: number
  }
}

export type NicoLiveWSDisconnect = {
  type: "disconnect"
}
