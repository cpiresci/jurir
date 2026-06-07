import re

path = 'src/components/AgentsSection.jsx'
src = open(path, encoding='utf-8').read()

# Novo bloco do PROCESS FLOW completo (substitui desde "/* ── PROCESS FLOW ULTRA ── */" até o final do return)
NEW_FLOW = r"""
        {/* ── PROCESS FLOW ULTRA ── */}
        <div>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-label" style={{ marginBottom:14 }}>Processo de Análise Quântica</div>
            <h3 className="t-display" style={{
              fontSize:'clamp(1.5rem, 2.5vw, 2.0rem)', fontWeight:300, color:'var(--t0)',
              letterSpacing:'-.02em',
            }}>
              Como o tribunal funciona
            </h3>
          </div>

          {/* Desktop: horizontal | Mobile: vertical stack */}
          <style>{`
            .flow-grid {
              display: flex;
              align-items: flex-start;
              gap: 0;
            }
            .flow-item {
              display: flex;
              align-items: flex-start;
              min-width: 0;
              flex: 1;
            }
            .flow-card {
              display: flex;
              flex-direction: column;
              align-items: center;
              flex: 1;
              min-width: 140px;
              padding: 0 10px;
              text-align: center;
            }
            .flow-connector {
              padding-top: 26px;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              gap: 2px;
            }
            @media (max-width: 700px) {
              .flow-grid {
                flex-direction: column;
                gap: 0;
              }
              .flow-item {
                flex-direction: column;
                align-items: stretch;
                width: 100%;
              }
              .flow-card {
                flex-direction: row !important;
                text-align: left !important;
                align-items: flex-start !important;
                padding: 18px 16px !important;
                min-width: unset !important;
                background: var(--bg-card);
                border: 1px solid var(--b-cobalt);
                border-radius: var(--r-md);
                gap: 18px;
                margin-bottom: 4px;
              }
              .flow-card-text {
                flex: 1;
              }
              .flow-connector {
                display: none !important;
              }
              .flow-step-circle {
                margin-bottom: 0 !important;
                flex-shrink: 0;
              }
            }
          `}</style>

          <div className="flow-grid">
            {FLOW.map((f, i) => (
              <div key={i} className="flow-item">
                <div className="flow-card">
                  {/* Step circle */}
                  <div className="flow-step-circle" style={{
                    width:52, height:52, borderRadius:'50%',
                    background:'var(--bg-card)',
                    border:'1px solid var(--b-cobalt)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'1.2rem', marginBottom:8,
                    boxShadow:'0 0 0 6px rgba(20,114,217,0.04)',
                    flexShrink:0, position:'relative',
                  }}>
                    {f.icon}
                    <div style={{
                      position:'absolute', top:-4, right:-4,
                      width:18, height:18, borderRadius:'50%',
                      background:'var(--co7)', color:'#fff',
                      fontFamily:'var(--f-mono)', fontSize:'.5rem',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      letterSpacing:'.04em', fontWeight:700,
                    }}>
                      {f.step}
                    </div>
                  </div>

                  <div className="flow-card-text">
                    <div style={{
                      fontSize:'.84rem', fontWeight:700, color:'var(--t0)',
                      marginBottom:7, fontFamily:'var(--f-sans)', letterSpacing:'.01em',
                    }}>
                      {f.label}
                    </div>
                    <div style={{
                      fontSize:'.76rem', color:'var(--t2)', lineHeight:1.65,
                      fontFamily:'var(--f-display)', fontWeight:400, letterSpacing:'.01em',
                    }}>
                      {f.desc}
                    </div>
                  </div>
                </div>

                {/* Connector — hidden on mobile via CSS */}
                {i < FLOW.length - 1 && (
                  <div className="flow-connector">
                    <div style={{ width:12, height:1, background:'var(--co7)', opacity:0.25 }}/>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--co7)', opacity:0.45 }}/>
                    <div style={{ width:12, height:1, background:'var(--co7)', opacity:0.25 }}/>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>"""

# Substituir o bloco PROCESS FLOW no source
# Encontra desde o comentário até o fim da div externa (antes do fechamento do return)
pattern = r'\{/\* ── PROCESS FLOW ULTRA ── \*/\}.*?(?=\s*\</div\>\s*\</section\>)'
new_src = re.sub(pattern, NEW_FLOW.strip(), src, flags=re.DOTALL)

if new_src == src:
    print("❌ Pattern não encontrado — tentando alternativo")
    # Tenta pelo h3 "Como o tribunal funciona"
    pattern2 = r'\{/\* ── PROCESS FLOW ULTRA ── \*/\}[\s\S]+$'
    # Pega desde o comentário até o fim do arquivo e reconstrói
    idx = src.find('{/* ── PROCESS FLOW ULTRA ── */}')
    if idx == -1:
        print("❌ Comentário não encontrado no arquivo")
        exit(1)
    # Fecha a div do process flow + div do maxWidth + section
    closing = '\n      </div>\n    </section>\n  );\n}'
    new_src = src[:idx] + NEW_FLOW.strip() + closing
    print(f"✅ Substituído via índice (fallback)")
else:
    print("✅ Pattern encontrado e substituído")

open(path, 'w', encoding='utf-8').write(new_src)
print(f"✅ {path} salvo ({len(new_src)} chars)")
print("TUDO OK")
