export const blobToBase64Uri = (blob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as never)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
