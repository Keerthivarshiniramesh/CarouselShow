import React, { createContext, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DContext } from './Provider';


export default function Login() {
    const { setAuth } = useContext(DContext); // ✅ Correct usage
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();
    const apiurl = process.env.REACT_APP_URL; // Fix key name if needed

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        fetch(`${apiurl}/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message)
                if (data.success === true) {
                    setAuth(data.user);

                }
            })
            .catch(err => {
                console.log("error in fetch user login", err);
            });
    };

    return (
        <div className="min-h-screen bg-blue-50 flex flex-col justify-center items-center px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6 text-center">
                SAN Technovation
            </h1>

            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">Login</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full mt-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full mt-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition">
                        Login
                    </button>
                </form>
                <p className="mt-4 text-sm text-center text-gray-600">
                    Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    )
}
