import { FileText, Scale, AlertTriangle, CreditCard, Ban, Gavel, UserCog, ChevronRight, Mail, ShieldAlert } from 'lucide-react';

const LAST_UPDATE = '02 de julho de 2026';
const CONTACT_EMAIL = 'contato@jurir.com';
const APP_NAME = 'JURIR';

const sections = [
  {
    id: 'natureza',
    icon: <ShieldAlert size={18} />,
    title: 'Natureza do Serviço — Leia com Atenção',
    color: 'var(--cr4)',
    bg: 'rgba(220,38,38,0.06)',
    border: 'rgba(220,38,38,0.18)',
    items: [
      'O JURIR é uma ferramenta de apoio à análise jurídica baseada em Inteligência Artificial, NÃO um escritório de advocacia',
      'O uso do JURIR não constitui, substitui ou dispensa a consultoria, assessoria ou representação por advogado(a) regularmente inscrito(a) na OAB',
      'As análises, petições e relatórios gerados pela IA são material de apoio e devem ser obrigatoriamente revisados por profissional habilitado antes de qualquer uso processual ou decisório',
      'O JURIR não cria relação advogado-cliente, não presta consultoria jurídica nos termos do art. 1º da Lei nº 8.906/1994 (Estatuto da OAB) e não se responsabiliza por decisões tomadas exclusivamente com base nas saídas da IA',
      'Modelos de IA podem cometer erros, apresentar interpretações desatualizadas da legislação ou "alucinar" informações — a revisão humana profissional é indispensável',
    ],
  },
  {
    id: 'conta',
    icon: <UserCog size={18} />,
    title: 'Cadastro, Conta e Verificação de OAB',
    color: 'var(--co7)',
    bg: 'rgba(0,242,254,0.06)',
    border: 'var(--b-cobalt)',
    items: [
      'Você deve fornecer informações verdadeiras, completas e atualizadas no cadastro',
      'É responsável por manter a confidencialidade da sua senha e das credenciais de autenticação (incluindo 2FA)',
      'Recursos sensíveis podem exigir verificação do número de inscrição na OAB; a validação é de formato, não uma checagem em tempo real junto ao Conselho Federal',
      'Você é responsável por todas as atividades realizadas na sua conta, inclusive por terceiros autorizados (ex: membros do plano Escritório)',
      'Contas podem ser suspensas em caso de dados falsos, compartilhamento indevido de credenciais ou uso fraudulento',
    ],
  },
  {
    id: 'planos',
    icon: <CreditCard size={18} />,
    title: 'Planos, Cobrança e Cancelamento',
    color: 'var(--au6)',
    bg: 'rgba(212,168,0,0.06)',
    border: 'var(--b-gold)',
    content: [
      {
        subtitle: 'Modalidades disponíveis',
        items: [
          'Crédito Avulso — cobrança única por análise, sem recorrência',
          'Solo, Escritório e API — assinaturas recorrentes mensais, renovadas automaticamente até cancelamento',
        ],
      },
      {
        subtitle: 'Condições gerais',
        items: [
          'Pagamentos são processados via Stripe; não armazenamos dados completos de cartão',
          'O cancelamento de assinatura pode ser feito a qualquer momento pelo site jurir.com e produz efeito ao final do ciclo já pago',
          'Reembolsos seguem o Código de Defesa do Consumidor (art. 49, CDC) — direito de arrependimento em até 7 dias corridos da contratação, quando aplicável',
          'No aplicativo Android, a gestão de assinatura e pagamento é feita exclusivamente pelo site, fora do aplicativo',
          'Reajustes de preço são comunicados com antecedência mínima de 30 dias',
        ],
      },
    ],
  },
  {
    id: 'uso-aceitavel',
    icon: <Ban size={18} />,
    title: 'Uso Aceitável — Condutas Proibidas',
    color: 'var(--am4)',
    bg: 'rgba(139,92,246,0.06)',
    border: 'var(--b-am)',
    items: [
      'Utilizar o JURIR para gerar conteúdo ilegal, difamatório, fraudulento ou que viole direitos de terceiros',
      'Tentar contornar limites técnicos, de segurança ou de uso da plataforma (engenharia reversa, scraping, automação não autorizada)',
      'Compartilhar credenciais de acesso ou revender o acesso à conta sem autorização',
      'Submeter dados pessoais sensíveis de terceiros sem base legal e consentimento adequados (LGPD)',
      'Utilizar as saídas da IA para induzir terceiros a erro sobre a origem humana ou profissional do conteúdo, quando aplicável',
      'Uso indevido pode resultar em suspensão ou encerramento imediato da conta, sem reembolso',
    ],
  },
  {
    id: 'propriedade',
    icon: <FileText size={18} />,
    title: 'Propriedade Intelectual',
    color: 'var(--jade2)',
    bg: 'rgba(16,185,129,0.06)',
    border: 'var(--b-jade)',
    items: [
      'A marca, o software, a arquitetura do swarm de agentes e a interface do JURIR são de propriedade do JURIR e protegidos por direitos autorais e de propriedade industrial',
      'Os documentos e textos que você envia para análise permanecem de sua titularidade',
      'Os relatórios, petições e análises gerados a partir do seu conteúdo são de seu uso, sujeitos à revisão profissional obrigatória mencionada acima',
      'É vedada a reprodução, engenharia reversa ou distribuição não autorizada do software do JURIR',
    ],
  },
  {
    id: 'responsabilidade',
    icon: <Scale size={18} />,
    title: 'Limitação de Responsabilidade',
    color: 'var(--co8)',
    bg: 'rgba(43,138,245,0.06)',
    border: 'rgba(43,138,245,0.18)',
    items: [
      'O JURIR é fornecido "como está", sem garantias de precisão jurídica absoluta ou de resultado em processos ou negociações',
      'Não nos responsabilizamos por prejuízos decorrentes do uso das análises sem a devida revisão por advogado(a) habilitado(a)',
      'Não garantimos disponibilidade ininterrupta da plataforma; interrupções para manutenção podem ocorrer',
      'Nossa responsabilidade total, quando aplicável, está limitada ao valor pago pelo usuário no plano contratado nos últimos 12 meses',
      'Nada nesta cláusula exclui direitos irrenunciáveis previstos no Código de Defesa do Consumidor',
    ],
  },
];

export default function TermosPage() {
  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '100px 24px 80px', background: '#0a0a0f', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 56 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,242,254,0.06)', border: '1px solid var(--b-cobalt)',
          borderRadius: 'var(--r-pill)', padding: '5px 14px',
          fontSize: 'var(--fs-xs)', color: 'var(--co7)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.12em', marginBottom: 20,
        }}>
          <FileText size={11} /> TERMOS DE USO
        </div>

        <h1 className="t-display" style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700,
          color: 'var(--t0)', letterSpacing: '-.02em', lineHeight: 1.1,
          marginBottom: 16,
        }}>
          Regras claras para<br />
          <em style={{ fontStyle: 'italic', color: 'var(--co7)' }}>uso da plataforma</em>
        </h1>

        <p style={{ fontSize: 'var(--fs-md)', color: 'var(--t3)', lineHeight: 1.8, maxWidth: 600, marginBottom: 24 }}>
          Estes Termos de Uso regem o acesso e a utilização do <strong style={{ color: 'var(--t1)' }}>JURIR</strong> (site e
          aplicativo). Ao criar uma conta ou usar a plataforma, você concorda integralmente com estes termos.
        </p>

        <div style={{
          display: 'flex', gap: 24, flexWrap: 'wrap',
          fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t3)', letterSpacing: '.08em',
        }}>
          <span>Última atualização: <strong style={{ color: 'var(--t3)' }}>{LAST_UPDATE}</strong></span>
          <span>Versão: <strong style={{ color: 'var(--t3)' }}>1.0</strong></span>
          <span>Jurisdição: <strong style={{ color: 'var(--t3)' }}>Brasil</strong></span>
        </div>
      </div>

      {/* ── AVISO OAB ── */}
      <div style={{
        background: 'rgba(220,38,38,0.05)',
        border: '1px solid rgba(220,38,38,0.2)',
        borderRadius: 'var(--r-lg)', padding: '20px 24px',
        display: 'flex', gap: 16, alignItems: 'flex-start',
        marginBottom: 48,
      }}>
        <AlertTriangle size={18} style={{ color: 'var(--cr4)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontFamily: 'var(--f-sans)', fontWeight: 600, fontSize: 'var(--fs-sm)', color: 'var(--t1)', marginBottom: 6 }}>
            O JURIR não substitui advogado(a)
          </div>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--t3)', lineHeight: 1.7 }}>
            Nos termos do Estatuto da OAB (Lei nº 8.906/1994), a atividade de advocacia é privativa de profissional
            regularmente inscrito. O JURIR é uma ferramenta de apoio baseada em IA — toda saída deve ser revisada
            por advogado(a) habilitado(a) antes de qualquer uso processual, contratual ou decisório.
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
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t3)', letterSpacing: '.18em', marginBottom: 2 }}>
                  CLÁUSULA {String(i + 1).padStart(2, '0')}
                </div>
                <h2 style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--t0)' }}>
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
                      fontSize: 'var(--fs-xs)', color: 'var(--t2)',
                      marginBottom: 12, paddingBottom: 8,
                      borderBottom: '1px solid var(--b-subtle)',
                    }}>
                      {block.subtitle}
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {block.items.map((item, ii) => (
                        <li key={ii} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <ChevronRight size={13} style={{ color: sec.color, flexShrink: 0, marginTop: 3 }} />
                          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--t3)', lineHeight: 1.65 }}>{item}</span>
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
                      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--t3)', lineHeight: 1.65 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── RESCISÃO ── */}
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
          fontSize: 'var(--fs-lg)', color: 'var(--t0)', marginBottom: 12,
        }}>
          Rescisão e Encerramento de Conta
        </h2>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--t3)', lineHeight: 1.7, marginBottom: 10 }}>
          Você pode encerrar sua conta a qualquer momento pelo painel de Conta ou solicitando por e-mail.
          O JURIR pode suspender ou encerrar contas que violem estes Termos, mediante aviso prévio quando
          possível, exceto em casos de fraude ou risco à segurança da plataforma.
        </p>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--t3)', lineHeight: 1.7 }}>
          Após o encerramento, seus dados são tratados conforme descrito na nossa Política de Privacidade.
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
          fontSize: 'var(--fs-lg)', color: 'var(--t0)', marginBottom: 10,
        }}>
          Alterações nestes Termos
        </h2>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--t3)', lineHeight: 1.7 }}>
          Podemos atualizar estes Termos periodicamente para refletir mudanças na plataforma ou na legislação.
          Alterações relevantes serão comunicadas por e-mail e/ou aviso na plataforma com antecedência mínima
          de 15 dias. O uso continuado após a vigência da alteração constitui aceite dos novos termos.
        </p>
      </div>

      {/* ── FORO ── */}
      <div style={{
        marginTop: 24,
        background: 'rgba(43,138,245,0.04)',
        border: '1px solid rgba(43,138,245,0.15)',
        borderRadius: 'var(--r-xl)',
        padding: '20px 24px',
        display: 'flex', gap: 16, alignItems: 'flex-start',
      }}>
        <Gavel size={18} style={{ color: 'var(--co8)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <h2 style={{
            fontFamily: 'var(--f-sans)', fontWeight: 700,
            fontSize: 'var(--fs-lg)', color: 'var(--t0)', marginBottom: 10,
          }}>
            Legislação Aplicável e Foro
          </h2>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--t3)', lineHeight: 1.7 }}>
            Estes Termos são regidos pelas leis da República Federativa do Brasil, incluindo o Marco Civil da
            Internet (Lei nº 12.965/2014), a LGPD (Lei nº 13.709/2018) e o Código de Defesa do Consumidor
            (Lei nº 8.078/1990), quando aplicável. Fica eleito o foro do domicílio do consumidor para dirimir
            eventuais controvérsias, ressalvada disposição legal em contrário.
          </p>
        </div>
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
          fontSize: 'var(--fs-2xl)', fontWeight: 600, color: 'var(--t0)', marginBottom: 10,
        }}>
          Dúvidas sobre estes Termos?
        </h2>
        <p style={{ fontSize: 'var(--fs-base)', color: 'var(--t3)', lineHeight: 1.7, marginBottom: 20, maxWidth: 440, margin: '0 auto 20px' }}>
          Entre em contato com nossa equipe para esclarecer qualquer ponto destes Termos de Uso:
        </p>
        <a href={`mailto:${CONTACT_EMAIL}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--co7)', color: '#fff',
          borderRadius: 'var(--r-pill)', padding: '10px 24px',
          fontFamily: 'var(--f-sans)', fontWeight: 600, fontSize: 'var(--fs-sm)',
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
      </div>

      {/* ── FOOTER NOTE ── */}
      <div style={{
        marginTop: 40, textAlign: 'center',
        fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t3)', letterSpacing: '.1em',
      }}>
        © {new Date().getFullYear()} {APP_NAME} · INTELIGÊNCIA JURÍDICA POR IA<br />
        <span style={{ opacity: .7 }}>Estes Termos de Uso devem ser lidos em conjunto com nossa Política de Privacidade.</span>
      </div>
    </div>
  );
}
