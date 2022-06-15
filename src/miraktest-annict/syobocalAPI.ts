import axios from "axios"
import { XMLParser } from "fast-xml-parser"

const client = axios.create({
  baseURL: "https://cal.syoboi.jp/",
  responseType: "text",
})

type ProgItem = {
  LastUpdate: "2021-08-21 09:32:18"
  PID: 553990
  TID: 2981
  StTime: "2021-10-02 14:00:00"
  StOffset: 0
  EdTime: "2021-10-02 16:00:00"
  Count: 392
  SubTitle: ""
  ProgComment: ""
  Flag: 0
  Deleted: 0
  Warn: 0
  ChID: 106
  Revision: 1
  STSubTitle: "アニソンランキング部【2017年】"
}

type ProgLookupResponse =
  | {
      ProgItems: {
        ProgItem: ProgItem[]
      }
      Result: {
        Code: 200
        Message: ""
      }
    }
  | {
      ProgItems: {
        ProgItem: ProgItem[]
      }
      Result: {
        Code: 404
        Message: "条件に一致するデータは存在しません"
      }
    }

export class SyobocalAPI {
  static async ProgLookup(params: {
    TID?: string
    ChID?: string
    StTime?: string
    Range: string
    JOIN?: "SubTitles"[]
  }) {
    return client
      .get<string>("db.php", {
        params: {
          Command: "ProgLookup",
          ...params,
          JOIN: params.JOIN?.join(","),
        },
      })
      .then((r) => {
        const {
          ProgLookupResponse,
        }: { ProgLookupResponse: ProgLookupResponse } = new XMLParser().parse(
          r.data
        )
        if (ProgLookupResponse.Result.Code === 404) {
          return []
        }
        return [ProgLookupResponse.ProgItems.ProgItem].flat()
      })
  }
}
