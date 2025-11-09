import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Loader from './Loader.jsx';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // added: timeline state
  const [timeline, setTimeline] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [{ data: statsData }, { data: tlData }] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/analytics/users-timeline?days=30')
        ]);
        if (!mounted) return;
        setStats(statsData);
        setTimeline(Array.isArray(tlData?.points) ? tlData.points : []);
      } catch (err) {
        console.error('analytics error', err);
        alert('Failed to fetch analytics (requires admin)');
      } finally {
        if (mounted) {
          setLoading(false);
          setTimelineLoading(false);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const chart = useMemo(() => {
    if (!timeline || timeline.length === 0) return null;

    const padding = { top: 10, right: 20, bottom: 30, left: 32 };
    const width = Math.max(360, timeline.length * 22) + padding.left + padding.right;
    const height = 220 + padding.top + padding.bottom;

    const maxY = Math.max(1, ...timeline.map(p => p.count));
    const xStep = (width - padding.left - padding.right) / Math.max(1, timeline.length - 1);
    const yScale = (val) => {
      const usable = height - padding.top - padding.bottom;
      return padding.top + (usable - (val / maxY) * usable);
    };

    const points = timeline.map((p, i) => {
      const x = padding.left + i * xStep;
      const y = yScale(p.count);
      return `${x},${y}`;
    });

    const path = `M ${points.join(' L ')}`;

    // y-axis ticks (0..maxY)
    const yTicks = [];
    const steps = Math.min(5, maxY);
    for (let i = 0; i <= steps; i++) {
      const val = Math.round((maxY / steps) * i);
      const y = yScale(val);
      yTicks.push({ y, val });
    }

    // x-axis labels (every ~5th day)
    const xLabels = timeline.map((p, i) => (i % Math.ceil(timeline.length / 6) === 0 ? { i, date: p.date.slice(5) } : null)).filter(Boolean);

    return { width, height, padding, path, points, yTicks, xLabels, maxY };
  }, [timeline]);

  if (loading) return <Loader text="Loading analytics..." />;
  if (!stats) return <div className="text-gray-300">No analytics available.</div>;

  // Gender pie chart data
  const demo = stats?.demographics;
  const genderPieData = demo ? [
    { label: 'Male', value: demo.male.percent, color: '#3B82F6' },
    { label: 'Female', value: demo.female.percent, color: '#EC4899' }
  ] : [];

  // Age group pie chart data
  const ageGroups = stats?.ageGroups;
  const agePieData = ageGroups ? [
    { label: ageGroups.kids.label, value: ageGroups.kids.percent, color: '#10B981', key: 'kids' },
    { label: ageGroups.teens.label, value: ageGroups.teens.percent, color: '#F59E0B', key: 'teens' },
    { label: ageGroups.adults.label, value: ageGroups.adults.percent, color: '#8B5CF6', key: 'adults' }
  ] : [];

  // Build SVG arcs helper
  const buildArcs = (pieData) => {
    let cumulative = 0;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    return pieData.map((seg, i) => {
      const dash = (seg.value / 100) * circumference;
      const gap = circumference - dash;
      const strokeDasharray = `${dash} ${gap}`;
      const strokeDashoffset = -(cumulative / 100) * circumference;
      cumulative += seg.value;
      return (
        <circle
          key={i}
          r={radius}
          cx="90"
          cy="90"
          fill="transparent"
          stroke={seg.color}
          strokeWidth="40"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.6s' }}
        />
      );
    });
  };

  const genderArcs = buildArcs(genderPieData);
  const ageArcs = buildArcs(agePieData);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl mb-4">Admin Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded">
          <h3>Total Users</h3>
          <p className="text-3xl">{stats.totalUsers}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <h3>Active Subscriptions</h3>
          <p className="text-3xl">{stats.activeSubs}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <h3>Monthly Revenue (est.)</h3>
          <p className="text-3xl">₹{stats.revenueMonthlyEstimate}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <h3>Total Content</h3>
          <p className="text-3xl">{stats.totalContent}</p>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-xl mb-3">User Signups (Last 30 days)</h3>
        {timelineLoading ? (
          <Loader text="Loading chart..." />
        ) : timeline.length === 0 ? (
          <div className="text-gray-300">No timeline data.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg width={chart.width} height={chart.height} role="img" aria-label="Users over time line chart">
              {/* axes */}
              <line x1={chart.padding.left} y1={chart.height - chart.padding.bottom} x2={chart.width - chart.padding.right} y2={chart.height - chart.padding.bottom} stroke="#666" />
              <line x1={chart.padding.left} y1={chart.padding.top} x2={chart.padding.left} y2={chart.height - chart.padding.bottom} stroke="#666" />

              {/* y grid + labels */}
              {chart.yTicks.map((t, idx) => (
                <g key={`y-${idx}`}>
                  <line x1={chart.padding.left} y1={t.y} x2={chart.width - chart.padding.right} y2={t.y} stroke="#333" />
                  <text x={chart.padding.left - 8} y={t.y + 4} fill="#aaa" fontSize="11" textAnchor="end">{t.val}</text>
                </g>
              ))}

              {/* x labels */}
              {chart.xLabels.map((l) => {
                const x = chart.padding.left + l.i * ((chart.width - chart.padding.left - chart.padding.right) / Math.max(1, timeline.length - 1));
                const y = chart.height - chart.padding.bottom + 16;
                return <text key={`x-${l.i}`} x={x} y={y} fill="#aaa" fontSize="11" textAnchor="middle">{l.date}</text>;
              })}

              {/* line path */}
              <path d={chart.path} fill="none" stroke="#E50914" strokeWidth="2" />

              {/* points */}
              {timeline.map((p, i) => {
                const x = chart.padding.left + i * ((chart.width - chart.padding.left - chart.padding.right) / Math.max(1, timeline.length - 1));
                const usable = chart.height - chart.padding.top - chart.padding.bottom;
                const y = chart.padding.top + (usable - (p.count / Math.max(1, ...timeline.map(pp => pp.count))) * usable);
                return (
                  <g key={`pt-${i}`}>
                    <circle cx={x} cy={y} r="3" fill="#fff" stroke="#E50914" />
                    <title>{`${p.date}: ${p.count}`}</title>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Gender Demographics Pie Chart */}
      <div className="bg-gray-800 p-4 rounded mt-6">
        <h3 className="text-xl mb-4">User Demographics by Gender</h3>
        {!demo ? (
          <div className="text-gray-300">No demographic data.</div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <svg width="180" height="180" viewBox="0 0 180 180">
              {genderArcs}
              <circle r="50" cx="90" cy="90" fill="#1F2937" />
              <text x="90" y="85" fill="#fff" textAnchor="middle" fontSize="14" fontWeight="600">
                Gender
              </text>
              <text x="90" y="105" fill="#9CA3AF" textAnchor="middle" fontSize="12">
                {stats.totalUsers}
              </text>
            </svg>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {genderPieData.map(p => (
                <div key={p.label} className="flex items-center gap-3 bg-gray-700/40 p-3 rounded">
                  <span className="w-4 h-4 rounded-sm" style={{ background: p.color }} />
                  <div className="text-sm">
                    <div className="font-semibold">{p.label}</div>
                    <div className="text-gray-300">{p.value}% ({demo[p.label.toLowerCase()].count})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Age Group Demographics Pie Chart */}
      <div className="bg-gray-800 p-4 rounded mt-6">
        <h3 className="text-xl mb-4">User Demographics by Age Group</h3>
        {!ageGroups ? (
          <div className="text-gray-300">No age group data.</div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <svg width="180" height="180" viewBox="0 0 180 180">
              {ageArcs}
              <circle r="50" cx="90" cy="90" fill="#1F2937" />
              <text x="90" y="85" fill="#fff" textAnchor="middle" fontSize="14" fontWeight="600">
                Age
              </text>
              <text x="90" y="105" fill="#9CA3AF" textAnchor="middle" fontSize="12">
                {stats.totalUsers}
              </text>
            </svg>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {agePieData.map(p => (
                <div key={p.key} className="flex items-center gap-3 bg-gray-700/40 p-3 rounded">
                  <span className="w-4 h-4 rounded-sm" style={{ background: p.color }} />
                  <div className="text-sm">
                    <div className="font-semibold">{p.label}</div>
                    <div className="text-gray-300">{p.value}% ({ageGroups[p.key].count})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-4">
          Age groups: Kids (0-12), Teens (13-19), Adults (20+). Percentages based on users with age data.
        </p>
      </div>
    </div>
  );
}
