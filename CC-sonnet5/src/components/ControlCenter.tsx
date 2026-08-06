import { useSystemStore } from '../os/systemStore';
import './controlcenter.css';

export default function ControlCenter({ onClose }: { onClose: () => void }) {
  const system = useSystemStore();

  return (
    <div className="cc-overlay" onClick={onClose}>
      <div className="cc-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cc-row">
          <button className={`cc-toggle ${system.wifiOn ? 'on' : ''}`} onClick={system.toggleWifi}>
            📶 Wi-Fi
          </button>
          <button className={`cc-toggle ${system.bluetoothOn ? 'on' : ''}`} onClick={system.toggleBluetooth}>
            🔵 Bluetooth
          </button>
        </div>
        <button
          className={`cc-toggle wide ${system.theme === 'dark' ? 'on' : ''}`}
          onClick={system.toggleTheme}
        >
          🌙 Dark Mode
        </button>
        <div className="cc-slider-block">
          <label>🔆 Display</label>
          <input
            type="range"
            min={10}
            max={100}
            value={system.brightness}
            onChange={(e) => system.setBrightness(Number(e.target.value))}
          />
        </div>
        <div className="cc-slider-block">
          <label>🔊 Sound</label>
          <input
            type="range"
            min={0}
            max={100}
            value={system.volume}
            onChange={(e) => system.setVolume(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
