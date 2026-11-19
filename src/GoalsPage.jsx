import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Target,
  Trophy,
  Medal,
  Bell,
  Plus,
  CheckCircle2,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  X,
  CalendarDays,
  Sparkles,
  Award,
  Video,
  Radio,
  Camera,
  Users,
} from 'lucide-react';
import { supabase } from './lib/supabase';

const PLATFORMS = [
  { value: 'youtube', label: 'YouTube', icon: Video, color: '#ff4545' },
  { value: 'instagram', label: 'Instagram', icon: Camera, color: '#e879f9' },
  { value: 'tiktok', label: 'TikTok', icon: Video, color: '#38bdf8' },
  { value: 'facebook', label: 'Facebook', icon: Users, color: '#60a5fa' },
  { value: 'twitch', label: 'Twitch', icon: Radio, color: '#a78bfa' },
  { value: 'snapchat', label: 'Snapchat', icon: Camera, color: '#facc15' },
];

const METRICS = {
  youtube: [
    ['views', 'Visualizações'],
    ['subscribers', 'Inscritos ganhos'],
    ['watchTimeMinutes', 'Tempo assistido (minutos)'],
    ['likes', 'Curtidas'],
    ['comments', 'Comentários'],
    ['shares', 'Compartilhamentos'],
  ],
  instagram: [
    ['views', 'Visualizações'],
    ['followers', 'Seguidores ganhos'],
    ['likes', 'Curtidas'],
    ['comments', 'Comentários'],
    ['shares', 'Compartilhamentos'],
    ['reach', 'Contas alcançadas'],
  ],
  tiktok: [
    ['views', 'Visualizações'],
    ['followers', 'Seguidores ganhos'],
    ['likes', 'Curtidas'],
    ['comments', 'Comentários'],
    ['shares', 'Compartilhamentos'],
  ],
  facebook: [
    ['views', 'Visualizações'],
    ['followers', 'Seguidores ganhos'],
    ['reach', 'Pessoas alcançadas'],
    ['likes', 'Curtidas'],
    ['comments', 'Comentários'],
    ['shares', 'Compartilhamentos'],
  ],
  twitch: [
    ['views', 'Visualizações'],
    ['followers', 'Seguidores ganhos'],
    ['watchTimeMinutes', 'Tempo assistido (minutos)'],
  ],
  snapchat: [
    ['views', 'Visualizações'],
    ['followers', 'Seguidores ganhos'],
    ['reach', 'Contas alcançadas'],
    ['shares', 'Compartilhamentos'],
  ],
};

const AWARDS = [
  { title: 'Placa de Prata', target: 100000, color: '#cbd5e1' },
  { title: 'Placa de Ouro', target: 1000000, color: '#fbbf24' },
  { title: 'Placa de Diamante', target: 10000000, color: '#67e8f9' },
  { title: 'Placa de Diamante Vermelho', target: 100000000, color: '#fb7185' },
];

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(
    Number(v || 0)
  );
const pct = (v) => `${Math.min(100, Math.max(0, Number(v || 0))).toFixed(0)}%`;
const day = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
};
const range = (days, endOffset = 1) => {
  const end = new Date();
  end.setDate(end.getDate() - endOffset);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  return { startDate: day(start), endDate: day(end) };
};
const sumDaily = (rows = []) =>
  rows.reduce(
    (a, d) => ({
      views: a.views + Number(d.views || 0),
      subscribersGained: a.subscribersGained + Number(d.subscribersGained || 0),
      watchTimeMinutes: a.watchTimeMinutes + Number(d.watchTimeMinutes || 0),
      likes: a.likes + Number(d.likes || 0),
      comments: a.comments + Number(d.comments || 0),
      shares: a.shares + Number(d.shares || 0),
    }),
    {
      views: 0,
      subscribersGained: 0,
      watchTimeMinutes: 0,
      likes: 0,
      comments: 0,
      shares: 0,
    }
  );

function Progress({ value }) {
  return (
    <div className="goal-progress-track">
      <div
        className="goal-progress-fill"
        style={{ width: `${Math.min(100, Math.max(0, Number(value) || 0))}%` }}
      />
    </div>
  );
}
const platformName = (id) =>
  PLATFORMS.find((p) => p.value === id)?.label || id || 'YouTube';
const metricName = (platform, metric) =>
  METRICS[platform || 'youtube']?.find((m) => m[0] === metric)?.[1] || metric;

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [previousAnalytics, setPreviousAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('week');
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [progressInputs, setProgressInputs] = useState({});
  const [progressSaving, setProgressSaving] = useState({});
  const automaticLock = useRef(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    platform: 'youtube',
    metric: 'views',
    target_value: '',
    deadline: '',
  });

  const loadGoals = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('creator_goals')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) throw err;
    setGoals(data || []);
    return data || [];
  }, []);

  const loadNotifications = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('creator_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    if (err) throw err;
    setNotifications(data || []);
  }, []);

  const loadAnalytics = useCallback(async () => {
    const days = period === 'month' ? 30 : 7;
    const [now, before] = await Promise.all([
      supabase.functions.invoke('youtube-analytics', { body: range(days, 1) }),
      supabase.functions.invoke('youtube-analytics', {
        body: range(days, days + 1),
      }),
    ]);
    if (now.error) throw now.error;
    if (!now.data?.success)
      throw new Error(
        now.data?.error || 'Falha ao carregar Analytics do YouTube.'
      );
    setAnalytics(now.data);
    setPreviousAnalytics(before.data?.success ? before.data : null);
  }, [period]);

  const notify = useCallback(
    async (title, message, eventKey) => {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!auth.user) return;
      const row = {
        user_id: auth.user.id,
        title,
        message,
        type: 'success',
        event_key: eventKey || null,
      };
      const result = eventKey
        ? await supabase
            .from('creator_notifications')
            .upsert(row, {
              onConflict: 'user_id,event_key',
              ignoreDuplicates: true,
            })
        : await supabase.from('creator_notifications').insert(row);
      if (result.error) throw result.error;
      await loadNotifications();
    },
    [loadNotifications]
  );

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!data.user) throw new Error('Faça login para acessar suas metas.');
      await Promise.all([loadGoals(), loadNotifications(), loadAnalytics()]);
    } catch (err) {
      console.error('Erro ao carregar Metas:', err);
      setError(err.message || 'Não foi possível carregar esta página.');
    } finally {
      setLoading(false);
    }
  }, [loadGoals, loadNotifications, loadAnalytics]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setForm((old) => ({
      ...old,
      metric: METRICS[old.platform].some((m) => m[0] === old.metric)
        ? old.metric
        : METRICS[old.platform][0][0],
    }));
  }, [form.platform]);

  // Metas do YouTube usam o acumulado desde a criação, não o período do recap.
  useEffect(() => {
    if (!analytics || !goals.length || automaticLock.current) return;
    const active = goals.filter(
      (g) =>
        (g.platform || 'youtube') === 'youtube' &&
        g.automatic &&
        g.status === 'active'
    );
    if (!active.length) return;
    let cancelled = false;
    automaticLock.current = true;

    (async () => {
      try {
        const firstDate = active
          .map((g) => String(g.created_at).slice(0, 10))
          .sort()[0];
        const end = new Date();
        end.setDate(end.getDate() - 1);
        const result = await supabase.functions.invoke('youtube-analytics', {
          body: { startDate: firstDate, endDate: day(end) },
        });
        if (result.error) throw result.error;
        if (!result.data?.success)
          throw new Error(
            result.data?.error ||
              'Não foi possível obter o acumulado do YouTube.'
          );
        const totals = sumDaily(result.data.dailyStats || []);
        const values = {
          views: totals.views,
          subscribers: totals.subscribersGained,
          watchTimeMinutes: totals.watchTimeMinutes,
          likes: totals.likes || Number(result.data.overview?.likes || 0),
          comments:
            totals.comments || Number(result.data.overview?.comments || 0),
          shares: totals.shares || Number(result.data.overview?.shares || 0),
        };

        const changed = [];
        for (const goal of active) {
          if (cancelled) break;
          const value = Number(values[goal.metric]);
          if (!Number.isFinite(value)) continue;
          const done = value >= Number(goal.target_value);
          if (value === Number(goal.current_value || 0) && !done) continue;
          const payload = {
            current_value: value,
            status: done ? 'completed' : 'active',
            completed_at: done
              ? goal.completed_at || new Date().toISOString()
              : null,
            updated_at: new Date().toISOString(),
          };
          const { data: rows, error: updateError } = await supabase
            .from('creator_goals')
            .update(payload)
            .eq('id', goal.id)
            .eq('status', 'active')
            .select('id');
          if (updateError) throw updateError;
          if (!rows?.length) continue;
          changed.push({ ...goal, ...payload });
          if (done)
            await notify(
              'Meta concluída! 🎉',
              `Você alcançou "${goal.title}" no YouTube. Parabéns!`,
              `goal_completed:${goal.id}`
            );
        }
        if (!cancelled && changed.length) {
          setGoals((old) =>
            old.map((g) => changed.find((c) => c.id === g.id) || g)
          );
        }
      } catch (err) {
        console.error('Erro ao atualizar metas automáticas:', err);
        if (!cancelled)
          setError(`Erro ao atualizar metas automáticas: ${err.message}`);
      } finally {
        automaticLock.current = false;
      }
    })();

    return () => {
      cancelled = true;
      automaticLock.current = false;
    };
  }, [analytics, goals, notify]);

  const saveGoal = async (e) => {
    e.preventDefault();
    const target = Number(form.target_value);
    if (!form.title.trim() || !Number.isFinite(target) || target <= 0) {
      setError('Informe um nome e um valor de meta maior que zero.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!auth.user) throw new Error('Usuário não autenticado.');
      const { error: insertError } = await supabase
        .from('creator_goals')
        .insert({
          user_id: auth.user.id,
          title: form.title.trim(),
          description: form.description.trim(),
          category: 'personal',
          platform: form.platform,
          metric: form.metric,
          current_value: 0,
          target_value: target,
          deadline: form.deadline || null,
          status: 'active',
          automatic: form.platform === 'youtube',
        });
      if (insertError) throw insertError;
      setForm({
        title: '',
        description: '',
        platform: 'youtube',
        metric: 'views',
        target_value: '',
        deadline: '',
      });
      setShowForm(false);
      await loadGoals();
    } catch (err) {
      setError(err.message || 'Não foi possível salvar a meta.');
    } finally {
      setSaving(false);
    }
  };

  const updateManualProgress = async (goal) => {
    const raw = progressInputs[goal.id] ?? String(goal.current_value || 0);
    const value = Number(raw);
    if (raw === '' || !Number.isFinite(value) || value < 0) {
      setError('Digite um progresso válido.');
      return;
    }
    try {
      setProgressSaving((s) => ({ ...s, [goal.id]: true }));
      setError('');
      const done = value >= Number(goal.target_value);
      const payload = {
        current_value: value,
        status: done ? 'completed' : 'active',
        completed_at: done
          ? goal.completed_at || new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      };
      const { data: rows, error: updateError } = await supabase
        .from('creator_goals')
        .update(payload)
        .eq('id', goal.id)
        .eq('automatic', false)
        .select('id');
      if (updateError) throw updateError;
      if (!rows?.length)
        throw new Error('Meta não encontrada ou não é manual.');
      setGoals((old) =>
        old.map((g) => (g.id === goal.id ? { ...g, ...payload } : g))
      );
      setProgressInputs((old) => {
        const next = { ...old };
        delete next[goal.id];
        return next;
      });
      if (done && goal.status !== 'completed') {
        await notify(
          'Meta concluída! 🎉',
          `Você concluiu "${goal.title}" em ${platformName(goal.platform)}.`,
          `goal_completed:${goal.id}`
        );
      }
    } catch (err) {
      setError(err.message || 'Não foi possível atualizar a meta.');
    } finally {
      setProgressSaving((s) => ({ ...s, [goal.id]: false }));
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Deseja excluir esta meta?')) return;
    const { error: err } = await supabase
      .from('creator_goals')
      .delete()
      .eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    setGoals((old) => old.filter((g) => g.id !== id));
  };

  const markRead = async (id) => {
    const { error: err } = await supabase
      .from('creator_notifications')
      .update({ read: true })
      .eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    setNotifications((old) =>
      old.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const overview = analytics?.overview || {};
  const videos = analytics?.videos || [];
  const subscribers = Number(analytics?.channel?.currentSubscribers || 0);
  const current = sumDaily(analytics?.dailyStats || []);
  const previous = sumDaily(previousAnalytics?.dailyStats || []);
  const recap = [
    ['Visualizações', current.views, previous.views, ''],
    [
      'Inscritos ganhos',
      current.subscribersGained,
      previous.subscribersGained,
      '',
    ],
    [
      'Tempo assistido',
      current.watchTimeMinutes,
      previous.watchTimeMinutes,
      ' min',
    ],
  ];
  const bestVideo = [...videos].sort(
    (a, b) => Number(b.views || 0) - Number(a.views || 0)
  )[0];
  const nextAward = AWARDS.find((a) => subscribers < a.target);
  const awardProgress = nextAward
    ? (subscribers / nextAward.target) * 100
    : 100;
  const visibleGoals = goals.filter(
    (g) => filter === 'all' || (g.platform || 'youtube') === filter
  );

  const comparison = (a, b) => {
    const diff = Number(a || 0) - Number(b || 0);
    const change = b > 0 ? (diff / b) * 100 : null;
    if (diff > 0)
      return (
        <span className="goal-comparison positive">
          <TrendingUp size={15} />
          {change === null ? `+${fmt(diff)}` : `+${change.toFixed(1)}%`}
        </span>
      );
    if (diff < 0)
      return (
        <span className="goal-comparison negative">
          <TrendingDown size={15} />
          {change === null ? fmt(diff) : `${change.toFixed(1)}%`}
        </span>
      );
    return (
      <span className="goal-comparison neutral">
        <Minus size={15} /> Sem alteração
      </span>
    );
  };

  return (
    <div className="dashboard goals-page">
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Metas e conquistas</h2>
            <p>Acompanhe a evolução de todas as suas plataformas.</p>
          </div>
          <button
            className="connect-button"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>
        {error && <div className="goal-error">{error}</div>}
        {loading ? (
          <div className="empty-state">
            Carregando suas metas e resultados...
          </div>
        ) : (
          <>
            <div className="goal-highlight">
              <div className="goal-highlight-icon">
                <Trophy size={28} />
              </div>
              <div>
                <span className="goal-eyebrow">
                  PRÓXIMA CONQUISTA DO YOUTUBE
                </span>
                <h3>
                  {nextAward
                    ? nextAward.title
                    : 'Todas as placas numéricas alcançadas!'}
                </h3>
                <p>
                  {nextAward
                    ? `${fmt(subscribers)} de ${fmt(
                        nextAward.target
                      )} inscritos`
                    : 'Confira sua elegibilidade no site oficial do YouTube.'}
                </p>
                <Progress value={awardProgress} />
              </div>
              <strong>{pct(awardProgress)}</strong>
            </div>

            <div className="goal-section-heading">
              <div>
                <h3>Programa de Prêmios para Criadores</h3>
                <p>As placas dependem da análise e aprovação do YouTube.</p>
              </div>
            </div>
            <div className="goal-awards-grid">
              {AWARDS.map((award) => {
                const reached = subscribers >= award.target;
                return (
                  <article
                    className={`goal-award-card ${reached ? 'reached' : ''}`}
                    key={award.title}
                  >
                    <div
                      className="goal-award-icon"
                      style={{ color: award.color }}
                    >
                      {reached ? (
                        <CheckCircle2 size={27} />
                      ) : (
                        <Medal size={27} />
                      )}
                    </div>
                    <strong>{award.title}</strong>
                    <span>{fmt(award.target)} inscritos</span>
                    <small>
                      {reached
                        ? 'Meta numérica alcançada'
                        : 'Ainda não alcançada'}
                    </small>
                    {reached && (
                      <a
                        href="https://www.youtube.com/creators/awards/"
                        target="_blank"
                        rel="noreferrer"
                        className="goal-link"
                      >
                        Ver como solicitar <Award size={15} />
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="goal-note">
              Atingir o número de inscritos não garante a placa. O YouTube
              verifica a elegibilidade do canal antes de liberar o resgate.
            </div>

            <div className="goal-section-heading">
              <div>
                <h3>Programa de Parcerias do YouTube</h3>
                <p>
                  Consulte os requisitos e acompanhe a elegibilidade no Studio.
                </p>
              </div>
            </div>
            <div className="goal-ypp-card">
              <div className="goal-ypp-icon">
                <Sparkles size={24} />
              </div>
              <div>
                <strong>YPP expandido</strong>
                <p>
                  Em países elegíveis, o nível inicial exige 500 inscritos, 3
                  envios públicos válidos em 90 dias e o requisito de horas
                  públicas ou visualizações qualificadas de Shorts.
                </p>
                <a
                  href="https://www.youtube.com/creators/partner-program/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Consultar requisitos oficiais
                </a>
              </div>
            </div>
            <div className="goal-ypp-card">
              <div className="goal-ypp-icon">
                <Trophy size={24} />
              </div>
              <div>
                <strong>Receita de anúncios</strong>
                <p>
                  O nível de receita de anúncios exige 1.000 inscritos e o
                  requisito de horas públicas ou visualizações qualificadas de
                  Shorts.
                </p>
                <a
                  href="https://studio.youtube.com/channel/UC/monetization"
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir área de monetização do YouTube Studio
                </a>
              </div>
            </div>
            <div className="goal-note">
              O Analytics comum não confirma horas públicas nem visualizações
              qualificadas para o YPP. A área Ganhos do YouTube Studio é a fonte
              oficial.
            </div>

            <div className="goal-section-heading">
              <div>
                <h3>Metas de todas as plataformas</h3>
                <p>
                  YouTube automático; demais plataformas com progresso manual
                  até conectarmos as APIs oficiais.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() => setShowForm((v) => !v)}
              >
                <Plus size={16} /> Nova meta
              </button>
            </div>
            <div className="goal-platform-status-grid">
              {PLATFORMS.map((p) => {
                const Icon = p.icon;
                const count = goals.filter(
                  (g) => (g.platform || 'youtube') === p.value
                ).length;
                return (
                  <button
                    type="button"
                    key={p.value}
                    className={`goal-platform-chip ${
                      filter === p.value ? 'active' : ''
                    }`}
                    onClick={() =>
                      setFilter(filter === p.value ? 'all' : p.value)
                    }
                  >
                    <Icon size={17} style={{ color: p.color }} />
                    <span>{p.label}</span>
                    <strong>{count}</strong>
                  </button>
                );
              })}
              <button
                type="button"
                className={`goal-platform-chip ${
                  filter === 'all' ? 'active' : ''
                }`}
                onClick={() => setFilter('all')}
              >
                <Target size={17} />
                <span>Todas</span>
                <strong>{goals.length}</strong>
              </button>
            </div>

            {showForm && (
              <form className="goal-form" onSubmit={saveGoal}>
                <label>Nome da meta</label>
                <input
                  className="hub-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex.: Chegar a 10 mil visualizações"
                  required
                />
                <label>Descrição</label>
                <textarea
                  className="hub-textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Descreva o que você quer alcançar..."
                />
                <div className="form-grid">
                  <div>
                    <label>Plataforma</label>
                    <select
                      className="hub-input"
                      value={form.platform}
                      onChange={(e) =>
                        setForm({ ...form, platform: e.target.value })
                      }
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Métrica</label>
                    <select
                      className="hub-input"
                      value={form.metric}
                      onChange={(e) =>
                        setForm({ ...form, metric: e.target.value })
                      }
                    >
                      {METRICS[form.platform].map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Valor desejado</label>
                    <input
                      className="hub-input"
                      type="number"
                      min="1"
                      value={form.target_value}
                      onChange={(e) =>
                        setForm({ ...form, target_value: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label>Prazo</label>
                    <input
                      className="hub-input"
                      type="date"
                      value={form.deadline}
                      onChange={(e) =>
                        setForm({ ...form, deadline: e.target.value })
                      }
                    />
                  </div>
                </div>
                <small className="helper-text">
                  {form.platform === 'youtube'
                    ? 'O progresso será atualizado automaticamente pelos dados disponíveis no Analytics do YouTube.'
                    : `O progresso de ${platformName(
                        form.platform
                      )} será atualizado manualmente até a integração oficial.`}
                </small>
                <div className="form-actions">
                  <button
                    type="button"
                    className="connect-button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={saving}
                  >
                    <CheckCircle2 size={16} />{' '}
                    {saving ? 'Salvando...' : 'Salvar meta'}
                  </button>
                </div>
              </form>
            )}

            {visibleGoals.length === 0 ? (
              <div className="empty-state">
                <Target size={30} />
                <strong>Nenhuma meta encontrada</strong>
                <span>Crie uma meta para acompanhar sua evolução.</span>
              </div>
            ) : (
              <div className="goal-list">
                {visibleGoals.map((goal) => {
                  const value = Number(goal.current_value || 0),
                    target = Number(goal.target_value || 1);
                  const progress = Math.min(100, (value / target) * 100);
                  const isAuto =
                    (goal.platform || 'youtube') === 'youtube' &&
                    goal.automatic;
                  const Icon =
                    PLATFORMS.find(
                      (p) => p.value === (goal.platform || 'youtube')
                    )?.icon || Target;
                  return (
                    <article className="goal-item" key={goal.id}>
                      <div className="goal-item-top">
                        <div>
                          <div className="goal-item-platform">
                            <Icon size={15} />
                            <span>
                              {platformName(goal.platform || 'youtube')}
                            </span>
                            <span
                              className={`goal-mode ${
                                isAuto ? 'automatic' : 'manual'
                              }`}
                            >
                              {isAuto ? 'Automática' : 'Manual'}
                            </span>
                          </div>
                          <strong>{goal.title}</strong>
                          {goal.description && <p>{goal.description}</p>}
                          <small>
                            {metricName(
                              goal.platform || 'youtube',
                              goal.metric
                            )}
                          </small>
                        </div>
                        <button
                          className="icon-button"
                          onClick={() => deleteGoal(goal.id)}
                          title="Excluir meta"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="goal-progress-label">
                        <span>
                          {fmt(value)} / {fmt(target)}
                        </span>
                        <strong>{pct(progress)}</strong>
                      </div>
                      <Progress value={progress} />
                      {!isAuto && goal.status !== 'completed' && (
                        <div className="goal-manual-update">
                          <input
                            className="hub-input"
                            type="number"
                            min="0"
                            value={progressInputs[goal.id] ?? String(value)}
                            onChange={(e) =>
                              setProgressInputs((s) => ({
                                ...s,
                                [goal.id]: e.target.value,
                              }))
                            }
                            aria-label={`Progresso de ${goal.title}`}
                          />
                          <button
                            className="connect-button"
                            onClick={() => updateManualProgress(goal)}
                            disabled={!!progressSaving[goal.id]}
                          >
                            <Save size={15} />{' '}
                            {progressSaving[goal.id]
                              ? 'Salvando...'
                              : 'Atualizar'}
                          </button>
                        </div>
                      )}
                      {goal.deadline && (
                        <small className="goal-deadline">
                          <CalendarDays size={13} /> Prazo:{' '}
                          {new Date(
                            `${goal.deadline}T12:00:00`
                          ).toLocaleDateString('pt-BR')}
                        </small>
                      )}
                      {goal.status === 'completed' && (
                        <span className="goal-completed">
                          <CheckCircle2 size={14} /> Concluída
                        </span>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {!loading && (
        <>
          <section className="section">
            <div className="goal-section-heading">
              <div>
                <h3>Recap do YouTube</h3>
                <p>Compare o período atual com o anterior.</p>
              </div>
              <select
                className="hub-input goal-period-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="week">Últimos 7 dias</option>
                <option value="month">Últimos 30 dias</option>
              </select>
            </div>
            <div className="goal-recap-grid">
              {recap.map(([label, now, before, suffix]) => (
                <article className="goal-recap-card" key={label}>
                  <span>{label}</span>
                  <strong>
                    {fmt(now)}
                    {suffix}
                  </strong>
                  {comparison(now, before)}
                </article>
              ))}
            </div>
            <div className="goal-best-video">
              <div className="goal-best-video-icon">
                <Trophy size={22} />
              </div>
              <div>
                <small>DESTAQUE DO PERÍODO</small>
                <strong>
                  {bestVideo?.title || 'Ainda não há dados de vídeos'}
                </strong>
                {bestVideo && (
                  <span>{fmt(bestVideo.views)} visualizações no período</span>
                )}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="goal-section-heading">
              <div>
                <h3>Comparação entre vídeos do YouTube</h3>
                <p>
                  Resultados dos vídeos no período carregado pelo Analytics.
                </p>
              </div>
            </div>
            {videos.length < 2 ? (
              <div className="empty-state">
                <Eye size={28} />
                <strong>Precisamos de pelo menos dois vídeos</strong>
                <span>Escolha um período com mais vídeos para comparar.</span>
              </div>
            ) : (
              <div className="goal-video-table-wrap">
                <table className="goal-video-table">
                  <thead>
                    <tr>
                      <th>Vídeo</th>
                      <th>Views</th>
                      <th>Tempo assistido</th>
                      <th>Inscritos</th>
                      <th>Likes</th>
                      <th>Comentários</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...videos]
                      .sort(
                        (a, b) => Number(b.views || 0) - Number(a.views || 0)
                      )
                      .slice(0, 10)
                      .map((video) => (
                        <tr key={video.videoId}>
                          <td className="goal-video-title">
                            {video.thumbnail && (
                              <img src={video.thumbnail} alt="" />
                            )}
                            <span>{video.title}</span>
                          </td>
                          <td>{fmt(video.views)}</td>
                          <td>{fmt(video.watchTimeMinutes)} min</td>
                          <td>{fmt(video.subscribersGained)}</td>
                          <td>{fmt(video.likes)}</td>
                          <td>{fmt(video.comments)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="section">
            <div className="goal-section-heading">
              <div>
                <h3>Notificações de conquistas</h3>
                <p>Histórico de metas concluídas e avisos do Vico Hub.</p>
              </div>
              <span className="period-label">
                {notifications.filter((n) => !n.read).length} não lidas
              </span>
            </div>
            {!notifications.length ? (
              <div className="empty-state">
                <Bell size={28} />
                <strong>Nenhuma notificação ainda</strong>
                <span>Quando uma meta for concluída, ela aparecerá aqui.</span>
              </div>
            ) : (
              <div className="goal-notifications">
                {notifications.map((item) => (
                  <article
                    className={`goal-notification ${item.read ? 'read' : ''}`}
                    key={item.id}
                  >
                    <span className="goal-notification-icon">
                      <Bell size={17} />
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.message}</p>
                      <small>
                        {new Date(item.created_at).toLocaleString('pt-BR')}
                      </small>
                    </div>
                    {!item.read && (
                      <button
                        className="text-button"
                        onClick={() => markRead(item.id)}
                      >
                        Marcar como lida
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
