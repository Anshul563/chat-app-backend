import "dotenv/config";
import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

async function main() {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is undefined");
    }
    console.log("Attempting to send email via Brevo API...");

    // NOTE: Sender must be a verified sender in Brevo
    const senderEmail =
      process.env.BF_SENDER_EMAIL || "anshulshakya520@gmail.com";

    await tranEmailApi.sendTransacEmail({
      sender: {
        email: senderEmail,
        name: "Test Script",
      },
      to: [{ email: senderEmail }], // Send to self
      subject: "Test Email via Brevo API",
      htmlContent: "<p>If you receive this, Brevo API config is working.</p>",
    });
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Email failed:", error);
  }
}

main();
