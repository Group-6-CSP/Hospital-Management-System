// JavaScript source code
import React, { useState } from "react";
import { loginUser } from "../services/authService";

function Login() {
    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!credentials.email || !credentials.password) {
            setMessage("Email and Password are required");
            return;
        }

        try {
            const res = await loginUser(credentials);
            setMessage(res.message);
        } catch (err) {
            setMessage(err.error);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default Login;