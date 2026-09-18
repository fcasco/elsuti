import { useState, useMemo } from "react";

const DEFAULT_PARAMS = {
  name: "BUDDY",
  frontColor: "Silver",
  backColor: "Gold",
  font: "Liberation Sans:style=Bold",
  fontSize: 12,
  textDepth: 3,
  backgroundDepth: 4,
  backgroundOffset: 1.5,
  ringHoleDiameter: 5,
  ringThickness: 2,
  ringPosition: "top-center",
};

function generateOpenSCAD(params: typeof DEFAULT_PARAMS): string {
  return `// ============================================
// Dog Name Tag Generator - OpenSCAD
// ============================================
// 3-part tag: Text shape + Background outline + Ring
// The text IS the tag shape; the background is a
// slightly larger outline behind it.

// --- TEXT PARAMETERS ---
dog_name = "${params.name}";
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

// Color preview
color(front_color) text_part();
color(back_color) background_part();
color(front_color) ring_part();

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

// PART 3: The ring - a torus at the top of the tag for collar attachment
module ring_part() {
    ring_y = text_height_approx() / 2 + ring_hole_diameter / 2 + background_offset + 2;
    ring_outer = ring_hole_diameter / 2 + ring_thickness;

    translate([ring_x, ring_y, background_depth / 2]) {
        difference() {
            // Outer ring body
            rotate_extrude($fn = 60)
                translate([ring_hole_diameter / 2 + ring_thickness / 2, 0, 0])
                    circle(r = ring_thickness / 2, $fn = 30);
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
// - Ring: A loop at the top for collar attachment
//
// Tips:
// - background_offset controls how thick the border is
// - background_depth should be >= text_depth for best look
// - Use bold fonts for better visibility
// - The ring connects to the background outline
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
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-1">{description}</p>
      )}
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
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
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
        />
      )}
    </div>
  );
}

function TagPreview({ params }: { params: typeof DEFAULT_PARAMS }) {
  const svgWidth = 380;
  const svgHeight = 260;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2 + 10;

  // Scale factor for rendering text
  const scaleFactor = 2.8;
  const fontSize = params.fontSize * scaleFactor;

  // Estimate text dimensions
  const charWidth = fontSize * 0.62;
  const textTotalWidth = params.name.length * charWidth;
  const textTotalHeight = fontSize * 1.1;

  // Background offset in pixels
  const bgOffset = params.backgroundOffset * scaleFactor;

  // Ring position
  const ringY = cy - textTotalHeight / 2 - bgOffset - fontSize * 0.5;
  let ringX = cx;
  if (params.ringPosition === "top-left") {
    ringX = cx - textTotalWidth / 2 + fontSize * 0.4;
  } else if (params.ringPosition === "top-right") {
    ringX = cx + textTotalWidth / 2 - fontSize * 0.4;
  }
  const ringOuterR = (params.ringHoleDiameter / 2 + params.ringThickness) * scaleFactor * 0.5;
  const ringInnerR = (params.ringHoleDiameter / 2) * scaleFactor * 0.5;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Front View */}
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Front View</h3>
      <svg width={svgWidth} height={svgHeight} className="drop-shadow-xl">
        <defs>
          {/* Background gradient (back color - gold) */}
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0d060" />
            <stop offset="30%" stopColor="#d4a843" />
            <stop offset="60%" stopColor="#e8c84a" />
            <stop offset="100%" stopColor="#b8862d" />
          </linearGradient>
          {/* Text gradient (front color - silver) */}
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f0f0" />
            <stop offset="30%" stopColor="#d8d8d8" />
            <stop offset="60%" stopColor="#e8e8e8" />
            <stop offset="100%" stopColor="#b0b0b0" />
          </linearGradient>
          {/* Ring gradient */}
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0e0e0" />
            <stop offset="50%" stopColor="#a0a0a0" />
            <stop offset="100%" stopColor="#c0c0c0" />
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
          stroke="#8a6b1e"
          strokeWidth={bgOffset * 2}
          strokeLinejoin="round"
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="Arial Black, Impact, sans-serif"
          filter="url(#shadow)"
          paintOrder="stroke fill"
        >
          {params.name}
        </text>

        {/* Text (front color) - sits on top of background */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="url(#textGradient)"
          stroke="#888"
          strokeWidth={0.5}
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="Arial Black, Impact, sans-serif"
        >
          {params.name}
        </text>

        {/* Text shine effect */}
        <text
          x={cx}
          y={cy - 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(255,255,255,0.15)"
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="Arial Black, Impact, sans-serif"
        >
          {params.name}
        </text>

        {/* Ring at top */}
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
          stroke="#666"
          strokeWidth={0.8}
        />
        <line
          x1={cx + textTotalWidth / 2 + 2}
          y1={cy}
          x2={cx + textTotalWidth / 2 + bgOffset + 10}
          y2={cy}
          stroke="#666"
          strokeWidth={0.8}
          strokeDasharray="2,2"
        />
        <text
          x={cx + textTotalWidth / 2 + bgOffset + 16}
          y={cy}
          fill="#888"
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
          stroke="#555"
          strokeWidth={0.8}
          strokeDasharray="2,2"
        />
        <text
          x={ringX}
          y={ringY - ringOuterR - 14}
          textAnchor="middle"
          fill="#777"
          fontSize={9}
          fontFamily="monospace"
        >
          ⌀{params.ringHoleDiameter}mm
        </text>

        {/* Legend */}
        <rect x={15} y={svgHeight - 45} width={12} height={12} rx={2} fill="url(#bgGradient)" stroke="#8a6b1e" strokeWidth={0.5} />
        <text x={32} y={svgHeight - 35} fill="#aaa" fontSize={10} dominantBaseline="middle">Background (outline)</text>
        <rect x={15} y={svgHeight - 25} width={12} height={12} rx={2} fill="url(#textGradient)" stroke="#888" strokeWidth={0.5} />
        <text x={32} y={svgHeight - 15} fill="#aaa" fontSize={10} dominantBaseline="middle">Text (front face)</text>
      </svg>

      {/* Side Cross-Section */}
      <h3 className="text-sm font-semibold text-gray-400 mt-4 uppercase tracking-wider">Side Cross-Section</h3>
      <svg width={svgWidth} height={120}>
        {(() => {
          const depthScale = 12;
          const bgD = params.backgroundDepth * depthScale;
          const txtD = params.textDepth * depthScale;
          const scx = svgWidth / 2;
          const scy = 60;
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
                stroke="#8a6b1e"
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
                stroke="#888"
                strokeWidth={1}
              />
              {/* Ring cross-section */}
              <circle
                cx={scx}
                cy={scy - bgD / 2 - txtD - 15}
                r={8}
                fill="url(#ringGradient)"
                stroke="#777"
                strokeWidth={1}
              />
              <circle
                cx={scx}
                cy={scy - bgD / 2 - txtD - 15}
                r={4}
                fill="#1a1a2e"
              />

              {/* Labels */}
              <text x={scx + blockW / 2 + 10} y={scy} fill="#d4a843" fontSize={10} fontFamily="monospace" dominantBaseline="middle">
                ← bg: {params.backgroundDepth}mm
              </text>
              <text x={scx + blockW / 2 + 10} y={scy - bgD / 2 - txtD / 2} fill="#ccc" fontSize={10} fontFamily="monospace" dominantBaseline="middle">
                ← txt: {params.textDepth}mm
              </text>

              {/* Depth lines */}
              <line x1={scx - blockW / 2 - 10} y1={scy - bgD / 2} x2={scx - blockW / 2 - 10} y2={scy + bgD / 2} stroke="#666" strokeWidth={0.8} />
              <line x1={scx - blockW / 2 - 15} y1={scy - bgD / 2} x2={scx - blockW / 2 - 5} y2={scy - bgD / 2} stroke="#666" strokeWidth={0.8} />
              <line x1={scx - blockW / 2 - 15} y1={scy + bgD / 2} x2={scx - blockW / 2 - 5} y2={scy + bgD / 2} stroke="#666" strokeWidth={0.8} />
              <text x={scx - blockW / 2 - 18} y={scy} fill="#888" fontSize={8} fontFamily="monospace" textAnchor="end" dominantBaseline="middle">
                {params.backgroundDepth}
              </text>

              {/* Text depth line */}
              <line x1={scx - blockW / 2 - 10} y1={scy - bgD / 2 - txtD} x2={scx - blockW / 2 - 10} y2={scy - bgD / 2} stroke="#999" strokeWidth={0.8} strokeDasharray="2,2" />
              <text x={scx - blockW / 2 - 18} y={scy - bgD / 2 - txtD / 2} fill="#aaa" fontSize={8} fontFamily="monospace" textAnchor="end" dominantBaseline="middle">
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

  const handleCopy = () => {
    navigator.clipboard.writeText(scadCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([scadCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dog_tag_${params.name.toLowerCase()}.scad`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🐕</div>
            <div>
              <h1 className="text-xl font-bold text-amber-400">Dog Tag Generator</h1>
              <p className="text-xs text-gray-400">OpenSCAD — Text + Background Outline + Ring</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              {copied ? (
                <>
                  <i className="fas fa-check text-green-400"></i> Copied!
                </>
              ) : (
                <>
                  <i className="fas fa-copy"></i> Copy Code
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
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
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                <i className="fas fa-sliders-h"></i> Parameters
              </h2>

              {/* Text Section */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 border-b border-gray-700 pb-2">
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
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 border-b border-gray-700 pb-2">
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
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 border-b border-gray-700 pb-2">
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
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 border-b border-gray-700 pb-2">
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
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-600 flex justify-center">
                <TagPreview params={params} />
              </div>
            </div>

            {/* Code Display */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm text-gray-400 ml-2 font-mono">
                    dog_tag_{params.name.toLowerCase()}.scad
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-all"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <div className="overflow-auto max-h-[500px] p-4">
                <pre className="text-xs leading-relaxed font-mono text-gray-300 whitespace-pre">
                  <code>{scadCode}</code>
                </pre>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle"></i> How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                  <div className="text-2xl mb-2">✏️</div>
                  <h4 className="font-semibold text-silver-300 text-white text-sm mb-1">Part 1: Text</h4>
                  <p className="text-xs text-gray-400">The dog's name extruded as a 3D shape. This IS the tag — the letters form the outline.</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                  <div className="text-2xl mb-2">🖼️</div>
                  <h4 className="font-semibold text-white text-sm mb-1">Part 2: Background</h4>
                  <p className="text-xs text-gray-400">Same text shape but slightly larger using OpenSCAD's <code className="text-amber-400">offset()</code>. Creates a border/outline effect.</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                  <div className="text-2xl mb-2">⭕</div>
                  <h4 className="font-semibold text-white text-sm mb-1">Part 3: Ring</h4>
                  <p className="text-xs text-gray-400">A torus at the top of the tag for attaching to the collar. Position is adjustable.</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <p className="text-sm text-gray-300">Adjust parameters to customize your dog tag</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <p className="text-sm text-gray-300">Download the .scad file or copy the code</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <p className="text-sm text-gray-300">Open in <a href="https://openscad.org" target="_blank" rel="noopener" className="text-amber-400 hover:underline">OpenSCAD</a> → Press F6 to render → Export as STL</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-600">
                <p className="text-xs text-gray-400">
                  <strong className="text-amber-400">💡 Tip:</strong> The <code className="text-amber-300">background_offset</code> parameter controls how thick the outline border is around the text. 
                  Use bold fonts for best results. The ring is a torus (donut shape) created with <code className="text-amber-300">rotate_extrude</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>🐾 Dog Tag OpenSCAD Generator — Text + Background Outline + Ring</p>
        </div>
      </footer>
    </div>
  );
}
