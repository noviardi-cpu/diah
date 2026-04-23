
import React, { useState, useEffect, useRef } from 'react';
import { TCM_DB } from '../constants';
import { 
  ArrowRight, Loader2, Info, ChevronDown, Target, Filter, 
  LayoutGrid, Map as MapIcon, X, Search, Activity, 
  BookOpen, Heart, Brain, Zap, Waves, Wind, Mountain, 
  Smile, Frown, AlertCircle, Clock
} from 'lucide-react';
import { WuXingInteractiveDiagram } from './WuXingInteractiveDiagram';

interface Props {
  onSelectSyndrome?: (id: string) => void;
  isLoading?: boolean;
}

const elements = [
  { 
    name: 'wood', display: 'Wood (Kayu)', 
    color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/50', shadowColor: 'shadow-emerald-900/50',
    keywords: ['Liver', 'Gall', 'Wood', 'Hati', 'Empedu'],
    organs: ['Liver', 'Gall Bladder'],
    tagline: 'Aliran Qi & Fleksibilitas'
  },
  { 
    name: 'fire', display: 'Fire (Api)', 
    color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/50', shadowColor: 'shadow-rose-900/50',
    keywords: ['Heart', 'Small Intestine', 'Pericardium', 'San Jiao', 'Fire', 'Jantung'],
    organs: ['Heart', 'Small Intestine', 'Pericardium', 'San Jiao'],
    tagline: 'Vitalitas & Kesadaran'
  },
  { 
    name: 'earth', display: 'Earth (Tanah)', 
    color: 'text-amber-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-amber-500/50', shadowColor: 'shadow-amber-900/50',
    keywords: ['Spleen', 'Stomach', 'Earth', 'Limpa', 'Lambung'],
    organs: ['Spleen', 'Stomach'],
    tagline: 'Transformasi & Nutrisi'
  },
  { 
    name: 'metal', display: 'Metal (Logam)', 
    color: 'text-white', bgColor: 'bg-pink-400/10', borderColor: 'border-pink-400', shadowColor: 'shadow-slate-500/50',
    keywords: ['Lung', 'Large Intestine', 'Metal', 'Paru', 'Usus Besar'],
    organs: ['Lung', 'Large Intestine'],
    tagline: 'Respirasi & Pertahanan'
  },
  { 
    name: 'water', display: 'Water (Air)', 
    color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/50', shadowColor: 'shadow-blue-900/50',
    keywords: ['Kidney', 'Bladder', 'Water', 'Ginjal', 'Kandung Kemih'],
    organs: ['Kidney', 'Bladder'],
    tagline: 'Esensi & Akar Kehidupan'
  },
];

const WuXingMasterPanel: React.FC<Props> = ({ onSelectSyndrome, isLoading = false }) => {
  const [diagramSelection, setDiagramSelection] = useState<string | null>(null);
  const [organFilter, setOrganFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allSyndromesRaw = [
    ...(TCM_DB.syndromes.FILLED_FROM_PDF || []),
    ...(TCM_DB.syndromes.TODO_FROM_PDF || [])
  ];

  // Deduplicate by id to prevent React key warnings.
  // We keep the first occurrence, which prioritizes FILLED_FROM_PDF over TODO_FROM_PDF.
  const uniqueSyndromesMap = new Map();
  allSyndromesRaw.forEach(s => {
    if (s.id && !uniqueSyndromesMap.has(s.id)) {
      uniqueSyndromesMap.set(s.id, s);
    } else if (!s.id) {
      const fallbackId = s.name_en || s.name_id || Math.random().toString();
      if (!uniqueSyndromesMap.has(fallbackId)) {
        uniqueSyndromesMap.set(fallbackId, { ...s, id: fallbackId });
      }
    }
  });
  const allSyndromes = Array.from(uniqueSyndromesMap.values());

  const handleElementSelect = (el: string | null) => {
    setOrganFilter(null);
    setDiagramSelection(el);
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOrganFilter = (org: string) => {
    setOrganFilter(org);
    const foundEl = elements.find(e => e.organs.includes(org));
    if (foundEl) setDiagramSelection(foundEl.name);
  };

  const clearAllFilters = () => {
    setDiagramSelection(null);
    setOrganFilter(null);
    setSearchQuery('');
  };

  const getFilteredSyndromes = (elName: string) => {
    const el = elements.find(e => e.name === elName);
    if (!el) return [];
    
    return allSyndromes.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchSearch = q === '' || (s.name_id || "").toLowerCase().includes(q) || (s.name_en || "").toLowerCase().includes(q);
      
      if (!matchSearch) return false;

      if (organFilter) {
          return (s.primary_organs || []).some(o => o.toLowerCase() === organFilter.toLowerCase());
      }
      
      // Filter by element
      if (s.wuxing_element && s.wuxing_element.toLowerCase().startsWith(elName.toLowerCase())) return true;
      
      const text = ((s.name_en || "") + " " + (s.name_id || "") + " " + (s.primary_organs || []).join(" ")).toLowerCase();
      return el.keywords.some(k => text.includes(k.toLowerCase()));
    });
  };

  const OrganEncyclopedia = () => (
    <div className="mt-8 pb-32 space-y-12 animate-fade-in overflow-visible">
      <div className="flex items-center gap-4 border-b border-pink-400 pb-6">
        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-xl">
          <BookOpen className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Organ Encyclopedia</h2>
          <p className="text-[10px] text-white font-bold uppercase tracking-[0.3em]">Comprehensive Clinical Reference</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {['Liver', 'Spleen', 'Kidney', 'Heart', 'Lung'].map((orgName) => {
          const org = TCM_DB.organ_details[orgName];
          if (!org) return null;
          const el = elements.find(e => e.name.toLowerCase() === org.element.toLowerCase());

          return (
            <div key={orgName} className={`bg-pink-900/60 border-t-4 ${el?.borderColor} rounded-3xl p-8 shadow-2xl transition-all hover:-translate-y-2 group relative overflow-hidden backdrop-blur-md`}>
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none -mr-4 -mt-4">
                <Activity className="w-full h-full" />
              </div>
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{org.name}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${el?.color}`}>
                    {org.type} • {org.element}
                  </span>
                </div>
                <div className={`p-4 rounded-2xl ${el?.bgColor} border ${el?.borderColor} shadow-lg`}>
                   {org.name === 'Liver' && <Wind className="w-6 h-6 text-emerald-400" />}
                   {org.name === 'Spleen' && <Mountain className="w-6 h-6 text-amber-400" />}
                   {org.name === 'Kidney' && <Waves className="w-6 h-6 text-blue-400" />}
                   {org.name === 'Heart' && <Heart className="w-6 h-6 text-rose-400" />}
                   {org.name === 'Lung' && <Wind className="w-6 h-6 text-white" />}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest block mb-4 flex items-center gap-2">
                    <Target className="w-3 h-3 text-tcm-primary" /> Core Functions
                  </span>
                  <ul className="space-y-3">
                    {(org.main_functions || []).map((fn, idx) => (
                      <li key={idx} className="text-sm text-white leading-relaxed flex items-start gap-3">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-pink-700 shrink-0"></div>
                        <span>{fn}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-pink-950/50 p-4 rounded-2xl border border-pink-400">
                      <span className="text-[9px] font-black text-white uppercase block mb-2">Primary Emotion</span>
                      <div className="flex items-center gap-2">
                         <Smile className="w-3 h-3 text-amber-500" />
                         <span className="text-xs font-black text-white uppercase">{org.emotion}</span>
                      </div>
                   </div>
                   <div className="bg-pink-950/50 p-4 rounded-2xl border border-pink-400">
                      <span className="text-[9px] font-black text-white uppercase block mb-2">Ethereal Spirit</span>
                      <span className="text-xs font-black text-white uppercase tracking-widest">
                        {org.name === 'Liver' ? 'Hun' : org.name === 'Heart' ? 'Shen' : org.name === 'Spleen' ? 'Yi' : org.name === 'Lung' ? 'Po' : 'Zhi'}
                      </span>
                   </div>
                </div>

                <div className="pt-6 border-t border-pink-400 grid grid-cols-2 gap-y-4">
                   <div>
                      <span className="text-[8px] font-black text-white uppercase block tracking-widest">Sense Organ</span>
                      <span className="text-xs font-bold text-white">{org.sense_organ}</span>
                   </div>
                   <div>
                      <span className="text-[8px] font-black text-white uppercase block tracking-widest">Controls</span>
                      <span className="text-xs font-bold text-white">{org.tissues}</span>
                   </div>
                   <div>
                      <span className="text-[8px] font-black text-white uppercase block tracking-widest">Classic Flavor</span>
                      <span className="text-xs font-bold text-white">{org.flavor}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-bold text-white tracking-tighter">{org.time_of_day}</span>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-pink-600 text-white p-6 animate-fade-in">
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-6" />
        <h3 className="text-2xl font-black text-emerald-400 tracking-widest uppercase">Wu Xing Engine</h3>
        <p className="text-white text-[10px] mt-2 font-mono uppercase tracking-[0.3em]">Architecting Elemental Relationships...</p>
      </div>
    );
  }

  const activeElementData = diagramSelection 
    ? elements.find(e => e.name.toLowerCase() === diagramSelection.toLowerCase()) 
    : null;

  return (
    <div className="h-full bg-pink-600 text-white flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* LEFT MAP BAR */}
      <div className="w-full md:w-[45%] lg:w-[420px] border-r border-pink-400 bg-pink-900/40 flex flex-col h-[500px] md:h-full shrink-0 shadow-2xl overflow-visible relative">
         <div className="p-6 border-b border-pink-400 flex justify-between items-center bg-pink-900/90 backdrop-blur-md z-10">
            <div>
               <h3 className="text-xl font-black text-emerald-400 flex items-center gap-2">
                 <MapIcon className="w-5 h-5" /> Elemental Map
               </h3>
               <p className="text-[10px] text-white uppercase font-black tracking-[0.2em]">Five Elements Cycle</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setShowEncyclopedia(!showEncyclopedia); clearAllFilters(); }} 
                className={`p-3 rounded-2xl border transition-all shadow-lg ${showEncyclopedia ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-pink-800 border-pink-400 text-white hover:text-white'}`}
                title="Toggle Encyclopedia"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              {(diagramSelection || organFilter || searchQuery) && (
                <button onClick={clearAllFilters} className="text-[10px] font-black text-white hover:text-white flex items-center gap-2 bg-pink-800 px-4 py-2 rounded-xl border border-pink-400 transition-all shadow-md">
                    <X className="w-3 h-3" /> RESET
                </button>
              )}
            </div>
         </div>
         
         <div className="flex-1 min-h-0 relative z-0">
            <WuXingInteractiveDiagram 
                embedded={true} 
                className="h-full w-full scale-110" 
                onElementSelect={handleElementSelect}
                initialHighlight={diagramSelection}
            />
         </div>

         {/* Organ Fast-Switch Navigation */}
         <div className="p-6 border-t border-pink-400 bg-pink-900/50 overflow-x-auto scrollbar-hide shrink-0 z-10">
            <div className="flex gap-2 min-w-max">
               {['Liver', 'Heart', 'Spleen', 'Lung', 'Kidney'].map(org => (
                 <button 
                    key={org}
                    onClick={() => handleOrganFilter(org)}
                    className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-md ${
                        organFilter === org 
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-900/40' 
                        : 'bg-pink-800 border-pink-400 text-white hover:border-pink-400'
                    }`}
                 >
                    {org}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-pink-600 scroll-smooth scrollbar-hide relative">
         
         {/* Adaptive Search & Header */}
         <div className="sticky top-0 z-20 bg-pink-600/90 backdrop-blur-md border-b border-pink-400 p-8 shadow-xl">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                            {showEncyclopedia ? (
                              <><span className="text-indigo-400">Knowledge</span> Base</>
                            ) : diagramSelection ? (
                                <>
                                    <span className={activeElementData?.color}>{diagramSelection}</span> 
                                    <span className="text-white"> Patterns</span>
                                </>
                            ) : (
                                <>Syndrome <span className="text-emerald-500">Master</span></>
                            )}
                        </h2>
                        <p className="text-xs text-white font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {showEncyclopedia ? 'Clinical Reference & Physiology' : organFilter ? `Focusing on ${organFilter} Pathology` : 'Multi-Elemental Pattern Differentiation'}
                        </p>
                    </div>
                    
                    {!showEncyclopedia && (
                      <div className="relative w-full md:w-80 group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white group-focus-within:text-emerald-400 transition-colors" />
                          <input 
                              type="text"
                              placeholder="Search clinical patterns..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-pink-900/50 border border-pink-400 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-emerald-500 focus:bg-pink-900 outline-none transition-all shadow-inner"
                          />
                      </div>
                    )}
                </div>
            </div>
         </div>

         <div className="p-8 max-w-6xl mx-auto overflow-visible">
            {showEncyclopedia ? (
              <OrganEncyclopedia />
            ) : (
              <div className="space-y-20 pb-32">
                  {(diagramSelection ? [activeElementData!] : elements).map((el) => {
                  const syndromes = getFilteredSyndromes(el.name);
                  
                  return (
                      <div key={el.name} className="animate-fade-in scroll-mt-32">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 border-b border-pink-400 pb-6 gap-6">
                            <div>
                                <h3 className={`text-3xl font-black uppercase tracking-[0.3em] ${el.color}`}>{el.display}</h3>
                                <p className="text-[10px] text-white font-black mt-2 uppercase tracking-widest leading-none">{el.tagline}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] bg-pink-900/50 text-white px-4 py-2 rounded-2xl border border-pink-400 font-black uppercase tracking-widest flex items-center gap-3">
                                    <BookOpen className="w-3.5 h-3.5" /> {syndromes.length} clinical patterns
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {syndromes.map(s => (
                            <div 
                                key={s.id}
                                onClick={() => onSelectSyndrome?.(s.id)}
                                className={`bg-pink-900/40 hover:bg-pink-800/60 p-8 rounded-[2rem] border border-pink-400 hover:border-white/20 cursor-pointer transition-all group flex flex-col gap-6 shadow-2xl active:scale-[0.98] ${el.borderColor} backdrop-blur-md`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`p-5 rounded-2xl bg-pink-600 border border-pink-400 shadow-inner group-hover:scale-110 transition-transform ${el.color}`}>
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        {(s.primary_organs || []).slice(0, 2).map(org => (
                                            <span key={org} className="px-3 py-1 rounded-xl bg-pink-900/80 text-[9px] text-white font-black uppercase tracking-[0.1em] border border-pink-400">{org}</span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-white text-xl leading-tight group-hover:text-tcm-primary transition-colors mb-2 uppercase tracking-tighter">{s.name_id}</h4>
                                    <p className="text-white text-xs italic mb-6 truncate font-medium">{s.name_en}</p>
                                    
                                    {s.key_symptoms && s.key_symptoms.length > 0 && (
                                        <div className="flex flex-wrap gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            {(s.key_symptoms || []).slice(0, 4).map(ks => (
                                                <span key={ks} className="px-2.5 py-1 bg-pink-950 text-[9px] text-white rounded-lg border border-pink-400 uppercase font-bold tracking-tighter">{ks}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="pt-6 border-t border-pink-400 flex items-center justify-between text-white group-hover:text-white transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Detailed Differentiation</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                                </div>
                            </div>
                            ))}

                            {syndromes.length === 0 && (
                            <div className="col-span-full py-28 px-10 border-2 border-dashed border-pink-400 rounded-[2.5rem] flex flex-col items-center justify-center text-white">
                                <Info className="w-16 h-16 mb-6 opacity-10" />
                                <p className="text-sm font-black uppercase tracking-[0.2em]">No clinical patterns found</p>
                                <p className="text-[10px] mt-2 text-white font-bold uppercase">Try resetting filters or adjusting your search</p>
                            </div>
                            )}
                        </div>
                      </div>
                  );
                  })}
              </div>
            )}

            <div className="mt-32 py-20 border-t border-pink-400 text-center">
                <p className="text-[10px] text-white uppercase tracking-[0.6em] font-black font-mono">
                    TCM WU XING MASTER CDSS PRO v{TCM_DB.metadata.version}
                </p>
                <div className="mt-4 flex justify-center gap-6 text-[9px] text-white font-black uppercase tracking-widest">
                  <span>Elemental Mapping</span>
                  <span>•</span>
                  <span>Pattern Differentiation</span>
                  <span>•</span>
                  <span>Zang-Fu Physiology</span>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default WuXingMasterPanel;
