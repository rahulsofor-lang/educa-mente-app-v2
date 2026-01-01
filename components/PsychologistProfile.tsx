import React, { useState, useRef } from 'react';
import { PsychologistProfile } from '../types';

interface Props {
  profile: PsychologistProfile | null;
  onSave: (p: PsychologistProfile) => void;
}

const PsychologistProfileEditor: React.FC<Props> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<PsychologistProfile>(profile || {
    nomeCompleto: '',
    crp: '',
    email: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: ''
  });

  const [isFetching, setIsFetching] = useState(false);
  const numeroInputRef = useRef<HTMLInputElement>(null);

  const formatCEP = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d{3})/, '$1-$2');
  };

  const handleCEP = async (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 8);
    const masked = clean.replace(/^(\d{5})(\d{3})/, '$1-$2');
    setFormData(prev => ({...prev, cep: masked}));
    
    if (clean.length === 8) {
      setIsFetching(true);
      try {
        const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const d = await r.json();
        if (!d.erro) {
          setFormData(prev => ({
            ...prev, 
            logradouro: d.logradouro || '', 
            bairro: d.bairro || '', 
            cidade: d.localidade || '', 
            uf: d.uf || ''
          }));
          // Focar no campo número após preenchimento automático para fluidez
          setTimeout(() => numeroInputRef.current?.focus(), 200);
        } else {
          alert('CEP não encontrado nos registros dos Correios.');
        }
      } catch (e) {
        console.error("Erro ViaCEP:", e);
        alert('Erro ao consultar o serviço de CEP.');
      } finally {
        setIsFetching(false);
      }
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digits.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 animate-in fade-in duration-500">
      <h2 className="text-xl font-black text-gray-900 uppercase mb-8 border-b pb-4">Meus Dados Profissionais</h2>
      
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">Nome Completo (Conforme CRP) *</label>
          <input required value={formData.nomeCompleto} onChange={e => setFormData({...formData, nomeCompleto: e.target.value})} className="input-field" placeholder="Dr(a). Nome Sobrenome" />
        </div>
        
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">Registro CRP *</label>
          <input required value={formData.crp} onChange={e => setFormData({...formData, crp: e.target.value})} className="input-field" placeholder="Ex: 06/123456" />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">E-mail Profissional *</label>
          <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field" placeholder="seuemail@exemplo.com" />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">Telefone de Contato *</label>
          <input required value={formData.telefone} onChange={e => setFormData({...formData, telefone: formatPhone(e.target.value)})} className="input-field" placeholder="(00) 00000-0000" />
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-5">
           <span className="text-[11px] font-black text-[#004481] uppercase tracking-[0.2em] block mb-2">Endereço Profissional</span>
           
           <div className="space-y-1 relative">
             <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">CEP *</label>
             <input required value={formData.cep} onChange={e => handleCEP(e.target.value)} className={`input-field ${isFetching ? 'border-indigo-400 animate-pulse' : ''}`} placeholder="00000-000" />
             {isFetching && <span className="absolute right-4 top-10 text-[8px] font-black text-indigo-500 animate-pulse">BUSCANDO...</span>}
           </div>

           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">Logradouro (Rua/Av) *</label>
             <input required value={formData.logradouro} onChange={e => setFormData({...formData, logradouro: e.target.value})} className="input-field bg-gray-50 opacity-70" placeholder="Nome da rua ou avenida" />
           </div>

           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">Nº *</label>
             <input ref={numeroInputRef} required value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} className="input-field" placeholder="Ex: 123 ou S/N" />
           </div>

           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">Bairro *</label>
             <input required value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} className="input-field bg-gray-50 opacity-70" placeholder="Bairro" />
           </div>

           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">Cidade *</label>
             <input required value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} className="input-field bg-gray-50 opacity-70" placeholder="Cidade" />
           </div>

           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">UF *</label>
             <input required value={formData.uf} onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})} maxLength={2} className="input-field bg-gray-50 opacity-70" placeholder="SP" />
           </div>
        </div>

        <button 
          onClick={() => {
            if(!formData.nomeCompleto || !formData.crp || !formData.email || !formData.cep) {
              alert('Por favor, preencha todos os campos obrigatórios (*)');
              return;
            }
            onSave(formData); 
            alert('Perfil profissional atualizado!');
          }} 
          className="btn-premium bg-emerald-600 text-white py-5 shadow-xl mt-6 uppercase text-xs tracking-widest"
        >
          Salvar Dados do Perfil
        </button>
      </div>
    </div>
  );
};

export default PsychologistProfileEditor;