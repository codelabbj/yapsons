"use client"
import { useState, useEffect, useRef } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import TransactionHistory from '@/components/TransactionHistory';
import { useTranslation } from 'react-i18next';
import Footer from '@/components/footer';
import Advertisement_Hero from '@/components/Advertisement_Hero';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Ticket,
  CreditCard,
  Bot,
  MessageCircle,
  Send,
  X,
} from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { SupportChatbot } from '@/components/SupportChatbot';
import { formatTelegramLink, formatWhatsAppLink } from '@/lib/channel-links';

export default function Dashboard() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [animateHeader, setAnimateHeader] = useState(false);
  const [isChatPopoverOpen, setIsChatPopoverOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const { settings, refreshSettings } = useSettings();

  const chatbotEnabled = Boolean(settings?.use_chatbot);
  const telegramEnabled = Boolean(settings?.use_telegram);
  const whatsappEnabled = Boolean(settings?.use_whatsapp);
  const whatsappUrl = formatWhatsAppLink(
    settings?.whatsapp_phone,
    settings?.whatsapp_phone_indi
  );
  const telegramUrl = formatTelegramLink(
    settings?.telegram || settings?.telegram_bot_username
  );
  const showContactFab =
    chatbotEnabled ||
    (whatsappEnabled && Boolean(whatsappUrl)) ||
    (telegramEnabled && Boolean(telegramUrl));

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    setTimeout(() => {
      setAnimateHeader(true);
    }, 500);
  }, []);

  useEffect(() => {
    if (!isChatPopoverOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsChatPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isChatPopoverOpen]);

  return (
    <div className="min-h-screen font-sans relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-20 -left-10 w-40 h-40 bg-orange-700/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-purple-700/10 rounded-full blur-3xl animate-pulse-slow"></div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/90 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 border-4 border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-gray-400">Chargement de Yapson...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <DashboardHeader />
      <Advertisement_Hero />
      {/* Main Content */}
      <main className="py-4 md:py-6 px-4 md:px-6">
        <h1 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 relative inline-block ${animateHeader ? 'animate-fadeIn' : 'opacity-0'}`}>
          {t("Bienvenue sur Yapson")}
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 animate-widthExpand"></span>
        </h1>

        {/* Action Buttons */}
        <div className={`mb-6 md:mb-8 ${animateHeader ? 'animate-slideInRight' : 'opacity-0'}`} style={{animationDelay: '300ms'}}>
          {/* Mobile Layout (4 buttons in a row) */}
          <div className="flex gap-2 md:hidden">
            <a href="/deposit" className="group relative flex-1 flex flex-col items-center justify-center p-3 transition-all duration-300 active:scale-95">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-2 group-active:scale-90 transition-transform">
                <ArrowDownLeft size={18} className="text-white" />
              </div>
              <span className=" font-medium text-xs">{t("DÉPÔT")}</span>
            </a>
            <a href="/withdraw" className="group relative flex-1 flex flex-col items-center justify-center p-3 transition-all duration-300 active:scale-95">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-2 group-active:scale-90 transition-transform">
                <ArrowUpRight size={18} className="text-white" />
              </div>
              <span className=" font-medium text-xs">{t("RETRAIT")}</span>
            </a>
            <a href="/coupon" className="group relative flex-1 flex flex-col items-center justify-center p-3 transition-all duration-300 active:scale-95">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-2 group-active:scale-90 transition-transform">
                <Ticket size={18} className="text-white" />
              </div>
              <span className=" font-medium text-xs">{t("COUPON")}</span>
            </a>
            <a href="/bet_id" className="group relative flex-1 flex flex-col items-center justify-center p-3 transition-all duration-300 active:scale-95">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-2 group-active:scale-90 transition-transform">
                <CreditCard size={18} className="text-white" />
              </div>
              <span className=" font-medium text-xs">{t("MES ID")}</span>
            </a>
          </div>
          {/* Desktop Layout (Horizontal) */}
          <div className="hidden md:flex gap-4">
            <a className="group relative flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 w-40 overflow-hidden" href="/deposit">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="absolute -inset-px bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-30 group-hover:animate-pulse rounded-lg"></span>
              <span className="relative z-10 flex items-center gap-2">
                {t("DÉPÔT")}
                <ArrowDownLeft size={16} className="transition-transform group-hover:translate-y-1 group-hover:animate-bounce" />
              </span>
            </a>

            <a className="group relative flex-none flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 w-40 border border-gray-700 overflow-hidden" href='/withdraw'>
              <span className="absolute inset-0 w-0 h-full bg-orange-600/20 transition-all duration-300 group-hover:w-full"></span>
              <span className="relative z-10 flex items-center gap-2">
                {t("RETRAIT")}
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-y-1 group-hover:-translate-x-1 group-hover:animate-pulse" />
              </span>
            </a>
            <a className="group relative flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 w-40 border border-gray-700 overflow-hidden" href='/coupon'>
              <span className="absolute inset-0 w-0 h-full from-orange-400 to-orange-600 transition-all duration-300 group-hover:w-full"></span>
              <span className="relative z-10 flex items-center gap-2">
                {t("COUPON")}
                <Ticket size={16} className="transition-transform group-hover:rotate-12 group-hover:animate-pulse" />
              </span>
            </a>
            <a className="group relative flex-none flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 w-40 border border-gray-700 overflow-hidden" href='/bet_id'>
              <span className="absolute inset-0 w-0 h-full bg-orange-600/20 transition-all duration-300 group-hover:w-full"></span>
              <span className="relative z-10 flex items-center gap-2">
                {t("MES ID")}
                <CreditCard size={16} className="transition-transform group-hover:translate-x-1 group-hover:animate-pulse" />
              </span>
            </a>
          </div>
        </div>

        {/* Transaction History */}
        <TransactionHistory/>

        {/* Multi-channel contact FAB */}
        {showContactFab ? (
          <div ref={popoverRef} className="fixed bottom-24 right-6 z-40">
            {isChatPopoverOpen && (
              <div className="absolute bottom-full right-0 mb-3 w-64 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-xl">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Besoin d&apos;aide ?</h3>
                  <p className="text-xs text-gray-500">Contactez-nous via :</p>
                </div>
                <div className="space-y-2">
                  {chatbotEnabled && (
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-orange-50 dark:hover:bg-orange-950/30 transition"
                      onClick={() => {
                        setIsChatPopoverOpen(false);
                        setIsChatbotOpen(true);
                      }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-orange-600">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-medium text-sm text-gray-900 dark:text-white">Assistant IA</span>
                        <span className="block text-xs text-gray-500">Réponse instantanée</span>
                      </div>
                    </button>
                  )}
                  {whatsappEnabled && whatsappUrl ? (
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-green-50 dark:hover:bg-green-950/30 transition"
                      onClick={() => {
                        window.open(whatsappUrl, '_blank');
                        setIsChatPopoverOpen(false);
                      }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-600">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-medium text-sm text-gray-900 dark:text-white">WhatsApp</span>
                        <span className="block text-xs text-gray-500">Réponse rapide</span>
                      </div>
                    </button>
                  ) : null}
                  {telegramEnabled && telegramUrl ? (
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                      onClick={() => {
                        window.open(telegramUrl, '_blank');
                        setIsChatPopoverOpen(false);
                      }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-600">
                        <Send className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-medium text-sm text-gray-900 dark:text-white">Telegram</span>
                        <span className="block text-xs text-gray-500">Support 24/7</span>
                      </div>
                    </button>
                  ) : null}
                </div>
              </div>
            )}
            <button
              type="button"
              aria-label="Ouvrir le chat"
              onClick={() => {
                const next = !isChatPopoverOpen;
                setIsChatPopoverOpen(next);
                if (next) void refreshSettings();
              }}
              className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              {isChatPopoverOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </button>
          </div>
        ) : null}

        {isChatbotOpen && chatbotEnabled && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
            <div className="w-full sm:max-w-lg mx-auto flex flex-col bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl h-[min(80vh,640px)] max-h-[calc(100dvh-2rem)]">
              <div className="shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
                <div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">Assistant IA</p>
                  <p className="text-sm text-gray-500">Tapez votre message en bas</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChatbotOpen(false)}
                  className="w-10 h-10 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 min-h-0 px-3 pb-3">
                <SupportChatbot
                  hideHeader
                  pageKey="dashboard"
                  route="/dashboard"
                  screenTitle="Dashboard"
                />
              </div>
            </div>
          </div>
        )}

        <Footer/>
      </main>
    </div>
  );
}
