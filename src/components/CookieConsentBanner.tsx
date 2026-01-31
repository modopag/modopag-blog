// ============================================
// COOKIE CONSENT BANNER - MODOPAG v2.2
// ============================================
// Responsabilidade UNICA: Gerenciar consentimento LGPD
// Integracao com modoPAG tracker para persistencia
// ============================================

import { useState, useEffect, useCallback } from "react"

// ============================================
// CONFIGURACOES
// ============================================
const CONFIG = {
    privacyUrl: "https://modopag.com.br/politicas-de-privacidade/",
    termsUrl: "https://modopag.com.br/termos-de-uso-e-condicoes-de-uso/",
    showDelay: 1000,
    position: "left" as const,
    texts: {
        title: "Sua privacidade e importante",
        description: "Esse site usa cookies pra funcionar melhor pra voce. Escolha suas preferencias abaixo.",
        acceptAll: "Aceitar todos",
        essentialOnly: "Apenas essenciais",
        customize: "Personalizar",
        save: "Salvar preferencias",
        categories: {
            essential: {
                title: "Essenciais",
                description: "Necessarios para o funcionamento do site. Nao podem ser desativados.",
            },
            analytics: {
                title: "Analise",
                description: "Nos ajudam a entender como voce usa o site para melhorarmos sua experiencia.",
            },
            marketing: {
                title: "Marketing",
                description: "Usados para mostrar anuncios relevantes e medir a eficacia das campanhas.",
            },
        },
    },
    colors: {
        primary: "#facc15",
        primaryHover: "#eab308",
        primaryText: "#000000",
        background: "#ffffff",
        text: "#1a1a2e",
        textMuted: "#6b7280",
        border: "#e5e7eb",
        toggle: "#25D366",
    },
    debug: false,
}

// ============================================
// TIPOS
// ============================================
interface ModoPAGTracker {
    hasConsent: () => boolean
    getConsent: () => { ads: boolean; analytics: boolean } | null
    setConsent: (ads: boolean, analytics: boolean) => void
}

declare global {
    interface Window {
        modoPAG?: ModoPAGTracker
    }
}

// ============================================
// ICONES SVG
// ============================================
function CookieIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
            <path d="M8.5 8.5v.01" />
            <path d="M16 15.5v.01" />
            <path d="M12 12v.01" />
            <path d="M11 17v.01" />
            <path d="M7 14v.01" />
        </svg>
    )
}

function ShieldIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        </svg>
    )
}

function SettingsIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}

function CheckIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}

function CloseIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}

// ============================================
// COMPONENTE TOGGLE SWITCH
// ============================================
function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                border: "none",
                padding: "2px",
                cursor: disabled ? "not-allowed" : "pointer",
                backgroundColor: disabled ? "#d1d5db" : checked ? CONFIG.colors.toggle : "#d1d5db",
                transition: "background-color 0.2s ease",
                position: "relative",
                opacity: disabled ? 0.6 : 1,
            }}
        >
            <div
                style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    transition: "transform 0.2s ease",
                    transform: checked ? "translateX(20px)" : "translateX(0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {disabled && <CheckIcon size={12} />}
            </div>
        </button>
    )
}

// ============================================
// HOOK: useModoPAGTracker
// ============================================
function useModoPAGTracker() {
    const [tracker, setTracker] = useState<ModoPAGTracker | null>(null)

    useEffect(() => {
        const checkTracker = () => {
            if (window.modoPAG) {
                setTracker(window.modoPAG)
                if (CONFIG.debug) console.log("[Cookie Consent] modoPAG tracker encontrado!")
            } else {
                setTimeout(checkTracker, 100)
            }
        }
        checkTracker()
    }, [])

    return tracker
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function CookieConsentBanner() {
    const [isMounted, setIsMounted] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const tracker = useModoPAGTracker()
    const [showBanner, setShowBanner] = useState(false)
    const [showCustomize, setShowCustomize] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [hasExistingConsent, setHasExistingConsent] = useState(false)
    const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
    const [marketingEnabled, setMarketingEnabled] = useState(true)

    useEffect(() => {
        setIsMounted(true)
        setIsMobile(window.innerWidth <= 768)
        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        if (!tracker) return
        const consent = tracker.hasConsent()
        setHasExistingConsent(consent)
        if (!consent) {
            setTimeout(() => {
                setShowBanner(true)
                setTimeout(() => setIsAnimating(true), 50)
            }, CONFIG.showDelay)
        }
    }, [tracker])

    const closeBanner = useCallback(() => {
        setIsAnimating(false)
        setTimeout(() => {
            setShowBanner(false)
            setShowCustomize(false)
            setHasExistingConsent(true)
        }, 300)
    }, [])

    const handleAcceptAll = useCallback(() => {
        if (tracker) tracker.setConsent(true, true)
        closeBanner()
    }, [tracker, closeBanner])

    const handleEssentialOnly = useCallback(() => {
        if (tracker) tracker.setConsent(false, false)
        closeBanner()
    }, [tracker, closeBanner])

    const handleSavePreferences = useCallback(() => {
        if (tracker) tracker.setConsent(marketingEnabled, analyticsEnabled)
        closeBanner()
    }, [analyticsEnabled, marketingEnabled, tracker, closeBanner])

    const handleOpenCustomize = useCallback(() => setShowCustomize(true), [])
    const handleCloseCustomize = useCallback(() => setShowCustomize(false), [])

    const handleOpenSettings = useCallback(() => {
        if (tracker) {
            const consent = tracker.getConsent()
            if (consent) {
                setAnalyticsEnabled(consent.analytics ?? true)
                setMarketingEnabled(consent.ads ?? true)
            }
        }
        setShowBanner(true)
        setShowCustomize(true)
        setTimeout(() => setIsAnimating(true), 50)
    }, [tracker])

    if (!isMounted) return null

    const isLeft = CONFIG.position === "left"
    const floatingPosition = isLeft
        ? { left: isMobile ? "16px" : "24px", right: "auto" }
        : { right: isMobile ? "16px" : "24px", left: "auto" }

    return (
        <>
            <style>{`
                @keyframes mpcc-slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .mpcc-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px 20px;
                    font-size: 14px;
                    font-weight: 600;
                    font-family: inherit;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    white-space: nowrap;
                }
                .mpcc-btn-primary {
                    background: ${CONFIG.colors.primary};
                    color: ${CONFIG.colors.primaryText};
                }
                .mpcc-btn-primary:hover {
                    background: ${CONFIG.colors.primaryHover};
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(250, 204, 21, 0.3);
                }
                .mpcc-btn-secondary {
                    background: transparent;
                    color: ${CONFIG.colors.text};
                    border: 1px solid ${CONFIG.colors.border};
                }
                .mpcc-btn-secondary:hover {
                    background: ${CONFIG.colors.border};
                }
                .mpcc-btn-text {
                    background: transparent;
                    color: ${CONFIG.colors.textMuted};
                    padding: 8px 12px;
                }
                .mpcc-btn-text:hover {
                    color: ${CONFIG.colors.text};
                }
                .mpcc-floating-btn {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: ${CONFIG.colors.background};
                    border: 1px solid ${CONFIG.colors.border};
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    color: ${CONFIG.colors.text};
                }
                .mpcc-floating-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 24px rgba(0,0,0,0.15);
                }
                .mpcc-category {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 16px;
                    background: #f9fafb;
                    border-radius: 8px;
                    margin-bottom: 12px;
                }
                .mpcc-link {
                    color: ${CONFIG.colors.text};
                    text-decoration: underline;
                    cursor: pointer;
                }
                .mpcc-link:hover {
                    color: ${CONFIG.colors.primaryHover};
                }
                @media (max-width: 768px) {
                    .mpcc-btn {
                        padding: 14px 16px;
                        font-size: 14px;
                        width: 100%;
                    }
                }
            `}</style>

            {/* Botao flutuante (quando ja tem consentimento) */}
            {hasExistingConsent && !showBanner && (
                <div style={{ position: "fixed", bottom: isMobile ? "16px" : "24px", ...floatingPosition, zIndex: 2147483640 }}>
                    <button className="mpcc-floating-btn" onClick={handleOpenSettings} aria-label="Configuracoes de cookies" title="Configuracoes de cookies">
                        <CookieIcon size={22} />
                    </button>
                </div>
            )}

            {/* Overlay */}
            {showBanner && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 2147483644, opacity: isAnimating ? 1 : 0, transition: "opacity 0.3s ease" }} />
            )}

            {/* Banner principal */}
            {showBanner && !showCustomize && (
                <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 2147483645, padding: isMobile ? "16px" : "20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", transform: isAnimating ? "translateY(0)" : "translateY(100%)", opacity: isAnimating ? 1 : 0, transition: "all 0.3s ease" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto", background: CONFIG.colors.background, borderRadius: isMobile ? "16px 16px 0 0" : "16px", boxShadow: "0 -4px 40px rgba(0,0,0,0.15)", overflow: "hidden" }}>
                        <div style={{ padding: isMobile ? "20px" : "24px" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${CONFIG.colors.primary}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: CONFIG.colors.primaryHover }}>
                                    <CookieIcon size={28} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: 700, color: CONFIG.colors.text, margin: "0 0 8px 0" }}>{CONFIG.texts.title}</h2>
                                    <p style={{ fontSize: isMobile ? "13px" : "14px", color: CONFIG.colors.textMuted, margin: 0, lineHeight: 1.6 }}>
                                        {CONFIG.texts.description}{" "}
                                        <a href={CONFIG.privacyUrl} target="_blank" rel="noopener noreferrer" className="mpcc-link">Saiba mais</a>
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "12px", alignItems: isMobile ? "stretch" : "center", justifyContent: "flex-end" }}>
                                <button className="mpcc-btn mpcc-btn-text" onClick={handleOpenCustomize}>
                                    <SettingsIcon size={16} />
                                    {CONFIG.texts.customize}
                                </button>
                                <button className="mpcc-btn mpcc-btn-secondary" onClick={handleEssentialOnly}>
                                    <ShieldIcon size={16} />
                                    {CONFIG.texts.essentialOnly}
                                </button>
                                <button className="mpcc-btn mpcc-btn-primary" onClick={handleAcceptAll}>
                                    <CheckIcon size={16} />
                                    {CONFIG.texts.acceptAll}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de personalizacao */}
            {showBanner && showCustomize && (
                <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "16px" : "24px", zIndex: 2147483645, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
                    <div style={{ width: "100%", maxWidth: "500px", maxHeight: isMobile ? "90vh" : "80vh", background: CONFIG.colors.background, borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden", transform: isAnimating ? "scale(1)" : "scale(0.95)", opacity: isAnimating ? 1 : 0, transition: "all 0.3s ease" }}>
                        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${CONFIG.colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${CONFIG.colors.primary}20`, display: "flex", alignItems: "center", justifyContent: "center", color: CONFIG.colors.primaryHover }}>
                                    <SettingsIcon size={22} />
                                </div>
                                <h3 style={{ fontSize: "18px", fontWeight: 700, color: CONFIG.colors.text, margin: 0 }}>Preferencias de Cookies</h3>
                            </div>
                            <button onClick={handleCloseCustomize} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: CONFIG.colors.textMuted }}>
                                <CloseIcon size={20} />
                            </button>
                        </div>
                        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                            <div className="mpcc-category">
                                <div style={{ flex: 1, marginRight: "16px" }}>
                                    <h4 style={{ fontSize: "15px", fontWeight: 600, color: CONFIG.colors.text, margin: "0 0 4px 0" }}>{CONFIG.texts.categories.essential.title}</h4>
                                    <p style={{ fontSize: "13px", color: CONFIG.colors.textMuted, margin: 0, lineHeight: 1.5 }}>{CONFIG.texts.categories.essential.description}</p>
                                </div>
                                <Toggle checked={true} onChange={() => {}} disabled={true} />
                            </div>
                            <div className="mpcc-category">
                                <div style={{ flex: 1, marginRight: "16px" }}>
                                    <h4 style={{ fontSize: "15px", fontWeight: 600, color: CONFIG.colors.text, margin: "0 0 4px 0" }}>{CONFIG.texts.categories.analytics.title}</h4>
                                    <p style={{ fontSize: "13px", color: CONFIG.colors.textMuted, margin: 0, lineHeight: 1.5 }}>{CONFIG.texts.categories.analytics.description}</p>
                                </div>
                                <Toggle checked={analyticsEnabled} onChange={setAnalyticsEnabled} />
                            </div>
                            <div className="mpcc-category">
                                <div style={{ flex: 1, marginRight: "16px" }}>
                                    <h4 style={{ fontSize: "15px", fontWeight: 600, color: CONFIG.colors.text, margin: "0 0 4px 0" }}>{CONFIG.texts.categories.marketing.title}</h4>
                                    <p style={{ fontSize: "13px", color: CONFIG.colors.textMuted, margin: 0, lineHeight: 1.5 }}>{CONFIG.texts.categories.marketing.description}</p>
                                </div>
                                <Toggle checked={marketingEnabled} onChange={setMarketingEnabled} />
                            </div>
                            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${CONFIG.colors.border}` }}>
                                <p style={{ fontSize: "12px", color: CONFIG.colors.textMuted, margin: 0 }}>
                                    Leia nossa{" "}
                                    <a href={CONFIG.privacyUrl} target="_blank" rel="noopener noreferrer" className="mpcc-link">Politica de Privacidade</a>{" "}
                                    e <a href={CONFIG.termsUrl} target="_blank" rel="noopener noreferrer" className="mpcc-link">Termos de Uso</a>
                                </p>
                            </div>
                        </div>
                        <div style={{ padding: "16px 24px", borderTop: `1px solid ${CONFIG.colors.border}`, display: "flex", flexDirection: isMobile ? "column" : "row", gap: "12px", justifyContent: "flex-end" }}>
                            <button className="mpcc-btn mpcc-btn-secondary" onClick={handleEssentialOnly}>{CONFIG.texts.essentialOnly}</button>
                            <button className="mpcc-btn mpcc-btn-primary" onClick={handleSavePreferences}>{CONFIG.texts.save}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
