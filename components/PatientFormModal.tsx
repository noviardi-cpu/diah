
import React, { useState, useEffect } from 'react';
import { X, Save, Activity, ThermometerSnowflake, User, Stethoscope, Pill, Calendar, Search, UserCheck, ChevronRight, Tag, Info, AlertCircle, Clipboard, History, ShieldAlert, FileText, Phone, Mail } from 'lucide-react';
import { db } from '../services/db';
import { SavedPatient } from '../types';

interface PatientData {
  patientName: string;
  age: string;
  sex: string;
  phone: string;
  email: string;
  address: string;
  complaint: string;
  symptoms: string;
  selectedSymptoms: string[];
  isAcuteMode: boolean;
  
  medicalHistory: string;
  biomedicalDiagnosis: string;
  icd10: string;
  medications: string;
  followUpDate: string;
  notes: string;

  tongue: {
    body_color: string;
    coating_color: string;
    coating_quality: string;
    special_features: string[];
  };
  pulse: {
    qualities: string[];
  };
}

const TONGUE_BODY_COLORS = ['Normal (Pink)', 'Pale', 'Red', 'Deep Red', 'Purple/Bluish', 'Orange-Red (Heat)'];
const TONGUE_COAT_COLORS = ['White', 'Yellow', 'Grey', 'Black', 'None (Rootless)'];
const TONGUE_COAT_QUALITIES = ['Thin', 'Thick', 'Dry', 'Wet/Moist', 'Greasy/Sticky', 'Peeled/Map', 'Curdy'];
const TONGUE_FEATURES = ['Teeth Marks', 'Cracks (Center)', 'Cracks (Sides)', 'Red Points/Spots', 'Swollen', 'Deviated', 'Short/Contracted', 'Quivering', 'Ulcerated'];

const PULSE_QUALITIES = [
  'Floating', 'Deep', 'Slow', 'Rapid', 'Empty/Deficient', 'Full/Excess', 
  'Slippery', 'Wiry', 'Tight', 'Thready/Fine', 'Knotted', 'Intermittent', 'Choppy', 'Hasty'
];

const SYMPTOM_GROUPS = [
  {
    category: "General/Qi",
    items: ['Mudah Lelah', 'Kedinginan', 'Haus Berlebih', 'Berkeringat Malam', 'Keringat Spontan', 'Lemas']
  },
  {
    category: "Head/Mind",
    items: ['Pusing/Dizziness', 'Nyeri Kepala', 'Insomnia', 'Mimpi Banyak', 'Mudah Marah', 'Pelupa']
  },
  {
    category: "Chest/Heart",
    items: ['Palpitasi', 'Napas Pendek', 'Nyeri Dada', 'Sesak Napas', 'Batuk Kering']
  },
  {
    category: "Digestive/Earth",
    items: ['Kembung', 'Mual/Muntah', 'Diare', 'Sembelit', 'Nafsu Makan Turun']
  },
  {
    category: "Lower/Water",
    items: ['Nyeri Punggung', 'Nyeri Lutut', 'Urinitas Sering', 'Urinitas Sedikit']
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientData) => void;
}

const PatientFormModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [storedPatients, setStoredPatients] = useState<SavedPatient[]>([]);
  const [showLookup, setShowLookup] = useState(false);
  const [lookupSearch, setLookupSearch] = useState('');
  
  const [formData, setFormData] = useState<PatientData>({
    patientName: '',
    age: '',
    sex: 'male',
    phone: '',
    email: '',
    address: '',
    complaint: '',
    symptoms: '',
    selectedSymptoms: [],
    isAcuteMode: false,
    medicalHistory: '',
    biomedicalDiagnosis: '',
    icd10: '',
    medications: '',
    followUpDate: '',
    notes: '',
    tongue: {
      body_color: 'Normal (Pink)',
      coating_color: 'White',
      coating_quality: 'Thin',
      special_features: []
    },
    pulse: {
      qualities: []
    }
  });

  useEffect(() => {
    if (isOpen) {
      const loadPatients = async () => {
        const patients = await db.patients.getAll();
        setStoredPatients(patients);
      };
      loadPatients();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleSelectExisting = (p: SavedPatient) => {
    setFormData({
      patientName: p.patientName,
      age: p.age,
      sex: p.sex as any,
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      complaint: p.complaint,
      symptoms: p.symptoms,
      selectedSymptoms: p.selectedSymptoms || [],
      isAcuteMode: false,
      medicalHistory: p.medicalHistory || '',
      biomedicalDiagnosis: p.biomedicalDiagnosis || '',
      icd10: p.icd10 || '',
      medications: p.medications || '',
      followUpDate: p.followUpDate || '',
      notes: p.notes || '',
      tongue: {
        body_color: p.tongue?.body_color || 'Normal (Pink)',
        coating_color: p.tongue?.coating_color || 'White',
        coating_quality: p.tongue?.coating_quality || 'Thin',
        special_features: p.tongue?.special_features || []
      },
      pulse: {
        qualities: p.pulse?.qualities || []
      }
    });
    setShowLookup(false);
  };

  const toggleSymptom = (symptom: string) => {
    const current = formData.selectedSymptoms;
    const updated = current.includes(symptom)
      ? current.filter(s => s !== symptom)
      : [...current, symptom];
    setFormData({ ...formData, selectedSymptoms: updated });
  };

  const toggleTongueFeature = (feature: string) => {
    const current = formData.tongue.special_features;
    const updated = current.includes(feature)
      ? current.filter(f => f !== feature)
      : [...current, feature];
    setFormData({ ...formData, tongue: { ...formData.tongue, special_features: updated } });
  };

  const togglePulseQuality = (quality: string) => {
    const current = formData.pulse.qualities;
    const updated = current.includes(quality)
      ? current.filter(q => q !== quality)
      : [...current, quality];
    setFormData({ ...formData, pulse: { ...formData.pulse, qualities: updated } });
  };

  const filteredStored = storedPatients.filter(p => 
    p.patientName.toLowerCase().includes(lookupSearch.toLowerCase()) ||
    (p.biomedicalDiagnosis && p.biomedicalDiagnosis.toLowerCase().includes(lookupSearch.toLowerCase()))
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pink-600/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-pink-800 border border-pink-400 w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between p-6 border-b border-pink-400 sticky top-0 bg-pink-800 z-20">
          <div className="flex items-center gap-2">
             <Activity className="w-5 h-5 text-tcm-primary" />
             <h2 className="text-xl font-black text-white uppercase tracking-tighter">Clinical Intake</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
                type="button"
                onClick={() => setShowLookup(!showLookup)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-700 hover:bg-pink-600 text-white rounded-xl text-xs font-black transition-all border border-pink-400 shadow-lg"
            >
                <Search className="w-3.5 h-3.5" /> {showLookup ? 'CLOSE' : 'LOOKUP'}
            </button>
            <button onClick={onClose} className="text-white hover:text-white transition-colors">
                <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {showLookup && (
            <div className="p-4 bg-pink-900 border-b border-pink-400 animate-fade-in">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                    <input 
                        type="text" 
                        placeholder="Search existing patients..."
                        className="w-full bg-pink-800 border border-pink-400 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-tcm-primary outline-none"
                        value={lookupSearch}
                        onChange={(e) => setLookupSearch(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    {filteredStored.map(p => (
                        <button 
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectExisting(p)}
                            className="w-full text-left p-4 rounded-xl bg-pink-800 border border-pink-400 hover:border-tcm-primary flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-700 rounded-lg text-white group-hover:text-tcm-primary">
                                    <UserCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-white">{p.patientName}</span>
                                    <span className="text-[10px] text-white uppercase font-black">{p.age} th • {p.biomedicalDiagnosis || 'General'}</span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white group-hover:text-tcm-primary" />
                        </button>
                    ))}
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* Identity Section */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-[0.3em] border-b border-pink-400 pb-2">I. Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-[10px] font-black text-white uppercase mb-1 ml-1 tracking-widest">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                        <input 
                            type="text" 
                            className="w-full bg-pink-900 border border-pink-400 rounded-xl pl-10 pr-3 py-3 text-white focus:border-tcm-primary outline-none transition-all shadow-inner"
                            value={formData.patientName}
                            onChange={e => setFormData({...formData, patientName: e.target.value})}
                            placeholder="Patient name"
                            required
                        />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-[10px] font-black text-white uppercase mb-1 ml-1 tracking-widest">Age</label>
                        <input 
                            type="number" 
                            className="w-full bg-pink-900 border border-pink-400 rounded-xl px-3 py-3 text-white focus:border-tcm-primary outline-none shadow-inner"
                            value={formData.age}
                            onChange={e => setFormData({...formData, age: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-white uppercase mb-1 ml-1 tracking-widest">Sex</label>
                        <select 
                            className="w-full bg-pink-900 border border-pink-400 rounded-xl px-3 py-3 text-white focus:border-tcm-primary outline-none shadow-inner"
                            value={formData.sex}
                            onChange={e => setFormData({...formData, sex: e.target.value})}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-[10px] font-black text-white uppercase mb-1 ml-1 tracking-widest">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                        <input 
                            type="tel" 
                            className="w-full bg-pink-900 border border-pink-400 rounded-xl pl-10 pr-3 py-3 text-white focus:border-tcm-primary outline-none shadow-inner"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            placeholder="+62..."
                        />
                      </div>
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-white uppercase mb-1 ml-1 tracking-widest">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                        <input 
                            type="email" 
                            className="w-full bg-pink-900 border border-pink-400 rounded-xl pl-10 pr-3 py-3 text-white focus:border-tcm-primary outline-none shadow-inner"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="patient@example.com"
                        />
                      </div>
                  </div>
              </div>
            </div>

            {/* Tongue Diagnosis - Detailed */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-tcm-primary uppercase tracking-[0.3em] border-b border-pink-400 pb-2">II. Tongue Diagnosis Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-[10px] font-black text-white uppercase mb-2 ml-1 tracking-widest">Body Color</label>
                    <div className="space-y-2">
                       {TONGUE_BODY_COLORS.map(color => (
                         <button 
                            key={color} type="button" 
                            onClick={() => setFormData({...formData, tongue: {...formData.tongue, body_color: color}})}
                            className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                               formData.tongue.body_color === color 
                               ? 'bg-tcm-primary/20 border-tcm-primary text-tcm-primary' 
                               : 'bg-pink-900 border-pink-400 text-white'
                            }`}
                         >
                            {color}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-white uppercase mb-2 ml-1 tracking-widest">Coat Properties</label>
                    <div className="space-y-4">
                       <div>
                          <span className="block text-[8px] font-black text-white uppercase mb-2">Color</span>
                          <select 
                             className="w-full bg-pink-900 border border-pink-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                             value={formData.tongue.coating_color}
                             onChange={e => setFormData({...formData, tongue: {...formData.tongue, coating_color: e.target.value}})}
                          >
                             {TONGUE_COAT_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                       <div>
                          <span className="block text-[8px] font-black text-white uppercase mb-2">Quality</span>
                          <select 
                             className="w-full bg-pink-900 border border-pink-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                             value={formData.tongue.coating_quality}
                             onChange={e => setFormData({...formData, tongue: {...formData.tongue, coating_quality: e.target.value}})}
                          >
                             {TONGUE_COAT_QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
                          </select>
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-white uppercase mb-2 ml-1 tracking-widest">Special Features</label>
                    <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[180px] pr-2 scrollbar-hide">
                       {TONGUE_FEATURES.map(feat => (
                         <button 
                            key={feat} type="button" 
                            onClick={() => toggleTongueFeature(feat)}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-bold border transition-all ${
                               formData.tongue.special_features.includes(feat) 
                               ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
                               : 'bg-pink-900 border-pink-400 text-white'
                            }`}
                         >
                            {feat}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* Pulse Diagnosis */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] border-b border-pink-400 pb-2">III. Pulse Diagnosis</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                 {PULSE_QUALITIES.map(q => (
                    <button 
                      key={q} type="button" 
                      onClick={() => togglePulseQuality(q)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${
                        formData.pulse.qualities.includes(q) 
                        ? 'bg-pink-600 border-pink-400 text-white' 
                        : 'bg-pink-900 border-pink-400 text-white'
                      }`}
                    >
                      {q}
                    </button>
                 ))}
              </div>
            </div>

            {/* Complaints & Detailed History */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] border-b border-pink-400 pb-2">IV. Clinical Complaints</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black text-white uppercase mb-2 ml-1 tracking-widest">Chief Complaint</label>
                    <textarea 
                       className="w-full bg-pink-950 border border-pink-400 rounded-2xl px-5 py-4 text-sm text-white focus:border-tcm-primary outline-none h-24 resize-none shadow-inner"
                       value={formData.complaint}
                       onChange={e => setFormData({...formData, complaint: e.target.value})}
                       placeholder="What is the patient's main concern?"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-[10px] font-black text-white uppercase mb-2 ml-1 tracking-widest">Symptom Checklist (Shortcut)</label>
                    <div className="flex flex-wrap gap-2">
                       {SYMPTOM_GROUPS.flatMap(g => g.items).slice(0, 15).map(s => (
                         <button 
                            key={s} type="button" 
                            onClick={() => toggleSymptom(s)}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-bold border transition-all ${
                               formData.selectedSymptoms.includes(s) 
                               ? 'bg-fuchsia-600 border-fuchsia-500 text-white' 
                               : 'bg-pink-900 border-pink-400 text-white'
                            }`}
                         >
                            {s}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 flex justify-end gap-4 border-t border-pink-400 sticky bottom-0 bg-pink-800 py-6 z-10">
                <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl text-white hover:text-white text-xs font-black uppercase tracking-widest transition-all">Cancel</button>
                <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-tcm-primary text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-pink-900/40 text-xs uppercase tracking-widest transition-all active:scale-95">
                    <Save className="w-5 h-5" /> Start AI Analysis
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default PatientFormModal;
