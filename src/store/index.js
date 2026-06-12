import { create } from 'zustand';

const ls = (k, fallback = null) => {
  try { const v = localStorage.getItem(k); return v !== null ? v : fallback; }
  catch { return fallback; }
};
const lsParse = (k) => {
  try { return JSON.parse(localStorage.getItem(k) || 'null'); }
  catch { return null; }
};

export const useStore = create((set, get) => ({
  authToken: ls('jurir_token'),
  userData:  lsParse('jurir_user'),

  setAuth: (token, user) => {
    try { localStorage.setItem('jurir_token', token); localStorage.setItem('jurir_user', JSON.stringify(user)); } catch {}
    set({ authToken: token, userData: user });
  },
  clearAuth: () => {
    try { localStorage.removeItem('jurir_token'); localStorage.removeItem('jurir_user'); } catch {}
    set({ authToken: null, userData: null });
  },

  mode: 'free',
  setMode: (mode) => set({ mode }),
  modalOpen: null,
  openModal:  (tab) => set({ modalOpen: tab }),
  closeModal: ()    => set({ modalOpen: null }),

  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Date.now();
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  analysisId:      null,
  agentStates:     {},
  completedAgents: 0,
  verdictText:     '',
  devilText:       '',
  jurirScore:      null,
  scoreDims:       null,
  vetoActive:      false,
  running:         false,
  freeResult:      null,
  deltaResult:     null,
  tribunal:        null,
  statusMessage:   null,
  devilDone:       false,
  judgeDone:       false,
  devilRunning:    false,

  resetAnalysis: () => set({
    analysisId: null, agentStates: {}, completedAgents: 0,
    verdictText: '', devilText: '', jurirScore: null,
    scoreDims: null, vetoActive: false, running: false,
    freeResult: null, deltaResult: null, statusMessage: null, tribunal: null,
    devilDone: false, judgeDone: false, devilRunning: false,
  }),

  setAgentState: (id, data) => set(s => ({
    agentStates: { ...s.agentStates, [id]: { ...(s.agentStates[id] || {}), ...data } },
  })),
  incrementCompleted: ()            => set(s => ({ completedAgents: s.completedAgents + 1 })),
  setVerdict:         (text)        => set({ verdictText: text, judgeDone: true }),
  setDevil:           (text)        => set(s => ({
    devilText: text,
    devilDone: text && !text.startsWith('⚔️ Advogado do Diabo analisando'),
    devilRunning: text && text.startsWith('⚔️ Advogado do Diabo analisando'),
  })),
  setDevilDone:       (text)        => set({ devilText: text, devilDone: true, devilRunning: false }),
  setScore:           (score, dims) => set({ jurirScore: score, scoreDims: dims }),
  setVeto:            (v)           => set({ vetoActive: v }),
  setRunning:         (v)           => set({ running: v }),
  setStatusMessage:   (msg)         => set({ statusMessage: msg }),
  setFreeResult: (r) => set({ freeResult: {
    ...r,
    agent_area: r.area_especialista || r.agent_area,
    analysis: r.veredito || r.free_analysis || r.analysis,
  }}),
  setDeltaResult:  (r)  => set({ deltaResult: r }),
  setTribunal:     (t)  => set({ tribunal: t }),
  setAnalysisId:   (id) => set({ analysisId: id }),

  deltaLoading: false,
  setDeltaLoading: (v) => set({ deltaLoading: v }),
  docResult: null, docLoading: false,
  setDocResult: (r) => set({ docResult: r }),
  setDocLoading: (v) => set({ docLoading: v }),
  simResult: null, simLoading: false,
  setSimResult: (r) => set({ simResult: r }),
  setSimLoading: (v) => set({ simLoading: v }),
  monitored: [],
  setMonitored: (list) => set({ monitored: list }),
}));
