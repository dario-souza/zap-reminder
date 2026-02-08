"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react";

interface FooterProps {
  onGetStarted: () => void;
}

export function Footer({ onGetStarted }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">ZapReminder</span>
            </div>
            <p className="text-muted-foreground mb-6">
              Automatize suas mensagens no WhatsApp e economize tempo no seu dia a dia.
            </p>
            <Button 
              onClick={onGetStarted}
              className="bg-green-500 hover:bg-green-600"
            >
              Começar Grátis
            </Button>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-background transition-colors">Recursos</button></li>
              <li><button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-background transition-colors">Preços</button></li>
              <li><button className="hover:text-background transition-colors">API</button></li>
              <li><button className="hover:text-background transition-colors">Integrações</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><button className="hover:text-background transition-colors">Sobre</button></li>
              <li><button className="hover:text-background transition-colors">Blog</button></li>
              <li><button className="hover:text-background transition-colors">Carreiras</button></li>
              <li><button className="hover:text-background transition-colors">Contato</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contato@zapreminder.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+55 (11) 9999-9999</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>São Paulo, SP - Brasil</span>
              </li>
            </ul>

            <div className="flex items-center gap-4 mt-6">
              <button className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-background/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-background/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-background/20 transition-colors">
                <Github className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <Separator className="bg-background/20" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ZapReminder. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button className="hover:text-background transition-colors">Termos de Uso</button>
            <button className="hover:text-background transition-colors">Política de Privacidade</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
