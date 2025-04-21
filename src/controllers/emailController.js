const nodemailer = require("nodemailer");
const User = require("../models/user");
const path = require("path"); // ✅ move it outside function for good practice

const sendEmail = async (req, res) => {
  const { fileName, fileData } = req.body;
  const user = await User.findById(req.user._id);

  try {
    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: 'kushang.j@crestskillserve.com',
        pass: 'unor cyac wasq kldc', // ✅ Gmail App Password
      },
    });

    // Define the email options
    const mailOptions = {
      from: 'kushang.j@crestskillserve.com',
      to: user.email,
      subject: fileName === 'Order_Report' ? "Order Report" : "Transactions Report",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(90deg,rgb(201, 201, 201),rgb(248, 248, 248)); padding: 20px; text-align: center;">
              <img src="cid:wealthmaxlogo" alt="WealthMax Logo" style="max-height: 60px; margin-bottom: 10px;" />
              <h2 style="color:rgb(94, 94, 94); margin: 0;">Your Financial Growth Partner</h2>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #333;">Hi ${user.name || 'Valued User'},</p>
              <p style="font-size: 16px; color: #555;">
                Please find the attached <strong>${fileName === 'Order_Report' ? "Order Report" : "Transactions Report"}</strong>. We hope this helps you track your financial progress better.
              </p>
              <p style="font-size: 16px; color: #555;">
                If you have any questions, feel free to reply to this email. We're always here to help you on your WealthMax journey.
              </p>
            </div>
            <div style="border-top: 1px solid #eaeaea; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #666;">Best regards,</p>
              <p style="margin: 4px 0; font-size: 14px; font-weight: bold;">The WealthMax Team</p>
              <img src="cid:wealthmaxlogo" alt="WealthMax Logo" style="max-height: 40px; margin-top: 10px;" />
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: fileData,
          encoding: "base64",
        },
        {
          filename: 'full-logo.png',
          path: path.join(__dirname, '../full-logo.png'), // ✅ adjust path if needed
          cid: 'wealthmaxlogo', // ✅ must exactly match the cid in <img>
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: "Failed to send email." });
  }
};

module.exports = { sendEmail };
