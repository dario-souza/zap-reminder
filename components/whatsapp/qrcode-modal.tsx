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
import { RefreshCw, Smartphone, CheckCircle2, AlertCircle, QrCode } from "lucide-react";

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
  const [isPolling, setIsPolling] = useState(false);

  const fetchQRCode = async () => {
    setIsLoading(true);
    setError(null);
    setQrCode(null);
    
    try {
      console.log('Iniciando conexão WhatsApp...');
      
      // Chama getQRCode que agora cria a sessão automaticamente
      const qrData = await messagesApi.getQRCode();
      console.log('QR Data:', qrData);
      
      // Se já está conectado
      if (qrData.connected) {
        onConnected();
        onOpenChange(false);
        return;
      }
      
      // Se tem QR Code
      if (qrData?.qr) {
        setQrCode(qrData.qr);
        
        // NOWEB usa pairing code em vez de QR code
        if (qrData.isPairingCode) {
          setStatus('PAIRING_CODE');
        } else {
          setStatus('SCAN_QR_CODE');
        }
        setIsPolling(true); // Inicia polling para detectar conexão
      } else if (qrData?.error) {
        setError(qrData.error);
      } else {
        setError('Não foi possível obter o QR Code. Tente novamente.');
      }
      
    } catch (err: any) {
      console.error('Erro ao iniciar sessão:', err);
      setError(err.message || "Erro ao conectar WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchQRCode();
    }
  }, [open]);

  // Polling para verificar conexão quando tem QR Code
  useEffect(() => {
    if (!open || !isPolling) return;

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
  }, [open, isPolling, onConnected, onOpenChange]);

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
              <p className="text-gray-600">Conectando ao WhatsApp...</p>
            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center">
              {/* Exibe pairing code como texto para NOWEB */}
              {status === 'PAIRING_CODE' ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-4 text-center">
                  <p className="text-sm text-green-700 mb-2">Código de Pareamento:</p>
                  <p className="text-3xl font-mono font-bold text-green-800 tracking-widest">
                    {qrCode.split(',')[0]}
                  </p>
                  <p className="text-xs text-green-600 mt-3">
                    Abra o WhatsApp → Dispositivos conectados → Conectar com número de telefone
                  </p>
                </div>
              ) : (
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
              )}
               
              <div className="text-center space-y-2">
                {status === 'PAIRING_CODE' ? (
                  <>
                    <p className="text-sm text-gray-600">
                      <strong>Como conectar com código:</strong>
                    </p>
                    <ol className="text-sm text-gray-500 text-left space-y-1 list-decimal list-inside">
                      <li>Abra o WhatsApp no seu celular</li>
                      <li>Toque em "Mais opções" (⋮) ou "Configurações"</li>
                      <li>Selecione "Aparelhos conectados"</li>
                      <li>Toque em "Conectar com número de telefone"</li>
                      <li>Digite o código de pareamento acima</li>
                    </ol>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      <strong>Como conectar:</strong>
                    </p>
                    <ol className="text-sm text-gray-500 text-left space-y-1 list-decimal list-inside">
                      <li>Abra o WhatsApp no seu celular</li>
                      <li>Toque em "Mais opções" (⋮) ou "Configurações"</li>
                      <li>Selecione "Aparelhos conectados"</li>
                      <li>Toque em "Conectar um aparelho"</li>
                      <li>Aponte a câmera para o QR Code acima</li>
                    </ol>
                  </>
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
              <p className="text-gray-600">Aguardando QR Code...</p>
              <p className="text-sm text-gray-400 mt-1">
                O QR Code será exibido aqui após a conexão ser iniciada.
              </p>
              <Button 
                onClick={fetchQRCode} 
                variant="outline" 
                size="sm" 
                className="mt-3"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Obter QR Code
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
