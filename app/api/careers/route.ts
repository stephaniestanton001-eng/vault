import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const RECEIVER_EMAIL = process.env.CAREERS_RECEIVER_EMAIL
const SENDER_EMAIL = process.env.CAREERS_SENDER_EMAIL || SMTP_USER

async function sendEmail(data: {
  name: string
  email: string
  phone: string
  position: string
  resumeLink: string
  coverLetter: string
  cvFile?: File
}) {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !RECEIVER_EMAIL) {
    throw new Error(
      "Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and CAREERS_RECEIVER_EMAIL.",
    )
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })

  const attachments = []

  if (data.cvFile) {
    const arrayBuffer = await data.cvFile.arrayBuffer()
    attachments.push({
      filename: data.cvFile.name,
      content: Buffer.from(arrayBuffer),
      contentType: data.cvFile.type || "application/octet-stream",
    })
  }

  await transporter.sendMail({
    from: SENDER_EMAIL,
    to: RECEIVER_EMAIL,
    subject: `New candidate application: ${data.position}`,
    text: `New careers application:\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nPosition: ${data.position}\nResume/Portfolio: ${data.resumeLink || "Not provided"}\n\nCover Letter:\n${data.coverLetter}`,
    attachments,
  })
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const name = formData.get("name")?.toString().trim() || ""
    const email = formData.get("email")?.toString().trim() || ""
    const phone = formData.get("phone")?.toString().trim() || ""
    const position = formData.get("position")?.toString().trim() || ""
    const resumeLink = formData.get("resumeLink")?.toString().trim() || ""
    const coverLetter = formData.get("coverLetter")?.toString().trim() || ""
    const cvFile = formData.get("cv") as File | null

    const requiredFields = [
      { value: name, field: "name" },
      { value: email, field: "email" },
      { value: phone, field: "phone" },
      { value: position, field: "position" },
      { value: coverLetter, field: "coverLetter" },
      { value: cvFile, field: "cv" },
    ]

    for (const { value, field } of requiredFields) {
      if (!value) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    await sendEmail({
      name,
      email,
      phone,
      position,
      resumeLink,
      coverLetter,
      cvFile: cvFile ?? undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send application email" },
      { status: 500 },
    )
  }
}
