import { atomFamily } from "recoil"

const prefix = "plugins.ci7lus.epgs"

export const thumbnailFamily = atomFamily<string | null, number>({
  key: `${prefix}.thumbnails`,
  default: null,
})
