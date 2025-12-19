import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
    apiKey: process.env.MAILSEND_API_KEY,
});

export async function sendEmail (email, subject, text) {


    const sentFrom = new Sender("arfanahmed2003@gmail.com", "Ahmed - DevRim");

    const recipients = [
        new Recipient(email)
    ];

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(subject)
        .setHtml(text);

    await mailerSend.email.send(emailParams);
}