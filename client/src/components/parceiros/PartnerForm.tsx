import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const partnerSchema = z.object({
  razaoSocial: z.string().min(3, "Razão Social é obrigatória."),
  nomeFantasia: z.string().min(3, "Nome Fantasia é obrigatório."),
  cnpj: z.string().length(18, "CNPJ deve ter 18 caracteres (incluindo máscara)."),
  inscricaoEstadual: z.string().min(2, "Inscrição Estadual é obrigatória."),
  cep: z.string().length(9, "CEP deve ter 8 caracteres (incluindo o traço)."),
  endereco: z.string().min(3, "Endereço é obrigatório."),
  numero: z.string().min(1, "Número é obrigatório."),
  complemento: z.string().optional(),
  bairro: z.string().min(3, "Bairro é obrigatório."),
  cidade: z.string().min(3, "Cidade é obrigatória."),
  estado: z.string().length(2, "Estado (UF) deve ter 2 caracteres."),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

interface PartnerFormProps {
  initialData?: any;
  onSubmit: (data: PartnerFormData) => void;
  onCancel: () => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input id="cnpj" {...register("cnpj")} placeholder="00.000.000/0001-00" />
        {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>}
      </div>
      <div>
        <Label htmlFor="razaoSocial">Razão Social</Label>
        <Input id="razaoSocial" {...register("razaoSocial")} />
        {errors.razaoSocial && <p className="text-red-500 text-sm mt-1">{errors.razaoSocial.message}</p>}
      </div>
      <div>
        <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
        <Input id="nomeFantasia" {...register("nomeFantasia")} />
        {errors.nomeFantasia && <p className="text-red-500 text-sm mt-1">{errors.nomeFantasia.message}</p>}
      </div>
      <div>
        <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
        <Input id="inscricaoEstadual" {...register("inscricaoEstadual")} />
        {errors.inscricaoEstadual && <p className="text-red-500 text-sm mt-1">{errors.inscricaoEstadual.message}</p>}
      </div>
      <div>
        <Label htmlFor="cep">CEP</Label>
        <Input id="cep" {...register("cep")} placeholder="00000-000" />
        {errors.cep && <p className="text-red-500 text-sm mt-1">{errors.cep.message}</p>}
      </div>
      <div>
        <Label htmlFor="endereco">Endereço</Label>
        <Input id="endereco" {...register("endereco")} />
        {errors.endereco && <p className="text-red-500 text-sm mt-1">{errors.endereco.message}</p>}
      </div>
      <div>
        <Label htmlFor="numero">Número</Label>
        <Input id="numero" {...register("numero")} />
        {errors.numero && <p className="text-red-500 text-sm mt-1">{errors.numero.message}</p>}
      </div>
      <div>
        <Label htmlFor="complemento">Complemento</Label>
        <Input id="complemento" {...register("complemento")} />
      </div>
      <div>
        <Label htmlFor="bairro">Bairro</Label>
        <Input id="bairro" {...register("bairro")} />
        {errors.bairro && <p className="text-red-500 text-sm mt-1">{errors.bairro.message}</p>}
      </div>
      <div>
        <Label htmlFor="cidade">Cidade</Label>
        <Input id="cidade" {...register("cidade")} />
        {errors.cidade && <p className="text-red-500 text-sm mt-1">{errors.cidade.message}</p>}
      </div>
      <div>
        <Label htmlFor="estado">Estado (UF)</Label>
        <Input id="estado" {...register("estado")} placeholder="Ex: SP" maxLength={2} />
        {errors.estado && <p className="text-red-500 text-sm mt-1">{errors.estado.message}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
};

export default PartnerForm;