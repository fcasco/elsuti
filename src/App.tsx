import { useState, useMemo } from "react";

const DEFAULT_PARAMS = {
  name: "Dinamita",
  frontColor: "Silver",
  backColor: "Gold",
  font: "Ranchers",
  fontSize: 12,
  textDepth: 3,
  backgroundDepth: 4,
  backgroundOffset: 1.5,
  ringHoleDiameter: 5,
  ringThickness: 2,
  ringPosition: "top-center",
};

function generateOpenSCAD(params: typeof DEFAULT_PARAMS): string {
  const safeName = params.name || "NAME";
  return `// ============================================
// Dog Name Tag Generator - OpenSCAD
// ============================================
// 3-part tag: Text shape + Background outline + Ring
// The text IS the tag shape; the background is a
// slightly larger outline behind it.

// --- TEXT PARAMETERS ---
dog_name = "${safeName}";
font = "${params.font}";
font_size = ${params.fontSize};

// --- COLOR PARAMETERS (preview only) ---
front_color = "${params.frontColor}";
back_color = "${params.backColor}";

// --- DIMENSION PARAMETERS ---
text_depth = ${params.textDepth};              // Thickness of the text letters
background_depth = ${params.backgroundDepth};   // Thickness of the background outline
background_offset = ${params.backgroundOffset}; // How much bigger the background is vs text

// --- RING PARAMETERS ---
ring_hole_diameter = ${params.ringHoleDiameter}; // Inner diameter of the ring hole
ring_thickness = ${params.ringThickness};         // Thickness of the ring material
ring_position = "${params.ringPosition}";         // "top-center", "top-left", "top-right"

// ============================================
// MAIN RENDER
// ============================================

// Determine ring X position based on setting
ring_x = (ring_position == "top-center") ? 0 :
         (ring_position == "top-left") ? -text_width()/2 + ring_hole_diameter :
         text_width()/2 - ring_hole_diameter;

// Combine all parts with union for firm connections
color(front_color) {
    union() {
        text_part();
        ring_part();
    }
}
color(back_color) background_part();

// ============================================
// MODULES
// ============================================

// The 2D text shape (used by both text and background)
module name_text_2d() {
    text(
        text = dog_name,
        size = font_size,
        font = font,
        halign = "center",
        valign = "center"
    );
}

// Calculate text width for ring positioning
function text_width() = font_size * len(dog_name) * 0.6;
function text_height_approx() = font_size;

// PART 1: The text (front color) - the actual name letters
module text_part() {
    linear_extrude(height = text_depth) {
        name_text_2d();
    }
}

// PART 2: The background (back color) - same shape, slightly bigger
// This creates an outline/border effect around the text
module background_part() {
    linear_extrude(height = background_depth) {
        offset(r = background_offset) {
            name_text_2d();
        }
    }
}

// PART 3: The ring - flat extension of the back plate
// Same depth as background, positioned to overlap with it
module ring_part() {
    // Ring outer diameter
    ring_outer_d = ring_hole_diameter + ring_thickness * 2;
    
    // Position ring so its bottom edge touches the background top
    // Background top = text_height/2 + background_offset
    // Ring center Y = background top + ring_outer_d/2 - overlap
    ring_y = text_height_approx() / 2 + background_offset + ring_outer_d / 2 - 1;

    // Flat ring with same depth as background
    translate([ring_x, ring_y, 0]) {
        difference() {
            // Outer cylinder (same depth as background)
            cylinder(h = background_depth, d = ring_outer_d, $fn = 50);
            
            // Inner hole
            translate([0, 0, -1])
                cylinder(h = background_depth + 2, d = ring_hole_diameter, $fn = 50);
        }
    }
}

// ============================================
// NOTES
// ============================================
// To export for 3D printing:
// 1. Open this file in OpenSCAD
// 2. Press F6 to render
// 3. File -> Export -> STL
//
// The tag has 3 parts:
// - Text: The dog's name as the main shape
// - Background: A slightly larger outline behind the text
// - Ring: A flat extension at the top for collar attachment
//
// Tips:
// - background_offset controls how thick the border is
// - background_depth should be >= text_depth for best look
// - Use bold fonts for better visibility
// - The ring is flat and extends from the back plate
`;
}

function ParameterInput({
  label,
  value,
  onChange,
  type = "number",
  min,
  max,
  step,
  description,
}: {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[#fef9ef] mb-1">
        {label}
      </label>
      {description && (
        <p className="text-xs text-[#17c3b2]/70 mb-1">{description}</p>
      )}
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-[#0f3460]/50 border border-[#227c9d]/50 rounded-lg text-[#fef9ef] text-sm focus:ring-2 focus:ring-[#17c3b2] focus:border-transparent transition-all"
        >
          <option value="top-center">Top Center</option>
          <option value="top-left">Top Left</option>
          <option value="top-right">Top Right</option>
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          className="w-full px-3 py-2 bg-[#0f3460]/50 border border-[#227c9d]/50 rounded-lg text-[#fef9ef] text-sm focus:ring-2 focus:ring-[#17c3b2] focus:border-transparent transition-all"
        />
      )}
    </div>
  );
}

function TagPreview({ params }: { params: typeof DEFAULT_PARAMS }) {
  const svgWidth = 600;
  const svgHeight = 400;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2 + 10;

  // Scale factor for rendering text
  const scaleFactor = 4.2;
  const fontSize = params.fontSize * scaleFactor;

  // Use placeholder if name is empty
  const displayName = params.name || "NAME";
  
  // Estimate text dimensions
  const charWidth = fontSize * 0.62;
  const textTotalWidth = displayName.length * charWidth;
  const textTotalHeight = fontSize * 1.1;

  // Background offset in pixels
  const bgOffset = params.backgroundOffset * scaleFactor;

  // Ring dimensions
  const ringOuterR = (params.ringHoleDiameter / 2 + params.ringThickness) * scaleFactor * 0.5;
  const ringInnerR = (params.ringHoleDiameter / 2) * scaleFactor * 0.5;

  // Ring position - flat ring that overlaps with background top edge
  // Background top = text top - bgOffset
  // Ring center is positioned so bottom of ring overlaps into background
  const bgTop = cy - textTotalHeight / 2 - bgOffset;
  const ringY = bgTop + ringOuterR - 3; // Overlap by 3 pixels
  let ringX = cx;
  if (params.ringPosition === "top-left") {
    ringX = cx - textTotalWidth / 2 + fontSize * 0.4;
  } else if (params.ringPosition === "top-right") {
    ringX = cx + textTotalWidth / 2 - fontSize * 0.4;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Front View */}
      <h3 className="text-sm font-semibold text-[#ffcb77] uppercase tracking-wider">Front View</h3>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto drop-shadow-xl" style={{ maxWidth: svgWidth }}>
        <defs>
          {/* Background gradient (back color - apricot cream) */}
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffcb77" />
            <stop offset="30%" stopColor="#f5b84a" />
            <stop offset="60%" stopColor="#ffd88a" />
            <stop offset="100%" stopColor="#e8a83a" />
          </linearGradient>
          {/* Text gradient (front color - light sea green) */}
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#17c3b2" />
            <stop offset="30%" stopColor="#14a899" />
            <stop offset="60%" stopColor="#1dd4c2" />
            <stop offset="100%" stopColor="#12968a" />
          </linearGradient>
          {/* Ring gradient (cerulean) */}
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#227c9d" />
            <stop offset="50%" stopColor="#1a5f7a" />
            <stop offset="100%" stopColor="#2a8fb5" />
          </linearGradient>
          {/* Shadow */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
          </filter>
          <filter id="innerShadow">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Background outline (same shape as text, but bigger) */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="url(#bgGradient)"
          stroke="#e8a83a"
          strokeWidth={bgOffset * 2}
          strokeLinejoin="round"
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="Ranchers, cursive"
          filter="url(#shadow)"
          paintOrder="stroke fill"
        >
          {displayName}
        </text>

        {/* Text (front color) - sits on top of background */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="url(#textGradient)"
          stroke="#12968a"
          strokeWidth={0.5}
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="Ranchers, cursive"
        >
          {displayName}
        </text>

        {/* Text shine effect */}
        <text
          x={cx}
          y={cy - 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(255,255,255,0.2)"
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="Ranchers, cursive"
        >
          {displayName}
        </text>

        {/* Flat ring at top - extension of back plate */}
        {/* Ring outer */}
        <circle
          cx={ringX}
          cy={ringY}
          r={ringOuterR}
          fill="url(#ringGradient)"
          stroke="#777"
          strokeWidth={1}
          filter="url(#innerShadow)"
        />
        {/* Ring inner hole */}
        <circle
          cx={ringX}
          cy={ringY}
          r={ringInnerR}
          fill="#1a1a2e"
          stroke="#555"
          strokeWidth={0.8}
        />
        {/* Ring highlight */}
        <circle
          cx={ringX - ringOuterR * 0.2}
          cy={ringY - ringOuterR * 0.2}
          r={ringOuterR * 0.3}
          fill="rgba(255,255,255,0.2)"
        />

        {/* Annotations */}
        {/* Background offset annotation */}
        <line
          x1={cx + textTotalWidth / 2 + bgOffset + 10}
          y1={cy - fontSize * 0.3}
          x2={cx + textTotalWidth / 2 + bgOffset + 10}
          y2={cy + fontSize * 0.3}
          stroke="#17c3b2"
          strokeWidth={0.8}
        />
        <line
          x1={cx + textTotalWidth / 2 + 2}
          y1={cy}
          x2={cx + textTotalWidth / 2 + bgOffset + 10}
          y2={cy}
          stroke="#17c3b2"
          strokeWidth={0.8}
          strokeDasharray="2,2"
        />
        <text
          x={cx + textTotalWidth / 2 + bgOffset + 16}
          y={cy}
          fill="#fef9ef"
          fontSize={9}
          fontFamily="monospace"
          dominantBaseline="middle"
        >
          offset: {params.backgroundOffset}mm
        </text>

        {/* Ring diameter annotation */}
        <line
          x1={ringX - ringInnerR}
          y1={ringY - ringOuterR - 8}
          x2={ringX + ringInnerR}
          y2={ringY - ringOuterR - 8}
          stroke="#227c9d"
          strokeWidth={0.8}
          strokeDasharray="2,2"
        />
        <text
          x={ringX}
          y={ringY - ringOuterR - 14}
          textAnchor="middle"
          fill="#fef9ef"
          fontSize={9}
          fontFamily="monospace"
        >
          ⌀{params.ringHoleDiameter}mm
        </text>

        {/* Legend */}
        <rect x={15} y={svgHeight - 45} width={12} height={12} rx={2} fill="url(#bgGradient)" stroke="#e8a83a" strokeWidth={0.5} />
        <text x={32} y={svgHeight - 35} fill="#fef9ef" fontSize={10} dominantBaseline="middle">Background (outline)</text>
        <rect x={15} y={svgHeight - 25} width={12} height={12} rx={2} fill="url(#textGradient)" stroke="#12968a" strokeWidth={0.5} />
        <text x={32} y={svgHeight - 15} fill="#fef9ef" fontSize={10} dominantBaseline="middle">Text (front face)</text>
      </svg>

      {/* Side Cross-Section */}
      <h3 className="text-sm font-semibold text-[#ffcb77] mt-4 uppercase tracking-wider">Side Cross-Section</h3>
      <svg viewBox={`0 0 ${svgWidth} 160`} className="w-full h-auto" style={{ maxWidth: svgWidth }}>
        {(() => {
          const depthScale = 10;
          const bgD = params.backgroundDepth * depthScale;
          const txtD = params.textDepth * depthScale;
          const scx = svgWidth / 2;
          const scy = 90;
          const blockW = 180;

          return (
            <>
              {/* Background block */}
              <rect
                x={scx - blockW / 2}
                y={scy - bgD / 2}
                width={blockW}
                height={bgD}
                rx={3}
                fill="url(#bgGradient)"
                stroke="#e8a83a"
                strokeWidth={1}
              />
              {/* Text block (on top of background, slightly inset) */}
              <rect
                x={scx - blockW / 2 + 8}
                y={scy - bgD / 2 - txtD}
                width={blockW - 16}
                height={txtD}
                rx={2}
                fill="url(#textGradient)"
                stroke="#12968a"
                strokeWidth={1}
              />
              {/* Ring cross-section - flat extension of back plate */}
              {(() => {
                // Ring as flat rectangle with same depth as background
                const ringWidth = (params.ringHoleDiameter + params.ringThickness * 2) * 2.5;
                const ringHoleWidth = params.ringHoleDiameter * 2.5;
                const ringTop = scy - bgD / 2 - txtD - bgD + 2; // Overlap with text top
                return (
                  <>
                    {/* Ring body - same depth as background */}
                    <rect
                      x={scx - ringWidth / 2}
                      y={ringTop}
                      width={ringWidth}
                      height={bgD}
                      rx={2}
                      fill="url(#ringGradient)"
                      stroke="#777"
                      strokeWidth={1}
                    />
                    {/* Ring hole */}
                    <rect
                      x={scx - ringHoleWidth / 2}
                      y={ringTop - 1}
                      width={ringHoleWidth}
                      height={bgD + 2}
                      rx={1}
                      fill="#1a1a2e"
                    />
                  </>
                );
              })()}

              {/* Labels */}
              <text x={scx + blockW / 2 + 10} y={scy} fill="#ffcb77" fontSize={10} fontFamily="monospace" dominantBaseline="middle">
                ← bg: {params.backgroundDepth}mm
              </text>
              <text x={scx + blockW / 2 + 10} y={scy - bgD / 2 - txtD / 2} fill="#fef9ef" fontSize={10} fontFamily="monospace" dominantBaseline="middle">
                ← txt: {params.textDepth}mm
              </text>

              {/* Depth lines */}
              <line x1={scx - blockW / 2 - 10} y1={scy - bgD / 2} x2={scx - blockW / 2 - 10} y2={scy + bgD / 2} stroke="#227c9d" strokeWidth={0.8} />
              <line x1={scx - blockW / 2 - 15} y1={scy - bgD / 2} x2={scx - blockW / 2 - 5} y2={scy - bgD / 2} stroke="#227c9d" strokeWidth={0.8} />
              <line x1={scx - blockW / 2 - 15} y1={scy + bgD / 2} x2={scx - blockW / 2 - 5} y2={scy + bgD / 2} stroke="#227c9d" strokeWidth={0.8} />
              <text x={scx - blockW / 2 - 18} y={scy} fill="#17c3b2" fontSize={8} fontFamily="monospace" textAnchor="end" dominantBaseline="middle">
                {params.backgroundDepth}
              </text>

              {/* Text depth line */}
              <line x1={scx - blockW / 2 - 10} y1={scy - bgD / 2 - txtD} x2={scx - blockW / 2 - 10} y2={scy - bgD / 2} stroke="#17c3b2" strokeWidth={0.8} strokeDasharray="2,2" />
              <text x={scx - blockW / 2 - 18} y={scy - bgD / 2 - txtD / 2} fill="#17c3b2" fontSize={8} fontFamily="monospace" textAnchor="end" dominantBaseline="middle">
                {params.textDepth}
              </text>
            </>
          );
        })()}
      </svg>
    </div>
  );
}

export default function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [copied, setCopied] = useState(false);

  const scadCode = useMemo(() => generateOpenSCAD(params), [params]);

  const updateParam = (key: string, value: string) => {
    setParams((prev) => ({
      ...prev,
      [key]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleCopy = async () => {
    let success = false;
    
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(scadCode);
        success = true;
      } catch (err) {
        console.warn('Clipboard API failed, trying fallback:', err);
      }
    }
    
    // Fallback to execCommand method
    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = scadCode;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.style.opacity = '0';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
    }
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert('Failed to copy to clipboard. Please copy the code manually from the text area below.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([scadCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dog_tag_${(params.name || "tag").toLowerCase()}.scad`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-[#fef9ef]">
      {/* Header */}
      <header className="border-b border-[#227c9d]/30 bg-[#1a1a2e]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🐕</div>
            <div>
              <h1 className="text-xl font-bold text-[#ffcb77]">Dog Tag Generator</h1>
              <p className="text-xs text-[#17c3b2]">OpenSCAD — Text + Background Outline + Ring</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-[#227c9d]/20 hover:bg-[#227c9d]/30 border border-[#227c9d]/50 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              {copied ? (
                <>
                  <i className="fas fa-check text-[#17c3b2]"></i> Copied!
                </>
              ) : (
                <>
                  <i className="fas fa-copy text-[#227c9d]"></i> Copy Code
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-[#fe6d73] hover:bg-[#fe6d73]/90 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <i className="fas fa-download"></i> Download .scad
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Parameters Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#16213e]/50 rounded-xl p-6 border border-[#227c9d]/30">
              <h2 className="text-lg font-semibold text-[#ffcb77] mb-4 flex items-center gap-2">
                <i className="fas fa-sliders-h"></i> Parameters
              </h2>

              {/* Text Section */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#17c3b2] uppercase tracking-wider mb-3 border-b border-[#227c9d]/30 pb-2">
                  📝 Text (Part 1)
                </h3>
                <ParameterInput
                  label="Dog Name"
                  value={params.name}
                  onChange={(v) => updateParam("name", v)}
                  type="text"
                  description="The name that forms the tag shape"
                />
                <ParameterInput
                  label="Font"
                  value={params.font}
                  onChange={(v) => updateParam("font", v)}
                  type="text"
                  description="OpenSCAD font string"
                />
                <ParameterInput
                  label="Font Size (mm)"
                  value={params.fontSize}
                  onChange={(v) => updateParam("fontSize", v)}
                  type="number"
                  min={5}
                  max={30}
                  step={0.5}
                  description="Size of the text — determines tag size"
                />
                <ParameterInput
                  label="Text Depth (mm)"
                  value={params.textDepth}
                  onChange={(v) => updateParam("textDepth", v)}
                  type="number"
                  min={1}
                  max={8}
                  step={0.5}
                  description="Thickness of the text letters"
                />
              </div>

              {/* Background Section */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#17c3b2] uppercase tracking-wider mb-3 border-b border-[#227c9d]/30 pb-2">
                  🖼️ Background Outline (Part 2)
                </h3>
                <ParameterInput
                  label="Background Offset (mm)"
                  value={params.backgroundOffset}
                  onChange={(v) => updateParam("backgroundOffset", v)}
                  type="number"
                  min={0.5}
                  max={5}
                  step={0.1}
                  description="How much bigger the background is vs the text"
                />
                <ParameterInput
                  label="Background Depth (mm)"
                  value={params.backgroundDepth}
                  onChange={(v) => updateParam("backgroundDepth", v)}
                  type="number"
                  min={1}
                  max={10}
                  step={0.5}
                  description="Thickness of the background (should be >= text depth)"
                />
              </div>

              {/* Colors Section */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#17c3b2] uppercase tracking-wider mb-3 border-b border-[#227c9d]/30 pb-2">
                  🎨 Colors (Preview Only)
                </h3>
                <ParameterInput
                  label="Front Color (Text)"
                  value={params.frontColor}
                  onChange={(v) => updateParam("frontColor", v)}
                  type="text"
                  description="Color of the text letters"
                />
                <ParameterInput
                  label="Back Color (Background)"
                  value={params.backColor}
                  onChange={(v) => updateParam("backColor", v)}
                  type="text"
                  description="Color of the background outline"
                />
              </div>

              {/* Ring Section */}
              <div className="mb-2">
                <h3 className="text-sm font-bold text-[#17c3b2] uppercase tracking-wider mb-3 border-b border-[#227c9d]/30 pb-2">
                  🔗 Ring (Part 3)
                </h3>
                <ParameterInput
                  label="Ring Hole Diameter (mm)"
                  value={params.ringHoleDiameter}
                  onChange={(v) => updateParam("ringHoleDiameter", v)}
                  type="number"
                  min={3}
                  max={12}
                  step={0.5}
                  description="Inner diameter of the ring"
                />
                <ParameterInput
                  label="Ring Thickness (mm)"
                  value={params.ringThickness}
                  onChange={(v) => updateParam("ringThickness", v)}
                  type="number"
                  min={1}
                  max={5}
                  step={0.5}
                  description="Thickness of the ring material"
                />
                <ParameterInput
                  label="Ring Position"
                  value={params.ringPosition}
                  onChange={(v) => updateParam("ringPosition", v)}
                  type="select"
                  description="Where the ring attaches to the tag"
                />
              </div>
            </div>
          </div>

          {/* Code & Preview Panel */}
          <div className="lg:col-span-8 space-y-6">
            {/* Preview */}
            <div className="bg-[#16213e]/50 rounded-xl p-6 border border-[#227c9d]/30">
              <div className="bg-gradient-to-b from-[#0f3460] to-[#16213e] rounded-lg p-4 border border-[#227c9d]/30 flex justify-center w-4/5 mx-auto">
                <TagPreview params={params} />
              </div>
            </div>

            {/* Code Display */}
            <div className="bg-[#16213e]/50 rounded-xl border border-[#227c9d]/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-[#0f3460]/50 border-b border-[#227c9d]/30">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#fe6d73]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffcb77]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#17c3b2]"></div>
                  </div>
                  <span className="text-sm text-[#17c3b2]/70 ml-2 font-mono">
                    dog_tag_{(params.name || "tag").toLowerCase()}.scad
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="text-xs px-3 py-1 bg-[#227c9d]/20 hover:bg-[#227c9d]/30 border border-[#227c9d]/50 rounded transition-all"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <div className="overflow-auto max-h-[500px] p-4">
                <pre className="text-xs leading-relaxed font-mono text-[#fef9ef]/90 whitespace-pre">
                  <code>{scadCode}</code>
                </pre>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-[#16213e]/50 rounded-xl p-6 border border-[#227c9d]/30">
              <h3 className="text-lg font-semibold text-[#ffcb77] mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle"></i> How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-[#0f3460]/50 rounded-lg p-4 border border-[#227c9d]/30">
                  <div className="text-2xl mb-2">✏️</div>
                  <h4 className="font-semibold text-[#fef9ef] text-sm mb-1">Part 1: Text</h4>
                  <p className="text-xs text-[#17c3b2]/80">The dog's name extruded as a 3D shape. This IS the tag — the letters form the outline.</p>
                </div>
                <div className="bg-[#0f3460]/50 rounded-lg p-4 border border-[#227c9d]/30">
                  <div className="text-2xl mb-2">🖼️</div>
                  <h4 className="font-semibold text-[#fef9ef] text-sm mb-1">Part 2: Background</h4>
                  <p className="text-xs text-[#17c3b2]/80">Same text shape but slightly larger using OpenSCAD's <code className="text-[#ffcb77]">offset()</code>. Creates a border/outline effect.</p>
                </div>
                <div className="bg-[#0f3460]/50 rounded-lg p-4 border border-[#227c9d]/30">
                  <div className="text-2xl mb-2">⭕</div>
                  <h4 className="font-semibold text-[#fef9ef] text-sm mb-1">Part 3: Ring</h4>
                  <p className="text-xs text-[#17c3b2]/80">A flat extension at the top of the tag for attaching to the collar. Same depth as background.</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#fe6d73] rounded-full flex items-center justify-center text-xs font-bold text-[#fef9ef]">1</span>
                  <p className="text-sm text-[#fef9ef]/90">Adjust parameters to customize your dog tag</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#fe6d73] rounded-full flex items-center justify-center text-xs font-bold text-[#fef9ef]">2</span>
                  <p className="text-sm text-[#fef9ef]/90">Download the .scad file or copy the code</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#fe6d73] rounded-full flex items-center justify-center text-xs font-bold text-[#fef9ef]">3</span>
                  <p className="text-sm text-[#fef9ef]/90">Open in <a href="https://openscad.org" target="_blank" rel="noopener" className="text-[#17c3b2] hover:underline">OpenSCAD</a> → Press F6 to render → Export as STL</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-[#0f3460]/50 rounded-lg border border-[#227c9d]/30">
                <p className="text-xs text-[#17c3b2]/80">
                  <strong className="text-[#ffcb77]">💡 Tip:</strong> The <code className="text-[#17c3b2]">background_offset</code> parameter controls how thick the outline border is around the text. 
                  Use bold fonts for best results. The ring is a flat extension of the back plate with a hole for the collar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#227c9d]/30 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-[#17c3b2]/60">
          <p>🐾 Dog Tag OpenSCAD Generator — Text + Background Outline + Ring</p>
        </div>
      </footer>
    </div>
  );
}
