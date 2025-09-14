import './globals.css'

export const metadata = {
  title: 'SchoolList - Meghsham Jade',
  description: 'By Meghsham Jade',
  icons: {
    icon: [
      { url: '/mj.png', sizes: '32x32', type: 'image/png' },
      { url: '/mj.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/mj.png',
    apple: '/mj.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/mj.png" type="image/png" />
        <link rel="shortcut icon" href="/mj.png" type="image/png" />
        <link rel="apple-touch-icon" href="/mj.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
