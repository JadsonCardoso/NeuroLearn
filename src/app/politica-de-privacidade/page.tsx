import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade — NeuroLearn',
  description:
    'Saiba como o NeuroLearn coleta, usa e protege seus dados pessoais, conforme a LGPD (Lei 13.709/2018).',
}

export default function PoliticaDePrivacidadePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link
            href="/auth/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--text3)',
              textDecoration: 'none',
              marginBottom: '28px',
            }}
          >
            ← Voltar
          </Link>
          <div
            style={{
              display: 'inline-flex',
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              borderRadius: '10px',
              padding: '8px',
              marginBottom: '16px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--text)',
              letterSpacing: '-0.5px',
              marginBottom: '8px',
            }}
          >
            Política de Privacidade
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: 1.6 }}>
            Última atualização: junho de 2026 · Conforme a <strong>LGPD — Lei 13.709/2018</strong>
          </p>
        </div>

        <Section title="1. Quem somos">
          <p>
            O <strong>NeuroLearn</strong> é uma plataforma de aprendizagem baseada em neurociência,
            desenvolvida para ajudar estudantes e profissionais a consolidar conhecimento com
            maior eficiência. Somos o controlador dos seus dados pessoais conforme definido
            pela LGPD.
          </p>
          <p style={{ marginTop: '12px' }}>
            <strong>Contato do encarregado (DPO):</strong>{' '}
            <a href="mailto:privacidade@neurolearn.tech" style={{ color: 'var(--color-primary-text)' }}>
              privacidade@neurolearn.tech
            </a>
          </p>
        </Section>

        <Section title="2. Dados que coletamos">
          <p>Coletamos apenas os dados estritamente necessários para o funcionamento da plataforma:</p>
          <Table
            headers={['Dado', 'Finalidade', 'Base legal (LGPD)']}
            rows={[
              ['Endereço de email', 'Autenticação via Magic Link', 'Art. 7º, V — execução de contrato'],
              ['Nome completo', 'Personalização da experiência', 'Art. 7º, V — execução de contrato'],
              ['Histórico de estudos', 'Algoritmo SM-2 e métricas de retenção', 'Art. 7º, V — execução de contrato'],
              ['Conteúdos adicionados', 'Biblioteca pessoal de aprendizagem', 'Art. 7º, V — execução de contrato'],
              ['Flashcards criados', 'Revisão espaçada personalizada', 'Art. 7º, V — execução de contrato'],
              ['Dados de sessão (cookies)', 'Manutenção da sessão autenticada', 'Art. 7º, II — consentimento'],
              ['Eventos cognitivos (XP, streaks)', 'Gamificação e progresso', 'Art. 7º, V — execução de contrato'],
            ]}
          />
        </Section>

        <Section title="3. Como usamos seus dados">
          <p>Seus dados são usados exclusivamente para:</p>
          <ul style={{ paddingLeft: '20px', lineHeight: 2, marginTop: '8px', color: 'var(--text2)' }}>
            <li>Autenticar sua identidade e manter sua sessão ativa</li>
            <li>Executar o algoritmo de repetição espaçada (SM-2) personalizado para você</li>
            <li>Calcular métricas de retenção e habilidades consolidadas</li>
            <li>Personalizar a experiência de aprendizagem com base no seu histórico</li>
            <li>Gerar flashcards e análises com apoio de Inteligência Artificial</li>
            <li>Manter o progresso, streak e pontuação de XP</li>
          </ul>
          <p style={{ marginTop: '12px' }}>
            <strong>Não vendemos, alugamos ou compartilhamos</strong> seus dados pessoais com
            terceiros para fins comerciais.
          </p>
        </Section>

        <Section title="4. Inteligência Artificial">
          <p>
            O NeuroLearn utiliza modelos de IA para gerar flashcards, análises de conteúdo e
            sugestões de aprendizagem. Os conteúdos que você adiciona podem ser processados
            por esses modelos para gerar material de estudo personalizado.
          </p>
          <p style={{ marginTop: '12px' }}>
            Os dados enviados à IA <strong>não são usados para treinar modelos externos</strong>.
            As requisições são processadas de forma pontual e não são armazenadas pelo
            provedor de IA além do necessário para a resposta.
          </p>
        </Section>

        <Section title="5. Cookies e armazenamento local">
          <p>Utilizamos dois tipos de armazenamento:</p>
          <ul style={{ paddingLeft: '20px', lineHeight: 2, marginTop: '8px', color: 'var(--text2)' }}>
            <li>
              <strong>Cookies httpOnly (Supabase Auth)</strong> — armazenam tokens de sessão de
              forma segura, inacessíveis ao JavaScript do navegador.
            </li>
            <li>
              <strong>localStorage</strong> — armazena preferências como tema (claro/escuro) e
              dados de sessão offline. Nenhum dado sensível é armazenado aqui.
            </li>
          </ul>
          <p style={{ marginTop: '12px' }}>
            Você pode limpar cookies e localStorage a qualquer momento nas configurações do
            seu navegador. Isso encerrará sua sessão.
          </p>
        </Section>

        <Section title="6. Segurança dos dados">
          <p>Adotamos as seguintes medidas de segurança:</p>
          <ul style={{ paddingLeft: '20px', lineHeight: 2, marginTop: '8px', color: 'var(--text2)' }}>
            <li>Comunicação exclusivamente via HTTPS (TLS 1.3)</li>
            <li>Tokens de sessão em cookies httpOnly (não expostos ao JavaScript)</li>
            <li>Row Level Security (RLS) no banco de dados — cada usuário acessa apenas seus próprios dados</li>
            <li>Rate limiting nas rotas de autenticação (proteção contra brute force)</li>
            <li>Autenticação via Magic Link — sem senhas armazenadas</li>
          </ul>
        </Section>

        <Section title="7. Retenção de dados">
          <p>
            Seus dados são mantidos enquanto sua conta estiver ativa. Ao solicitar a exclusão
            da conta, todos os dados pessoais são removidos em até <strong>30 dias</strong>,
            conforme o Art. 16 da LGPD.
          </p>
          <p style={{ marginTop: '12px' }}>
            Dados anonimizados e agregados (sem identificação pessoal) podem ser mantidos para
            fins de melhoria do produto.
          </p>
        </Section>

        <Section title="8. Seus direitos (LGPD — Art. 18)">
          <p>Como titular de dados, você tem direito a:</p>
          <Table
            headers={['Direito', 'Como exercer']}
            rows={[
              ['Confirmação e acesso aos dados', 'Entre em contato: privacidade@neurolearn.tech'],
              ['Correção de dados incompletos ou incorretos', 'Entre em contato: privacidade@neurolearn.tech'],
              ['Anonimização, bloqueio ou eliminação', 'Entre em contato: privacidade@neurolearn.tech'],
              ['Portabilidade dos dados', 'Entre em contato: privacidade@neurolearn.tech'],
              ['Eliminação dos dados tratados com consentimento', 'Configurações da conta → Excluir conta'],
              ['Revogação do consentimento', 'Configurações da conta → Preferências de privacidade'],
              ['Oposição ao tratamento', 'Entre em contato: privacidade@neurolearn.tech'],
            ]}
          />
          <p style={{ marginTop: '12px' }}>
            Respondemos a todas as solicitações em até <strong>15 dias úteis</strong>.
          </p>
        </Section>

        <Section title="9. Menores de idade">
          <p>
            O NeuroLearn não é direcionado a menores de 13 anos. Não coletamos intencionalmente
            dados de crianças. Se identificarmos dados de menores, os removeremos imediatamente.
          </p>
        </Section>

        <Section title="10. Alterações nesta política">
          <p>
            Podemos atualizar esta política periodicamente. Alterações significativas serão
            comunicadas por email e exibiremos um aviso na plataforma com antecedência mínima
            de 15 dias.
          </p>
        </Section>

        <Section title="11. Contato">
          <p>
            Para exercer seus direitos ou tirar dúvidas sobre o tratamento dos seus dados:
          </p>
          <ul style={{ paddingLeft: '20px', lineHeight: 2, marginTop: '8px', color: 'var(--text2)' }}>
            <li>
              <strong>Email DPO:</strong>{' '}
              <a href="mailto:privacidade@neurolearn.tech" style={{ color: 'var(--color-primary-text)' }}>
                privacidade@neurolearn.tech
              </a>
            </li>
            <li>
              <strong>Autoridade Nacional de Proteção de Dados (ANPD):</strong>{' '}
              <a
                href="https://www.gov.br/anpd"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-primary-text)' }}
              >
                www.gov.br/anpd
              </a>
            </li>
          </ul>
        </Section>

        <div
          style={{
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text4)' }}>
            © 2026 NeuroLearn · Todos os direitos reservados
          </span>
          <Link
            href="/auth/login"
            style={{
              fontSize: '13px',
              color: 'var(--color-primary-text)',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Voltar para o app →
          </Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '36px' }}>
      <h2
        style={{
          fontSize: '16px',
          fontWeight: '700',
          color: 'var(--text)',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7 }}>{children}</div>
    </section>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: '12px' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
        }}
      >
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  background: 'var(--bg2)',
                  color: 'var(--text3)',
                  fontWeight: '600',
                  borderBottom: '1px solid var(--border)',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border)',
                    color: j === 0 ? 'var(--text)' : 'var(--text3)',
                    fontWeight: j === 0 ? '500' : '400',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
