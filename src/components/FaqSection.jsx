import { useState } from 'react';
import { Plus } from 'lucide-react';

const FAQS = [
  {
    q: 'O JURIR substitui meu advogado?',
    a: 'Não — e somos muito transparentes sobre isso. O JURIR é uma ferramenta de inteligência jurídica que te dá informação poderosa para tomar decisões mais inteligentes. Você pode usar a análise para entrevistar advogados com mais segurança, negociar acordos com base real ou decidir se vale a pena contratar representação legal. Para decisões legais vinculantes, sempre consulte um advogado habilitado na OAB.',
  },
  {
    q: 'Com que rapidez recebo o resultado?',
    a: 'A análise completa com 16 agentes leva em média 2 a 3 minutos. Você acompanha em tempo real via streaming — cada agente vai apresentando seus resultados conforme termina. O Juiz IA Quantum delibera ao final com o veredicto e o JURIR Score dimensional.',
  },
  {
    q: 'Meus dados jurídicos ficam seguros?',
    a: 'Absolutamente. Toda comunicação é criptografada com SSL/TLS. Seus dados são armazenados de forma segura e jamais são compartilhados com terceiros, advogados ou instituições. Você tem controle total sobre seu histórico — pode exportar ou deletar a qualquer momento.',
  },
  {
    q: 'O que é o "Advogado do Diabo"?',
    a: 'É o agente que garante o contraditório real — ele atua como o melhor advogado da parte adversária. Apresenta os argumentos mais fortes contra a sua tese, aponta vulnerabilidades processuais, documentação fraca e jurisprudência desfavorável. Sem esse contraditório, qualquer análise seria parcial e perigosa.',
  },
  {
    q: 'O que é o plano Análise por Crédito?',
    a: 'Ideal para quem tem um caso específico e não quer uma assinatura mensal. Você paga R$19,90 por uma análise completa com todos os 16 agentes, Advogado do Diabo, Juiz IA Quantum e JURIR Score dimensional. O relatório fica disponível para download em PDF por 30 dias. Sem recorrência, sem compromisso.',
  },
  {
    q: 'O que inclui o plano Escritório?',
    a: 'O plano Escritório (R$299/mês) é para advogados e escritórios que precisam de volume. Inclui até 30 análises completas por mês, acesso para até 5 usuários, API com 500 requisições, white-label no relatório PDF com o logo do escritório, suporte prioritário e treinamento inicial.',
  },
  {
    q: 'Posso cancelar o Premium a qualquer momento?',
    a: 'Sim, sem burocracia. Cancele quando quiser diretamente pelo painel da sua conta — sem necessidade de ligar ou enviar e-mail. Você mantém o acesso até o fim do período já pago. Sem taxas de cancelamento, sem multas, sem pegadinha.',
  },
];

function FaqItem({ item, open, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      background: open ? 'var(--card-hover)' : 'var(--card)',
      border: `1px solid ${open ? 'rgba(0,242,254,0.20)' : 'rgba(0,242,254,0.10)'}`,
      borderRadius: 'var(--r-lg)', overflow: 'hidden', cursor: 'pointer',
      transition: 'border-color .2s, background .2s',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        padding: '20px 24px',
      }}>
        <div style={{ fontFamily: 'var(--f-sans)', fontSize: '.88rem', fontWeight: 600, color: 'var(--t1)' }}>
          {item.q}
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: open ? 'rgba(0,242,254,0.1)' : 'rgba(0,242,254,0.04)',
          border: '1px solid rgba(0,242,254,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'all .3s', transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          color: 'var(--cy1)',
        }}>
          <Plus size={14}/>
        </div>
      </div>
      <div style={{
        maxHeight: open ? 320 : 0, overflow: 'hidden',
        transition: 'max-height .45s cubic-bezier(.19,1,.22,1)',
      }}>
        <div style={{
          padding: '16px 24px 22px', fontFamily: 'var(--f-display)', fontSize: '.9rem',
          color: 'var(--t3)', lineHeight: 1.8, borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          {item.a}
        </div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <section id="faq" style={{
      padding: 'clamp(60px,8vw,120px) 28px', background: 'var(--void)',
      borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
        <div className="section-label" style={{ marginBottom: 18 }}>Perguntas Frequentes</div>
        <h2 className="t-display" style={{
          fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: 'var(--t0)',
          marginBottom: 14, letterSpacing: '-.025em', lineHeight: 1.1,
        }}>
          Respostas diretas para{' '}
          <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>suas dúvidas</span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 48, textAlign: 'left' }}>
          {FAQS.map((item, i) => (
            <FaqItem key={i} item={item} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
