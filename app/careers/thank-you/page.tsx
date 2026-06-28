import Link from "next/link"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-12 text-center">
        <h1 className="text-3xl font-bold text-foreground">Thank you for your application</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          We have received your application and our recruiting team will review it shortly. If your profile matches the role, we'll be in touch.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
