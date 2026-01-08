import mongoose from "mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { sendEmail } from "./sendEmail.js";

// Ensure mongoose connection is ready
if (mongoose.connection.readyState === 0) {
  console.warn("Warning: Mongoose connection not established when better-auth is initialized");
}

export const auth = betterAuth({
  database: mongodbAdapter(mongoose.connection, {
    // Use the existing user collection
    collectionName: "users"
  }),
  user: {
    modelName: "user",
    fields: {
      image: "picture" 
    },
    additionalFields: {
      family_name: {
        type: "string",
        required: false,
      },
      given_name: {
        type: "string", 
        required: false,
      },
      googleId: {
        type: "string",
        required: false,
      },
      picture: {
        type: "string",
        defaultValue: "",
        required: false,
      },
      image: {
        type: "string",
        required: false,
      },
      byline: {
        type: "string",
        required: false,
      },
      about: {
        type: "string",
        required: false,
        defaultValue: ""
      },
      requestsSent: {
        type: "array",
        required: false,
        defaultValue: []
      },
      requestsReceived: {
        type: "array",
        required: false,
        defaultValue: []
      },
      connections: {
        type: "array",
        required: false,
        defaultValue: []
      },   
    },
  },
  emailAndPassword: { 
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({user, url}) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
    onPasswordReset: async ({ user }, request) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 5 }
  },
  socialProviders: {
    google: {
      prompt: "select_account", 
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET
    }
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({user, url}) => {
      try {
        await sendEmail({
          email: user.email,
          subject: "Verify Email",
          text: `Click the link to verify your email: ${url}`
        });
      } catch (error) {
        console.error("Error sending verification email:", error);
        // Don't throw - allow user creation even if email fails
      }
    }
  }
});

