"use client";

import { useState, useEffect } from "react";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { navbarData } from "@/data";

type NavbarProps = {
  solid?: boolean
}

export const Navbar = ({ solid = false }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const featuresItem = navbarData.menuItems.find(item => item.hasDropdown);

  const isSolid = solid || isScrolled;

  return (
    <section
      className={`py-4 px-4 md:px-10 xl:px-20 w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolid ? "bg-white/45 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
          <a
            href={navbarData.logo.href}
            className="flex items-center gap-2"
          >
            <Image 
              src={navbarData.logo.src} 
              alt={navbarData.logo.alt} 
              width={navbarData.logo.width} 
              height={navbarData.logo.height} 
            />
          </a>
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              {navbarData.menuItems.map((item, index) => (
                <NavigationMenuItem key={index}>
                  {item.hasDropdown ? (
                    <>
                      <NavigationMenuTrigger className={`text-lg! bg-transparent hover:bg-transparent focus:bg-transparent data-active:bg-transparent data-[state=open]:bg-transparent transition-colors duration-300 ${
                        isSolid ? "text-foreground" : "text-white"
                      }`}>
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-popover border shadow-md">
                        <div className="grid w-[600px] grid-cols-2 p-3">
                          
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink
                      href={item.href}
                      className={`${navigationMenuTriggerStyle()} text-lg! bg-transparent hover:bg-transparent focus:bg-transparent data-active:bg-transparent transition-colors duration-300 ${
                        isSolid ? "text-foreground" : "text-white"
                      }`}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          </div>
          <div className="hidden items-center gap-4 lg:flex">
          <Button variant={navbarData.buttons.CTA1.variant as "outline" | "default"}>
              {navbarData.buttons.CTA1.label}
            </Button>
            <Button variant={navbarData.buttons.CTA2.variant as "outline" | "default"} className="text-white">
              {navbarData.buttons.CTA2.label}
            </Button>
            
          </div>
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="max-h-screen overflow-auto">
              <SheetHeader>
                <SheetTitle>
                  <a
                    href={navbarData.logo.href}
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={navbarData.logo.src}
                      alt={navbarData.logo.alt}
                      width={navbarData.logo.width}
                      height={navbarData.logo.height}
                      className="max-h-8"
                    />
                    <span className="text-lg font-semibold tracking-tighter">
                      Visit Makkah
                    </span>
                  </a>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4">
                
                <div className="flex flex-col gap-6">
                  {navbarData.mobileMenuItems.map((item, index) => (
                    <a key={index} href={item.href} className="font-medium">
                      {item.label}
                    </a>
                  ))}
                </div>
                <div className="mt-6 flex flex-col gap-4">
                  <Button variant={navbarData.buttons.CTA1.variant as "outline" | "default"}>
                    {navbarData.buttons.CTA1.label}
                  </Button>
                  <Button variant={navbarData.buttons.CTA2.variant as "outline" | "default"} className="text-white">
                    {navbarData.buttons.CTA2.label}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </section>
  );
};
