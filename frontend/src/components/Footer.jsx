import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
            <div>
                {/*--Left Section-- */}
                <img className='mb-5 w-40' src={assets.logo} alt="" />
                <p className='w-full md:w-2/3 text-gray-600 leading-6'>Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum dolor sit amet consectetur 
                    adipisicing elit. Rem in facere eum nihil officia nulla autem quasi voluptatum. Ipsa accusantium minus iusto enim, 
                     </p>
            </div>
            <div>
                {/*--Center Section-- */}
                <p className='text-xl font-medium mb-5'>COMPANY</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>Home</li>
                    <li>About Us</li>
                    <li>Contact Us</li>
                    <li>Privacy Policy</li>
                </ul>
            </div>
            <div>
                {/*--Right Section-- */}
                <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>+919336112233</li>
                    <li>mohdshavez@email.com</li>
                </ul>
            </div>
        </div>
        <div>
            {/* Copyright text */}
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2024 shazM. All Rights Reserved</p>
        </div>
    </div>
  )
}

export default Footer