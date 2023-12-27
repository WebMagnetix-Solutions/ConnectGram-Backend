import env from "dotenv"
import mailer from "nodemailer"

env.config()

const transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD
    }
});

const mailOptions = {
    from: process.env.APP_EMAIL,
    to: null,
    subject: "Connect Gram Verification",
    html: null
  };

export const sendVerificationLink = async (email, uid) => {
    mailOptions.to = email
    const link = `${process.env.FRONT_END}/verify/${uid}`
    mailOptions.html = `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #4CAF50; text-align: center; margin-bottom: 20px; font-size: 28px;">Email Verification</h1>
                <p style="color: #555555; text-align: center; font-size: 16px;">Welcome Connect Gram! To get started, please click the button below to verify your email address:</p>
                <a href=${link} style="display: block; outline: none; border: 0; text-align: center; margin-top: 30px; margin-bottom: 30px; padding: 15px 30px; background-color: #4CAF50; color: #ffffff; text-decoration: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s; font-size: 18px;">Verify</a>
                <p style="text-align: center; color: #777777; font-size: 14px;">If the button above does not work, you can also copy and paste the following link into your browser:</p>
                <p style="text-align: center; color: #777777; font-size: 14px;">${link}</p>
            </div>
        </body>
    </html>
    `

    const promise = async () => {
        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    reject(false)
                }
                resolve(true)
            })
        })
    }

    return await promise()
}

