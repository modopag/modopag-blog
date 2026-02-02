// ============================================
// WHATSAPP LEAD CAPTURE - MODOPAG v4.7
// ============================================

import { useState, useEffect, useCallback } from "react"

const CONFIG = {
    whatsappNumber: "5571981470573",
    reportanaFormId: "49532",
    defaultMessage: "Olá! Vim pelo blog e quero conhecer a melhor máquina de cartão do Brasil!",
    tooltipText: "Fale com a gente!",
    headerTitle: "modoPAG",
    headerSubtitle: "Responde em poucos minutos",
    welcomeMessage: "Olá! Veio pelo blog da modoPAG?",
    welcomeSubMessage: "Tire suas dúvidas sobre maquininhas e taxas com nosso time!",
    buttonText: "Quero falar com o time!",
    privacyText: "Seus dados estão seguros conosco",
    placeholders: {
        name: "Seu nome",
        email: "Seu melhor e-mail",
        phone: "WhatsApp com DDD",
    },
    termsUrl: "https://modopag.com.br/termos-de-uso-e-condicoes-de-uso/",
    privacyUrl: "https://modopag.com.br/politicas-de-privacidade/",
    position: "left" as const,
    interceptWhatsAppLinks: true,
    debug: false,
}

const COLORS = {
    whatsappGreen: "#25D366",
    whatsappDark: "#128C7E",
}

interface UTMData {
    utm_source: string
    utm_medium: string
    utm_campaign: string
    utm_content: string
    utm_term: string
    fbclid: string
    gclid: string
    epik: string
    original_source: string
    landing_page: string
    referrer: string
}

interface ModoPAGTracker {
    hasAdsConsent: () => boolean
    getFirstTouch: () => Record<string, string | null> | null
    getOriginalSource: () => string
    trackLead: (data: Record<string, unknown>) => string | null
    trackPinterestLead: (data: Record<string, unknown>) => string | null
    trackGoogleAdsLead: (data: Record<string, unknown>) => string | null
}

declare global {
    interface Window {
        modoPAG?: ModoPAGTracker
    }
}

function WhatsAppIcon({ size = 28 }: { size?: number }) {
    return (
        <svg viewBox="0 0 24 24" fill="#ffffff" width={size} height={size}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    )
}

function useModoPAGTracker() {
    const [tracker, setTracker] = useState<ModoPAGTracker | null>(null)
    useEffect(() => {
        const checkTracker = () => {
            if (window.modoPAG) {
                setTracker(window.modoPAG)
            } else {
                setTimeout(checkTracker, 100)
            }
        }
        checkTracker()
    }, [])
    return tracker
}

function getCookieValue(name: string): string | null {
    if (typeof document === "undefined") return null
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
    return match ? match[2] : null
}

function determineSource(data: Record<string, string | null | undefined>): string {
    if (!data) return "direct"
    if (data.fbclid) return "meta"
    if (data.gclid) return "google"
    if (data.epik) return "pinterest"
    if (data.ttclid) return "tiktok"
    if (data.utm_source) {
        const source = data.utm_source.toLowerCase()
        if (["meta", "facebook", "instagram", "fb"].includes(source)) return "meta"
        if (source === "google") return "google"
        if (["youtube", "yt"].includes(source)) return "youtube"
        if (source === "pinterest") return "pinterest"
        if (source === "tiktok") return "tiktok"
        if (source === "blog") return "blog"
        return source
    }
    if (data.referrer) {
        if (data.referrer.includes("google")) return "google_organic"
        if (data.referrer.includes("facebook") || data.referrer.includes("instagram")) return "meta_organic"
        if (data.referrer.includes("youtube")) return "youtube"
        return "referral"
    }
    return "organic"
}

function getUTMData(tracker: ModoPAGTracker | null): UTMData {
    const defaultUTMs: UTMData = {
        utm_source: "", utm_medium: "", utm_campaign: "", utm_content: "", utm_term: "",
        fbclid: "", gclid: "", epik: "", original_source: "direct", landing_page: "", referrer: "",
    }
    if (typeof window === "undefined") return defaultUTMs

    if (tracker?.getFirstTouch) {
        const ft = tracker.getFirstTouch()
        if (ft) {
            return {
                utm_source: ft.utm_source || "", utm_medium: ft.utm_medium || "",
                utm_campaign: ft.utm_campaign || "", utm_content: ft.utm_content || "",
                utm_term: ft.utm_term || "", fbclid: ft.fbclid || "", gclid: ft.gclid || "",
                epik: ft.epik || "", original_source: tracker.getOriginalSource?.() || determineSource(ft),
                landing_page: ft.landing_page || "", referrer: ft.referrer || "",
            }
        }
    }

    try {
        const local = localStorage.getItem("mpag_first_touch")
        if (local) {
            const p = JSON.parse(local)
            return { ...defaultUTMs, ...p, original_source: determineSource(p) }
        }
    } catch {}

    try {
        const cookie = getCookieValue("mpag_first_touch")
        if (cookie) {
            const p = JSON.parse(decodeURIComponent(cookie))
            return { ...defaultUTMs, ...p, original_source: determineSource(p) }
        }
    } catch {}

    try {
        const session = sessionStorage.getItem("mpag_utm")
        if (session) {
            const p = JSON.parse(session)
            return { ...defaultUTMs, ...p, original_source: p.utm_source || "unknown" }
        }
    } catch {}

    const params = new URLSearchParams(window.location.search)
    const fbclid = params.get("fbclid") || ""
    const gclid = params.get("gclid") || ""
    const epik = params.get("epik") || ""
    const utm_source = params.get("utm_source") || ""
    return {
        utm_source, utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "", utm_content: params.get("utm_content") || "",
        utm_term: params.get("utm_term") || "", fbclid, gclid, epik,
        original_source: fbclid ? "meta" : gclid ? "google" : epik ? "pinterest" : utm_source || "direct",
        landing_page: window.location.pathname, referrer: document.referrer || "",
    }
}

function formatOriginLine(utmData: UTMData): string {
    const parts: string[] = []
    if (utmData.original_source && utmData.original_source !== "direct") {
        const names: Record<string, string> = {
            meta: "Meta Ads", google: "Google Ads", youtube: "YouTube",
            pinterest: "Pinterest", blog: "Blog", google_organic: "Google (organico)",
            meta_organic: "Meta (organico)", referral: "Referencia", organic: "Organico",
        }
        parts.push(names[utmData.original_source] || utmData.original_source)
    }
    if (utmData.utm_campaign) parts.push(`Camp: ${utmData.utm_campaign}`)
    if (utmData.utm_content) parts.push(`Ad: ${utmData.utm_content}`)
    if (utmData.fbclid) parts.push("Clique Meta")
    else if (utmData.gclid) parts.push("Clique Google")
    else if (utmData.epik) parts.push("Clique Pinterest")
    return parts.length ? `\n\n_${parts.join(" | ")}_` : ""
}

function identifySection(element: HTMLElement): string {
    const text = element.textContent?.toLowerCase() || ""
    if (text.includes("fale com nosso time")) return "secao_empreendedores"
    if (text.includes("fale com nossa equipe")) return "secao_faq"
    if (text.includes("peça") || text.includes("peca")) return "hero"
    if (text.includes("quero esse plano")) return "secao_planos"
    if (text.includes("simular")) return "simulador"
    const rect = element.getBoundingClientRect()
    const y = rect.top + window.scrollY
    if (y < 600) return "hero"
    if (y < 1500) return "secao_inicial"
    if (y < 3000) return "secao_meio"
    return "secao_final"
}

export default function WhatsAppLeadCapture() {
    const [isMounted, setIsMounted] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const tracker = useModoPAGTracker()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" })
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [clickSource, setClickSource] = useState("widget_flutuante")
    const [utmData, setUtmData] = useState<UTMData>({
        utm_source: "", utm_medium: "", utm_campaign: "", utm_content: "", utm_term: "",
        fbclid: "", gclid: "", epik: "", original_source: "direct", landing_page: "", referrer: "",
    })

    useEffect(() => {
        setIsMounted(true)
        setIsMobile(window.innerWidth <= 768)
        setUtmData(getUTMData(null))

        // Delay de 10 segundos antes de mostrar o widget
        const showTimer = setTimeout(() => setIsVisible(true), 10000)

        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false) }
        window.addEventListener("resize", handleResize)
        window.addEventListener("keydown", handleEsc)
        return () => {
            clearTimeout(showTimer)
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("keydown", handleEsc)
        }
    }, [])

    useEffect(() => {
        if (tracker) setUtmData(getUTMData(tracker))
    }, [tracker])

    const trackLeadEvent = useCallback((cat: string, data: typeof formData, extra: Record<string, unknown> = {}) => {
        if (!tracker?.hasAdsConsent?.()) return
        tracker.trackLead({
            content_name: "WhatsApp Lead Form", content_category: cat, value: 0, currency: "BRL",
            lead_name: data.name, lead_email: data.email, lead_phone: data.phone, ...extra,
        })
        tracker.trackPinterestLead?.({ email: data.email, phone: data.phone, first_name: data.name })
        const names = data.name.trim().split(/\s+/)
        tracker.trackGoogleAdsLead?.({ email: data.email, phone: data.phone, first_name: names[0] || "", last_name: names.slice(1).join(" ") || "" })
    }, [tracker])

    useEffect(() => {
        if (!isMounted || !CONFIG.interceptWhatsAppLinks) return
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const link = target.closest('a[href*="wa.me"], a[href*="whatsapp.com"], a[href*="whatsapp"]') as HTMLAnchorElement
            if (link) {
                e.preventDefault()
                e.stopPropagation()
                setClickSource(identifySection(link))
                setIsOpen(true)
            }
        }
        document.addEventListener("click", handleClick, true)
        return () => document.removeEventListener("click", handleClick, true)
    }, [isMounted])

    useEffect(() => {
        if (!isMounted) return
        document.body.style.overflow = isMobile && isOpen ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [isMobile, isOpen, isMounted])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.email || !formData.phone || !acceptedTerms) return
        setIsSubmitting(true)
        trackLeadEvent(clickSource, formData, { ...utmData })
        await new Promise(r => setTimeout(r, 600))
        const msg = `${CONFIG.defaultMessage}\n\nMeu nome é ${formData.name}\n${formData.email}\n${formData.phone}${formatOriginLine(utmData)}`
        window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank")
        setIsSubmitting(false)
        setIsOpen(false)
        setFormData({ name: "", email: "", phone: "" })
        setAcceptedTerms(false)
        setClickSource("widget_flutuante")
    }

    const isFormValid = formData.name && formData.email && formData.phone && acceptedTerms
    if (!isMounted || !isVisible) return null

    const isRight = CONFIG.position === "right"
    const posStyle = isRight ? { right: isMobile ? "16px" : "24px", left: "auto" } : { left: isMobile ? "16px" : "24px", right: "auto" }
    const modalPos = isRight ? { right: 0, left: "auto" } : { left: 0, right: "auto" }

    return (
        <>
            <style>{`
                @keyframes mp-pulse { 0%, 100% { opacity: 0; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
                @keyframes mp-slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .mp-input:focus { border-color: #25D366 !important; box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.15) !important; }
                .mp-input::placeholder { color: #999; }
                .mp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4) !important; }
                .mp-close:hover { background: rgba(255, 255, 255, 0.3) !important; }
                .mp-checkbox { width: 18px; height: 18px; accent-color: #25D366; cursor: pointer; flex-shrink: 0; }
                .mp-checkbox-label { font-size: 12px; color: #666; line-height: 1.4; cursor: pointer; }
                .mp-checkbox-label a { color: #25D366; text-decoration: underline; }
                .mp-checkbox-label a:hover { color: #128C7E; }
                .mp-wa-container { position: relative; display: inline-flex; align-items: center; }
                .mp-wa-tooltip { position: absolute; ${isRight ? "right: 76px;" : "left: 76px;"} top: 50%; transform: translateY(-50%) translateX(${isRight ? "10px" : "-10px"}); background: #fff; color: #1a1a2e; padding: 10px 16px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); font-size: 14px; font-weight: 500; white-space: nowrap; opacity: 0; pointer-events: none; transition: all 0.25s ease; z-index: 10; }
                .mp-wa-tooltip::after { content: ""; position: absolute; top: 50%; transform: translateY(-50%); ${isRight ? "right: -6px;" : "left: -6px;"} border: 6px solid transparent; ${isRight ? "border-left-color: #fff;" : "border-right-color: #fff;"} }
                .mp-wa-container:hover .mp-wa-tooltip { opacity: 1; transform: translateY(-50%) translateX(0); }
                .mp-wa-container:hover .mp-wa-button { transform: scale(1.1); box-shadow: 0 8px 32px rgba(37,211,102,0.5); }
                .mp-wa-button { width: ${isMobile ? "56px" : "64px"}; height: ${isMobile ? "56px" : "64px"}; border-radius: 50%; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); border: none; box-shadow: 0 4px 20px rgba(37,211,102,0.4); cursor: pointer; transition: all 0.3s ease; position: relative; display: flex; align-items: center; justify-content: center; }
                @media (max-width: 768px) { .mp-wa-tooltip { display: none !important; } }
            `}</style>

            {isMobile && isOpen && <div onClick={() => setIsOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2147483646 }} />}

            <div style={{ position: "fixed", bottom: isMobile ? "16px" : "24px", ...posStyle, zIndex: 2147483647, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
                {isOpen && (
                    <div style={{ position: isMobile ? "fixed" : "absolute", bottom: isMobile ? 0 : "80px", ...(isMobile ? { left: 0, right: 0 } : modalPos), width: isMobile ? "100%" : "340px", maxHeight: isMobile ? "85vh" : "calc(100vh - 120px)", background: "#fff", borderRadius: isMobile ? "20px 20px 0 0" : "20px", boxShadow: "0 12px 48px rgba(0,0,0,0.2)", overflow: "hidden", animation: "mp-slideUp 0.3s ease-out", display: "flex", flexDirection: "column" }}>
                        <div style={{ background: `linear-gradient(135deg, ${COLORS.whatsappGreen} 0%, ${COLORS.whatsappDark} 100%)`, padding: isMobile ? "16px 20px" : "20px", position: "relative" }}>
                            {isMobile && <div style={{ width: "40px", height: "4px", background: "rgba(255,255,255,0.4)", borderRadius: "2px", margin: "0 auto 12px" }} />}
                            <button className="mp-close" onClick={() => setIsOpen(false)} style={{ position: "absolute", top: isMobile ? "16px" : "12px", right: "12px", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "32px", height: "32px", color: "#fff", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><WhatsAppIcon size={28} /></div>
                                <div>
                                    <h3 style={{ color: "#fff", margin: 0, fontSize: "18px", fontWeight: 600 }}>{CONFIG.headerTitle}</h3>
                                    <p style={{ color: "rgba(255,255,255,0.9)", margin: "4px 0 0", fontSize: "13px" }}>{CONFIG.headerSubtitle}</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: isMobile ? "20px 20px 32px" : "20px", overflowY: "auto", flex: 1 }}>
                            <div style={{ background: "#f0f2f5", padding: "14px 16px", borderRadius: "0 12px 12px 12px", marginBottom: "20px" }}>
                                <p style={{ margin: 0, fontSize: "14px", color: "#1a1a2e", lineHeight: 1.5 }}><strong>{CONFIG.welcomeMessage}</strong></p>
                                <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#1a1a2e", lineHeight: 1.5 }}>{CONFIG.welcomeSubMessage}</p>
                            </div>
                            <form method="POST" action="/" data-rptn-form={CONFIG.reportanaFormId} data-whatsapp-form="true" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {(["name", "email", "phone"] as const).map((field) => (
                                    <input key={field} className="mp-input" type={field === "email" ? "email" : field === "phone" ? "tel" : "text"} name={field} data-rptn-field={field} placeholder={CONFIG.placeholders[field]} required autoComplete={field === "phone" ? "tel" : field} value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} style={{ width: "100%", padding: "14px 16px", border: "2px solid #e8e8e8", borderRadius: "12px", fontSize: "16px", outline: "none", transition: "all 0.2s", boxSizing: "border-box", background: "#fff" }} />
                                ))}
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 0" }}>
                                    <input type="checkbox" id="acceptTerms" name="accepted_terms" data-rptn-field="accepted_terms" className="mp-checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} style={{ marginTop: "2px" }} />
                                    <label htmlFor="acceptTerms" className="mp-checkbox-label">Li e concordo com os <a href={CONFIG.termsUrl} target="_blank" rel="noopener noreferrer">Termos de Uso</a> e <a href={CONFIG.privacyUrl} target="_blank" rel="noopener noreferrer">Politica de Privacidade</a></label>
                                </div>
                                <input type="hidden" name="click_source" data-rptn-field="click_source" value={clickSource} />
                                <input type="hidden" name="landing_page" data-rptn-field="landing_page" value={utmData.landing_page || (typeof window !== "undefined" ? window.location.href : "")} />
                                <input type="hidden" name="referrer" data-rptn-field="referrer" value={utmData.referrer || (typeof document !== "undefined" ? document.referrer : "")} />
                                <input type="hidden" name="utm_source" data-rptn-field="utm_source" value={utmData.utm_source} />
                                <input type="hidden" name="utm_medium" data-rptn-field="utm_medium" value={utmData.utm_medium} />
                                <input type="hidden" name="utm_campaign" data-rptn-field="utm_campaign" value={utmData.utm_campaign} />
                                <input type="hidden" name="utm_content" data-rptn-field="utm_content" value={utmData.utm_content} />
                                <input type="hidden" name="utm_term" data-rptn-field="utm_term" value={utmData.utm_term} />
                                <input type="hidden" name="fbclid" data-rptn-field="fbclid" value={utmData.fbclid} />
                                <input type="hidden" name="gclid" data-rptn-field="gclid" value={utmData.gclid} />
                                <input type="hidden" name="epik" data-rptn-field="epik" value={utmData.epik} />
                                <input type="hidden" name="original_source" data-rptn-field="original_source" value={utmData.original_source} />
                                <button className="mp-btn" type="submit" disabled={isSubmitting || !isFormValid} style={{ width: "100%", padding: isMobile ? "18px" : "16px", background: isSubmitting || !isFormValid ? "#ccc" : `linear-gradient(135deg, ${COLORS.whatsappGreen} 0%, ${COLORS.whatsappDark} 100%)`, border: "none", borderRadius: "12px", color: "#fff", fontSize: "16px", fontWeight: 600, cursor: isSubmitting || !isFormValid ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(37,211,102,0.3)" }}>
                                    {isSubmitting ? "Enviando..." : <><WhatsAppIcon size={20} />{CONFIG.buttonText}</>}
                                </button>
                            </form>
                            <p style={{ fontSize: "11px", color: "#999", textAlign: "center", margin: "12px 0 0" }}>{CONFIG.privacyText}</p>
                        </div>
                    </div>
                )}
                {!isOpen && (
                    <div className="mp-wa-container">
                        <div className="mp-wa-tooltip">{CONFIG.tooltipText}</div>
                        <button className="mp-wa-button" onClick={() => { setClickSource("widget_flutuante"); setIsOpen(true) }}>
                            <div style={{ position: "absolute", inset: "-4px", borderRadius: "50%", background: "rgba(37,211,102,0.3)", animation: "mp-pulse 2s ease-in-out infinite" }} />
                            <div style={{ position: "relative", zIndex: 1 }}><WhatsAppIcon size={isMobile ? 28 : 32} /></div>
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}
