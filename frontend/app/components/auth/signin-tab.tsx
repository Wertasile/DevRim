import React, { useState } from 'react'
import { authClient } from "../../lib/auth-client";

const SignInTab = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const handleGoogleSignIn = async (e:any) => {
      e.preventDefault()

      try {
        const data = await authClient.signIn.social({
          provider: "google",
        });
      } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
      }

    }

    const handleSignIn = async (e: any) => {
      e.preventDefault(); // prevent page reload
  
      try {
        const { data, error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/blog",
          rememberMe: false
        }, {
            onError: (ctx) => {
                // Handle the error
                // if(ctx.error.status === 403) {
                //     alert("Please verify your email address")
                // }
                //you can also show the original error message
                alert(ctx.error.message)
            }
        })
  
        if (error) {
          console.error(error);
          alert(error.message);
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
      }
    };
  
    return (
    <form
      autoComplete="on"
      className="bg-[#262626] text-gray w-fit flex flex-col gap-2 rounded-[5px] p-4"
      onSubmit={handleSignIn}
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

      <div className="form-element">
        <button
          type="button"
          disabled={isSubmitting}
          className={`bg-white text-black font-bold rounded-3xl p-2 cursor-pointer w-[250px] hover:bg-[#DDDDDD] ease-in-out duration-300 mx-auto ${isSubmitting && ("bg-[#353535]")}`}
          onClick={(e) => handleGoogleSignIn(e)}
          id="primary-btn"
        >
          SIGN IN USING GOOGLE
        </button>
      </div>
    </form>
    );
}

export default SignInTab