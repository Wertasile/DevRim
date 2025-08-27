import React, { useState } from 'react'

const login = () => {

    const [email, setEmail] = useState()
    const [password, setPassword] = useState()

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
            <section id="login">
                <form id="login_form" autoComplete='on' className="card">
                    <div className="form-element">
                        <label htmlFor="email">Email Address</label>
                        <input id="email" placeholder="EnterEmail Address" name="email" type="email"/>
                    </div>
                    <div className="form-element">
                        <label htmlFor="password">Password</label>
                        {/* <input id="password" placeholder="Enter Password" onChange={(e) => {setPassword(e)}}name="password" type="password"/> */}
                    </div>
                    <div className="form-element">
                        <button type="button" id="link-to-register">New user ? , click here to sign up!</button>
                    </div>
                    <div className="form-element">
                        <button type="button" className="primary-btn" onClick={() => {login()}} id="login-btn">LOGIN</button>
                    </div> 
                </form>
            </section>
        </>
    )
}

export default login