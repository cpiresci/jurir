import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // ── Auth ──
  authToken: localStorage.getItem('jurir_token') || null,
  userData: JSON.parse(localStorage.getItem('jurir_user') || 'null'),

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
  addToast: (msg, type = 'info') => {
    const id = Date.now();
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000);
  },

  // ── Analysis ──
  analysisId: null,
  agentStates: {},
  completedAgents: 0,
  verdictText: '',
  devilText: '',
  jurirScore: null,
  scoreDims: null,
  vetoActive: false,
  running: false,
  freeResult: null,
  deltaResult: null,

  resetAnalysis: () => set({
    analysisId: null, agentStates: {}, completedAgents: 0,
    verdictText: '', devilText: '', jurirScore: null,
    scoreDims: null, vetoActive: false, running: false,
    freeResult: null, deltaResult: null,
  }),

  setAgentState: (id, data) => set(s => ({
    agentStates: { ...s.agentStates, [id]: data },
  })),

  incrementCompleted: () => set(s => ({ completedAgents: s.completedAgents + 1 })),

  setVerdict:     (text)        => set({ verdictText: text }),
  setDevil:       (text)        => set({ devilText: text }),
  setScore:       (score, dims) => set({ jurirScore: score, scoreDims: dims }),
  setVeto:        (v)           => set({ vetoActive: v }),
  setRunning:     (v)           => set({ running: v }),
  setFreeResult:  (r)           => set({ freeResult: r }),
  setDeltaResult: (r)           => set({ deltaResult: r }),
  setAnalysisId:  (id)          => set({ analysisId: id }),
}));
