"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle, Menu, X, User } from "lucide-react";

interface HeaderProps {
  onLoginClick: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks = [
    { label: "Recursos", href: "#features" },
    { label: "Como Funciona", href: "#how-it-works" },
    { label: "Preços", href: "#pricing" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">ZapReminder</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={onLoginClick}>
              Entrar
            </Button>
            <Button 
              onClick={onLoginClick}
              className="bg-green-500 hover:bg-green-600"
            >
              Começar Grátis
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="text-lg font-medium text-left hover:text-green-500 transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="border-t pt-6 mt-2 space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      onLoginClick();
                      setIsOpen(false);
                    }}
                  >
                    Entrar
                  </Button>
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      onLoginClick();
                      setIsOpen(false);
                    }}
                  >
                    Começar Grátis
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
