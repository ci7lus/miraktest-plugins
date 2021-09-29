import { Program, Service } from "../@types/plugin"
import { EPGSProgramRecord } from "./types"

export const convertProgramRecordToProgram = (
  record: EPGSProgramRecord,
  service?: Service
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
