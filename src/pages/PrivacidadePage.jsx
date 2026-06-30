import { Shield, Lock, Eye, Database, UserCheck, Mail, Trash2, Globe, AlertTriangle, ChevronRight } from 'lucide-react';

const LAST_UPDATE = '09 de junho de 2026';
const CONTACT_EMAIL = 'privacidade@jurir.com';
const APP_NAME = 'JURIR';

const sections = [
  {
    id: 'coleta',
    icon: <Database size={18} />,
    title: 'Dados que Coletamos',
    color: 'var(--co7)',
    bg: 'rgba(0,242,254,0.06)',
    border: 'var(--b-cobalt)',
    content: [
      {
        subtitle: 'Dados fornecidos por você',
        items: [
          'Nome completo e endereço de e-mail (cadastro e autenticação)',
          'Textos e documentos jurídicos submetidos para análise',
          'Histórico de consultas e análises realizadas na plataforma',
          'Dados de pagamento processados de forma segura via Stripe (não armazenamos dados de cartão)',
        ],
      },
      {
        subtitle: 'Dados coletados automaticamente',
        items: [
          'Endereço IP e identificadores de dispositivo (para segurança e prevenção de fraude)',
          'Logs de acesso: datas, horários e funcionalidades utilizadas',
          'Tipo de dispositivo, sistema operacional e versão do aplicativo',
          'Identificador de instalação do aplicativo Android (não vinculado à identidade pessoal)',
        ],
      },
    ],
  },
  {
    id: 'uso',
    icon: <Eye size={18} />,
    title: 'Como Usamos seus Dados',
    color: 'var(--au6)',
    bg: 'rgba(212,168,0,0.06)',
    border: 'var(--b-gold)',
    items: [
      'Executar as análises jurídicas solicitadas por meio dos agentes de IA',
      'Autenticar sua conta e manter a segurança da sessão',
      'Processar assinaturas e pagamentos do plano Premium',
      'Gerar relatórios PDF identificados com serial de autenticidade',
      'Melhorar a qualidade dos modelos e da plataforma (dados anonimizados)',
      'Enviar notificações transacionais essenciais (conclusão de análise, fatura)',
      'Cumprir obrigações legais e responder a requisições judiciais legítimas',
    ],
  },
  {
    id: 'ia',
    icon: <Globe size={18} />,
    title: 'Processamento por Inteligência Artificial',
    color: 'var(--am4)',
    bg: 'rgba(139,92,246,0.06)',
    border: 'var(--b-am)',
    content: [
      {
        subtitle: 'Provedores de LLM utilizados',
        items: [
          'SambaNova AI — processamento primário dos agentes jurídicos',
          'Cerebras — análise de alta velocidade',
          'Google Gemini — contexto e síntese',
          'OpenRouter — roteamento e fallback de modelos',
        ],
      },
      {
        subtitle: 'Importante sobre seus documentos',
        items: [
          'Os textos enviados são transmitidos aos provedores acima exclusivamente para gerar a análise solicitada',
          'Não utilizamos seus dados para treinar modelos de IA próprios',
          'Recomendamos não enviar dados pessoais sensíveis desnecessários (CPF, RG, dados bancários de terceiros) nos textos analisados',
          'Cada provedor possui sua própria política de retenção de dados de API — consulte os links ao final desta página',
        ],
      },
    ],
  },
  {
    id: 'compartilhamento',
    icon: <UserCheck size={18} />,
    title: 'Compartilhamento de Dados',
    color: 'var(--jade2)',
    bg: 'rgba(16,185,129,0.06)',
    border: 'var(--b-jade)',
    items: [
      'NÃO vendemos seus dados pessoais a terceiros, jamais',
      'NÃO compartilhamos dados com fins publicitários ou de marketing externo',
      'Compartilhamos apenas com os provedores de IA acima, para execução do serviço',
      'Stripe recebe os dados de pagamento necessários ao processamento da assinatura',
      'Render.com hospeda o backend — dados trafegam por infraestrutura segura com TLS',
      'Autoridades competentes: cumprimos determinações judiciais legalmente fundamentadas',
    ],
  },
  {
    id: 'retencao',
    icon: <Trash2 size={18} />,
    title: 'Retenção e Exclusão',
    color: 'var(--cr4)',
    bg: 'rgba(220,38,38,0.06)',
    border: 'rgba(220,38,38,0.18)',
    items: [
      'Dados de conta: mantidos enquanto a conta estiver ativa',
      'Histórico de análises: 12 meses após a realização, salvo retenção legal obrigatória',
      'Logs de acesso: 90 dias para fins de segurança',
      'Você pode solicitar a exclusão completa da sua conta e dados a qualquer momento pelo e-mail abaixo',
      'Após a solicitação de exclusão, processamos em até 15 dias úteis',
    ],
  },
  {
    id: 'seguranca',
    icon: <Lock size={18} />,
    title: 'Segurança',
    color: 'var(--co8)',
    bg: 'rgba(43,138,245,0.06)',
    border: 'rgba(43,138,245,0.18)',
    items: [
      'Transmissão de dados protegida por TLS/SSL em todas as comunicações',
      'Senhas armazenadas com hash criptográfico (nunca em texto claro)',
      'Tokens de autenticação com expiração automática',
      'Acesso administrativo restrito por autenticação de múltiplos fatores',
      'Relatórios PDF assinados com serial único verificável',
      'Infraestrutura hospedada em ambiente com certificação de segurança (Render.com)',
    ],
  },
];

const rights = [
  { title: 'Acesso', desc: 'Solicitar uma cópia dos seus dados pessoais que mantemos' },
  { title: 'Correção', desc: 'Corrigir informações incorretas ou desatualizadas' },
  { title: 'Exclusão', desc: 'Solicitar a remoção completa dos seus dados ("direito ao esquecimento")' },
  { title: 'Portabilidade', desc: 'Receber seus dados em formato estruturado e legível por máquina' },
  { title: 'Oposição', desc: 'Opor-se ao processamento dos seus dados em determinadas circunstâncias' },
  { title: 'Revogação', desc: 'Revogar consentimentos anteriormente fornecidos' },
];

export default function PrivacidadePage() {
  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '100px 24px 80px', background: '#0a0a0f', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 56 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,242,254,0.06)', border: '1px solid var(--b-cobalt)',
          borderRadius: 'var(--r-pill)', padding: '5px 14px',
          fontSize: '.7rem', color: 'var(--co7)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.12em', marginBottom: 20,
        }}>
          <Shield size={11} /> POLÍTICA DE PRIVACIDADE
        </div>

        <h1 className="t-display" style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700,
          color: 'var(--t0)', letterSpacing: '-.02em', lineHeight: 1.1,
          marginBottom: 16,
        }}>
          Sua privacidade é<br />
          <em style={{ fontStyle: 'italic', color: 'var(--co7)' }}>nossa prioridade</em>
        </h1>

        <p style={{ fontSize: '.95rem', color: 'var(--t3)', lineHeight: 1.8, maxWidth: 600, marginBottom: 24 }}>
          Esta Política de Privacidade descreve como o <strong style={{ color: 'var(--t1)' }}>JURIR</strong> coleta,
          utiliza e protege seus dados pessoais. Leia com atenção antes de utilizar a plataforma.
        </p>

        <div style={{
          display: 'flex', gap: 24, flexWrap: 'wrap',
          fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t5)', letterSpacing: '.08em',
        }}>
          <span>Última atualização: <strong style={{ color: 'var(--t3)' }}>{LAST_UPDATE}</strong></span>
          <span>Versão: <strong style={{ color: 'var(--t3)' }}>2.0</strong></span>
          <span>Jurisdição: <strong style={{ color: 'var(--t3)' }}>Brasil · LGPD (Lei nº 13.709/2018)</strong></span>
        </div>
      </div>

      {/* ── LGPD BANNER ── */}
      <div style={{
        background: 'rgba(20,114,217,0.05)',
        border: '1px solid var(--b-cobalt)',
        borderRadius: 'var(--r-lg)', padding: '20px 24px',
        display: 'flex', gap: 16, alignItems: 'flex-start',
        marginBottom: 48,
      }}>
        <AlertTriangle size={18} style={{ color: 'var(--co7)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontFamily: 'var(--f-sans)', fontWeight: 600, fontSize: '.82rem', color: 'var(--t1)', marginBottom: 6 }}>
            Conformidade com a LGPD
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--t3)', lineHeight: 1.7 }}>
            Esta política está em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018).
            Ao utilizar o JURIR, você consente com o processamento descrito neste documento.
            O JURIR atua como <strong>Controlador</strong> dos dados pessoais que processa.
          </p>
        </div>
      </div>

      {/* ── SECTIONS ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {sections.map((sec, i) => (
          <div key={sec.id} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--b-main)',
            borderRadius: 'var(--r-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
          }}>
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '18px 24px',
              background: sec.bg,
              borderBottom: `1px solid ${sec.border}`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--r-md)',
                background: sec.bg, border: `1px solid ${sec.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: sec.color,
              }}>
                {sec.icon}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.58rem', color: 'var(--t5)', letterSpacing: '.18em', marginBottom: 2 }}>
                  SEÇÃO {String(i + 1).padStart(2, '0')}
                </div>
                <h2 style={{ fontFamily: 'var(--f-sans)', fontSize: '.95rem', fontWeight: 700, color: 'var(--t0)' }}>
                  {sec.title}
                </h2>
              </div>
            </div>

            {/* Section body */}
            <div style={{ padding: '24px 24px' }}>
              {sec.content ? (
                sec.content.map((block, bi) => (
                  <div key={bi} style={{ marginBottom: bi < sec.content.length - 1 ? 24 : 0 }}>
                    <div style={{
                      fontFamily: 'var(--f-sans)', fontWeight: 600,
                      fontSize: '.78rem', color: 'var(--t2)',
                      marginBottom: 12, paddingBottom: 8,
                      borderBottom: '1px solid var(--b-subtle)',
                    }}>
                      {block.subtitle}
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {block.items.map((item, ii) => (
                        <li key={ii} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <ChevronRight size={13} style={{ color: sec.color, flexShrink: 0, marginTop: 3 }} />
                          <span style={{ fontSize: '.84rem', color: 'var(--t3)', lineHeight: 1.65 }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {sec.items.map((item, ii) => (
                    <li key={ii} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <ChevronRight size={13} style={{ color: sec.color, flexShrink: 0, marginTop: 3 }} />
                      <span style={{ fontSize: '.84rem', color: 'var(--t3)', lineHeight: 1.65 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── SEUS DIREITOS ── */}
      <div style={{ marginTop: 48 }}>
        <div style={{
          fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t5)',
          letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20,
        }}>
          Seus Direitos (LGPD, Art. 18)
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 1, background: 'var(--b-subtle)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden',
          border: '1px solid var(--b-main)',
        }}>
          {rights.map((r, i) => (
            <div key={i} style={{
              background: 'var(--bg-deep)', padding: '18px 20px',
            }}>
              <div style={{
                fontFamily: 'var(--f-sans)', fontWeight: 700,
                fontSize: '.8rem', color: 'var(--t1)', marginBottom: 6,
              }}>
                {r.title}
              </div>
              <div style={{
                fontFamily: 'var(--f-sans)', fontSize: '.75rem',
                color: 'var(--t4)', lineHeight: 1.55,
              }}>
                {r.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COOKIES ── */}
      <div style={{
        marginTop: 40,
        background: 'var(--bg-card)',
        border: '1px solid var(--b-main)',
        borderRadius: 'var(--r-xl)',
        padding: '24px 28px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <h2 style={{
          fontFamily: 'var(--f-sans)', fontWeight: 700,
          fontSize: '.95rem', color: 'var(--t0)', marginBottom: 12,
        }}>
          Cookies e Armazenamento Local
        </h2>
        <p style={{ fontSize: '.84rem', color: 'var(--t3)', lineHeight: 1.7, marginBottom: 10 }}>
          O aplicativo JURIR utiliza armazenamento local (<em>localStorage</em>) exclusivamente para manter sua sessão autenticada
          e preferências da interface (tema, idioma). Não utilizamos cookies de rastreamento, publicidade ou analytics de terceiros.
        </p>
        <p style={{ fontSize: '.84rem', color: 'var(--t3)', lineHeight: 1.7 }}>
          No aplicativo Android, o <strong>Capacitor WebView</strong> usa armazenamento interno isolado, acessível apenas pelo JURIR,
          sem acesso de outros aplicativos.
        </p>
      </div>

      {/* ── MENORES ── */}
      <div style={{
        marginTop: 24,
        background: 'rgba(220,38,38,0.04)',
        border: '1px solid rgba(220,38,38,0.15)',
        borderRadius: 'var(--r-xl)',
        padding: '20px 24px',
      }}>
        <h2 style={{
          fontFamily: 'var(--f-sans)', fontWeight: 700,
          fontSize: '.9rem', color: 'var(--cr4)', marginBottom: 10,
        }}>
          Menores de Idade
        </h2>
        <p style={{ fontSize: '.82rem', color: 'var(--t3)', lineHeight: 1.7 }}>
          O JURIR é destinado exclusivamente a maiores de 18 anos ou emancipados. Não coletamos intencionalmente dados de menores.
          Se identificarmos que um usuário é menor de idade, a conta será encerrada e os dados excluídos imediatamente.
        </p>
      </div>

      {/* ── ALTERAÇÕES ── */}
      <div style={{
        marginTop: 24,
        background: 'var(--bg-card)',
        border: '1px solid var(--b-main)',
        borderRadius: 'var(--r-xl)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <h2 style={{
          fontFamily: 'var(--f-sans)', fontWeight: 700,
          fontSize: '.9rem', color: 'var(--t0)', marginBottom: 10,
        }}>
          Alterações nesta Política
        </h2>
        <p style={{ fontSize: '.82rem', color: 'var(--t3)', lineHeight: 1.7 }}>
          Podemos atualizar esta política periodicamente. Quando houver alterações relevantes, notificaremos por e-mail
          e/ou por aviso na plataforma com antecedência mínima de 15 dias. O uso continuado após a vigência das alterações
          constitui aceite da nova política.
        </p>
      </div>

      {/* ── CONTATO ── */}
      <div style={{
        marginTop: 40,
        background: 'linear-gradient(135deg, rgba(0,242,254,0.06) 0%, rgba(43,138,245,0.04) 100%)',
        border: '1px solid var(--b-cobalt)',
        borderRadius: 'var(--r-xl)',
        padding: '32px 28px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(20,114,217,0.1)', border: '1px solid var(--b-cobalt)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'var(--co7)',
        }}>
          <Mail size={20} />
        </div>
        <h2 className="t-display" style={{
          fontSize: '1.4rem', fontWeight: 600, color: 'var(--t0)', marginBottom: 10,
        }}>
          Encarregado de Dados (DPO)
        </h2>
        <p style={{ fontSize: '.86rem', color: 'var(--t3)', lineHeight: 1.7, marginBottom: 20, maxWidth: 440, margin: '0 auto 20px' }}>
          Para exercer seus direitos, solicitar exclusão de dados, ou tirar dúvidas sobre esta política,
          entre em contato com nosso Encarregado de Proteção de Dados:
        </p>
        <a href={`mailto:${CONTACT_EMAIL}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--co7)', color: '#fff',
          borderRadius: 'var(--r-pill)', padding: '10px 24px',
          fontFamily: 'var(--f-sans)', fontWeight: 600, fontSize: '.84rem',
          textDecoration: 'none',
          boxShadow: 'var(--shadow-cobalt)',
          transition: 'opacity .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Mail size={14} />
          {CONTACT_EMAIL}
        </a>
        <div style={{
          marginTop: 24, paddingTop: 20,
          borderTop: '1px solid var(--b-subtle)',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24,
          fontFamily: 'var(--f-mono)', fontSize: '.62rem', color: 'var(--t5)', letterSpacing: '.06em',
        }}>
          <a href="https://sambanova.ai/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--t5)', textDecoration: 'none' }}>
            SambaNova Privacy Policy ↗
          </a>
          <a href="https://cerebras.ai/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--t5)', textDecoration: 'none' }}>
            Cerebras Privacy Policy ↗
          </a>
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--t5)', textDecoration: 'none' }}>
            Google Privacy Policy ↗
          </a>
          <a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--t5)', textDecoration: 'none' }}>
            OpenRouter Privacy Policy ↗
          </a>
          <a href="https://stripe.com/br/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--t5)', textDecoration: 'none' }}>
            Stripe Privacy Policy ↗
          </a>
        </div>
      </div>

      {/* ── FOOTER NOTE ── */}
      <div style={{
        marginTop: 40, textAlign: 'center',
        fontFamily: 'var(--f-mono)', fontSize: '.6rem', color: 'var(--t5)', letterSpacing: '.1em',
      }}>
        © {new Date().getFullYear()} {APP_NAME} · INTELIGÊNCIA JURÍDICA QUÂNTICA<br />
        <span style={{ opacity: .7 }}>Esta política é parte integrante dos Termos de Uso do JURIR.</span>
      </div>
    </div>
  );
}
