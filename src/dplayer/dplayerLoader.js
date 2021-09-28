if (typeof window !== "undefined") {
  exports["DPlayer"] =
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("@neneka/dplayer")
} else {
  exports["DPlayer"] = null
}
