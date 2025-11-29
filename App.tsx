import React, { useState, useRef } from 'react';
import { 
  Trophy, 
  Target, 
  Users, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  BarChart3, 
  Download, 
  Printer, 
  FileText, 
  Shield, 
  Swords, 
  Instagram, 
  Medal,
  Play,
  Home,
  Trash2,
  Plus,
  X,
  Info,
  ArrowLeft
} from 'lucide-react';
import { PlayerProfile, Role, CompetitionType, Tier, DynamicEntry, RecentCompetition } from './types';
import { PREDEFINED_COMPETITIONS, calculateScore } from './services/calculator';
import Tooltip from './components/Tooltip';

// --- INITIAL STATE ---
const initialProfile: PlayerProfile = {
  name: '',
  role: Role.RUSH1,
  isCaptain: false,
  officialKills: 0,
  lastBooyahs: 0,
  followers: 0,
  engagement: 0,
  selectedCompetitions: [],
  titles: [],
  participations: [],
  recentCompetitions: []
};

// --- COMPONENTS ---

const Footer = () => (
  <div className="w-full text-center py-8 mt-auto z-50 relative animate-fade-in">
    <div className="flex flex-col items-center justify-center space-y-3">
      <p className="text-slate-500 text-xs md:text-sm uppercase tracking-widest">
        Projeto Desenvolvido por <span className="text-yellow-400 font-bold glow-text">Jhan Medeiros</span>
      </p>
      <a 
        href="https://www.instagram.com/jhanmedeiros/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group flex items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-white text-xs font-bold hover:scale-105 transition-all shadow-[0_0_15px_rgba(219,39,119,0.4)] hover:shadow-[0_0_25px_rgba(219,39,119,0.6)]"
      >
        <Instagram className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
        Seguir @jhanmedeiros
      </a>
    </div>
  </div>
);

const StepIndicator = ({ current, total }: { current: number; total: number }) => (
  <div className="flex justify-center space-x-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div 
        key={i} 
        className={`h-1.5 rounded-full transition-all duration-500 ${
          i < current ? 'w-8 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 
          i === current ? 'w-8 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'w-4 bg-slate-800'
        }`}
      />
    ))}
  </div>
);

const NeonInput = ({ label, value, onChange, type = "text", placeholder = "", tooltip = "" }: any) => (
  <div className="mb-6 group">
    <label className="block text-sm font-display font-bold text-yellow-500 mb-2 uppercase tracking-wider flex items-center">
      {label}
      {tooltip && <Tooltip content={tooltip} />}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-md focus:outline-none focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all font-sans placeholder-slate-600"
      />
      <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-transparent group-hover:ring-white/10 pointer-events-none" />
    </div>
  </div>
);

const NeonSelect = ({ label, value, onChange, options, tooltip = "" }: any) => (
  <div className="mb-6">
    <label className="block text-sm font-display font-bold text-orange-400 mb-2 uppercase tracking-wider flex items-center">
      {label}
      {tooltip && <Tooltip content={tooltip} />}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-md focus:outline-none focus:border-orange-500 focus:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all font-sans appearance-none"
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
      ))}
    </select>
  </div>
);

export default function App() {
  const [started, setStarted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<PlayerProfile>(initialProfile);
  const [showFullReport, setShowFullReport] = useState(false);
  
  // Custom Competition State
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<CompetitionType>(CompetitionType.ONLINE);
  const [customTier, setCustomTier] = useState<Tier>(Tier.B);
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  const totalSteps = 6; 

  const handleNext = () => {
    if (step === 0 && !profile.name.trim()) return alert("Por favor, digite o nome do jogador.");
    if (step < totalSteps) setStep(step + 1);
  };
  
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleRestart = () => {
    setStarted(false); 
    setStep(0); 
    setProfile(initialProfile);
    setShowFullReport(false);
  };

  const updateProfile = (field: keyof PlayerProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleCompetition = (comp: any) => {
    const exists = profile.selectedCompetitions.find(c => c.id === comp.id);
    let newList;
    if (exists) {
      newList = profile.selectedCompetitions.filter(c => c.id !== comp.id);
    } else {
      newList = [...profile.selectedCompetitions, comp];
    }
    updateProfile('selectedCompetitions', newList);
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const newComp = {
      id: `custom-${Date.now()}`,
      name: customName,
      type: customType,
      tier: customTier
    };
    updateProfile('selectedCompetitions', [...profile.selectedCompetitions, newComp]);
    setCustomName('');
    setCustomType(CompetitionType.ONLINE);
    setCustomTier(Tier.B);
    setIsAddingCustom(false);
  };

  const removeCustomCompetition = (id: string) => {
     updateProfile('selectedCompetitions', profile.selectedCompetitions.filter(c => c.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveImage = async () => {
    if (!resultRef.current || !(window as any).html2canvas) return;
    
    try {
      const canvas = await (window as any).html2canvas(resultRef.current, {
        backgroundColor: '#020617', // Match bg-slate-950
        scale: 2, // High res
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `Relatorio_${profile.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      alert("Erro ao salvar a imagem. Tente usar a opção de imprimir (PDF).");
    }
  };

  // Helper to get all competitions (predefined + custom)
  const getAvailableCompetitions = () => {
     const customComps = profile.selectedCompetitions.filter(c => c.id.startsWith('custom-'));
     return [...PREDEFINED_COMPETITIONS, ...customComps];
  };

  // --- RENDER STEPS ---
  
  // HELP / METHODOLOGY PAGE
  if (showHelp) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 p-8 neon-grid flex flex-col items-center">
        <div className="max-w-4xl w-full">
            <button onClick={() => setShowHelp(false)} className="mb-8 flex items-center text-yellow-500 hover:text-yellow-300 transition-colors font-bold uppercase tracking-wider">
                <ArrowLeft className="mr-2" /> Voltar
            </button>
            
            <div className="glass-panel p-8 rounded-xl border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">Metodologia de Avaliação</h1>
                    <p className="text-slate-400">Entenda como o FF Salary Pro calcula o valor de mercado.</p>
                </div>

                {/* Section 1: Tiers & Salary */}
                <div className="mb-12">
                    <h2 className="text-xl font-display text-white mb-4 flex items-center border-l-4 border-yellow-500 pl-3">
                        <Zap className="w-5 h-5 text-yellow-500 mr-2"/>
                        Tiers e Faixas Salariais
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-900 text-slate-400 uppercase font-display text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Tier</th>
                                    <th className="px-4 py-3">Score Necessário</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Estimativa Salarial</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                <tr className="bg-yellow-900/10"><td className="px-4 py-3 font-bold text-yellow-400">TIER S</td><td className="px-4 py-3">80 - 100 pts</td><td className="px-4 py-3 text-yellow-200">R$ 8.000 - R$ 20.000+</td></tr>
                                <tr className="bg-slate-900/30"><td className="px-4 py-3 font-bold text-white">TIER A</td><td className="px-4 py-3">60 - 79 pts</td><td className="px-4 py-3 text-slate-300">R$ 5.000 - R$ 7.999</td></tr>
                                <tr className="bg-slate-900/30"><td className="px-4 py-3 font-bold text-white">TIER B</td><td className="px-4 py-3">40 - 59 pts</td><td className="px-4 py-3 text-slate-300">R$ 3.000 - R$ 4.999</td></tr>
                                <tr className="bg-slate-900/30"><td className="px-4 py-3 font-bold text-white">TIER C</td><td className="px-4 py-3">20 - 39 pts</td><td className="px-4 py-3 text-slate-300">R$ 1.500 - R$ 2.999</td></tr>
                                <tr className="bg-slate-900/30"><td className="px-4 py-3 font-bold text-slate-500">TIER D</td><td className="px-4 py-3">0 - 19 pts</td><td className="px-4 py-3 text-slate-500">Até R$ 1.499</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Section 2: Roles */}
                     <div>
                        <h2 className="text-xl font-display text-white mb-4 flex items-center border-l-4 border-orange-500 pl-3">
                            <Target className="w-5 h-5 text-orange-500 mr-2"/>
                            Pesos por Função
                        </h2>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li className="flex justify-between p-2 bg-slate-900/50 rounded"><span>Rush 1</span> <span className="text-orange-400 font-bold">12 pts</span></li>
                            <li className="flex justify-between p-2 bg-slate-900/50 rounded"><span>Rush 2</span> <span className="text-orange-400 font-bold">11 pts</span></li>
                            <li className="flex justify-between p-2 bg-slate-900/50 rounded"><span>Flex</span> <span className="text-orange-400 font-bold">10 pts</span></li>
                            <li className="flex justify-between p-2 bg-slate-900/50 rounded"><span>Sniper / Granadeiro</span> <span className="text-orange-400 font-bold">9 pts</span></li>
                            <li className="flex justify-between p-2 bg-yellow-900/20 border border-yellow-500/20 rounded mt-2"><span>Bônus Capitão</span> <span className="text-yellow-400 font-bold">+5 pts</span></li>
                        </ul>
                     </div>

                     {/* Section 3: Performance & Social */}
                     <div>
                        <h2 className="text-xl font-display text-white mb-4 flex items-center border-l-4 border-pink-500 pl-3">
                            <BarChart3 className="w-5 h-5 text-pink-500 mr-2"/>
                            Métricas & Social
                        </h2>
                        <div className="space-y-4 text-sm text-slate-300">
                            <div>
                                <p className="font-bold text-white mb-1">Performance (Max 20 pts)</p>
                                <p className="text-xs text-slate-400">Baseado em Kills Totais (ref: 1000 kills) e Booyahs recentes (para capitães).</p>
                            </div>
                            <div>
                                <p className="font-bold text-white mb-1">Influência (Max 15 pts)</p>
                                <p className="text-xs text-slate-400">Escala logarítmica de seguidores (Instagram) + Taxa de engajamento.</p>
                            </div>
                        </div>
                     </div>
                </div>
                
                {/* Section 4: Competitions */}
                 <div className="mt-8">
                    <h2 className="text-xl font-display text-white mb-4 flex items-center border-l-4 border-green-500 pl-3">
                        <Trophy className="w-5 h-5 text-green-500 mr-2"/>
                        Competições (Max 30 pts)
                    </h2>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-900/50 p-3 rounded">
                            <span className="block text-slate-400 text-xs uppercase">Tier S (Mundial/Elite)</span>
                            <span className="text-green-400 font-bold">4 pts</span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded">
                            <span className="block text-slate-400 text-xs uppercase">Tier A (Nacional Oficial)</span>
                            <span className="text-green-400 font-bold">3 pts</span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded">
                            <span className="block text-slate-400 text-xs uppercase">Tier B (Comunidade Grande)</span>
                            <span className="text-green-400 font-bold">2 pts</span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded">
                             <span className="block text-slate-400 text-xs uppercase">Multiplicador Presencial</span>
                             <span className="text-yellow-400 font-bold">1.5x</span>
                        </div>
                     </div>
                     <p className="mt-3 text-xs text-slate-500">* Títulos adicionam +3 pontos cada. Histórico recente e participações somam até +15 pts extras.</p>
                </div>

            </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 0. Intro / Landing
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden neon-grid">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
        
        <div className="z-10 text-center px-4 animate-fade-in-up flex flex-col items-center flex-1 justify-center">
          <div className="mb-6 inline-block p-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-pulse">
            <Trophy className="w-16 h-16 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 mb-4 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
            FF SALARY PRO
          </h1>
          <h2 className="text-2xl md:text-3xl font-light text-slate-300 mb-8 font-sans tracking-[0.2em] uppercase">
            Player Valuation System
          </h2>
          <p className="max-w-xl mx-auto text-slate-400 mb-12 leading-relaxed">
            Plataforma avançada de análise de mercado para e-sports. Calcule o valor, tier e faixa salarial baseada em métricas de performance, influência e liderança.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setStarted(true)}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-transparent font-display tracking-wider overflow-hidden rounded-lg focus:outline-none ring-offset-2 focus:ring-2 ring-yellow-400"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
              <span className="relative flex items-center space-x-3">
                <span className="uppercase text-yellow-100">Iniciar Cálculo</span>
                <Play className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 border-2 border-yellow-500/50 rounded-lg group-hover:border-yellow-400 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.6)] transition-all"></div>
            </button>
            
            <button 
              onClick={() => setShowHelp(true)}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-slate-300 hover:text-white transition-all duration-200 bg-transparent font-display tracking-wider overflow-hidden rounded-lg focus:outline-none border border-slate-700 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              <span className="relative flex items-center space-x-3">
                <Info className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                <span className="uppercase text-sm">Como Funciona o Cálculo?</span>
              </span>
            </button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // Calculate Logic
  const result = calculateScore(profile);

  // 7. Full Report View
  if (showFullReport) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 p-8 neon-grid print:bg-white print:text-black flex flex-col">
        <div className="max-w-5xl mx-auto flex-1">
          <button onClick={() => setShowFullReport(false)} className="mb-6 flex items-center text-yellow-500 hover:text-yellow-300 print:hidden">
            <ChevronLeft className="mr-2" /> Voltar ao Resumo
          </button>
          
          <div className="glass-panel p-8 rounded-xl border border-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.15)] print:shadow-none print:border-black print:text-black">
             <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-8 print:border-black">
                <div>
                  <h1 className="text-4xl font-display font-bold text-white mb-2 print:text-black">{profile.name}</h1>
                  <div className="flex space-x-4 text-sm font-mono text-orange-400 print:text-black">
                    <span className="uppercase">{profile.role}</span>
                    {profile.isCaptain && <span className="text-yellow-400 print:text-black">★ CAPITÃO</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase tracking-widest print:text-gray-600">Score Final</div>
                  <div className="text-5xl font-display font-bold text-orange-400 print:text-black">{result.score}</div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Breakdown */}
                <div>
                  <h3 className="text-xl font-display text-yellow-300 mb-4 flex items-center print:text-black"><BarChart3 className="mr-2 w-5 h-5"/> Métricas Detalhadas</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between p-3 bg-white/5 rounded print:bg-gray-100">
                      <span>Score de Função & Liderança</span>
                      <span className="font-mono font-bold text-yellow-100">{result.breakdown.roleScore.toFixed(1)} pts</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white/5 rounded print:bg-gray-100">
                      <span>Performance (Kills/Booyahs)</span>
                      <span className="font-mono font-bold text-yellow-100">{result.breakdown.statsScore.toFixed(1)} pts</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white/5 rounded print:bg-gray-100">
                      <span>Influência Digital</span>
                      <span className="font-mono font-bold text-yellow-100">{result.breakdown.socialScore.toFixed(1)} pts</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white/5 rounded print:bg-gray-100">
                      <span>Competições & Títulos</span>
                      <span className="font-mono font-bold text-yellow-100">{result.breakdown.competitionScore.toFixed(1)} pts</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white/5 rounded print:bg-gray-100">
                      <span>Histórico Recente</span>
                      <span className="font-mono font-bold text-yellow-100">{result.breakdown.historyScore.toFixed(1)} pts</span>
                    </div>
                  </div>
                </div>

                {/* Classification */}
                <div>
                  <h3 className="text-xl font-display text-orange-300 mb-4 flex items-center print:text-black"><Zap className="mr-2 w-5 h-5"/> Classificação de Mercado</h3>
                  <div className="p-6 bg-gradient-to-br from-orange-900/40 to-slate-900 rounded-lg border border-orange-500/20 print:bg-white print:border-black">
                    <div className="mb-4">
                      <span className="block text-xs text-orange-200 uppercase tracking-wider print:text-black">Tier Calculado</span>
                      <span className="text-4xl font-display font-bold text-white print:text-black">{result.tier}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-orange-200 uppercase tracking-wider print:text-black">Faixa Salarial Estimada</span>
                      <span className="text-2xl font-mono text-yellow-300 print:text-black">{result.salaryRange}</span>
                    </div>
                  </div>
                </div>
             </div>

             {/* Detailed Input Data */}
             <div className="mt-12">
                <h3 className="text-xl font-display text-slate-300 mb-4 border-b border-white/10 pb-2 print:text-black print:border-black">Dados Brutos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                   <div className="p-3 bg-white/5 rounded border border-white/5 print:border-gray-300 print:text-black">
                      <div className="text-slate-500 mb-1">Kills Oficiais</div>
                      <div className="font-mono text-white">{profile.officialKills}</div>
                   </div>
                   {profile.isCaptain && (
                    <div className="p-3 bg-white/5 rounded border border-white/5 print:border-gray-300 print:text-black">
                        <div className="text-slate-500 mb-1">Booyahs (Última)</div>
                        <div className="font-mono text-white">{profile.lastBooyahs}</div>
                    </div>
                   )}
                   <div className="p-3 bg-white/5 rounded border border-white/5 print:border-gray-300 print:text-black">
                      <div className="text-slate-500 mb-1">Seguidores</div>
                      <div className="font-mono text-white">{profile.followers.toLocaleString()}</div>
                   </div>
                   <div className="p-3 bg-white/5 rounded border border-white/5 print:border-gray-300 print:text-black">
                      <div className="text-slate-500 mb-1">Engajamento</div>
                      <div className="font-mono text-white">{profile.engagement}%</div>
                   </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-display text-sm text-slate-400 mb-3 uppercase tracking-wider print:text-black">Competições Chanceladas</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.selectedCompetitions.map(c => (
                      <span key={c.id} className="px-3 py-1 bg-orange-900/30 border border-orange-500/30 text-orange-200 rounded text-xs print:text-black print:border-black">
                        {c.name} ({c.type}) - {c.tier}
                      </span>
                    ))}
                    {profile.selectedCompetitions.length === 0 && <span className="text-slate-600 italic">Nenhuma selecionada.</span>}
                  </div>
                </div>
             </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 6. Result Page (Dashboard)
  if (step === totalSteps) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 neon-grid relative">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl">
          {/* Result Container to be captured */}
          <div ref={resultRef} className="w-full relative z-10">
            <div className="glass-panel rounded-2xl p-1 overflow-hidden">
              
              {/* Header / ID Card Style */}
              <div className="bg-slate-900 p-8 border-b border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Trophy className="w-32 h-32 text-orange-600" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end">
                  <div>
                    <h2 className="text-sm font-mono text-yellow-500 mb-1 tracking-[0.3em] uppercase">Relatório Final</h2>
                    <h1 className="text-5xl font-display font-black text-white uppercase tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                      {profile.name}
                    </h1>
                    <div className="flex items-center space-x-4 mt-4">
                      <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/50 text-orange-300 rounded font-display text-sm uppercase">
                        {profile.role}
                      </span>
                      {profile.isCaptain && (
                        <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 rounded font-display text-sm uppercase flex items-center">
                          <Swords className="w-3 h-3 mr-1"/> Capitão
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 md:mt-0 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">Score Total</span>
                        <div className="relative">
                          <span className="text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-600">
                            {result.score}
                          </span>
                          <div className="absolute -inset-4 bg-orange-400/20 blur-xl rounded-full -z-10 animate-pulse"></div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>

              {/* Main Stats Area */}
              <div className="p-8 bg-gradient-to-b from-slate-900/80 to-slate-950/90">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Tier Box */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-orange-600/20 blur-xl group-hover:bg-orange-600/30 transition-all rounded-lg"></div>
                    <div className="relative border border-orange-500/40 bg-slate-900/80 p-6 rounded-lg backdrop-blur-sm h-full flex flex-col justify-center items-center text-center">
                        <h3 className="text-sm text-orange-300 uppercase tracking-widest mb-2">Classificação</h3>
                        <div className="text-6xl font-display font-black text-white drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]">
                          {result.tier}
                        </div>
                    </div>
                  </div>

                  {/* Salary Box */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-yellow-600/20 blur-xl group-hover:bg-yellow-600/30 transition-all rounded-lg"></div>
                    <div className="relative border border-yellow-500/40 bg-slate-900/80 p-6 rounded-lg backdrop-blur-sm h-full flex flex-col justify-center items-center text-center">
                        <h3 className="text-sm text-yellow-300 uppercase tracking-widest mb-2">Faixa Salarial</h3>
                        <div className="text-2xl md:text-3xl font-mono font-bold text-white">
                          {result.salaryRange}
                        </div>
                    </div>
                  </div>

                </div>

                {/* Summary Grid */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white/5 rounded border border-white/5">
                      <div className="text-xs text-slate-500 uppercase">Kills Oficiais</div>
                      <div className="text-xl font-mono text-slate-200">{profile.officialKills}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded border border-white/5">
                      <div className="text-xs text-slate-500 uppercase">Seguidores</div>
                      <div className="text-xl font-mono text-slate-200">{profile.followers >= 1000 ? (profile.followers / 1000).toFixed(1) + 'k' : profile.followers}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded border border-white/5">
                      <div className="text-xs text-slate-500 uppercase">Competições</div>
                      <div className="text-xl font-mono text-slate-200">{profile.selectedCompetitions.length}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded border border-white/5">
                      <div className="text-xs text-slate-500 uppercase">Títulos</div>
                      <div className="text-xl font-mono text-slate-200">{profile.titles.reduce((acc, t) => acc + t.count, 0)}</div>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 relative z-20">
            <button onClick={() => setShowFullReport(true)} className="flex items-center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full border border-slate-600 transition-all shadow-lg hover:-translate-y-1">
              <FileText className="w-5 h-5 mr-2" /> Relatório Completo
            </button>
            
            <button onClick={handlePrint} className="flex items-center px-6 py-3 bg-orange-900/50 hover:bg-orange-800/50 text-orange-200 rounded-full border border-orange-500/50 transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:-translate-y-1">
              <Printer className="w-5 h-5 mr-2" /> Imprimir (PDF)
            </button>
            
            <button onClick={handleSaveImage} className="flex items-center px-6 py-3 bg-yellow-900/50 hover:bg-yellow-800/50 text-yellow-200 rounded-full border border-yellow-500/50 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:-translate-y-1">
              <Download className="w-5 h-5 mr-2" /> Salvar Print
            </button>
          </div>
          
          <button 
            onClick={handleRestart}
            className="mt-8 group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-transparent font-display tracking-wider overflow-hidden rounded-lg focus:outline-none ring-offset-2 focus:ring-2 ring-red-500"
          >
             <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-r from-red-600 to-orange-600"></span>
             <span className="relative flex items-center space-x-2">
               <Home className="w-5 h-5 text-white" />
               <span>Voltar ao Início</span>
             </span>
          </button>
        </div>
        
        <Footer />
      </div>
    );
  }

  // --- FORM WIZARD LAYOUT ---
  return (
    <div className="min-h-screen flex items-center justify-center p-4 neon-grid flex-col">
      <div className="w-full max-w-2xl flex-1 flex flex-col justify-center">
        
        {/* Progress */}
        <div className="mb-4 flex justify-between items-end">
          <h2 className="text-3xl font-display font-bold text-white uppercase">
            {step === 0 && "Identificação"}
            {step === 1 && "Função & Stats"}
            {step === 2 && "Influência"}
            {step === 3 && "Competições"}
            {step === 4 && "Histórico"}
            {step === 5 && "Recentes"}
          </h2>
          <div className="flex flex-col items-end">
            <button 
              onClick={() => {
                if(window.confirm('Tem certeza que deseja limpar tudo e voltar ao início?')) {
                  handleRestart();
                }
              }}
              className="text-xs text-slate-600 hover:text-red-500 flex items-center mb-1 transition-colors uppercase tracking-widest"
              title="Limpar e Reiniciar"
            >
              <Trash2 className="w-3 h-3 mr-1" /> Reset
            </button>
            <span className="text-orange-400 font-mono">STEP {step + 1} / {totalSteps}</span>
          </div>
        </div>
        
        <StepIndicator current={step} total={totalSteps} />

        <div className="glass-panel p-8 rounded-xl relative overflow-hidden transition-all duration-500">
          
          {/* STEP 0: NAME */}
          {step === 0 && (
            <div className="animate-fade-in">
              <NeonInput 
                label="Nome do Jogador" 
                tooltip="Digite o nome completo do jogador analisado. Será exibido no relatório final."
                value={profile.name}
                onChange={(e: any) => updateProfile('name', e.target.value)}
                placeholder="Ex: Gabriel 'Bak' Lessa"
              />
            </div>
          )}

          {/* STEP 1: ROLE & STATS */}
          {step === 1 && (
             <div className="animate-fade-in space-y-6">
               <NeonSelect 
                  label="Função Principal"
                  tooltip="Selecione a função principal. Rush e Flex têm pesos maiores."
                  value={profile.role}
                  onChange={(e: any) => updateProfile('role', e.target.value)}
                  options={Object.values(Role)}
               />
               
               <div className="flex items-center mb-6 bg-slate-900/40 p-4 rounded border border-slate-700">
                  <input 
                    type="checkbox" 
                    id="capitao"
                    checked={profile.isCaptain}
                    onChange={(e) => updateProfile('isCaptain', e.target.checked)}
                    className="w-5 h-5 accent-yellow-500 mr-3"
                  />
                  <label htmlFor="capitao" className="text-white cursor-pointer select-none flex items-center">
                    É Capitão? 
                    <Tooltip content="Liderança influencia positivamente o peso salarial." />
                  </label>
               </div>

               <NeonInput 
                  label="Kills Totais Oficiais"
                  type="number"
                  tooltip="Inserir kills totais do jogador em competições oficiais chanceladas."
                  value={profile.officialKills}
                  onChange={(e: any) => updateProfile('officialKills', Number(e.target.value))}
               />

               {profile.isCaptain && (
                  <NeonInput 
                    label="Booyahs (Última Competição)"
                    type="number"
                    tooltip="Total de booyahs na última competição. Critério exclusivo para capitães."
                    value={profile.lastBooyahs}
                    onChange={(e: any) => updateProfile('lastBooyahs', Number(e.target.value))}
                  />
               )}
             </div>
          )}

          {/* STEP 2: SOCIAL */}
          {step === 2 && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center mb-6">
                <Instagram className="w-8 h-8 text-pink-500 mr-3" />
                <h3 className="text-xl font-display text-white">Redes Sociais</h3>
              </div>
              
              <NeonInput 
                label="Seguidores (Instagram)"
                type="number"
                tooltip="Relevância digital impacta o valor de marketing."
                value={profile.followers}
                onChange={(e: any) => updateProfile('followers', Number(e.target.value))}
              />
              
              <NeonInput 
                label="Engajamento (%)"
                type="number"
                tooltip="Taxa média de engajamento nas postagens."
                value={profile.engagement}
                onChange={(e: any) => updateProfile('engagement', Number(e.target.value))}
              />
            </div>
          )}

          {/* STEP 3: COMPETITIONS */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-display text-orange-400 mb-4 flex items-center">
                Competições Disputadas
                <Tooltip content="Selecione competições oficiais. Tier S e Presencial valem mais." />
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar mb-6">
                {PREDEFINED_COMPETITIONS.map(comp => {
                  const isSelected = profile.selectedCompetitions.some(c => c.id === comp.id);
                  return (
                    <div 
                      key={comp.id}
                      onClick={() => toggleCompetition(comp)}
                      className={`p-4 rounded border cursor-pointer transition-all flex justify-between items-center ${
                        isSelected 
                        ? 'bg-orange-900/30 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]' 
                        : 'bg-slate-900/30 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div>
                        <span className="text-white font-bold">{comp.name}</span>
                        <div className="text-xs text-slate-400 mt-1 space-x-2">
                           <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">{comp.type}</span>
                           <span className={`px-2 py-0.5 rounded border ${comp.tier === Tier.S ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-500' : 'bg-slate-800 border-slate-700'}`}>Tier {comp.tier}</span>
                        </div>
                      </div>
                      {isSelected && <div className="w-4 h-4 rounded-full bg-orange-500 shadow-[0_0_10px_orange]"></div>}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 border-t border-slate-800 pt-6">
                  {/* List of added custom competitions */}
                  {profile.selectedCompetitions.filter(c => c.id.startsWith('custom-')).length > 0 && (
                     <div className="mb-4">
                        <h4 className="text-xs font-display font-bold text-orange-300 mb-3 uppercase tracking-wider">Customizadas Adicionadas</h4>
                        {profile.selectedCompetitions.filter(c => c.id.startsWith('custom-')).map(comp => (
                           <div key={comp.id} className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-700 rounded mb-2 animate-fade-in">
                              <div>
                                 <span className="text-white font-bold block">{comp.name}</span>
                                 <span className="text-xs text-slate-500">{comp.type} - Tier {comp.tier}</span>
                              </div>
                              <button onClick={() => removeCustomCompetition(comp.id)} className="text-red-500 hover:text-red-400 p-2 hover:bg-slate-800 rounded transition-colors">
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        ))}
                     </div>
                  )}

                  {/* Form */}
                  {isAddingCustom ? (
                     <div className="bg-slate-900 p-4 rounded border border-orange-500/30 animate-fade-in shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                        <div className="flex justify-between items-center mb-3">
                           <span className="text-sm font-bold text-white">Nova Competição</span>
                           <button onClick={() => setIsAddingCustom(false)} className="text-slate-500 hover:text-white"><X size={16}/></button>
                        </div>
                        <div className="space-y-3">
                           <input 
                             value={customName}
                             onChange={e => setCustomName(e.target.value)}
                             placeholder="Nome do Campeonato"
                             className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
                           />
                           <div className="flex gap-2">
                              <select 
                                value={customType} 
                                onChange={e => setCustomType(e.target.value as CompetitionType)} 
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-2 text-sm text-white flex-1 focus:border-orange-500 outline-none"
                              >
                                 <option value={CompetitionType.ONLINE}>ONLINE</option>
                                 <option value={CompetitionType.PRESENCIAL}>PRESENCIAL</option>
                              </select>
                              <select 
                                value={customTier} 
                                onChange={e => setCustomTier(e.target.value as Tier)} 
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-2 text-sm text-white flex-1 focus:border-orange-500 outline-none"
                              >
                                 <option value={Tier.S}>TIER S</option>
                                 <option value={Tier.A}>TIER A</option>
                                 <option value={Tier.B}>TIER B</option>
                                 <option value={Tier.C}>TIER C</option>
                              </select>
                           </div>
                           <button onClick={handleAddCustom} className="w-full mt-2 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-bold rounded flex items-center justify-center shadow-lg">
                              <Plus size={16} className="mr-2"/> Adicionar à Lista
                           </button>
                        </div>
                     </div>
                  ) : (
                     <button onClick={() => setIsAddingCustom(true)} className="w-full py-3 border border-dashed border-slate-700 text-slate-500 hover:border-orange-500 hover:text-orange-500 transition-colors rounded flex items-center justify-center text-sm font-bold uppercase tracking-wide">
                        <Plus size={16} className="mr-2"/> Adicionar Campeonato Customizado
                     </button>
                  )}
              </div>
            </div>
          )}

          {/* STEP 4: TITLES & PARTICIPATIONS */}
          {step === 4 && (
             <div className="animate-fade-in space-y-8">
               
               {/* Titles */}
               <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-display font-bold text-yellow-500 uppercase flex items-center">
                      <Medal className="w-4 h-4 mr-2"/> Títulos Oficiais
                      <Tooltip content="Informe os títulos. Campeonatos maiores valem mais." />
                    </label>
                    <button 
                      onClick={() => {
                         const newId = Date.now().toString();
                         updateProfile('titles', [...profile.titles, { id: newId, name: '', count: 1 }]);
                      }}
                      className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600"
                    >
                      + Adicionar
                    </button>
                  </div>
                  {profile.titles.map((t, idx) => (
                    <div key={t.id} className="flex gap-2 mb-2">
                       <select 
                         className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                         value={t.name}
                         onChange={(e) => {
                            const newTitles = [...profile.titles];
                            newTitles[idx].name = e.target.value;
                            updateProfile('titles', newTitles);
                         }}
                       >
                         <option value="" className="bg-slate-900">Selecione o Campeonato...</option>
                         {getAvailableCompetitions().map(c => (
                           <option key={c.id} value={c.name} className="bg-slate-900">{c.name} ({c.type}) - {c.tier}</option>
                         ))}
                       </select>
                       <input 
                         type="number" 
                         placeholder="Qtd" 
                         className="w-20 bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                         value={t.count}
                         onChange={(e) => {
                            const newTitles = [...profile.titles];
                            newTitles[idx].count = Number(e.target.value);
                            updateProfile('titles', newTitles);
                         }}
                       />
                    </div>
                  ))}
                  {profile.titles.length === 0 && <p className="text-xs text-slate-500 italic">Nenhum título adicionado.</p>}
               </div>

               {/* Participations */}
               <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-display font-bold text-blue-400 uppercase flex items-center">
                      <Users className="w-4 h-4 mr-2"/> Participações
                      <Tooltip content="Indique quantas vezes o jogador participou de competições." />
                    </label>
                    <button 
                      onClick={() => {
                         const newId = Date.now().toString();
                         updateProfile('participations', [...profile.participations, { id: newId, name: '', count: 1 }]);
                      }}
                      className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600"
                    >
                      + Adicionar
                    </button>
                  </div>
                  {profile.participations.map((p, idx) => (
                    <div key={p.id} className="flex gap-2 mb-2">
                       <select 
                         className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                         value={p.name}
                         onChange={(e) => {
                            const newPart = [...profile.participations];
                            newPart[idx].name = e.target.value;
                            updateProfile('participations', newPart);
                         }}
                       >
                         <option value="" className="bg-slate-900">Selecione o Campeonato...</option>
                         {getAvailableCompetitions().map(c => (
                           <option key={c.id} value={c.name} className="bg-slate-900">{c.name} ({c.type}) - {c.tier}</option>
                         ))}
                       </select>
                       <input 
                         type="number" 
                         placeholder="Qtd" 
                         className="w-20 bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                         value={p.count}
                         onChange={(e) => {
                            const newPart = [...profile.participations];
                            newPart[idx].count = Number(e.target.value);
                            updateProfile('participations', newPart);
                         }}
                       />
                    </div>
                  ))}
               </div>

             </div>
          )}

          {/* STEP 5: RECENT HISTORY */}
          {step === 5 && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-display text-orange-400 mb-6 flex items-center">
                Últimas 3 Competições
                <Tooltip content="Desempenho recente é crucial. Adicione até 3 registros." />
              </h3>

              <div className="space-y-4">
                 {[0, 1, 2].map(i => {
                    const existing = profile.recentCompetitions[i];
                    return (
                      <div key={i} className="p-4 bg-slate-900/40 border border-slate-700 rounded hover:border-orange-500/50 transition-colors">
                         <div className="text-xs text-slate-500 uppercase mb-2 font-bold">Competição {i+1}</div>
                         <div className="grid grid-cols-1 gap-3">
                            <select 
                               className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
                               value={existing?.name || ''}
                               onChange={(e) => {
                                  const newList = [...profile.recentCompetitions];
                                  if(!newList[i]) newList[i] = { id: Date.now().toString(), name: '', type: CompetitionType.ONLINE, position: 12 };
                                  newList[i].name = e.target.value;
                                  
                                  const all = getAvailableCompetitions();
                                  const found = all.find(c => c.name === e.target.value);
                                  if (found) {
                                      newList[i].type = found.type;
                                  }

                                  updateProfile('recentCompetitions', newList);
                               }}
                            >
                               <option value="" className="bg-slate-900">Selecione a Competição...</option>
                               {getAvailableCompetitions().map(c => (
                                  <option key={c.id} value={c.name} className="bg-slate-900">{c.name} ({c.type})</option>
                               ))}
                            </select>
                            <div className="flex gap-2">
                               <select 
                                 className="bg-slate-950 border border-slate-800 rounded px-2 py-2 text-sm text-white flex-1"
                                 value={existing?.type || CompetitionType.ONLINE}
                                 onChange={(e) => {
                                    const newList = [...profile.recentCompetitions];
                                    if(!newList[i]) newList[i] = { id: Date.now().toString(), name: '', type: CompetitionType.ONLINE, position: 12 };
                                    newList[i].type = e.target.value as CompetitionType;
                                    updateProfile('recentCompetitions', newList);
                                 }}
                               >
                                 <option value={CompetitionType.ONLINE}>ONLINE</option>
                                 <option value={CompetitionType.PRESENCIAL}>PRESENCIAL</option>
                               </select>
                               <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-3">
                                  <span className="text-xs text-slate-500 mr-2">Posição:</span>
                                  <input 
                                    type="number" 
                                    className="w-12 bg-transparent text-white text-sm outline-none"
                                    value={existing?.position || ''}
                                    placeholder="#"
                                    onChange={(e) => {
                                       const newList = [...profile.recentCompetitions];
                                       if(!newList[i]) newList[i] = { id: Date.now().toString(), name: '', type: CompetitionType.ONLINE, position: 12 };
                                       newList[i].position = Number(e.target.value);
                                       updateProfile('recentCompetitions', newList);
                                    }}
                                  />
                               </div>
                            </div>
                         </div>
                      </div>
                    )
                 })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button 
              onClick={handleBack}
              disabled={step === 0}
              className={`flex items-center px-6 py-3 rounded text-sm font-bold uppercase tracking-wider transition-all ${
                step === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
            </button>

            <button 
              onClick={() => {
                if (step < totalSteps) handleNext();
                else setStep(totalSteps); // Trigger result
              }}
              className="group flex items-center px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white rounded shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all font-bold uppercase tracking-wider"
            >
              {step === totalSteps - 1 ? (
                <>Calcular Valor <Zap className="w-4 h-4 ml-2 animate-pulse" /></>
              ) : (
                <>Próximo <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
          
        </div>
        <Footer />
      </div>
    </div>
    );
  }