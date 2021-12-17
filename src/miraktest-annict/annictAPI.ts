import axios from "axios"
import { MeProgramsGetRequestQuery } from "./annict.js/types/me/programs"
import { getSdk } from "./gql"
import { GraphQLClient } from "./graphqlRequestLoader"

export class AnnictRESTAPI {
  constructor(public accessToken: string) {}

  get client() {
    return axios.create({
      baseURL: "https://api.annict.com/v1",
      params: {
        access_token: this.accessToken,
      },
    })
  }

  async getMyPrograms(params: MeProgramsGetRequestQuery) {
    return this.client.get<{
      next_page: 2
      prev_page: null
      programs: {
        channel: {}
        work: {
          id: 7275
          title: "ラブライブ！スーパースター!!"
          no_episodes: false
        }
        episode: {
          id: 136192
          number: 8.0
          number_text: "第8話"
          title: "結ばれる想い"
        }
      }[]

      total_count: 0
    }>("me/programs", {
      params: {
        ...params,
        filter_channel_ids: params.filter_channel_ids?.join(","),
        fields: params.fields?.join(","),
      },
    })
  }
}

export const ANNICT_GRAPHQL_ENDPOINT = "https://api.annict.com/graphql"

export const generateGqlClient = (accessToken: string) => {
  const client = new GraphQLClient(ANNICT_GRAPHQL_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return getSdk(client)
}
