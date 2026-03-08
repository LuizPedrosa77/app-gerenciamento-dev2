import { useGPFX } from '@/contexts/GPFXContext';
import { Account, sumPnl, getMonthPnl, fmtNum, getTradePnl } from '@/lib/gpfx-utils';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

interface ContasAtivasProps {
  onNavigatePlanilha: (accountIndex: number) => void;
}

function getAccountBalance(acc: Account): number {
  const totalPnl = sumPnl(acc.trades);
  const allWithdrawals = Object.values(acc.withdrawals || {}).reduce((s, v) => s + v, 0);
  return acc.balance + totalPnl - allWithdrawals;
}

function Sparkline({ trades }: { trades: Account['trades'] }) {
  const last7 = trades.slice(-7);
  if (last7.length === 0) return <div className="h-8 flex items-center text-[10px]" style={{ color: 'var(--gpfx-text-muted)' }}>Sem trades</div>;
  const data = last7.map(t => ({ pnl: getTradePnl(t) }));
  return (
    <div className="h-8">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Bar dataKey="pnl" radius={[2, 2, 0, 0]}
            shape={(props: any) => {
              const { x, y, width, height } = props;
              return <rect x={x} y={y} width={width} height={Math.abs(height)} fill={props.payload.pnl >= 0 ? '#00d395' : '#ff4d4d'} rx={2} />;
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ContasAtivasPage({ onNavigatePlanilha }: ContasAtivasProps) {
  const { state, switchAccount } = useGPFX();
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  return (
    <div className="page-fade-in flex flex-col gap-5 max-w-[1400px] mx-auto p-6">
      <h1 className="text-xl font-extrabold" style={{ color: 'var(--gpfx-text-primary)' }}>👛 Contas Ativas</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {state.accounts.map((acc, i) => {
          const isActive = i === state.activeAccount;
          const balance = getAccountBalance(acc);
          const monthPnl = getMonthPnl(acc, curYear, curMonth);

          return (
            <div
              key={i}
              className="relative rounded-xl p-4 flex flex-col gap-3 transition-all"
              style={{
                background: 'var(--gpfx-card)',
                border: isActive ? '2px solid #00d395' : '1px solid var(--gpfx-border)',
              }}
            >
              {isActive && (
                <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,211,149,0.15)', color: '#00d395' }}>
                  ● Ativa
                </span>
              )}

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>CONTA {i + 1}</div>
                <div className="text-sm font-extrabold" style={{ color: 'var(--gpfx-text-primary)' }}>{acc.name}</div>
              </div>

              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--gpfx-text-secondary)' }}>Saldo</span>
                <span className="font-bold font-mono" style={{ color: 'var(--gpfx-text-primary)' }}>${fmtNum(balance)}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--gpfx-text-secondary)' }}>P&L Mês</span>
                <span className="font-bold font-mono" style={{ color: monthPnl >= 0 ? '#00d395' : '#ff4d4d' }}>
                  {monthPnl >= 0 ? '+' : '-'}${fmtNum(Math.abs(monthPnl))}
                </span>
              </div>

              <Sparkline trades={acc.trades} />

              <button
                onClick={() => {
                  switchAccount(i);
                  onNavigatePlanilha(i);
                }}
                className="w-full py-1.5 rounded-lg text-xs font-bold transition-colors"
                style={{
                  background: isActive ? 'rgba(0,211,149,0.15)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#00d395' : 'var(--gpfx-text-secondary)',
                  border: '1px solid ' + (isActive ? 'rgba(0,211,149,0.3)' : 'var(--gpfx-border)'),
                }}
              >
                Acessar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
