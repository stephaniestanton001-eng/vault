"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore, toggleChat, sendChatMessage } from "@/lib/store"
import { cn } from "@/lib/utils"

export function LiveChat() {
  const store = useStore()
  const [message, setMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [store.chatMessages])

  const handleSend = () => {
    if (!message.trim()) return
    sendChatMessage(message.trim())
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!store.chatOpen) {
    return (
      <button
        onClick={() => toggleChat()}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 lg:hidden"
        aria-label="Open live chat"
      >
        <MessageCircle className="h-6 w-6" />
        {store.notifications > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-accent-foreground">
            {store.notifications}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 flex h-[480px] w-full flex-col border-l border-t border-border bg-card shadow-2xl sm:bottom-6 sm:right-6 sm:h-[480px] sm:w-96 sm:rounded-xl sm:border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <MessageCircle className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Customer Support
            </p>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-[11px] text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => toggleChat()}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close chat</span>
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        {store.chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex max-w-[85%] flex-col gap-1",
              msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div
              className={cn(
                "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                msg.sender === "user"
                  ? "rounded-br-md bg-accent text-accent-foreground"
                  : "rounded-bl-md bg-secondary text-foreground"
              )}
            >
              {msg.text}
            </div>
            <span className="px-1 text-[10px] text-muted-foreground">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
