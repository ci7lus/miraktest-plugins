import dayjs from "dayjs"
import ja from "dayjs/locale/ja"
import { useEffect, useRef, useState } from "react"

dayjs.locale(ja)

export const useRefFromState = <T>(i: T) => {
  const ref = useRef(i)
  useEffect(() => {
    ref.current = i
  }, [i])

  return ref
}

export const useNow = () => {
  const [now, setNow] = useState(dayjs())

  useEffect(() => {
    let interval: null | NodeJS.Timeout = null
    const update = () => setNow(dayjs())
    let timeout: null | NodeJS.Timeout = setTimeout(() => {
      update()
      interval = setInterval(update, 60 * 1000)
      timeout = null
    }, (60 - new Date().getSeconds()) * 1000)
    return () => {
      timeout && clearTimeout(timeout)
      interval && clearInterval(interval)
    }
  }, [])

  return now
}

export const wait = (s: number) =>
  new Promise<void>((res) => {
    setTimeout(() => res(), s)
  })

// https://stackoverflow.com/a/65479695
export const assertFulfilled = <T>(
  item: PromiseSettledResult<T>
): item is PromiseFulfilledResult<T> => {
  return item.status === "fulfilled"
}
