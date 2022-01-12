export const imageToCanvas = async (url: string) => {
  const canvas = document.createElement("canvas")
  const imCtx = canvas.getContext("2d")
  if (!imCtx) {
    throw new Error("ctx context error")
  }
  await new Promise<void>((res, rej) => {
    const image = new Image()
    image.onload = () => {
      canvas.width = image.width
      canvas.height = image.height
      imCtx.drawImage(image, 0, 0)
      res()
    }
    image.onerror = rej
    image.src = url
  })
  return canvas
}
