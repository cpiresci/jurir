import React from 'react';

export default function Privacidade() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '120px 24px 80px',
      color: '#e2e8f0',
      fontFamily: 'Inter, sans-serif',
      lineHeight: 1.7
    }}>
      <h1 style={{ color: '#FF004D', marginBottom: '32px' }}>
        Política de Privacidade
      </h1>
      <p><strong>Última atualização:</strong> Junho de 2026</p>

      <h2 style={{ color: '#FF004D', marginTop: '32px' }}>1. Dados coletados</h2>
      <p>Coletamos nome, e-mail e dados de uso para operação da plataforma JURIR.</p>

      <h2 style={{ color: '#FF004D', marginTop: '32px' }}>2. Uso dos dados</h2>
      <p>Os dados são usados exclusivamente para autenticação, análise jurídica e melhoria do serviço.</p>

      <h2 style={{ color: '#FF004D', marginTop: '32px' }}>3. Compartilhamento</h2>
      <p>Não vendemos nem compartilhamos seus dados com terceiros, exceto quando exigido por lei.</p>

      <h2 style={{ color: '#FF004D', marginTop: '32px' }}>4. Segurança</h2>
      <p>Utilizamos criptografia e boas práticas de segurança para proteger suas informações.</p>

      <h2 style={{ color: '#FF004D', marginTop: '32px' }}>5. Contato</h2>
      <p>Dúvidas: <a href="mailto:contato@jurir.com.br" style={{ color: '#FF004D' }}>contato@jurir.com.br</a></p>
    </div>
  );
}
