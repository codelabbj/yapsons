"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "./api"

export type YapsonSetting = {
  use_chatbot?: boolean
  use_whatsapp?: boolean
  use_telegram?: boolean
  use_sms?: boolean
  whatsapp_phone?: string | null
  whatsapp_phone_indi?: string | null
  whatsapp_link?: string | null
  telegram?: string | null
  telegram_bot_username?: string | null
  [key: string]: unknown
}

interface SettingsContextType {
  settings: YapsonSetting | null
  isLoading: boolean
  isHydrated: boolean
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

function parseSettings(data: unknown): YapsonSetting | null {
  if (Array.isArray(data)) return (data[0] as YapsonSetting) ?? null
  return (data as YapsonSetting) ?? null
}

/** GET /yapson/v2/setting/ then fallback GET /yapson/setting/ */
export async function fetchYapsonSettings(): Promise<YapsonSetting | null> {
  try {
    const { data } = await api.get("/yapson/v2/setting/")
    return parseSettings(data)
  } catch {
    const { data } = await api.get("/yapson/setting/")
    return parseSettings(data)
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<YapsonSetting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      const data = await fetchYapsonSettings()
      setSettings(data)
      if (data) {
        localStorage.setItem("yapson_app_settings", JSON.stringify(data))
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      const cachedSettings = localStorage.getItem("yapson_app_settings")
      if (cachedSettings && cachedSettings !== "undefined" && cachedSettings !== "null") {
        try {
          setSettings(JSON.parse(cachedSettings))
        } catch (parseError) {
          console.error("Failed to parse cached settings:", parseError)
        }
      }
    }
  }, [])

  useEffect(() => {
    setIsHydrated(true)

    const cachedSettings = localStorage.getItem("yapson_app_settings")
    if (cachedSettings && cachedSettings !== "undefined" && cachedSettings !== "null") {
      try {
        setSettings(JSON.parse(cachedSettings))
      } catch (error) {
        console.error("Failed to parse cached settings:", error)
      }
    }

    loadSettings().finally(() => {
      setIsLoading(false)
    })
  }, [loadSettings])

  const refreshSettings = async () => {
    setIsLoading(true)
    await loadSettings()
    setIsLoading(false)
  }

  return (
    <SettingsContext.Provider value={{ settings, isLoading, isHydrated, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
