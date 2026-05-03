export function extractYouTubeID(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
    if (u.searchParams.has('v')) return u.searchParams.get('v')
    const parts = u.pathname.split('/')
    return parts[parts.length - 1] || null
  } catch {
    return null
  }
}

export function thumbnailForId(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}
