import "./globals.css";

export const metadata = {
  title: "MQTT Chat App",
  description: "Real-time chat application using MQTT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
