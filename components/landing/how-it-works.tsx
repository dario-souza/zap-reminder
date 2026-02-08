"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  UserPlus, 
  MessageSquare, 
  Calendar, 
  Send, 
  CheckCircle 
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Cadastre-se gratuitamente em menos de 2 minutos. Sem necessidade de cartão de crédito.",
  },
  {
    icon: MessageSquare,
    title: "Conecte seu WhatsApp",
    description: "Escaneie o QR Code para conectar sua conta do WhatsApp de forma segura e rápida.",
  },
  {
    icon: Calendar,
    title: "Agende suas mensagens",
    description: "Escreva sua mensagem, selecione os contatos e defina a data e hora de envio.",
  },
  {
    icon: Send,
    title: "Deixe o resto conosco",
    description: "Nossa plataforma envia automaticamente suas mensagens no horário programado.",
  },
];

const benefits = [
  "Economize até 10 horas por semana",
  "Aumente sua taxa de resposta em 3x",
  "Reduza esquecimentos e atrasos",
  "Melhore o relacionamento com clientes",
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Como funciona o{" "}
            <span className="text-green-500">ZapReminder</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Em apenas 4 passos simples, você começa a automatizar suas mensagens 
            e economizar tempo no seu dia a dia.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <Card key={index} className="relative border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-4xl font-bold text-muted/30">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-20 bg-green-50 rounded-3xl p-8 sm:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Por que escolher o ZapReminder?
              </h3>
              <p className="text-muted-foreground mb-8">
                Milhares de empresas e profissionais já confiam em nossa plataforma 
                para automatizar sua comunicação no WhatsApp.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="text-5xl font-bold text-green-500 mb-2">98%</div>
                <div className="text-muted-foreground mb-6">Taxa de entrega garantida</div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[98%] bg-gradient-to-r from-green-400 to-green-600 rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Baseado em mais de 1 milhão de mensagens enviadas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
