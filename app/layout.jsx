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
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
