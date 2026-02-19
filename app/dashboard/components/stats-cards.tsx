"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MessageCircle, CheckCheck, Calendar, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
}

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  contactsCount: number;
  messagesCount: number;
  sentCount: number;
  scheduledCount: number;
}

export function StatsCards({
  contactsCount,
  messagesCount,
  sentCount,
  scheduledCount,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Contatos"
        value={contactsCount}
        description="Total de contatos"
        icon={User}
      />
      <StatCard
        title="Mensagens"
        value={messagesCount}
        description="Total de mensagens"
        icon={MessageCircle}
      />
      <StatCard
        title="Enviadas"
        value={sentCount}
        description="Mensagens enviadas"
        icon={CheckCheck}
      />
      <StatCard
        title="Agendadas"
        value={scheduledCount}
        description="Mensagens agendadas"
        icon={Calendar}
      />
    </div>
  );
}
