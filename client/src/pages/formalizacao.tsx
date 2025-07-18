import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  User,
  CreditCard,
  Download,
  Upload,
  Edit,
  Send,
  ArrowLeft,
  Calendar,
  DollarSign,
  Shield,
  Percent,
  Activity,
  Eye,
  MessageSquare,
  FileCheck,
  Signature,
  TrendingUp
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Proposta {
  id: number;
  clienteNome: string;
  clienteCpf: string;
  clienteEmail: string;
  clienteTelefone: string;
  clienteDataNascimento: string;
  clienteRenda: string;
  valor: string;
  valorAprovado: string;
  taxaJuros: string;
  prazo: number;
  finalidade: string;
  garantia: string;
  status: string;
  documentos: string[] | null;
  documentosAdicionais: string[] | null;
  contratoGerado: boolean;
  contratoAssinado: boolean;
  dataAprovacao: string;
  dataAssinatura: string;
  dataPagamento: string;
  observacoesFormalização: string;
  createdAt: string;
  updatedAt: string;
}

const updateFormalizacaoSchema = z.object({
  status: z.enum(["documentos_enviados", "contratos_preparados", "contratos_assinados", "pronto_pagamento", "pago"]).optional(),
  documentosAdicionais: z.array(z.string()).optional(),
  contratoGerado: z.boolean().optional(),
  contratoAssinado: z.boolean().optional(),
  observacoesFormalização: z.string().optional(),
});

type UpdateFormalizacaoForm = z.infer<typeof updateFormalizacaoSchema>;

function FormalizacaoList() {
  const [, setLocation] = useLocation();
  
  const { data: propostas, isLoading } = useQuery<Proposta[]>({
    queryKey: ["/api/propostas"],
  });

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      'aprovado': 'bg-green-500',
      'documentos_enviados': 'bg-blue-500',
      'contratos_preparados': 'bg-purple-500',
      'contratos_assinados': 'bg-indigo-500',
      'pronto_pagamento': 'bg-orange-500',
      'pago': 'bg-green-600',
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      'aprovado': 'Aprovado',
      'documentos_enviados': 'Documentos Enviados',
      'contratos_preparados': 'Contratos Preparados',
      'contratos_assinados': 'Contratos Assinados',
      'pronto_pagamento': 'Pronto para Pagamento',
      'pago': 'Pago',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  // Filter propostas that are approved or in formalization process
  const formalizacaoPropostas = propostas?.filter(p => 
    ['aprovado', 'documentos_enviados', 'contratos_preparados', 'contratos_assinados', 'pronto_pagamento', 'pago'].includes(p.status)
  ) || [];

  if (isLoading) {
    return (
      <DashboardLayout title="Formalização">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Formalização">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Formalização</h1>
            <p className="text-gray-600">Acompanhe o processo de formalização das propostas aprovadas</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total em Formalização</p>
              <p className="text-2xl font-bold text-blue-600">{formalizacaoPropostas.length}</p>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { status: 'aprovado', label: 'Aprovado', color: 'bg-green-500' },
            { status: 'documentos_enviados', label: 'Docs Enviados', color: 'bg-blue-500' },
            { status: 'contratos_preparados', label: 'Contratos Prep.', color: 'bg-purple-500' },
            { status: 'contratos_assinados', label: 'Assinados', color: 'bg-indigo-500' },
            { status: 'pronto_pagamento', label: 'Pronto Pag.', color: 'bg-orange-500' },
            { status: 'pago', label: 'Pago', color: 'bg-green-600' },
          ].map((item) => {
            const count = formalizacaoPropostas.filter(p => p.status === item.status).length;
            return (
              <Card key={item.status}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Propostas List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formalizacaoPropostas.map((proposta) => (
            <Card key={proposta.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    #{proposta.id}
                  </h3>
                  <Badge className={`${getStatusColor(proposta.status)} text-white`}>
                    {getStatusText(proposta.status)}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="font-medium text-gray-900">{proposta.clienteNome}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Valor Aprovado</p>
                    <p className="font-bold text-green-600">
                      {formatCurrency(proposta.valorAprovado || proposta.valor)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Data da Aprovação</p>
                    <p className="text-gray-900">{formatDate(proposta.dataAprovacao || proposta.createdAt)}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    onClick={() => setLocation(`/formalizacao/acompanhamento/${proposta.id}`)}
                    className="w-full"
                  >
                    Acompanhar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {formalizacaoPropostas.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhuma proposta em formalização</p>
            <p className="text-gray-400 mt-2">Propostas aprovadas aparecerão aqui</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function Formalizacao() {
  const [, params] = useRoute("/formalizacao/acompanhamento/:id");
  const [, setLocation] = useLocation();
  const propostaId = params?.id;

  // If no ID provided, show list of propostas for formalization
  if (!propostaId) {
    return <FormalizacaoList />;
  }
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'contracts'>('timeline');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: proposta, isLoading } = useQuery<Proposta>({
    queryKey: ["/api/propostas", propostaId],
    enabled: !!propostaId,
  });

  const form = useForm<UpdateFormalizacaoForm>({
    resolver: zodResolver(updateFormalizacaoSchema),
    defaultValues: {
      status: proposta?.status as any,
      documentosAdicionais: proposta?.documentosAdicionais || [],
      contratoGerado: proposta?.contratoGerado || false,
      contratoAssinado: proposta?.contratoAssinado || false,
      observacoesFormalização: proposta?.observacoesFormalização || "",
    },
  });

  const updateFormalizacao = useMutation({
    mutationFn: async (data: UpdateFormalizacaoForm) => {
      const response = await apiRequest(`/api/propostas/${propostaId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Formalização atualizada com sucesso",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/propostas", propostaId],
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar formalização",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusProgress = (status: string) => {
    const statusMap = {
      'aprovado': 20,
      'documentos_enviados': 40,
      'contratos_preparados': 60,
      'contratos_assinados': 80,
      'pronto_pagamento': 90,
      'pago': 100,
    };
    return statusMap[status as keyof typeof statusMap] || 0;
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      'aprovado': 'bg-green-500',
      'documentos_enviados': 'bg-blue-500',
      'contratos_preparados': 'bg-purple-500',
      'contratos_assinados': 'bg-indigo-500',
      'pronto_pagamento': 'bg-orange-500',
      'pago': 'bg-green-600',
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      'aprovado': 'Aprovado',
      'documentos_enviados': 'Documentos Enviados',
      'contratos_preparados': 'Contratos Preparados',
      'contratos_assinados': 'Contratos Assinados',
      'pronto_pagamento': 'Pronto para Pagamento',
      'pago': 'Pago',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getFormalizationSteps = (proposta: Proposta) => [
    {
      id: 1,
      title: "Proposta Aprovada",
      description: "Proposta foi aprovada pela equipe de crédito",
      icon: CheckCircle,
      status: "completed",
      date: formatDate(proposta.dataAprovacao || proposta.createdAt),
      completed: true,
    },
    {
      id: 2,
      title: "Documentos Adicionais",
      description: "Envio de documentos complementares",
      icon: FileText,
      status: proposta.status === 'documentos_enviados' ? "current" : 
              proposta.status === 'aprovado' ? "current" : "completed",
      date: proposta.documentosAdicionais?.length ? formatDate(proposta.updatedAt) : 'Pendente',
      completed: proposta.status !== 'aprovado',
    },
    {
      id: 3,
      title: "Contratos Preparados",
      description: "Geração e preparação dos contratos",
      icon: FileCheck,
      status: proposta.status === 'contratos_preparados' ? "current" : 
              proposta.contratoGerado ? "completed" : "pending",
      date: proposta.contratoGerado ? formatDate(proposta.updatedAt) : 'Pendente',
      completed: proposta.contratoGerado,
    },
    {
      id: 4,
      title: "Assinatura dos Contratos",
      description: "Assinatura digital dos contratos",
      icon: Signature,
      status: proposta.status === 'contratos_assinados' ? "current" : 
              proposta.contratoAssinado ? "completed" : "pending",
      date: proposta.dataAssinatura ? formatDate(proposta.dataAssinatura) : 'Pendente',
      completed: proposta.contratoAssinado,
    },
    {
      id: 5,
      title: "Liberação do Pagamento",
      description: "Processo de liberação do valor aprovado",
      icon: CreditCard,
      status: proposta.status === 'pronto_pagamento' ? "current" : 
              proposta.status === 'pago' ? "completed" : "pending",
      date: proposta.dataPagamento ? formatDate(proposta.dataPagamento) : 'Pendente',
      completed: proposta.status === 'pago',
    },
  ];

  const onSubmit = (data: UpdateFormalizacaoForm) => {
    updateFormalizacao.mutate(data);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Acompanhamento da Formalização">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (!proposta) {
    return (
      <DashboardLayout title="Acompanhamento da Formalização">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Proposta não encontrada</p>
          <Button 
            onClick={() => setLocation('/credito/fila')}
            className="mt-4"
          >
            Voltar para Fila de Análise
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const formalizationSteps = getFormalizationSteps(proposta);

  return (
    <DashboardLayout title={`Acompanhamento da Formalização - Proposta #${proposta.id}`}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/credito/fila')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Fila
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getStatusColor(proposta.status)} text-white`}>
              {getStatusText(proposta.status)}
            </Badge>
            <span className="text-sm text-gray-600">
              {getStatusProgress(proposta.status)}% concluído
            </span>
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Progresso da Formalização
                </h3>
                <span className="text-sm font-medium text-gray-600">
                  {getStatusProgress(proposta.status)}% concluído
                </span>
              </div>
              <Progress value={getStatusProgress(proposta.status)} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Card>
          <CardContent className="p-0">
            <div className="border-b">
              <div className="flex space-x-8 px-6 py-4">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`flex items-center gap-2 pb-2 text-sm font-medium border-b-2 ${
                    activeTab === 'timeline' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  Timeline
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex items-center gap-2 pb-2 text-sm font-medium border-b-2 ${
                    activeTab === 'documents' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Documentos
                </button>
                <button
                  onClick={() => setActiveTab('contracts')}
                  className={`flex items-center gap-2 pb-2 text-sm font-medium border-b-2 ${
                    activeTab === 'contracts' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileCheck className="h-4 w-4" />
                  Contratos
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Timeline de Formalização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {formalizationSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = step.completed;
                      const isCurrent = step.status === 'current';
                      
                      return (
                        <div key={step.id} className="relative">
                          {index !== formalizationSteps.length - 1 && (
                            <div className={`absolute left-4 top-8 w-0.5 h-16 ${
                              isCompleted ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                          )}
                          
                          <div className="flex items-start space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted 
                                ? 'bg-green-500 text-white' 
                                : isCurrent 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-500'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : isCurrent ? (
                                <Clock className="h-4 w-4" />
                              ) : (
                                <Icon className="h-4 w-4" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className={`text-sm font-medium ${
                                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                  {step.title}
                                </h4>
                                <span className="text-xs text-gray-500">{step.date}</span>
                              </div>
                              <p className={`text-sm ${
                                isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                {step.description}
                              </p>
                              
                              {isCurrent && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                                  <div className="flex items-center">
                                    <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
                                    <span className="text-sm font-medium text-blue-800">
                                      Etapa atual em andamento
                                    </span>
                                  </div>
                                  <p className="text-sm text-blue-700 mt-1">
                                    Aguardando ação do cliente ou processamento interno.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Original Documents */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Documentos Originais</h4>
                      <div className="space-y-2">
                        {proposta.documentos && proposta.documentos.length > 0 ? (
                          proposta.documentos.map((documento, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium text-gray-700">{documento}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Visualizar
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4 mr-1" />
                                  Baixar
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Nenhum documento original anexado</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Additional Documents */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Documentos Adicionais</h4>
                      <div className="space-y-2">
                        {proposta.documentosAdicionais && proposta.documentosAdicionais.length > 0 ? (
                          proposta.documentosAdicionais.map((documento, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-gray-700">{documento}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Visualizar
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4 mr-1" />
                                  Baixar
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Nenhum documento adicional enviado</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contracts Tab */}
            {activeTab === 'contracts' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Contratos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Contract Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          proposta.contratoGerado ? 'bg-green-100' : 'bg-gray-200'
                        }`}>
                          <FileCheck className={`h-5 w-5 ${
                            proposta.contratoGerado ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Contrato Gerado</p>
                          <p className="text-sm text-gray-600">
                            {proposta.contratoGerado ? 'Sim' : 'Não'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          proposta.contratoAssinado ? 'bg-green-100' : 'bg-gray-200'
                        }`}>
                          <Signature className={`h-5 w-5 ${
                            proposta.contratoAssinado ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Contrato Assinado</p>
                          <p className="text-sm text-gray-600">
                            {proposta.contratoAssinado ? 'Sim' : 'Não'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contract Actions */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Ações do Contrato</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          disabled={!proposta.contratoGerado}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Visualizar Contrato
                        </Button>
                        <Button 
                          variant="outline" 
                          disabled={!proposta.contratoGerado}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Baixar Contrato
                        </Button>
                        <Button 
                          variant="outline" 
                          disabled={!proposta.contratoGerado || proposta.contratoAssinado}
                          className="flex items-center gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Enviar para Assinatura
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Proposal Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Resumo da Proposta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Cliente</Label>
                    <p className="text-gray-900 font-medium">{proposta.clienteNome}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Valor Aprovado</Label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(proposta.valorAprovado || proposta.valor)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Taxa de Juros</Label>
                    <p className="text-gray-900 font-medium flex items-center gap-1">
                      <Percent className="h-4 w-4" />
                      {proposta.taxaJuros || 'N/A'}% a.m.
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Prazo</Label>
                    <p className="text-gray-900 font-medium">{proposta.prazo} meses</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Data da Aprovação</Label>
                    <p className="text-gray-900 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(proposta.dataAprovacao || proposta.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Gerenciar Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status Atual</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={form.watch('status') || proposta.status}
                      onChange={(e) => form.setValue('status', e.target.value as any)}
                    >
                      <option value="aprovado">Aprovado</option>
                      <option value="documentos_enviados">Documentos Enviados</option>
                      <option value="contratos_preparados">Contratos Preparados</option>
                      <option value="contratos_assinados">Contratos Assinados</option>
                      <option value="pronto_pagamento">Pronto para Pagamento</option>
                      <option value="pago">Pago</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      rows={3}
                      placeholder="Adicione observações sobre o processo..."
                      {...form.register('observacoesFormalização')}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateFormalizacao.isPending}
                  >
                    {updateFormalizacao.isPending ? "Atualizando..." : "Atualizar Status"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Próximos Passos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proposta.status === 'aprovado' && (
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-sm font-medium text-blue-800">
                        Aguardando documentos adicionais
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Cliente deve enviar documentos complementares solicitados.
                      </p>
                    </div>
                  )}
                  {proposta.status === 'documentos_enviados' && (
                    <div className="p-3 bg-purple-50 rounded-md">
                      <p className="text-sm font-medium text-purple-800">
                        Preparar contratos
                      </p>
                      <p className="text-sm text-purple-700 mt-1">
                        Gerar e preparar contratos para assinatura.
                      </p>
                    </div>
                  )}
                  {proposta.status === 'contratos_preparados' && (
                    <div className="p-3 bg-indigo-50 rounded-md">
                      <p className="text-sm font-medium text-indigo-800">
                        Aguardando assinatura
                      </p>
                      <p className="text-sm text-indigo-700 mt-1">
                        Contratos enviados para assinatura do cliente.
                      </p>
                    </div>
                  )}
                  {proposta.status === 'contratos_assinados' && (
                    <div className="p-3 bg-orange-50 rounded-md">
                      <p className="text-sm font-medium text-orange-800">
                        Preparar pagamento
                      </p>
                      <p className="text-sm text-orange-700 mt-1">
                        Processar liberação do valor aprovado.
                      </p>
                    </div>
                  )}
                  {proposta.status === 'pronto_pagamento' && (
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-sm font-medium text-green-800">
                        Liberar pagamento
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Valor pronto para ser liberado ao cliente.
                      </p>
                    </div>
                  )}
                  {proposta.status === 'pago' && (
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-sm font-medium text-green-800">
                        Processo concluído
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Valor liberado com sucesso ao cliente.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
