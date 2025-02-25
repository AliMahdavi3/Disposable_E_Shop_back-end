const nodemailer = require('nodemailer');

const sendEmail = async ({ option }) => {
    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "bdb28791ffb5ed",
            pass: "7d692026cf7232"
        }
    });

    const mailOption = {
        from: "alimahdavi30000@gmail.com",
        to: option.userEmail,
        subject: option.subject,
        html: option.html,
    };

    try {
        await transport.sendMail(mailOption);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email sending failed');
    }
}

module.exports = sendEmail;