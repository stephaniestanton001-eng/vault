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
import {
  useStore,
  approveWithdrawal,
  rejectWithdrawal,
} from "@/lib/store"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ArrowDownRight,
  Wallet,
} from "lucide-react"

type StatusFilter = "all" | "pending" | "approved" | "rejected"

export default function AdminWithdrawalsPage() {
  const store = useStore()
  const [filter, setFilter] = useState<StatusFilter>("all")

  const filtered =
    filter === "all"
      ? store.withdrawals
      : store.withdrawals.filter((w) => w.status === filter)

  const pendingCount = store.withdrawals.filter(
    (w) => w.status === "pending"
  ).length
  const approvedCount = store.withdrawals.filter(
    (w) => w.status === "approved"
  ).length
  const rejectedCount = store.withdrawals.filter(
    (w) => w.status === "rejected"
  ).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Withdrawal Requests
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and process user withdrawal requests.
        </p>
      </div>

      {/* Status summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-bold text-card-foreground">
                  {pendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-lg font-bold text-card-foreground">
                  {approvedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="text-lg font-bold text-card-foreground">
                  {rejectedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and list */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Filter className="h-4 w-4 text-muted-foreground" />
            All Withdrawal Requests
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map(
              (status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className="text-xs capitalize"
                >
                  {status}
                </Button>
              )
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No withdrawal requests found.
              </p>
            ) : (
              filtered.map((wd) => (
                <div
                  key={wd.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-card-foreground">
                        Withdrawal - {wd.coinType} ({wd.network})
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        <span>User: {wd.userId}</span>
                        <span>{"/"}</span>
                        <span>{wd.createdAt}</span>
                      </div>
                      <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                        To: {wd.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-card-foreground">
                        ${wd.amount.toLocaleString()}
                      </p>
                      <Badge
                        variant={
                          wd.status === "approved"
                            ? "secondary"
                            : wd.status === "pending"
                              ? "outline"
                              : "destructive"
                        }
                        className="mt-0.5 text-[10px] px-1.5 py-0"
                      >
                        {wd.status}
                      </Badge>
                    </div>

                    {wd.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground"
                          onClick={() => approveWithdrawal(wd.id)}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => rejectWithdrawal(wd.id)}
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
