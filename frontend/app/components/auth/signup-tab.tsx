import React, { useState } from "react";
import { authClient } from "../../lib/auth-client";

const SignUpTab = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSignUp = async (e: any) => {
    e.preventDefault(); // prevent page reload
    setIsSubmitting(true)
    try {
      const { data, error } = await authClient.signUp.email(
        {
          email,
          password,
          name,
          
          // image, // optional
          // callbackURL: "/" // optional redirect
        },
        {
          onSuccess: () => {
            window.location.href = "/";
          },
          onError: (ctx) => {
              // Handle the error
              // if(ctx.error.status === 403) {
              //     alert("Please verify your email address")
              // }
              //you can also show the original error message
              alert(ctx.error.message)
          }
        }
      );

      if (error) {
        console.error(error);
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      autoComplete="on"
      className="bg-[#262626] text-gray w-fit flex flex-col gap-2 rounded-[5px] p-4"
      onSubmit={handleSignUp}
    >
      <div className="form-element">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          placeholder="Enter Email Address"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-element">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          placeholder="Enter Your Name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-element">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          placeholder="Enter Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="form-element">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`primary-btn w-[150px] mx-auto ${isSubmitting && ("bg-[#353535]")}`}
          id="primary-btn"
        >
          SIGN UP
        </button>
      </div>
    </form>
  );
};

export default SignUpTab;
