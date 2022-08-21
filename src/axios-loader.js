if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Object.assign(exports, require("axios/lib/platform/browser"))
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Object.assign(exports, require("axios/lib/platform/node"))
}
