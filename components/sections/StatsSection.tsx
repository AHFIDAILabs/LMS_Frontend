import { useEffect, useState } from 'react';

export function StatsSection() {
  const stats = [
    { value: 500, label: 'Active Students', suffix: '+' },
    { value: 40, label: 'Hours of Content', suffix: '+' },
    { value: 56, label: 'Total Lessons' },
    { value: 95, label: 'Success Rate', suffix: '%' },
  ];

  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const intervals = stats.map((stat, idx) => {
      const step = Math.ceil(stat.value / 50);
      return setInterval(() => {
        setCounts((prev) => {
          const next = [...prev];
          if (next[idx] < stat.value) {
            next[idx] += step;
            if (next[idx] > stat.value) next[idx] = stat.value;
          }
          return next;
        });
      }, 30);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <section className="p-10 bg-[#ede4e4] relative overflow-hidden border-t border-b border-lime-500/20">
      
      {/* Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-lime-500/10 blur-[120px] rounded-full" />
      <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full" />

      <div className="container-custom relative z-10">
        <div className="
          max-w-6xl mx-auto
          grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-10
          text-center
          p-10
          bg-slate-700/90
          rounded-3xl
          border border-[#EFB14A]/20
          shadow-[0_0_80px_rgba(132,204,22,0.12)]
          relative
          overflow-hidden
        ">

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-lime-500/10 via-emerald-500/10 to-lime-500/10 opacity-60" />

          {stats.map((stat, idx) => (
            <div key={idx} className="relative z-10">
              <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-[#EFB14A] to-emerald-400 mb-2">
                {counts[idx]}
                {stat.suffix ?? ''}
              </div>
              <div className="text-gray-400 text-sm sm:text-base">{stat.label}</div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
