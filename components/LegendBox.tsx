export default function LegendBox() {
  return (
    <div className="legend">
      <div className="li">
        <span className="sw" style={{ background: "#d6322e" }} /> High-risk / acquired zone
      </div>
      <div className="li">
        <span className="sw" style={{ background: "#d98a00" }} /> Medium / controlled zone
      </div>
      <div className="li">
        <span className="sw" style={{ background: "#0f7a4d" }} /> Protected (varies)
      </div>
      <div className="li">
        <span className="dot" style={{ width: 12, height: 12, background: "#1c2733" }} /> Your
        selected point
      </div>
    </div>
  );
}
