const nodemailer = require("nodemailer");

// ===============================
// GMAIL TRANSPORT
// ===============================
const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS,

    },

});

// ===============================
// GENERIC EMAIL SENDER
// ===============================
const sendEmail = async ({ to, subject, html }) => {

    try {

        await transporter.sendMail({

            from: `"MollyTech Service Desk" <${process.env.EMAIL_USER}>`,

            to,

            subject,

            html,

        });

        console.log(`📧 Email sent to ${to}`);

    } catch (err) {

        console.error("EMAIL ERROR:", err);

        throw err;

    }

};

module.exports = {

    sendEmail,

};