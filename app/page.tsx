"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Button } from "@/components/ui/button"
import { CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { Logo } from "@/components/logo"
import slide1 from '../public/assets/slide1.svg';
import slide2 from '../public/assets/slide2.svg';
import slide3 from '../public/assets/slide3.svg';
import poweredBy from "../public/assets/powered_by_apexon.svg"

import 'swiper/css';
import 'swiper/css/pagination';
import './carousel.css'; // custom styles here

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false)

  const slides = [
    {image: slide1.src, text: 'Orchestrate complex workflows with intelligent, adaptable agents'},
    {image: slide2.src, text: 'Design and deploy rapidly'},
    {image: slide3.src, text: 'Accelerate innovation across industries with agentic AI'}
  ];

  /** Force light theme on login page */
  useEffect(() => {
    if(localStorage.getItem('access_token') !== null ) {
      router.push('/workflows');
    }
    document.documentElement.classList.remove("dark")
    document.documentElement.classList.add("light")
    document.documentElement.setAttribute("data-theme", "light")
    return () => {
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!
    const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!
    const scope = process.env.NEXT_PUBLIC_COGNITO_SCOPE!

    if (!domain || !clientId || !redirectUri || !scope) {
      console.log("Missing environment variables for Cognito configuration")
      setIsLoading(false)
      return
    }

    const loginUrl = `${domain}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`
    window.location.href = loginUrl
  }

  return (
    <div className="min-h-screen flex justify-center light" style={{ colorScheme: "light" }}>
      <div className="hidden md:block w-[40%] relative overflow-hidden rounded-3xl m-3">
        <div className="absolute top-3 left-5 text-sm text-white flex justify-center gap-2 items-center z-20">
          <span>powered by</span>
          <img src={poweredBy.src} alt="Powered by Apexon" />
        </div>

        <Swiper loop autoplay={{ delay: 3000, disableOnInteraction: false }} pagination={{ clickable: true }} modules={[Autoplay, Pagination]} className="relative h-full">
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}>
                <div className="absolute inset-0"></div>

                <div className="absolute bottom-[100px] w-full flex justify-center px-10">
                  <h2 className="text-white text-xl font-semibold text-center max-w-xl font-['Inter']">
                    {slide.text}
                  </h2>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute top-5 left-5 text-white text-xs">Powered by <strong>Apexaon</strong></div>
      </div>

      <div className="right w-[60%] flex flex-col items-center justify-center text-gray-900">
        <div className="flex flex-col justify-center" style={{ flexGrow: "1" }}>
          <div className="mt-5 flex justify-center">
            <Logo />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-900">Welcome to AgenticAI</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardFooter className="text-center flex justify-center">
              <Button type="submit" className="w-[200px] h-[47px] rounded-[45px] bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </div>
        <div className="copyright text-xs p-4 text-gray-600">
          Apexon, Copyright © 2025 Apexon India Pvt. Ltd. All rights reserved.
        </div>
      </div>
    </div>
  )
}
