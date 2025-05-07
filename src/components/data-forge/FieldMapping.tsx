
"use client";

import { useState, useCallback } from 'react';
import type { DetectedHeader, FieldMapping, UserManagedField, PredefinedField, GroupedFields, FieldGroup, DataType, MappedFieldTarget } from '@/types';
import { FieldMappingRow } from './FieldMappingRow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { INITIAL_PREDEFINED_FIELDS, DATA_TYPES, NO_MAPPING_VALUE } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FieldMappingProps {
  detectedHeaders: DetectedHeader[];
  previewRows: string[][];
  totalRows: number;
  mappings: FieldMapping[];
  userManagedFields: UserManagedField[];
  onMappingsChange: (mappings: FieldMapping[]) => void;
  onUserManagedFieldsChange: (fields: UserManagedField[]) => void;
  onMappingFieldChange: (originalHeaderId: string, fieldName: keyof FieldMapping, value: any) => void;
}

export function FieldMapping({
  detectedHeaders,
  previewRows,
  totalRows,
  mappings,
  userManagedFields,
  onMappingsChange,
  onUserManagedFieldsChange,
  onMappingFieldChange
}: FieldMappingProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isManageFieldsDialogOpen, setIsManageFieldsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<UserManagedField | null>(null);
  const [newFieldData, setNewFieldData] = useState<{ name: string; group: FieldGroup; type: DataType; comment: string; isPrincipal: boolean }>({
    name: "",
    group: "Personalizado",
    type: "Alfanumérico",
    comment: "",
    isPrincipal: false,
  });

  const { toast } = useToast();

  const groupedUserManagedFields = useCallback((): GroupedFields => {
    const groups: GroupedFields = {
        [NO_MAPPING_VALUE]: [{id: NO_MAPPING_VALUE, name: NO_MAPPING_VALUE, type: '', group: 'Padrão', isPrincipal: false }] ,
    };
    userManagedFields.forEach(field => {
      if (!groups[field.group]) {
        groups[field.group] = [];
      }
      groups[field.group]!.push(field);
    });
    for (const groupKey in groups) {
        if (groupKey !== NO_MAPPING_VALUE && groups[groupKey as FieldGroup]) {
             groups[groupKey as FieldGroup]!.sort((a, b) => a.name.localeCompare(b.name));
        }
    }
    return groups;
  }, [userManagedFields]);


  const handleSaveField = () => {
    if (!newFieldData.name.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "Nome do campo não pode ser vazio." });
      return;
    }

    const fieldExists = userManagedFields.some(
      f => f.name.toLowerCase() === newFieldData.name.trim().toLowerCase() && f.id !== editingField?.id
    );

    if (fieldExists) {
      toast({ variant: "destructive", title: "Erro", description: "Este nome de campo já existe." });
      return;
    }

    if (editingField) {
      const updatedFields = userManagedFields.map(f =>
        f.id === editingField.id ? { ...editingField, ...newFieldData, name: newFieldData.name.trim() } : f
      );
      onUserManagedFieldsChange(updatedFields);
      toast({ title: "Sucesso", description: `Campo "${newFieldData.name.trim()}" atualizado.` });
    } else {
      const newField: UserManagedField = {
        id: `user_${Date.now()}_${newFieldData.name.replace(/\s+/g, '_')}`,
        name: newFieldData.name.trim(),
        group: newFieldData.group,
        type: newFieldData.type,
        isPrincipal: newFieldData.isPrincipal,
        comment: newFieldData.comment.trim(),
      };
      onUserManagedFieldsChange([...userManagedFields, newField]);
      toast({ title: "Sucesso", description: `Campo "${newFieldData.name.trim()}" adicionado.` });
    }
    setEditingField(null);
    setNewFieldData({ name: "", group: "Personalizado", type: "Alfanumérico", comment: "", isPrincipal: false });
    // setIsManageFieldsDialogOpen(false); // Keep open or close as preferred
  };

  const handleEditField = (field: UserManagedField) => {
    setEditingField(field);
    setNewFieldData({
      name: field.name,
      group: field.group,
      type: field.type,
      comment: field.comment || "",
      isPrincipal: field.isPrincipal,
    });
    setIsManageFieldsDialogOpen(true);
  };

  const handleRemoveField = (id: string) => {
    const fieldToRemove = userManagedFields.find(f => f.id === id);
    if (!fieldToRemove) return;

    if (fieldToRemove.isPrincipal && INITIAL_PREDEFINED_FIELDS.some(ipf => ipf.id === fieldToRemove.id)) {
         toast({ variant: "destructive", title: "Erro", description: `O campo principal "${fieldToRemove.name}" não pode ser removido.` });
        return;
    }

    const isInUse = mappings.some(m => m.mappedTo === fieldToRemove.name);
    if (isInUse) {
      toast({ variant: "destructive", title: "Erro", description: `O campo "${fieldToRemove.name}" está em uso no mapeamento atual e não pode ser removido.` });
      return;
    }
    onUserManagedFieldsChange(userManagedFields.filter(f => f.id !== id));
    toast({ title: "Sucesso", description: `Campo "${fieldToRemove.name}" removido.` });
  };

  const openAddNewFieldDialog = () => {
    setEditingField(null);
    setNewFieldData({ name: "", group: "Personalizado", type: "Alfanumérico", comment: "", isPrincipal: false });
    setIsManageFieldsDialogOpen(true);
  };


  if (!detectedHeaders || detectedHeaders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mapeamento de Colunas de Entrada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <AlertCircle className="mr-2 h-5 w-5" />
            <p>Envie um arquivo primeiro para ver as opções de mapeamento.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Mapeamento de Colunas de Entrada</CardTitle>
              <CardDescription>
                Associe as colunas do seu arquivo ({detectedHeaders.length} colunas detectadas | {totalRows} linhas detectadas),
                configure tipos e remoção de máscaras.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 mt-1">
                <Label htmlFor="show-preview-toggle">Mostrar Pré-visualização ({previewRows.length} linhas)</Label>
                <Switch
                id="show-preview-toggle"
                checked={showPreview}
                onCheckedChange={setShowPreview}
                aria-label="Mostrar pré-visualização dos dados"
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showPreview && previewRows && previewRows.length > 0 && (
            <div className="mt-0 mb-6">
              <h3 className="text-md font-semibold mb-2 text-muted-foreground">Amostra de Dados:</h3>
              <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                <div className="overflow-x-auto">
                  <Table className="min-w-max">
                    <TableHeader><TableRow>{detectedHeaders.map((header) => (<TableHead key={`preview-header-${header.id}`} className="whitespace-nowrap">{header.name}</TableHead>))}</TableRow></TableHeader>
                    <TableBody>{previewRows.map((row, rowIndex) => (<TableRow key={`preview-row-${rowIndex}`}>{row.map((cell, cellIndex) => (<TableCell key={`preview-cell-${rowIndex}-${cellIndex}`} className="whitespace-nowrap">{cell}</TableCell>))}</TableRow>))}</TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

          <ScrollArea className="w-full whitespace-nowrap rounded-md border max-h-[500px]">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader><TableRow><TableHead className="sticky left-0 bg-card z-10 w-[200px]">Coluna Original</TableHead><TableHead className="w-[250px]">Mapear para Campo</TableHead><TableHead className="w-[150px]">Tipo</TableHead><TableHead className="w-[150px] text-center">Remover Máscara</TableHead></TableRow></TableHeader>
                <TableBody>{mappings.map((mapping) => {
                    const header = detectedHeaders.find(h => h && mapping && h.id === mapping.originalHeaderId);
                     if (!header) {
                        console.warn("Mapping found without matching header:", mapping);
                        return null; // Skip rendering if header not found
                     }
                    return (<FieldMappingRow key={mapping.originalHeaderId} header={header} mapping={mapping} groupedUserManagedFields={groupedUserManagedFields()} userManagedFields={userManagedFields} onMappingChange={onMappingFieldChange}/>);
                  })}</TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Gerenciar Campos Pré-definidos</CardTitle>
            <CardDescription>Adicione, edite ou remova campos para o mapeamento. Campos marcados como "Principal" são mantidos para futuras conversões.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[300px] mb-4 border rounded-md">
              <div className="overflow-x-auto">
                <Table className="min-w-max">
                    <TableHeader><TableRow><TableHead>Nome do Campo</TableHead><TableHead>Grupo</TableHead><TableHead>Tipo</TableHead><TableHead>Principal</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                    <TableBody>{userManagedFields.sort((a,b) => a.name.localeCompare(b.name)).map(field => (<TableRow key={field.id}><TableCell>{field.name}</TableCell><TableCell>{field.group}</TableCell><TableCell>{field.type}</TableCell><TableCell>{field.isPrincipal ? "Sim" : "Não"}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => { handleEditField(field); }} className="mr-2"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleRemoveField(field.id)} disabled={field.isPrincipal && INITIAL_PREDEFINED_FIELDS.some(ipf => ipf.id === field.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>))}</TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
              <ScrollBar orientation="vertical" />
            </ScrollArea>
             <Button onClick={openAddNewFieldDialog}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Campo
            </Button>
        </CardContent>
      </Card>

      <Dialog open={isManageFieldsDialogOpen} onOpenChange={(isOpen) => {
          setIsManageFieldsDialogOpen(isOpen);
          if (!isOpen) {
            setEditingField(null);
            setNewFieldData({ name: "", group: "Personalizado", type: "Alfanumérico", comment: "", isPrincipal: false });
          }
        }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingField ? "Editar Campo" : "Adicionar Novo Campo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="field-name">Nome</Label>
              <Input id="field-name" value={newFieldData.name} onChange={(e) => setNewFieldData(prev => ({...prev, name: e.target.value}))} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="field-group">Grupo</Label>
              <Select value={newFieldData.group} onValueChange={(value) => setNewFieldData(prev => ({...prev, group: value as FieldGroup}))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Padrão">Padrão</SelectItem>
                    <SelectItem value="Margem">Margem</SelectItem>
                    <SelectItem value="Histórico/Retorno">Histórico/Retorno</SelectItem>
                    <SelectItem value="Personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label htmlFor="field-type">Tipo</Label>
                <Select value={newFieldData.type} onValueChange={(value) => setNewFieldData(prev => ({...prev, type: value as DataType}))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {DATA_TYPES.map(dt => <SelectItem key={dt} value={dt}>{dt}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
              <Label htmlFor="field-comment">Comentário</Label>
              <Input id="field-comment" value={newFieldData.comment} onChange={(e) => setNewFieldData(prev => ({...prev, comment: e.target.value}))} className="mt-1" placeholder="Ex: Ajuda sobre o campo"/>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="field-is-principal" checked={newFieldData.isPrincipal} onCheckedChange={(checked) => setNewFieldData(prev => ({...prev, isPrincipal: Boolean(checked)}))} />
              <Label htmlFor="field-is-principal">Principal (Manter para futuras conversões)</Label>
            </div>
            <p className="text-xs text-muted-foreground ">
                Campos principais são carregados por padrão e podem ter restrições de remoção.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSaveField}>Salvar Campo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
