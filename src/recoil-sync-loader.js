// eslint-disable-next-line no-undef
if (typeof window !== "undefined" && typeof window.RecoilSync !== "undefined") {
  Object.assign(exports, globalThis.RecoilSync)
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Object.assign(exports, require("recoil-sync"))
}
