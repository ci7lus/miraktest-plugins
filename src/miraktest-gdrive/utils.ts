import { createHash } from "crypto"

export const generateRandomString = (length = 6) => {
  let result = ""
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-"
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const generateS256CodeChallenge = (verifier: string) => {
  return createHash("sha256")
    .update(verifier, "utf8")
    // base64url 形式 (https://datatracker.ietf.org/doc/html/rfc4648#section-5) でダイジェストを生成
    .digest("base64url")
    // Base64 のパディングを削除
    .replace(/=+$/, "")
}
