export const embedInfoInImage = (
  imageCanvas: HTMLCanvasElement,
  info: string
) => {
  const infoCanvas = document.createElement("canvas")
  infoCanvas.width = imageCanvas.width * 2
  infoCanvas.height = imageCanvas.height * 2
  const ctx = infoCanvas.getContext("2d")
  if (!ctx) {
    throw new Error("info ctx context error")
  }
  ctx.scale(2, 2)
  ctx.font = `24px "Hiragino Maru Gothic ProN"`
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"
  ctx.shadowBlur = 5
  ctx.shadowColor = "rgba(0, 0, 0, .5)"
  ctx.shadowOffsetX = 5
  ctx.shadowOffsetY = 5
  ctx.fillText(info, imageCanvas.width - 10, imageCanvas.height - 20)
  const imCtx = imageCanvas.getContext("2d")
  if (!imCtx) {
    throw new Error("info ctx context error")
  }
  imCtx.drawImage(infoCanvas, 0, 0, imageCanvas.width, imageCanvas.height)
  const datauri = imageCanvas.toDataURL("image/jpeg", 0.9)
  return datauri
}
