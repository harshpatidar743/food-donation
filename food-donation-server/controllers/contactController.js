const Contact = require("../models/contact");

const CONTACT_NOTIFICATION_EMAIL =
  process.env.CONTACT_NOTIFICATION_EMAIL ||
  process.env.CONTACT_RECEIVER_EMAIL ||
  "harshcu2@gmail.com";

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sendContactEmailNotification = async ({ name, email, message }) => {
  if (!process.env.RESEND_API_KEY) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "FoodMatch Website <onboarding@resend.dev>",
      to: [CONTACT_NOTIFICATION_EMAIL],
      subject: "New Contact Message from Website",
      reply_to: email,
      html: `
        <div>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.message || "Failed to send contact notification email");
  }

  return true;
};

exports.submitContactMessage = async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      message: req.body.message.trim()
    };

    const savedContact = await Contact.create(payload);

    let emailSent = false;

    try {
      emailSent = await sendContactEmailNotification(payload);
    } catch (emailError) {
      console.error("Contact notification email failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      data: {
        id: savedContact._id.toString(),
        emailSent
      }
    });
  } catch (error) {
    next(error);
  }
};
