import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Heart, Thermometer, Droplets, Zap, AlertTriangle, TrendingUp, TrendingDown, Minus, Pause, Smartphone } from 'lucide-react';

interface VitalSigns {
  timestamp: string;
  heart_rate: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  temperature: number;
  oxygen_saturation: number;
  steps: number;
  calories_burned: number;
  sleep_hours: number;
  stress_level: number;
}

interface Alert {
  type: 'critical' | 'warning' | 'info';
  vital: string;
  value: number;
  message: string;
  action: string;
}

interface Analysis {
  summary_stats: any;
  trends: any;
  alerts: Alert[];
  recommendations: string[];
  activity_insights: any;
  circadian_analysis: any;
}

const VitalSignsDashboard: React.FC = () => {
  const [vitalSignsData, setVitalSignsData] = useState<VitalSigns[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [manualEntry, setManualEntry] = useState({
    heart_rate: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    temperature: '',
    oxygen_saturation: '',
    stress_level: '',
    steps: ''
  });
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    loadLatestVitalSigns();
  }, []);

  const loadLatestVitalSigns = async () => {
    try {
      const response = await axios.get('/vital-signs/latest');
      
      if (response.data.success && response.data.data.has_data) {
        setVitalSignsData(response.data.data.recent_readings);
        await loadAnalysis();
      }
    } catch (error) {
      console.error('Error loading vital signs:', error);
    }
  };

  const loadAnalysis = async () => {
    try {
      const response = await axios.get('/vital-signs/analysis');
      
      if (response.data.success) {
        setAnalysis(response.data.data);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
    }
  };

  const simulateWearableData = async () => {
    try {
      setIsSimulating(true);
      const duration = selectedPeriod === '24h' ? 24 : selectedPeriod === '7d' ? 168 : 720;

      const response = await axios.get(`/vital-signs/simulate?duration=${duration}`);

      if (response.status === 200) {
        const data = response.data;
        if (data.success) {
          setVitalSignsData(data.data.vital_signs);
          setAnalysis(data.data.analysis);
        }
      }
    } catch (error) {
      console.error('Error simulating data:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const addManualReading = async () => {
    try {
      if (!manualEntry.heart_rate || !manualEntry.blood_pressure_systolic || !manualEntry.blood_pressure_diastolic) {
        alert('Please fill in at least heart rate and blood pressure');
        return;
      }

      // Prepare the data, sending only non-empty values
      const readingData: any = {
        heart_rate: manualEntry.heart_rate,
        blood_pressure_systolic: manualEntry.blood_pressure_systolic,
        blood_pressure_diastolic: manualEntry.blood_pressure_diastolic,
      };

      // Add optional fields only if they have values
      if (manualEntry.temperature && manualEntry.temperature.trim() !== '') {
        readingData.temperature = manualEntry.temperature;
      }
      if (manualEntry.oxygen_saturation && manualEntry.oxygen_saturation.trim() !== '') {
        readingData.oxygen_saturation = manualEntry.oxygen_saturation;
      }
      if (manualEntry.stress_level && manualEntry.stress_level.trim() !== '') {
        readingData.stress_level = manualEntry.stress_level;
      }
      if (manualEntry.steps && manualEntry.steps.trim() !== '') {
        readingData.steps = manualEntry.steps;
      }

      console.log('Sending vital signs data:', readingData);

      const response = await axios.post('/vital-signs/manual', readingData);

      if (response.status === 200) {
        const data = response.data;
        if (data.success) {
          await loadLatestVitalSigns();
          setManualEntry({
            heart_rate: '',
            blood_pressure_systolic: '',
            blood_pressure_diastolic: '',
            temperature: '',
            oxygen_saturation: '',
            stress_level: '',
            steps: ''
          });
          setShowManualEntry(false);
          alert('Vital signs reading added successfully!');
        }
      }
    } catch (error: any) {
      console.error('Error adding manual reading:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to add reading: ${error.response?.data?.message || error.message}`);
    }
  };

  const formatVitalSignsForChart = () => {
    return vitalSignsData.map((reading) => ({
      time: new Date(reading.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      heart_rate: reading.heart_rate,
      systolic: reading.blood_pressure_systolic,
      diastolic: reading.blood_pressure_diastolic,
      temperature: reading.temperature,
      oxygen: reading.oxygen_saturation,
      steps: reading.steps,
      stress: reading.stress_level
    }));
  };

  const getVitalStatus = (value: number, type: string) => {
    const ranges: { [key: string]: { normal: [number, number]; optimal: [number, number] } } = {
      heart_rate: { normal: [60, 100], optimal: [70, 85] },
      systolic: { normal: [90, 140], optimal: [110, 120] },
      diastolic: { normal: [60, 90], optimal: [70, 80] },
      temperature: { normal: [36.1, 37.2], optimal: [36.5, 37.0] },
      oxygen: { normal: [95, 100], optimal: [98, 100] }
    };

    const range = ranges[type];
    if (!range) return 'normal';

    if (value >= range.optimal[0] && value <= range.optimal[1]) return 'optimal';
    if (value >= range.normal[0] && value <= range.normal[1]) return 'normal';
    return 'warning';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const chartData = formatVitalSignsForChart();
  const latestReading = vitalSignsData[vitalSignsData.length - 1];

  const stressData = [
    { name: 'Low (1-3)', value: vitalSignsData.filter(v => v.stress_level <= 3).length, color: '#00C49F' },
    { name: 'Medium (4-6)', value: vitalSignsData.filter(v => v.stress_level > 3 && v.stress_level <= 6).length, color: '#FFBB28' },
    { name: 'High (7-10)', value: vitalSignsData.filter(v => v.stress_level > 6).length, color: '#FF8042' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vital Signs Monitoring</h1>
          <p className="text-gray-600">Real-time health monitoring with AI-powered insights</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <button
                onClick={simulateWearableData}
                disabled={isSimulating}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                {isSimulating ? 'Simulating...' : 'Simulate Wearable Data'}
              </button>
              
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                <Activity className="w-4 h-4" />
                Manual Entry
              </button>
              
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            
            <button
              onClick={loadLatestVitalSigns}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              <Activity className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Manual Entry Form */}
        {showManualEntry && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Add Manual Reading</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Heart Rate (BPM)</label>
                <input
                  type="number"
                  value={manualEntry.heart_rate}
                  onChange={(e) => setManualEntry({...manualEntry, heart_rate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 75"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  value={manualEntry.blood_pressure_systolic}
                  onChange={(e) => setManualEntry({...manualEntry, blood_pressure_systolic: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  value={manualEntry.blood_pressure_diastolic}
                  onChange={(e) => setManualEntry({...manualEntry, blood_pressure_diastolic: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={manualEntry.temperature}
                  onChange={(e) => setManualEntry({...manualEntry, temperature: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 36.7"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Oxygen Saturation (%)</label>
                <input
                  type="number"
                  value={manualEntry.oxygen_saturation}
                  onChange={(e) => setManualEntry({...manualEntry, oxygen_saturation: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 98"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stress Level (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={manualEntry.stress_level}
                  onChange={(e) => setManualEntry({...manualEntry, stress_level: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Steps</label>
                <input
                  type="number"
                  min="0"
                  value={manualEntry.steps}
                  onChange={(e) => setManualEntry({...manualEntry, steps: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 5000"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={addManualReading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Add Reading
              </button>
              <button
                onClick={() => setShowManualEntry(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {vitalSignsData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Vital Signs Data</h3>
            <p className="text-gray-500 mb-4">Start by simulating wearable device data or adding manual readings</p>
            <button
              onClick={simulateWearableData}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
            >
              Simulate Wearable Data
            </button>
          </div>
        ) : (
          <>
            {/* Latest Vital Signs Cards */}
            {latestReading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="w-8 h-8 text-red-500" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getVitalStatus(latestReading.heart_rate, 'heart_rate'))}`}>
                      {getVitalStatus(latestReading.heart_rate, 'heart_rate')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-700">Heart Rate</h3>
                  <p className="text-2xl font-bold text-gray-900">{latestReading.heart_rate} BPM</p>
                  {analysis?.trends?.heart_rate && (
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(analysis.trends.heart_rate.direction)}
                      <span className="text-sm text-gray-600">{analysis.trends.heart_rate.direction}</span>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-8 h-8 text-blue-500" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getVitalStatus(latestReading.blood_pressure_systolic, 'systolic'))}`}>
                      {getVitalStatus(latestReading.blood_pressure_systolic, 'systolic')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-700">Blood Pressure</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {latestReading.blood_pressure_systolic}/{latestReading.blood_pressure_diastolic}
                  </p>
                  <p className="text-sm text-gray-500">mmHg</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Thermometer className="w-8 h-8 text-orange-500" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getVitalStatus(latestReading.temperature, 'temperature'))}`}>
                      {getVitalStatus(latestReading.temperature, 'temperature')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-700">Temperature</h3>
                  <p className="text-2xl font-bold text-gray-900">{latestReading.temperature.toFixed(1)}°C</p>
                  <p className="text-sm text-gray-500">{(latestReading.temperature * 9/5 + 32).toFixed(1)}°F</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Droplets className="w-8 h-8 text-cyan-500" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getVitalStatus(latestReading.oxygen_saturation, 'oxygen'))}`}>
                      {getVitalStatus(latestReading.oxygen_saturation, 'oxygen')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-700">Oxygen Saturation</h3>
                  <p className="text-2xl font-bold text-gray-900">{latestReading.oxygen_saturation}%</p>
                  <p className="text-sm text-gray-500">SpO2</p>
                </div>
              </div>
            )}

            {/* Alerts */}
            {analysis?.alerts && analysis.alerts.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  Health Alerts
                </h3>
                <div className="space-y-3">
                  {analysis.alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.type === 'critical' ? 'bg-red-50 border-red-500' :
                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{alert.message}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.action}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Heart Rate & Blood Pressure Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Vital Signs Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="heart_rate" stroke="#ef4444" strokeWidth={2} name="Heart Rate" />
                    <Line type="monotone" dataKey="systolic" stroke="#3b82f6" strokeWidth={2} name="Systolic BP" />
                    <Line type="monotone" dataKey="diastolic" stroke="#06b6d4" strokeWidth={2} name="Diastolic BP" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Activity Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Daily Activity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="steps" stackId="1" stroke="#10b981" fill="#10b981" name="Steps" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Temperature & Oxygen Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Temperature & Oxygen</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="temp" orientation="left" />
                    <YAxis yAxisId="oxygen" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} name="Temperature (°C)" />
                    <Line yAxisId="oxygen" type="monotone" dataKey="oxygen" stroke="#06b6d4" strokeWidth={2} name="Oxygen (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Stress Level Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Stress Level Distribution</h3>
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  {/* Pie Chart */}
                  <div className="w-full lg:w-1/2">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stressData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }: any) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stressData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any, name: any) => [`${value} readings`, name]}
                          labelFormatter={(name: any) => `Stress Level: ${name}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Legend */}
                  <div className="w-full lg:w-1/2 space-y-3">
                    {stressData.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          ></div>
                          <span className="font-medium text-gray-700">{entry.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{entry.value}</div>
                          <div className="text-sm text-gray-500">
                            {stressData.reduce((sum, item) => sum + item.value, 0) > 0 
                              ? `${((entry.value / stressData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`
                              : '0%'
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {analysis?.recommendations && analysis.recommendations.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">AI Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <Zap className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VitalSignsDashboard;