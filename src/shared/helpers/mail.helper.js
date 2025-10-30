import Mailgen from "mailgen"
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.mailtrap_user,
        pass: process.env.mailtrap_pass,
    }
})

const mailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: 'E - Commerce',
        link: process.env.CLIENT_URL || "http://localhost:8000",
        copyright: `© ${new Date().getFullYear()} E - Commerce. All rights reserved.`,
    },
})

export { mailGenerator, mailTransporter }