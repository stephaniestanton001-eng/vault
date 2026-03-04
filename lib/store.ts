"use client"

import { useSyncExternalStore, useCallback } from "react"
import {
  currentUser,
  transactions as initialTransactions,
  investmentPlans as initialPlans,
  type Transaction,
  type InvestmentPlan,
} from "@/lib/mock-data"

// ── Types ─────────────────────────────────────────────────────────────

export type Withdrawal = {
  id: string
  userId: string
  amount: number
  coinType: string
  network: string
  address: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export type ActiveInvestment = {
  id: string
  userId: string
  planId: string
  planName: string
  amount: number
  returnRate: number
  durationMs: number
  startedAt: number // timestamp
  lastAccrualAt: number // timestamp
  accruedReturn: number
  completed: boolean
}

export type ChatMessage = {
  id: string
  sender: "user" | "support"
  text: string
  timestamp: number
}

type StoreState = {
  balance: number
  transactions: Transaction[]
  withdrawals: Withdrawal[]
  activeInvestments: ActiveInvestment[]
  investmentPlans: InvestmentPlan[]
  chatMessages: ChatMessage[]
  chatOpen: boolean
  notifications: number
}

// ── Singleton store ──────────────────────────────────────────────────

let state: StoreState = {
  balance: currentUser.balance,
  transactions: [...initialTransactions],
  withdrawals: [],
  activeInvestments: [],
  investmentPlans: initialPlans.map((p) => ({ ...p })),
  chatMessages: [
    {
      id: "welcome",
      sender: "support",
      text: "Hello! Welcome to Vault support. How can we help you today?",
      timestamp: Date.now(),
    },
  ],
  chatOpen: false,
  notifications: 0,
}

const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

// ── Mutations ────────────────────────────────────────────────────────

export function submitWithdrawal(data: {
  amount: number
  coinType: string
  network: string
  address: string
}) {
  const withdrawal: Withdrawal = {
    id: `wd-${Date.now()}`,
    userId: "u1",
    amount: data.amount,
    coinType: data.coinType,
    network: data.network,
    address: data.address,
    status: "pending",
    createdAt: new Date().toISOString().split("T")[0],
  }

  const tx: Transaction = {
    id: `t-${Date.now()}`,
    userId: "u1",
    type: "withdrawal",
    amount: data.amount,
    status: "pending",
    description: `Withdrawal ${data.amount} ${data.coinType} (${data.network})`,
    date: new Date().toISOString().split("T")[0],
  }

  state = {
    ...state,
    balance: state.balance - data.amount,
    withdrawals: [withdrawal, ...state.withdrawals],
    transactions: [tx, ...state.transactions],
  }
  emitChange()
}

export function approveWithdrawal(id: string) {
  state = {
    ...state,
    withdrawals: state.withdrawals.map((w) =>
      w.id === id ? { ...w, status: "approved" as const } : w
    ),
    transactions: state.transactions.map((t) =>
      t.description.includes(id.replace("wd-", ""))
        ? { ...t, status: "approved" as const }
        : t
    ),
  }
  emitChange()
}

export function rejectWithdrawal(id: string) {
  const wd = state.withdrawals.find((w) => w.id === id)
  state = {
    ...state,
    balance: wd ? state.balance + wd.amount : state.balance,
    withdrawals: state.withdrawals.map((w) =>
      w.id === id ? { ...w, status: "rejected" as const } : w
    ),
    transactions: state.transactions.map((t) =>
      t.description.includes(id.replace("wd-", ""))
        ? { ...t, status: "rejected" as const }
        : t
    ),
  }
  emitChange()
}

function parseDuration(duration: string): number {
  const num = parseInt(duration)
  if (duration.includes("month")) return num * 30 * 24 * 60 * 60 * 1000
  if (duration.includes("day")) return num * 24 * 60 * 60 * 1000
  if (duration.includes("hour")) return num * 60 * 60 * 1000
  if (duration.includes("min")) return num * 60 * 1000
  return num * 30 * 24 * 60 * 60 * 1000
}

export function submitInvestment(planId: string, amount: number) {
  const plan = state.investmentPlans.find((p) => p.id === planId)
  if (!plan) return
  if (amount > state.balance) return

  const now = Date.now()
  const investment: ActiveInvestment = {
    id: `inv-${now}`,
    userId: "u1",
    planId: plan.id,
    planName: plan.name,
    amount,
    returnRate: plan.returnRate,
    durationMs: parseDuration(plan.duration),
    startedAt: now,
    lastAccrualAt: now,
    accruedReturn: 0,
    completed: false,
  }

  const tx: Transaction = {
    id: `t-${now}`,
    userId: "u1",
    type: "investment",
    amount,
    status: "approved",
    description: `Investment in ${plan.name}`,
    date: new Date().toISOString().split("T")[0],
  }

  state = {
    ...state,
    balance: state.balance - amount,
    activeInvestments: [...state.activeInvestments, investment],
    transactions: [tx, ...state.transactions],
  }
  emitChange()
}

// Called every 30 minutes (or on demand) to accrue returns
export function accrueReturns() {
  const now = Date.now()
  let balanceDelta = 0
  const newTxs: Transaction[] = []

  const updatedInvestments = state.activeInvestments.map((inv) => {
    if (inv.completed) return inv

    const elapsed = now - inv.startedAt
    const isComplete = elapsed >= inv.durationMs

    // Calculate how many 30-min intervals since last accrual
    const INTERVAL = 30 * 60 * 1000 // 30 min in ms
    const intervalsSinceLast = Math.floor(
      (now - inv.lastAccrualAt) / INTERVAL
    )

    if (intervalsSinceLast < 1 && !isComplete) return inv

    // Total return for the entire duration
    const totalReturn = (inv.amount * inv.returnRate) / 100
    // Total intervals across the full duration
    const totalIntervals = Math.max(1, Math.floor(inv.durationMs / INTERVAL))
    // Return per interval
    const returnPerInterval = totalReturn / totalIntervals

    let accrual: number
    if (isComplete) {
      // Give remaining return
      accrual = totalReturn - inv.accruedReturn
    } else {
      accrual = returnPerInterval * intervalsSinceLast
    }

    if (accrual > 0) {
      balanceDelta += accrual
      newTxs.push({
        id: `t-ret-${now}-${inv.id}`,
        userId: "u1",
        type: "return",
        amount: Math.round(accrual * 100) / 100,
        status: "approved",
        description: `Return from ${inv.planName}`,
        date: new Date().toISOString().split("T")[0],
      })
    }

    if (isComplete) {
      // Return the principal
      balanceDelta += inv.amount
      newTxs.push({
        id: `t-principal-${now}-${inv.id}`,
        userId: "u1",
        type: "return",
        amount: inv.amount,
        status: "approved",
        description: `Principal returned - ${inv.planName}`,
        date: new Date().toISOString().split("T")[0],
      })
    }

    return {
      ...inv,
      lastAccrualAt: now,
      accruedReturn: isComplete ? totalReturn : inv.accruedReturn + accrual,
      completed: isComplete,
    }
  })

  if (balanceDelta > 0 || newTxs.length > 0) {
    state = {
      ...state,
      balance: Math.round((state.balance + balanceDelta) * 100) / 100,
      activeInvestments: updatedInvestments,
      transactions: [...newTxs, ...state.transactions],
    }
    emitChange()
  }
}

export function updatePlan(
  planId: string,
  updates: { returnRate?: number; duration?: string }
) {
  state = {
    ...state,
    investmentPlans: state.investmentPlans.map((p) =>
      p.id === planId ? { ...p, ...updates } : p
    ),
  }
  emitChange()
}

export function toggleChat() {
  state = {
    ...state,
    chatOpen: !state.chatOpen,
    notifications: state.chatOpen ? state.notifications : 0,
  }
  emitChange()
}

export function sendChatMessage(text: string) {
  const msg: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender: "user",
    text,
    timestamp: Date.now(),
  }
  state = {
    ...state,
    chatMessages: [...state.chatMessages, msg],
  }
  emitChange()

  // Auto-reply after 1.5s
  setTimeout(() => {
    const reply: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "support",
      text: "Thank you for your message. A support agent will be with you shortly. Our typical response time is under 5 minutes.",
      timestamp: Date.now(),
    }
    state = {
      ...state,
      chatMessages: [...state.chatMessages, reply],
      notifications: state.chatOpen ? 0 : state.notifications + 1,
    }
    emitChange()
  }, 1500)
}

export function setBalance(newBalance: number) {
  state = { ...state, balance: newBalance }
  emitChange()
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useStore() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return snap
}
