import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PdfExportOptions {
  title: string;
  companyName: string;
  companyLogoUrl?: string | null;
  headers: string[];
  rows: string[][];
  fileName: string;
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  } catch {
    return null;
  }
}

export async function exportToPdf({ title, companyName, companyLogoUrl, headers, rows, fileName }: PdfExportOptions) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors matching Studio Obelisco
  const obsidian = [11, 12, 16] as const;
  const basalt = [31, 40, 51] as const;
  const gold: [number, number, number] = [197, 168, 128];
  const ash = [207, 207, 207] as const;
  const mutedAsh = [140, 140, 140] as const;

  // Background
  doc.setFillColor(...obsidian);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

  // Header bar
  doc.setFillColor(...basalt);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Gold accent line
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(0, 28, pageWidth, 28);

  let headerY = 10;

  // Logo
  if (companyLogoUrl) {
    const logoData = await loadImageAsBase64(companyLogoUrl);
    if (logoData) {
      try {
        doc.addImage(logoData, "PNG", 12, 5, 18, 18);
        headerY = 10;
      } catch {
        // skip logo
      }
    }
  }

  const textX = companyLogoUrl ? 34 : 12;

  // Company name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...gold);
  doc.text(companyName, textX, headerY);

  // Report title
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedAsh);
  doc.text(title, textX, headerY + 6);

  // Date
  doc.setFontSize(8);
  doc.setTextColor(...mutedAsh);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`, textX, headerY + 11);

  // "PROGRAMA DE RECOMPENSAS" right-aligned
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...gold);
  doc.text("PROGRAMA DE RECOMPENSAS", pageWidth - 12, headerY + 3, { align: "right" });

  // Table
  autoTable(doc, {
    startY: 34,
    head: [headers],
    body: rows,
    theme: "plain",
    styles: {
      fillColor: obsidian as unknown as [number, number, number],
      textColor: ash as unknown as [number, number, number],
      fontSize: 8,
      cellPadding: 3,
      lineColor: basalt as unknown as [number, number, number],
      lineWidth: 0.2,
      font: "helvetica",
    },
    headStyles: {
      fillColor: basalt as unknown as [number, number, number],
      textColor: gold,
      fontSize: 8,
      fontStyle: "bold",
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [16, 18, 24] as [number, number, number],
    },
    margin: { left: 12, right: 12 },
    didDrawPage: (data) => {
      // Footer on each page
      const pageH = doc.internal.pageSize.getHeight();
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.3);
      doc.line(12, pageH - 12, pageWidth - 12, pageH - 12);
      doc.setFontSize(7);
      doc.setTextColor(...mutedAsh);
      doc.text(companyName + " — Programa de Recompensas", 12, pageH - 7);
      const pageNum = `Página ${(doc as any).internal.getCurrentPageInfo().pageNumber}`;
      doc.text(pageNum, pageWidth - 12, pageH - 7, { align: "right" });
    },
  });

  doc.save(`${fileName}.pdf`);
}
