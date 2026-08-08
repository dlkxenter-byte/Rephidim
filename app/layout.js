export const metadata = {
  title: "Rephidim — Réservation de l'espace événementiel",
  description:
    "Réservez l'espace événementiel Rephidim : jusqu'à 300 invités, vaisselle et traiteur en option.",
  verification: {
    google: "CB3imAU95n2zLb1lQrGTlO-EpKhE1_9mpR7t-_BZItU",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
