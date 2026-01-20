import "./AnimatedGrid.css";

export default function AnimatedGrid() {
  return (
    <div className="ag-root" aria-hidden="true">
      <div className="ag-grid">
        <div className="ag-container">
          <p className="ag-text">畫山定週</p>
          <p className="ag-text">一週一畫</p>
        </div>

        <div className="ag-container">
          <div className="ag-circle" />
          <div className="ag-circle" />
        </div>

        <div className="ag-container">
          <div className="ag-circle" />
          <div className="ag-circle" />
        </div>

        <div className="ag-container">
          <p className="ag-text">論健成勢</p>
          <p className="ag-text">隨練即調</p>
        </div>
      </div>
    </div>
  );
}
