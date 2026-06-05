import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // ── Auth ──
  authToken: localStorage.getItem('jurir_token') || null,
  userData:  JSON.parse(localStorage.getItem('jurir_user') || 'null'),

  setAuth: (token, user) => {
    localStorage.setItem('jurir_token', token);
    localStorage.setItem('jurir_user', JSON.stringify(user));
    set({ authToken: token, userData: user });
  },
  clearAuth: () => {
    localStorage.removeItem('jurir_token');
    localStorage.removeItem('jurir_user');
    set({ authToken: null, userData: null });
  },

  // ── UI ──
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

  // ── Analysis ──
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

  resetAnalysis: () => set({
    analysisId: null, agentStates: {}, completedAgents: 0,
    verdictText: '', devilText: '', jurirScore: null,
    scoreDims: null, vetoActive: false, running: false,
    freeResult: null, deltaResult: null,
  }),

  setAgentState:      (id, data)      => set(s => ({ agentStates: { ...s.agentStates, [id]: data } })),
  incrementCompleted: ()              => set(s => ({ completedAgents: s.completedAgents + 1 })),
  setVerdict:         (text)          => set({ verdictText: text }),
  setDevil:           (text)          => set({ devilText: text }),
  setScore:           (score, dims)   => set({ jurirScore: score, scoreDims: dims }),
  setVeto:            (v)             => set({ vetoActive: v }),
  setRunning:         (v)             => set({ running: v }),
  setFreeResult:      (r)             => set({ freeResult: {
    ...r,
    // Normaliza os campos do backend (veredito/free_analysis/area_especialista)
    // para os nomes esperados pelo frontend (analysis/agent_area)
    agent_area: r.area_especialista || r.agent_area,
    analysis:   r.free_analysis     || r.analysis || r.veredito,
  }}),
  setDeltaResult:     (r)             => set({ deltaResult: r }),
  setAnalysisId:      (id)            => set({ analysisId: id }),

  // ── Delta ──
  deltaLoading: false,
  setDeltaLoading: (v) => set({ deltaLoading: v }),

  // ── Documento ──
  docResult:    null,
  docLoading:   false,
  setDocResult: (r) => set({ docResult: r }),
  setDocLoading:(v) => set({ docLoading: v }),

  // ── Simulador ──
  simResult:    null,
  simLoading:   false,
  setSimResult: (r) => set({ simResult: r }),
  setSimLoading:(v) => set({ simLoading: v }),

  // ── Monitoramento ──
  monitored:    [],
  setMonitored: (list) => set({ monitored: list }),
}));
