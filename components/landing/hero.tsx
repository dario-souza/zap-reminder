"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, MessageSquare, Calendar, Zap } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <Badge 
            variant="secondary" 
            className="mb-6 bg-green-50 text-green-700 hover:bg-green-100"
          >
            <Zap className="w-3 h-3 mr-1" />
            Agendamento recorrente disponível
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Automatize suas mensagens no{" "}
            <span className="text-green-500">WhatsApp</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Programe mensagens para serem enviadas automaticamente no momento certo. 
            Ideal para lembretes, campanhas de marketing e relacionamento com clientes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-lg px-8"
            >
              Começar Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto text-lg px-8"
            >
              Ver Demonstração
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mb-20">
            {[
              { value: "10k+", label: "Usuários Ativos" },
              { value: "1M+", label: "Mensagens Enviadas" },
              { value: "99.9%", label: "Uptime" },
              { value: "4.9", label: "Avaliação" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Preview Card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl opacity-20 blur-2xl" />
            <Card className="relative max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Nova Mensagem Agendada</h3>
                      <p className="text-sm text-muted-foreground">Próximo envio em 2 horas</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <Clock className="w-3 h-3 mr-1" />
                    Agendado
                  </Badge>
                </div>
                
                <div className="bg-muted rounded-xl p-4 mb-4">
                  <p className="text-foreground">
                    Olá! Passando para lembrar que nossa reunião está marcada para amanhã às 14h. 
                    Confirma sua presença? 👋
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Enviar em: 25/12/2024 às 09:00</span>
                  </div>
                  <span>Para: +55 (11) 98765-4321</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
