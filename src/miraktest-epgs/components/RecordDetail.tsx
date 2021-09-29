import dayjs from "dayjs"
import React, { useEffect } from "react"
import { Play } from "react-feather"
import { useRecoilState } from "recoil"
import { ContentPlayerPlayingContent, Service } from "../../@types/plugin"
import { AutoLinkedText } from "../../shared/AutoLinkedText"
import { EPGStationAPI } from "../api"
import { thumbnailFamily } from "../atom"
import { Genre, SubGenre } from "../constants"
import { convertProgramRecordToProgram } from "../convertion"
import { EPGSProgramRecord } from "../types"
import "dayjs/locale/ja"

dayjs.locale("ja")

export const RecordDetail: React.VFC<{
  api: EPGStationAPI
  record: EPGSProgramRecord
  services: Service[]
  setPlayingContent: React.Dispatch<
    React.SetStateAction<ContentPlayerPlayingContent | null>
  >
}> = ({ api, record, services, setPlayingContent }) => {
  const thumbnail = [...record.thumbnails].shift()
  const [thumbnailUrl, setThunbnailUrl] = useRecoilState(
    thumbnailFamily(thumbnail || 0)
  )

  const duration = (record.endAt - record.startAt) / 1000
  const service = services.find((service) => service.id === record.channelId)

  const genre1 = Genre[record.genre1]
  const subGenre1 = genre1 && SubGenre[record.genre1][record.subGenre1]
  const genre2 = Genre[record.genre2]
  const subGenre2 = genre2 && SubGenre[record.genre2][record.subGenre2]
  const genre3 = Genre[record.genre3]
  const subGenre3 = genre3 && SubGenre[record.genre3][record.subGenre3]

  useEffect(() => {
    if (thumbnailUrl) {
      return
    }
    setThunbnailUrl(null)
    const thumbnail = [...record.thumbnails].shift()
    if (!thumbnail) return
    api
      .getThumbnailUrl({ id: thumbnail })
      .then((url) => setThunbnailUrl(url))
      .catch(console.warn)
  }, [thumbnailUrl])

  return (
    <div className="flex flex-col items-start justify-around select-text leading-loose">
      {0 < record.thumbnails.length ? (
        <div
          className="w-full bg-gray-400 bg-center bg-cover"
          style={{
            aspectRatio: "16/9",
            backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
          }}
        ></div>
      ) : (
        <></>
      )}
      <div className="w-full p-4">
        {service ? (
          <h3 className="text-xl text-gray-600 mb-1">{service.name}</h3>
        ) : (
          <></>
        )}
        <h2 className="text-2xl mb-2">{record.name}</h2>
        <div className="text-xl mb-2">
          {`${dayjs(record.startAt).format("YYYY/MM/DD(ddd) HH:mm")} - ${dayjs(
            record.endAt
          ).format("HH:mm")} (${duration / 60}分間)`}
        </div>
        <div className="text-gray-600 leading-relaxed">
          {[
            [genre1, subGenre1],
            [genre2, subGenre2],
            [genre3, subGenre3],
          ]
            .filter(([genre]) => !!genre)
            .map(([genre, subGenre]) => (
              <p key={`${genre}${subGenre}`}>
                {genre}
                {subGenre && ` / ${subGenre}`}
              </p>
            ))}
        </div>
        <div className="w-full p-4 bg-gray-200 rounded-md my-2">
          <button
            type="button"
            className="bg-indigo-400 text-gray-100 rounded-md px-4 p-2 flex items-center justify-center space-x-2 focus:outline-none"
            onClick={() => {
              const playFile = record.videoFiles.find(
                (video) => video.type === "ts"
              )
              if (!playFile) {
                console.warn("tsが見つかりませんでした:", record)
                return
              }
              const url = api.getVideoUrl({ videoId: playFile.id })
              const program = convertProgramRecordToProgram(record, service)
              const payload = {
                contentType: "EPGStation",
                url,
                service,
                program,
              }
              setPlayingContent(payload)
            }}
          >
            <Play size={16} />
            <span>視聴</span>
          </button>
        </div>
        <div className="w-full bg-gray-200 whitespace-pre-wrap rounded-md p-4 md:my-2 text-sm leading-relaxed programDescription">
          <AutoLinkedText>
            {[record.description, record.extended]
              .filter((s) => !!s)
              .join("\n\n")}
          </AutoLinkedText>
        </div>
      </div>
    </div>
  )
}
