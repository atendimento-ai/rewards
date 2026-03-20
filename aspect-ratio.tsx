import { useEffect, useState } from "react";

interface VaultScanLineProps {
  trigger: number; // changes trigger the scan
}

export function VaultScanLine({ trigger }: VaultScanLineProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    if (trigger === 0) return; // don't scan on first render
    if (scanCount === 0) {
      setScanCount(1);
      return; // skip initial mount
    }
    setIsScanning(true);
    const timeout = setTimeout(() => setIsScanning(false), 1500);
    return () => clearTimeout(timeout);
  }, [trigger]);

  if (!isScanning) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      <div className="vault-scan-active absolute left-0 right-0 h-[2px]" style={{
        background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 20%, hsl(var(--gold-glow)) 50%, hsl(var(--primary)) 80%, transparent 100%)",
        boxShadow: "0 0 20px 4px hsl(var(--primary) / 0.4), 0 0 60px 8px hsl(var(--primary) / 0.15)",
      }} />
    </div>
  );
}
