import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Capify',
  description: 'Discover music based on language, genre and mood.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
