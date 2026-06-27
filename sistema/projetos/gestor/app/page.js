"use client";

import LegacyScripts from "./components/LegacyScripts";

/*
  Painel do Gestor (Power Dash AI) — page markup.

  This is a faithful, 1:1 migration of the original single-page index.html.
  The full original markup is reproduced below as JSX (class -> className,
  style strings -> style objects, void elements self-closed, SVG attributes
  camelCased). No layout, spacing, copy, or structure has been changed.

  The original vanilla-JS behavior (navigation, dropdowns, modals, period
  comparison, tickets, collaborators, export) lives in /public/scripts and is
  loaded verbatim via next/script with the afterInteractive strategy, in the
  same order as the original <body> script tags. The scripts attach their own
  DOMContentLoaded / DOM listeners against this exact markup, preserving the
  original user experience byte-for-byte.
*/

export default function PainelGestorPage() {
  return (
    <>
      {/* Auth overlay — removido por script.js após sessão confirmada */}
      <div
        id="auth-overlay"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src="/images/StamFlowLogo-removebg-preview.png"
            alt="StamFlow"
            style={{ width: 120, marginBottom: 24, opacity: 0.9 }}
          />
          <div style={{
            width: 36, height: 36, border: "3px solid #334155",
            borderTop: "3px solid #a855f7", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto",
          }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

    <header className="">
        <nav className="nav-bar">
            <div className="logo">
                <div className="logo-content">
                    <div className="logo-image">
                        <img className="img" src="/images/StamFlowLogo-removebg-preview.png" alt="StamFlow Logo" />
                    </div>
                </div>
                <div className="abrir-header">
                    <svg className="menu-hamburger" xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <line className="linha linha1" x1="3" y1="6" x2="21" y2="6" />
                        <line className="linha linha2" x1="3" y1="12" x2="21" y2="12" />
                        <line className="linha linha3" x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </div>
            </div>
            <ul className="nav-links">
                <li className="nav-item orange-hover link-nav" title="Statistics">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="20"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
                    <h3>Estatísticas</h3>
                </li>
                <li className="tem-sub-lista">
                    <div className="nav-item tem-sub-lista-selector red-hover">
                        <div className="nav-item sem-hover">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="20"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                            <h3>Reports</h3>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="19.2" height="19.2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="16"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                    <ul className="sub-lista display-none">
                        <li className="li-subitem red-hover link-nav" id="tickets-section-link" title="Reports">Gestão de Reports</li>
                        <li className="li-subitem red-hover link-nav" title="Compliance Training">Treinamento Compliance</li>
                        <li className="li-subitem red-hover link-nav" title="FAQ Painel Gestor">FAQ</li>
                    </ul>
                </li>
                <li className="nav-item blue-hover link-nav" title="Collaborators">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="20"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <h3>Equipe</h3>
                </li>
            </ul>
        </nav>
        <div className="perfil" id="abrir-modal-perfil">
            <div className="imagem-usuario">
                <img className="img" src="/images/imagemdefaultusuario.png" alt="" />
            </div>
            <div className="info-usuario">
                <h4>Meu Perfil</h4>
                <p>Usuário StamFlow - Gestor</p>
            </div>
        </div>
    </header>

    <section className="site-content">
        <div className="content-header">
            <h2 id="section-name" className="purple">Statistics</h2>
        </div>
        {/*Relatórios*/}
        <div className="container-1700 conteudo-site display-none">
            <div className="sub-header">
                <div className="sub-header-text">
                    <h2 className="degrade-roxo">Painel do Gestor</h2>
                    <p className="gray">Visão geral do desempenho da equipe</p>
                </div>
            </div>

            <div className="wid100">
                <div className="painel-gestor gap-48">
                    <div className="periodos-navegacao space-btw">
                        <div className="selecao-data-range" id="selecao-periodo-principal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            <div className="input-data-wrapper">
                                <input type="date" id="data-inicio-principal" className="input-data-inicio" />
                                <span className="data-separador">→</span>
                                <input type="date" id="data-fim-principal" className="input-data-fim" />
                            </div>
                        </div>
                        
                        <div className="actions-wrapper">
                            
                            <div className="export-container">
                                <button className="export-btn" id="btn-export-trigger">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                    Exportar
                                </button>
                                <ul className="export-dropdown display-none" id="export-list">
                                    <li data-format="csv">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M8 13h8" /><path d="M8 17h8" /><path d="M10 9h4" /></svg>
                                        Baixar CSV
                                    </li>
                                    <li data-format="pdf">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M10 17h4" /><path d="M10 13h4" /><path d="M12 9v8" /></svg>
                                        Baixar PDF
                                    </li>
                                </ul>
                            </div>
                        
                            <button className="comparar-btn" id="comparar">Comparar</button>
                        </div>
                    </div>

                    <ul className="gap-32 lista-insights">
                        <li className="gap-24 insight dados">
                            <div className="space-btw">
                                <h2 className="color-boa">Stamina Coletiva</h2>
                                <div className="periodoTextContainer">
                                    <p className="periodo-text" id="periodo-text" dados="dados">
                                        HOJE
                                    </p>
                                </div>
                            </div>
                            <ul className="especificidades gap-16">
                                <li className="space-btw">
                                    <h3>Excelente</h3>
                                    <div className="barra-porcentagem">
                                        <div className="barra">
                                            <div className="barra-preenchida" id="excelende-bar-preenchida" dados="dados"></div>
                                        </div>
                                        <p className="porcentagem color-excelente" dados="dados">45%</p>
                                    </div>
                                </li>
                                <li className="space-btw">
                                    <h3>Boa</h3>
                                    <div className="barra-porcentagem">
                                        <div className="barra">
                                            <div className="barra-preenchida" id="boa-bar-preenchida" dados="dados"></div>
                                        </div>
                                        <p className="porcentagem color-boa" dados="dados">45%</p>
                                    </div>
                                </li>
                                <li className="space-btw">
                                    <h3>Atenção</h3>
                                    <div className="barra-porcentagem">
                                        <div className="barra">
                                            <div className="barra-preenchida" id="ruim-bar-preenchida" dados="dados"></div>
                                        </div>
                                        <p className="porcentagem color-ruim" dados="dados">45%</p>
                                    </div>
                                </li>
                                <li className="space-btw">
                                    <h3>Crítica</h3>
                                    <div className="barra-porcentagem">
                                        <div className="barra">
                                            <div className="barra-preenchida" id="critico-bar-preenchida" dados="dados"></div>
                                        </div>
                                        <p className="porcentagem color-critico" dados="dados">45%</p>
                                    </div>
                                </li>
                            </ul>
                        </li>
                        <li className="gap-24 insight dados">
                            <div className="space-btw">
                                <h2 className="color-excelente">Ergonomia da Equipe</h2>
                                <div className="periodoTextContainer">
                                    <p className="periodo-text" id="periodo-text" dados="dados">
                                        HOJE
                                    </p>
                                </div>
                            </div>
                            <ul className="especificidades gap-16">
                                <li className="space-btw">
                                    <h3>Rotação lateral dos ombros</h3>
                                    <p className="classificacao-status" id="status-lombro" dados="dados">------</p>
                                </li>
                                <li className="space-btw">
                                    <h3>Inclinação dos ombros</h3>
                                    <p className="classificacao-status" id="status-iombros" dados="dados">------</p>
                                </li>
                                <li className="space-btw">
                                    <h3>Projeção da cabeça</h3>
                                    <p className="classificacao-status" id="status-pcabeca" dados="dados">------</p>
                                </li>
                                <li className="space-btw">
                                <h3>    Inclinação do dorso</h3>
                                    <p className="classificacao-status" id="status-dorso" dados="dados">------</p>
                                </li>
                            </ul>
                        </li>
                        <li className="gap-24 insight dados">
                            <div className="space-btw">
                                <h2 className="color-azul">Humor da Equipe</h2>
                                <div className="periodoTextContainer">
                                    <p className="periodo-text" id="periodo-text" dados="dados">
                                        HOJE
                                    </p>
                                </div>
                            </div>
                            <ul className="especificidades gap-16">
                                <li className="space-btw">
                                    <h3>😊 Felicidade</h3>
                                    <div className="barra-porcentagem">
                                        <div className="barra">
                                            <div className="barra-preenchida" id="alegria-bar-preenchida" dados="dados"></div>
                                        </div>
                                        <p className="porcentagem color-excelente" dados="dados">45%</p>
                                    </div>
                                </li>
                                <li className="space-btw">
                                    <h3>😑 Neutro</h3>
                                    <div className="barra-porcentagem">
                                        <div className="barra">
                                            <div className="barra-preenchida" id="neutro-bar-preenchida" dados="dados"></div>
                                        </div>
                                        <p className="porcentagem color-azul" dados="dados">45%</p>
                                    </div>
                                </li>
                                <li className="space-btw">
                                    <h3>😠 Raiva</h3>
                                    <div className="barra-porcentagem">
                                        <div className="barra">
                                            <div className="barra-preenchida" id="raiva-bar-preenchida" dados="dados"></div>
                                        </div>
                                        <p className="porcentagem color-ruim" dados="dados">45%</p>
                                    </div>
                                </li>
                                <li className="space-btw">
                                    <h3>😥 Tristeza</h3>
                                    <div className="barra-porcentagem">
                                        <div className="barra">
                                            <div className="barra-preenchida" id="tristeza-bar-preenchida" dados="dados"></div>
                                        </div>
                                        <p className="porcentagem color-critico" dados="dados">45%</p>
                                    </div>
                                </li>
                            </ul>
                        </li>
                        <li className="gap-24 insight dados">
                            <div className="space-btw">
                                <h2 className="color-roxo">Engajamento</h2>
                                <div className="periodoTextContainer">
                                    <p className="periodo-text" id="periodo-text" dados="dados">
                                        HOJE
                                    </p>
                                </div>
                            </div>
                            <ul className="especificidades gap-16">
                                <li className="space-btw">
                                    <h3 className="h2-svg">
                                        <svg className="color-excelente" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="16"><polyline points="20 6 9 17 4 12" /></svg>
                                        Sistema Ativo
                                    </h3>
                                    <p id="porcentagem-sa" dados="dados">---</p>
                                </li>
                                <li className="space-btw">
                                    <h3 className="h2-svg">
                                        <svg className="color-azul" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="16"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                        Realizam Exercícios
                                    </h3>
                                    <p id="porcentagem-er" dados="dados">---</p>
                                </li>
                                <li className="space-btw">
                                    <h3 className="h2-svg">
                                        <svg className="color-roxo" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="16"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>
                                        Pausas Mentais
                                    </h3>
                                    <p id="porcentagem-pm" dados="dados">---</p>
                                </li>
                                <li className="space-btw">
                                    <h3 className="h2-svg">
                                        <svg className="color-vermelho" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="16"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                                        Queixa/Report
                                    </h3>
                                    <p id="porcentagem-qr" dados="dados">---</p>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div className="painel-gestor gap-48">
                    <div className="periodos-navegacao space-btw">
                        <div className="prazosDiv">
                            <div className="selecionar-prazo gap-8">
                                <p>PERIODO A</p>
                                <div className="selecao-data-range" id="selecao-a">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    <div className="input-data-wrapper">
                                        <input type="date" id="data-inicio-a" className="input-data-inicio" />
                                        <span className="data-separador">→</span>
                                        <input type="date" id="data-fim-a" className="input-data-fim" />
                                    </div>
                                </div>
                            </div>
                            <div className="selecionar-prazo gap-8">
                                <p>PERIODO B</p>
                                <div className="selecao-data-range" id="selecao-b">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    <div className="input-data-wrapper">
                                        <input type="date" id="data-inicio-b" className="input-data-inicio" />
                                        <span className="data-separador">→</span>
                                        <input type="date" id="data-fim-b" className="input-data-fim" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button className="cancelar-btn" id="cancelar">Cancelar</button>
                    </div>

                    <ul className="gap-32 lista-comparar">
                        <li className="linha-comparacao">
                            <div className="sc-prazo-a wid100 gap-16 insight dados-a" id="container-stamina-a">
                                <div className="space-btw">
                                    <h2 className="color-boa">Stamina Coletiva</h2>
                                    <div className="periodoTextContainer">
                                        <p className="periodo-text">HOJE</p>                                        
                                    </div>
                                </div>
                                <ul className="especificidades gap-16">
                                    <li className="space-btw">
                                        <h3>Excelente</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="excelende-bar-preenchida"></div></div><p className="porcentagem color-excelente">0%</p></div>
                                    </li>
                                    <li className="space-btw">
                                        <h3>Boa</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="boa-bar-preenchida"></div></div><p className="porcentagem color-boa">0%</p></div>
                                    </li>
                                    <li className="space-btw">
                                        <h3>Atenção</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="ruim-bar-preenchida"></div></div><p className="porcentagem color-ruim">0%</p></div>
                                    </li>
                                    <li className="space-btw">
                                        <h3>Crítica</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="critico-bar-preenchida"></div></div><p className="porcentagem color-critico">0%</p></div>
                                    </li>
                                </ul>
                            </div>

                            <div className="linha-horizontal"></div>      

                            <div className="sc-prazo-b wid100 gap-16 insight dados-b" id="container-stamina-b">
                                <div className="space-btw">
                                    <h2 className="color-boa">Stamina Coletiva</h2>
                                    <div className="periodoTextContainer">
                                        <p className="periodo-text">HOJE</p>
                                    </div>
                                </div>
                                <ul className="especificidades gap-16">
                                    <li className="space-btw">
                                        <h3>Excelente</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="excelende-bar-preenchida"></div></div><p className="porcentagem color-excelente">0%</p></div>
                                    </li>
                                    <li className="space-btw">
                                        <h3>Boa</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="boa-bar-preenchida"></div></div><p className="porcentagem color-boa">0%</p></div>
                                    </li>
                                    <li className="space-btw">
                                        <h3>Atenção</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="ruim-bar-preenchida"></div></div><p className="porcentagem color-ruim">0%</p></div>
                                    </li>
                                    <li className="space-btw">
                                        <h3>Crítica</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="critico-bar-preenchida"></div></div><p className="porcentagem color-critico">0%</p></div>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li className="linha-comparacao">
                            <div className="sc-prazo-a wid100 gap-16 insight dados-a" id="container-ergonomia-a">
                                <div className="space-btw">
                                    <h2 className="color-excelente">Ergonomia da Equipe</h2>
                                    <div className="periodoTextContainer">
                                        <p className="periodo-text">HOJE</p>
                                    </div>
                                </div>
                                <ul className="especificidades gap-16">
                                    <li className="space-btw">
                                        <h3>Rotação lateral dos ombros</h3>
                                        <p className="classificacao-status" id="status-lombro">------</p>
                                    </li>
                                    <li className="space-btw">
                                        <h3>Inclinação dos ombros</h3>
                                        <p className="classificacao-status" id="status-iombros">------</p>
                                    </li>
                                    <li className="space-btw">
                                        <h3>Projeção da cabeça</h3>
                                        <p className="classificacao-status" id="status-pcabeca">------</p>
                                    </li>
                                    <li className="space-btw">
                                        <h3>Inclinação do dorso</h3>
                                        <p className="classificacao-status" id="status-dorso">------</p>
                                    </li>
                                </ul>
                            </div>

                            <div className="linha-horizontal"></div>
                                
                            <div className="sc-prazo-b wid100 gap-16 insight dados-b" id="container-ergonomia-b">
                                <div className="space-btw">
                                    <h2 className="color-excelente">Ergonomia da Equipe</h2>
                                    <div className="periodoTextContainer">
                                        <p className="periodo-text">HOJE</p>
                                    </div>
                                </div>
                                <ul className="especificidades gap-16">
                                    <li className="space-btw">
                                        <h3>Rotação lateral dos ombros</h3>
                                        <p className="classificacao-status" id="status-lombro">------</p>
                                    </li>
                                    <li className="space-btw">
                                        <h3>Inclinação dos ombros</h3>
                                        <p className="classificacao-status" id="status-iombros">------</p>
                                    </li>
                                    <li className="space-btw">
                                        <h3>Projeção da cabeça</h3>
                                        <p className="classificacao-status" id="status-pcabeca">------</p>
                                    </li>
                                    <li className="space-btw">
                                        <h3>Inclinação do dorso</h3>
                                        <p className="classificacao-status" id="status-dorso">------</p>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li className="linha-comparacao">
                            <div className="sc-prazo-a wid100 gap-16 insight dados-a" id="container-humor-a">
                                <div className="space-btw">
                                    <h2 className="color-azul">Humor da Equipe</h2>
                                    <div className="periodoTextContainer">
                                        <p className="periodo-text">HOJE</p>
                                    </div>
                                </div>
                                <ul className="especificidades gap-16">
                                    <li className="space-btw">
                                        <h3>😊 Felicidade</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="alegria-bar-preenchida"></div></div><p className="porcentagem color-excelente">0%</p></div>
                                    </li>
                                    <li className="space-btw">
                                        <h3>😑 Neutro</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="neutro-bar-preenchida"></div></div><p className="porcentagem color-azul">0%</p></div>
                                    </li>
                                    <li className="space-btw">
                                        <h3>😠 Raiva</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="raiva-bar-preenchida"></div></div><p className="porcentagem color-ruim">0%</p></div>
                                    </li>
                                    <li className="space-btw">
                                        <h3>😥 Tristeza</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="tristeza-bar-preenchida"></div></div><p className="porcentagem color-critico">0%</p></div>
                                    </li>
                                </ul>
                            </div>

                            <div className="linha-horizontal"></div>
                                
                            <div className="sc-prazo-b wid100 gap-16 insight dados-b" id="container-humor-b">
                                <div className="space-btw">
                                    <h2 className="color-azul">Humor da Equipe</h2>
                                    <div className="periodoTextContainer">
                                        <p className="periodo-text">HOJE</p>
                                    </div>
                                </div>
                                <ul className="especificidades gap-16">
                                    <li className="space-btw">
                                        <h3>😊 Felicidade</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="alegria-bar-preenchida"></div></div><p className="porcentagem color-excelente">0%</p></div>
                                    </li>
                                    <li className="space-btw">
                                        <h3>😑 Neutro</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="neutro-bar-preenchida"></div></div><p className="porcentagem color-azul">0%</p></div>
                                    </li>
                                    <li className="space-btw">
                                        <h3>😠 Raiva</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="raiva-bar-preenchida"></div></div><p className="porcentagem color-ruim">0%</p></div>
                                    </li>
                                    <li className="space-btw">
                                        <h3>😥 Tristeza</h3>
                                        <div className="barra-porcentagem"><div className="barra"><div className="barra-preenchida" id="tristeza-bar-preenchida"></div></div><p className="porcentagem color-critico">0%</p></div>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li className="linha-comparacao">
                            <div className="sc-prazo-a wid100 gap-16 insight dados-a" id="container-engajamento-a">
                                <div className="space-btw">
                                    <h2 className="color-roxo">Engajamento</h2>
                                    <div className="periodoTextContainer">
                                        <p className="periodo-text">HOJE</p>
                                    </div>
                                </div>
                                <ul className="especificidades gap-16">
                                    <li className="space-btw">
                                        <h3 className="h2-svg"><svg className="color-excelente" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="16"><polyline points="20 6 9 17 4 12" /></svg> Sistema Ativo</h3>
                                        <p id="porcentagem-sa">---</p>
                                    </li>
                                    <li className="space-btw">
                                        <h3 className="h2-svg"><svg className="color-azul" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="16"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> Realizam Exercícios</h3>
                                        <p id="porcentagem-er">---</p>
                                    </li>
                                    <li className="space-btw">
                                        <h3 className="h2-svg"><svg className="color-roxo" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="16"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg> Pausas Mentais</h3>
                                        <p id="porcentagem-pm">---</p>
                                    </li>
                                    <li className="space-btw">
                                        <h3 className="h2-svg"><svg className="color-vermelho" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="16"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg> Queixa/Report</h3>
                                        <p id="porcentagem-qr">---</p>
                                    </li>
                                </ul>
                            </div>

                            <div className="linha-horizontal"></div>
                                
                            <div className="sc-prazo-b wid100 gap-16 insight dados-b" id="container-engajamento-b">
                                <div className="space-btw">
                                    <h2 className="color-roxo">Engajamento</h2>
                                    <div className="periodoTextContainer">
                                        <p className="periodo-text">HOJE</p>
                                    </div>
                                </div>
                                <ul className="especificidades gap-16">
                                    <li className="space-btw">
                                        <h3 className="h2-svg"><svg className="color-excelente" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="16"><polyline points="20 6 9 17 4 12" /></svg> Sistema Ativo</h3>
                                        <p id="porcentagem-sa">---</p>
                                    </li>
                                    <li className="space-btw">
                                        <h3 className="h2-svg"><svg className="color-azul" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="16"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> Realizam Exercícios</h3>
                                        <p id="porcentagem-er">---</p>
                                    </li>
                                    <li className="space-btw">
                                        <h3 className="h2-svg"><svg className="color-roxo" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="16"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg> Pausas Mentais</h3>
                                        <p id="porcentagem-pm">---</p>
                                    </li>
                                    <li className="space-btw">
                                        <h3 className="h2-svg"><svg className="color-vermelho" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="16"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg> Queixa/Report</h3>
                                        <p id="porcentagem-qr">---</p>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        {/*Gestão de Reports*/}
        <div className="container-1700 conteudo-site display-none">
            <div className="sub-header">
                <div className="sub-header-text">
                    <h2 className="degrade-roxo">Gestão de Reports</h2>
                    <p className="gray">Visão geral para gestão dos Reports da equipe</p>
                </div>
                <div className="close-btn-section">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>
            </div>

            <div className="space-btw gapl-30">
                <div className="classificacao-reports" status="aberto">
                    <div className="classificacao-reports-header">
                        <h2 className="color-critico">Abertas</h2>
                    </div>
                </div>

                <div className="classificacao-reports" status="em-andamento">
                    <div className="classificacao-reports-header">
                        <h2 className="color-boa">Em Atendimento</h2>
                    </div>
                </div>

                <div className="classificacao-reports" status="concluido">
                    <div className="classificacao-reports-header">
                        <h2 className="color-excelente">Solucionadas</h2>
                    </div>
                </div>
            </div>
        </div>

        {/*Treinamento Compliance*/}
        <div className="container-1700 conteudo-site display-none">
            <div className="sub-header">
                <div className="sub-header-text">
                    <h2 className="degrade-roxo">Treinamento Compliance</h2>
                    <p className="gray">Temas comuns de Reports e como conduzir cada um</p>
                </div>
            </div>

            <ul className="gap-32 lista-compliance" id="lista-compliance">
                {/* Gerado dinamicamente via /data/compliance.json (compliance.js) */}
            </ul>
        </div>

        {/*FAQ*/}
        <div className="container-1700 conteudo-site display-none">
            <div className="sub-header">
                <div className="sub-header-text">
                    <h2 className="degrade-roxo">FAQ</h2>
                    <p className="gray">Dúvidas frequentes sobre como usar o Painel do Gestor</p>
                </div>
            </div>

            <ul className="gap-32 lista-faq" id="lista-faq">
                {/* Gerado dinamicamente via /data/faq.json (faq.js) */}
            </ul>
        </div>

        {/*Colaboradores*/}
        <div className="container-1700 conteudo-site display-none">
            <div className="sub-header">
                <div className="sub-header-text">
                    <h2 className="degrade-roxo">Colaboradores</h2>
                    <p className="gray">Controle de acessos</p>
                </div>
            </div>

            <div className="wid100 gap-48">
                <div className="collaborators-utils">
                    <div className="collaborators-info">
                        <div className="collaborators-info-text gap-16">
                            <h3>Colaboradores Vinculados</h3>
                            <p>Gerencie os acessos da sua organização.</p>
                        </div>
                        <div className="collaborators-info-quantity gap-16">
                            <h3>5</h3>
                            <p>VIDAS ATIVAS</p>
                        </div>
                        <div className="collaborators-info-quantity-small" id="license-usage-box">
                            <h3 id="license-usage-text">–</h3>
                            <p>VAGAS DE FUNCIONÁRIO</p>
                        </div>
                    </div>

                    <div className="collaborators-action gap-8">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="28"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        <p>Adicionar Colaboradores</p>
                    </div>
                </div>

                <div className="collaborators-list-section wid100 gap-16" style={{ "marginTop": "24px" }}>

                    <div className="action-bar-selection space-btw display-none" id="action-bar-selection">
                        <p className="color-critico" style={{ "fontWeight": "600", "fontSize": "12px" }}>
                            <span id="selected-count">1</span> colaborador selecionado
                        </p>
                        <div style={{ "display": "flex", "gap": "16px" }}>
                            <button className="btn-action-bar btn-excluir" id="btn-excluir-selecionados">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                Excluir Selecionados
                            </button>
                            <button className="btn-action-bar btn-desfazer" id="btn-desfazer-selecao">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
                                Desfazer seleção
                            </button>
                        </div>
                    </div>

                    <div className="colab-table-container">
                        <div className="colab-search-header">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="gray"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input type="text" id="search-collaborator" placeholder="Buscar por e-mail..." />
                            <div className="colab-filtros">
                                <button type="button" className="colab-filtro-btn ativo" data-filtro="todos">Todos</button>
                                <button type="button" className="colab-filtro-btn" data-filtro="ativo">Ativos</button>
                                <button type="button" className="colab-filtro-btn" data-filtro="inativo">Inativos</button>
                            </div>
                        </div>

                        <div className="colab-list-header space-btw">
                            <div style={{ "display": "flex", "gap": "16px", "alignItems": "center" }}>
                                <input type="checkbox" id="select-all-checkbox" className="colab-checkbox" />
                                <p className="gray" style={{ "fontSize": "11px", "fontWeight": "700" }}>E-MAIL DO COLABORADOR</p>
                            </div>
                        </div>

                        <ul className="colab-list" id="colab-list">
                            </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section className="pop-ups display-none">
        <div className="pop-up">
            <div className="gap-48">
                <div className="gap-32">
                    <div className="gap-24">
                        <div className="space-btw title-close">
                            <h2>Detalhes do Report</h2>
                            <svg id="fechar-report" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </div>
                        <div className="conversa gap-24">
                            <h3 id="maximizado-assunto">Assunto</h3>
                            <ul className="conversas gap-16" id="conversas">

                            </ul>
                            <div className="report-info">
                                <p id="maximizado-tempo">Há 2h</p>
                                <p className="color-critico" id="maximizado-status">Abertas</p>
                                <p id="maximizado-tag">Operacional</p>
                            </div>
                        </div>
                        <div className="message-space">
                            <h3>Resposta do Gestor (anônima):</h3>
                            <textarea name="" id="nova-mensagem" placeholder="Escreva sua resposta aqui..."></textarea>
                        </div>
                    </div>
                    <div className="space-btw status">
                        <div className="status-opcao" status="concluido">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="14"><polyline points="20 6 9 17 4 12" /></svg>
                            Solucionado
                        </div>
                        <div className="status-opcao" status="em_andamento">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="14"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                            Em Andamento
                        </div>
                        <div className="status-opcao" status="aberto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="14"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                            Aberto
                        </div>
                    </div>
                    <div className="gap-8">
                        <p className="gray" style={{ "fontSize": "11px", "fontWeight": "700" }}>CATEGORIA</p>
                        <div className="space-btw tag">
                            <div className="tag-opcao" tag="operational">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="14"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                Operacional
                            </div>
                            <div className="tag-opcao" tag="hr_management">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                Gestão RH
                            </div>
                            <div className="tag-opcao" tag="legal">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="14"><path d="M12 3v18" /><path d="m7 8 -5 4 2.5 5.5a4.5 4.5 0 0 0 5 0L7 8Z" /><path d="m17 8 -5-5 5 5 5 4 -2.5 5.5a4.5 4.5 0 0 1-5 0L17 8Z" /></svg>
                                Legal/Jurídico
                            </div>
                        </div>
                    </div>
                </div>
                <div className="buttons-options">
                    <button className="btn-salvar" id="btn-salvar">Salvar</button>
                    <button className="btn-enviar" id="btn-enviar">Enviar Resposta</button>
                </div>
            </div>
        </div>
    </section>

    <section className="modais display-none" id="modais">
        {/*Modal de Perfil do Usuário*/}
        <div className="modal-perfil gap-32 display-none" id="perfil-user">
            <div className="gap-16">
                <div className="perfil-title-close">
                    <h2 className="blue">Meu Perfil</h2>
                    <svg id="fechar-perfil" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>
                <p className="perfil-descricao">Gerencie seus dados de acesso</p>
            </div>
            <form action="" className="dados-perfil gap-16">
                <label htmlFor="perfil-nome">Nome: </label>
                <div className="dados-perfil-input">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3 text-gray-500" size="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <input type="text" name="perfil-nome" id="perfil-nome" />
                </div>
                

                <label htmlFor="perfil-email">Email: </label>
                <div className="dados-perfil-input">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3 text-gray-500" size="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    <input type="email" name="perfil-email" id="perfil-email" />
                </div>

                <button type="button" className="btn-login mar-top15">Redefinir minha senha</button>

                <div className="buttons-perfil">
                    <button className="perfil-logout" id="perfil-logout">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" size="18"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Sair da Conta
                    </button>
                    <button className="btn-salvar" id="perfil-salvar" type="submit">Salvar Alterações</button>
                </div>
            </form>
        </div>
        {/*Modal de Add Colaborador*/}
        <div className="modal-add-colab display-none" id="modal-add-colab">
            <div className="modal-content-colab">
                <div className="modal-header-colab space-btw">
                    <div className="gap-8">
                        <h2>Adicionar Colaboradores</h2>
                        <p className="gray" style={{ "fontSize": "15px" }}>Escolha o método de importação para novos acessos.</p>
                    </div>
                    <svg id="fechar-add-colab" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="close-icon"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>

                <div className="modal-tabs-colab">
                    <button className="tab-btn-colab active" data-target="tab-individual">Individual</button>
                    <button className="tab-btn-colab" data-target="tab-massa">Em Massa</button>
                    <button className="tab-btn-colab" data-target="tab-csv">Upload CSV</button>
                </div>

                <div className="modal-body-colab">
                    <div id="tab-individual" className="tab-content-colab active">
                        <label className="label-colab">E-MAIL CORPORATIVO</label>
                        <input type="email" id="input-email-individual" className="input-colab" placeholder="exemplo@empresa.com" />
                    </div>

                    <div id="tab-massa" className="tab-content-colab display-none">
                        <label className="label-colab">COLE OS E-MAILS</label>
                        <textarea id="input-email-massa" className="textarea-colab" placeholder="email1@empresa.com, email2@empresa.com..."></textarea>
                    </div>

                    <div id="tab-csv" className="tab-content-colab display-none">
                        <div className="csv-dropzone" id="csv-dropzone">
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                            <p className="gray" style={{ "fontSize": "13.5px", "marginTop": "9px" }}>Clique para selecionar seu arquivo .csv</p>
                            <input type="file" id="input-csv-file" accept=".csv" className="display-none" />
                        </div>
                        <p id="csv-file-name" className="color-boa display-none" style={{ "fontSize": "12px", "textAlign": "center", "marginTop": "9px" }}></p>
                    </div>
                </div>

                <div className="modal-footer-colab">
                    <button className="btn-cancelar-colab" id="btn-cancelar-add-colab">Cancelar</button>
                    <button className="btn-importar-colab" id="btn-importar-colab" disabled>Importar</button>
                </div>
            </div>
        </div>
    </section>

      <LegacyScripts />
    </>
  );
}