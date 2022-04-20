export const COLOR_MAP: { [key: string]: string } = {
  red: "#e54256",
  pink: "#ff8080",
  orange: "#ffc000",
  yellow: "#ffe133",
  green: "#64dd17",
  cyan: "#39ccff",
  blue: "#0000ff",
  purple: "#d500f9",
  black: "#000000",
  white: "#ffffff",
  white2: "#cccc99",
  niconicowhite: "#cccc99",
  red2: "#cc0033",
  truered: "#cc0033",
  pink2: "#ff33cc",
  orange2: "#ff6600",
  passionorange: "#ff6600",
  yellow2: "#999900",
  madyellow: "#999900",
  green2: "#00cc66",
  elementalgreen: "#00cc66",
  cyan2: "#00cccc",
  blue2: "#3399ff",
  marineblue: "#3399ff",
  purple2: "#6633cc",
  nobleviolet: "#6633cc",
  black2: "#666666",
}

export const POSITION_MAP: { [key: string]: string } = {
  naka: "right",
  ue: "top",
  shita: "bottom",
}

export const SIZE_MAP: { [key: string]: string } = {
  small: "small",
  medium: "medium",
  big: "big",
}

export const parseMail = (mail?: string) => {
  let color: string | undefined = undefined
  let position: string | undefined = undefined
  let size: string | undefined = undefined
  const commands = mail?.split(" ") || []
  for (const command of commands) {
    if (COLOR_MAP[command]) {
      color ||= command
    }
    if (POSITION_MAP[command]) {
      position ||= command
    }
    // サイズ変更はsmall以外禁止する
    if (command === "small") {
      size ||= SIZE_MAP[command]
    }
    // #から始まっていればカラーコードとみなす
    if (command.startsWith("#")) {
      color ||= command
    }
  }
  return { color, position, size }
}
