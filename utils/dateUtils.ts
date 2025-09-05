import { formatDistanceToNow } from "date-fns"

export function safeFormatDate(timestamp: number): string {
  if (!timestamp || isNaN(timestamp)) {
    return "Invalid date"
  }

  const date = new Date(timestamp * 1000)
  if (isNaN(date.getTime())) {
    return "Invalid date"
  }

  try {
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Date formatting error"
  }
}
