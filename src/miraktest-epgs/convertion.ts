import { Program, Service } from "../@types/plugin"
import { EPGSChannel, EPGSProgramRecord } from "./types"

export const convertProgramRecordToProgram = (
  record: EPGSProgramRecord,
  service?: EPGSChannel
): Program => {
  return {
    ...record,
    serviceId: service?.serviceId ?? -1,
    networkId: service?.networkId ?? -1,
    eventId: record.id,
    duration: record.endAt - record.startAt,
    isFree: true,
    extended: { 拡張情報: record.extended },
  }
}

export const convertChannelToService = (channel: EPGSChannel): Service => {
  return {
    ...channel,
    type: 1,
    channel: {
      type: channel.channelType as Exclude<
        Service["channel"],
        undefined
      >["type"],
      channel: channel.channel,
    },
  }
}
