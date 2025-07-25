import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import fetchWithToken from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";

const clienteSchema = z.object({
  clienteNome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  clienteCpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  clienteEmail: z.string().email("Email inválido"),
  clienteTelefone: z.string().min(10, "Telefone inválido"),
  clienteDataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  clienteRenda: z.string().min(1, "Renda é obrigatória"),
});

const emprestimoSchema = z.object({
  valor: z.string().min(1, "Valor é obrigatório"),
  prazo: z.string().min(1, "Prazo é obrigatório"),
  finalidade: z.string().min(1, "Finalidade é obrigatória"),
  garantia: z.string().min(1, "Garantia é obrigatória"),
});

const documentosSchema = z.object({
  documentos: z.array(z.string()).optional(),
});

const fullSchema = clienteSchema.merge(emprestimoSchema).merge(documentosSchema);

type PropostaForm = z.infer<typeof fullSchema>;

export default function NovaProposta() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PropostaForm>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      documentos: [],
    },
  });

  const createProposta = useMutation({
    mutationFn: async (data: PropostaForm) => {
      const response = await apiRequest("POST", "/api/propostas", {
        ...data,
        status: "aguardando_analise",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Proposta criada com sucesso!",
        description: "A proposta foi enviada para análise.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/propostas"] });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar proposta",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetchWithToken("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      const currentDocs = watch("documentos") || [];
      setValue("documentos", [...currentDocs, data.fileName]);
      toast({
        title: "Documento enviado com sucesso!",
        description: "O documento foi anexado à proposta.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao enviar documento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile.mutate(file);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: PropostaForm) => {
    createProposta.mutate(data);
  };

  const steps = [
    { number: 1, title: "Dados do Cliente" },
    { number: 2, title: "Condições" },
    { number: 3, title: "Documentos" },
  ];

  return (
    <DashboardLayout title="Nova Proposta de Crédito">
      <div className="max-w-4xl mx-auto">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.number
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {step.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? "text-primary" : "text-gray-500"
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-16 h-px bg-gray-300 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Cliente Data */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Cliente</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="clienteNome">Nome Completo</Label>
                      <Input
                        id="clienteNome"
                        placeholder="Digite o nome completo"
                        {...register("clienteNome")}
                      />
                      {errors.clienteNome && (
                        <p className="text-sm text-red-600">{errors.clienteNome.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="clienteCpf">CPF</Label>
                      <Input
                        id="clienteCpf"
                        placeholder="000.000.000-00"
                        {...register("clienteCpf")}
                      />
                      {errors.clienteCpf && (
                        <p className="text-sm text-red-600">{errors.clienteCpf.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="clienteEmail">Email</Label>
                      <Input
                        id="clienteEmail"
                        type="email"
                        placeholder="email@exemplo.com"
                        {...register("clienteEmail")}
                      />
                      {errors.clienteEmail && (
                        <p className="text-sm text-red-600">{errors.clienteEmail.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="clienteTelefone">Telefone</Label>
                      <Input
                        id="clienteTelefone"
                        placeholder="(11) 99999-9999"
                        {...register("clienteTelefone")}
                      />
                      {errors.clienteTelefone && (
                        <p className="text-sm text-red-600">{errors.clienteTelefone.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="clienteDataNascimento">Data de Nascimento</Label>
                      <Input
                        id="clienteDataNascimento"
                        type="date"
                        {...register("clienteDataNascimento")}
                      />
                      {errors.clienteDataNascimento && (
                        <p className="text-sm text-red-600">{errors.clienteDataNascimento.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="clienteRenda">Renda Mensal</Label>
                      <Input
                        id="clienteRenda"
                        placeholder="R$ 5.000,00"
                        {...register("clienteRenda")}
                      />
                      {errors.clienteRenda && (
                        <p className="text-sm text-red-600">{errors.clienteRenda.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Loan Conditions */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Condições do Empréstimo</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="valor">Valor Solicitado</Label>
                      <Input
                        id="valor"
                        placeholder="R$ 50.000,00"
                        {...register("valor")}
                      />
                      {errors.valor && (
                        <p className="text-sm text-red-600">{errors.valor.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="prazo">Prazo (meses)</Label>
                      <Select onValueChange={(value) => setValue("prazo", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o prazo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 meses</SelectItem>
                          <SelectItem value="24">24 meses</SelectItem>
                          <SelectItem value="36">36 meses</SelectItem>
                          <SelectItem value="48">48 meses</SelectItem>
                          <SelectItem value="60">60 meses</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.prazo && (
                        <p className="text-sm text-red-600">{errors.prazo.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="finalidade">Finalidade</Label>
                      <Select onValueChange={(value) => setValue("finalidade", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a finalidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="capital_giro">Capital de Giro</SelectItem>
                          <SelectItem value="investimento">Investimento</SelectItem>
                          <SelectItem value="equipamentos">Equipamentos</SelectItem>
                          <SelectItem value="reforma">Reforma</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.finalidade && (
                        <p className="text-sm text-red-600">{errors.finalidade.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="garantia">Tipo de Garantia</Label>
                      <Select onValueChange={(value) => setValue("garantia", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a garantia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aval">Aval</SelectItem>
                          <SelectItem value="fianca">Fiança</SelectItem>
                          <SelectItem value="imovel">Imóvel</SelectItem>
                          <SelectItem value="veiculo">Veículo</SelectItem>
                          <SelectItem value="sem_garantia">Sem Garantia</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.garantia && (
                        <p className="text-sm text-red-600">{errors.garantia.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Anexo de Documentos</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      "Documento de Identidade",
                      "Comprovante de Renda",
                      "Comprovante de Residência",
                      "Documentos Adicionais"
                    ].map((docType) => (
                      <div key={docType}>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          {docType}
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                          <Upload className="text-gray-400 text-3xl mb-2 mx-auto" />
                          <p className="text-gray-500 mb-2">
                            Clique para enviar ou arraste o arquivo aqui
                          </p>
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="hidden"
                            id={`file-${docType}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`file-${docType}`)?.click()}
                            disabled={uploadFile.isPending}
                          >
                            {uploadFile.isPending ? "Enviando..." : "Selecionar Arquivo"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                
                <div className="space-x-4">
                  <Button type="button" variant="outline">
                    Salvar Rascunho
                  </Button>
                  {currentStep < 3 ? (
                    <Button type="button" onClick={nextStep}>
                      Próximo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={createProposta.isPending}>
                      {createProposta.isPending ? "Criando..." : "Criar Proposta"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
