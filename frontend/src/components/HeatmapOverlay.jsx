import { useId, useMemo } from "react";
import { ANATOMY_SVG, parseReport } from "../utils/heatmapEngine";

const SEVERITY_STYLE = {
  critical: { outerOpacity: 0.9, innerOpacity: 0.7, pulse: true, ringOpacity: 0.85 },
  acute: { outerOpacity: 0.7, innerOpacity: 0.55, pulse: true, ringOpacity: 0.65 },
  significant: { outerOpacity: 0.55, innerOpacity: 0.4, pulse: true, ringOpacity: 0.5 },
  moderate: { outerOpacity: 0.4, innerOpacity: 0.3, pulse: false, ringOpacity: 0.4 },
};

function HeatZone({ zone, index, severity = "acute" }) {
  const idPrefix = useId();
  const gradId = `${idPrefix}-heatgrad-${index}`;
  const style = SEVERITY_STYLE[severity] || SEVERITY_STYLE.acute;

  return (
    <g
      className={style.pulse ? "heat-pulse" : ""}
      style={{
        animationDelay: `${index * 0.3}s`,
        transition: "opacity 0.4s ease",
      }}
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={zone.color} stopOpacity={style.innerOpacity} />
          <stop offset="50%" stopColor={zone.color} stopOpacity={style.outerOpacity * 0.6} />
          <stop offset="100%" stopColor={zone.color} stopOpacity={0} />
        </radialGradient>
      </defs>

      <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry} fill={`url(#${gradId})`} />

      <ellipse
        cx={zone.cx}
        cy={zone.cy}
        rx={zone.rx - 2}
        ry={zone.ry - 2}
        fill="none"
        stroke={zone.color}
        strokeWidth={1.5}
        strokeOpacity={style.ringOpacity}
      />

      <ellipse
        cx={zone.cx}
        cy={zone.cy}
        rx={Math.min(zone.rx * 0.25, 12)}
        ry={Math.min(zone.ry * 0.25, 12)}
        fill={zone.color}
        fillOpacity={style.innerOpacity + 0.1}
      />
    </g>
  );
}

function FindingCard({ finding }) {
  const severityLabel = {
    critical: "Critical",
    acute: "Acute",
    significant: "Significant",
    moderate: "Moderate",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 0",
        borderBottom: "0.5px solid rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          width: 11,
          height: 11,
          borderRadius: "50%",
          background: finding.color,
          flexShrink: 0,
          marginTop: 3,
        }}
      />
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{finding.label}</div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{finding.location}</div>
        <span
          style={{
            display: "inline-block",
            marginTop: 4,
            fontSize: 11,
            padding: "2px 7px",
            borderRadius: 6,
            background:
              finding.severity === "critical" || finding.severity === "acute"
                ? "#FAECE7"
                : finding.severity === "significant"
                ? "#FFF3E0"
                : "#EAF3DE",
            color:
              finding.severity === "critical" || finding.severity === "acute"
                ? "#993C1D"
                : finding.severity === "significant"
                ? "#7A4800"
                : "#3B6D11",
          }}
        >
          {severityLabel[finding.severity] || finding.severity}
        </span>
      </div>
    </div>
  );
}

export default function HeatmapOverlay({ report, scanType, className = "" }) {
  const { isNormal, findings, heatZones } = useMemo(
    () => parseReport(report || "", scanType || "chest"),
    [report, scanType]
  );

  const anatomySvg = ANATOMY_SVG[scanType] || ANATOMY_SVG.chest;

  return (
    <div
      className={className}
      style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 280,
          borderRadius: 12,
          overflow: "hidden",
          border: "0.5px solid rgba(0,0,0,0.1)",
          background: "#0a0a0a",
          position: "relative",
        }}
      >
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
          <g dangerouslySetInnerHTML={{ __html: anatomySvg }} />

          {!isNormal &&
            heatZones.map((zone, i) => {
              const finding = findings.find((item) => item.color === zone.color);
              return <HeatZone key={i} zone={zone} index={i} severity={finding?.severity || "acute"} />;
            })}
        </svg>

        {isNormal && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#EAF3DE",
              color: "#3B6D11",
              fontSize: 12,
              fontWeight: 500,
              padding: "5px 14px",
              borderRadius: 20,
              whiteSpace: "nowrap",
            }}
          >
            Normal - no heatmap generated
          </div>
        )}
      </div>

      <div
        style={{
          flex: "0 0 240px",
          background: "#fff",
          border: "0.5px solid rgba(0,0,0,0.1)",
          borderRadius: 12,
          padding: "14px 16px",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: "#111" }}>Findings</div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            fontWeight: 500,
            padding: "3px 9px",
            borderRadius: 20,
            marginBottom: 10,
            background: isNormal ? "#EAF3DE" : "#FAECE7",
            color: isNormal ? "#3B6D11" : "#993C1D",
          }}
        >
          {isNormal
            ? "Normal study"
            : `${findings.length} finding${findings.length !== 1 ? "s" : ""}`}
        </div>

        {isNormal ? (
          <div style={{ fontSize: 13, color: "#888", padding: "8px 0" }}>No abnormalities detected.</div>
        ) : findings.length === 0 ? (
          <div style={{ fontSize: 13, color: "#888", padding: "8px 0" }}>
            Pathology noted but location is unclear.
          </div>
        ) : (
          findings.map((finding) => <FindingCard key={finding.id} finding={finding} />)
        )}
      </div>

      <style>{`
        @keyframes heatPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .heat-pulse {
          animation: heatPulse 2.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
