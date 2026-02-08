"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingProps {
  onGetStarted: () => void;
}

const plans = [
  {
    name: "Gratuito",
    description: "Para uso pessoal e testes",
    price: "R$ 0",
    period: "/mês",
    features: [
      "10 mensagens/mês",
      "Agendamento básico",
      "1 lista de contatos",
      "Suporte por email",
    ],
    cta: "Começar Grátis",
    popular: false,
  },
  {
    name: "Pro",
    description: "Para profissionais e pequenas empresas",
    price: "R$ 29",
    period: "/mês",
    features: [
      "Mensagens ilimitadas",
      "Agendamento recorrente",
      "Listas ilimitadas",
      "Relatórios avançados",
      "Suporte prioritário",
      "API de integração",
    ],
    cta: "Assinar Agora",
    popular: true,
  },
  {
    name: "Empresarial",
    description: "Para grandes empresas",
    price: "R$ 99",
    period: "/mês",
    features: [
      "Tudo do Pro",
      "Múltiplos usuários",
      "Permissões avançadas",
      "Webhooks personalizados",
      "Suporte 24/7",
      "SLA garantido",
    ],
    cta: "Falar com Vendas",
    popular: false,
  },
];

export function Pricing({ onGetStarted }: PricingProps) {
  return (
    <section id="pricing" className="py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Planos e preços
          </h2>
          <p className="text-lg text-muted-foreground">
            Escolha o plano ideal para suas necessidades. 
            Todos os planos incluem teste gratuito de 14 dias.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative flex flex-col ${plan.popular ? 'border-green-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 hover:bg-green-500">
                  Mais Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={onGetStarted}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
