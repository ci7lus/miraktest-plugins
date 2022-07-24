// eslint-disable-next-line no-undef
if (typeof window !== "undefined" && typeof window.React !== "undefined") {
  Object.assign(exports, globalThis.React)
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Object.assign(exports, require("react"))
}
