import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Campus Lost & Found',
  description:
    'A campus-wide Lost and Found Management System connecting students, finders, and security authorities.',
  keywords: 'campus, lost, found, items, university, students',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-gray-50 min-h-screen flex flex-col antialiased">
        {/* ─── Navigation Bar ─── */}
        <Navbar />

        {/* ─── Page Content ─── */}
        <main className="flex-1">
          {children}
        </main>

        {/* ─── Footer ─── */}
        <Footer />
      </body>
    </html>
  )
}

