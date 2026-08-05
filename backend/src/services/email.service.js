const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");


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

                cid: "mollytechlogo@mollytech",

                contentType: "image/jpeg",

                contentDisposition: "inline",
            },
            ],

        });


        console.log(`📧 Email sent to ${to}`);


    } catch (err) {

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


    console.log("APPROVAL EMAIL DATA:", {
        email,
        firstName,
        loginLink
    });


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
// TICKET RESOLVED EMAIL
// ===============================
const sendTicketResolvedEmail = async ({
    email,
    firstName,
    ticketId,
    title,
}) => {


    const html = loadTemplate(

        "ticket.resolved.html",

        {

            firstName,

            ticketId,

            title,

            loginLink:
            "http://localhost:5173/login"

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

    sendTicketResolvedEmail,

};