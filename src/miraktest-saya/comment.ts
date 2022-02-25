export const trimCommentForFlow = (s: string) => {
  return s
    .replace(/https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+\s?/g, "") // URL削除
    .replace(/#.+\s?/g, "") // ハッシュタグ削除
    .replace(/@\w+?\s?/g, "") // メンション削除
    .replace(/^\/nicoad.*/, "") // ニコニ広告削除
    .replace(/^\/\w+\s?/, "") // コマンド削除
}

export const classfySource = (s: string) => {
  if (s.startsWith("5ch")) {
    return "5ch"
  } else if (s.startsWith("Twitter")) {
    return "twitter"
  } else if (s.startsWith("ニコニコ生放送")) {
    return "nicojk"
  } else {
    return
  }
}
