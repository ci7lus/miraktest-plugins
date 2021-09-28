if (typeof window !== "undefined") {
  exports["NicoCommentPlayer"] =
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("../../zenzawatch/src/CommentPlayer").NicoCommentPlayer
} else {
  exports["NicoCommentPlayer"] = null
}
