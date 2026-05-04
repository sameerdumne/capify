import './globals.css'
import { ReactNode } from 'react'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'Capify',
  description: 'Discover music based on language, genre and mood.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
