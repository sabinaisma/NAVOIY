import { jsPDF } from "jspdf";
import { Story, ImageMap } from "../types";

export const generatePDF = (story: Story, images: ImageMap) => {
  // Orientation 'p' (portrait), unit 'mm', format 'a4'
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxLineWidth = pageWidth - margin * 2;
  
  let y = margin;
  const lineHeight = 6;

  // Helper to add text with wrapping
  const addText = (text: string, fontSize: number = 12, fontStyle: string = "normal", color: string = "#000000") => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle); // Using Helvetica for better Latin support
    doc.setTextColor(color);

    const lines = doc.splitTextToSize(text, maxLineWidth);
    
    lines.forEach((line: string) => {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });
    y += lineHeight / 2; // Extra gap after block
  };

  // Helper to add image
  const addImage = (base64: string) => {
    if (!base64) return;
    
    const imgWidth = 120;
    const imgHeight = 90; // 4:3 aspect ratio roughly
    const x = (pageWidth - imgWidth) / 2;

    if (y + imgHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    try {
        doc.addImage(base64, 'PNG', x, y, imgWidth, imgHeight);
        y += imgHeight + 10;
    } catch (e) {
        console.error("Error adding image to PDF", e);
    }
  };

  // --- Title Page ---
  y = 80;
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(story.title, pageWidth / 2, y, { align: "center", maxWidth: maxLineWidth });
  
  y += 20;
  doc.setFontSize(14);
  doc.setFont("helvetica", "italic");
  doc.setTextColor("#666666");
  doc.text("Created with DreamWeaver Storybook", pageWidth / 2, y, { align: "center" });
  
  doc.addPage();
  y = margin;

  // --- World Guide ---
  addText("The World (Dunyo)", 18, "bold", "#8b5cf6"); // Magic color
  if (images[1]) addImage(images[1]);
  
  addText("Geografiya:", 12, "bold");
  addText(story.world.geography);
  
  addText("Atmosfera:", 12, "bold");
  addText(story.world.atmosphere);
  
  addText("Madaniyat:", 12, "bold");
  addText(story.world.culture);
  
  doc.addPage();
  y = margin;

  // --- Characters ---
  addText("Characters (Qahramonlar)", 18, "bold", "#8b5cf6");
  if (images[2]) addImage(images[2]);

  story.characters.forEach((char) => {
    addText(char.name, 14, "bold");
    addText(char.description, 10, "italic", "#555555");
    addText(char.traits);
    addText(char.backstory);
    y += 5;
  });

  doc.addPage();
  y = margin;

  // --- Chapters ---
  story.chapters.forEach((chapter, index) => {
    const pageIndex = index + 3; // 0=Cover, 1=World, 2=Chars
    
    // Chapter Title
    addText(chapter.title, 18, "bold");
    
    // Chapter Image
    if (images[pageIndex]) {
      addImage(images[pageIndex]);
    } else {
        y += 5;
    }

    // Content
    addText(chapter.content, 12, "normal");
    
    // Page Break after chapter
    if (index < story.chapters.length - 1) {
        doc.addPage();
        y = margin;
    }
  });

  // --- Ending ---
  doc.addPage();
  y = margin;
  addText("Xotima", 18, "bold", "#8b5cf6");
  addText(story.ending, 12, "italic");

  // Save
  const cleanTitle = story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${cleanTitle || 'story'}.pdf`);
};