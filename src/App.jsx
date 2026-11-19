import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import GoalsPage from './GoalsPage';

import {
  siYoutube,
  siInstagram,
  siTiktok,
  siFacebook,
  siTwitch,
  siSnapchat,
} from 'simple-icons';

import {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  FileText,
  Radio,
  Sparkles,
  Settings,
  Bell,
  Plus,
  ChevronRight,
  Users,
  Eye,
  Trash2,
  Clock,
  Video,
  Send,
  Save,
  Search,
  X,
  CheckCircle2,
  CalendarPlus,
  MonitorPlay,
  Moon,
  Sun,
  RefreshCw,
  ThumbsUp,
  MessageCircle,
  Share2,
  DollarSign,
  Smartphone,
  Monitor,
  Tablet,
  Play,
  Target,
} from 'lucide-react';

const platforms = [
  { name: 'YouTube', icon: siYoutube, color: '#FF0033' },
  { name: 'Instagram', icon: siInstagram, color: '#E4405F' },
  { name: 'TikTok', icon: siTiktok, color: '#FFFFFF' },
  { name: 'Facebook', icon: siFacebook, color: '#1877F2' },
  { name: 'Twitch', icon: siTwitch, color: '#9146FF' },
  { name: 'Snapchat', icon: siSnapchat, color: '#FFFC00' },
];

const platformIntegrations = {
  YouTube: {
    enabled: true,
    startFunction: 'youtube-oauth-start',
    disconnectFunction: 'youtube-oauth-disconnect',
  },
  Instagram: {
    enabled: false,
    startFunction: null,
    disconnectFunction: null,
  },
  TikTok: {
    enabled: false,
    startFunction: null,
    disconnectFunction: null,
  },
  Facebook: {
    enabled: false,
    startFunction: null,
    disconnectFunction: null,
  },
  Twitch: {
    enabled: false,
    startFunction: null,
    disconnectFunction: null,
  },
  Snapchat: {
    enabled: false,
    startFunction: null,
    disconnectFunction: null,
  },
};

const postFormats = {
  YouTube: ['Vídeo', 'Short', 'Live'],
  Instagram: ['Publicação', 'Reels', 'Story', 'Live'],
  TikTok: ['Vídeo', 'Story', 'Live'],
  Facebook: ['Publicação', 'Reels', 'Story', 'Live'],
  Twitch: ['Live', 'Vídeo'],
  Snapchat: ['Story', 'Spotlight'],
};

const navigation = [
  { name: 'Visão geral', icon: LayoutDashboard },
  { name: 'Minhas plataformas', icon: Users },
  { name: 'Publicações', icon: FileText },
  { name: 'Calendário', icon: CalendarDays },
  { name: 'Agendamentos', icon: Clock },
  { name: 'Analytics', icon: BarChart3 },
  { name: 'Metas', icon: Target },
  { name: 'Central de lives', icon: Radio },
  { name: 'Vico AI', icon: Sparkles },
  { name: 'Configurações', icon: Settings },
];

const today = new Date();

const dateInput = (date) => {
  const d = new Date(date);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
};

function App() {
  const [activePage, setActivePage] = useState('Visão geral');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState({});
  const [connectingPlatform, setConnectingPlatform] = useState(null);

  const [platformConfirmation, setPlatformConfirmation] = useState(null);
  const [platformConfirmationChecked, setPlatformConfirmationChecked] =
    useState(false);
  const [platformNotice, setPlatformNotice] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const [posts, setPosts] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postPlatform, setPostPlatform] = useState('');
  const [postType, setPostType] = useState('');
  const [postDate, setPostDate] = useState(dateInput(today));
  const [postTime, setPostTime] = useState('18:00');
  const [postSearch, setPostSearch] = useState('');

  const [calendarMonth, setCalendarMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [liveTitle, setLiveTitle] = useState('');
  const [livePlatform, setLivePlatform] = useState('YouTube');
  const [lives, setLives] = useState([]);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationRead, setNotificationRead] = useState(false);
  const [noticeProgress, setNoticeProgress] = useState(100);

  const [theme, setTheme] = useState('Escuro');
  const [language, setLanguage] = useState('Português');
  const [density, setDensity] = useState('Confortável');

  const [aiInput, setAiInput] = useState('');

  // Fecha automaticamente qualquer aviso após 4 segundos.
  useEffect(() => {
    if (!platformNotice) return undefined;

    setNoticeProgress(100);

    const startId = window.setTimeout(() => {
      setNoticeProgress(0);
    }, 20);

    const timeoutId = window.setTimeout(() => {
      setPlatformNotice(null);
    }, 4000);

    return () => {
      window.clearTimeout(startId);
      window.clearTimeout(timeoutId);
    };
  }, [platformNotice]);

  // =====================================================
  // ESTADO DOS ANALYTICS DO YOUTUBE
  // =====================================================

  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('28');
  const [selectedAnalyticsVideo, setSelectedAnalyticsVideo] = useState(null);
  const [analyticsVideosExpanded, setAnalyticsVideosExpanded] = useState(false);

  // Interação com os gráficos gerais
  const [analyticsChartHover, setAnalyticsChartHover] = useState({});
  const [analyticsChartPinned, setAnalyticsChartPinned] = useState({});

  // Ponto selecionado no gráfico de retenção
  const [analyticsRetentionPoint, setAnalyticsRetentionPoint] = useState(null);
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      text: 'Olá! Eu sou a Vico AI. Em breve vou ajudar com ideias, títulos, roteiros e análise do seu conteúdo. 💜',
    },
  ]);

  const mapPostFromDatabase = (post) => ({
    id: post.id,
    title: post.title,
    description: post.description || '',
    platform: post.platform,
    type: post.format || 'Vídeo',
    date: post.scheduled_date || dateInput(today),
    time: post.scheduled_time ? post.scheduled_time.slice(0, 5) : '18:00',
    status:
      post.status === 'draft'
        ? 'Rascunho'
        : post.status === 'scheduled'
        ? 'Agendada'
        : 'Publicada',
  });

  // =====================================================
  // CARREGAMENTO DAS PLATAFORMAS
  // =====================================================

  const loadConnectedPlatforms = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setConnectedPlatforms([]);
        setConnectedAccounts({});
        return;
      }

      const { data, error } = await supabase
        .from('platform_connections')
        .select('platform, status, account_name')
        .eq('user_id', user.id);

      if (error) throw error;

      const officialConnections = (data || []).filter((item) => {
        const integration = platformIntegrations[item.platform];

        return item.status === 'connected' && integration?.enabled === true;
      });

      const connected = officialConnections.map((item) => item.platform);

      const accounts = {};

      officialConnections.forEach((item) => {
        accounts[item.platform] = item.account_name || '';
      });

      setConnectedPlatforms([...new Set(connected)]);
      setConnectedAccounts(accounts);
    } catch (error) {
      console.error('Erro ao carregar plataformas:', error);
    }
  };

  useEffect(() => {
    loadConnectedPlatforms();
  }, []);

  // =====================================================
  // RETORNO DO GOOGLE OAUTH
  // =====================================================

  useEffect(() => {
    const handleOAuthReturn = async () => {
      const params = new URLSearchParams(window.location.search);

      const oauthStatus = params.get('youtube_oauth');
      const oauthMessage = params.get('message');

      if (!oauthStatus) return;

      setActivePage('Minhas plataformas');

      if (oauthStatus === 'success') {
        await loadConnectedPlatforms();

        setPlatformNotice({
          type: 'success',
          message: 'YouTube conectado com sucesso ao Vico Hub! 💜',
        });
      } else if (oauthStatus === 'error') {
        const message = oauthMessage
          ? decodeURIComponent(oauthMessage.replace(/\+/g, ' '))
          : 'Tente novamente.';

        setPlatformNotice({
          type: 'error',
          message: `Não foi possível conectar o YouTube: ${message}`,
        });
      }

      params.delete('youtube_oauth');
      params.delete('message');

      const query = params.toString();

      const cleanUrl =
        window.location.pathname +
        (query ? `?${query}` : '') +
        window.location.hash;

      window.history.replaceState({}, document.title, cleanUrl);
    };

    handleOAuthReturn();
  }, []);

  // =====================================================
  // CARREGAMENTO DAS PUBLICAÇÕES
  // =====================================================

  useEffect(() => {
    let active = true;

    const loadPosts = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) return;

        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (active) {
          setPosts((data || []).map(mapPostFromDatabase));
        }
      } catch (error) {
        console.error('Erro ao carregar publicações:', error);
      }
    };

    loadPosts();

    return () => {
      active = false;
    };
  }, []);

  // =====================================================
  // CARREGAMENTO DAS LIVES
  // =====================================================

  useEffect(() => {
    let active = true;

    const loadLives = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) return;

        const { data, error } = await supabase
          .from('live_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (active) {
          setLives(
            (data || []).map((live) => ({
              id: live.id,
              title: live.title,
              platform: live.platform,
              date: live.scheduled_date || dateInput(today),
              status: live.status === 'planned' ? 'Planejada' : live.status,
            }))
          );
        }
      } catch (error) {
        console.error('Erro ao carregar lives:', error);
      }
    };

    loadLives();

    return () => {
      active = false;
    };
  }, []);

  // =====================================================
  // DADOS GERAIS
  // =====================================================

  const connectedCount = connectedPlatforms.length;

  const scheduledPosts = posts.filter((post) => post.status === 'Agendada');

  // Uma nova quantidade de agendamentos gera uma nova notificação não lida.
  useEffect(() => {
    setNotificationRead(false);
  }, [scheduledPosts.length]);

  const drafts = posts.filter((post) => post.status === 'Rascunho');

  const publishedPosts = posts.filter((post) => post.status === 'Publicada');

  const filteredPosts = useMemo(() => {
    const term = postSearch.toLowerCase();

    return posts.filter((post) =>
      `${post.title} ${post.platform} ${post.status}`
        .toLowerCase()
        .includes(term)
    );
  }, [posts, postSearch]);

  const changePage = (page) => {
    setActivePage(page);
    setNotificationOpen(false);
  };

  const handlePostPlatformChange = (platformName) => {
    setPostPlatform(platformName);
    setPostType('');
  };

  // =====================================================
  // CONEXÃO E DESCONEXÃO DAS PLATAFORMAS
  // =====================================================

  const connectPlatform = async (name, action) => {
    const integration = platformIntegrations[name];

    if (!integration?.enabled) {
      setPlatformNotice({
        type: 'error',
        message: `A integração oficial do ${name} ainda está sendo preparada.`,
      });
      return;
    }

    try {
      setConnectingPlatform(name);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error('Você precisa estar autenticado no Vico Hub.');
      }

      // DESCONEXÃO
      if (action === 'disconnect') {
        if (!integration.disconnectFunction) {
          throw new Error('A função de desconexão não está configurada.');
        }

        const { data, error } = await supabase.functions.invoke(
          integration.disconnectFunction,
          {
            method: 'POST',
          }
        );

        if (error) throw error;

        if (!data?.success) {
          throw new Error(
            data?.error || `Não foi possível desconectar ${name}.`
          );
        }

        setConnectedPlatforms((current) =>
          current.filter((platform) => platform !== name)
        );

        setConnectedAccounts((current) => {
          const updated = { ...current };
          delete updated[name];
          return updated;
        });

        setPlatformNotice({
          type: 'success',
          message: `${name} desconectado com sucesso! 💜`,
        });

        setConnectingPlatform(null);
        return;
      }

      // CONEXÃO
      if (!integration.startFunction) {
        throw new Error('A função de conexão não está configurada.');
      }

      const { data, error } = await supabase.functions.invoke(
        integration.startFunction,
        {
          method: 'POST',
        }
      );

      if (error) throw error;

      if (!data?.url) {
        throw new Error(
          'A função de autenticação não retornou o endereço de autorização.'
        );
      }

      window.location.assign(data.url);
    } catch (error) {
      console.error(`Erro na integração ${name}:`, error);

      setPlatformNotice({
        type: 'error',
        message:
          error.message || `Não foi possível realizar a operação com ${name}.`,
      });

      setConnectingPlatform(null);
    }
  };

  const requestPlatformAction = (name, isConnected) => {
    setPlatformConfirmation({
      name,
      action: isConnected ? 'disconnect' : 'connect',
    });
    setPlatformConfirmationChecked(false);
    setPlatformNotice(null);
  };

  const confirmPlatformAction = () => {
    if (!platformConfirmation || !platformConfirmationChecked) return;

    const { name, action } = platformConfirmation;

    setPlatformConfirmation(null);
    setPlatformConfirmationChecked(false);
    connectPlatform(name, action);
  };

  // =====================================================
  // PUBLICAÇÕES
  // =====================================================

  const resetPostForm = () => {
    setShowPostForm(false);
    setEditingPostId(null);
    setPostTitle('');
    setPostDescription('');
    setPostPlatform('');
    setPostType('');
    setPostDate(dateInput(today));
    setPostTime('18:00');
  };

  const openNewPost = () => {
    resetPostForm();
    setShowPostForm(true);
  };

  const editPost = (post) => {
    const availableFormats = postFormats[post.platform] || [];

    setEditingPostId(post.id);
    setPostTitle(post.title);
    setPostDescription(post.description);
    setPostPlatform(post.platform);

    setPostType(
      availableFormats.includes(post.type)
        ? post.type
        : availableFormats[0] || ''
    );

    setPostDate(post.date);
    setPostTime(post.time);
    setShowPostForm(true);
  };

  const savePost = async (status) => {
    if (status === 'Agendada') {
      if (!postDate || !postTime) {
        setPlatformNotice({
          type: 'error',
          message: 'Escolha a data e o horário do agendamento.',
        });
        return;
      }
      const [year, month, day] = postDate.split('-').map(Number);
      const [hour, minute] = postTime.split(':').map(Number);
      const scheduledAt = new Date(year, month - 1, day, hour, minute);
      if (scheduledAt.getTime() <= Date.now()) {
        setPlatformNotice({
          type: 'error',
          message:
            'Não é possível agendar uma publicação para uma data ou horário que já passou.',
        });
        return;
      }
    }

    if (!postTitle.trim()) {
      setPlatformNotice({
        type: 'error',
        message: 'Adicione um título para continuar.',
      });
      return;
    }

    if (!postPlatform) {
      setPlatformNotice({
        type: 'error',
        message: 'Escolha uma plataforma para continuar.',
      });
      return;
    }

    if (!postType) {
      setPlatformNotice({
        type: 'error',
        message: 'Escolha um formato para continuar.',
      });
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('Usuário não autenticado.');

      const postData = {
        title: postTitle.trim(),
        description: postDescription.trim(),
        platform: postPlatform,
        format: postType,
        scheduled_date: postDate || null,
        scheduled_time: postTime || null,
        status:
          status === 'Rascunho'
            ? 'draft'
            : status === 'Agendada'
            ? 'scheduled'
            : 'published',
      };

      if (editingPostId) {
        const { data, error } = await supabase
          .from('posts')
          .update({
            ...postData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingPostId)
          .select()
          .single();

        if (error) throw error;

        setPosts((current) =>
          current.map((post) =>
            post.id === editingPostId ? mapPostFromDatabase(data) : post
          )
        );
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            ...postData,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        setPosts((current) => [mapPostFromDatabase(data), ...current]);
      }

      resetPostForm();
    } catch (error) {
      console.error('Erro ao salvar publicação:', error);

      setPlatformNotice({
        type: 'error',
        message: error.message || 'Não foi possível salvar a publicação.',
      });
    }
  };

  const requestDeletePost = (id) => {
    const post = posts.find((item) => item.id === id);
    setDeleteConfirmation({
      type: 'post',
      id,
      name: post?.title || 'esta publicação',
    });
  };

  const deletePost = async (id) => {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);

      if (error) throw error;

      setPosts((current) => current.filter((post) => post.id !== id));
    } catch (error) {
      console.error('Erro ao excluir publicação:', error);
      setPlatformNotice({
        type: 'error',
        message: 'Não foi possível excluir a publicação.',
      });
    }
  };

  // =====================================================
  // LIVES
  // =====================================================

  const addLive = async () => {
    if (!liveTitle.trim()) {
      setPlatformNotice({
        type: 'error',
        message: 'Digite o nome da sua live.',
      });
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('Usuário não autenticado.');

      const { data, error } = await supabase
        .from('live_sessions')
        .insert({
          user_id: user.id,
          title: liveTitle.trim(),
          platform: livePlatform,
          scheduled_date: dateInput(today),
          status: 'planned',
        })
        .select()
        .single();

      if (error) throw error;

      setLives((current) => [
        {
          id: data.id,
          title: data.title,
          platform: data.platform,
          date: data.scheduled_date || dateInput(today),
          status: 'Planejada',
        },
        ...current,
      ]);

      setLiveTitle('');
    } catch (error) {
      console.error('Erro ao salvar live:', error);

      setPlatformNotice({
        type: 'error',
        message: error.message || 'Não foi possível salvar a live.',
      });
    }
  };

  const requestDeleteLive = (id) => {
    const live = lives.find((item) => item.id === id);
    setDeleteConfirmation({
      type: 'live',
      id,
      name: live?.title || 'esta live',
    });
  };

  const deleteLive = async (id) => {
    try {
      const { error } = await supabase
        .from('live_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLives((current) => current.filter((live) => live.id !== id));
    } catch (error) {
      console.error('Erro ao excluir live:', error);
      setPlatformNotice({
        type: 'error',
        message: 'Não foi possível excluir a live.',
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    const confirmation = deleteConfirmation;
    setDeleteConfirmation(null);

    if (confirmation.type === 'post') {
      await deletePost(confirmation.id);
    } else if (confirmation.type === 'live') {
      await deleteLive(confirmation.id);
    }
  };

  // =====================================================
  // VICO AI
  // =====================================================

  const sendAiMessage = () => {
    if (!aiInput.trim()) return;

    const question = aiInput.trim();

    setAiMessages((current) => [
      ...current,
      { role: 'user', text: question },
      {
        role: 'assistant',
        text: 'Ainda estou sendo preparada! Nesta versão, a conversa é apenas demonstrativa. A integração com a inteligência artificial será adicionada em uma próxima etapa.',
      },
    ]);

    setAiInput('');
  };

  // =====================================================
  // LOGOS DAS PLATAFORMAS
  // =====================================================

  const renderPlatformLogo = (platform, suffix = '') => {
    if (platform.name === 'Instagram') {
      return (
        <svg
          viewBox="0 0 24 24"
          className="platform-logo"
          role="img"
          aria-label="Logo Instagram"
        >
          <defs>
            <linearGradient
              id={`instagram-gradient${suffix}`}
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#FEDA75" />
              <stop offset="30%" stopColor="#FA7E1E" />
              <stop offset="60%" stopColor="#D62976" />
              <stop offset="100%" stopColor="#962FBF" />
            </linearGradient>
          </defs>

          <path
            d={platform.icon.path}
            fill={`url(#instagram-gradient${suffix})`}
          />
        </svg>
      );
    }

    return (
      <svg
        viewBox="0 0 24 24"
        className="platform-logo"
        role="img"
        aria-label={`Logo ${platform.name}`}
      >
        <path d={platform.icon.path} fill={platform.color} />
      </svg>
    );
  };

  // =====================================================
  // CARTÕES DAS PLATAFORMAS
  // =====================================================

  const renderPlatformCards = (suffix = '') => (
    <div className="platform-grid">
      {platforms.map((platform) => {
        const connected = connectedPlatforms.includes(platform.name);

        const loading = connectingPlatform === platform.name;

        const integration = platformIntegrations[platform.name];

        const accountName = connectedAccounts[platform.name];

        return (
          <div className="platform-card" key={platform.name}>
            <div
              className="platform-icon"
              style={{
                background: platform.color + '20',
              }}
            >
              {renderPlatformLogo(platform, `${suffix}-${platform.name}`)}
            </div>

            <strong>{platform.name}</strong>

            <span className={connected ? 'connected' : 'disconnected'}>
              {connected ? 'Conectada ao Vico Hub' : 'Não conectada'}
            </span>

            {connected && accountName && (
              <small className="helper-text">{accountName}</small>
            )}

            {!integration.enabled && (
              <small className="helper-text">Integração em preparação</small>
            )}

            <button
              className="connect-button"
              onClick={() => requestPlatformAction(platform.name, connected)}
              disabled={loading || !integration.enabled}
              title={
                !integration.enabled
                  ? 'Integração ainda em preparação'
                  : undefined
              }
            >
              {loading ? (
                <>Processando...</>
              ) : connected ? (
                <>
                  <X size={15} />
                  Desconectar
                </>
              ) : (
                <>
                  <Plus size={15} />
                  Conectar
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );

  // =====================================================
  // FORMULÁRIO DE PUBLICAÇÃO
  // =====================================================

  const renderPostForm = () => {
    const availableFormats = postFormats[postPlatform] || [];

    return (
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>{editingPostId ? 'Editar publicação' : 'Nova publicação'}</h2>

            <p>Organize o conteúdo que você pretende publicar.</p>
          </div>

          <button className="text-button" onClick={resetPostForm}>
            <X size={16} /> Fechar
          </button>
        </div>

        <div className="stat-card" style={{ display: 'grid', gap: 14 }}>
          <label className="form-label">Título</label>

          <input
            className="hub-input"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Ex.: Construí uma base secreta no Minecraft..."
          />

          <label className="form-label">Descrição</label>

          <textarea
            className="hub-textarea"
            value={postDescription}
            onChange={(e) => setPostDescription(e.target.value)}
            placeholder="Escreva a descrição, legenda ou observações..."
            rows={4}
          />

          <div className="form-grid">
            <div>
              <label className="form-label">Plataforma</label>

              <select
                className="hub-input"
                value={postPlatform}
                onChange={(e) => handlePostPlatformChange(e.target.value)}
              >
                <option value="">Escolha uma plataforma</option>

                {platforms.map((platform) => (
                  <option key={platform.name} value={platform.name}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            {postPlatform && (
              <div>
                <label className="form-label">Formato</label>

                <select
                  className="hub-input"
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                >
                  <option value="">Escolha um formato</option>

                  {availableFormats.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="form-label">Data</label>

              <input
                className="hub-input"
                type="date"
                min={dateInput(new Date())}
                value={postDate}
                onChange={(e) => setPostDate(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Horário</label>

              <input
                className="hub-input"
                type="time"
                value={postTime}
                onChange={(e) => setPostTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              className="connect-button"
              onClick={() => savePost('Rascunho')}
            >
              <Save size={16} /> Salvar rascunho
            </button>

            <button
              className="primary-button"
              onClick={() => savePost('Agendada')}
            >
              <CalendarPlus size={16} />
              Salvar agendamento
            </button>
          </div>

          <small className="helper-text">
            A publicação será salva dentro do Vico Hub. O envio automático para
            as redes ainda depende das integrações oficiais.
          </small>
        </div>
      </section>
    );
  };

  // =====================================================
  // LISTA DE PUBLICAÇÕES
  // =====================================================

  const renderPostList = (items) => (
    <div className="post-list">
      {items.length === 0 ? (
        <div className="empty-state">
          <FileText size={30} />

          <strong>Nenhuma publicação por aqui</strong>

          <span>Crie uma publicação para ela aparecer nesta lista.</span>
        </div>
      ) : (
        items.map((post) => (
          <article className="post-row" key={post.id}>
            <div className="post-row-main">
              <strong>{post.title}</strong>

              <span>
                {post.platform} · {post.type} · {post.date} às {post.time}
              </span>

              {post.description && <small>{post.description}</small>}
            </div>

            <span className={`status-pill ${post.status.toLowerCase()}`}>
              {post.status}
            </span>

            <div className="post-actions">
              <button
                className="icon-button"
                title="Editar"
                onClick={() => editPost(post)}
              >
                <Settings size={16} />
              </button>

              <button
                className="icon-button"
                title="Excluir"
                onClick={() => requestDeletePost(post.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );

  // =====================================================
  // VISÃO GERAL
  // =====================================================

  const renderOverview = () => (
    <div className="dashboard">
      <section className="welcome-card">
        <div className="welcome-content">
          <span className="welcome-tag">SEU CENTRO DE CRIAÇÃO</span>

          <h1>Bem-vindo ao Vico Hub! 💜</h1>

          <p>
            Todas as suas plataformas, conteúdos e estatísticas em um só lugar.
          </p>
        </div>

        <div className="welcome-decoration">
          <Sparkles size={54} />
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Visão geral</h2>
            <p>Acompanhe o desempenho da sua criação.</p>
          </div>

          <span className="period-label">Seu espaço</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span>Visualizações</span>

              <span className="stat-icon purple">
                <Eye size={19} />
              </span>
            </div>

            <strong>--</strong>

            <small>Conecte uma plataforma para consultar</small>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Inscritos e seguidores</span>

              <span className="stat-icon pink">
                <Users size={19} />
              </span>
            </div>

            <strong>--</strong>

            <small>Conecte uma plataforma para consultar</small>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Publicações</span>

              <span className="stat-icon blue">
                <FileText size={19} />
              </span>
            </div>

            <strong>{posts.length}</strong>

            <small>
              {drafts.length} rascunhos · {scheduledPosts.length} agendadas
            </small>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Plataformas</span>

              <span className="stat-icon yellow">
                <Radio size={19} />
              </span>
            </div>

            <strong>{connectedCount}/6</strong>

            <small>Plataformas conectadas oficialmente</small>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Minhas plataformas</h2>
            <p>Conecte suas redes sociais ao Vico Hub.</p>
          </div>

          <button
            className="text-button"
            onClick={() => changePage('Minhas plataformas')}
          >
            Ver todas →
          </button>
        </div>

        {renderPlatformCards('-dashboard')}
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Acesso rápido</h2>
            <p>Ferramentas para facilitar sua rotina.</p>
          </div>
        </div>

        <div className="quick-grid">
          <button
            className="quick-card"
            onClick={() => {
              changePage('Publicações');
              openNewPost();
            }}
          >
            <span className="quick-icon">
              <FileText size={22} />
            </span>

            <strong>Nova publicação</strong>

            <small>Organize seu próximo conteúdo.</small>
          </button>

          <button
            className="quick-card"
            onClick={() => changePage('Calendário')}
          >
            <span className="quick-icon">
              <CalendarDays size={22} />
            </span>

            <strong>Calendário</strong>

            <small>Visualize seus conteúdos.</small>
          </button>

          <button
            className="quick-card"
            onClick={() => changePage('Analytics')}
          >
            <span className="quick-icon">
              <BarChart3 size={22} />
            </span>

            <strong>Analytics</strong>

            <small>Acompanhe seus resultados.</small>
          </button>

          <button className="quick-card" onClick={() => changePage('Vico AI')}>
            <span className="quick-icon">
              <Sparkles size={22} />
            </span>

            <strong>Vico AI</strong>

            <small>Seu assistente de criação.</small>
          </button>
        </div>
      </section>

      <footer className="footer">
        <span>VICO HUB © 2026</span>
        <span>Feito para criadores 💜</span>
      </footer>
    </div>
  );

  // =====================================================
  // MINHAS PLATAFORMAS
  // =====================================================

  const renderPlatformsPage = () => (
    <div className="dashboard">
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Minhas plataformas</h2>

            <p>Gerencie suas redes sociais em um só lugar.</p>
          </div>

          <button className="text-button" onClick={loadConnectedPlatforms}>
            Atualizar conexões
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span>Plataformas disponíveis</span>

              <span className="stat-icon purple">
                <Users size={19} />
              </span>
            </div>

            <strong>6</strong>

            <small>Redes sociais compatíveis</small>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Contas conectadas</span>

              <span className="stat-icon pink">
                <Radio size={19} />
              </span>
            </div>

            <strong>{connectedCount}</strong>

            <small>Conexões oficiais ativas</small>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Suas redes sociais</h2>

            <p>Escolha uma plataforma para começar.</p>
          </div>
        </div>

        {renderPlatformCards('-platforms')}
      </section>

      <section className="section">
        <div className="stat-card">
          <div className="stat-top">
            <span>Central de integrações</span>

            <span className="stat-icon purple">
              <Sparkles size={19} />
            </span>
          </div>

          <strong>TikTok em integração</strong>

          <small>
          A integração com o TikTok está nos nossos planos! Em breve, você poderá conectar sua conta e gerenciar seus conteúdos diretamente pelo Vico Hub. 💜
          </small>
        </div>
      </section>

      <footer className="footer">
        <span>VICO HUB © 2026</span>
        <span>Feito para criadores 💜</span>
      </footer>
    </div>
  );

  // =====================================================
  // PUBLICAÇÕES
  // =====================================================

  const renderPostFormIfOpen = () => (showPostForm ? renderPostForm() : null);

  const renderPublicationsPage = () => (
    <div className="dashboard">
      {renderPostFormIfOpen()}

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Publicações</h2>

            <p>Crie, organize e acompanhe seus conteúdos.</p>
          </div>

          <button className="primary-button" onClick={openNewPost}>
            <Plus size={17} /> Nova publicação
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Todos os conteúdos</span>
            <strong>{posts.length}</strong>
            <small>Publicações cadastradas</small>
          </div>

          <div className="stat-card">
            <span>Rascunhos</span>
            <strong>{drafts.length}</strong>
            <small>Conteúdos ainda não agendados</small>
          </div>

          <div className="stat-card">
            <span>Agendadas</span>
            <strong>{scheduledPosts.length}</strong>
            <small>Planejadas para uma data</small>
          </div>

          <div className="stat-card">
            <span>Publicadas</span>
            <strong>{publishedPosts.length}</strong>
            <small>Marcadas como publicadas</small>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Seus conteúdos</h2>

            <p>Pesquise e edite suas publicações.</p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            width: '100%',
            maxWidth: 560,
            padding: '0 14px',
            borderRadius: 16,
            border: '1px solid rgba(168, 85, 247, 0.28)',
            background: theme === 'Claro' ? '#f5effb' : '#1b1029',
            color: theme === 'Claro' ? '#6941a5' : '#c084fc',
            boxSizing: 'border-box',
          }}
        >
          <Search size={17} />
          <input
            aria-label="Buscar publicações"
            value={postSearch}
            onChange={(e) => setPostSearch(e.target.value)}
            placeholder="Buscar por título, plataforma ou status..."
            style={{
              flex: 1,
              minWidth: 0,
              height: 48,
              border: 0,
              outline: 0,
              background: 'transparent',
              color: 'inherit',
              fontSize: 14,
            }}
          />
          {postSearch && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => setPostSearch('')}
              style={{
                border: 0,
                background: 'transparent',
                color: 'inherit',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {renderPostList(filteredPosts)}
      </section>

      <footer className="footer">
        <span>VICO HUB © 2026</span>
        <span>Feito para criadores 💜</span>
      </footer>
    </div>
  );

  // =====================================================
  // CALENDÁRIO
  // =====================================================

  const renderCalendarPage = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const rawCells = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    const cells = [
      ...rawCells,
      ...Array(Math.max(0, 42 - rawCells.length)).fill(null),
    ];

    const monthName = calendarMonth.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className="dashboard">
        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Calendário de conteúdo</h2>

              <p>Veja quando seus conteúdos estão planejados.</p>
            </div>

            <button
              className="primary-button"
              onClick={() => {
                changePage('Publicações');
                openNewPost();
              }}
            >
              <Plus size={16} /> Nova publicação
            </button>
          </div>

          <div className="calendar-toolbar">
            <button
              type="button"
              className="connect-button"
              onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
            >
              ← Anterior
            </button>

            <strong>{monthName}</strong>

            <div className="calendar-toolbar-actions">
              <button
                type="button"
                className="connect-button calendar-today-button"
                onClick={() =>
                  setCalendarMonth(
                    new Date(today.getFullYear(), today.getMonth(), 1)
                  )
                }
              >
                Hoje
              </button>
              <button
                type="button"
                className="connect-button"
                onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
              >
                Próximo →
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div className="calendar-weekday" key={day}>
                {day}
              </div>
            ))}

            {cells.map((day, index) => {
              const dayPosts = day
                ? posts.filter(
                    (post) =>
                      post.status !== 'Rascunho' &&
                      post.date === dateInput(new Date(year, month, day))
                  )
                : [];

              return (
                <div
                  className={`calendar-day ${day ? '' : 'muted-day'}`}
                  key={`${day}-${index}`}
                >
                  {day && (
                    <>
                      <span className="calendar-day-number">{day}</span>

                      {dayPosts.map((post) => (
                        <button
                          className="calendar-event"
                          key={post.id}
                          title={post.title}
                          onClick={() => {
                            changePage('Publicações');
                            editPost(post);
                          }}
                        >
                          {post.time} · {post.title}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <small className="helper-text">
            Clique em um conteúdo no calendário para editar.
          </small>
        </section>

        <footer className="footer">
          <span>VICO HUB © 2026</span>
          <span>Feito para criadores 💜</span>
        </footer>
      </div>
    );
  };

  // =====================================================
  // AGENDAMENTOS
  // =====================================================

  const renderSchedulePage = () => (
    <div className="dashboard">
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Agendamentos</h2>

            <p>Gerencie os conteúdos que você planejou para o futuro.</p>
          </div>

          <button
            className="primary-button"
            onClick={() => {
              changePage('Publicações');
              openNewPost();
            }}
          >
            <Plus size={16} /> Agendar conteúdo
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Agendamentos</span>
            <strong>{scheduledPosts.length}</strong>
            <small>Conteúdos na fila</small>
          </div>

          <div className="stat-card">
            <span>Próxima data</span>

            <strong>
              {scheduledPosts.length ? scheduledPosts[0].date : '--'}
            </strong>

            <small>Data do primeiro item da lista</small>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Fila de agendamentos</h2>

            <p>Edite ou remova seus planejamentos.</p>
          </div>
        </div>

        {renderPostList(scheduledPosts)}
      </section>

      <footer className="footer">
        <span>VICO HUB © 2026</span>
        <span>Feito para criadores 💜</span>
      </footer>
    </div>
  );

  // =====================================================
  // CARREGAMENTO DOS ANALYTICS DO YOUTUBE
  // =====================================================
  const getAnalyticsDates = (period) => {
    const end = new Date();
    end.setDate(end.getDate() - 1);
  
    const start = new Date(end);
  
    if (String(period) === 'all') {
      start.setFullYear(2005, 0, 1);
    } else {
      const days = Math.max(1, Number(period) || 28);
      start.setDate(start.getDate() - (days - 1));
    }
  
    const format = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
  
    return { startDate: format(start), endDate: format(end) };
  };
  
  const loadYoutubeAnalytics = async (period = analyticsPeriod) => {
    if (!connectedPlatforms.includes('YouTube')) {
      setAnalyticsError(
        'Conecte seu canal do YouTube para carregar os Analytics.'
      );
      setAnalyticsData(null);
      return;
    }
  
    try {
      setAnalyticsLoading(true);
      setAnalyticsError('');
  
      const dates = getAnalyticsDates(period);
  
      const { data, error } = await supabase.functions.invoke(
        'youtube-analytics',
        { body: dates }
      );
  
      if (error) throw error;
  
      if (!data?.success) {
        throw new Error(
          data?.error || 'Não foi possível carregar os Analytics.'
        );
      }
  
      setAnalyticsData(data);
  
      setSelectedAnalyticsVideo((current) => {
        if (!current) return null;
  
        const updatedVideo = data.videos?.find(
          (video) => video.videoId === current.videoId
        );
  
        return updatedVideo
          ? {
              ...updatedVideo,
              retention: current.retention,
              retentionLoading: current.retentionLoading,
              retentionError: current.retentionError,
            }
          : null;
      });
    } catch (error) {
      console.error('Erro ao carregar Analytics do YouTube:', error);
  
      setAnalyticsError(
        error?.message ||
          'Ocorreu um erro ao consultar os Analytics do YouTube.'
      );
    } finally {
      setAnalyticsLoading(false);
    }
  };
  
  // Busca a retenção individual de um vídeo.
  const loadVideoRetention = async (video) => {
    if (!video?.videoId) return;
  
    const videoId = video.videoId;
  
    setSelectedAnalyticsVideo({
      ...video,
      retention: null,
      retentionLoading: true,
      retentionError: '',
    });
  
    try {
      const dates = getAnalyticsDates(analyticsPeriod);
  
      const { data, error } = await supabase.functions.invoke(
        'youtube-analytics',
        {
          body: {
            ...dates,
            videoId,
          },
        }
      );
  
      if (error) throw error;
  
      if (!data?.success) {
        throw new Error(
          data?.error || 'Não foi possível carregar a retenção deste vídeo.'
        );
      }
  
      setSelectedAnalyticsVideo((current) => {
        if (current?.videoId !== videoId) return current;
  
        return {
          ...current,
          retention: data.retention || null,
          retentionLoading: false,
          retentionError: '',
        };
      });
    } catch (error) {
      console.error('Erro ao carregar retenção do vídeo:', error);
  
      setSelectedAnalyticsVideo((current) => {
        if (current?.videoId !== videoId) return current;
  
        return {
          ...current,
          retentionLoading: false,
          retentionError:
            error?.message || 'Não foi possível consultar a retenção.',
        };
      });
    }
  };
  
  useEffect(() => {
    if (activePage !== 'Analytics') return;
  
    if (connectedPlatforms.includes('YouTube')) {
      loadYoutubeAnalytics(analyticsPeriod);
    } else {
      setAnalyticsData(null);
      setSelectedAnalyticsVideo(null);
    }
  }, [activePage, connectedPlatforms]);
  
  const formatAnalyticsNumber = (value) =>
    new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  
  const formatAnalyticsDuration = (seconds) => {
    const total = Math.max(0, Math.floor(Number(seconds || 0)));
    const minutes = Math.floor(total / 60);
    const remainingSeconds = total % 60;
  
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  
  const formatAnalyticsWatchTime = (minutes) => {
    const totalHours = Number(minutes || 0) / 60;
  
    return `${new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 1,
    }).format(totalHours)} h`;
  };
  
  const formatAnalyticsMoney = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(value || 0));
  
  const trafficSourceLabel = (source) => {
    const labels = {
      YT_SEARCH: 'Pesquisa do YouTube',
      RELATED_VIDEO: 'Vídeos sugeridos',
      SUBSCRIBER: 'Feed de inscrições',
      YT_CHANNEL: 'Página do canal',
      NO_LINK_OTHER: 'Direto ou desconhecido',
      EXT_URL: 'Sites e aplicativos externos',
      PLAYLIST: 'Playlists',
      SHORTS: 'Feed dos Shorts',
      NOTIFICATION: 'Notificações',
      ADVERTISING: 'Publicidade',
    };
  
    return labels[source] || String(source || 'Outros').replaceAll('_', ' ');
  };
  
  const deviceLabel = (device) => {
    const labels = {
      MOBILE: 'Celular',
      DESKTOP: 'Computador',
      TABLET: 'Tablet',
      TV: 'TV',
      GAME_CONSOLE: 'Console',
      UNKNOWN: 'Não identificado',
    };
  
    return labels[device] || String(device || 'Outro');
  };
  
  // =====================================================
  // ANALYTICS
  // =====================================================
  
  const renderAnalyticsPage = () => {
    const overview = analyticsData?.overview || {};
    const videos = analyticsData?.videos || [];
    const trafficSources = analyticsData?.trafficSources || [];
    const devices = analyticsData?.devices || [];
    const dailyStats = analyticsData?.dailyStats || [];
    const monetization = analyticsData?.monetization;
  
    const maxTraffic = Math.max(
      1,
      ...trafficSources.map((item) => Number(item.views || 0))
    );
  
    const maxDevice = Math.max(
      1,
      ...devices.map((item) => Number(item.views || 0))
    );
  
    const formatDate = (date) => {
      const parts = String(date || '').split('-');
      if (parts.length !== 3) return date;
      return `${parts[2]}/${parts[1]}`;
    };
  
    // Gráficos de evolução do canal.
    const renderAnalyticsChart = ({
      title,
      description,
      dataKey,
      color,
      formatter,
    }) => {
      const chartData = dailyStats
        .filter(
          (item) =>
            item &&
            item.date &&
            Number.isFinite(Number(item[dataKey]))
        )
        .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  
      if (!chartData.length) {
        return (
          <div className="stat-card" style={{ display: 'grid', gap: 8 }}>
            <strong>{title}</strong>
            <small>{description}</small>
            <div className="empty-state">
              <BarChart3 size={25} />
              <span>
                Ainda não há dados diários disponíveis para este gráfico.
              </span>
            </div>
          </div>
        );
      }
  
      const values = chartData.map((item) => Number(item[dataKey] || 0));
      const maxValue = Math.max(1, ...values);
      const range = Math.max(1, maxValue);
  
      const chartWidth = 720;
      const chartHeight = 230;
      const paddingLeft = 55;
      const paddingRight = 20;
      const paddingTop = 20;
      const paddingBottom = 35;
  
      const plotWidth = chartWidth - paddingLeft - paddingRight;
      const plotHeight = chartHeight - paddingTop - paddingBottom;
  
      const points = chartData.map((item, index) => {
        const x =
          paddingLeft +
          (index / Math.max(1, chartData.length - 1)) * plotWidth;
  
        const y =
          paddingTop +
          ((maxValue - Number(item[dataKey] || 0)) / range) * plotHeight;
  
        return {
          x,
          y,
          value: Number(item[dataKey] || 0),
          date: item.date,
        };
      });
  
      const linePoints = points
        .map((point) => `${point.x},${point.y}`)
        .join(' ');
  
      const areaPoints = [
        `${points[0].x},${chartHeight - paddingBottom}`,
        ...points.map((point) => `${point.x},${point.y}`),
        `${points[points.length - 1].x},${chartHeight - paddingBottom}`,
      ].join(' ');
  
      return (
        <div className="stat-card" style={{ display: 'grid', gap: 12 }}>
          <div>
            <strong>{title}</strong>
            <small style={{ display: 'block', marginTop: 5 }}>
              {description}
            </small>
          </div>
  
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              width="100%"
              role="img"
              aria-label={title}
              style={{ display: 'block', overflow: 'visible' }}
            >
              {[0, 1, 2, 3, 4].map((step) => {
                const y = paddingTop + (step / 4) * plotHeight;
                const value = maxValue - (step / 4) * range;
  
                return (
                  <g key={step}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="currentColor"
                      opacity="0.12"
                      strokeDasharray="4 5"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="currentColor"
                      opacity="0.6"
                      fontSize="11"
                    >
                      {formatAnalyticsNumber(value)}
                    </text>
                  </g>
                );
              })}
  
              <polygon
                points={areaPoints}
                fill={color}
                opacity="0.12"
              />
  
              <polyline
                points={linePoints}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
  
              {points.map((point, index) => (
                <circle
                  key={`${point.date}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={chartData.length > 45 ? 3 : 4}
                  fill={color}
                  stroke="var(--card-bg, #171321)"
                  strokeWidth="2"
                >
                  <title>
                    {formatDate(point.date)}: {formatter(point.value)}
                  </title>
                </circle>
              ))}
  
              <text
                x={paddingLeft}
                y={chartHeight - 8}
                fill="currentColor"
                opacity="0.65"
                fontSize="11"
              >
                {formatDate(chartData[0].date)}
              </text>
  
              <text
                x={chartWidth - paddingRight}
                y={chartHeight - 8}
                textAnchor="end"
                fill="currentColor"
                opacity="0.65"
                fontSize="11"
              >
                {formatDate(chartData[chartData.length - 1].date)}
              </text>
            </svg>
          </div>
  
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: color,
              }}
            />
            <span style={{ opacity: 0.75 }}>{title}</span>
          </div>
        </div>
      );
    };
  
    // Gráfico de retenção de um vídeo.
    const renderRetentionChart = (retention) => {
      const points = (retention?.points || [])
        .filter(
          (point) =>
            Number.isFinite(Number(point.elapsedVideoTimeRatio)) &&
            Number.isFinite(Number(point.audienceWatchRatio))
        )
        .sort(
          (a, b) =>
            Number(a.elapsedVideoTimeRatio) -
            Number(b.elapsedVideoTimeRatio)
        );
  
      if (!points.length) {
        return (
          <div className="empty-state">
            <BarChart3 size={26} />
            <span>
              O YouTube ainda não disponibilizou dados de retenção para este vídeo.
            </span>
          </div>
        );
      }
  
      const width = 720;
      const height = 260;
      const left = 55;
      const right = 20;
      const top = 20;
      const bottom = 40;
  
      const plotWidth = width - left - right;
      const plotHeight = height - top - bottom;
  
      const maxRatio = Math.max(
        1,
        ...points.map((point) => Number(point.audienceWatchRatio || 0))
      );
  
      const chartPoints = points.map((point) => {
        const ratio = Number(point.elapsedVideoTimeRatio || 0);
        const value = Number(point.audienceWatchRatio || 0);
  
        return {
          x: left + ratio * plotWidth,
          y: top + (1 - value / maxRatio) * plotHeight,
          ratio,
          value,
          relative: Number(point.relativeRetentionPerformance || 0),
        };
      });
  
      const line = chartPoints
        .map((point) => `${point.x},${point.y}`)
        .join(' ');
  
      return (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              width="100%"
              role="img"
              aria-label="Gráfico de retenção do vídeo"
              style={{ display: 'block' }}
            >
              {[0, 1, 2, 3, 4].map((step) => {
                const value = maxRatio * (1 - step / 4);
                const y = top + (step / 4) * plotHeight;
  
                return (
                  <g key={step}>
                    <line
                      x1={left}
                      y1={y}
                      x2={width - right}
                      y2={y}
                      stroke="currentColor"
                      opacity="0.13"
                      strokeDasharray="4 5"
                    />
                    <text
                      x={left - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="currentColor"
                      opacity="0.65"
                    >
                      {(value * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}
  
              <line
                x1={left}
                y1={height - bottom}
                x2={width - right}
                y2={height - bottom}
                stroke="currentColor"
                opacity="0.35"
              />
  
              <polyline
                points={line}
                fill="none"
                stroke="#a855f7"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
  
              {chartPoints.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={points.length > 50 ? 2.5 : 4}
                  fill="#a855f7"
                  stroke="var(--card-bg, #171321)"
                  strokeWidth="1.5"
                >
                  <title>
                    Trecho: {(point.ratio * 100).toFixed(0)}% do vídeo
                    {' · '}
                    Índice: {(point.value * 100).toFixed(1)}%
                    {' · '}
                    Retenção relativa: {(point.relative * 100).toFixed(1)}%
                  </title>
                </circle>
              ))}
  
              <text
                x={left}
                y={height - 12}
                fontSize="11"
                fill="currentColor"
                opacity="0.65"
              >
                Início
              </text>
  
              <text
                x={width - right}
                y={height - 12}
                textAnchor="end"
                fontSize="11"
                fill="currentColor"
                opacity="0.65"
              >
                Final do vídeo
              </text>
            </svg>
          </div>
  
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#a855f7',
              }}
            />
            <span style={{ opacity: 0.75 }}>
              Índice de visualizações por trecho
            </span>
          </div>
  
          <small className="helper-text">
            O índice pode ultrapassar 100% quando partes do vídeo são assistidas
            novamente. Passe o mouse sobre os pontos para consultar os valores.
          </small>
  
          <div className="stats-grid">
            <div className="stat-card">
              <span>Pontos de retenção</span>
              <strong>{formatAnalyticsNumber(points.length)}</strong>
              <small>Trechos analisados</small>
            </div>
  
            <div className="stat-card">
              <span>Retenção relativa média</span>
              <strong>
                {(
                  (chartPoints.reduce(
                    (total, point) => total + point.relative,
                    0
                  ) /
                    chartPoints.length) *
                  100
                )
                  .toFixed(1)
                  .replace('.', ',')}
                %
              </strong>
              <small>Comparação com vídeos semelhantes</small>
            </div>
          </div>
        </div>
      );
    };
  
    return (
      <div className="dashboard">
        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Analytics do YouTube</h2>
              <p>
                Desempenho do canal e dos vídeos conectados ao Vico Hub.
                {analyticsData?.channel?.title
                  ? ` · ${analyticsData.channel.title}`
                  : ''}
              </p>
            </div>
  
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <select
                className="hub-input"
                value={analyticsPeriod}
                onChange={(event) => {
                  const period = event.target.value;
                  setAnalyticsPeriod(period);
                  loadYoutubeAnalytics(period);
  
                  if (selectedAnalyticsVideo) {
                    loadVideoRetention(selectedAnalyticsVideo);
                  }
                }}
                style={{ width: 'auto', minWidth: 145 }}
                disabled={analyticsLoading}
              >
                <option value="7">Últimos 7 dias</option>
                <option value="28">Últimos 28 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="365">Últimos 365 dias</option>
                <option value="all">Sempre (todo o período)</option>
              </select>
  
              <button
                className="connect-button"
                onClick={() => {
                  loadYoutubeAnalytics();
                  if (selectedAnalyticsVideo) {
                    loadVideoRetention(selectedAnalyticsVideo);
                  }
                }}
                disabled={
                  analyticsLoading || !connectedPlatforms.includes('YouTube')
                }
              >
                <RefreshCw size={15} />
                {analyticsLoading ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          </div>
  
          {!connectedPlatforms.includes('YouTube') && (
            <div className="stat-card" style={{ display: 'grid', gap: 12 }}>
              <strong>Seu YouTube ainda não está conectado</strong>
              <small>
                Conecte seu canal para consultar visualizações, desempenho dos
                vídeos e os demais indicadores disponíveis.
              </small>
              <button
                className="primary-button"
                onClick={() => changePage('Minhas plataformas')}
              >
                Conectar YouTube <ChevronRight size={15} />
              </button>
            </div>
          )}
  
          {analyticsLoading && !analyticsData && (
            <div className="empty-state">
              <BarChart3 size={30} />
              <strong>Buscando os dados do seu canal...</strong>
              <span>Isso pode levar alguns segundos.</span>
            </div>
          )}
  
          {analyticsError && (
            <div
              className="stat-card"
              style={{
                border: '1px solid rgba(248, 113, 113, 0.35)',
                display: 'grid',
                gap: 10,
              }}
            >
              <strong>Não foi possível carregar os Analytics</strong>
              <small>{analyticsError}</small>
              <button
                className="connect-button"
                onClick={() => loadYoutubeAnalytics()}
                disabled={analyticsLoading}
              >
                <RefreshCw size={15} /> Tentar novamente
              </button>
            </div>
          )}
  
          {analyticsData && (
            <>
              <div className="stats-grid" style={{ marginTop: 18 }}>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Visualizações</span>
                    <span className="stat-icon purple">
                      <Eye size={19} />
                    </span>
                  </div>
                  <strong>{formatAnalyticsNumber(overview.views)}</strong>
                  <small>No período selecionado</small>
                </div>
  
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Tempo de exibição</span>
                    <span className="stat-icon blue">
                      <Clock size={19} />
                    </span>
                  </div>
                  <strong>
                    {formatAnalyticsWatchTime(overview.watchTimeMinutes)}
                  </strong>
                  <small>Horas assistidas</small>
                </div>
  
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Inscritos líquidos</span>
                    <span className="stat-icon pink">
                      <Users size={19} />
                    </span>
                  </div>
                  <strong>
                    {formatAnalyticsNumber(overview.subscribersNet)}
                  </strong>
                  <small>Ganhos menos perdidos no período</small>
                </div>
  
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Duração média</span>
                    <span className="stat-icon yellow">
                      <Play size={19} />
                    </span>
                  </div>
                  <strong>
                    {formatAnalyticsDuration(overview.averageViewDuration)}
                  </strong>
                  <small>Tempo médio por visualização</small>
                </div>
              </div>
  
              <div className="stats-grid" style={{ marginTop: 14 }}>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Taxa média assistida</span>
                    <span className="stat-icon purple">
                      <BarChart3 size={19} />
                    </span>
                  </div>
                  <strong>
                    {Number(overview.averageViewPercentage || 0)
                      .toFixed(1)
                      .replace('.', ',')}
                    %
                  </strong>
                  <small>Percentual médio dos vídeos assistido</small>
                </div>
  
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Curtidas</span>
                    <span className="stat-icon pink">
                      <ThumbsUp size={19} />
                    </span>
                  </div>
                  <strong>{formatAnalyticsNumber(overview.likes)}</strong>
                  <small>No período selecionado</small>
                </div>
  
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Comentários</span>
                    <span className="stat-icon blue">
                      <MessageCircle size={19} />
                    </span>
                  </div>
                  <strong>{formatAnalyticsNumber(overview.comments)}</strong>
                  <small>No período selecionado</small>
                </div>
  
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Compartilhamentos</span>
                    <span className="stat-icon yellow">
                      <Share2 size={19} />
                    </span>
                  </div>
                  <strong>{formatAnalyticsNumber(overview.shares)}</strong>
                  <small>No período selecionado</small>
                </div>
              </div>
  
              <section className="section" style={{ marginTop: 24 }}>
                <div className="section-heading">
                  <div>
                    <h2>Evolução do canal</h2>
                    <p>
                      Acompanhe como os resultados do seu canal mudaram ao longo
                      do período selecionado.
                    </p>
                  </div>
                </div>
  
                <div className="stats-grid">
                  {renderAnalyticsChart({
                    title: 'Visualizações por dia',
                    description:
                      'Quantidade de visualizações recebidas diariamente.',
                    dataKey: 'views',
                    color: '#a855f7',
                    formatter: formatAnalyticsNumber,
                  })}
  
                  {renderAnalyticsChart({
                    title: 'Tempo de exibição por dia',
                    description: 'Horas assistidas diariamente.',
                    dataKey: 'watchTimeMinutes',
                    color: '#38bdf8',
                    formatter: formatAnalyticsWatchTime,
                  })}
                </div>
              </section>
  
              <small
                className="helper-text"
                style={{ display: 'block', marginTop: 12 }}
              >
                Período: {analyticsData.period?.startDate} até{' '}
                {analyticsData.period?.endDate}. Os relatórios do YouTube podem
                ter atraso na atualização.
              </small>
            </>
          )}
        </section>
  
        {analyticsData && (
          <>
            <section className="section">
              <div className="section-heading">
                <div>
                  <h2>Desempenho dos vídeos</h2>
                  <p>
                    Os vídeos com mais visualizações no período selecionado.
                    Clique em um vídeo para ver seus Analytics individuais e a
                    retenção de público.
                  </p>
                </div>
                <span className="period-label">{videos.length} vídeos</span>
              </div>
  
              {videos.length === 0 ? (
                <div className="empty-state">
                  <Video size={30} />
                  <strong>Nenhum vídeo encontrado nesse período</strong>
                  <span>Tente selecionar um intervalo maior.</span>
                </div>
              ) : (
                <div className="post-list">
                  {videos
                    .slice(0, analyticsVideosExpanded ? videos.length : 10)
                    .map((video) => (
                      <button
                        type="button"
                        key={video.videoId}
                        className="post-row"
                        onClick={() => loadVideoRetention(video)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          background:
                            selectedAnalyticsVideo?.videoId === video.videoId
                              ? 'rgba(168, 85, 247, 0.10)'
                              : undefined,
                          color: 'inherit',
                          border: 0,
                        }}
                      >
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt=""
                            style={{
                              width: 112,
                              aspectRatio: '16 / 9',
                              objectFit: 'cover',
                              borderRadius: 9,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 112,
                              aspectRatio: '16 / 9',
                              borderRadius: 9,
                              display: 'grid',
                              placeItems: 'center',
                              background: 'rgba(168, 85, 247, 0.13)',
                              flexShrink: 0,
                            }}
                          >
                            <Video size={23} />
                          </div>
                        )}
  
                        <div className="post-row-main" style={{ minWidth: 0 }}>
                          <strong>{video.title}</strong>
                          <span>
                            {formatAnalyticsNumber(video.views)} visualizações ·{' '}
                            {formatAnalyticsWatchTime(video.watchTimeMinutes)}{' '}
                            assistidas
                          </span>
                          <small>
                            {formatAnalyticsNumber(video.likes)} curtidas ·{' '}
                            {formatAnalyticsNumber(video.comments)} comentários
                            ·{' '}
                            {Number(video.averageViewPercentage || 0)
                              .toFixed(1)
                              .replace('.', ',')}
                            % assistido em média
                          </small>
                        </div>
  
                        <ChevronRight size={18} />
                      </button>
                    ))}
                </div>
              )}
  
              {videos.length > 10 && (
                <button
                  type="button"
                  className="text-button analytics-show-more"
                  onClick={() =>
                    setAnalyticsVideosExpanded((expanded) => !expanded)
                  }
                >
                  {analyticsVideosExpanded
                    ? 'Mostrar menos'
                    : `Mostrar mais ${videos.length - 10} vídeos`}
                </button>
              )}
            </section>
  
            {selectedAnalyticsVideo && (
              <div
                className="analytics-modal-backdrop"
                role="presentation"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setSelectedAnalyticsVideo(null);
                  }
                }}
              >
                <section
                  className="analytics-video-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Analytics do vídeo ${selectedAnalyticsVideo.title}`}
                >
                  <div className="section-heading">
                    <div style={{ minWidth: 0 }}>
                      <h2>Analytics do vídeo</h2>
                      <p>{selectedAnalyticsVideo.title}</p>
                    </div>
  
                    <button
                      className="text-button"
                      onClick={() => setSelectedAnalyticsVideo(null)}
                    >
                      <X size={16} /> Fechar
                    </button>
                  </div>
  
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span>Visualizações</span>
                      <strong>
                        {formatAnalyticsNumber(selectedAnalyticsVideo.views)}
                      </strong>
                      <small>No período</small>
                    </div>
  
                    <div className="stat-card">
                      <span>Tempo assistido</span>
                      <strong>
                        {formatAnalyticsWatchTime(
                          selectedAnalyticsVideo.watchTimeMinutes
                        )}
                      </strong>
                      <small>Horas</small>
                    </div>
  
                    <div className="stat-card">
                      <span>Duração média</span>
                      <strong>
                        {formatAnalyticsDuration(
                          selectedAnalyticsVideo.averageViewDuration
                        )}
                      </strong>
                      <small>Por visualização</small>
                    </div>
  
                    <div className="stat-card">
                      <span>Percentual médio</span>
                      <strong>
                        {Number(
                          selectedAnalyticsVideo.averageViewPercentage || 0
                        )
                          .toFixed(1)
                          .replace('.', ',')}
                        %
                      </strong>
                      <small>Do vídeo assistido</small>
                    </div>
  
                    <div className="stat-card">
                      <span>Curtidas</span>
                      <strong>
                        {formatAnalyticsNumber(selectedAnalyticsVideo.likes)}
                      </strong>
                      <small>No período</small>
                    </div>
  
                    <div className="stat-card">
                      <span>Comentários</span>
                      <strong>
                        {formatAnalyticsNumber(selectedAnalyticsVideo.comments)}
                      </strong>
                      <small>No período</small>
                    </div>
  
                    <div className="stat-card">
                      <span>Compartilhamentos</span>
                      <strong>
                        {formatAnalyticsNumber(selectedAnalyticsVideo.shares)}
                      </strong>
                      <small>No período</small>
                    </div>
  
                    <div className="stat-card">
                      <span>Inscritos gerados</span>
                      <strong>
                        {formatAnalyticsNumber(
                          selectedAnalyticsVideo.subscribersGained
                        )}
                      </strong>
                      <small>Inscrições atribuídas ao vídeo</small>
                    </div>
                  </div>
  
                  <section className="section" style={{ marginTop: 24 }}>
                    <div className="section-heading">
                      <div>
                        <h2>Retenção de público</h2>
                        <p>
                          Veja como o público assistiu aos diferentes trechos
                          deste vídeo.
                        </p>
                      </div>
  
                      <span className="stat-icon purple">
                        <BarChart3 size={19} />
                      </span>
                    </div>
  
                    {selectedAnalyticsVideo.retentionLoading ? (
                      <div className="empty-state">
                        <BarChart3 size={28} />
                        <strong>Carregando retenção do vídeo...</strong>
                        <span>
                          Consultando os dados disponibilizados pelo YouTube.
                        </span>
                      </div>
                    ) : selectedAnalyticsVideo.retentionError ? (
                      <div className="stat-card" style={{ display: 'grid', gap: 10 }}>
                        <strong>Não foi possível carregar a retenção</strong>
                        <small>
                          {selectedAnalyticsVideo.retentionError}
                        </small>
                        <button
                          className="connect-button"
                          onClick={() =>
                            loadVideoRetention(selectedAnalyticsVideo)
                          }
                        >
                          <RefreshCw size={15} /> Tentar novamente
                        </button>
                      </div>
                    ) : (
                      renderRetentionChart(selectedAnalyticsVideo.retention)
                    )}
                  </section>
                </section>
              </div>
            )}
  
            <section className="section">
              <div className="section-heading">
                <div>
                  <h2>Engajamento e crescimento</h2>
                  <p>Interações e inscrições atribuídas ao canal.</p>
                </div>
              </div>
  
              <div className="stats-grid">
                <div className="stat-card">
                  <span>Inscritos ganhos</span>
                  <strong>
                    {formatAnalyticsNumber(overview.subscribersGained)}
                  </strong>
                  <small>No período</small>
                </div>
  
                <div className="stat-card">
                  <span>Inscritos perdidos</span>
                  <strong>
                    {formatAnalyticsNumber(overview.subscribersLost)}
                  </strong>
                  <small>No período</small>
                </div>
  
                <div className="stat-card">
                  <span>Compartilhamentos</span>
                  <strong>{formatAnalyticsNumber(overview.shares)}</strong>
                  <small>Conteúdo compartilhado</small>
                </div>
  
                <div className="stat-card">
                  <span>Interações</span>
                  <strong>
                    {formatAnalyticsNumber(
                      Number(overview.likes || 0) +
                        Number(overview.comments || 0) +
                        Number(overview.shares || 0)
                    )}
                  </strong>
                  <small>Curtidas + comentários + compartilhamentos</small>
                </div>
              </div>
            </section>
  
            <section className="section">
              <div className="section-heading">
                <div>
                  <h2>Monetização</h2>
                  <p>Receita estimada informada pela API do YouTube.</p>
                </div>
                <span className="stat-icon yellow">
                  <DollarSign size={19} />
                </span>
              </div>
  
              {monetization ? (
                <div className="stats-grid">
                  <div className="stat-card">
                    <span>Receita estimada</span>
                    <strong>
                      {formatAnalyticsMoney(monetization.estimatedRevenue)}
                    </strong>
                    <small>Moeda retornada pela API: USD</small>
                  </div>
  
                  <div className="stat-card">
                    <span>Receita de anúncios</span>
                    <strong>
                      {formatAnalyticsMoney(monetization.estimatedAdRevenue)}
                    </strong>
                    <small>Receita estimada de anúncios</small>
                  </div>
                </div>
              ) : (
                <div className="stat-card">
                  <strong>Receita indisponível</strong>
                  <small>
                    O YouTube não retornou dados de monetização para esse
                    período. Isso pode acontecer quando o canal não está
                    qualificado ou quando os dados ainda não estão disponíveis.
                  </small>
                </div>
              )}
            </section>
  
            <section className="section">
              <div className="section-heading">
                <div>
                  <h2>Fontes de tráfego</h2>
                  <p>De onde vieram as visualizações do canal.</p>
                </div>
              </div>
  
              {trafficSources.length ? (
                <div style={{ display: 'grid', gap: 14 }}>
                  {trafficSources.map((item) => (
                    <div key={item.insightTrafficSourceType}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          marginBottom: 6,
                        }}
                      >
                        <strong style={{ fontSize: 13 }}>
                          {trafficSourceLabel(item.insightTrafficSourceType)}
                        </strong>
                        <span>{formatAnalyticsNumber(item.views)}</span>
                      </div>
  
                      <div
                        style={{
                          height: 8,
                          borderRadius: 99,
                          background: 'rgba(168, 85, 247, 0.13)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(
                              100,
                              (Number(item.views || 0) / maxTraffic) * 100
                            )}%`,
                            height: '100%',
                            borderRadius: 99,
                            background:
                              'linear-gradient(90deg, #7c3aed, #c084fc)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span>
                    Sem dados de fontes de tráfego para esse período.
                  </span>
                </div>
              )}
            </section>
  
            <section className="section">
              <div className="section-heading">
                <div>
                  <h2>Dispositivos</h2>
                  <p>Quais aparelhos foram usados para assistir ao canal.</p>
                </div>
              </div>
  
              {devices.length ? (
                <div className="stats-grid">
                  {devices.map((item) => {
                    const DeviceIcon =
                      item.deviceType === 'MOBILE'
                        ? Smartphone
                        : item.deviceType === 'TABLET'
                        ? Tablet
                        : Monitor;
  
                    return (
                      <div className="stat-card" key={item.deviceType}>
                        <div className="stat-top">
                          <span>{deviceLabel(item.deviceType)}</span>
                          <span className="stat-icon purple">
                            <DeviceIcon size={19} />
                          </span>
                        </div>
  
                        <strong>{formatAnalyticsNumber(item.views)}</strong>
  
                        <small>
                          {(
                            (Number(item.views || 0) / maxDevice) *
                            100
                          )
                            .toFixed(1)
                            .replace('.', ',')}
                          % das visualizações por dispositivo
                        </small>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <span>Sem dados de dispositivos para esse período.</span>
                </div>
              )}
            </section>
  
            <small
              className="helper-text"
              style={{ display: 'block', marginTop: 8 }}
            >
              Observação: estes são os indicadores disponibilizados pela API
              oficial. Alguns dados podem não aparecer para canais ou períodos
              sem volume suficiente. A receita é exibida em dólar porque a
              função ainda consulta o padrão USD da API.
            </small>
          </>
        )}
  
        <footer className="footer">
          <span>VICO HUB © 2026</span>
          <span>Feito para criadores 💜</span>
        </footer>
      </div>
    );
  };
  
  // =====================================================
  // CENTRAL DE LIVES
  // =====================================================

  const renderLivesPage = () => (
    <div className="dashboard">
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Central de lives</h2>

            <p>Planeje suas transmissões e organize suas próximas lives.</p>
          </div>
        </div>

        <div className="stat-card" style={{ display: 'grid', gap: 12 }}>
          <div className="stat-top">
            <strong>Planejar uma live</strong>

            <span className="stat-icon purple">
              <Radio size={19} />
            </span>
          </div>

          <label className="form-label">Nome da transmissão</label>

          <input
            className="hub-input"
            value={liveTitle}
            onChange={(e) => setLiveTitle(e.target.value)}
            placeholder="Ex.: Sobrevivendo 100 dias no Minecraft"
          />

          <label className="form-label">Plataforma</label>

          <select
            className="hub-input"
            value={livePlatform}
            onChange={(e) => setLivePlatform(e.target.value)}
          >
            {platforms.map((platform) => (
              <option key={platform.name}>{platform.name}</option>
            ))}
          </select>

          <button className="primary-button" onClick={addLive}>
            <Plus size={16} /> Adicionar à agenda
          </button>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Lives planejadas</h2>

            <p>Suas transmissões cadastradas.</p>
          </div>
        </div>

        {lives.length === 0 ? (
          <div className="empty-state">
            <Video size={30} />

            <strong>Nenhuma live planejada</strong>

            <span>Adicione sua primeira transmissão acima.</span>
          </div>
        ) : (
          <div className="post-list">
            {lives.map((live) => (
              <article className="post-row" key={live.id}>
                <div className="post-row-main">
                  <strong>{live.title}</strong>

                  <span>
                    {live.platform} · {live.date}
                  </span>
                </div>

                <span className="status-pill rascunho">{live.status}</span>

                <button
                  className="icon-button"
                  title="Excluir"
                  onClick={() => requestDeleteLive(live.id)}
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="stat-card">
          <div className="stat-top">
            <span>Transmitir ao vivo</span>

            <span className="stat-icon purple">
              <MonitorPlay size={19} />
            </span>
          </div>

          <strong>Integração com OBS em uma próxima etapa</strong>

          <small>
            Esta central organiza o planejamento. Ela ainda não inicia
            transmissões nem gera chaves de transmissão.
          </small>
        </div>
      </section>

      <footer className="footer">
        <span>VICO HUB © 2026</span>
        <span>Feito para criadores 💜</span>
      </footer>
    </div>
  );

  // =====================================================
  // VICO AI
  // =====================================================

  const renderAiPage = () => (
    <div className="dashboard">
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Vico AI</h2>

            <p>Sua parceira inteligente para criar conteúdos melhores.</p>
          </div>

          <span className="period-label">
            20 pontos/dia no plano gratuito planejado
          </span>
        </div>

        <div className="ai-panel">
          <div className="ai-heading">
            <span className="ai-avatar">
              <Sparkles size={23} />
            </span>

            <div>
              <strong>Vico AI</strong>

              <small>Especialista e parceira de criação</small>
            </div>
          </div>

          <div className="ai-messages">
            {aiMessages.map((message, index) => (
              <div className={`ai-message ${message.role}`} key={index}>
                {message.text}
              </div>
            ))}
          </div>

          <div className="ai-input-row">
            <input
              className="hub-input"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
              placeholder="Peça uma ideia de vídeo, título ou roteiro..."
            />

            <button
              className="primary-button"
              onClick={sendAiMessage}
              aria-label="Enviar mensagem"
            >
              <Send size={17} />
            </button>
          </div>

          <small className="helper-text">
            Chat demonstrativo: a IA real e o sistema de pontos serão integrados
            em uma próxima etapa.
          </small>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>O que a Vico AI poderá fazer</h2>

            <p>Ferramentas planejadas para ajudar na sua rotina.</p>
          </div>
        </div>

        <div className="quick-grid">
          <div className="quick-card">
            <Sparkles size={22} />

            <strong>Ideias de conteúdo</strong>

            <small>Novos temas para vídeos e Shorts.</small>
          </div>

          <div className="quick-card">
            <FileText size={22} />

            <strong>Títulos e descrições</strong>

            <small>Textos preparados para cada plataforma.</small>
          </div>

          <div className="quick-card">
            <Video size={22} />

            <strong>Roteiros</strong>

            <small>Estrutura para vídeos e séries.</small>
          </div>

          <div className="quick-card">
            <BarChart3 size={22} />

            <strong>Análise do canal</strong>

            <small>Diagnósticos baseados nos seus dados autorizados.</small>
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>VICO HUB © 2026</span>
        <span>Feito para criadores 💜</span>
      </footer>
    </div>
  );

  // =====================================================
  // CONFIGURAÇÕES
  // =====================================================

  const renderSettingsPage = () => (
    <div className="dashboard">
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Configurações</h2>

            <p>Personalize a experiência do seu Vico Hub.</p>
          </div>
        </div>

        <div className="settings-list">
          <div className="settings-card">
            <div>
              <strong>Idioma</strong>

              <small>Escolha o idioma da interface.</small>
            </div>

            <select
              className="hub-input settings-control"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>Português</option>
              <option>English</option>
              <option>Español</option>
            </select>
          </div>

          <div className="settings-card">
            <div>
              <strong>Tema</strong>

              <small>Escolha a aparência do aplicativo.</small>
            </div>

            <select
              className="hub-input settings-control"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option>Escuro</option>
              <option>Claro</option>
              <option>Automático</option>
            </select>
          </div>

          <div className="settings-card">
            <div>
              <strong>Densidade</strong>

              <small>Controle o espaçamento dos elementos.</small>
            </div>

            <select
              className="hub-input settings-control"
              value={density}
              onChange={(e) => setDensity(e.target.value)}
            >
              <option>Confortável</option>
              <option>Compacto</option>
              <option>Espaçoso</option>
            </select>
          </div>
        </div>

        <div className="stat-card" style={{ marginTop: 18 }}>
          <div className="stat-top">
            <span>Preferências atuais</span>

            <span className="stat-icon purple">
              {theme === 'Claro' ? <Sun size={19} /> : <Moon size={19} />}
            </span>
          </div>

          <strong>
            {theme} · {language}
          </strong>

          <small>
            Espaçamento: {density}. Nesta versão, as opções atualizam a seleção
            visual; salvar preferências na conta será implementado com o sistema
            de usuários.
          </small>
        </div>
      </section>

      <footer className="footer">
        <span>VICO HUB © 2026</span>
        <span>Feito para criadores 💜</span>
      </footer>
    </div>
  );

  // =====================================================
  // NAVEGAÇÃO
  // =====================================================

  const renderActivePage = () => {
    switch (activePage) {
      case 'Visão geral':
        return renderOverview();

      case 'Minhas plataformas':
        return renderPlatformsPage();

      case 'Publicações':
        return renderPublicationsPage();

      case 'Calendário':
        return renderCalendarPage();

      case 'Agendamentos':
        return renderSchedulePage();

      case 'Analytics':
        return renderAnalyticsPage();

      case 'Metas':
        return <GoalsPage />;

      case 'Central de lives':
        return renderLivesPage();

      case 'Vico AI':
        return renderAiPage();

      case 'Configurações':
        return renderSettingsPage();

      default:
        return renderOverview();
    }
  };

  // =====================================================
  // INTERFACE PRINCIPAL
  // =====================================================

  return (
    <div
      className={`app ${
        theme === 'Claro' ? 'light-theme' : ''
      } ${density.toLowerCase()}-density`}
    >
      <aside
        className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        style={{
          width: sidebarCollapsed ? 82 : 250,
          minWidth: sidebarCollapsed ? 82 : 250,
          transition: 'width 0.2s ease, min-width 0.2s ease',
        }}
      >
        <div className="brand">
          <div className="brand-icon">V</div>

          {!sidebarCollapsed && (
            <div>
              <h2>VICO HUB</h2>
              <span>CREATOR PLATFORM</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="nav-item"
          title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
          onClick={() => setSidebarCollapsed((value) => !value)}
          style={{
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            marginBottom: 12,
          }}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={19} />
          ) : (
            <ChevronRight size={19} style={{ transform: 'rotate(180deg)' }} />
          )}
          {!sidebarCollapsed && 'Recolher menu'}
        </button>

        {!sidebarCollapsed && <div className="menu-label">MENU PRINCIPAL</div>}

        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? 'active' : ''
                }`}
                onClick={() => changePage(item.name)}
                title={sidebarCollapsed ? item.name : undefined}
                style={{
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
              >
                <Icon className="nav-icon" size={19} />

                {!sidebarCollapsed && item.name}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div
            className="profile"
            style={{
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            }}
          >
            <div className="profile-avatar">V</div>

            {!sidebarCollapsed && (
              <div>
                <strong>Vico1513</strong>
                <span>Criador de conteúdo</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="main-content" style={{ flex: 1, minWidth: 0 }}>
        <header className="topbar">
          <div className="breadcrumb">
            <span>Vico Hub</span>

            <ChevronRight size={15} />

            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <div className="notification-wrap">
              <button
                className="icon-button"
                aria-label="Notificações"
                onClick={() => setNotificationOpen((open) => !open)}
              >
                <Bell size={19} />

                {scheduledPosts.length > 0 && !notificationRead && (
                  <span className="notification-dot" />
                )}
              </button>

              {notificationOpen && (
                <div className="notification-popover">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <strong>Notificações</strong>
                    {scheduledPosts.length > 0 && notificationRead && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#4ade80',
                          background: 'rgba(74, 222, 128, 0.12)',
                          border: '1px solid rgba(74, 222, 128, 0.25)',
                          borderRadius: 999,
                          padding: '4px 8px',
                        }}
                      >
                        Lido
                      </span>
                    )}
                  </div>

                  {scheduledPosts.length > 0 ? (
                    <div
                      style={{
                        display: 'grid',
                        gap: 10,
                        marginTop: 12,
                        maxHeight: 260,
                        overflowY: 'auto',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 12, opacity: 0.75 }}>
                        Você tem {scheduledPosts.length} agendamento(s):
                      </p>
                      {scheduledPosts
                        .slice()
                        .sort((a, b) =>
                          `${a.date} ${a.time}`.localeCompare(
                            `${b.date} ${b.time}`
                          )
                        )
                        .map((post) => (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => {
                              setNotificationOpen(false);
                              changePage('Publicações');
                              editPost(post);
                            }}
                            style={{
                              display: 'grid',
                              gap: 4,
                              width: '100%',
                              padding: '10px 12px',
                              textAlign: 'left',
                              color: 'inherit',
                              background: 'rgba(168, 85, 247, 0.10)',
                              border: '1px solid rgba(192, 132, 252, 0.18)',
                              borderRadius: 10,
                              cursor: 'pointer',
                            }}
                          >
                            <strong style={{ fontSize: 12 }}>
                              {post.title}
                            </strong>
                            <span style={{ fontSize: 11, opacity: 0.72 }}>
                              {post.platform} ·{' '}
                              {post.date
                                ? new Date(
                                    `${post.date}T00:00:00`
                                  ).toLocaleDateString('pt-BR')
                                : 'Data não definida'}{' '}
                              às {post.time || '18:00'}
                            </span>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <p style={{ margin: '10px 0 0' }}>
                      Nenhum agendamento por enquanto.
                    </p>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginTop: 12,
                    }}
                  >
                    {scheduledPosts.length > 0 && !notificationRead && (
                      <button
                        className="text-button"
                        onClick={() => setNotificationRead(true)}
                      >
                        Marcar como lido
                      </button>
                    )}
                    <button
                      className="text-button"
                      onClick={() => setNotificationOpen(false)}
                      style={{ marginLeft: 'auto' }}
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="top-avatar">V</div>
          </div>
        </header>

        {renderActivePage()}
      </main>

      {deleteConfirmation && (
        <div
          role="presentation"
          onClick={() => setDeleteConfirmation(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1001,
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            background: 'rgba(5, 3, 12, 0.76)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirmation-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(100%, 440px)',
              padding: 26,
              borderRadius: 22,
              border: '1px solid rgba(192, 132, 252, 0.28)',
              background: theme === 'Claro' ? '#ffffff' : '#1b1029',
              color: theme === 'Claro' ? '#241532' : '#f5edff',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 15,
                display: 'grid',
                placeItems: 'center',
                marginBottom: 18,
                color: '#c084fc',
                background: 'rgba(168, 85, 247, 0.15)',
              }}
            >
              <Trash2 size={24} />
            </div>

            <h2
              id="delete-confirmation-title"
              style={{ margin: '0 0 9px', fontSize: 21 }}
            >
              Confirmar exclusão
            </h2>

            <p style={{ margin: '0 0 20px', lineHeight: 1.6, opacity: 0.78 }}>
              Tem certeza de que deseja excluir {deleteConfirmation.name}? Essa
              ação não poderá ser desfeita.
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 10,
                marginTop: 22,
              }}
            >
              <button
                type="button"
                className="primary-button"
                onClick={confirmDelete}
                style={{
                  minWidth: 150,
                  padding: '12px 22px',
                  flex: '0 1 190px',
                }}
              >
                Continuar
              </button>

              <button
                type="button"
                className="connect-button"
                onClick={() => setDeleteConfirmation(null)}
                style={{
                  minWidth: 100,
                  padding: '10px 16px',
                  flex: '0 0 auto',
                }}
              >
                Cancelar
              </button>
            </div>
          </section>
        </div>
      )}

      {platformConfirmation && (
        <div
          role="presentation"
          onClick={() => {
            setPlatformConfirmation(null);
            setPlatformConfirmationChecked(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            background: 'rgba(5, 3, 12, 0.76)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="platform-confirmation-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(100%, 440px)',
              padding: 26,
              borderRadius: 22,
              border: '1px solid rgba(192, 132, 252, 0.28)',
              background: theme === 'Claro' ? '#ffffff' : '#1b1029',
              color: theme === 'Claro' ? '#241532' : '#f5edff',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 15,
                display: 'grid',
                placeItems: 'center',
                marginBottom: 18,
                color: '#c084fc',
                background: 'rgba(168, 85, 247, 0.15)',
              }}
            >
              <CheckCircle2 size={25} />
            </div>

            <h2
              id="platform-confirmation-title"
              style={{ margin: '0 0 9px', fontSize: 21 }}
            >
              {platformConfirmation.action === 'disconnect'
                ? 'Confirmar desconexão'
                : 'Confirmar conexão'}
            </h2>

            <p style={{ margin: '0 0 20px', lineHeight: 1.6, opacity: 0.78 }}>
              {platformConfirmation.action === 'disconnect'
                ? `Você está prestes a desconectar ${platformConfirmation.name} do Vico Hub. Será necessário autorizar a conta novamente para usar a integração.`
                : `Você será redirecionado para a página oficial de ${platformConfirmation.name} para autorizar a conexão com o Vico Hub.`}
            </p>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 11,
                padding: 14,
                borderRadius: 13,
                background:
                  theme === 'Claro' ? '#f3edfa' : 'rgba(255, 255, 255, 0.055)',
                cursor: 'pointer',
                lineHeight: 1.45,
                fontSize: 13,
              }}
            >
              <input
                type="checkbox"
                checked={platformConfirmationChecked}
                onChange={(event) =>
                  setPlatformConfirmationChecked(event.target.checked)
                }
                style={{
                  width: 17,
                  height: 17,
                  marginTop: 1,
                  accentColor: '#a855f7',
                  flexShrink: 0,
                }}
              />
              <span>
                {platformConfirmation.action === 'disconnect'
                  ? `Confirmo que desejo desconectar ${platformConfirmation.name}.`
                  : `Confirmo que desejo continuar e autorizar ${platformConfirmation.name} no Vico Hub.`}
              </span>
            </label>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 10,
                marginTop: 22,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="primary-button"
                disabled={!platformConfirmationChecked}
                onClick={confirmPlatformAction}
                style={{
                  minWidth: 155,
                  padding: '13px 24px',
                  flex: '1 1 155px',
                  fontSize: 14,
                  fontWeight: 700,
                  opacity: platformConfirmationChecked ? 1 : 0.5,
                  cursor: platformConfirmationChecked
                    ? 'pointer'
                    : 'not-allowed',
                }}
              >
                {platformConfirmation.action === 'disconnect'
                  ? 'Desconectar'
                  : 'Continuar'}
              </button>

              <button
                type="button"
                className="connect-button"
                onClick={() => {
                  setPlatformConfirmation(null);
                  setPlatformConfirmationChecked(false);
                }}
                style={{
                  minWidth: 82,
                  padding: '9px 13px',
                  flex: '0 0 auto',
                  fontSize: 12,
                }}
              >
                Cancelar
              </button>
            </div>
          </section>
        </div>
      )}

      {platformNotice && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            right: 22,
            bottom: 22,
            zIndex: 1100,
            width: 'min(calc(100% - 44px), 390px)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '15px 16px',
            borderRadius: 15,
            border: `1px solid ${
              platformNotice.type === 'success'
                ? 'rgba(74, 222, 128, 0.35)'
                : 'rgba(248, 113, 113, 0.4)'
            }`,
            background: theme === 'Claro' ? '#ffffff' : '#21152f',
            color: theme === 'Claro' ? '#241532' : '#f5edff',
            boxShadow: '0 14px 45px rgba(0, 0, 0, 0.3)',
          }}
        >
          <CheckCircle2
            size={20}
            color={platformNotice.type === 'success' ? '#4ade80' : '#f87171'}
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <span style={{ flex: 1, fontSize: 13, lineHeight: 1.5 }}>
            {platformNotice.message}
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label="Fechar aviso"
            onClick={() => setPlatformNotice(null)}
          >
            <X size={16} />
          </button>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 3,
              overflow: 'hidden',
              borderRadius: '0 0 15px 15px',
              background: 'rgba(192, 132, 252, 0.16)',
            }}
          >
            <div
              style={{
                width: `${noticeProgress}%`,
                height: '100%',
                background:
                  platformNotice.type === 'success' ? '#4ade80' : '#c084fc',
                transition:
                  noticeProgress === 0 ? 'width 3.96s linear' : 'none',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
