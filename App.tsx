import React, { useState, useRef, useEffect } from 'react';
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
  ArrowLeft,
  RotateCcw,
  Cpu,
  Activity,
  Share2,
  CheckCircle2,
  AlertCircle
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

// --- INTERACTIVE BACKGROUND COMPONENT ---
const InteractiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles: any[] = [];
    const particleCount = Math.min(100, (width * height) / 10000); // Responsive count

    const createParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      color: `rgba(${Math.random() > 0.5 ? '234, 179, 8' : '249, 115, 22'}, ${Math.random() * 0.3 + 0.1})` // Yellow/Orange
    });

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    // Mouse interaction
    let mouse = { x: -1000, y: -1000 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse Repel/Attract
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 150) {
           p.x -= dx * 0.01;
           p.y -= dy * 0.01;
        }

        // Draw Particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect Lines
        particles.forEach((p2, j) => {
          if (i === j) return;
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist2 = Math.sqrt(dx2*dx2 + dy2*dy2);

          if (dist2 < 120) {
            ctx.strokeStyle = `rgba(234, 179, 8, ${0.15 - dist2/120 * 0.15})`; // Yellow connections
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

// --- COMPONENTS ---

const Footer = () => (
  <div className="w-full text-center py-6 mt-auto z-50 relative animate-fade-in border-t border-white/5 bg-slate-950/50 backdrop-blur-sm print:hidden">
    <div className="flex flex-col items-center justify-center space-y-3">
      <p className="text-slate-500 text-xs md:text-sm uppercase tracking-[0.2em] font-display">
        System Architecture by <span className="text-yellow-400 font-bold glow-text">Jhan Medeiros</span>
      </p>
      <a 
        href="https://www.instagram.com/jhanmedeiros/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group flex items-center px-4 py-2 bg-slate-900 border border-slate-700 rounded-full text-slate-300 text-xs font-bold hover:scale-105 hover:border-pink-500 hover:text-pink-400 transition-all duration-300"
      >
        <Instagram className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
        <span className="group-hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">@jhanmedeiros</span>
      </a>
    </div>
  </div>
);

const StepIndicator = ({ current, total }: { current: number; total: number }) => (
  <div className="flex justify-center space-x-2 mb-8 relative z-20 print:hidden">
    {Array.from({ length: total }).map((_, i) => (
      <div 
        key={i} 
        className={`h-1.5 rounded-full transition-all duration-500 ${
          i < current ? 'w-8 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 
          i === current ? 'w-8 bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,1)] scale-110' : 'w-4 bg-slate-800'
        }`}
      />
    ))}
  </div>
);

const NeonInput = ({ label, value, onChange, type = "text", placeholder = "", tooltip = "" }: any) => (
  <div className="mb-6 group relative z-10">
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
        min={type === "number" ? "0" : undefined}
        className="w-full bg-slate-900/40 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all font-sans placeholder-slate-600 backdrop-blur-sm"
      />
      <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-transparent group-hover:ring-white/10 pointer-events-none transition-all" />
    </div>
  </div>
);

const NeonSelect = ({ label, value, onChange, options, tooltip = "" }: any) => (
  <div className="mb-6 relative z-10">
    <label className="block text-sm font-display font-bold text-orange-400 mb-2 uppercase tracking-wider flex items-center">
      {label}
      {tooltip && <Tooltip content={tooltip} />}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-slate-900/40 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all font-sans appearance-none backdrop-blur-sm"
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt} className="bg-slate-950 text-slate-200">{opt}</option>
      ))}
    </select>
  </div>
);

const StatBar = ({ label, value, max, color = "bg-orange-500" }: { label: string, value: number, max: number, color?: string }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div className="mb-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
                <span className="text-slate-300">{label}</span>
                <span className="text-white">{value.toFixed(1)} / {max} pts</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${color}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default function App() {
  const [started, setStarted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<PlayerProfile>(initialProfile);
  const [showFullReport, setShowFullReport] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Animation State
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Custom Competition State
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<CompetitionType>(CompetitionType.ONLINE);
  const [customTier, setCustomTier] = useState<Tier>(Tier.B);
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);
  const fullReportRef = useRef<HTMLDivElement>(null);
  const totalSteps = 6; 

  const result = calculateScore(profile);

  // Score Animation Effect
  useEffect(() => {
    if (step === totalSteps) {
      const duration = 2500;
      const end = result.score;
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const progress = Math.min(1, (now - startTime) / duration);
        // Easing function for smoother finish
        const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4);
        
        setAnimatedScore(Math.floor(easeOutQuart(progress) * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [step, result.score]);

  // Color interpolation for score
  const getScoreColor = (score: number) => {
      if (score < 40) return "text-red-500";
      if (score < 70) return "text-yellow-400";
      return "text-green-400";
  }

  const handleNext = () => {
    // Validation Logic
    if (step === 0) {
        if (!profile.name.trim()) return alert("Por favor, digite o nome do jogador.");
    }
    if (step === 1) {
        if (profile.officialKills < 0) return alert("O número de kills não pode ser negativo.");
        if (profile.lastBooyahs < 0) return alert("O número de booyahs não pode ser negativo.");
    }
    if (step === 2) {
        if (profile.followers < 0) return alert("O número de seguidores não pode ser negativo.");
        if (profile.engagement < 0 || profile.engagement > 100) return alert("O engajamento deve ser entre 0 e 100%.");
    }
    if (step === 3) {
        // Warning if no competition selected (optional but good practice)
        if (profile.selectedCompetitions.length === 0) {
            if(!window.confirm("Nenhuma competição selecionada. Isso afetará drasticamente o score. Deseja continuar mesmo assim?")) {
                return;
            }
        }
    }

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
    setAnimatedScore(0);
  };

  const handleGoHome = () => {
    const isDirty = JSON.stringify(profile) !== JSON.stringify(initialProfile);
    if (!isDirty || window.confirm("Deseja voltar à tela inicial? Seus dados atuais serão perdidos.")) {
      setStarted(false);
      setStep(0);
      setProfile(initialProfile);
      setAnimatedScore(0);
    }
  };

  const handleClearForm = () => {
    if (window.confirm("Deseja limpar todos os campos preenchidos?")) {
      setProfile(initialProfile);
      setStep(0);
    }
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
    // Determine which ref to use based on what's visible
    const targetRef = showFullReport ? fullReportRef : resultRef;
    
    if (!targetRef.current || !(window as any).html2canvas) return;
    
    setIsGeneratingImage(true);

    try {
      // Small delay to allow UI to settle if just switched
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await (window as any).html2canvas(targetRef.current, {
        backgroundColor: '#020617', // Force dark background
        scale: 2, // Retain quality but not too heavy
        logging: false,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element: any) => element.classList.contains('no-print'), // Ignore elements with no-print class
      });
      
      const link = document.createElement('a');
      link.download = `FF_Salary_Pro_${profile.name.replace(/\s+/g, '_')}_${showFullReport ? 'Relatorio' : 'Card'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      alert("Erro ao salvar a imagem. Tente usar a opção de imprimir (PDF).");
    } finally {
      setIsGeneratingImage(false);
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
      <div className="min-h-screen relative text-slate-200 p-8 flex flex-col items-center">
        <InteractiveBackground />
        
        <div className="max-w-5xl w-full relative z-10 mb-8">
            <button onClick={() => setShowHelp(false)} className="mb-8 flex items-center text-yellow-500 hover:text-yellow-300 transition-colors font-bold uppercase tracking-wider group">
                <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar
            </button>
            
            <div className="glass-panel p-8 md:p-12 rounded-2xl border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)] animate-fade-in">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 drop-shadow-md">Metodologia de Avaliação v2.0</h1>
                    <p className="text-slate-400 font-mono text-sm md:text-base max-w-2xl mx-auto">
                        O algoritmo FF Salary Pro utiliza um sistema de pesos ponderados para calcular o valor de mercado (Score 0-100) baseado em 5 pilares fundamentais.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Pilar 1 */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors">
                        <div className="flex items-center mb-4">
                            <Swords className="w-8 h-8 text-blue-400 mr-3" />
                            <h3 className="text-xl font-display font-bold text-white">1. Mecânica & Função</h3>
                        </div>
                        <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                            <li><strong className="text-white">Rush & Flex:</strong> Maior peso devido à demanda de mercado e complexidade mecânica.</li>
                            <li><strong className="text-white">Capitão:</strong> Bônus fixo de liderança (+5 pontos) aplicado ao score.</li>
                            <li>Impacto total aproximado: <strong>17% do Score</strong>.</li>
                        </ul>
                    </div>

                    {/* Pilar 2 */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-red-500/50 transition-colors">
                        <div className="flex items-center mb-4">
                            <Target className="w-8 h-8 text-red-400 mr-3" />
                            <h3 className="text-xl font-display font-bold text-white">2. Estatísticas Oficiais</h3>
                        </div>
                        <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                            <li><strong className="text-white">Kills:</strong> Métrica primária. Referência de excelência: 1000 kills oficiais.</li>
                            <li><strong className="text-white">Booyahs:</strong> Métrica secundária exclusiva para capitães (capacidade de call).</li>
                            <li>Impacto total aproximado: <strong>20% do Score</strong>.</li>
                        </ul>
                    </div>

                    {/* Pilar 3 */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-pink-500/50 transition-colors">
                        <div className="flex items-center mb-4">
                            <Instagram className="w-8 h-8 text-pink-400 mr-3" />
                            <h3 className="text-xl font-display font-bold text-white">3. Marketing & Influência</h3>
                        </div>
                        <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                            <li><strong className="text-white">Seguidores:</strong> Escala logarítmica. 1M+ atinge o teto da pontuação.</li>
                            <li><strong className="text-white">Engajamento:</strong> Taxa de interação % bonifica o score final.</li>
                            <li>Impacto total aproximado: <strong>15% do Score</strong>.</li>
                        </ul>
                    </div>

                    {/* Pilar 4 */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 hover:border-yellow-500/50 transition-colors">
                        <div className="flex items-center mb-4">
                            <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
                            <h3 className="text-xl font-display font-bold text-white">4. Carreira & Conquistas</h3>
                        </div>
                        <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                            <li><strong className="text-white">Tiers (S, A, B):</strong> Campeonatos presenciais (Tier S) valem significativamente mais.</li>
                            <li><strong className="text-white">Títulos:</strong> Peso dobrado em relação à participação. Mundial vale 7x mais que camps comunidade.</li>
                            <li>Impacto total aproximado: <strong>40% do Score</strong>.</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 bg-slate-900/50 p-6 rounded-xl border border-slate-700 text-center">
                     <p className="text-slate-400 text-sm">
                        O algoritmo é ajustado para refletir o cenário competitivo atual. Um jogador Tier S precisa performar bem em todos os pilares, não apenas em um.
                     </p>
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
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
        <InteractiveBackground />
        
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-yellow-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="z-10 relative text-center px-4 animate-fade-in-up flex flex-col items-center flex-1 justify-center max-w-5xl mx-auto pb-24">
          
          <div className="mb-10 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
            <div className="relative p-6 rounded-2xl bg-slate-900/50 border border-yellow-500/20 backdrop-blur-md shadow-[0_0_50px_rgba(234,179,8,0.1)] animate-float">
               <Trophy className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            </div>
          </div>
          
          <h1 className="glitch-text text-6xl md:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-6 uppercase tracking-tight" data-text="FF SALARY PRO">
            FF SALARY PRO
          </h1>
          
          <div className="flex items-center space-x-4 mb-10 opacity-80">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-yellow-500"></div>
            <h2 className="text-xl md:text-2xl font-light text-yellow-500 font-mono tracking-[0.3em] uppercase glow-text">
              Player Valuation System v2.0
            </h2>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-500"></div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-lg">
            <button 
              type="button"
              onClick={(e) => {
                  e.stopPropagation();
                  setStarted(true);
              }}
              className="group relative flex-1 px-8 py-5 bg-transparent overflow-hidden rounded-xl transition-all hover:scale-105 z-20 cursor-pointer"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 animate-gradient-xy opacity-90 group-hover:opacity-100"></div>
              <div className="relative flex items-center justify-center space-x-3 z-30">
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="uppercase text-white font-display font-bold tracking-widest text-lg">Iniciar</span>
              </div>
            </button>
            
            <button 
              type="button"
              onClick={(e) => {
                  e.stopPropagation();
                  setShowHelp(true);
              }}
              className="group relative flex-1 px-8 py-5 overflow-hidden rounded-xl transition-all hover:bg-slate-800/50 z-20 cursor-pointer border border-slate-700 hover:border-blue-500/50"
            >
              <div className="relative flex items-center justify-center space-x-3 z-30">
                <Cpu className="w-5 h-5 text-blue-500" />
                <span className="uppercase text-slate-300 font-display font-bold tracking-widest text-sm">Metodologia</span>
              </div>
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 7. Full Report View
  if (showFullReport) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 neon-grid-bg flex flex-col relative overflow-y-auto">
         <div className="max-w-5xl mx-auto flex-1 relative z-10 w-full pb-10">
            <div className="flex justify-between items-center mb-6 no-print">
                 <button onClick={() => setShowFullReport(false)} className="flex items-center text-yellow-500 hover:text-yellow-300 transition-colors">
                    <ChevronLeft className="mr-2" /> Voltar ao Card
                </button>
                <button 
                    onClick={handleSaveImage}
                    disabled={isGeneratingImage}
                    className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
                >
                    {isGeneratingImage ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <Download className="w-4 h-4 mr-2" />}
                    Salvar Relatório
                </button>
            </div>

            <div ref={fullReportRef} className="glass-panel p-8 md:p-10 rounded-2xl border border-orange-500/30 bg-slate-950/90 relative shadow-2xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-display font-black text-white uppercase tracking-wider mb-2">{profile.name}</h1>
                        <div className="flex gap-3">
                            <span className="px-3 py-1 bg-slate-800 rounded text-xs text-slate-300 border border-slate-700">{profile.role}</span>
                            {profile.isCaptain && <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs border border-yellow-600/30">CAPITÃO</span>}
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">Score Total</div>
                        <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>{result.score}</div>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    
                    {/* Left Column */}
                    <div>
                        <h3 className="text-lg font-display text-orange-400 mb-6 flex items-center border-b border-orange-500/20 pb-2">
                            <Swords className="w-5 h-5 mr-2" /> Performance & Função
                        </h3>
                        
                        <StatBar 
                            label="Mecânica e Função" 
                            value={result.breakdown.roleScore} 
                            max={17} 
                            color="bg-blue-500" 
                        />
                         <p className="text-xs text-slate-500 mb-6 pl-1">Avaliação baseada na função ({profile.role}) e bônus de liderança.</p>

                        <StatBar 
                            label="Estatísticas (Kills/Booyah)" 
                            value={result.breakdown.statsScore} 
                            max={20} 
                            color="bg-red-500" 
                        />
                         <p className="text-xs text-slate-500 mb-6 pl-1">Baseado em {profile.officialKills} kills oficiais{profile.isCaptain ? ` e ${profile.lastBooyahs} booyahs` : ''}.</p>

                         <h3 className="text-lg font-display text-pink-400 mb-6 flex items-center border-b border-pink-500/20 pb-2 mt-8">
                            <Instagram className="w-5 h-5 mr-2" /> Marketing Digital
                        </h3>
                        <StatBar 
                            label="Influência Social" 
                            value={result.breakdown.socialScore} 
                            max={15} 
                            color="bg-pink-500" 
                        />
                         <p className="text-xs text-slate-500 mb-6 pl-1">{profile.followers.toLocaleString()} seguidores com {profile.engagement}% de engajamento.</p>
                    </div>

                    {/* Right Column */}
                    <div>
                        <h3 className="text-lg font-display text-yellow-400 mb-6 flex items-center border-b border-yellow-500/20 pb-2">
                            <Trophy className="w-5 h-5 mr-2" /> Carreira Competitiva
                        </h3>
                        
                        <StatBar 
                            label="Competições e Títulos" 
                            value={result.breakdown.competitionScore} 
                            max={40} 
                            color="bg-yellow-500" 
                        />
                        
                        <div className="grid grid-cols-2 gap-4 mt-4 mb-8">
                            <div className="bg-slate-900/60 p-3 rounded border border-slate-700">
                                <div className="text-xs text-slate-500 uppercase">Títulos</div>
                                <div className="text-xl font-bold text-white">{profile.titles.reduce((acc, curr) => acc + curr.count, 0)}</div>
                            </div>
                            <div className="bg-slate-900/60 p-3 rounded border border-slate-700">
                                <div className="text-xs text-slate-500 uppercase">Participações</div>
                                <div className="text-xl font-bold text-white">{profile.participations.reduce((acc, curr) => acc + curr.count, 0) + profile.selectedCompetitions.length}</div>
                            </div>
                        </div>

                        <h3 className="text-lg font-display text-green-400 mb-6 flex items-center border-b border-green-500/20 pb-2">
                            <Activity className="w-5 h-5 mr-2" /> Momento Atual
                        </h3>

                        <StatBar 
                            label="Histórico Recente" 
                            value={result.breakdown.historyScore} 
                            max={15} 
                            color="bg-green-500" 
                        />
                         <p className="text-xs text-slate-500 mb-2 pl-1">Performance nas últimas 3 competições registradas.</p>
                    </div>

                </div>

                {/* Final Assessment */}
                <div className="mt-10 pt-8 border-t border-slate-700 flex flex-col md:flex-row items-center justify-between bg-slate-900/30 p-6 rounded-xl">
                    <div className="mb-4 md:mb-0">
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Classificação de Mercado</div>
                        <div className="text-4xl font-display font-black text-white">{result.tier}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Faixa Salarial Estimada</div>
                        <div className="text-2xl font-mono text-green-400 font-bold">{result.salaryRange}</div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em]">
                        Gerado por FF Salary Pro • System by Jhan Medeiros
                    </p>
                </div>
            </div>
         </div>
      </div>
    )
  }

  // 6. Result Page (Dashboard)
  if (step === totalSteps) {
      return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <InteractiveBackground />
        
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl relative z-10 animate-fade-in-up">
            <div ref={resultRef} className="glass-panel rounded-2xl p-8 w-full border border-orange-500/30 bg-slate-900/80 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-slate-800/50 rounded-full border border-slate-700 shadow-inner">
                         <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                    </div>
                </div>

                <h1 className="text-5xl font-display font-black text-white text-center mb-2 tracking-wide uppercase drop-shadow-lg">{profile.name}</h1>
                <p className="text-center text-slate-400 font-mono text-sm mb-8 tracking-[0.2em]">{profile.role} • {profile.isCaptain ? 'CAPTAIN' : 'PLAYER'}</p>
                
                <div className={`text-center text-8xl font-black mb-8 transition-colors duration-300 drop-shadow-[0_0_25px_rgba(0,0,0,0.8)] ${getScoreColor(animatedScore)}`}>
                    {animatedScore}
                </div>

                <div className="grid grid-cols-2 gap-4 text-center max-w-lg mx-auto mb-8">
                    <div className="p-4 bg-slate-800/80 rounded border border-slate-700">
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Tier de Mercado</div>
                        <div className="text-3xl font-display font-bold text-white">{result.tier}</div>
                    </div>
                    <div className="p-4 bg-slate-800/80 rounded border border-slate-700">
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Salário Est.</div>
                        <div className="text-xl font-bold text-green-400">{result.salaryRange}</div>
                    </div>
                </div>

                <div className="text-center no-print">
                     <p className="text-xs text-slate-500 mb-6">O valor apresentado é uma estimativa baseada em métricas públicas.</p>
                </div>

                <div className="mt-4 text-center border-t border-slate-800 pt-4 flex justify-between items-center no-print px-4">
                     <span className="text-[10px] text-slate-600 font-mono uppercase">FF SALARY PRO v2.0</span>
                     <span className="text-[10px] text-slate-600 font-mono uppercase">BY JHAN MEDEIROS</span>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-2xl no-print">
                <button 
                    onClick={() => setShowFullReport(true)} 
                    className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-xl font-bold uppercase tracking-wide transition-all flex items-center justify-center group"
                >
                    <FileText className="mr-2 group-hover:text-blue-400 transition-colors" /> Relatório Detalhado
                </button>
                <button 
                    onClick={handleSaveImage}
                    disabled={isGeneratingImage} 
                    className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-xl font-bold uppercase tracking-wide transition-all flex items-center justify-center group"
                >
                     {isGeneratingImage ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <Share2 className="mr-2 group-hover:text-green-400 transition-colors" />}
                     Salvar Card
                </button>
                <button 
                    onClick={handleRestart} 
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-orange-500/20 flex items-center justify-center"
                >
                    <RotateCcw className="mr-2" /> Novo Cálculo
                </button>
            </div>
        </div>
      </div>
      );
  }

  // --- FORM WIZARD LAYOUT ---
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-slate-950 overflow-hidden flex-col">
      <InteractiveBackground />
      
      <div className="w-full max-w-2xl flex-1 flex flex-col justify-center relative z-10">
        
        {/* Progress */}
        <div className="mb-6 flex justify-between items-end animate-fade-in-up relative z-30">
          <div>
            <h2 className="text-4xl font-display font-bold text-white uppercase mb-1 drop-shadow-md">
              {step === 0 && "Identificação"}
              {step === 1 && "Função & Stats"}
              {step === 2 && "Influência"}
              {step === 3 && "Competições"}
              {step === 4 && "Histórico"}
              {step === 5 && "Recentes"}
            </h2>
            <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                <span className="text-orange-400 font-mono text-sm tracking-widest">STEP {step + 1} <span className="text-slate-600">/</span> {totalSteps}</span>
            </div>
          </div>

          <div className="flex flex-col items-end relative z-50 pointer-events-auto">
            <div className="flex space-x-3 mb-1">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoHome();
                }}
                className="text-xs bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-white px-4 py-2 rounded-lg transition-all uppercase tracking-wider flex items-center backdrop-blur-sm cursor-pointer z-50"
              >
                <Home className="w-3 h-3 mr-2" /> Início
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearForm();
                }}
                className="text-xs bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-red-500 text-slate-400 hover:text-red-500 px-4 py-2 rounded-lg transition-all uppercase tracking-wider flex items-center backdrop-blur-sm cursor-pointer z-50"
              >
                <Trash2 className="w-3 h-3 mr-2" /> Limpar
              </button>
            </div>
          </div>
        </div>
        
        <StepIndicator current={step} total={totalSteps} />

        <div className="glass-panel p-8 md:p-10 rounded-2xl relative overflow-hidden transition-all duration-500 shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-slate-700/50 bg-slate-900/40">
          
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
               
               <div className="flex items-center mb-6 bg-slate-900/40 p-4 rounded-lg border border-slate-700 transition-colors hover:border-yellow-500/30">
                  <input 
                    type="checkbox" 
                    id="capitao"
                    checked={profile.isCaptain}
                    onChange={(e) => updateProfile('isCaptain', e.target.checked)}
                    className="w-5 h-5 accent-yellow-500 mr-3 rounded cursor-pointer"
                  />
                  <label htmlFor="capitao" className="text-white cursor-pointer select-none flex items-center font-display tracking-wide text-sm">
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
              <div className="flex items-center mb-6 p-4 bg-pink-900/10 rounded-lg border border-pink-500/20">
                <Instagram className="w-8 h-8 text-pink-500 mr-4" />
                <h3 className="text-xl font-display text-white">Engajamento Social</h3>
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
                      className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center group ${
                        isSelected 
                        ? 'bg-orange-900/20 border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
                        : 'bg-slate-900/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800/60'
                      }`}
                    >
                      <div>
                        <span className={`font-bold transition-colors ${isSelected ? 'text-orange-200' : 'text-slate-300 group-hover:text-white'}`}>{comp.name}</span>
                        <div className="text-xs mt-1 space-x-2">
                           <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">{comp.type}</span>
                           <span className={`px-2 py-0.5 rounded border ${comp.tier === Tier.S ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>Tier {comp.tier}</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-600'}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
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
                           <div key={comp.id} className="flex justify-between items-center p-3 bg-slate-900/60 border border-slate-700 rounded-lg mb-2 animate-fade-in">
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
                     <div className="bg-slate-900 p-4 rounded-lg border border-orange-500/30 animate-fade-in shadow-[0_0_20px_rgba(249,115,22,0.1)]">
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
                     <button onClick={() => setIsAddingCustom(true)} className="w-full py-3 border border-dashed border-slate-700 text-slate-500 hover:border-orange-500 hover:text-orange-500 hover:bg-slate-900/50 transition-colors rounded-lg flex items-center justify-center text-sm font-bold uppercase tracking-wide">
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
                      className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 transition-colors"
                    >
                      + Adicionar
                    </button>
                  </div>
                  {profile.titles.map((t, idx) => (
                    <div key={t.id} className="flex gap-2 mb-2 animate-fade-in">
                       <select 
                         className="flex-1 bg-slate-900/40 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
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
                         className="w-20 bg-slate-900/40 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                         value={t.count}
                         onChange={(e) => {
                            const newTitles = [...profile.titles];
                            newTitles[idx].count = Number(e.target.value);
                            updateProfile('titles', newTitles);
                         }}
                       />
                       <button 
                          onClick={() => {
                             const newTitles = profile.titles.filter(item => item.id !== t.id);
                             updateProfile('titles', newTitles);
                          }}
                          className="px-2 text-slate-500 hover:text-red-500"
                       >
                         <Trash2 size={14} />
                       </button>
                    </div>
                  ))}
                  {profile.titles.length === 0 && <p className="text-xs text-slate-500 italic p-2 border border-dashed border-slate-800 rounded">Nenhum título adicionado.</p>}
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
                      className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 transition-colors"
                    >
                      + Adicionar
                    </button>
                  </div>
                  {profile.participations.map((p, idx) => (
                    <div key={p.id} className="flex gap-2 mb-2 animate-fade-in">
                       <select 
                         className="flex-1 bg-slate-900/40 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
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
                         className="w-20 bg-slate-900/40 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                         value={p.count}
                         onChange={(e) => {
                            const newPart = [...profile.participations];
                            newPart[idx].count = Number(e.target.value);
                            updateProfile('participations', newPart);
                         }}
                       />
                       <button 
                          onClick={() => {
                             const newPart = profile.participations.filter(item => item.id !== p.id);
                             updateProfile('participations', newPart);
                          }}
                          className="px-2 text-slate-500 hover:text-red-500"
                       >
                         <Trash2 size={14} />
                       </button>
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
                      <div key={i} className="p-4 bg-slate-900/40 border border-slate-700 rounded-lg hover:border-orange-500/50 transition-all hover:bg-slate-800/40">
                         <div className="text-xs text-slate-500 uppercase mb-2 font-bold tracking-wider">Competição {i+1}</div>
                         <div className="grid grid-cols-1 gap-3">
                            <select 
                               className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition-colors"
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
                                 className="bg-slate-950 border border-slate-800 rounded px-2 py-2 text-sm text-white flex-1 focus:border-orange-500 outline-none"
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
                               <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-3 focus-within:border-orange-500">
                                  <span className="text-xs text-slate-500 mr-2">Posição:</span>
                                  <input 
                                    type="number" 
                                    className="w-12 bg-transparent text-white text-sm outline-none font-mono"
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
          <div className="mt-10 flex justify-between border-t border-slate-800 pt-8">
            <button 
              onClick={handleBack}
              disabled={step === 0}
              className={`flex items-center px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
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
              className="group flex items-center px-10 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all font-bold uppercase tracking-wider hover:scale-105"
            >
              {step === totalSteps - 1 ? (
                <>Calcular Valor <Zap className="w-5 h-5 ml-2 animate-pulse" /></>
              ) : (
                <>Próximo <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
          
        </div>
        <Footer />
      </div>
    </div>
    );
  }