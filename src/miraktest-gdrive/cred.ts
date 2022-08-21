const GDRIVE_CRED = atob(
  Array.from(process.env.GDRIVE_CRED || "==AL")
    .reverse()
    .join("")
).split(",")
export const GDRIVE_CLIENT_ID = GDRIVE_CRED[0]
export const GDRIVE_CLIENT_SECRET = GDRIVE_CRED[1]
