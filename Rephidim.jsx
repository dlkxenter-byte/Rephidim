"use client";

import React, { useState, useEffect, useCallback } from "react";

const PALETTE = {
  ink: "#1B2430",
  inkSoft: "#242F3D",
  sand: "#EDE3D0",
  sandDeep: "#C9A66B",
  teal: "#2F7566",
  tealSoft: "#3E8F7E",
  ember: "#B5651D",
  cream: "#F5F1E8",
  line: "#3A4658",
};

const TIME_SLOTS = [
  { id: "matin", label: "Matin · 8h–12h" },
  { id: "apres-midi", label: "Après-midi · 13h–18h" },
  { id: "soiree", label: "Soirée · 19h–1h" },
];

const CAPACITY = 300;

// --- Configuration Supabase --------------------------------------------
// Remplace ces deux valeurs par celles de ton projet Supabase
// (Project Settings > API dans le tableau de bord Supabase).
const SUPABASE_URL = "https://lnovrubizqyvknkrvacv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Fz_Pi0X_b4xqGckI2rFcZg_PFcMqsxq";
const IS_CONFIGURED =
  !SUPABASE_URL.includes("YOUR-PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY");

async function supabaseRequest(path, { method = "GET", body, token } = {}) {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
  };
  if (method !== "GET") headers["Prefer"] = "return=representation";
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      msg = data.message || data.error_description || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function loginAdmin(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Email ou mot de passe incorrect.");
  return res.json();
}

function useGoogleFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
}

function WaterDivider({ flip }) {
  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        lineHeight: 0,
        transform: flip ? "scaleY(-1)" : "none",
      }}
    >
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "40px", display: "block" }}
      >
        <path
          d="M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,60 L0,60 Z"
          fill={PALETTE.teal}
          opacity="0.35"
        >
          <animate
            attributeName="d"
            dur="9s"
            repeatCount="indefinite"
            values="
              M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,60 L0,60 Z;
              M0,30 C150,0 350,60 600,30 C850,0 1050,60 1200,30 L1200,60 L0,60 Z;
              M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,60 L0,60 Z"
          />
        </path>
      </svg>
    </div>
  );
}

function StoneCard({ children, style }) {
  return (
    <div
      style={{
        background: PALETTE.inkSoft,
        border: `1px solid ${PALETTE.line}`,
        borderRadius: "4px",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.3), 0 12px 30px rgba(0,0,0,0.25)",
        padding: "28px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label style={{ display: "block", marginBottom: "20px" }}>
      <span
        style={{
          display: "block",
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "12px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: PALETTE.sandDeep,
          marginBottom: "8px",
        }}
      >
        {label}
      </span>
      {children}
      {hint && (
        <span
          style={{
            display: "block",
            marginTop: "6px",
            fontSize: "12px",
            color: "#8A93A3",
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: PALETTE.ink,
  border: `1px solid ${PALETTE.line}`,
  borderRadius: "3px",
  padding: "10px 12px",
  color: PALETTE.cream,
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: "14px",
  outline: "none",
};

function StatusBadge({ status }) {
  const map = {
    pending: { label: "En attente", color: PALETTE.sandDeep, bg: "rgba(201,166,107,0.12)" },
    approved: { label: "Validée", color: PALETTE.tealSoft, bg: "rgba(62,143,126,0.15)" },
    rejected: { label: "Refusée", color: "#C15B4A", bg: "rgba(193,91,74,0.12)" },
  };
  const s = map[status] || map.pending;
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "11px",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.color}55`,
        borderRadius: "2px",
        padding: "3px 8px",
      }}
    >
      {s.label}
    </span>
  );
}

function ConfigBanner() {
  return (
    <div
      style={{
        background: "rgba(181,101,29,0.12)",
        border: `1px solid ${PALETTE.ember}`,
        borderRadius: "3px",
        padding: "14px 18px",
        margin: "0 6vw 0",
        fontSize: "13px",
        lineHeight: 1.6,
        color: PALETTE.sand,
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <strong>Configuration Supabase requise.</strong> Renseigne SUPABASE_URL et
      SUPABASE_ANON_KEY en haut du fichier pour connecter l'application à ta base de
      données. Tant que ce n'est pas fait, les réservations et la connexion admin ne
      fonctionneront pas.
    </div>
  );
}

export default function Rephidim() {
  useGoogleFonts();

  const [view, setView] = useState("public");

  // Réservations chargées depuis Supabase (vue admin) ou dates occupées (vue publique)
  const [reservations, setReservations] = useState([]);
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    slot: "matin",
    guests: "",
    vaisselle: false,
    traiteur: false,
  });
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Session admin : le jeton n'est gardé qu'en mémoire (état React).
  // À la fermeture ou au rechargement de la page, il faut se reconnecter —
  // c'est voulu, les artifacts ne peuvent pas utiliser le stockage du navigateur.
  const [adminSession, setAdminSession] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const fetchOccupiedDates = useCallback(async () => {
    if (!IS_CONFIGURED) return;
    try {
      const data = await supabaseRequest("/rest/v1/rpc/public_occupied_dates", {
        method: "POST",
        body: {},
      });
      setOccupiedDates(data || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchAllReservations = useCallback(async (token) => {
    if (!IS_CONFIGURED) return;
    setLoadingList(true);
    try {
      const data = await supabaseRequest("/rest/v1/reservations?select=*&order=date.desc", {
        token,
      });
      setReservations(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchOccupiedDates();
  }, [fetchOccupiedDates]);

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submitReservation(e) {
    e.preventDefault();
    setError("");
    const guestsNum = Number(form.guests);
    if (!form.name || !form.email || !form.date) {
      setError("Merci de renseigner votre nom, votre email et une date.");
      return;
    }
    if (!guestsNum || guestsNum < 1) {
      setError("Indiquez un nombre d'invités valide.");
      return;
    }
    if (guestsNum > CAPACITY) {
      setError(`L'espace accueille ${CAPACITY} personnes maximum.`);
      return;
    }
    if (!IS_CONFIGURED) {
      setError("La base de données n'est pas encore configurée (voir le message ci-dessus).");
      return;
    }

    setSubmitting(true);
    try {
      await supabaseRequest("/rest/v1/reservations", {
        method: "POST",
        body: [
          {
            name: form.name,
            email: form.email,
            date: form.date,
            slot: form.slot,
            guests: guestsNum,
            vaisselle: form.vaisselle,
            traiteur: form.traiteur,
            status: "pending",
          },
        ],
      });
      setConfirmed({ date: form.date, slot: form.slot });
      setForm({
        name: "",
        email: "",
        date: "",
        slot: "matin",
        guests: "",
        vaisselle: false,
        traiteur: false,
      });
      fetchOccupiedDates();
    } catch (err) {
      setError("La demande n'a pas pu être enregistrée : " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitAdminLogin(e) {
    e.preventDefault();
    setAuthError("");
    if (!IS_CONFIGURED) {
      setAuthError("La base de données n'est pas encore configurée.");
      return;
    }
    setLoggingIn(true);
    try {
      const data = await loginAdmin(emailInput, passwordInput);
      setAdminSession(data.access_token);
      setPasswordInput("");
      fetchAllReservations(data.access_token);
    } catch (err) {
      setAuthError(err.message || "Connexion impossible.");
    } finally {
      setLoggingIn(false);
    }
  }

  function logoutAdmin() {
    setAdminSession(null);
    setReservations([]);
    setEmailInput("");
    setView("public");
  }

  async function setStatus(id, status) {
    try {
      await supabaseRequest(`/rest/v1/reservations?id=eq.${id}`, {
        method: "PATCH",
        body: { status },
        token: adminSession,
      });
      fetchAllReservations(adminSession);
      fetchOccupiedDates();
    } catch (err) {
      alert("Impossible de mettre à jour cette réservation : " + err.message);
    }
  }

  const pendingCount = reservations.filter((r) => r.status === "pending").length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PALETTE.ink,
        color: PALETTE.cream,
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "20px 6vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${PALETTE.line}`,
        }}
      >
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: "20px",
            letterSpacing: "0.04em",
          }}
        >
          REPHIDIM
        </div>
        <nav style={{ display: "flex", gap: "8px" }}>
          {["public", "admin"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "12px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                padding: "8px 14px",
                borderRadius: "3px",
                border: `1px solid ${view === v ? PALETTE.tealSoft : PALETTE.line}`,
                background: view === v ? "rgba(62,143,126,0.15)" : "transparent",
                color: view === v ? PALETTE.tealSoft : "#8A93A3",
                cursor: "pointer",
              }}
            >
              {v === "public"
                ? "Réserver"
                : `Admin${adminSession && pendingCount ? ` (${pendingCount})` : ""}`}
            </button>
          ))}
        </nav>
      </header>

      {!IS_CONFIGURED && (
        <div style={{ paddingTop: "20px" }}>
          <ConfigBanner />
        </div>
      )}

      {/* Hero */}
      <section style={{ padding: "72px 6vw 0", maxWidth: "780px" }}>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: PALETTE.sandDeep,
            marginBottom: "18px",
          }}
        >
          Un seul lieu · un seul rassemblement à la fois
        </p>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: "clamp(36px, 5vw, 58px)",
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          L'eau jaillit du rocher.
          <br />
          <span style={{ color: PALETTE.tealSoft }}>Le lieu se prépare pour vous.</span>
        </h1>
        <p
          style={{
            marginTop: "22px",
            fontSize: "16px",
            lineHeight: 1.6,
            color: "#C7CDD8",
            maxWidth: "560px",
          }}
        >
          Rephidim est la halte où l'on s'arrête pour rassembler les siens. Un grand
          espace, jusqu'à {CAPACITY} personnes, avec vaisselle et traiteur en option.
          Chaque demande est examinée avant confirmation.
        </p>
      </section>

      <div style={{ marginTop: "56px" }}>
        <WaterDivider />
      </div>

      {/* Main */}
      <main
        style={{
          background: PALETTE.inkSoft,
          padding: "56px 6vw 90px",
        }}
      >
        {view === "public" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)",
              gap: "40px",
              maxWidth: "1100px",
              margin: "0 auto",
            }}
            className="rephidim-grid"
          >
            <StoneCard>
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: "22px",
                  fontWeight: 600,
                  margin: "0 0 24px",
                }}
              >
                Demander une réservation
              </h2>

              {confirmed && (
                <div
                  style={{
                    border: `1px solid ${PALETTE.tealSoft}`,
                    background: "rgba(62,143,126,0.1)",
                    borderRadius: "3px",
                    padding: "14px 16px",
                    marginBottom: "22px",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  Demande envoyée pour le <strong>{confirmed.date}</strong> (
                  {TIME_SLOTS.find((s) => s.id === confirmed.slot)?.label}). Elle est{" "}
                  <StatusBadge status="pending" /> — un administrateur doit la valider.
                </div>
              )}

              {error && (
                <div
                  style={{
                    color: "#C15B4A",
                    fontSize: "13px",
                    marginBottom: "18px",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={submitReservation}>
                <Field label="Nom / organisation">
                  <input
                    style={inputStyle}
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="Nom complet"
                  />
                </Field>
                <Field label="Email">
                  <input
                    style={inputStyle}
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="vous@exemple.com"
                  />
                </Field>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <Field label="Date">
                      <input
                        style={inputStyle}
                        type="date"
                        value={form.date}
                        onChange={(e) => updateForm("date", e.target.value)}
                      />
                    </Field>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Field label="Créneau">
                      <select
                        style={inputStyle}
                        value={form.slot}
                        onChange={(e) => updateForm("slot", e.target.value)}
                      >
                        {TIME_SLOTS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
                <Field label="Nombre d'invités" hint={`Capacité maximale : ${CAPACITY} personnes`}>
                  <input
                    style={inputStyle}
                    type="number"
                    min="1"
                    max={CAPACITY}
                    value={form.guests}
                    onChange={(e) => updateForm("guests", e.target.value)}
                    placeholder="ex. 120"
                  />
                </Field>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    margin: "8px 0 26px",
                  }}
                >
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                    <input
                      type="checkbox"
                      checked={form.vaisselle}
                      onChange={(e) => updateForm("vaisselle", e.target.checked)}
                    />
                    Vaisselle en supplément
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                    <input
                      type="checkbox"
                      checked={form.traiteur}
                      onChange={(e) => updateForm("traiteur", e.target.checked)}
                    />
                    Service traiteur en supplément
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "3px",
                    border: "none",
                    background: PALETTE.teal,
                    color: PALETTE.cream,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "14px",
                    letterSpacing: "0.02em",
                    cursor: submitting ? "default" : "pointer",
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting ? "Envoi en cours…" : "Envoyer la demande de réservation"}
                </button>
              </form>
            </StoneCard>

            <div>
              <h3
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: PALETTE.sandDeep,
                  margin: "0 0 16px",
                }}
              >
                Déjà retenu
              </h3>
              <StoneCard style={{ padding: "20px" }}>
                {occupiedDates.length === 0 ? (
                  <p style={{ color: "#8A93A3", fontSize: "14px", margin: 0 }}>
                    Aucune date n'est encore réservée.
                  </p>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {occupiedDates.map((d, i) => (
                      <li
                        key={i}
                        style={{
                          padding: "10px 0",
                          borderBottom:
                            i < occupiedDates.length - 1 ? `1px solid ${PALETTE.line}` : "none",
                          fontSize: "13px",
                          fontFamily: "'IBM Plex Mono', monospace",
                          color: "#C7CDD8",
                        }}
                      >
                        {d.date} · {TIME_SLOTS.find((s) => s.id === d.slot)?.label ?? d.slot}
                        {d.status === "pending" ? " (en attente)" : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </StoneCard>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6E7789",
                  marginTop: "14px",
                  lineHeight: 1.6,
                }}
              >
                L'espace Rephidim n'accueille qu'un seul événement à la fois. Toute
                demande reste au statut « en attente » jusqu'à validation manuelle.
                Seules la date et le créneau sont visibles publiquement — jamais les
                coordonnées des demandeurs.
              </p>
            </div>
          </div>
        ) : !adminSession ? (
          <div style={{ maxWidth: "380px", margin: "0 auto" }}>
            <StoneCard>
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: "20px",
                  fontWeight: 600,
                  margin: "0 0 8px",
                }}
              >
                Accès administrateur
              </h2>
              <p style={{ fontSize: "13px", color: "#8A93A3", margin: "0 0 22px" }}>
                Connexion sécurisée via Supabase Auth.
              </p>
              {authError && (
                <div style={{ color: "#C15B4A", fontSize: "13px", marginBottom: "16px" }}>
                  {authError}
                </div>
              )}
              <form onSubmit={submitAdminLogin}>
                <Field label="Email">
                  <input
                    style={inputStyle}
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@rephidim.example"
                    autoFocus
                  />
                </Field>
                <Field label="Mot de passe">
                  <input
                    style={inputStyle}
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                  />
                </Field>
                <button
                  type="submit"
                  disabled={loggingIn}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "3px",
                    border: "none",
                    background: PALETTE.teal,
                    color: PALETTE.cream,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: loggingIn ? "default" : "pointer",
                    opacity: loggingIn ? 0.6 : 1,
                  }}
                >
                  {loggingIn ? "Connexion…" : "Se connecter"}
                </button>
              </form>
            </StoneCard>
          </div>
        ) : (
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "0 0 26px",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: "24px",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Réservations à valider
              </h2>
              <button
                onClick={logoutAdmin}
                style={{
                  fontSize: "12px",
                  padding: "7px 14px",
                  borderRadius: "3px",
                  border: `1px solid ${PALETTE.line}`,
                  background: "transparent",
                  color: "#8A93A3",
                  cursor: "pointer",
                }}
              >
                Se déconnecter
              </button>
            </div>
            {loadingList && (
              <p style={{ color: "#8A93A3", fontSize: "14px" }}>Chargement…</p>
            )}
            {!loadingList && reservations.length === 0 && (
              <p style={{ color: "#8A93A3" }}>Aucune réservation pour le moment.</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {reservations.map((r) => (
                <StoneCard key={r.id} style={{ padding: "20px 22px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "4px" }}>
                        {r.name}
                      </div>
                      <div style={{ fontSize: "13px", color: "#8A93A3" }}>{r.email}</div>
                      <div
                        style={{
                          marginTop: "10px",
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: "12px",
                          color: "#C7CDD8",
                        }}
                      >
                        {r.date} · {TIME_SLOTS.find((s) => s.id === r.slot)?.label} ·{" "}
                        {r.guests} invités
                      </div>
                      <div style={{ marginTop: "8px", fontSize: "12px", color: "#8A93A3" }}>
                        {r.vaisselle ? "Vaisselle ✓" : "Sans vaisselle"} ·{" "}
                        {r.traiteur ? "Traiteur ✓" : "Sans traiteur"}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                      <StatusBadge status={r.status} />
                      {r.status === "pending" && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => setStatus(r.id, "approved")}
                            style={{
                              fontSize: "12px",
                              padding: "6px 12px",
                              borderRadius: "3px",
                              border: `1px solid ${PALETTE.tealSoft}`,
                              background: "transparent",
                              color: PALETTE.tealSoft,
                              cursor: "pointer",
                            }}
                          >
                            Valider
                          </button>
                          <button
                            onClick={() => setStatus(r.id, "rejected")}
                            style={{
                              fontSize: "12px",
                              padding: "6px 12px",
                              borderRadius: "3px",
                              border: "1px solid #C15B4A",
                              background: "transparent",
                              color: "#C15B4A",
                              cursor: "pointer",
                            }}
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </StoneCard>
              ))}
            </div>
          </div>
        )}
      </main>

      <WaterDivider flip />
      <footer
        style={{
          padding: "26px 6vw",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "11px",
          color: "#6E7789",
          textAlign: "center",
        }}
      >
        REPHIDIM — un lieu, une halte, un rassemblement à la fois.
      </footer>

      <style>{`
        @media (max-width: 760px) {
          .rephidim-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
