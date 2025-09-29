"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendConfirmationEmail = sendConfirmationEmail;
// services/emailService.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail", // pode trocar por SendGrid/Mailgun/SES
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
async function sendConfirmationEmail(to, token) {
    const confirmUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;
    await transporter.sendMail({
        from: `"UxStore" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Confirme seu e-mail",
        html: `
      <h1>Confirmação de E-mail</h1>
      <p>Clique no link abaixo para confirmar seu e-mail:</p>
      <a href="${confirmUrl}">${confirmUrl}</a>
    `,
    });
}
