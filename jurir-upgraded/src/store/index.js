import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useStore = create(
  subscribeWithSelector((set, get) => ({
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
    tribunal:        null,
    statusMessage:   null,
    devilDone:   false,
    judgeDone:   false,
    devilRunning: false,

    resetAnalysis: () => set({
      analysisId: null, agentStates: {}, completedAgents: 0,
      verdictText: '', devilText: '', jurirScore: null,
      scoreDims: null, vetoActive: false, running: false,
      freeResult: null, deltaResult: null, statusMessage: null, tribunal: null,
      devilDone: false, judgeDone: false, devilRunning: false,
    }),

    setAgentState: (id, data) => set(s => ({
      agentStates: {
        ...s.agentStates,
        [id]: { ...(s.agentStates[id] || {}), ...data },
      },
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
    setDeltaResult:     (r)           => set({ deltaResult: r }),
    setTribunal:        (t)           => set({ tribunal: t }),
    setAnalysisId:      (id)          => set({ analysisId: id }),

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
  }))
);
