"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import DashboardHeader from "@/components/DashboardHeader"
import { useSettings } from "@/lib/settings-context"
import { SupportChatbot } from "@/components/SupportChatbot"

export default function ContactPage() {
  const router = useRouter()
  const { settings, isLoading: settingsLoading } = useSettings()
  const [ready, setReady] = useState(false)
  const chatbotEnabled = Boolean(settings?.use_chatbot)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    if (!token) {
      router.replace("/")
      return
    }
    if (!settingsLoading) setReady(true)
  }, [settingsLoading, router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <DashboardHeader />
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-3 py-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            aria-label="Retour"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold flex-1 text-gray-900 dark:text-white">Support</h1>
        </div>
      </header>

      <main className="flex-1 min-h-0 max-w-3xl w-full mx-auto p-3">
        {chatbotEnabled ? (
          <div className="h-[min(78vh,640px)] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <SupportChatbot pageKey="contact" route="/contact" screenTitle="Support" />
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-sm text-gray-500">
            L&apos;assistant IA n&apos;est pas activé pour le moment. Utilisez WhatsApp ou Telegram
            depuis le tableau de bord, ou enregistrez vos numéros dans le profil.
          </div>
        )}
      </main>
    </div>
  )
}
