"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Briefcase, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const openPositions = [
  {
    title: "Remote Administrative Assistant",
    type: "Full-time",
    location: "Remote",
    summary:
      "Support executive operations and keep the team organized with remote administrative coordination and communication.",
    responsibilities: [
      "Manage schedules, travel, and email correspondence efficiently.",
      "Prepare documents, reports, and meeting materials.",
      "Coordinate virtual meetings and make sure follow-ups are completed.",
      "Maintain confidential records and assist with day-to-day administrative tasks.",
    ],
  },
]

export default function CareersPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [selectedPositionTitle, setSelectedPositionTitle] = useState(openPositions[0].title)
  const [resumeLink, setResumeLink] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")

  const selectedPosition = useMemo(
    () => openPositions.find((position) => position.title === selectedPositionTitle) ?? openPositions[0],
    [selectedPositionTitle],
  )
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    setStatus("sending")
    setStatusMessage("")

    try {
      const response = await fetch("/api/careers", {
        method: "POST",
        body: data,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || "Unable to submit application")
      }

      setStatus("success")
      // redirect to the confirmation page
      router.push("/careers/thank-you")
    } catch (error) {
      setStatus("error")
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending your application.",
      )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              Open roles
            </div>
            <h1 className="mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Apply for a role at Vault
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
              Explore our available positions below. Choose the role that best fits your strengths and submit your application in one professional workflow.
            </p>

            <div className="mt-12 space-y-6">
              {openPositions.map((position) => (
                <div key={position.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">{position.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {position.type} • {position.location}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                      {position.type}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{position.summary}</p>
                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Responsibilities</h3>
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                      {position.responsibilities.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Apply now</p>
                <p className="text-xs text-muted-foreground">Your application will be sent directly to our recruiting team.</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Selected role</p>
              <p className="mt-1 text-sm text-foreground">{selectedPosition.title}</p>
              <p className="mt-2 text-sm leading-6">{selectedPosition.summary}</p>
            </div>

            {status !== "idle" && (
              <div
                className={`mt-6 rounded-3xl border p-4 text-sm ${
                  status === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-destructive/30 bg-destructive/5 text-destructive-900"
                }`}
                role="status"
                aria-live="polite"
              >
                {statusMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" encType="multipart/form-data">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Alex Thompson"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="position">Position applying for</Label>
                  <select
                    id="position"
                    name="position"
                    className="border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    value={selectedPositionTitle}
                    onChange={(event) => setSelectedPositionTitle(event.target.value)}
                    required
                  >
                    {openPositions.map((position) => (
                      <option key={position.title} value={position.title}>
                        {position.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="resume">Resume or portfolio URL</Label>
                <Input
                  id="resume"
                  name="resumeLink"
                  type="url"
                  value={resumeLink}
                  onChange={(event) => setResumeLink(event.target.value)}
                  placeholder="https://"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="cv">Upload CV</Label>
                <input
                  id="cv"
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => setCvFile(event.target.files?.[0] ?? null)}
                  className="border-input h-11 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Upload your CV as a PDF or Word document.
                </p>
                {cvFile && (
                  <p className="text-sm text-muted-foreground">Selected file: {cvFile.name}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="cover-letter">Cover letter</Label>
                <Textarea
                  id="cover-letter"
                  name="coverLetter"
                  value={coverLetter}
                  onChange={(event) => setCoverLetter(event.target.value)}
                  placeholder="Tell us why you are the right fit..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
                {status === "sending" ? "Sending application..." : "Submit application"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
