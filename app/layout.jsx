import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'Бронювання альтанок - ЖК Озерний Гай',
  description: 'Система бронювання альтанок для мешканців ЖК Озерний Гай',
}

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <head>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
