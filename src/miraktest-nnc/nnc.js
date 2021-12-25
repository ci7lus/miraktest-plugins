/**
 *   {
    "chat": {
      "thread": "1173108780",
      "no": 4118020,
      "vpos": 36114,
      "date": 1361103390,
      "nicoru": 18,
      "premium": 1,
      "anonymity": 1,
      "score": -2200,
      "user_id": "Yg_6QWiiS_T2mq3WJuzUcp41MvQ",
      "mail": "184",
      "content": "混ぜるな危険ｗｗｗ"
    }
  },
 */

class NiconiComments {
  /**
   * NiconiComments Constructor
   * @param {HTMLCanvasElement} canvas - 描画対象のキャンバス
   * @param {[]} data - 描画用のコメント
   * @param {boolean} useLegacy - defontにsans-serifを適用するか(trueでニコニコ公式に準拠)
   * @param {boolean} formatted - dataが独自フォーマットに変換されているか
   */
  constructor(canvas, data, useLegacy = false, formatted = false) {
    this.canvas = canvas
    this.context = canvas.getContext("2d")
    this.context.strokeStyle = "rgba(0,0,0,0.7)"
    this.context.textAlign = "left"
    this.context.textBaseline = "top"
    this.context.lineWidth = "6"
    this.commentYOffset = 0.25
    this.commentYMarginTop = 0.05
    if (formatted) {
      this.data = data
    } else {
      this.data = this.parseData(data)
    }

    this.showCollision = false
    this.showFPS = false
    this.showCommentCount = false

    this.timeline = {}
    this.nicoScripts = { reverse: [] }
    this.collision_right = {}
    this.collision_left = {}
    this.collision_ue = {}
    this.collision_shita = {}
    this.useLegacy = useLegacy
    this.preRendering()
    this.fpsCount = 0
    this.fps = 0
    this.fpsClock = setInterval(() => {
      this.fps = this.fpsCount * 2
      this.fpsCount = 0
    }, 500)
  }

  addComment(data) {
    this.data.push(data)
    this.preRendering()
  }

  /**
   * ニコニコが吐き出したデータを処理しやすいように変換する
   * @param {[]} data - ニコニコが吐き出したコメントデータ
   * @returns {*[]} - 独自フォーマットのコメントデータ
   */
  parseData(data) {
    let data_ = []
    for (let i = 0; i < data.length; i++) {
      for (let key in data[i]) {
        let value = data[i][key]
        if (key === "chat") {
          let tmpParam = {
            id: value["no"],
            vpos: value["vpos"],
            content: value["content"],
            date: value["date"],
            date_usec: value["date_usec"],
            owner: !value["user_id"],
          }
          if (value["mail"]) {
            tmpParam["mail"] = value["mail"].split(" ")
          } else {
            tmpParam["mail"] = []
          }
          data_.push(tmpParam)
        }
      }
    }
    data_.sort((a, b) => {
      if (a.vpos < b.vpos) return -1
      if (a.vpos > b.vpos) return 1
      if (a.date < b.date) return -1
      if (a.date > b.date) return 1
      if (a.date_usec < b.date_usec) return -1
      if (a.date_usec > b.date_usec) return 1
      return 0
    })
    return data_
  }

  /**
   * 事前に当たり判定を考慮してコメントの描画場所を決定する
   */
  preRendering() {
    this.getFont()
    this.getCommentSize()
    this.getCommentPos()
  }

  /**
   * コマンドをもとに各コメントに適用するフォントを決定する
   */
  getFont() {
    for (let i in this.data) {
      let comment = this.data[i]
      let command = this.parseCommand(comment)
      this.data[i].loc = command.loc
      this.data[i].size = command.size
      this.data[i].fontSize = command.fontSize
      this.data[i].font = command.font
      this.data[i].color = command.color
      this.data[i].full = command.full
      this.data[i].ender = command.ender
      this.data[i].content = this.data[i].content
        .replaceAll("\t", "       ")
        .replaceAll(/(\n){3,}/g, "\n\n\n")
    }
  }

  /**
   * コメントの描画サイズを計算する
   */
  getCommentSize() {
    let tmpData = groupBy(this.data, "font", "fontSize")
    for (let i in tmpData) {
      for (let j in tmpData[i]) {
        this.context.font = parseFont(i, j, this.useLegacy)
        for (let k in tmpData[i][j]) {
          let comment = tmpData[i][j][k]
          let measure = this.measureText(comment)
          this.data[comment.index].height = measure.height
          this.data[comment.index].width = measure.width
          this.data[comment.index].width_max = measure.width_max
          this.data[comment.index].width_min = measure.width_min
          if (measure.resized) {
            this.data[comment.index].fontSize = measure.fontSize
            this.context.font = parseFont(i, j, this.useLegacy)
          }
        }
      }
    }
  }

  /**
   * 計算された描画サイズをもとに各コメントの配置位置を決定する
   */
  getCommentPos() {
    let data = this.data
    for (let i in data) {
      let comment = data[i]
      for (let j = 0; j < 500; j++) {
        if (!this.timeline[comment.vpos + j]) {
          this.timeline[comment.vpos + j] = []
        }
        if (!this.collision_right[comment.vpos + j]) {
          this.collision_right[comment.vpos + j] = []
        }
        if (!this.collision_left[comment.vpos + j]) {
          this.collision_left[comment.vpos + j] = []
        }
        if (!this.collision_ue[comment.vpos + j]) {
          this.collision_ue[comment.vpos + j] = []
        }
        if (!this.collision_shita[comment.vpos + j]) {
          this.collision_shita[comment.vpos + j] = []
        }
      }
      if (comment.loc === "naka") {
        comment.vpos -= 70
        this.data[i].vpos -= 70
        let posY = 0,
          is_break = false,
          is_change = true,
          count = 0
        while (is_change && count < 10) {
          is_change = false
          count++
          for (let j = 0; j < 500; j++) {
            let vpos = comment.vpos + j
            let left_pos = 1920 - ((1920 + comment.width_max) * j) / 500
            if (left_pos + comment.width_max >= 1880) {
              for (let k in this.collision_right[vpos]) {
                let l = this.collision_right[vpos][k]
                if (
                  posY < data[l].posY + data[l].height &&
                  posY + comment.height > data[l].posY &&
                  data[l].owner === comment.owner
                ) {
                  if (data[l].posY + data[l].height > posY) {
                    posY = data[l].posY + data[l].height
                    is_change = true
                  }
                  if (posY + comment.height > 1080) {
                    if (1080 < comment.height) {
                      posY = 0
                    } else {
                      posY = Math.floor(Math.random() * (1080 - comment.height))
                    }
                    is_break = true
                    break
                  }
                }
              }
              if (is_break) {
                break
              }
            }
            if (left_pos <= 40 && is_break === false) {
              for (let k in this.collision_left[vpos]) {
                let l = this.collision_left[vpos][k]
                if (
                  posY < data[l].posY + data[l].height &&
                  posY + comment.height > data[l].posY &&
                  data[l].owner === comment.owner
                ) {
                  if (data[l].posY + data[l].height > posY) {
                    posY = data[l].posY + data[l].height
                    is_change = true
                  }
                  if (posY + comment.height > 1080) {
                    if (1080 < comment.height) {
                      posY = 0
                    } else {
                      posY = Math.random() * (1080 - comment.height)
                    }
                    is_break = true
                    break
                  }
                }
              }
              if (is_break) {
                break
              }
            }
            if (is_break) {
              break
            }
          }
        }
        for (let j = 0; j < 500; j++) {
          let vpos = comment.vpos + j
          let left_pos = 1920 - ((1920 + comment.width_max) * j) / 500
          arrayPush(this.timeline, vpos, i)
          if (left_pos + comment.width_max >= 1880) {
            arrayPush(this.collision_right, vpos, i)
          }
          if (left_pos <= 40) {
            arrayPush(this.collision_left, vpos, i)
          }
        }
        this.data[i].posY = posY
      } else {
        let posY = 0,
          is_break = false,
          is_change = true,
          count = 0,
          collision
        if (comment.loc === "ue") {
          collision = this.collision_ue
        } else if (comment.loc === "shita") {
          collision = this.collision_shita
        }
        while (is_change && count < 10) {
          is_change = false
          count++
          for (let j = 0; j < 300; j++) {
            let vpos = comment.vpos + j
            for (let k in collision[vpos]) {
              let l = collision[vpos][k]
              if (
                posY < data[l].posY + data[l].height &&
                posY + comment.height > data[l].posY &&
                data[l].owner === comment.owner
              ) {
                if (data[l].posY + data[l].height > posY) {
                  posY = data[l].posY + data[l].height
                  is_change = true
                }
                if (posY + comment.height > 1080) {
                  if (1000 <= comment.height) {
                    posY = 0
                  } else {
                    posY = Math.floor(Math.random() * (1080 - comment.height))
                  }
                  is_break = true
                  break
                }
              }
            }
            if (is_break) {
              break
            }
          }
        }
        for (let j = 0; j < 300; j++) {
          let vpos = comment.vpos + j
          arrayPush(this.timeline, vpos, i)
          if (comment.loc === "ue") {
            arrayPush(this.collision_ue, vpos, i)
          } else {
            arrayPush(this.collision_shita, vpos, i)
          }
        }
        this.data[i].posY = posY
      }
    }
  }

  /**
   * context.measureTextの複数行対応版
   * 画面外にはみ出すコメントの縮小も行う
   * @param comment - 独自フォーマットのコメントデータ
   * @returns {{resized: boolean, width: number, width_max: number, fontSize: number, width_min: number, height: number}} - 描画サイズとリサイズの情報
   */
  measureText(comment) {
    let msg = comment.content
    if (!comment.defaultFontSize) {
      comment.defaultFontSize = comment.fontSize
    } else {
      this.context.font = parseFont(
        comment.font,
        comment.fontSize,
        this.useLegacy
      )
    }

    let width,
      width_max,
      width_min,
      height,
      width_arr = [],
      lines = msg.split("\n")

    for (let i = 0; i < lines.length; i++) {
      let measure = this.context.measureText(lines[i])
      width_arr.push(measure.width)
    }
    width = width_arr.reduce((p, c) => p + c, 0) / width_arr.length
    width_max = Math.max(...width_arr)
    width_min = Math.min(...width_arr)
    height = comment.fontSize * (this.commentYMarginTop + 1) * lines.length
    if (height > 1080) {
      comment.fontSize -= 1
      comment.resized = true
      this.context.font = parseFont(
        comment.font,
        comment.fontSize,
        this.useLegacy
      )
      return this.measureText(comment)
    } else if (
      comment.loc !== "naka" &&
      ((lines.length < 3 && comment.size === "big") ||
        (lines.length < 5 && comment.size === "medium") ||
        (lines.length < 7 && comment.size === "small") ||
        comment.ender)
    ) {
      if (comment.full && width > 1920) {
        comment.fontSize -= 1
        comment.resized = true
        this.context.font = parseFont(
          comment.font,
          comment.fontSize,
          this.useLegacy
        )
        return this.measureText(comment)
      } else if (!comment.full && width > 1440) {
        comment.fontSize -= 1
        comment.resized = true
        this.context.font = parseFont(
          comment.font,
          comment.fontSize,
          this.useLegacy
        )
        return this.measureText(comment)
      }
    }
    return {
      width: width,
      width_max: width_max,
      width_min: width_min,
      height: height,
      resized: comment.resized,
      fontSize: comment.fontSize,
    }
  }

  /**
   * コマンドをもとに所定の位置にコメントを表示する
   * @param comment - 独自フォーマットのコメントデータ
   * @param {number} vpos - 動画の現在位置の100倍 ニコニコから吐き出されるコメントの位置情報は主にこれ
   */
  drawText(comment, vpos) {
    let reverse = false
    for (let i in this.nicoScripts.reverse) {
      let range = this.nicoScripts.reverse[i]
      if (
        (range.target === "コメ" && comment.owner) ||
        (range.target === "投コメ" && !comment.owner)
      ) {
        break
      }
      if (range.start < vpos && vpos < range.end) {
        reverse = true
      }
    }
    let lines = comment.content.split("\n"),
      posX = (1920 - comment.width_max) / 2
    if (comment.loc === "naka") {
      if (reverse) {
        posX = ((1920 + comment.width_max) * (vpos - comment.vpos)) / 500
      } else {
        posX = 1920 - ((1920 + comment.width_max) * (vpos - comment.vpos)) / 500
      }
      for (let i in lines) {
        let line = lines[i]
        let posY =
          comment.posY +
          i * comment.fontSize * (1 + this.commentYMarginTop) +
          this.commentYOffset * comment.fontSize
        this.context.strokeText(line, posX, posY)
        this.context.fillText(line, posX, posY)
      }
    } else if (comment.loc === "ue") {
      for (let i in lines) {
        let line = lines[i]
        this.context.strokeText(
          line,
          posX,
          comment.posY +
            i * comment.fontSize +
            this.commentYOffset * comment.fontSize +
            this.commentYMarginTop * comment.fontSize
        )
        this.context.fillText(
          line,
          posX,
          comment.posY +
            i * comment.fontSize +
            this.commentYOffset * comment.fontSize +
            this.commentYMarginTop * comment.fontSize
        )
      }
    } else if (comment.loc === "shita") {
      for (let i in lines) {
        let line = lines[i]
        let posY =
          1080 -
          (comment.posY + comment.height) +
          i * comment.fontSize -
          this.commentYMarginTop * comment.fontSize +
          this.commentYMarginTop * comment.fontSize
        this.context.strokeText(line, posX, posY)
        this.context.fillText(line, posX, posY)
      }
    }
    if (this.showCollision) {
      this.context.strokeStyle = "rgba(255,255,0,1)"
      if (comment.loc === "shita") {
        this.context.strokeRect(
          posX,
          1080 - comment.posY - comment.height,
          comment.width_max,
          comment.height
        )
      } else {
        this.context.strokeRect(
          posX,
          comment.posY,
          comment.width_max,
          comment.height
        )
      }
      this.context.strokeStyle = "rgba(0,0,0,0.7)"
    }
  }

  /**
   * コメントに含まれるコマンドを解釈する
   * @param comment- 独自フォーマットのコメントデータ
   * @returns {{loc: string, size: string, color: string, fontSize: number, ender: boolean, font: string, full: boolean}}
   */
  parseCommand(comment) {
    let metadata = comment.mail,
      loc = "naka",
      size = "medium",
      fontSize = 70,
      color = "#FFFFFF",
      font = "defont",
      full = false,
      ender = false,
      reverse = comment.content.match(/@逆 ?(全|コメ|投コメ)?/)
    if (reverse) {
      if (!reverse[1]) {
        reverse[1] = "全"
      }
      let length = false
      for (let i in metadata) {
        let match = metadata[i].match(/@([0-9]+)/)
        if (match) {
          length = match[1]
          break
        }
      }
      if (!length) {
        length = 30
      }
      this.nicoScripts.reverse.push({
        start: comment.vpos,
        end: comment.vpos + length * 100,
        target: reverse[1],
      })
      fontSize = 0
    }
    for (let i in metadata) {
      let command = metadata[i]
      if (loc === "naka") {
        switch (command) {
          case "ue":
            loc = "ue"
            break
          case "shita":
            loc = "shita"
            break
        }
      }
      if (size === "medium") {
        switch (command) {
          case "big":
            size = "big"
            fontSize = 100
            break
          case "small":
            size = "small"
            fontSize = 50
            break
        }
      }
      if (color === "#FFFFFF") {
        switch (command) {
          case "red":
            color = "#FF0000"
            break
          case "pink":
            color = "#FF8080"
            break
          case "orange":
            color = "#FFC000"
            break
          case "yellow":
            color = "#FFFF00"
            break
          case "green":
            color = "#00FF00"
            break
          case "cyan":
            color = "#00FFFF"
            break
          case "blue":
            color = "#0000FF"
            break
          case "purple":
            color = "#C000FF"
            break
          case "black":
            color = "#000000"
            break
          case "white2":
          case "niconicowhite":
            color = "#CCCC99"
            break
          case "red2":
          case "truered":
            color = "#CC0033"
            break
          case "pink2":
            color = "#FF33CC"
            break
          case "orange2":
          case "passionorange":
            color = "#FF6600"
            break
          case "yellow2":
          case "madyellow":
            color = "#999900"
            break
          case "green2":
          case "elementalgreen":
            color = "#00CC66"
            break
          case "cyan2":
            color = "#00CCCC"
            break
          case "blue2":
          case "marineblue":
            color = "#3399FF"
            break
          case "purple2":
          case "nobleviolet":
            color = "#6633CC"
            break
          case "black2":
            color = "#666666"
            break
          default: {
            const match = command.match(/#[0-9a-zA-Z]{3,6}/)
            if (match) {
              color = match[0]
            }
          }
        }
      }
      if (font === "defont") {
        switch (command) {
          case "gothic":
            font = "gothic"
            break
          case "mincho":
            font = "mincho"
            break
        }
      }
      switch (command) {
        case "full":
          full = true
          break
        case "ender":
          ender = true
          break
      }
    }
    return { loc, size, fontSize, color, font, full, ender }
  }

  /**
   * キャンバスを描画する
   * @param vpos - 動画の現在位置の100倍 ニコニコから吐き出されるコメントの位置情報は主にこれ
   */
  drawCanvas(vpos) {
    this.fpsCount++
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (let index in this.timeline[vpos]) {
      let comment = this.data[this.timeline[vpos][index]]
      this.context.font = parseFont(
        comment.font,
        comment.fontSize,
        this.useLegacy
      )
      this.context.fillStyle = comment.color
      if (comment.color === "#000000") {
        this.context.strokeStyle = "rgba(255,255,255,0.7)"
      }
      this.drawText(comment, vpos)
      if (comment.color === "#000000") {
        this.context.strokeStyle = "rgba(0,0,0,0.7)"
      }
    }
    if (this.showFPS) {
      this.context.font = parseFont("defont", 60, this.useLegacy)
      this.context.fillStyle = "#00FF00"
      this.context.strokeText("FPS:" + this.fps, 100, 100)
      this.context.fillText("FPS:" + this.fps, 100, 100)
    }
    if (this.showCommentCount) {
      this.context.font = parseFont("defont", 60, this.useLegacy)
      this.context.fillStyle = "#00FF00"
      this.context.strokeText("Count:" + this.timeline[vpos].length, 100, 200)
      this.context.fillText("Count:" + this.timeline[vpos].length, 100, 200)
    }
  }

  /**
   * キャンバスを消去する
   */
  clear() {
    this.context.clearRect(0, 0, 1920, 1080)
  }
}

/**
 * 配列を複数のキーでグループ化する
 * @param {{}} array
 * @param {string} key
 * @param {string} key2
 * @returns {{}}
 */
const groupBy = (array, key, key2) => {
  let data = {}
  for (let i in array) {
    if (!data[array[i][key]]) {
      data[array[i][key]] = {}
    }
    if (!data[array[i][key]][array[i][key2]]) {
      data[array[i][key]][array[i][key2]] = []
    }
    array[i].index = i
    data[array[i][key]][array[i][key2]].push(array[i])
  }
  return data
}
/**
 * フォント名とサイズをもとにcontextで使えるフォントを生成する
 * @param {string} font
 * @param {number} size
 * @param {boolean} useLegacy
 * @returns {string}
 */
const parseFont = (font, size, useLegacy) => {
  switch (font) {
    case "gothic":
      return `normal 400 ${size}px "游ゴシック体", "游ゴシック", "Yu Gothic", YuGothic, yugothic, YuGo-Medium`
    case "mincho":
      return `normal 400 ${size}px "游明朝体", "游明朝", "Yu Mincho", YuMincho, yumincho, YuMin-Medium`
    default:
      if (useLegacy) {
        return `normal 600 ${size}px Arial, "ＭＳ Ｐゴシック", "MS PGothic", MSPGothic, MS-PGothic`
      } else {
        return `normal 600 ${size}px sans-serif, Arial, "ＭＳ Ｐゴシック", "MS PGothic", MSPGothic, MS-PGothic`
      }
  }
}
/**
 * phpのarray_push的なあれ
 * @param array
 * @param {string} key
 * @param push
 */
const arrayPush = (array, key, push) => {
  if (!array) {
    array = {}
  }
  if (!array[key]) {
    array[key] = []
  }
  array[key].push(push)
}
export default NiconiComments
