import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "ar1467306@gmail.com",
    pass: "wyzg umqc xffo ksoq",
  },

    tls: {
        rejectUnauthorized: false 
    }
});

export async function sendVerificationEmail(email, otp) {
  const mailOptions = {
    from: 'AEIOU Support',
    to: email,
    subject: 'Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Thank you for registering! Use the OTP below to verify your email address:</p>
        <div style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}