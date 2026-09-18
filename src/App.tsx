import { useState, useMemo } from "react";

const DEFAULT_PARAMS = {
  name: "BUDDY",
  frontColor: "Silver",
  backColor: "Gold",
  font: "Liberation Sans:style=Bold",
  textOffsetFromBack: 1.5,
  textDepth: 1.2,
  tagDepth: 3,
  ringHoleX: 0,
  ringHoleY: 18,
  ringHoleDiameter: 5,
  tagWidth: 40,
  tagHeight: 30,
  fontSize: 8,
};

function generateOpenSCAD(params: typeof DEFAULT_PARAMS): string {
  return `// ============================================
// Dog Name Tag Generator - OpenSCAD
// ============================================
// Parameters for customizing your dog's name tag
// Open this file in OpenSCAD to render and export

// --- TEXT PARAMETERS ---
dog_name = "${params.name}";           // Name to engrave on the tag
font = "${params.font}";  // Font to use for the text
font_size = ${params.fontSize};                    // Size of the text

// --- COLOR PARAMETERS ---
// Colors are for preview in OpenSCAD only (not for 3D printing)
front_color = "${params.frontColor}";    // Color of the front face
back_color = "${params.backColor}";      // Color of the back face

// --- DIMENSION PARAMETERS ---
tag_width = ${params.tagWidth};                    // Width of the tag in mm
tag_height = ${params.tagHeight};                  // Height of the tag in mm
tag_depth = ${params.tagDepth};                    // Total depth/thickness of the tag in mm
text_depth = ${params.textDepth};                  // How deep the text is engraved in mm
text_offset_from_back = ${params.textOffsetFromBack};           // Offset from back surface to text start

// --- RING HOLE PARAMETERS ---
ring_hole_x = ${params.ringHoleX};                    // X position of ring hole center (0 = centered)
ring_hole_y = ${params.ringHoleY};                   // Y position of ring hole center (from bottom)
ring_hole_diameter = ${params.ringHoleDiameter};              // Diameter of the ring hole in mm

// --- DERIVED VALUES (no need to change) ---
corner_radius = 3;                   // Corner rounding radius
ring_hole_depth = tag_depth + 2;     // Extra depth to ensure hole goes through
border_width = 1.5;                  // Border around text area

// ============================================
// MAIN RENDER
// ============================================

color(front_color) {
    difference() {
        // Main tag body
        tag_body();
        
        // Ring hole
        translate([ring_hole_x, ring_hole_y, -1])
            cylinder(h=ring_hole_depth, d=ring_hole_diameter, $fn=50);
        
        // Engraved text on the back
        engrave_text();
    }
}

// ============================================
// MODULES
// ============================================

module tag_body() {
    // Rounded rectangle tag body
    hull() {
        // Bottom corners
        translate([-tag_width/2 + corner_radius, -tag_height/2 + corner_radius, 0])
            cylinder(h=tag_depth, r=corner_radius, $fn=50);
        translate([tag_width/2 - corner_radius, -tag_height/2 + corner_radius, 0])
            cylinder(h=tag_depth, r=corner_radius, $fn=50);
        
        // Top corners
        translate([-tag_width/2 + corner_radius, tag_height/2 - corner_radius, 0])
            cylinder(h=tag_depth, r=corner_radius, $fn=50);
        translate([tag_width/2 - corner_radius, tag_height/2 - corner_radius, 0])
            cylinder(h=tag_depth, r=corner_radius, $fn=50);
    }
}

module engrave_text() {
    // Text is engraved from the back face
    // text_offset_from_back controls how far from the back the engraving starts
    translate([0, -2, tag_depth - text_offset_from_back])
        linear_extrude(height=text_depth + 1)
            text(
                text = dog_name,
                size = font_size,
                font = font,
                halign = "center",
                valign = "center"
            );
}

// ============================================
// PREVIEW (uncomment for dual-color preview)
// ============================================
// Uncomment below to see front and back colors separately

/*
// Front face
color(front_color)
    translate([0, 0, tag_depth - 0.1])
        linear_extrude(height=0.1)
            projection(cut=true)
                translate([0, 0, -tag_depth])
                    tag_body();

// Back face with text
color(back_color)
    translate([0, 0, 0])
        linear_extrude(height=0.1)
            projection(cut=true)
                tag_body();
*/

// ============================================
// NOTES
// ============================================
// To export for 3D printing:
// 1. Open this file in OpenSCAD
// 2. Press F6 to render
// 3. File -> Export -> STL
//
// For dual-color printing:
// - Export the front and back separately using projections
// - Or use a multi-material printer with color settings
//
// Tips:
// - Increase text_depth for deeper engraving (more durable)
// - Adjust ring_hole_diameter to fit your collar ring
// - Use bold fonts for better readability
// - Minimum recommended tag_width: 30mm
// - Minimum recommended tag_depth: 2mm
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

function TagPreview({ params }: { params: typeof DEFAULT_PARAMS }) {
  const widthScale = 4;
  const heightScale = 4;
  const svgWidth = 220;
  const svgHeight = 200;

  const tagW = params.tagWidth * widthScale / 10;
  const tagH = params.tagHeight * heightScale / 10;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2 + 10;

  const holeX = cx + (params.ringHoleX * widthScale / 10);
  const holeY = cy - tagH / 2 + ((tagH - params.ringHoleY * heightScale / 10) * 0.3);
  const holeR = (params.ringHoleDiameter * widthScale / 10) / 2;

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Preview</h3>
      <svg width={svgWidth} height={svgHeight} className="drop-shadow-lg">
        {/* Tag body */}
        <rect
          x={cx - tagW / 2}
          y={cy - tagH / 2}
          width={tagW}
          height={tagH}
          rx={8}
          ry={8}
          fill="url(#tagGradient)"
          stroke="#555"
          strokeWidth={1.5}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="tagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4a843" />
            <stop offset="50%" stopColor="#c9952e" />
            <stop offset="100%" stopColor="#b8862d" />
          </linearGradient>
          <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0e0e0" />
            <stop offset="50%" stopColor="#c0c0c0" />
            <stop offset="100%" stopColor="#a0a0a0" />
          </linearGradient>
        </defs>
        {/* Ring hole */}
        <circle
          cx={holeX}
          cy={cy - tagH / 2 + 12}
          r={holeR}
          fill="#1a1a2e"
          stroke="#666"
          strokeWidth={1}
        />
        {/* Text */}
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#333"
          fontSize={Math.min(14, params.fontSize * 1.5)}
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          {params.name}
        </text>
        {/* Dimension annotations */}
        <line x1={cx - tagW / 2} y1={cy + tagH / 2 + 15} x2={cx + tagW / 2} y2={cy + tagH / 2 + 15} stroke="#666" strokeWidth={0.5} markerEnd="url(#arrow)" markerStart="url(#arrow)" />
        <text x={cx} y={cy + tagH / 2 + 28} textAnchor="middle" fill="#888" fontSize={9}>
          {params.tagWidth}mm
        </text>
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
              <p className="text-xs text-gray-400">OpenSCAD Parametric Name Tag</p>
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
                  📝 Text
                </h3>
                <ParameterInput
                  label="Dog Name"
                  value={params.name}
                  onChange={(v) => updateParam("name", v)}
                  type="text"
                  description="The name to engrave on the tag"
                />
                <ParameterInput
                  label="Font"
                  value={params.font}
                  onChange={(v) => updateParam("font", v)}
                  type="text"
                  description="OpenSCAD font string (e.g., 'Liberation Sans:style=Bold')"
                />
                <ParameterInput
                  label="Font Size (mm)"
                  value={params.fontSize}
                  onChange={(v) => updateParam("fontSize", v)}
                  type="number"
                  min={3}
                  max={20}
                  step={0.5}
                  description="Height of the text characters"
                />
              </div>

              {/* Colors Section */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 border-b border-gray-700 pb-2">
                  🎨 Colors (Preview Only)
                </h3>
                <ParameterInput
                  label="Front Color"
                  value={params.frontColor}
                  onChange={(v) => updateParam("frontColor", v)}
                  type="text"
                  description="Color name or [R,G,B] for the front face"
                />
                <ParameterInput
                  label="Back Color"
                  value={params.backColor}
                  onChange={(v) => updateParam("backColor", v)}
                  type="text"
                  description="Color name or [R,G,B] for the back face"
                />
              </div>

              {/* Dimensions Section */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 border-b border-gray-700 pb-2">
                  📐 Dimensions
                </h3>
                <ParameterInput
                  label="Tag Width (mm)"
                  value={params.tagWidth}
                  onChange={(v) => updateParam("tagWidth", v)}
                  type="number"
                  min={20}
                  max={80}
                  step={1}
                  description="Total width of the tag"
                />
                <ParameterInput
                  label="Tag Height (mm)"
                  value={params.tagHeight}
                  onChange={(v) => updateParam("tagHeight", v)}
                  type="number"
                  min={15}
                  max={60}
                  step={1}
                  description="Total height of the tag"
                />
                <ParameterInput
                  label="Tag Depth (mm)"
                  value={params.tagDepth}
                  onChange={(v) => updateParam("tagDepth", v)}
                  type="number"
                  min={1}
                  max={8}
                  step={0.5}
                  description="Thickness of the tag"
                />
                <ParameterInput
                  label="Text Depth (mm)"
                  value={params.textDepth}
                  onChange={(v) => updateParam("textDepth", v)}
                  type="number"
                  min={0.2}
                  max={3}
                  step={0.1}
                  description="How deep the text is engraved"
                />
                <ParameterInput
                  label="Text Offset from Back (mm)"
                  value={params.textOffsetFromBack}
                  onChange={(v) => updateParam("textOffsetFromBack", v)}
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  description="Distance from back surface to where text starts"
                />
              </div>

              {/* Ring Hole Section */}
              <div className="mb-2">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 border-b border-gray-700 pb-2">
                  🔗 Ring Hole
                </h3>
                <ParameterInput
                  label="Hole X Position (mm)"
                  value={params.ringHoleX}
                  onChange={(v) => updateParam("ringHoleX", v)}
                  type="number"
                  min={-20}
                  max={20}
                  step={0.5}
                  description="Horizontal offset from center (0 = centered)"
                />
                <ParameterInput
                  label="Hole Y Position (mm)"
                  value={params.ringHoleY}
                  onChange={(v) => updateParam("ringHoleY", v)}
                  type="number"
                  min={5}
                  max={30}
                  step={0.5}
                  description="Vertical position from bottom of tag"
                />
                <ParameterInput
                  label="Hole Diameter (mm)"
                  value={params.ringHoleDiameter}
                  onChange={(v) => updateParam("ringHoleDiameter", v)}
                  type="number"
                  min={2}
                  max={12}
                  step={0.5}
                  description="Diameter of the ring/collar hole"
                />
              </div>
            </div>
          </div>

          {/* Code & Preview Panel */}
          <div className="lg:col-span-8 space-y-6">
            {/* Preview */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <TagPreview params={params} />
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
              <div className="overflow-auto max-h-[600px] p-4">
                <pre className="text-xs leading-relaxed font-mono text-gray-300 whitespace-pre">
                  <code>{scadCode}</code>
                </pre>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle"></i> How to Use
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <p className="text-sm text-gray-300">Adjust parameters on the left to customize your dog tag</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <p className="text-sm text-gray-300">Download the .scad file or copy the code</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <p className="text-sm text-gray-300">Open in <a href="https://openscad.org" target="_blank" rel="noopener" className="text-amber-400 hover:underline">OpenSCAD</a></p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <p className="text-sm text-gray-300">Press F6 to render the 3D model</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                    <p className="text-sm text-gray-300">Export as STL (File → Export → STL)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold">6</span>
                    <p className="text-sm text-gray-300">Send to your 3D printer or printing service</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-600">
                <p className="text-xs text-gray-400">
                  <strong className="text-amber-400">💡 Tip:</strong> For best results with text engraving, use bold fonts. 
                  The text is engraved from the back face of the tag. Colors are for OpenSCAD preview only and won't affect 3D printing.
                  For dual-color tags, consider printing front and back separately and gluing together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>🐾 Dog Tag OpenSCAD Generator — Create custom name tags for your furry friend</p>
        </div>
      </footer>
    </div>
  );
}
