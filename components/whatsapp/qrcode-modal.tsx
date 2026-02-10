"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { messagesApi } from "@/lib/api";
import { RefreshCw, Smartphone, CheckCircle2, AlertCircle, QrCode, Copy, ExternalLink } from "lucide-react";

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

export function QRCodeModal({ open, onOpenChange, onConnected }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [managerUrl] = useState("http://localhost:8080/manager");

  const fetchQRCode = async () => {
    setIsLoading(true);
    setError(null);
    setQrCode(null);
    setPairingCode(null);
    setMessage(null);
    
    try {
      console.log('Buscando QR Code...');
      const data = await messagesApi.getQRCode();
      console.log('Resposta QR Code:', data);
      
      setQrCode(data.qrCode);
      setStatus(data.status);
      setPairingCode(data.pairingCode || null);
      setMessage(data.message || null);
      setRetryCount(0);
      
      // Se já estiver conectado
      if (data.status === "open" || data.status === "connected") {
        onConnected();
        onOpenChange(false);
      }
    } catch (err: any) {
      console.error('Erro ao obter QR Code:', err);
      setError(err.message || "Erro ao obter QR Code");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchQRCode();
    }
  }, [open]);

  // Polling para verificar conexão
  useEffect(() => {
    if (!open || status === "open" || status === "connected") return;

    const interval = setInterval(async () => {
      try {
        const statusData = await messagesApi.checkWhatsAppStatus();
        console.log('Status do WhatsApp:', statusData);
        
        if (statusData.connected) {
          onConnected();
          onOpenChange(false);
        }
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [open, status, onConnected, onOpenChange]);

  // Retry automático se não tiver QR Code
  useEffect(() => {
    if (!open || qrCode || isLoading || error || retryCount >= 3) return;

    const timer = setTimeout(() => {
      console.log(`Tentando novamente... (${retryCount + 1}/3)`);
      setRetryCount(prev => prev + 1);
      fetchQRCode();
    }, 5000);

    return () => clearTimeout(timer);
  }, [qrCode, isLoading, error, retryCount, open]);

  const copyPairingCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      alert("Código copiado! Cole no WhatsApp > Aparelhos Conectados > Conectar com número de telefone");
    }
  };

  const openManager = () => {
    window.open(managerUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            Conectar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR Code ou use o código de pareamento para conectar seu WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 text-sm">{error}</p>
              <Button 
                onClick={fetchQRCode} 
                variant="outline" 
                size="sm" 
                className="mt-3"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-green-500 mb-2" />
              <p className="text-gray-600">Gerando QR Code...</p>
              <p className="text-xs text-gray-400 mt-1">
                {retryCount > 0 && `Tentativa ${retryCount}/3`}
              </p>
            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg border-2 border-green-200 mb-4">
                {/* QR Code como imagem base64 ou código */}
                {qrCode.startsWith('data:image') ? (
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="w-64 h-64"
                  />
                ) : qrCode.startsWith('http') ? (
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="w-64 h-64"
                  />
                ) : (
                  // Se for uma string base64 pura
                  <img 
                    src={`data:image/png;base64,${qrCode}`} 
                    alt="QR Code WhatsApp" 
                    className="w-64 h-64"
                  />
                )}
              </div>
              
              {/* Código de pareamento (se disponível) */}
              {pairingCode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 w-full">
                  <p className="text-sm text-blue-700 text-center font-medium mb-2">
                    Ou use o código de pareamento:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="bg-white px-3 py-1 rounded border text-lg font-mono">
                      {pairingCode}
                    </code>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={copyPairingCode}
                      title="Copiar código"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Como conectar:</strong>
                </p>
                <ol className="text-sm text-gray-500 text-left space-y-1 list-decimal list-inside">
                  <li>Abra o WhatsApp no seu celular</li>
                  <li>Toque em &quot;Mais opções&quot; (⋮) ou &quot;Configurações&quot;</li>
                  <li>Selecione &quot;Aparelhos conectados&quot;</li>
                  <li>Toque em &quot;Conectar um aparelho&quot;</li>
                  <li>Aponte a câmera para o QR Code acima</li>
                </ol>
                
                {pairingCode && (
                  <p className="text-xs text-gray-400 mt-2">
                    Ou: Toque em &quot;Conectar com número de telefone&quot; e digite o código acima
                  </p>
                )}
              </div>

              <Button 
                onClick={fetchQRCode} 
                variant="outline" 
                size="sm" 
                className="mt-4"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar QR Code
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              
              {message ? (
                <div className="space-y-3">
                  <p className="text-gray-600">{message}</p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-700 mb-3">
                      <strong>Alternativa:</strong> O QR Code pode ser obtido diretamente pelo Manager do Evolution
                    </p>
                    <Button 
                      onClick={openManager}
                      variant="outline"
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir Evolution Manager
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">
                      Clique em &quot;Get QR Code&quot; no Manager
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600">QR Code não disponível</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Aguardando geração do código...
                  </p>
                </>
              )}
              
              {retryCount >= 3 && !message && (
                <Button 
                  onClick={fetchQRCode} 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
