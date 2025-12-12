// 在组件顶部添加状态
const [configSource, setConfigSource] = useState<'remote' | 'local' | 'default'>('default');

// 在fetchData函数中添加
const fetchConfigInfo = async () => {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const data = await response.json();
      setConfigSource(data.source);
    }
  } catch (err) {
    console.log('Unable to fetch config info');
  }
};

// 在useEffect中调用
useEffect(() => {
  fetchData();
  fetchConfigInfo();
  setBaseUrl(window.location.origin);
}, []);

// 在界面中添加配置源指示器
<div className="flex items-center space-x-2 mb-4">
  <span className="text-sm text-gray-500">Config source:</span>
  <span className={`px-2 py-1 text-xs rounded ${
    configSource === 'remote' ? 'bg-green-100 text-green-800' :
    configSource === 'local' ? 'bg-blue-100 text-blue-800' :
    'bg-yellow-100 text-yellow-800'
  }`}>
    {configSource === 'remote' ? '🌐 Remote URL' :
     configSource === 'local' ? '💾 Local File' :
     '⚙️ Default'}
  </span>
</div>