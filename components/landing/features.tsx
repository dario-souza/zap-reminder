"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  Repeat 
} from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Agendamento Inteligente",
    description: "Programe mensagens para qualquer data e hora. Nunca mais esqueça de enviar uma mensagem importante.",
  },
  {
    icon: Users,
    title: "Listas de Contatos",
    description: "Organize seus contatos em listas personalizadas para envios em massa segmentados.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description: "Acompanhe taxas de entrega, leitura e resposta. Otimize suas campanhas com dados reais.",
  },
  {
    icon: Shield,
    title: "Segurança Garantida",
    description: "Seus dados e mensagens são criptografados e armazenados com total segurança.",
  },
  {
    icon: Zap,
    title: "Envio Instantâneo",
    description: "API rápida e confiável que garante o envio das suas mensagens em segundos.",
  },
  {
    icon: Repeat,
    title: "Mensagens Recorrentes",
    description: "Configure lembretes automáticos diários, semanais ou mensais para seus clientes.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Tudo que você precisa para{" "}
            <span className="text-green-500">comunicação eficiente</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Uma plataforma completa para gerenciar suas mensagens no WhatsApp 
            com recursos poderosos e fáceis de usar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
