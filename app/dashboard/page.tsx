"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authApi, contactsApi, messagesApi, templatesApi, confirmationsApi } from "@/lib/api";
import {
  MessageCircle,
  User,
  LogOut,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Send,
  RefreshCw,
  Smartphone,
  Link2,
  Unlink,
  Clock,
  Download,
  Upload,
  Bell,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeModal } from "@/components/whatsapp/qrcode-modal";
import {
  ConfirmDialog,
  ContactForm,
  MessageForm,
  ContactsList,
  MessagesList,
  StatsCards,
  TemplateForm,
  TemplatesList,
  ReminderForm,
  ConfirmationsList,
} from "./components";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Message {
  id: string;
  content: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED" | "SCHEDULED";
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  recurrenceType?: "NONE" | "MONTHLY";
  reminderDays?: number;
  isReminder?: boolean;
  contactIds?: string[];
  contact: {
    name: string;
    phone: string;
  };
}

interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Confirmation {
  id: string;
  status: "PENDING" | "CONFIRMED" | "DENIED";
  contactName: string;
  contactPhone: string;
  eventDate: string;
  messageContent?: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
const scheduledMessages = messages.filter((m) => m.status === "SCHEDULED" && m.isReminder !== true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modais
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isAddingMessage, setIsAddingMessage] = useState(false);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);

// Estados de confirmação
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"contact" | "message" | "template" | "confirmation" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteAllType, setDeleteAllType] = useState<"contacts" | "messages" | "templates" | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // WhatsApp
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null);
  const [isCheckingWhatsapp, setIsCheckingWhatsapp] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Cron
  const [cronStatus, setCronStatus] = useState<any>(null);

useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    loadData();
    checkWhatsappConnection();
    checkCronStatus();

    // Atualiza confirmações a cada 10 segundos
    const interval = setInterval(() => {
      confirmationsApi.getAll().then(setConfirmations).catch(console.error);
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

const loadData = async () => {
    try {
      const [contactsData, messagesData, templatesData, confirmationsData] = await Promise.all([
        contactsApi.getAll(),
        messagesApi.getAll(),
        templatesApi.getAll(),
        confirmationsApi.getAll(),
      ]);
      setContacts(contactsData);
      setMessages(messagesData);
      setTemplates(templatesData);
      setConfirmations(confirmationsData);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkWhatsappConnection = async () => {
    setIsCheckingWhatsapp(true);
    try {
      const status = await messagesApi.checkWhatsAppStatus();
      setWhatsappStatus(status);
    } catch (error: any) {
      console.error("Erro ao verificar WhatsApp:", error);
      setWhatsappStatus({ connected: false, configured: false });
    } finally {
      setIsCheckingWhatsapp(false);
    }
  };

  const checkCronStatus = async () => {
    try {
      const status = await messagesApi.getCronStatus();
      setCronStatus(status);
    } catch (error: any) {
      console.error("Erro ao verificar status do cron:", error);
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/");
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingTest(true);

    try {
      await messagesApi.sendTestMessage(testPhone, testMessage || "Teste ZapReminder! 🚀");
      showSuccess("Mensagem de teste enviada com sucesso!");
      setTestPhone("");
      setTestMessage("");
    } catch (err: any) {
      showError(err.message || "Erro ao enviar mensagem de teste");
    } finally {
      setIsSendingTest(false);
    }
  };

const openDeleteModal = (id: string, type: "contact" | "message" | "template" | "confirmation") => {
    setItemToDelete(id);
    setDeleteType(type);
  };

const handleDelete = async () => {
    if (!itemToDelete || !deleteType) return;
    setIsDeleting(true);

    try {
      if (deleteType === "contact") {
        await contactsApi.delete(itemToDelete);
        showSuccess("Contato excluído com sucesso!");
      } else if (deleteType === "message") {
        await messagesApi.delete(itemToDelete);
        showSuccess("Mensagem excluída com sucesso!");
      } else if (deleteType === "template") {
        await templatesApi.delete(itemToDelete);
        showSuccess("Template excluído com sucesso!");
      } else if (deleteType === "confirmation") {
        await confirmationsApi.delete(itemToDelete);
        showSuccess("Confirmação excluída com sucesso!");
      }
      setItemToDelete(null);
      setDeleteType(null);
      loadData();
    } catch (err: any) {
      showError(err.message || `Erro ao excluir ${deleteType === "contact" ? "contato" : deleteType === "message" ? "mensagem" : deleteType === "template" ? "template" : "confirmação"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!deleteAllType) return;
    setIsDeletingAll(true);

    try {
      if (deleteAllType === "contacts") {
        await contactsApi.deleteAll();
        showSuccess("Todos os contatos foram excluídos com sucesso!");
      } else if (deleteAllType === "messages") {
        await messagesApi.deleteAll();
        showSuccess("Todas as mensagens foram excluídas com sucesso!");
      } else if (deleteAllType === "templates") {
        await templatesApi.deleteAll();
        showSuccess("Todos os templates foram excluídos com sucesso!");
      }
      setDeleteAllType(null);
      loadData();
    } catch (err: any) {
      showError(err.message || `Erro ao excluir ${deleteAllType === "contacts" ? "contatos" : deleteAllType === "messages" ? "mensagens" : "templates"}`);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleSendNow = async (messageId: string) => {
    try {
      await messagesApi.sendNow(messageId);
      showSuccess("Mensagem enviada com sucesso!");
      loadData();
    } catch (err: any) {
      showError(err.message || "Erro ao enviar mensagem");
    }
  };

  // Stats
  const sentMessages = messages.filter((m) => ["SENT", "DELIVERED", "READ"].includes(m.status));
  const deliveredMessages = messages.filter((m) => m.status === "DELIVERED");
  const readMessages = messages.filter((m) => m.status === "READ");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">ZapReminder</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Bem-vindo, {user.name}!</h1>

        {/* Alerts */}
        {(error || success) && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              error
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-green-50 text-green-600 border border-green-200"
            }`}
          >
            {error ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            <span>{error || success}</span>
          </div>
        )}

        {/* Stats */}
        <StatsCards
          contactsCount={contacts.length}
          messagesCount={messages.length}
          sentCount={sentMessages.length}
          scheduledCount={scheduledMessages.length}
        />

        {/* WhatsApp Status */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">Status do WhatsApp</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {whatsappStatus?.connected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => messagesApi.disconnectWhatsApp().then(() => checkWhatsappConnection())}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Desconectar
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={checkWhatsappConnection}
                disabled={isCheckingWhatsapp}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isCheckingWhatsapp ? "animate-spin" : ""}`} />
                Verificar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!whatsappStatus ? (
              <p className="text-gray-500">Clique em "Verificar" para verificar a conexão...</p>
            ) : whatsappStatus.connected ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-green-800 font-medium">✅ WhatsApp conectado!</p>
                    {whatsappStatus.profile?.pushName && (
                      <p className="text-green-700 text-sm">
                        {whatsappStatus.profile.pushName} ({whatsappStatus.profile.id?.split("@")[0]})
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-green-700 text-sm">
                  Sua integração está funcionando. Você pode enviar mensagens para seus contatos.
                </p>

                <form onSubmit={handleSendTestMessage} className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Enviar mensagem de teste:</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Telefone (ex: 11999999999)"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Mensagem (opcional)"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isSendingTest || !testPhone}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {isSendingTest ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-2">❌ WhatsApp desconectado</p>
                <p className="text-red-700 text-sm mb-4">
                  Para enviar mensagens via WhatsApp, você precisa conectar sua conta.
                </p>
                <Button
                  onClick={() => setIsQRCodeModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Conectar WhatsApp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cron Job Status */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Agendamento Automático</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={checkCronStatus}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </CardHeader>
          <CardContent>
            {!cronStatus ? (
              <p className="text-gray-500">Carregando status...</p>
            ) : cronStatus.isRunning ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-green-800 font-medium">✅ Cron Job Ativo</p>
                    <p className="text-green-700 text-sm">Verificando mensagens agendadas a cada minuto</p>
                  </div>
                </div>
                <p className="text-green-700 text-sm">
                  O sistema enviará automaticamente as mensagens agendadas quando chegar o horário.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-yellow-800 font-medium">⚠️ Cron Job Parado</p>
                    <p className="text-yellow-700 text-sm">
                      Mensagens agendadas não serão enviadas automaticamente
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {messages.filter((m) => m.status === "SCHEDULED").length}
                </p>
                <p className="text-sm text-blue-700">Agendadas</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{sentMessages.length}</p>
                <p className="text-sm text-green-700">Enviadas</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{deliveredMessages.length}</p>
                <p className="text-sm text-blue-700">Entregues</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{readMessages.length}</p>
                <p className="text-sm text-purple-700">Lidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Modal */}
        <QRCodeModal
          open={isQRCodeModalOpen}
          onOpenChange={setIsQRCodeModalOpen}
          onConnected={() => {
            checkWhatsappConnection();
            showSuccess("WhatsApp conectado com sucesso!");
          }}
        />

        <Tabs defaultValue="messages" className="space-y-6">
<TabsList>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="scheduled">Agendamentos</TabsTrigger>
            <TabsTrigger value="reminders">Lembretes</TabsTrigger>
            <TabsTrigger value="confirmations">Confirmações</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Minhas Mensagens</CardTitle>
                <div className="flex gap-2">
                  {messages.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteAllType("messages")}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar Todas
                    </Button>
                  )}
                  <Dialog open={isAddingMessage} onOpenChange={setIsAddingMessage}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-green-500 hover:bg-green-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Mensagem
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Criar Nova Mensagem</DialogTitle>
                        <DialogDescription>Escreva sua mensagem e escolha quando enviar</DialogDescription>
                      </DialogHeader>
                      <MessageForm
                        contacts={contacts}
                        onSuccess={(msg) => {
                          showSuccess(msg);
                          setIsAddingMessage(false);
                          loadData();
                        }}
                        onError={showError}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <MessagesList
                  messages={messages}
                  onDelete={(id) => openDeleteModal(id, "message")}
                  onSendNow={handleSendNow}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Tab */}
          <TabsContent value="scheduled" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Mensagens Agendadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma mensagem agendada</p>
                    <p className="text-sm mt-1">
                      Agende uma mensagem na aba &quot;Mensagens&quot;
                    </p>
                  </div>
                ) : (
                  <MessagesList
                    messages={scheduledMessages}
                    onDelete={(id) => openDeleteModal(id, "message")}
                    onSendNow={handleSendNow}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Lembretes com Confirmação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 mb-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Lembrete
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Lembrete</DialogTitle>
                      <DialogDescription>
                        Agende um lembrete de confirmação para enviar X dias antes da consulta
                      </DialogDescription>
                    </DialogHeader>
                    <ReminderForm
                      contacts={contacts}
                      onSuccess={(msg) => {
                        showSuccess(msg);
                        loadData();
                      }}
                      onError={showError}
                    />
                  </DialogContent>
                </Dialog>

<MessagesList
                  messages={messages.filter((m) => m.isReminder === true)}
                  onDelete={(id) => openDeleteModal(id, "message")}
                  onSendNow={handleSendNow}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Confirmations Tab */}
          <TabsContent value="confirmations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmações de Comparecimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ConfirmationsList
                  confirmations={confirmations}
                  onDelete={(id) => openDeleteModal(id, "confirmation")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Meus Contatos</CardTitle>
                <div className="flex gap-2">
                  {contacts.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteAllType("contacts")}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar Todos
                    </Button>
                  )}
                  <Dialog open={isAddingContact} onOpenChange={(open) => {
                    setIsAddingContact(open);
                    if (!open) setEditingContact(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-green-500 hover:bg-green-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Contato
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingContact ? "Editar Contato" : "Adicionar Novo Contato"}</DialogTitle>
                        <DialogDescription>Preencha os dados do contato abaixo</DialogDescription>
                      </DialogHeader>
                      <ContactForm
                        contact={editingContact}
                        onSuccess={() => {
                          showSuccess(editingContact ? "Contato atualizado com sucesso!" : "Contato adicionado com sucesso!");
                          setIsAddingContact(false);
                          setEditingContact(null);
                          loadData();
                        }}
                        onError={showError}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => contactsApi.exportCSV()}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('csv-import-input')?.click()}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar CSV
                  </Button>
                  <input
                    id="csv-import-input"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        try {
                          const csvContent = event.target?.result as string;
                          const result = await contactsApi.importCSV(csvContent);
                          showSuccess(
                            `Importação concluída: ${result.success} contatos importados, ${result.failed} falharam`
                          );
                          loadData();
                        } catch (err: any) {
                          showError(err.message || "Erro ao importar CSV");
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                  />
                </div>
                <ContactsList 
                  contacts={contacts} 
                  onDelete={(id) => openDeleteModal(id, "contact")}
                  onEdit={(contact) => {
                    setEditingContact(contact);
                    setIsAddingContact(true);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Meus Templates</CardTitle>
                <div className="flex gap-2">
                  {templates.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteAllType("templates")}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar Todos
                    </Button>
                  )}
                  <Dialog open={isAddingTemplate} onOpenChange={(open) => {
                    setIsAddingTemplate(open);
                    if (!open) setEditingTemplate(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-green-500 hover:bg-green-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingTemplate ? "Editar Template" : "Criar Novo Template"}</DialogTitle>
                        <DialogDescription>
                          {editingTemplate ? "Altere os dados do template abaixo" : "Crie um modelo de mensagem para reuse"}
                        </DialogDescription>
                      </DialogHeader>
                      <TemplateForm
                        template={editingTemplate}
                        onSuccess={(msg) => {
                          showSuccess(msg);
                          setIsAddingTemplate(false);
                          setEditingTemplate(null);
                          loadData();
                        }}
                        onError={showError}
                        onCancel={() => {
                          setIsAddingTemplate(false);
                          setEditingTemplate(null);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <TemplatesList
                  templates={templates}
                  onDelete={(id) => openDeleteModal(id, "template")}
                  onEdit={(template) => {
                    setEditingTemplate(template);
                    setIsAddingTemplate(true);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Item Modal */}
        <ConfirmDialog
          open={!!itemToDelete}
          onOpenChange={(open) => !open && setItemToDelete(null)}
          title="Confirmar Exclusão"
          description={`Tem certeza que deseja excluir este ${deleteType === "contact" ? "contato" : deleteType === "message" ? "mensagem" : deleteType === "template" ? "template" : "confirmação"}? Esta ação não pode ser desfeita.`}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          confirmText="Excluir"
        />

        {/* Delete All Modal */}
        <ConfirmDialog
          open={!!deleteAllType}
          onOpenChange={(open) => !open && setDeleteAllType(null)}
          title={`⚠️ Excluir Todos os ${deleteAllType === "contacts" ? "Contatos" : deleteAllType === "messages" ? "Mensagens" : "Templates"}`}
          description={`ATENÇÃO: Esta ação excluirá permanentemente todos os seus ${deleteAllType === "contacts" ? contacts.length : deleteAllType === "messages" ? messages.length : templates.length} ${deleteAllType === "contacts" ? "contatos" : deleteAllType === "messages" ? "mensagens" : "templates"}. Esta ação não pode ser desfeita.`}
          onConfirm={handleDeleteAll}
          isLoading={isDeletingAll}
          confirmText="Excluir Todos"
          variant="danger"
        />
      </main>
    </div>
  );
}
