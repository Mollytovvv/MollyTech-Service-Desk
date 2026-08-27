const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// ===============================
// GMAIL TRANSPORT
// ===============================

const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",

    port: 587,

    secure: false,

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS,

    },

    family: 4,

    connectionTimeout: 10000,

    greetingTimeout: 10000,

    socketTimeout: 10000,

});

// ===============================
// LOAD EMAIL TEMPLATE
// ===============================

const loadTemplate = (templateName, replacements = {}) => {

    const templatePath = path.join(
        __dirname,
        "../templates",
        templateName
    );

    let template = fs.readFileSync(
        templatePath,
        "utf8"
    );

    Object.keys(replacements).forEach((key) => {

        template = template.replace(
            new RegExp(`{{${key}}}`, "g"),
            replacements[key]
        );

    });

    return template;
};

// ===============================
// GENERIC EMAIL SENDER
// ===============================

const sendEmail = async ({ to, subject, html }) => {

    try {

        await transporter.sendMail({

            from:
            `"MollyTech Service Desk" <${process.env.EMAIL_USER}>`,

            to,

            subject,

            html,

            attachments: [
                {
                    filename: "mollytech_logo.jpg",

                    path: path.join(
                        __dirname,
                        "../../../frontend/src/assets/mollytech_logo.jpg"
                    ),

                    // MUST MATCH THE CID IN THE HTML TEMPLATE
                    cid: "mollytechlogo@mollytech",

                    contentType: "image/jpeg",

                    contentDisposition: "inline",
                },
            ],

        });

        console.log(`📧 Email sent to ${to}`);

    }
    catch (err) {

        console.error(
            "EMAIL ERROR:",
            err
        );

        throw err;

    }

};

// ===============================
// ACCOUNT APPROVED EMAIL
// ===============================

const sendApprovalEmail = async ({
    email,
    firstName,
    loginLink
}) => {

    console.log(
        "APPROVAL EMAIL DATA:",
        {
            email,
            firstName,
            loginLink
        }
    );

    const html = loadTemplate(
        "account.approved.html",
        {
            firstName,
            loginLink
        }
    );

    await sendEmail({

        to: email,

        subject:
        "Your MollyTech Service Desk account has been approved",

        html,

    });

};

// ===============================
// PASSWORD RESET EMAIL
// ===============================

const sendPasswordResetEmail = async ({
    email,
    resetLink
}) => {

    const html = loadTemplate(
        "reset.password.html",
        {
            resetLink
        }
    );

    await sendEmail({

        to: email,

        subject:
        "Reset your MollyTech Service Desk password",

        html,

    });

};

// ===============================
// PASSWORD CHANGED EMAIL
// ===============================

const sendPasswordChangedEmail = async ({
    email,
    role
}) => {

    const templateMap = {

        admin:
        "admin.password.change.html",

        user:
        "user.password.change.html",

        itsupport:
        "itsupport.password.change.html",

        technician:
        "technician.password.change.html",

    };

    const templateName =
        templateMap[role];

    if (!templateName) {

        throw new Error(
            `Unsupported password change email role: ${role}`
        );

    }

    const html = loadTemplate(
        templateName
    );

    await sendEmail({

        to: email,

        subject:
        "Your MollyTech Service Desk password was changed",

        html,

    });

};

// ===============================
// TICKET RESOLVED EMAIL
// ===============================

const sendTicketResolvedEmail = async ({
    email,
    firstName,
    ticketId,
    title,
}) => {

    const clientUrl =
        process.env.CLIENT_URL ||
        "http://localhost:5173";

    const html = loadTemplate(
        "ticket.resolved.html",
        {
            firstName,
            ticketId,
            title,
            loginLink:
            `${clientUrl}/login`
        }
    );

    await sendEmail({

        to: email,

        subject:
        `Your ticket ${ticketId} has been resolved`,

        html,

    });

};

module.exports = {

    sendEmail,

    sendApprovalEmail,

    sendPasswordResetEmail,

    sendPasswordChangedEmail,

    sendTicketResolvedEmail,

};