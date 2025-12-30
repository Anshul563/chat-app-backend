import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendOtpEmail = async (email, otp) => {
  await tranEmailApi.sendTransacEmail({
    sender: {
      email: "anshulshakya520@gmail.com", // VERIFIED SENDER
      name: "Chat App",
    },
    to: [{ email }],
    subject: "Your OTP Code",
    htmlContent: `
      <h2>Email Verification</h2>
      <h1>${otp}</h1>
      <p>Valid for 5 minutes</p>
    `,
  });
};
