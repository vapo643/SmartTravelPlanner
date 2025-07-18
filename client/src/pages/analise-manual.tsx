import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle, 
  AlertTriangle, 
  Percent, 
  FileText, 
  User, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Eye, 
  Download,
  ArrowLeft,
  Shield,
  AlertCircle,
  Clock,
  Calculator
} from "lucide-react";

const decisionSchema = z.object({
  status: z.enum(["aprovado", "rejeitado", "solicitar_info"]),
  valorAprovado: z.string().optional(),
  taxaJuros: z.string().optional(),
  observacoes: z.string().optional(),
});

type DecisionForm = z.infer<typeof decisionSchema>;

interface Proposta {
  id: number;
  clienteNome: string;
  clienteCpf: string;
  clienteEmail: string;
  clienteTelefone: string;
  clienteDataNascimento: string;
  clienteRenda: string;
  valor: string;
  prazo: number;
  finalidade: string;
  garantia: string;
  status: string;
  documentos: string[] | null;
  createdAt: string;
}

export default function AnaliseManual() {
  const [, params] = useRoute("/credito/analise/:id");
  const [, setLocation] = useLocation();
  const propostaId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const { data: proposta, isLoading } = useQuery<Proposta>({
    queryKey: ["/api/propostas", propostaId],
    enabled: !!propostaId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DecisionForm>({
    resolver: zodResolver(decisionSchema),
  });

  const updateProposta = useMutation({
    mutationFn: async (data: DecisionForm) => {
      const response = await apiRequest("PATCH", `/api/propostas/${propostaId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Decisão salva com sucesso!",
        description: "A proposta foi atualizada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/propostas"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar decisão",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DecisionForm) => {
    updateProposta.mutate(data);
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Enhanced credit analysis logic
  const getCreditAnalysis = (proposta: Proposta) => {
    const renda = parseFloat(proposta.clienteRenda.replace(/[^\d,]/g, '').replace(',', '.'));
    const valor = parseFloat(proposta.valor);
    const idade = new Date().getFullYear() - new Date(proposta.clienteDataNascimento).getFullYear();
    
    // Score calculation based on multiple factors
    let score = 600; // Base score
    
    // Age factor
    if (idade >= 25 && idade <= 55) score += 50;
    else if (idade >= 18 && idade <= 65) score += 20;
    
    // Income to loan ratio
    const incomeRatio = valor / renda;
    if (incomeRatio <= 5) score += 100;
    else if (incomeRatio <= 10) score += 50;
    else if (incomeRatio <= 20) score += 20;
    
    // Loan purpose
    if (proposta.finalidade === 'investimento') score += 30;
    else if (proposta.finalidade === 'capital_giro') score += 20;
    
    // Collateral
    if (proposta.garantia === 'imovel') score += 80;
    else if (proposta.garantia === 'veiculo') score += 40;
    else if (proposta.garantia === 'aval') score += 30;
    
    // Risk assessment
    let risco = "Baixo";
    let riscoColor = "green";
    let taxaSugerida = 1.8;
    
    if (score >= 750) {
      risco = "Baixo";
      riscoColor = "green";
      taxaSugerida = 1.8;
    } else if (score >= 650) {
      risco = "Médio";
      riscoColor = "yellow";
      taxaSugerida = 2.5;
    } else if (score >= 550) {
      risco = "Alto";
      riscoColor = "orange";
      taxaSugerida = 4.2;
    } else {
      risco = "Muito Alto";
      riscoColor = "red";
      taxaSugerida = 6.5;
    }
    
    return {
      score: Math.min(850, Math.max(300, score)),
      risco,
      riscoColor,
      taxaSugerida,
      incomeRatio,
      idade,
      recommendation: score >= 650 ? "Aprovação recomendada" : score >= 550 ? "Análise detalhada necessária" : "Rejeição recomendada"
    };
  };

  const creditAnalysis = proposta ? getCreditAnalysis(proposta) : null;

  // Simulate analysis progress
  useEffect(() => {
    if (analysisStarted && analysisProgress < 100) {
      const timer = setTimeout(() => {
        setAnalysisProgress(prev => Math.min(100, prev + 10));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [analysisStarted, analysisProgress]);

  const startAnalysis = () => {
    setAnalysisStarted(true);
    setAnalysisProgress(0);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Análise Manual">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!proposta) {
    return (
      <DashboardLayout title="Análise Manual">
        <div className="text-center py-12">
          <p className="text-gray-500">Proposta não encontrada</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Análise Manual - Proposta #${proposta.id}`}>
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
            <Badge variant={proposta.status === 'aguardando_analise' ? 'secondary' : 'default'}>
              {proposta.status === 'aguardando_analise' ? 'Aguardando Análise' : 
               proposta.status === 'em_analise' ? 'Em Análise' : 
               proposta.status === 'aprovado' ? 'Aprovado' : 
               proposta.status === 'rejeitado' ? 'Rejeitado' : proposta.status}
            </Badge>
            <Button 
              onClick={startAnalysis}
              disabled={analysisStarted}
              className="flex items-center gap-2"
            >
              {analysisStarted ? <Clock className="h-4 w-4" /> : <Calculator className="h-4 w-4" />}
              {analysisStarted ? 'Analisando...' : 'Iniciar Análise'}
            </Button>
          </div>
        </div>

        {/* Analysis Progress */}
        {analysisStarted && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso da Análise</span>
                <span className="text-sm text-gray-600">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Nome Completo</Label>
                    <p className="text-gray-900 font-medium">{proposta.clienteNome}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">CPF</Label>
                    <p className="text-gray-900 font-mono">{proposta.clienteCpf}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <p className="text-gray-900">{proposta.clienteEmail}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Telefone</Label>
                    <p className="text-gray-900">{proposta.clienteTelefone}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Data de Nascimento</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{formatDate(proposta.clienteDataNascimento)}</p>
                      {creditAnalysis && (
                        <Badge variant="outline" className="ml-2">
                          {creditAnalysis.idade} anos
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Renda Mensal</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <p className="text-gray-900 font-medium">{proposta.clienteRenda}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Detalhes do Empréstimo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Valor Solicitado</Label>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(proposta.valor)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Prazo</Label>
                    <p className="text-gray-900 font-medium">{proposta.prazo} meses</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Finalidade</Label>
                    <Badge variant="outline">{proposta.finalidade}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Garantia</Label>
                    <Badge variant="outline">{proposta.garantia}</Badge>
                  </div>
                  {creditAnalysis && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Relação Renda/Empréstimo</Label>
                        <p className="text-gray-900 font-medium">{creditAnalysis.incomeRatio.toFixed(2)}x</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Data da Solicitação</Label>
                        <p className="text-gray-900">{formatDate(proposta.createdAt)}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Credit Analysis */}
            {creditAnalysis && analysisProgress >= 100 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Análise de Crédito
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        creditAnalysis.score >= 750 ? 'bg-green-100' : 
                        creditAnalysis.score >= 650 ? 'bg-yellow-100' : 
                        creditAnalysis.score >= 550 ? 'bg-orange-100' : 'bg-red-100'
                      }`}>
                        <CheckCircle className={`h-8 w-8 ${
                          creditAnalysis.score >= 750 ? 'text-green-600' : 
                          creditAnalysis.score >= 650 ? 'text-yellow-600' : 
                          creditAnalysis.score >= 550 ? 'text-orange-600' : 'text-red-600'
                        }`} />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Score de Crédito</p>
                      <p className={`text-2xl font-bold ${
                        creditAnalysis.score >= 750 ? 'text-green-600' : 
                        creditAnalysis.score >= 650 ? 'text-yellow-600' : 
                        creditAnalysis.score >= 550 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {creditAnalysis.score}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        creditAnalysis.riscoColor === 'green' ? 'bg-green-100' : 
                        creditAnalysis.riscoColor === 'yellow' ? 'bg-yellow-100' : 
                        creditAnalysis.riscoColor === 'orange' ? 'bg-orange-100' : 'bg-red-100'
                      }`}>
                        <AlertTriangle className={`h-8 w-8 ${
                          creditAnalysis.riscoColor === 'green' ? 'text-green-600' : 
                          creditAnalysis.riscoColor === 'yellow' ? 'text-yellow-600' : 
                          creditAnalysis.riscoColor === 'orange' ? 'text-orange-600' : 'text-red-600'
                        }`} />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Nível de Risco</p>
                      <p className={`text-2xl font-bold ${
                        creditAnalysis.riscoColor === 'green' ? 'text-green-600' : 
                        creditAnalysis.riscoColor === 'yellow' ? 'text-yellow-600' : 
                        creditAnalysis.riscoColor === 'orange' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {creditAnalysis.risco}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Percent className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Taxa Sugerida</p>
                      <p className="text-2xl font-bold text-blue-600">{creditAnalysis.taxaSugerida}%</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Recomendação do Sistema</h4>
                    </div>
                    <p className="text-gray-700">{creditAnalysis.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Decision Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Painel de Decisão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="status">Decisão</Label>
                    <Select onValueChange={(value) => setValue("status", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma decisão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aprovado">Aprovar</SelectItem>
                        <SelectItem value="rejeitado">Rejeitar</SelectItem>
                        <SelectItem value="solicitar_info">Solicitar Informações</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-600">{errors.status.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="valorAprovado">Valor Aprovado</Label>
                    <Input
                      id="valorAprovado"
                      placeholder={formatCurrency(proposta.valor)}
                      {...register("valorAprovado")}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="taxaJuros">Taxa de Juros (%)</Label>
                    <Input
                      id="taxaJuros"
                      placeholder={creditAnalysis ? creditAnalysis.taxaSugerida.toString() : "2.5"}
                      {...register("taxaJuros")}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      rows={4}
                      placeholder="Adicione observações sobre a decisão..."
                      {...register("observacoes")}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateProposta.isPending}
                  >
                    {updateProposta.isPending ? "Salvando..." : "Salvar Decisão"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proposta.documentos && proposta.documentos.length > 0 ? (
                    proposta.documentos.map((documento, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-red-500" />
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
                    <div className="text-center py-6">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Nenhum documento anexado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loan Details */}
          <Card>
            <CardContent className="p-6">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Detalhes do Empréstimo</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Valor Solicitado</Label>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(proposta.valor)}</p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Prazo</Label>
                  <p className="text-gray-900">{proposta.prazo} meses</p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Finalidade</Label>
                  <p className="text-gray-900">{proposta.finalidade}</p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Garantia</Label>
                  <p className="text-gray-900">{proposta.garantia}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Analysis */}
          <Card>
            <CardContent className="p-6">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Análise de Crédito</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Score</p>
                  <p className="text-2xl font-bold text-green-600">{creditAnalysis.score}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Risco</p>
                  <p className="text-2xl font-bold text-yellow-600">{creditAnalysis.risco}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Percent className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Taxa Sugerida</p>
                  <p className="text-2xl font-bold text-blue-600">{creditAnalysis.taxa}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decision Panel */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Painel de Decisão</h3>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="status">Decisão</Label>
                  <Select onValueChange={(value) => setValue("status", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma decisão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aprovado">Aprovar</SelectItem>
                      <SelectItem value="rejeitado">Rejeitar</SelectItem>
                      <SelectItem value="solicitar_info">Solicitar Informações</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="valorAprovado">Valor Aprovado</Label>
                  <Input
                    id="valorAprovado"
                    placeholder={formatCurrency(proposta.valor)}
                    {...register("valorAprovado")}
                  />
                </div>
                
                <div>
                  <Label htmlFor="taxaJuros">Taxa de Juros (%)</Label>
                  <Input
                    id="taxaJuros"
                    placeholder="2.5"
                    {...register("taxaJuros")}
                  />
                </div>
                
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    rows={4}
                    placeholder="Adicione observações sobre a decisão..."
                    {...register("observacoes")}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateProposta.isPending}
                >
                  {updateProposta.isPending ? "Salvando..." : "Salvar Decisão"}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
