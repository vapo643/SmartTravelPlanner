import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { TabelaComercial } from '@/pages/configuracoes/tabelas';

const tabelaSchema = z.object({
  nomeTabela: z.string().min(3, "Nome da Tabela deve ter pelo menos 3 caracteres."),
  taxaJuros: z.number().positive("Taxa de Juros deve ser um número positivo."),
  prazosPermitidos: z.array(z.number()).min(1, "Deve conter ao menos um prazo."),
});

type TabelaFormData = z.infer<typeof tabelaSchema>;

interface TabelaComercialFormProps {
  initialData?: TabelaComercial | null;
  onSubmit: (data: Omit<TabelaComercial, 'id'>) => void;
  onCancel: () => void;
}

const TabelaComercialForm: React.FC<TabelaComercialFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [novoPrazo, setNovoPrazo] = useState('');
  const [prazos, setPrazos] = useState<number[]>(initialData?.prazosPermitidos || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<TabelaFormData>({
    resolver: zodResolver(tabelaSchema),
    defaultValues: {
      nomeTabela: initialData?.nomeTabela || '',
      taxaJuros: initialData?.taxaJuros || 0,
      prazosPermitidos: initialData?.prazosPermitidos || []
    }
  });

  const adicionarPrazo = () => {
    const prazo = parseInt(novoPrazo);
    if (prazo > 0 && !prazos.includes(prazo)) {
      const novosPrazos = [...prazos, prazo].sort((a, b) => a - b);
      setPrazos(novosPrazos);
      setValue('prazosPermitidos', novosPrazos);
      setNovoPrazo('');
    }
  };

  const removerPrazo = (prazoRemover: number) => {
    const novosPrazos = prazos.filter(p => p !== prazoRemover);
    setPrazos(novosPrazos);
    setValue('prazosPermitidos', novosPrazos);
  };

  const handleFormSubmit = (data: TabelaFormData) => {
    onSubmit({
      nomeTabela: data.nomeTabela,
      taxaJuros: data.taxaJuros,
      prazosPermitidos: prazos
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarPrazo();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="nomeTabela">Nome da Tabela</Label>
        <Input
          id="nomeTabela"
          {...register('nomeTabela')}
          placeholder="Ex: Tabela A - Preferencial"
        />
        {errors.nomeTabela && (
          <span className="text-sm text-red-500" role="alert">
            {errors.nomeTabela.message}
          </span>
        )}
      </div>

      <div>
        <Label htmlFor="taxaJuros">Taxa de Juros Mensal (%)</Label>
        <Input
          id="taxaJuros"
          type="number"
          step="0.01"
          min="0"
          {...register('taxaJuros', { valueAsNumber: true })}
          placeholder="Ex: 1.5"
        />
        {errors.taxaJuros && (
          <span className="text-sm text-red-500" role="alert">
            {errors.taxaJuros.message}
          </span>
        )}
      </div>

      <div>
        <Label htmlFor="prazos">Prazos Permitidos (meses)</Label>
        <div className="flex space-x-2 mb-2">
          <Input
            id="prazos"
            type="number"
            min="1"
            value={novoPrazo}
            onChange={(e) => setNovoPrazo(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: 12"
          />
          <Button
            type="button"
            onClick={adicionarPrazo}
            disabled={!novoPrazo || parseInt(novoPrazo) <= 0}
          >
            Adicionar
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {prazos.map(prazo => (
            <Badge key={prazo} variant="secondary" className="flex items-center gap-1">
              {prazo} meses
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => removerPrazo(prazo)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        
        {errors.prazosPermitidos && (
          <span className="text-sm text-red-500" role="alert">
            {errors.prazosPermitidos.message}
          </span>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar
        </Button>
      </div>
    </form>
  );
};

export default TabelaComercialForm;