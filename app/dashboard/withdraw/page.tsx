"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { CoinIcon } from "@/components/crypto/coin-icon"
import { useStore, submitWithdrawal } from "@/lib/store"
import { type CoinType, coinNetworks, coinDetails } from "@/lib/mock-data"

const coins: CoinType[] = ["USDT", "BTC", "ETH", "BNB", "TRX", "SOL"]

const networkLabels: Partial<Record<string, string>> = {
  BEP20: "BEP20 (BSC)",
  BTC: "BTC Network",
  SOL: "SOL Network",
  USDT0: "USDT0",
}

export default function WithdrawPage() {
  const store = useStore()
  const [amount, setAmount] = useState("")
  const [selectedCoin, setSelectedCoin] = useState<CoinType | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)
  const [address, setAddress] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxAmount = store.balance

  const handleMax = () => {
    setAmount(maxAmount.toString())
  }

  const handleSubmit = () => {
    setError(null)
    const numAmount = parseFloat(amount)

    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount.")
      return
    }
    if (numAmount > maxAmount) {
      setError("Amount exceeds your available balance.")
      return
    }
    if (numAmount < 10) {
      setError("Minimum withdrawal amount is $10.")
      return
    }
    if (!selectedCoin) {
      setError("Please select a coin type.")
      return
    }
    if (!selectedNetwork) {
      setError("Please select a network.")
      return
    }
    if (!address.trim()) {
      setError("Please enter a wallet address.")
      return
    }

    submitWithdrawal({
      amount: numAmount,
      coinType: selectedCoin,
      network: selectedNetwork,
      address: address.trim(),
    })

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to dashboard</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Withdraw Funds
            </h1>
          </div>
        </div>

        <Card className="border-accent/30">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Withdrawal Submitted
            </h2>
            <p className="max-w-md text-center text-sm text-muted-foreground">
              Your withdrawal request for{" "}
              <span className="font-semibold text-foreground">
                ${parseFloat(amount).toLocaleString()}
              </span>{" "}
              has been submitted and is awaiting admin approval. You will be
              notified once your request has been processed.
            </p>
            <div className="mt-2 rounded-lg bg-warning/10 px-4 py-3">
              <p className="text-xs font-medium text-warning-foreground">
                Processing typically takes 1-24 hours. Please check your
                transactions page for status updates.
              </p>
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard/transactions">View Transactions</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to dashboard</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Withdraw Funds
          </h1>
          <p className="text-sm text-muted-foreground">
            Withdraw funds from your account to your crypto wallet.
          </p>
        </div>
      </div>

      {/* Balance info */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-xs text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold text-foreground">
              ${maxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
            <ArrowDownRight className="h-5 w-5 text-accent" />
          </div>
        </CardContent>
      </Card>

      {/* Amount */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            Withdrawal Amount
          </CardTitle>
          <CardDescription>
            Enter the amount you wish to withdraw (min $10).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount" className="sr-only">
              Amount
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  min={10}
                  max={maxAmount}
                  step={0.01}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleMax}
                className="text-xs"
              >
                MAX
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coin selection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            Select Coin
          </CardTitle>
          <CardDescription>
            Choose the cryptocurrency for your withdrawal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {coins.map((coin) => {
              const details = coinDetails[coin]
              const isSelected = selectedCoin === coin
              return (
                <button
                  key={coin}
                  onClick={() => {
                    setSelectedCoin(coin)
                    setSelectedNetwork(null)
                  }}
                  className={`flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all ${
                    isSelected
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-border bg-card hover:border-muted-foreground/30 hover:bg-secondary/50"
                  }`}
                >
                  <CoinIcon coin={coin} size={36} />
                  <div className="text-center">
                    <p
                      className={`text-sm font-semibold ${isSelected ? "text-foreground" : "text-card-foreground"}`}
                    >
                      {coin}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {details.name}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Network selection */}
      {selectedCoin && (
        <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              Select Network
            </CardTitle>
            <CardDescription>
              Choose the blockchain network for your withdrawal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {coinNetworks[selectedCoin].map((network) => {
                const isSelected = selectedNetwork === network
                return (
                  <button
                    key={network}
                    onClick={() => setSelectedNetwork(network)}
                    className={`flex items-center gap-2 rounded-lg border-2 px-5 py-3 text-sm font-medium transition-all ${
                      isSelected
                        ? "border-accent bg-accent/5 text-foreground shadow-sm"
                        : "border-border bg-card text-card-foreground hover:border-muted-foreground/30 hover:bg-secondary/50"
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${isSelected ? "bg-accent" : "bg-muted-foreground/30"}`}
                    />
                    {networkLabels[network] || network}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet address */}
      {selectedCoin && selectedNetwork && (
        <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                4
              </span>
              Wallet Address
            </CardTitle>
            <CardDescription>
              Enter the destination wallet address for your {selectedCoin}{" "}
              withdrawal on {selectedNetwork}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="address" className="sr-only">
                Wallet Address
              </Label>
              <Input
                id="address"
                placeholder={`Enter your ${selectedCoin} address`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">
                {"Make sure the address is correct and on the"}{" "}
                <span className="font-medium text-foreground">
                  {selectedNetwork}
                </span>{" "}
                network. Withdrawals to incorrect addresses cannot be reversed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        size="lg"
        disabled={
          !amount || !selectedCoin || !selectedNetwork || !address.trim()
        }
      >
        Submit Withdrawal Request
      </Button>
    </div>
  )
}
