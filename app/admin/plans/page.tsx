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
import { useStore, updatePlan } from "@/lib/store"
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Edit3,
  Check,
  X,
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

export default function AdminPlansPage() {
  const store = useStore()
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [editRate, setEditRate] = useState("")
  const [editDuration, setEditDuration] = useState("")

  const startEdit = (planId: string) => {
    const plan = store.investmentPlans.find((p) => p.id === planId)
    if (!plan) return
    setEditingPlan(planId)
    setEditRate(plan.returnRate.toString())
    setEditDuration(plan.duration)
  }

  const handleSave = (planId: string) => {
    const rate = parseFloat(editRate)
    if (isNaN(rate) || rate <= 0) return
    if (!editDuration.trim()) return

    updatePlan(planId, {
      returnRate: rate,
      duration: editDuration.trim(),
    })
    setEditingPlan(null)
  }

  const handleCancel = () => {
    setEditingPlan(null)
    setEditRate("")
    setEditDuration("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Manage Investment Plans
        </h1>
        <p className="text-sm text-muted-foreground">
          Edit return rates and durations for all investment plans.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {store.investmentPlans.map((plan) => {
          const risk = riskConfig[plan.risk]
          const RiskIcon = risk.icon
          const isEditing = editingPlan === plan.id

          return (
            <Card
              key={plan.id}
              className="transition-all hover:shadow-sm"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Plan info */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${risk.bg}`}
                    >
                      <RiskIcon className={`h-5 w-5 ${risk.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-card-foreground">
                          {plan.name}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${risk.badge}`}
                        >
                          {plan.risk}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Min: ${plan.minAmount.toLocaleString()} / Max: ${plan.maxAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Edit section */}
                  {isEditing ? (
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label
                          htmlFor={`rate-${plan.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          Return Rate (%)
                        </Label>
                        <Input
                          id={`rate-${plan.id}`}
                          type="number"
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          className="h-9 w-28"
                          min={0.1}
                          step={0.1}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label
                          htmlFor={`duration-${plan.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          Duration
                        </Label>
                        <Input
                          id={`duration-${plan.id}`}
                          type="text"
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                          className="h-9 w-36"
                          placeholder="e.g. 6 months"
                        />
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-accent hover:text-accent"
                          onClick={() => handleSave(plan.id)}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Save</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-muted-foreground"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Cancel</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Return Rate
                        </p>
                        <p className="text-lg font-bold text-accent">
                          {plan.returnRate}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>
                        <p className="text-sm font-semibold text-card-foreground">
                          {plan.duration}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(plan.id)}
                      >
                        <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
