"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authApi, contactsApi, messagesApi } from "@/lib/api";
import { MessageCircle, User, LogOut, Plus, Phone, Mail, Trash2, AlertCircle, CheckCircle2, Send, Clock, Calendar, CheckCheck, AlertTriangle, Smartphone, RefreshCw, Link2, Unlink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeModal } from "@/components/whatsapp/qrcode-modal";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'SCHEDULED';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  contact: {
    name: string;
    phone: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isAddingMessage, setIsAddingMessage] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "" });
  const [newMessage, setNewMessage] = useState({ 
    content: "", 
    contactId: "", 
    scheduledAt: "",
    sendNow: false 
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null);
  const [isCheckingWhatsapp, setIsCheckingWhatsapp] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [cronStatus, setCronStatus] = useState<any>(null);
  const router = useRouter();

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
  }, [router]);

  const loadData = async () => {
    try {
      const [contactsData, messagesData] = await Promise.all([
        contactsApi.getAll(),
        messagesApi.getAll(),
      ]);
      setContacts(contactsData);
      setMessages(messagesData);
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

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingTest(true);
    setError(null);
    setSuccess(null);

    try {
      await messagesApi.sendTestMessage(testPhone, testMessage || "Teste ZapReminder! 🚀");
      setSuccess("Mensagem de teste enviada com sucesso!");
      setTestPhone("");
      setTestMessage("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar mensagem de teste");
    } finally {
      setIsSendingTest(false);
    }
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

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await contactsApi.create({
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email || undefined,
      });

      setSuccess("Contato adicionado com sucesso!");
      setNewContact({ name: "", phone: "", email: "" });
      setIsAddingContact(false);
      loadData();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar contato");
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contato?")) return;

    try {
      await contactsApi.delete(id);
      setSuccess("Contato excluído com sucesso!");
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao excluir contato");
    }
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newMessage.contactId) {
      setError("Selecione um contato");
      return;
    }

    try {
      const messageData: any = {
        content: newMessage.content,
        contactId: newMessage.contactId,
      };

      // Se tiver data de agendamento, adiciona
      if (newMessage.scheduledAt && !newMessage.sendNow) {
        messageData.scheduledAt = new Date(newMessage.scheduledAt).toISOString();
      }

      const createdMessage = await messagesApi.create(messageData);

      // Se marcou para enviar agora
      if (newMessage.sendNow) {
        await messagesApi.sendNow(createdMessage.id);
        setSuccess("Mensagem enviada com sucesso!");
      } else if (newMessage.scheduledAt) {
        setSuccess("Mensagem agendada com sucesso!");
      } else {
        setSuccess("Mensagem criada! Use o botão 'Enviar Agora' quando quiser.");
      }

      setNewMessage({ content: "", contactId: "", scheduledAt: "", sendNow: false });
      setIsAddingMessage(false);
      loadData();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao criar mensagem");
    }
  };

  const handleSendNow = async (messageId: string) => {
    setError(null);
    setSuccess(null);

    try {
      await messagesApi.sendNow(messageId);
      setSuccess("Mensagem enviada com sucesso!");
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar mensagem");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta mensagem?")) return;

    try {
      await messagesApi.delete(id);
      setSuccess("Mensagem excluída com sucesso!");
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao excluir mensagem");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pendente' },
      SENT: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCheck, label: 'Enviada' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle, label: 'Falhou' },
      SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Calendar, label: 'Agendada' },
    };
    const style = styles[status as keyof typeof styles] || styles.PENDING;
    const Icon = style.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {style.label}
      </span>
    );
  };

  const sentMessages = messages.filter(m => m.status === 'SENT');
  const scheduledMessages = messages.filter(m => m.status === 'SCHEDULED');
  const pendingMessages = messages.filter(m => m.status === 'PENDING');

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

        {(error || success) && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            error 
              ? "bg-red-50 text-red-600 border border-red-200" 
              : "bg-green-50 text-green-600 border border-green-200"
          }`}>
            {error ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            <span>{error || success}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contatos</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.length}</div>
              <p className="text-xs text-muted-foreground">Total de contatos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
              <p className="text-xs text-muted-foreground">Total de mensagens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
              <CheckCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sentMessages.length}</div>
              <p className="text-xs text-muted-foreground">Mensagens enviadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledMessages.length}</div>
              <p className="text-xs text-muted-foreground">Mensagens agendadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Status do WhatsApp */}
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
                <RefreshCw className={`w-4 h-4 mr-2 ${isCheckingWhatsapp ? 'animate-spin' : ''}`} />
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
                        {whatsappStatus.profile.pushName} ({whatsappStatus.profile.id?.split('@')[0]})
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-green-700 text-sm">
                  Sua integração está funcionando. Você pode enviar mensagens para seus contatos.
                </p>
                
                {/* Formulário de teste */}
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

        {/* Status do Cron Job */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Agendamento Automático</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkCronStatus}
            >
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
                    <p className="text-green-700 text-sm">
                      Verificando mensagens agendadas a cada minuto
                    </p>
                  </div>
                </div>
                <p className="text-green-700 text-sm">
                  O sistema enviará automaticamente as mensagens agendadas quando chegar o horário.
                </p>
                <div className="mt-3 text-sm text-green-600">
                  <span className="font-medium">Próxima verificação:</span> {cronStatus.nextRun}
                </div>
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
                <p className="text-yellow-700 text-sm">
                  O sistema não está verificando mensagens agendadas. Mensagens criadas não serão enviadas automaticamente.
                </p>
              </div>
            )}
            
            {/* Estatísticas de mensagens agendadas */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {messages.filter(m => m.status === 'SCHEDULED').length}
                </p>
                <p className="text-sm text-blue-700">Mensagens Agendadas</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {messages.filter(m => m.status === 'SENT').length}
                </p>
                <p className="text-sm text-gray-700">Mensagens Enviadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de QR Code */}
        <QRCodeModal 
          open={isQRCodeModalOpen} 
          onOpenChange={setIsQRCodeModalOpen}
          onConnected={() => {
            checkWhatsappConnection();
            setSuccess("WhatsApp conectado com sucesso!");
            setTimeout(() => setSuccess(null), 3000);
          }}
        />

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Minhas Mensagens</CardTitle>
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
                      <DialogDescription>
                        Escreva sua mensagem e escolha quando enviar
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateMessage} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact">Contato *</Label>
                        <Select
                          value={newMessage.contactId}
                          onValueChange={(value) => setNewMessage({ ...newMessage, contactId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um contato" />
                          </SelectTrigger>
                          <SelectContent>
                            {contacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.id}>
                                {contact.name} - {contact.phone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="content">Mensagem *</Label>
                        <Textarea
                          id="content"
                          placeholder="Digite sua mensagem aqui..."
                          value={newMessage.content}
                          onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                          required
                          rows={4}
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="scheduledAt">Agendar para (opcional)</Label>
                          <Input
                            id="scheduledAt"
                            type="datetime-local"
                            value={newMessage.scheduledAt}
                            onChange={(e) => setNewMessage({ 
                              ...newMessage, 
                              scheduledAt: e.target.value,
                              sendNow: false 
                            })}
                            disabled={newMessage.sendNow}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="sendNow"
                          checked={newMessage.sendNow}
                          onChange={(e) => setNewMessage({ 
                            ...newMessage, 
                            sendNow: e.target.checked,
                            scheduledAt: "" 
                          })}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="sendNow" className="text-sm cursor-pointer">
                          Enviar imediatamente
                        </Label>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        {newMessage.sendNow ? (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Agora
                          </>
                        ) : newMessage.scheduledAt ? (
                          <>
                            <Calendar className="w-4 h-4 mr-2" />
                            Agendar Mensagem
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Salvar Mensagem
                          </>
                        )}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma mensagem criada</p>
                    <p className="text-sm">Clique no botão acima para criar sua primeira mensagem</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium">{message.contact.name}</span>
                              {getStatusBadge(message.status)}
                            </div>
                            <p className="text-gray-700 mb-2">{message.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {message.contact.phone}
                              </span>
                              {message.scheduledAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Agendado: {new Date(message.scheduledAt).toLocaleString('pt-BR')}
                                </span>
                              )}
                              {message.sentAt && (
                                <span className="flex items-center gap-1">
                                  <CheckCheck className="w-3 h-3" />
                                  Enviado: {new Date(message.sentAt).toLocaleString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {message.status === 'PENDING' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendNow(message.id)}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <Send className="w-4 h-4 mr-1" />
                                Enviar
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Meus Contatos</CardTitle>
                <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Contato
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Contato</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do contato abaixo
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddContact} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                          id="name"
                          placeholder="Nome do contato"
                          value={newContact.name}
                          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          placeholder="(11) 99999-9999"
                          value={newContact.phone}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@exemplo.com"
                          value={newContact.email}
                          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        Salvar Contato
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {contacts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum contato cadastrado</p>
                    <p className="text-sm">Clique no botão acima para adicionar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {contact.phone}
                              </span>
                              {contact.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {contact.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
