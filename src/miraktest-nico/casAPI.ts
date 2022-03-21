import axios from "axios"
import { LiveProgram } from "./types/cas"
import { EmbeddedData } from "./types/embedded-data"

// https://github.com/SlashNephy/saya/blob/3dfd347a745dff751c8cdd17dc933943b73a1b0f/src/main/kotlin/blue/starry/saya/services/nicolive/LiveNicoliveCommentProvider.kt

export const casClient = axios.create({
  baseURL: "https://api.cas.nicovideo.jp/v2",
  headers: {
    "x-frontend-id": "89",
  },
})

export type CasMeta = {
  status: number
  totalCount?: number
  ssId: string
}

export type LivePrograms = {
  meta: CasMeta
  data?: LiveProgram[]
}

export const getLivePrograms = async ({
  searchWord,
}: {
  searchWord: string
}) => {
  return await casClient
    .get<LivePrograms>("/search/programs.json", {
      params: {
        liveStatus: "onair",
        sort: "startTime",
        limit: 20,
        searchWord,
        searchTargets: "tagsExact",
        order: "desc",
      },
    })
    .then((data) => data.data?.data ?? [])
}

export const getEmbeddedData = async ({ liveId }: { liveId: string }) => {
  const livePage = await axios.get<Document>(
    `https://live.nicovideo.jp/watch/${liveId}`,
    { responseType: "document" }
  )
  const embeddedDataDom = livePage.data.getElementById("embedded-data")
  if (!embeddedDataDom) {
    throw new Error("#embedded-data not found on " + liveId)
  }
  const data = embeddedDataDom.getAttribute("data-props")
  if (!data) {
    throw new Error("data-props not found on " + liveId)
  }
  return JSON.parse(data) as EmbeddedData
}

export const getCommunityOnAir = async ({ comId }: { comId: string }) => {
  const onair = await axios.get<{
    meta: { status: number }
    data: { live: { id: string } }
  }>(
    `https://com.nicovideo.jp/api/v1/communities/${comId.replace(
      "co",
      ""
    )}/lives/onair.json`
  )
  return onair.data.data.live
}
