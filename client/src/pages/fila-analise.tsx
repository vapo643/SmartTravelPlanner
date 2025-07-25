import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Clock, TrendingUp, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Proposta {
  id: number;
  clienteNome: string;
  valor: string;
  prazo: number;
  status: string;
  createdAt: string;
}

export default function FilaAnalise() {
  const [statusFilter, setStatusFilter] = useState("");
  const [valorMinimo, setValorMinimo] = useState("");
  const [valorMaximo, setValorMaximo] = useState("");
  const [busca, setBusca] = useState("");
  const [prioridadeFilter, setPrioridadeFilter] = useState("");
  const [ordenacao, setOrdenacao] = useState("data_desc");

  const { data: propostas, isLoading } = useQuery<Proposta[]>({
    queryKey: ["/api/propostas"],
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'aguardando_analise': { label: 'Pendente', variant: 'secondary' as const },
      'em_analise': { label: 'Em Análise', variant: 'default' as const },
      'aprovado': { label: 'Aprovado', variant: 'default' as const },
      'rejeitado': { label: 'Rejeitado', variant: 'destructive' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  const getPriorityBadge = (valor: string) => {
    const valorNum = parseFloat(valor);
    if (valorNum > 100000) return { label: 'Alta', variant: 'destructive' as const };
    if (valorNum > 50000) return { label: 'Média', variant: 'secondary' as const };
    return { label: 'Baixa', variant: 'outline' as const };
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  const filteredPropostas = propostas?.filter(proposta => {
    const matchesStatus = !statusFilter || proposta.status === statusFilter;
    const matchesBusca = !busca || proposta.clienteNome.toLowerCase().includes(busca.toLowerCase());
    
    let matchesValor = true;
    if (valorMinimo) {
      matchesValor = matchesValor && parseFloat(proposta.valor) >= parseFloat(valorMinimo);
    }
    if (valorMaximo) {
      matchesValor = matchesValor && parseFloat(proposta.valor) <= parseFloat(valorMaximo);
    }
    
    // Filtro por prioridade
    let matchesPrioridade = true;
    if (prioridadeFilter) {
      const valorNum = parseFloat(proposta.valor);
      const prioridade = getPriorityBadge(proposta.valor).label;
      matchesPrioridade = prioridade === prioridadeFilter;
    }
    
    return matchesStatus && matchesBusca && matchesValor && matchesPrioridade;
  })?.sort((a, b) => {
    switch (ordenacao) {
      case "data_desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "data_asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "valor_desc":
        return parseFloat(b.valor) - parseFloat(a.valor);
      case "valor_asc":
        return parseFloat(a.valor) - parseFloat(b.valor);
      case "prioridade":
        const getPriorityValue = (valor: string) => {
          const num = parseFloat(valor);
          if (num > 100000) return 3;
          if (num > 50000) return 2;
          return 1;
        };
        return getPriorityValue(b.valor) - getPriorityValue(a.valor);
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setStatusFilter("");
    setValorMinimo("");
    setValorMaximo("");
    setBusca("");
    setPrioridadeFilter("");
    setOrdenacao("data_desc");
  };

  // Estatísticas
  const getStats = () => {
    if (!propostas) return null;
    
    const aguardando = propostas.filter(p => p.status === "aguardando_analise").length;
    const emAnalise = propostas.filter(p => p.status === "em_analise").length;
    const aprovadas = propostas.filter(p => p.status === "aprovado").length;
    const rejeitadas = propostas.filter(p => p.status === "rejeitado").length;
    
    const valorTotal = propostas.reduce((acc, p) => acc + parseFloat(p.valor), 0);
    const valorMedio = valorTotal / propostas.length;
    
    return {
      aguardando,
      emAnalise,
      aprovadas,
      rejeitadas,
      valorTotal,
      valorMedio,
      total: propostas.length
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <DashboardLayout title="Fila de Análise de Crédito">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Fila de Análise de Crédito">
      <div className="space-y-6">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Aguardando Análise</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.aguardando}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Em Análise</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.emAnalise}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Aprovadas</p>
                    <p className="text-2xl font-bold text-green-600">{stats.aprovadas}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rejeitadas</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejeitadas}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Ordenação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os Status</SelectItem>
                    <SelectItem value="aguardando_analise">Pendente</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="valorMinimo">Valor Mínimo</Label>
                <Input
                  id="valorMinimo"
                  placeholder="R$ 0,00"
                  value={valorMinimo}
                  onChange={(e) => setValorMinimo(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="valorMaximo">Valor Máximo</Label>
                <Input
                  id="valorMaximo"
                  placeholder="R$ 100.000,00"
                  value={valorMaximo}
                  onChange={(e) => setValorMaximo(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="busca">Buscar Cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="busca"
                    placeholder="Nome do cliente..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="ordenacao">Ordenar por</Label>
                <Select value={ordenacao} onValueChange={setOrdenacao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data_desc">Data (Mais Recente)</SelectItem>
                    <SelectItem value="data_asc">Data (Mais Antigo)</SelectItem>
                    <SelectItem value="valor_desc">Valor (Maior)</SelectItem>
                    <SelectItem value="valor_asc">Valor (Menor)</SelectItem>
                    <SelectItem value="prioridade">Prioridade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                {filteredPropostas ? `${filteredPropostas.length} de ${propostas?.length || 0} propostas` : ''}
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposals Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Propostas para Análise
              </span>
              {stats && (
                <div className="text-sm text-gray-600">
                  Valor Total: {formatCurrency(stats.valorTotal.toString())} | 
                  Média: {formatCurrency(stats.valorMedio.toString())}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prazo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPropostas && filteredPropostas.length > 0 ? (
                    filteredPropostas.map((proposta) => {
                      const statusInfo = getStatusBadge(proposta.status);
                      const priorityInfo = getPriorityBadge(proposta.valor);
                      
                      return (
                        <tr key={proposta.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{proposta.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {proposta.clienteNome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {formatCurrency(proposta.valor)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {proposta.prazo} meses
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={priorityInfo.variant}>
                              {priorityInfo.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(proposta.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Link href={`/credito/analise/${proposta.id}`}>
                                <Button size="sm" variant="default">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Analisar
                                </Button>
                              </Link>
                              {proposta.status === 'aguardando_analise' && (
                                <Button size="sm" variant="outline">
                                  Iniciar
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Search className="h-8 w-8 text-gray-400 mb-2" />
                          <p>Nenhuma proposta encontrada</p>
                          <p className="text-sm">Tente ajustar os filtros ou criar uma nova proposta</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
