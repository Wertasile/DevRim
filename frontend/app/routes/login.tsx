import React, { useState } from 'react'
import SignInTab from '~/components/auth/signin-tab'
import SignUpTab from '~/components/auth/signup-tab'

const login = () => {

    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [tab,setTab] = useState<"signin" | "signup">("signin")

    const login = async function () {
        const response = await fetch("http://localhost:5000/users/login", {
        method: "post",
        credentials: "include", // to include cookies
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify({email, password})
        })

        if (response.ok){
            const data = await response.json();
            const accessToken = data.accessToken;
            const userId = data.id;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("userId", userId);

            window.location.href="/frontend/Pages/Home"
        }else{
            alert("Login Failed")
        }
    }

    return (
        <>
            <section id="login" className='mx-auto flex flex-col p-2 gap-2'>
                

                <div className='bg-[#262626] text-gray w-fit flex gap-2 rounded-[5px] p-1'>
                    <div 
                        className={`${tab == "signin" && ("text-white border-[1px]")} p-2 cursor-pointer`}
                        onClick={() => {setTab('signin')}}
                    >
                        Sign In
                    </div>
                    <div 
                        className={`${tab == "signup" && ("text-white border-[1px] ")} p-2 cursor-pointer`}
                        onClick={() => {setTab('signup')}}
                    >
                        Sign Up
                    </div>
                </div>
                {tab=='signin' &&
                <SignInTab/>
                }

                {tab=='signup' &&
                <SignUpTab/>
                }
                <div>

                </div>
            </section>
        </>
    )
}

export default login