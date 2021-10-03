import dayjs from "dayjs"
import { Program } from "../@types/plugin"
import { AnnictRESTAPI } from "./annictAPI"
import { SyobocalAPI } from "./syobocalAPI"
import { ARM, SayaDefinitionChannel } from "./types"

export const detectProgramInfo = async ({
  rest,
  channel,
  program,
  arm,
}: {
  rest: AnnictRESTAPI
  channel: SayaDefinitionChannel
  program?: Program
  arm: ARM[]
}): Promise<{
  annictId: number
  episode: {
    number: number
    title: string
    id?: number
  } | null
} | void> => {
  let startTime: dayjs.Dayjs
  let endTime: dayjs.Dayjs
  if (program?.startAt) {
    startTime = dayjs(program.startAt)
    endTime = dayjs(program.startAt + program.duration)
  } else {
    // 番組情報がない場合前後4時間を探索する
    startTime = dayjs().subtract(2, "hours").startOf("hour")
    endTime = dayjs().add(2, "hours").startOf("hour")
  }

  // しょぼいカレンダー
  if (channel.syobocalId) {
    const StTime = startTime.format("YYYYMMDD_HHmmss-")
    const lookup = await SyobocalAPI.ProgLookup({
      ChID: channel.syobocalId.toString(),
      StTime,
      Range: StTime + endTime.format("YYYYMMDD_HHmmss"),
      JOIN: ["SubTitles"],
    })
    const syobocalProgram = lookup.find(
      (sprogram) =>
        program?.startAt ||
        (dayjs().isAfter(sprogram.StTime) && dayjs().isBefore(sprogram.EdTime))
    )
    if (syobocalProgram) {
      /*const arm = await axios.get<{ annict_id?: number }>(
        "https://arm.kawaiioverflow.com/api/ids",
        {
          params: {
            service: "syobocal",
            id: syobocalProgram.TID,
          },
        }
      )*/
      const lookup = arm.find(
        (_arm) => _arm.syobocal_tid === syobocalProgram.TID
      )
      if (lookup?.annict_id) {
        return {
          annictId: lookup.annict_id,
          episode: {
            title: syobocalProgram.SubTitle,
            number: syobocalProgram.Count,
          },
        }
      }
    } else {
      console.warn("番組が見つかりませんでした")
    }
  }

  // Annict
  if (channel.annictId) {
    const programs = await rest.getMyPrograms({
      filter_channel_ids: [channel.annictId],
      filter_started_at_gt: startTime.format("YYYY/MM/DD HH:mm"),
      fields: [
        "work.id",
        "work.title",
        "work.no_episodes",
        "episode.id",
        "episode.title",
        "episode.number",
        "episode.number_text",
      ],
      sort_started_at: "asc",
      per_page: 1,
    })
    const program = programs.data.programs.splice(0).shift()
    if (program) {
      return {
        annictId: program.work.id,
        episode: program.episode,
      }
    }
  }
}
