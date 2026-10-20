"use client";

import { Check, Copy, Download, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface QuoteSharerProps {
  articleTitle: string;
  authorName: string;
  categoryName: string;
  url: string;
  defaultQuote: string;
}

type CardTheme = "forest" | "paper" | "midnight";

export function QuoteSharer({
  articleTitle,
  authorName,
  categoryName,
  url,
  defaultQuote,
}: QuoteSharerProps) {
  const [selectedText, setSelectedText] = useState("");
  const [toolbarPos, setToolbarPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeQuote, setActiveQuote] = useState("");
  const [theme, setTheme] = useState<CardTheme>("forest");
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Monitor text selections within the article prose
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setToolbarPos(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 10) {
        setToolbarPos(null);
        return;
      }

      // Check if the selection is inside article prose
      const anchorNode = selection.anchorNode;
      const element =
        anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
      if (!element?.closest(".article-prose")) {
        setToolbarPos(null);
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setSelectedText(text);
          // Position toolbar centered right above the selection
          const left = Math.max(
            80,
            Math.min(
              window.innerWidth - 80,
              rect.left + rect.width / 2 + window.scrollX
            )
          );
          const top = rect.top + window.scrollY - 46;
          setToolbarPos({ top, left });
        }
      } catch {
        setToolbarPos(null);
      }
    };

    const handleMouseUp = () => {
      setTimeout(handleSelection, 20);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keyup", handleSelection);

    // Listen to custom trigger event from ShareControls button
    const handleOpenCustom = () => {
      const currentSel = window.getSelection()?.toString().trim();
      setActiveQuote(currentSel && currentSel.length > 10 ? currentSel : defaultQuote);
      setIsModalOpen(true);
      setToolbarPos(null);
    };

    window.addEventListener("topicora:open-quote-card", handleOpenCustom);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keyup", handleSelection);
      window.removeEventListener("topicora:open-quote-card", handleOpenCustom);
    };
  }, [defaultQuote]);

  // Open modal with selected text
  const openModalWithQuote = (quoteToUse: string) => {
    setActiveQuote(quoteToUse);
    setIsModalOpen(true);
    setToolbarPos(null);
  };

  // Quick copy quote from floating toolbar
  const copySelectionText = async () => {
    if (!selectedText) return;
    const formatted = `"${selectedText}"\n\n— ${authorName}, ${articleTitle}\n${url}`;
    await navigator.clipboard.writeText(formatted);
    setCopiedText(true);
    setTimeout(() => {
      setCopiedText(false);
      setToolbarPos(null);
    }, 1500);
  };

  // Render canvas card
  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI 2x canvas
    const width = 1200;
    const height = 675;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Color definitions based on theme
    const themes = {
      forest: {
        bg: "#1c3831",
        cardBorder: "#2a5247",
        accent: "#83b8aa",
        badgeBg: "#284e44",
        badgeText: "#83b8aa",
        text: "#ffffff",
        quoteMark: "rgba(131, 184, 170, 0.25)",
        metaText: "#c1ded6",
        subText: "#8ea39d",
        divider: "#2a5247",
      },
      paper: {
        bg: "#f8f5ee",
        cardBorder: "#dcd7cb",
        accent: "#315b54",
        badgeBg: "#ebe6dc",
        badgeText: "#315b54",
        text: "#191919",
        quoteMark: "rgba(49, 91, 84, 0.15)",
        metaText: "#191919",
        subText: "#66645f",
        divider: "#ded9cc",
      },
      midnight: {
        bg: "#131514",
        cardBorder: "#2e322f",
        accent: "#83b8aa",
        badgeBg: "#222624",
        badgeText: "#83b8aa",
        text: "#f4f1e9",
        quoteMark: "rgba(255, 255, 255, 0.1)",
        metaText: "#f4f1e9",
        subText: "#9da19e",
        divider: "#2a2e2b",
      },
    };

    const c = themes[theme];

    // Background
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle inner border
    ctx.strokeStyle = c.cardBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, width - 48, height - 48);

    // Header: Topicora Logo + Category Badge
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = c.text;
    ctx.fillText("TOPICORA", 64, 76);

    // Category Pill
    const categoryUpper = categoryName.toUpperCase();
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    const badgeWidth = ctx.measureText(categoryUpper).width + 24;
    ctx.fillStyle = c.badgeBg;
    ctx.beginPath();
    ctx.roundRect(width - 64 - badgeWidth, 58, badgeWidth, 26, 13);
    ctx.fill();

    ctx.fillStyle = c.badgeText;
    ctx.fillText(categoryUpper, width - 64 - badgeWidth + 12, 75);

    // Giant elegant quotation mark in background
    ctx.font = "italic bold 180px Georgia, serif";
    ctx.fillStyle = c.quoteMark;
    ctx.fillText("“", 56, 210);

    // Quote text layout
    const quote = activeQuote || defaultQuote;
    const quoteLength = quote.length;

    let fontSize = 34;
    let lineHeight = 48;

    if (quoteLength > 280) {
      fontSize = 22;
      lineHeight = 34;
    } else if (quoteLength > 180) {
      fontSize = 26;
      lineHeight = 40;
    } else if (quoteLength > 100) {
      fontSize = 30;
      lineHeight = 44;
    }

    ctx.font = `600 ${fontSize}px Georgia, serif`;
    ctx.fillStyle = c.text;

    // Word wrapping
    const maxTextWidth = width - 140;
    const words = quote.split(" ");
    let line = "";
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Calculate vertical centering for quote block
    const maxDisplayLines = 7;
    const renderedLines = lines.slice(0, maxDisplayLines);
    if (lines.length > maxDisplayLines) {
      renderedLines[maxDisplayLines - 1] += "...";
    }

    const textBlockHeight = renderedLines.length * lineHeight;
    const startY = Math.max(145, 130 + (320 - textBlockHeight) / 2);

    for (let i = 0; i < renderedLines.length; i++) {
      ctx.fillText(renderedLines[i], 70, startY + i * lineHeight);
    }

    // Divider line
    const footerY = height - 100;
    ctx.strokeStyle = c.divider;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(64, footerY);
    ctx.lineTo(width - 64, footerY);
    ctx.stroke();

    // Footer: Author & Article Title
    ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = c.metaText;
    ctx.fillText(authorName, 64, footerY + 36);

    ctx.font = "normal 14px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = c.subText;
    const truncatedTitle =
      articleTitle.length > 60
        ? articleTitle.substring(0, 57) + "..."
        : articleTitle;
    ctx.fillText(truncatedTitle, 64, footerY + 60);

    // Footer Right: Domain
    ctx.font = "600 14px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = c.accent;
    const domain = "topicora.kabirbisanal.com";
    const domainWidth = ctx.measureText(domain).width;
    ctx.fillText(domain, width - 64 - domainWidth, footerY + 48);
  }, [activeQuote, defaultQuote, theme, categoryName, authorName, articleTitle]);

  useEffect(() => {
    if (isModalOpen) {
      // Allow canvas DOM to mount
      setTimeout(() => {
        drawCard();
      }, 50);
    }
  }, [isModalOpen, drawCard]);

  // Download image
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `topicora-quote-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Copy image to clipboard
  const copyImageToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsGenerating(true);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2000);
        } catch {
          // Fallback to downloading if clipboard image write fails
          downloadImage();
        } finally {
          setIsGenerating(false);
        }
      });
    } catch {
      downloadImage();
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Floating Selection Toolbar */}
      {toolbarPos ? (
        <div
          className="fixed z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/80 bg-surface/95 px-2 py-1 shadow-xl backdrop-blur-md transition-all duration-150 animate-in fade-in zoom-in-95"
          style={{ top: `${toolbarPos.top}px`, left: `${toolbarPos.left}px` }}
          role="toolbar"
          aria-label="Selection options"
        >
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted hover:text-accent transition-colors"
            onClick={() => openModalWithQuote(selectedText)}
          >
            <Sparkles size={14} className="text-accent" />
            <span>Quote card</span>
          </button>
          <div className="h-4 w-px bg-border" />
          <button
            type="button"
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={copySelectionText}
            title="Copy quote with citation"
          >
            {copiedText ? (
              <Check size={14} className="text-accent" />
            ) : (
              <Copy size={14} />
            )}
            <span>{copiedText ? "Copied" : "Copy"}</span>
          </button>
        </div>
      ) : null}

      {/* Quote Card Creator Modal */}
      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Sparkles size={16} />
                </span>
                <h3 className="font-serif text-lg font-bold">
                  Editorial Quote Card
                </h3>
              </div>
              <button
                type="button"
                className="button-ghost size-9 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close quote card modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Editable quote textarea */}
            <div className="mb-4">
              <label
                htmlFor="quote-text"
                className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider"
              >
                Quote Text
              </label>
              <textarea
                id="quote-text"
                rows={3}
                value={activeQuote}
                onChange={(e) => setActiveQuote(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-accent focus:outline-none"
                placeholder="Type or refine your quote..."
              />
            </div>

            {/* Theme Selector */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1">
                Style:
              </span>
              <button
                type="button"
                onClick={() => setTheme("forest")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  theme === "forest"
                    ? "bg-[#1c3831] text-white ring-2 ring-accent shadow-sm"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                Forest Sage
              </button>
              <button
                type="button"
                onClick={() => setTheme("paper")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  theme === "paper"
                    ? "bg-[#f8f5ee] text-[#191919] ring-2 ring-accent shadow-sm border border-[#dcd7cb]"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                Warm Paper
              </button>
              <button
                type="button"
                onClick={() => setTheme("midnight")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  theme === "midnight"
                    ? "bg-[#131514] text-[#f4f1e9] ring-2 ring-accent shadow-sm"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                Midnight
              </button>
            </div>

            {/* Canvas Preview Container */}
            <div className="overflow-hidden rounded-xl border border-border bg-background shadow-inner">
              <canvas
                ref={canvasRef}
                className="w-full h-auto block aspect-[16/9]"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={copyImageToClipboard}
                disabled={isGenerating}
                className="button-primary gap-2"
              >
                {copiedImage ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedImage ? "Copied image!" : "Copy image"}</span>
              </button>
              <button
                type="button"
                onClick={downloadImage}
                className="button-secondary gap-2"
              >
                <Download size={16} />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
