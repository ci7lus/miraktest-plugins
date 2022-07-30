// eslint-disable-next-line no-undef
if (typeof window !== "undefined" && typeof window.Recoil !== "undefined") {
  Object.assign(exports, globalThis.Recoil)
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Object.assign(exports, require("recoil"))
}
