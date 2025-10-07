import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Pill, Clock, AlertTriangle, CheckCircle, X, Shield, Activity } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  generic_name: string;
  dosage: string;
  frequency: string;
  times: string[];
  start_date: string;
  end_date?: string;
  instructions: string;
  prescribing_doctor: string;
  refills_remaining: number;
  quantity: number;
  status: 'active' | 'paused' | 'discontinued' | 'completed';
  side_effects: string[];
  condition_treated: string;
}

interface Reminder {
  medication_id: string;
  medication_name: string;
  dosage: string;
  scheduled_time: string;
  taken: boolean;
  missed: boolean;
}

interface Interaction {
  medication1: string;
  medication2: string;
  interaction: {
    severity: 'minor' | 'moderate' | 'major' | 'severe';
    description: string;
    recommendation: string;
  };
}

interface RefillAlert {
  medication_name: string;
  alert_level: 'info' | 'warning' | 'critical';
  message: string;
  days_remaining: number;
  refills_remaining: number;
}

const SmartMedicationDashboard: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [refillAlerts, setRefillAlerts] = useState<RefillAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    generic_name: '',
    dosage: '',
    frequency: 'twice_daily',
    custom_times: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    instructions: '',
    prescribing_doctor: '',
    refills_remaining: '0',
    quantity: '30',
    condition_treated: ''
  });

  const frequencyOptions = [
    { value: 'once_daily', label: 'Once Daily' },
    { value: 'twice_daily', label: 'Twice Daily' },
    { value: 'three_times_daily', label: 'Three Times Daily' },
    { value: 'four_times_daily', label: 'Four Times Daily' },
    { value: 'every_6_hours', label: 'Every 6 Hours' },
    { value: 'every_8_hours', label: 'Every 8 Hours' },
    { value: 'every_12_hours', label: 'Every 12 Hours' },
    { value: 'bedtime', label: 'At Bedtime' },
    { value: 'morning', label: 'Morning Only' },
    { value: 'with_meals', label: 'With Meals' },
    { value: 'as_needed', label: 'As Needed' }
  ];

  useEffect(() => {
    loadMedications();
    loadReminders();
    loadRefillAlerts();
  }, []);

  useEffect(() => {
    if (medications.length > 0) {
      checkInteractions();
    }
  }, [medications]);

  const loadMedications = async () => {
    try {
      const response = await axios.get('/medications/list');
      
      if (response.data.success) {
        setMedications(response.data.data.active_medications);
      }
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      const response = await axios.get('/medications/reminders?days=7');
      
      if (response.data.success) {
        setReminders(response.data.data.reminders.slice(0, 10)); // Show next 10 reminders
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const loadRefillAlerts = async () => {
    try {
      const response = await axios.get('/medications/refill-alerts');
      
      if (response.data.success) {
        setRefillAlerts(response.data.data.refill_alerts);
      }
    } catch (error) {
      console.error('Error loading refill alerts:', error);
    }
  };

  const checkInteractions = async () => {
    try {
      const response = await axios.post('/medications/interactions');
      
      if (response.data.success) {
        const allInteractions = [
          ...response.data.data.severe,
          ...response.data.data.major,
          ...response.data.data.moderate,
          ...response.data.data.minor
        ];
        setInteractions(allInteractions);
      }
    } catch (error) {
      console.error('Error checking interactions:', error);
    }
  };

  const addMedication = async () => {
    try {
      if (!newMedication.name || !newMedication.dosage) {
        alert('Please fill in medication name and dosage');
        return;
      }

      const response = await axios.post('/medications/add', newMedication);

      if (response.status === 200) {
        const data = response.data;
        if (data.success) {
          await loadMedications();
          await loadReminders();
          setShowAddForm(false);
          setNewMedication({
            name: '',
            generic_name: '',
            dosage: '',
            frequency: 'twice_daily',
            custom_times: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            instructions: '',
            prescribing_doctor: '',
            refills_remaining: '0',
            quantity: '30',
            condition_treated: ''
          });
        }
      }
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const markAsTaken = async (reminder: Reminder) => {
    try {
      const response = await axios.post('/medications/take', {
        medication_id: reminder.medication_id,
        scheduled_time: reminder.scheduled_time
      });

      if (response.status === 200) {
        await loadReminders();
      }
    } catch (error) {
      console.error('Error marking medication as taken:', error);
    }
  };

  const markAsMissed = async (reminder: Reminder) => {
    try {
      const response = await axios.post('/medications/miss', {
        medication_id: reminder.medication_id,
        scheduled_time: reminder.scheduled_time,
        reason: 'Marked as missed by user'
      });

      if (response.status === 200) {
        await loadReminders();
      }
    } catch (error) {
      console.error('Error marking medication as missed:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-100 text-red-800 border-red-200';
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-l-red-500';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-l-yellow-500';
      case 'info': return 'bg-blue-100 text-blue-800 border-l-blue-500';
      default: return 'bg-gray-100 text-gray-800 border-l-gray-500';
    }
  };

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Medication Management</h1>
          <p className="text-gray-600">AI-powered medication tracking with safety monitoring</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <Pill className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active Medications</p>
                <p className="text-2xl font-bold text-gray-900">{medications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Today's Reminders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reminders.filter(r => formatDate(r.scheduled_time) === formatDate(new Date().toISOString())).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Drug Interactions</p>
                <p className="text-2xl font-bold text-gray-900">{interactions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Refill Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{refillAlerts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Medication Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Add New Medication
          </button>
        </div>

        {/* Add Medication Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Medication</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Medication Name *</label>
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Lisinopril"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Generic Name</label>
                <input
                  type="text"
                  value={newMedication.generic_name}
                  onChange={(e) => setNewMedication({...newMedication, generic_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., lisinopril"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dosage *</label>
                <input
                  type="text"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 10mg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Frequency *</label>
                <select
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Start Date *</label>
                <input
                  type="date"
                  value={newMedication.start_date}
                  onChange={(e) => setNewMedication({...newMedication, start_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={newMedication.end_date}
                  onChange={(e) => setNewMedication({...newMedication, end_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Prescribing Doctor</label>
                <input
                  type="text"
                  value={newMedication.prescribing_doctor}
                  onChange={(e) => setNewMedication({...newMedication, prescribing_doctor: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Dr. Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Refills Remaining</label>
                <input
                  type="number"
                  value={newMedication.refills_remaining}
                  onChange={(e) => setNewMedication({...newMedication, refills_remaining: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  value={newMedication.quantity}
                  onChange={(e) => setNewMedication({...newMedication, quantity: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Condition Treated</label>
                <input
                  type="text"
                  value={newMedication.condition_treated}
                  onChange={(e) => setNewMedication({...newMedication, condition_treated: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., High Blood Pressure"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">Special Instructions</label>
                <textarea
                  value={newMedication.instructions}
                  onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="Take with food, avoid alcohol, etc."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={addMedication}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                Add Medication
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Reminders */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-green-600" />
              Upcoming Reminders
            </h3>

            {reminders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming reminders</p>
            ) : (
              <div className="space-y-3">
                {reminders.slice(0, 6).map((reminder, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{reminder.medication_name}</h4>
                      <p className="text-sm text-gray-600">{reminder.dosage}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(reminder.scheduled_time)} at {formatTime(reminder.scheduled_time)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => markAsTaken(reminder)}
                        className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                        title="Mark as taken"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => markAsMissed(reminder)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                        title="Mark as missed"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Medications */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Pill className="w-6 h-6 text-blue-600" />
              Current Medications
            </h3>

            {medications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active medications</p>
            ) : (
              <div className="space-y-4">
                {medications.map((medication) => (
                  <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {medication.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Dosage:</strong> {medication.dosage}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Frequency:</strong> {medication.frequency.replace('_', ' ')}
                    </p>
                    {medication.prescribing_doctor && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Doctor:</strong> {medication.prescribing_doctor}
                      </p>
                    )}
                    {medication.condition_treated && (
                      <p className="text-sm text-gray-600">
                        <strong>For:</strong> {medication.condition_treated}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drug Interactions */}
          {interactions.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                Drug Interactions
              </h3>

              <div className="space-y-3">
                {interactions.map((interaction, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${getSeverityColor(interaction.interaction.severity)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">
                        {interaction.medication1} + {interaction.medication2}
                      </h4>
                      <span className="px-2 py-1 rounded text-xs font-medium">
                        {interaction.interaction.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{interaction.interaction.description}</p>
                    <p className="text-sm font-medium">
                      <strong>Recommendation:</strong> {interaction.interaction.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refill Alerts */}
          {refillAlerts.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-600" />
                Refill Alerts
              </h3>

              <div className="space-y-3">
                {refillAlerts.map((alert, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.alert_level)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{alert.medication_name}</h4>
                      <span className="px-2 py-1 rounded text-xs font-medium">
                        {alert.alert_level.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm mb-1">{alert.message}</p>
                    <p className="text-sm">
                      <strong>Refills remaining:</strong> {alert.refills_remaining}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartMedicationDashboard;