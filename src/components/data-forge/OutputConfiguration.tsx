
"use client";

import type { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { OutputConfiguration, FieldMapping, CsvDelimiter, OutputFormat, EncodingType, DateFormatType } from '@/types';
import { DATE_FORMATS, CUSTOM_FIELD_INDICATOR, NO_MAPPING_VALUE } from '@/types';
import { AlertCircle, ArrowUp, ArrowDown, Save, FolderOpen, PlusCircle, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';


interface OutputConfigurationProps {
  config: OutputConfiguration;
  mappings: FieldMapping[];
  onConfigChange: (fieldName: keyof OutputConfiguration, value: any) => void;
  onMappingFieldChange: (
    originalHeaderId: string,
    fieldName: keyof FieldMapping,
    value: any
  ) => void;
  onOrderChange: (originalHeaderId: string, direction: 'up' | 'down') => void;
}

const ENCODING_OPTIONS: { label: string; value: EncodingType }[] = [
    { label: "UTF-8 (Padrão)", value: "UTF-8" },
    { label: "ANSI (Windows-1252)", value: "ANSI" },
    { label: "ISO-8859-1 (Latin1)", value: "ISO-8859-1" },
];


export function OutputConfiguration({
  config,
  mappings,
  onConfigChange,
  onMappingFieldChange,
  onOrderChange,
}: OutputConfigurationProps) {
  const { toast } = useToast();

  const handleFormatChange = (value: OutputFormat | string) => {
    onConfigChange('format', value as OutputFormat);
  };

  const handleEncodingChange = (value: EncodingType | string) => {
    onConfigChange('encoding', value as EncodingType);
  };

  const handleSaveModel = () => {
    toast({ title: "Funcionalidade Indisponível", description: "Salvar Modelo ainda não implementada.", variant: "default"});
  };

  const handleLoadModel = () => {
    toast({ title: "Funcionalidade Indisponível", description: "Carregar Modelo ainda não implementada.", variant: "default"});
  };

  const handleAddMappedField = () => {
     toast({ title: "Funcionalidade Indisponível", description: "Adicionar Campo Mapeado - funcionalidade a ser implementada.", variant: "default"});
  };
  const handleAddStaticField = () => {
     toast({ title: "Funcionalidade Indisponível", description: "Adicionar Campo Estático - funcionalidade a ser implementada.", variant: "default"});
  };
  const handleAddCalculatedField = () => {
     toast({ title: "Funcionalidade Indisponível", description: "Adicionar Campo Calculado - funcionalidade a ser implementada.", variant: "default"});
  };
  const handleRemoveField = (originalHeaderId: string) => {
     toast({ title: "Funcionalidade Indisponível", description: `Remover campo ${originalHeaderId} - funcionalidade a ser implementada.`, variant: "default"});
  };

  // Filter for valid, mapped fields and sort them by their orderIndex for display
  const mappedFieldsForOutput = mappings
    .filter(m => m.mappedTo !== '' && m.mappedTo !== NO_MAPPING_VALUE && m.dataType !== '')
    .sort((a, b) => (a.orderIndex ?? Infinity) - (b.orderIndex ?? Infinity));


  if (!mappedFieldsForOutput.length && mappings.some(m => m.mappedTo === '' || m.mappedTo === NO_MAPPING_VALUE || m.dataType === '')) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Configurar Saída</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <AlertCircle className="mr-2 h-5 w-5" />
            <p>Mapeie os campos na etapa anterior e defina seus tipos para configurar a saída.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!mappedFieldsForOutput.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurar Saída</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <AlertCircle className="mr-2 h-5 w-5" />
            <p>Nenhum campo foi mapeado para saída. Volte à etapa anterior para mapear os campos.</p>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Configuração do Arquivo de Saída</CardTitle>
              <CardDescription>
                Defina formato, codificação, delimitador (CSV), ordem e formatação dos campos.
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleSaveModel} disabled>
                <Save className="mr-2 h-4 w-4" /> Salvar Modelo
              </Button>
              <Button variant="outline" onClick={handleLoadModel} disabled>
                <FolderOpen className="mr-2 h-4 w-4" /> Carregar Modelo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="output-format" className="text-base font-semibold">Formato de Saída</Label>
              <Select value={config.format} onValueChange={handleFormatChange}>
                <SelectTrigger id="output-format" className="mt-2">
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="txt">TXT Posicional (Largura Fixa)</SelectItem>
                  <SelectItem value="csv">CSV (Delimitado por)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="output-encoding" className="text-base font-semibold">Codificação</Label>
              <Select value={config.encoding} onValueChange={handleEncodingChange}>
                <SelectTrigger id="output-encoding" className="mt-2">
                  <SelectValue placeholder="Selecione a codificação" />
                </SelectTrigger>
                <SelectContent>
                  {ENCODING_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {config.format === 'csv' && (
            <div>
              <Label htmlFor="csv-delimiter" className="text-base font-semibold">Delimitador CSV</Label>
              <Select value={config.csvDelimiter || ''} onValueChange={(value) => onConfigChange('csvDelimiter', value as CsvDelimiter)}>
                <SelectTrigger id="csv-delimiter" className="mt-2 w-[180px]">
                  <SelectValue placeholder="Selecione delimitador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="|">Pipe |</SelectItem>
                  <SelectItem value=";">Ponto e vírgula ;</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-base font-semibold">Campos de Saída</Label>
            <p className="text-sm text-muted-foreground">
              Defina a ordem, conteúdo e formatação dos campos no arquivo final.
            </p>
          </div>

          <ScrollArea className="w-full whitespace-nowrap rounded-md border max-h-[500px]">
            <div className="overflow-x-auto">
              <Table className="min-w-max">
                <TableHeader><TableRow><TableHead className="w-[80px]">Ordem</TableHead><TableHead>Campo</TableHead><TableHead className="w-[180px]">Formato Data</TableHead><TableHead className="w-[100px]">Tam.<Tooltip><TooltipTrigger asChild><Info className="ml-1 h-3 w-3 inline-block" /></TooltipTrigger><TooltipContent><p>Tamanho fixo do campo para TXT.</p></TooltipContent></Tooltip></TableHead><TableHead className="w-[100px]">Preench.<Tooltip><TooltipTrigger asChild><Info className="ml-1 h-3 w-3 inline-block" /></TooltipTrigger><TooltipContent><p>Caractere para preenchimento (ex: 0, espaço).</p></TooltipContent></Tooltip></TableHead><TableHead className="w-[150px]">Direção Preench.<Tooltip><TooltipTrigger asChild><Info className="ml-1 h-3 w-3 inline-block" /></TooltipTrigger><TooltipContent><p>Direção do preenchimento (Esquerda/Direita).</p></TooltipContent></Tooltip></TableHead><TableHead className="w-[80px]">Ações</TableHead></TableRow></TableHeader>
                <TableBody>{mappedFieldsForOutput.map((mapping, index) => (<TableRow key={mapping.originalHeaderId}><TableCell className="text-center"><div className="flex items-center justify-center space-x-1"><span className="mr-1">{mapping.orderIndex}</span><div className="flex flex-col"><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onOrderChange(mapping.originalHeaderId, 'up')} disabled={index === 0}><ArrowUp className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onOrderChange(mapping.originalHeaderId, 'down')} disabled={index === mappedFieldsForOutput.length - 1}><ArrowDown className="h-3 w-3" /></Button></div></div></TableCell><TableCell className="font-medium">{mapping.mappedTo === CUSTOM_FIELD_INDICATOR ? mapping.customFieldName : mapping.mappedTo}</TableCell><TableCell>{mapping.dataType === 'Data' ? (<Select value={mapping.dateFormat || ''} onValueChange={(value) => onMappingFieldChange(mapping.originalHeaderId, 'dateFormat', value as DateFormatType)}><SelectTrigger><SelectValue placeholder="Selecione formato" /></SelectTrigger><SelectContent>{DATE_FORMATS.map(df => <SelectItem key={df} value={df}>{df}</SelectItem>)}</SelectContent></Select>) : (<span className="text-muted-foreground">-</span>)}</TableCell><TableCell><Input type="number" placeholder="Ex: 10" value={mapping.outputLength || ''} onChange={(e: ChangeEvent<HTMLInputElement>) => onMappingFieldChange(mapping.originalHeaderId,'outputLength',e.target.value ? parseInt(e.target.value) : undefined)} min="1" className="w-full" disabled={config.format !== 'txt'}/></TableCell><TableCell><Input type="text" placeholder={ (mapping.dataType === "Numérico" || mapping.dataType === "Inteiro") ? '0' : 'espaço'} value={mapping.paddingChar || ''} onChange={(e: ChangeEvent<HTMLInputElement>) => onMappingFieldChange(mapping.originalHeaderId, 'paddingChar', e.target.value)} maxLength={1} className="w-full" disabled={config.format !== 'txt'}/></TableCell><TableCell><Select value={mapping.paddingDirection || 'Direita'} onValueChange={(value) => onMappingFieldChange(mapping.originalHeaderId, 'paddingDirection', value as 'Esquerda' | 'Direita')} disabled={config.format !== 'txt'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Esquerda">Esquerda</SelectItem><SelectItem value="Direita">Direita</SelectItem></SelectContent></Select></TableCell><TableCell><Button variant="ghost" size="icon" onClick={() => handleRemoveField(mapping.originalHeaderId)} disabled><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>))}</TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
          </ScrollArea>

           <div className="mt-4 flex space-x-2">
             <Button variant="outline" onClick={handleAddMappedField} disabled>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Campo Mapeado
            </Button>
            <Button variant="outline" onClick={handleAddStaticField} disabled>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Campo Estático
            </Button>
             <Button variant="outline" onClick={handleAddCalculatedField} disabled>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Campo Calculado
            </Button>
          </div>

          {config.format === 'txt' && (
            <div className="border-t pt-4 mt-4">
                <Label htmlFor="new-field" className="text-base font-semibold">
                  Adicionar Campo Fixo ao Final da Linha (Opcional)
                </Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <Input
                    type="text"
                    id="new-field"
                    placeholder="Nome do campo (informativo)"
                    value={config.newField || ''}
                    onChange={(e) => onConfigChange('newField', e.target.value)}
                    />
                    <Input
                    type="text"
                    id="new-field-value"
                    placeholder="Valor fixo do campo"
                    value={config.newFieldValue || ''}
                    onChange={(e) => onConfigChange('newFieldValue', e.target.value)}
                    disabled={!config.newField}
                    />
                </div>
                 <p className="text-xs text-muted-foreground mt-1">
                    Este valor será adicionado ao final de cada linha do arquivo TXT. O tamanho e preenchimento deste campo devem ser considerados no layout final.
                </p>
            </div>
          )}

        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
