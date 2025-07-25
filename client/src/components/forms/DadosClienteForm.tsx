import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const clienteSchema = z.object({
  nomeCompleto: z.string().min(3, "Nome completo é obrigatório."),
  cpfCnpj: z.string().refine(value => value.length === 14 || value.length === 18, "CPF/CNPJ inválido."),
  rg: z.string().min(5, "RG é obrigatório.").optional(),
  orgaoEmissor: z.string().min(2, "Órgão Emissor é obrigatório.").optional(),
  estadoCivil: z.string().nonempty("Estado Civil é obrigatório."),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória."),
  nacionalidade: z.string().min(3, "Nacionalidade é obrigatória."),
  endereco: z.string().min(5, "Endereço completo é obrigatório."),
  cep: z.string().length(9, "CEP deve ter 9 dígitos (incluindo traço)."),
  telefone: z.string().min(10, "Telefone / WhatsApp é obrigatório."),
  email: z.string().email("Email inválido."),
  ocupacao: z.string().min(3, "Ocupação / Profissão é obrigatória."),
  rendaMensal: z.coerce.number().positive("Renda ou Faturamento deve ser um número positivo."),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

const DadosClienteForm: React.FC<{ register: any; control: any; errors: any }> = ({ register, control, errors }) => {
  // O handleSubmit é gerenciado pelo componente pai
  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
       <div>
        <Label htmlFor="nomeCompleto">Nome completo / Razão Social</Label>
        <Input id="nomeCompleto" {...register("nomeCompleto")} />
        {errors.nomeCompleto && <p className="text-red-500 text-sm mt-1">{errors.nomeCompleto.message}</p>}
      </div>

      <div>
        <Label htmlFor="cpfCnpj">CPF / CNPJ</Label>
        <Input id="cpfCnpj" {...register("cpfCnpj")} />
        {errors.cpfCnpj && <p className="text-red-500 text-sm mt-1">{errors.cpfCnpj.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rg">RG</Label>
          <Input id="rg" {...register("rg")} />
          {errors.rg && <p className="text-red-500 text-sm mt-1">{errors.rg.message}</p>}
        </div>
        <div>
          <Label htmlFor="orgaoEmissor">Órgão Emissor</Label>
          <Input id="orgaoEmissor" {...register("orgaoEmissor")} />
          {errors.orgaoEmissor && <p className="text-red-500 text-sm mt-1">{errors.orgaoEmissor.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="estadoCivil">Estado Civil</Label>
          <Controller
            name="estadoCivil"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                  <SelectItem value="casado">Casado(a)</SelectItem>
                  <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                  <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                  <SelectItem value="uniao_estavel">União Estável</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.estadoCivil && <p className="text-red-500 text-sm mt-1">{errors.estadoCivil.message}</p>}
        </div>
        <div>
          <Label htmlFor="dataNascimento">Data de Nascimento</Label>
          <Input type="date" id="dataNascimento" {...register("dataNascimento")} />
          {errors.dataNascimento && <p className="text-red-500 text-sm mt-1">{errors.dataNascimento.message}</p>}
        </div>
      </div>

       <div>
        <Label htmlFor="nacionalidade">Nacionalidade</Label>
        <Input id="nacionalidade" {...register("nacionalidade")} />
        {errors.nacionalidade && <p className="text-red-500 text-sm mt-1">{errors.nacionalidade.message}</p>}
      </div>

       <div>
        <Label htmlFor="cep">CEP</Label>
        <Input id="cep" {...register("cep")} />
        {errors.cep && <p className="text-red-500 text-sm mt-1">{errors.cep.message}</p>}
      </div>

      <div>
        <Label htmlFor="endereco">Endereço Completo (Rua, Nº, Bairro, Cidade, Estado)</Label>
        <Input id="endereco" {...register("endereco")} />
        {errors.endereco && <p className="text-red-500 text-sm mt-1">{errors.endereco.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div>
            <Label htmlFor="telefone">Telefone / WhatsApp</Label>
            <Input id="telefone" {...register("telefone")} />
            {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ocupacao">Ocupação / Profissão</Label>
          <Input id="ocupacao" {...register("ocupacao")} />
          {errors.ocupacao && <p className="text-red-500 text-sm mt-1">{errors.ocupacao.message}</p>}
        </div>
         <div>
          <Label htmlFor="rendaMensal">Renda / Faturamento Mensal</Label>
          <Input type="number" id="rendaMensal" {...register("rendaMensal")} placeholder="R$ 0,00"/>
          {errors.rendaMensal && <p className="text-red-500 text-sm mt-1">{errors.rendaMensal.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default DadosClienteForm;