"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react"

export function BalanceCard() {
  const store = useStore()

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(store.balance)

  const totalInvested = store.activeInvestments
    .filter((i) => !i.completed)
    .reduce((sum, i) => sum + i.amount, 0)
  const totalReturns = store.activeInvestments.reduce(
    (sum, i) => sum + i.accruedReturn,
    0
  )
  const available = store.balance

  return (
    <Card className="md:col-span-2 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Balance
        </CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight text-card-foreground">
          {formattedBalance}
        </p>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm">
            <ArrowUpRight className="h-3.5 w-3.5 text-accent" />
            <span className="text-accent">
              +${totalReturns.toFixed(2)}
            </span>
            <span className="text-muted-foreground">returns</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
            <span className="text-destructive">
              ${totalInvested.toLocaleString()}
            </span>
            <span className="text-muted-foreground">invested</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Invested</p>
            <p className="text-sm font-semibold text-card-foreground">
              ${totalInvested.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Returns</p>
            <p className="text-sm font-semibold text-accent">
              ${totalReturns.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Available</p>
            <p className="text-sm font-semibold text-card-foreground">
              ${available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
