import axios from "axios"
import urljoin from "url-join"
import type { EPGSProgramRecord, EPGSChannel } from "./types"

export class EPGStationAPI {
  public baseUrl: URL
  constructor(baseUrl: string) {
    if (!baseUrl) throw new Error("EPGStation url is not provided")
    this.baseUrl = new URL(baseUrl)
  }

  get client() {
    return axios.create({
      baseURL: this.baseUrl.href,
      headers: {
        ...(this.isAuthorizationEnabled
          ? {
              Authorization: this.authorizationToken,
            }
          : {}),
      },
      timeout: 1000 * 30,
    })
  }

  getChannelLogoUrl({ id }: { id: number }) {
    return `${this.baseUrl}/channels/${id}/logo`
  }
  get isAuthorizationEnabled() {
    return !!(this.baseUrl.username && this.baseUrl.password)
  }
  get authorizationToken() {
    return `Basic ${btoa(`${this.baseUrl.username}:${this.baseUrl.password}`)}`
  }
  async getChannels() {
    const { data } = await this.client.get<EPGSChannel[]>("api/channels")
    return data.map((channel) => ({
      ...channel,
      name: channel.halfWidthName.trim() ? channel.halfWidthName : channel.name,
    }))
  }
  async getRecords({
    offset = 0,
    limit = 24,
    isReverse,
    ruleId,
    channelId,
    genre,
    keyword,
    hasOriginalFile,
  }: {
    offset?: number
    limit?: number
    isReverse?: boolean
    ruleId?: number
    channelId?: number
    genre?: number
    keyword?: string
    hasOriginalFile?: boolean
  }) {
    const { data } = await this.client.get<{
      records: EPGSProgramRecord[]
      total: number
    }>("api/recorded", {
      params: {
        isHalfWidth: true,
        offset,
        limit,
        isReverse,
        ruleId,
        channelId,
        genre,
        keyword,
        hasOriginalFile,
      },
    })
    return data
  }
  async getRecord({ id }: { id: number }) {
    const { data } = await this.client.get<EPGSProgramRecord>(
      `api/recorded/${id}`,
      {
        params: { isHalfWidth: true },
      }
    )
    return data
  }
  async getThumbnailUrl({ id }: { id: number }) {
    const response = await this.client.get<ArrayBuffer>(
      `api/thumbnails/${id}`,
      { responseType: "arraybuffer" }
    )
    const objUrl = URL.createObjectURL(
      new Blob([response.data], {
        type: response.headers?.["content-type"] || "image/png",
      })
    )
    return objUrl
  }
  async getRecordings({ offset, limit }: { offset?: number; limit?: number }) {
    const { data } = await this.client.get<{ records: EPGSProgramRecord[] }>(
      "api/recording",
      { params: { isHalfWidth: true, offset, limit } }
    )
    return data.records
  }
  getVideoUrl({ videoId }: { videoId: number }) {
    return urljoin(this.baseUrl.href, `api/videos/${videoId}`)
  }
}
