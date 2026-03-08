import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const SYMBOLS = [
  { value: 'FX:EURUSD', label: 'EUR/USD' },
  { value: 'FX:GBPUSD', label: 'GBP/USD' },
  { value: 'FX:USDJPY', label: 'USD/JPY' },
  { value: 'FX:USDCHF', label: 'USD/CHF' },
  { value: 'FX:AUDUSD', label: 'AUD/USD' },
  { value: 'FX:USDCAD', label: 'USD/CAD' },
  { value: 'FX:NZDUSD', label: 'NZD/USD' },
  { value: 'FX:EURGBP', label: 'EUR/GBP' },
  { value: 'FX:EURJPY', label: 'EUR/JPY' },
  { value: 'FX:GBPJPY', label: 'GBP/JPY' },
  { value: 'OANDA:XAUUSD', label: 'Gold (XAU/USD)' },
  { value: 'OANDA:XAGUSD', label: 'Silver (XAG/USD)' },
  { value: 'SP:SPX', label: 'S&P 500' },
  { value: 'NASDAQ:NDX', label: 'NASDAQ 100' },
  { value: 'DJ:DJI', label: 'Dow Jones' },
  { value: 'BINANCE:BTCUSDT', label: 'Bitcoin' },
  { value: 'BINANCE:ETHUSDT', label: 'Ethereum' },
];

const INTERVALS = [
  { value: '1', label: '1m' },
  { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '60', label: '1h' },
  { value: '240', label: '4h' },
  { value: 'D', label: '1D' },
  { value: 'W', label: '1W' },
];

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function TradingViewPage() {
  const { theme } = useTheme();
  const [symbol, setSymbol] = useState('FX:EURUSD');
  const [interval, setInterval] = useState('D');
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    const createWidget = () => {
      if (!containerRef.current || !window.TradingView) return;
      containerRef.current.innerHTML = '';
      const chartDiv = document.createElement('div');
      chartDiv.id = 'tradingview_chart_' + Date.now();
      chartDiv.style.height = '100%';
      chartDiv.style.width = '100%';
      containerRef.current.appendChild(chartDiv);

      new window.TradingView.widget({
        autosize: true,
        symbol,
        interval,
        timezone: 'America/Sao_Paulo',
        theme: theme === 'dark' ? 'dark' : 'light',
        style: '1',
        locale: 'br',
        toolbar_bg: '#161b22',
        enable_publishing: false,
        allow_symbol_change: true,
        save_image: true,
        show_popup_button: true,
        popup_width: '1000',
        popup_height: '650',
        container_id: chartDiv.id,
        withdateranges: true,
        hide_side_toolbar: false,
        studies: ['Volume@tv-basicstudies'],
      });
    };

    if (scriptLoaded.current) {
      createWidget();
      return;
    }

    const existing = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
    if (existing) {
      scriptLoaded.current = true;
      createWidget();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
      createWidget();
    };
    document.head.appendChild(script);
  }, [symbol, interval, theme]);

  const selectStyle: React.CSSProperties = {
    background: 'var(--gpfx-card-bg, #0d1117)',
    color: 'var(--gpfx-text-primary, #e6edf3)',
    border: '1px solid rgba(0,211,149,0.2)',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 13,
    outline: 'none',
  };

  return (
    <div className="p-3 flex flex-col" style={{ height: 'calc(100vh - 16px)' }}>
      <div className="flex items-center gap-3 mb-3">
        <select value={symbol} onChange={e => setSymbol(e.target.value)} style={selectStyle}>
          {SYMBOLS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select value={interval} onChange={e => setInterval(e.target.value)} style={selectStyle}>
          {INTERVALS.map(i => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>
      </div>
      <div
        ref={containerRef}
        className="flex-1"
        style={{
          border: '1px solid rgba(0,211,149,0.2)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      />
    </div>
  );
}
