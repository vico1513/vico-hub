
import React from "react";

const platforms = [
  { name: "YouTube", icon: "▶️", color: "#ff4545" },
  { name: "Instagram", icon: "📸", color: "#d946ef" },
  { name: "TikTok", icon: "🎵", color: "#38bdf8" },
  { name: "Facebook", icon: "📘", color: "#3b82f6" },
  { name: "Twitch", icon: "🟣", color: "#a78bfa" },
  { name: "Snapchat", icon: "👻", color: "#eab308" },
];

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <span>V</span> VICO HUB
        </div>

        <p className="menu-label">MENU PRINCIPAL</p>

        <nav>
          <a className="active">▦ <span>Visão geral</span></a>
          <a>◉ <span>Minhas plataformas</span></a>
          <a>▣ <span>Publicações</span></a>
          <a>▤ <span>Calendário</span></a>
          <a>◷ <span>Agendamentos</span></a>
          <a>▥ <span>Analytics</span></a>
          <a>◉ <span>Central de lives</span></a>
        </nav>

        <p className="menu-label">FERRAMENTAS</p>

        <nav>
          <a>✦ <span>Vico AI</span></a>
          <a>⚙ <span>Configurações</span></a>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">V</div>
          <div>
            <strong>Meu perfil</strong>
            <small>Visitante</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Vico Hub / Dashboard</span>
            <h1>Visão geral</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button">♧</button>
            <div className="profile-avatar">V</div>
          </div>
        </header>

        <section className="welcome">
          <div>
            <span className="welcome-tag">SUA CENTRAL DE CRIAÇÃO</span>
            <h2>Bem-vindo ao Vico Hub!</h2>
            <p>Suas redes sociais, conteúdos e estatísticas em um só lugar.</p>
          </div>
          <div className="welcome-symbol">✦</div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Desempenho geral</h2>
              <p>Resumo das suas plataformas conectadas.</p>
            </div>
            <span className="period">Últimos 30 dias⌄</span>
          </div>

          <div className="stats-grid">
            {[
              ["Visualizações", "—", "◉"],
              ["Seguidores", "—", "♧"],
              ["Engajamento", "—", "↗"],
              ["Publicações", "—", "▣"],
            ].map(([label, value, icon]) => (
              <div className="stat-card" key={label}>
                <div className="stat-top">
                  <span>{label}</span>
                  <span className="stat-icon">{icon}</span>
                </div>
                <strong>{value}</strong>
                <small>Aguardando conexão</small>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Minhas plataformas</h2>
              <p>Conecte suas redes sociais ao Vico Hub.</p>
            </div>
            <button className="text-button">Ver todas →</button>
          </div>

          <div className="platform-grid">
            {platforms.map((platform) => (
              <div className="platform-card" key={platform.name}>
                <div
                  className="platform-icon"
                  style={{ background: platform.color + "20" }}
                >
                  {platform.icon}
                </div>
                <strong>{platform.name}</strong>
                <span className="disconnected">Não conectado</span>
                <button className="connect-button">+ Conectar</button>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Acesso rápido</h2>
              <p>Suas ferramentas mais importantes.</p>
            </div>
          </div>

          <div className="quick-grid">
            <div className="quick-card">
              <span>✚</span>
              <strong>Nova publicação</strong>
              <small>Crie conteúdos</small>
            </div>
            <div className="quick-card">
              <span>▦</span>
              <strong>Calendário</strong>
              <small>Organize suas postagens</small>
            </div>
            <div className="quick-card">
              <span>◉</span>
              <strong>Central de lives</strong>
              <small>Gerencie transmissões</small>
            </div>
            <div className="quick-card">
              <span>✦</span>
              <strong>Vico AI</strong>
              <small>Crie novas ideias</small>
            </div>
          </div>
        </section>

        <footer>
          VICO HUB © 2026 · Sua criação, suas regras.
        </footer>
      </main>
    </div>
  );
}

export default App;
