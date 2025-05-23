import React, { useContext, useState } from 'react';
import { Menu, X } from 'lucide-react'; // Optional: Lucide icons for hamburger
import { useNavigate } from 'react-router-dom';
import { DContext } from './Provider';
import Login from './Login';

export default function Header() {
    const { Auth } = useContext(DContext)
    const [menuOpen, setMenuOpen] = useState(false);

    const handleToggle = () => {
        setMenuOpen(!menuOpen);


    };

    const navigate = useNavigate()
    const url = process.env.REACT_APP_URL
    const Logout = () => {
        fetch(`${url}/logout`, {
            method: "DELETE",
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                window.location.href = '/'
                console.log(data)
            })
            .catch(err => {
                console.log("Error :", err)
                alert("Trouble in connecting to Server")
            })
    }
    const [isAuth, setAuth] = useState(false)
    const handleClick = () => {

        window.location.href = '/admin'

    };



    return (
        <header className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                {/* Title */}
                <div className="text-xl md:text-2xl font-semibold">
                    <span className="block">Admin Dashboard</span>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden md:flex items-center gap-4">

                    {
                        Auth ? (

                            <button className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition" onClick={Logout}>Logout</button>
                        ) : (
                            <button className="bg-white text-blue-900 px-4 py-2 rounded hover:bg-blue-200 transition" onClick={handleClick}>Login</button>
                        )


                    }



                </div>

                {/* Mobile Hamburger */}
                <button className="md:hidden" onClick={handleToggle}>
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden px-4 pb-4 flex flex-col gap-2 bg-blue-800">

                    {
                        Auth ? (

                            <button className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition" onClick={Logout}>Logout</button>
                        ) : (
                            <button className="bg-white text-blue-900 px-4 py-2 rounded hover:bg-blue-200 transition" onClick={handleClick}>Login</button>
                        )
                    }
                </div>
            )}
        </header>
    );
}


