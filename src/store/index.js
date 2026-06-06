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
  mode: 'premium',  // [FIX] default premium — SSE com veredito completo
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
  tribunal:        null,
  // [FIX] Mensagem de status para cooldown/recovery — evita 0/16 parado sem feedback
  statusMessage:   null,

  resetAnalysis: () => set({
    analysisId: null, agentStates: {}, completedAgents: 0,
    verdictText: '', devilText: '', jurirScore: null,
    scoreDims: null, vetoActive: false, running: false,
    freeResult: null, deltaResult: null, statusMessage: null, tribunal: null,
  }),

  setAgentState: (id, data) => set(s => ({
    agentStates: {
      ...s.agentStates,
      [id]: { ...(s.agentStates[id] || {}), ...data },
    },
  })),
  incrementCompleted: ()              => set(s => ({ completedAgents: s.completedAgents + 1 })),
  setVerdict:         (text)          => set({ verdictText: text }),
  setDevil:           (text)          => set({ devilText: text }),
  setScore:           (score, dims)   => set({ jurirScore: score, scoreDims: dims }),
  setVeto:            (v)             => set({ vetoActive: v }),
  setRunning:         (v)             => set({ running: v }),
  // [FIX] statusMessage para cooldown/recovery — limpar ao receber primeiro agent_thinking
  setStatusMessage:   (msg)           => set({ statusMessage: msg }),
  // [FIX] Prioridade corrigida: veredito (juiz) > free_analysis (agente preview)
  setFreeResult: (r) => set({ freeResult: {
    ...r,
    agent_area: r.area_especialista || r.agent_area,
    // veredito é o resultado do Juiz IA — mais completo que free_analysis (preview 500 chars)
    analysis: r.veredito || r.free_analysis || r.analysis,
  }}),
  setDeltaResult:     (r)             => set({ deltaResult: r }),
  setTribunal:        (t)             => set({ tribunal: t }),
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
