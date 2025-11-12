"use client";
import { Navbar } from "@/components/layout/navbar";
import QRContact from "@/components/features/contact/QRContact";
import ContactForm from "@/components/features/contact/ContactForm";
import { Footer } from "@/components/layout/footer";
import MotifStrip from "@/components/ui/MotifStrip";

export default function Contact() {
  return (
    <div className="relative min-h-screen w-full font-sans dark:bg-black">
      <Navbar solid />

      <QRContact imageSrc="/images/qrcode3.png" />

      <ContactForm />
      <MotifStrip side="left" color="white" />
      <MotifStrip side="right" color="white" />   
      <div className="w-full bg-black"><Footer /></div>
    </div>
  )
}


