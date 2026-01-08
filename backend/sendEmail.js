import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
    apiKey: process.env.MAILSEND_API_KEY,
});

export async function sendEmail (emailOrObject, subjectOrUndefined, textOrUndefined) {
    // Handle both calling conventions:
    // 1. sendEmail({email: "...", subject: "...", text: "..."}) - from better-auth
    // 2. sendEmail(email, subject, text) - from other parts
    
    let email, subject, text;
    
    if (typeof emailOrObject === 'object' && emailOrObject !== null) {
        // Better-auth style: {email, subject, text} or {to, subject, text}
        email = emailOrObject.email || emailOrObject.to;
        subject = emailOrObject.subject;
        text = emailOrObject.text;
    } else {
        // Original style: separate parameters
        email = emailOrObject;
        subject = subjectOrUndefined;
        text = textOrUndefined;
    }

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