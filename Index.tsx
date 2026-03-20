@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Studio Obelisco — The Vault */
    --background: 220 20% 4%;          /* Obsidian #0B0C10 */
    --foreground: 0 0% 81%;            /* Ash #CFCFCF */
    
    --card: 213 23% 16%;               /* Basalt #1F2833 */
    --card-foreground: 0 0% 81%;
    
    --popover: 213 23% 16%;
    --popover-foreground: 0 0% 81%;
    
    --primary: 35 30% 64%;             /* Gold Leaf #C5A880 */
    --primary-foreground: 220 20% 4%;
    
    --secondary: 213 23% 20%;
    --secondary-foreground: 0 0% 81%;
    
    --muted: 213 15% 12%;
    --muted-foreground: 0 0% 55%;
    
    --accent: 213 23% 20%;
    --accent-foreground: 0 0% 81%;
    
    --destructive: 0 62% 40%;
    --destructive-foreground: 0 0% 81%;
    
    --border: 213 15% 20%;
    --input: 213 15% 20%;
    --ring: 35 30% 64%;
    
    --radius: 0.125rem;

    /* Semantic status */
    --status-pending: 38 92% 50%;
    --status-approved: 142 71% 45%;
    --status-rejected: 0 84% 50%;
    --status-delivered: 217 91% 60%;
    --status-purchasing: 280 60% 50%;

    /* Gold accent glow */
    --gold-glow: 35 50% 75%;

    --sidebar-background: 220 20% 4%;
    --sidebar-foreground: 0 0% 81%;
    --sidebar-primary: 35 30% 64%;
    --sidebar-primary-foreground: 220 20% 4%;
    --sidebar-accent: 213 23% 16%;
    --sidebar-accent-foreground: 0 0% 81%;
    --sidebar-border: 213 15% 20%;
    --sidebar-ring: 35 30% 64%;

    /* Typography */
    --font-display: 'Space Grotesk', sans-serif;
    --font-body: 'Inter', sans-serif;

    /* Shadows — no drop shadows, only tone shifts */
    --shadow-vault: 0 0 0 1px hsl(213 15% 14%);
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family: var(--font-body);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
  }
}

/* Vault scan — slow horizontal light sweep */
@keyframes vault-scan-sweep {
  0% { top: -2px; opacity: 0; }
  5% { opacity: 1; }
  95% { opacity: 1; }
  100% { top: calc(100% + 2px); opacity: 0; }
}

.vault-scan-active {
  animation: vault-scan-sweep 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Odometer digit roll */
@keyframes odometer-digit-roll {
  0% { transform: translateY(-100%); opacity: 0; }
  40% { opacity: 1; }
  70% { transform: translateY(4%); }
  100% { transform: translateY(0); opacity: 1; }
}

.animate-odometer-digit {
  animation: odometer-digit-roll 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: hsl(220 20% 4%);
}
::-webkit-scrollbar-thumb {
  background: hsl(213 15% 20%);
  border-radius: 0;
}
