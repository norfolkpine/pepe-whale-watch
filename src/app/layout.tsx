import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { Providers } from "@/providers"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { siteConfig } from "@/config/site"

import "./globals.css"
import React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: siteConfig.title,
	description: siteConfig.description
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<React.StrictMode>
					<Providers>
						{/* <Header /> */}

					<main className="flex flex-col">{children}</main>
					<SpeedInsights />
					</Providers>
				</React.StrictMode>
			</body>
		</html>
	)
}
