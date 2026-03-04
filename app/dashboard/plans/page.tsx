"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useStore, submitInvestment } from "@/lib/store"
import type { InvestmentPlan } from "@/lib/mock-data"
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Wallet,
} from "lucide-react"

const riskConfig = {
  Low: {
    icon: Shield,
    color: "text-accent",
    bg: "bg-accent/10",
    badge: "border-accent/30 text-accent",
  },
  Medium: {
    icon: TrendingUp,
    color: "text-warning",
    bg: "bg-warning/10",
    badge: "border-warning/30 text-warning",
  },
  High: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    badge: "border-destructive/30 text-destructive",
  },
}

export default function PlansPage() {
  const store = useStore()
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null)
  const [investAmount, setInvestAmount] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInvestNow = (plan: InvestmentPlan) => {
    setSelectedPlan(plan)
    setInvestAmount("")
    setError(null)
    setSuccess(false)
  }

  const handleSubmitInvestment = () => {
    if (!selectedPlan) return
    setError(null)

    const amount = parseFloat(investAmount)
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount.")
      return
    }
    if (amount < selectedPlan.minAmount) {
      setError(`Minimum investment for this plan is $${selectedPlan.minAmount.toLocaleString()}.`)
      return
    }
    if (amount > selectedPlan.maxAmount) {
      setError(`Maximum investment for this plan is $${selectedPlan.maxAmount.toLocaleString()}.`)
      return
    }
    if (amount > store.available) {
      setError("Insufficient balance. You cannot invest more than your available balance.")
      return
    }

    submitInvestment(selectedPlan.id, amount)
    setSuccess(true)
  }

  const handleClose = () => {
    setSelectedPlan(null)
    setInvestAmount("")
    setError(null)
    setSuccess(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Investment Plans
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse available investment strategies and start growing your
          portfolio.
        </p>
      </div>

      {/* Active investments summary */}
      {store.activeInvestments.filter((i) => !i.completed).length > 0 && (
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <TrendingUp className="h-4 w-4 text-accent" />
              Active Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {store.activeInvestments
                .filter((i) => !i.completed)
                .map((inv) => {
                  const elapsed = Date.now() - inv.startedAt
                  const progress = Math.min(100, (elapsed / inv.durationMs) * 100)
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {inv.planName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${inv.amount.toLocaleString()} invested at {inv.returnRate}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-accent">
                          +${inv.accruedReturn.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {progress.toFixed(0)}% complete
                        </p>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {store.investmentPlans.map((plan) => {
          const risk = riskConfig[plan.risk]
          const RiskIcon = risk.icon
          return (
            <Card
              key={plan.id}
              className="flex flex-col transition-all hover:shadow-lg hover:border-accent/20"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${risk.bg}`}
                    >
                      <RiskIcon className={`h-5 w-5 ${risk.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base text-card-foreground">
                        {plan.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-[10px] ${risk.badge}`}
                      >
                        {plan.risk} Risk
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">
                      {plan.returnRate}%
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Returns
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-auto grid grid-cols-3 gap-4 border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Min</p>
                      <p className="text-xs font-semibold text-card-foreground">
                        ${plan.minAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Max</p>
                      <p className="text-xs font-semibold text-card-foreground">
                        ${plan.maxAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Duration
                      </p>
                      <p className="text-xs font-semibold text-card-foreground">
                        {plan.duration}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  className="mt-5 w-full"
                  onClick={() => handleInvestNow(plan)}
                >
                  Invest Now
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Invest Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <CheckCircle2 className="h-8 w-8 text-accent" />
              </div>
              <DialogHeader className="items-center">
                <DialogTitle className="text-foreground">Investment Submitted</DialogTitle>
                <DialogDescription className="text-center">
                  Your investment of ${parseFloat(investAmount).toLocaleString()} in{" "}
                  {selectedPlan?.name} has been activated. Returns will accrue
                  every 30 minutes at {selectedPlan?.returnRate}% over{" "}
                  {selectedPlan?.duration}.
                </DialogDescription>
              </DialogHeader>
              <Button onClick={handleClose} className="mt-2">
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Invest in {selectedPlan?.name}
                </DialogTitle>
                <DialogDescription>
                  Enter the amount you want to invest. Funds will be deducted
                  from your available balance.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-5 py-4">
                {/* Balance display */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Available Balance
                    </span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    ${store.available.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Plan summary */}
                <div className="grid grid-cols-3 gap-3 rounded-lg border border-border p-3">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Return Rate</p>
                    <p className="text-sm font-bold text-accent">
                      {selectedPlan?.returnRate}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Duration</p>
                    <p className="text-sm font-bold text-foreground">
                      {selectedPlan?.duration}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Min / Max</p>
                    <p className="text-sm font-bold text-foreground">
                      ${selectedPlan?.minAmount.toLocaleString()} -{" "}
                      ${selectedPlan?.maxAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Amount input */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invest-amount">Investment Amount</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="invest-amount"
                        type="number"
                        placeholder="0.00"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        className="pl-7"
                        min={selectedPlan?.minAmount}
                        max={Math.min(
                          selectedPlan?.maxAmount ?? 0,
                          store.available
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="text-xs"
                      onClick={() =>
                        setInvestAmount(
                          Math.min(
                            selectedPlan?.maxAmount ?? 0,
                            store.available
                          ).toString()
                        )
                      }
                    >
                      MAX
                    </Button>
                  </div>
                  {investAmount && parseFloat(investAmount) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Estimated return:{" "}
                      <span className="font-medium text-accent">
                        $
                        {(
                          (parseFloat(investAmount) *
                            (selectedPlan?.returnRate ?? 0)) /
                          100
                        ).toFixed(2)}
                      </span>{" "}
                      over {selectedPlan?.duration}
                    </p>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleSubmitInvestment}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={!investAmount || parseFloat(investAmount) <= 0}
                >
                  Confirm Investment
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
