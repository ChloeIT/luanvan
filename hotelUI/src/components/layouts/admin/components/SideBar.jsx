import React, { useState } from 'react'
import { NavLink } from 'react-router-dom';
import { HiOutlineMenu } from "react-icons/hi";
import { RiCloseLine } from "react-icons/ri";
import { routeAdmin } from '../../../../contant/linkadmin';

const NavLinks = ({ handleClick }) => {

    return (
        <div className="mt-10">
            {routeAdmin.map((item) => (
                <NavLink
                    key={item.name}
                    to={item.path}
                    end
                    className={({ isActive }) =>
                        `flex flex-row justify-start items-center my-8 text-sm font-medium 
                    ${isActive ? 'text-white' : 'text-gray-500'} hover:text-white`
                    } onClick={() => handleClick && handleClick()}
                >
                    <item.icon className="w-6 h-6 mr-2" />
                    {item.name}
                </NavLink>
            ))}
        </div>
    )
};

export const Sidebar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <div className="md:flex hidden h-screen flex-col w-[240px] py-10 px-4 bg-[#d6bf3e]">
                <NavLinks />
            </div>

            <div className="absolute md:hidden blcok top-6 right-3">
                {mobileMenuOpen ? (
                    <RiCloseLine className="w-6 h-6 text-primary mr-2" onClick={() => setMobileMenuOpen(false)} />
                ) : <HiOutlineMenu className="w-6 h-6 text-primary mr-2" onClick={() => setMobileMenuOpen(true)} />}
            </div>

            <div className={`absolute top-0 h-screen w-2/3 bg-gradient-to-tl from-white/10 to-[#483d8b] backdrop-blur-lg z-10 p-6 md:hidden smooth-transition ${mobileMenuOpen ? 'left-0' : '-left-full'}`} >
                <h2 className="font-bold text-xl text-primary text-center mt-2">SB Hotel</h2>
                <NavLinks handleClick={() => setMobileMenuOpen(false)} />
            </div>
        </>
    )
}