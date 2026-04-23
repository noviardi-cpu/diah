
import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, MessageSquare, Stethoscope, Archive, Compass, GraduationCap, Shield, LogOut, ClipboardList, Loader2, Menu, X, Globe, User, LayoutGrid } from 'lucide-react';
import { Language, ChatMessage, ScoredSyndrome, UserAccount, TcmDiagnosisResult } from './types';
import { sendMessageToGeminiStream } from './services/geminiService';
import { analyzePatient } from './services/tcmLogic';
import { db, DEFAULT_ADMIN } from './services/db';
import DiagnosisCard from './components/DiagnosisCard';
import PatientFormModal from './components/PatientFormModal';
import WuXingVisualizerModal from './components/WuXingVisualizerModal';
import ScoringAndPointsHub from './components/ScoringAndPointsHub';
import WuXingMasterPanel from './components/WuXingMasterPanel';
import LoginScreen from './components/LoginScreen';
import UserManagementModal from './components/UserManagementModal';
import UkomPracticePanel from './components/UkomPracticePanel';
import PatientArchivePanel from './components/PatientArchivePanel';
import SyndromeAtlasWindow from './components/SyndromeAtlasWindow';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('tcm_active_session');
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN;
  });

  const [activePanel, setActivePanel] = useState<'chat' | 'diagnosis' | 'wuxing' | 'ukom' | 'archive' | 'atlas'>('chat');
  const [appLanguage, setAppLanguage] = useState<Language>(Language.INDONESIAN);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'model', text: 'Sistem Siap. Masukkan keluhan pasien untuk analisis cepat atau gunakan Form Input Pasien.', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [cdssResults, setCdssResults] = useState<ScoredSyndrome[]>([]);
  const [lastPatientForm, setLastPatientForm] = useState<any>(null);
  const [selectedAtlasId, setSelectedAtlasId] = useState<string | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textOverride?: string, analysis?: ScoredSyndrome[], patientData?: any) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || isLoading) return;

    setIsLoading(true);
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    const botMsgId = (Date.now() + 1).toString();
    const loadingText = appLanguage === Language.ENGLISH ? "Analyzing meridian patterns and syndromes..." : "Menganalisis pola meridian dan sindrom...";
    setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: loadingText, timestamp: new Date() }]);

    try {
      const response = await sendMessageToGeminiStream(textToSend, undefined, messages, appLanguage, false, analysis || cdssResults);
      
      setMessages(prev => prev.map(m => m.id === botMsgId ? { 
        ...m, 
        text: response.conversationalResponse || "Analysis Complete.", 
        tcmResult: response.diagnosis 
      } : m));

      // Save to database if this was triggered by a patient form submission
      if (patientData && response.diagnosis) {
        await db.patients.add({
          id: Date.now().toString(),
          patientName: patientData.patientName || 'Unknown',
          age: patientData.age || '',
          sex: patientData.sex || '',
          phone: patientData.phone || '',
          email: patientData.email || '',
          address: patientData.address || '',
          complaint: patientData.complaint || '',
          symptoms: patientData.symptoms || '',
          selectedSymptoms: patientData.selectedSymptoms || [],
          tongue: patientData.tongue || {},
          pulse: patientData.pulse || {},
          diagnosis: response.diagnosis,
          timestamp: Date.now(),
          medicalHistory: patientData.medicalHistory || '',
          biomedicalDiagnosis: patientData.biomedicalDiagnosis || '',
          icd10: patientData.icd10 || ''
        });
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = appLanguage === Language.ENGLISH ? "Failed to process data. Please check your API connection." : "Gagal memproses data. Mohon periksa koneksi API Anda.";
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: errorMsg, isError: true } : m));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (data: any) => {
    setLastPatientForm(data);
    const results = analyzePatient({ symptoms: data.symptoms, tongue: data.tongue, pulse: data.pulse });
    setCdssResults(results);
    setActivePanel('chat');
    const msg = `PATIENT: ${data.patientName}, AGE: ${data.age}, SEX: ${data.sex}, PHONE: ${data.phone || 'N/A'}, EMAIL: ${data.email || 'N/A'}. COMPLAINT: ${data.complaint}. TONGUE: ${data.tongue.body_color}, Coat: ${data.tongue.coating_color} (${data.tongue.coating_quality}). PULSE: ${data.pulse.qualities.join(', ')}`;
    handleSendMessage(msg, results, data);
  };

  const toggleLanguage = () => {
    setAppLanguage(prev => prev === Language.INDONESIAN ? Language.ENGLISH : Language.INDONESIAN);
  };

  const handleAtlasSelect = (id: string) => {
    setSelectedAtlasId(id);
    setActivePanel('diagnosis');
  };

  if (!currentUser) return <LoginScreen onLoginSuccess={setCurrentUser} />;

  const SidebarTab = ({ id, label, icon: Icon, activeClass }: { id: typeof activePanel, label: string, icon: any, activeClass: string }) => {
    const isActive = activePanel === id;
    return (
      <button 
        onClick={() => {setActivePanel(id); setIsSidebarOpen(false);}} 
        className={`w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-black transition-all duration-200 border-l-4 ${
          isActive 
          ? `${activeClass} border-white/20 text-white shadow-2xl translate-x-1` 
          : 'bg-transparent border-l-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300'
        }`}
      >
        <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : ''}`} /> 
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <PatientFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleFormSubmit} />
      <WuXingVisualizerModal isOpen={isVisualizerOpen} onClose={() => setIsVisualizerOpen(false)} />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-8 flex justify-between items-center border-b border-slate-800">
           <h1 className="text-2xl font-black text-tcm-primary flex items-center gap-2 tracking-tighter"><Activity className="w-8 h-8" /> TCM PRO</h1>
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white"><X /></button>
        </div>
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-hide">
           <SidebarTab id="chat" label={appLanguage === Language.ENGLISH ? "Diagnostic Chat" : "Chat Diagnosa"} icon={MessageSquare} activeClass="bg-indigo-600 shadow-indigo-900/60" />
           <SidebarTab id="diagnosis" label="CDSS Auto-Rx" icon={Stethoscope} activeClass="bg-emerald-600 shadow-emerald-900/60" />
           <SidebarTab id="atlas" label="Atlas Sindrom" icon={LayoutGrid} activeClass="bg-amber-600 shadow-amber-900/60" />
           <SidebarTab id="wuxing" label="Wu Xing Master" icon={Compass} activeClass="bg-rose-600 shadow-rose-900/60" />
           <SidebarTab id="archive" label={appLanguage === Language.ENGLISH ? "Patient Archive" : "Arsip Pasien"} icon={Archive} activeClass="bg-slate-700 shadow-slate-950" />
        </nav>
        <div className="p-6 pb-24 md:pb-6 border-t border-slate-800">
           <button onClick={() => setIsFormOpen(true)} className="w-full py-5 bg-gradient-to-br from-emerald-400 to-tcm-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-2xl shadow-emerald-900/40 active:scale-95 flex items-center justify-center gap-2">
             <ClipboardList className="w-4 h-4" /> {appLanguage === Language.ENGLISH ? "New Patient Intake" : "Input Pasien Baru"}
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
        {/* Top Header with Language Toggle */}
        <header className="p-4 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center backdrop-blur-md">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-slate-800 rounded-lg text-white"><Menu className="w-5 h-5" /></button>
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Online</span>
             </div>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all active:scale-95 group shadow-lg"
              >
                <Globe className="w-4 h-4 text-tcm-primary group-hover:rotate-12 transition-transform" />
                <span className="text-xs font-black uppercase tracking-tighter">
                  {appLanguage === Language.ENGLISH ? "EN" : "ID"}
                </span>
              </button>
              <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full border border-slate-600 flex items-center justify-center shadow-inner">
                 <User className="w-5 h-5 text-slate-400" />
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)]">
          {activePanel === 'chat' && (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className="max-w-[95%] md:max-w-[85%]">
                    <div className={`p-5 rounded-3xl text-sm leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                    {msg.tcmResult && (
                      <DiagnosisCard 
                        diagnosis={msg.tcmResult} 
                        isPregnant={false} 
                        onShowVisualizer={() => setIsVisualizerOpen(true)} 
                        patientContext={lastPatientForm} 
                      />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl rounded-tl-none flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-tcm-primary animate-spin" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {appLanguage === Language.ENGLISH ? "EXPERT IS ANALYZING..." : "PAKAR SEDANG MENGANALISIS..."}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
          {activePanel === 'diagnosis' && (
            <ScoringAndPointsHub 
              analysis={cdssResults} 
              onAnalyzeRequest={() => setIsFormOpen(true)} 
              patientContext={lastPatientForm} 
              initialSyndromeId={selectedAtlasId}
            />
          )}
          {activePanel === 'atlas' && (
            <SyndromeAtlasWindow onSelectSyndrome={handleAtlasSelect} />
          )}
          {activePanel === 'wuxing' && <WuXingMasterPanel />}
          {activePanel === 'archive' && (
            <PatientArchivePanel 
              onLoadPatient={(p) => { 
                setLastPatientForm(p);
                setCdssResults([{syndrome: p.diagnosis as any, score: 100, points: [], warnings: [], rationale: [p.diagnosis.explanation]}]); 
                setActivePanel('chat'); 
              }} 
            />
          )}
        </main>

        {activePanel === 'chat' && (
          <div className="p-4 md:p-6 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800">
            <div className="max-w-4xl mx-auto flex gap-3">
              <input 
                value={inputText} 
                onChange={e => setInputText(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
                placeholder={appLanguage === Language.ENGLISH ? "Enter patient complaints or TCM questions..." : "Masukkan keluhan pasien atau pertanyaan TCM..."} 
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-tcm-primary transition-all text-sm text-white shadow-inner" 
              />
              <button 
                onClick={() => handleSendMessage()} 
                disabled={isLoading || !inputText.trim()}
                className="p-4 bg-tcm-primary text-white rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50 disabled:grayscale"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
