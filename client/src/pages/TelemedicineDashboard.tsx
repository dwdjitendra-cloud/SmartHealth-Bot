import { useState, useEffect } from 'react';
import { 
  Video, Calendar, Clock, Users, Phone, MessageSquare, 
  CheckCircle, XCircle, AlertCircle, Star,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface Doctor {
  doctor_id: string;
  doctor_name: string;
  specialty: string;
  rating: number;
  next_available: string;
  consultation_fee: number;
  consultation_types: string[];
}

interface Appointment {
  appointment_id: string;
  doctor_name: string;
  specialty: string;
  scheduled_time: string;
  consultation_type: string;
  status: string;
  symptoms?: string;
  notes?: string;
}

interface Consultation {
  consultation_id: string;
  doctor_name: string;
  specialty: string;
  consultation_date: string;
  duration: number;
  diagnosis?: string;
  prescription?: string;
  follow_up_needed: boolean;
  follow_up_date?: string;
  consultation_fee: number;
}

interface Analytics {
  totalAppointments: number;
  completedConsultations: number;
  upcomingAppointments: number;
  cancelledAppointments: number;
}

const TelemedicineDashboard = () => {
  const [activeTab, setActiveTab] = useState('book');
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultationHistory, setConsultationHistory] = useState<Consultation[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedConsultationType, setSelectedConsultationType] = useState('video');
  const [analytics, setAnalytics] = useState<Analytics>({
    totalAppointments: 0,
    completedConsultations: 0,
    upcomingAppointments: 0,
    cancelledAppointments: 0
  });

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    slotDateTime: '',
    consultationType: 'video',
    symptoms: '',
    notes: ''
  });

  const specialties = [
    'General Medicine', 'Cardiology', 'Dermatology', 'Psychiatry',
    'Pediatrics', 'Gynecology', 'Orthopedics', 'Neurology',
    'Endocrinology', 'Gastroenterology', 'Pulmonology', 'Oncology'
  ];

  const consultationTypes = [
    { id: 'video', name: 'Video Call', icon: Video, description: 'Face-to-face consultation' },
    { id: 'audio', name: 'Voice Call', icon: Phone, description: 'Audio-only consultation' },
    { id: 'chat', name: 'Text Chat', icon: MessageSquare, description: 'Text-based consultation' }
  ];

  useEffect(() => {
    fetchAnalytics();
    fetchAppointments();
    fetchConsultationHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 'book') {
      fetchAvailableDoctors();
    }
  }, [activeTab, selectedSpecialty, selectedConsultationType]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/telemedicine/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchAvailableDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty) params.append('specialty', selectedSpecialty);
      if (selectedConsultationType) params.append('consultation_type', selectedConsultationType);

      const response = await axios.get(`/telemedicine/doctors?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setDoctors(response.data.doctors);
      } else {
        toast.error(response.data.error || 'Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch available doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/telemedicine/appointments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchConsultationHistory = async () => {
    try {
      const response = await axios.get('/telemedicine/consultation-history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setConsultationHistory(response.data.consultations);
      }
    } catch (error) {
      console.error('Error fetching consultation history:', error);
    }
  };

  const bookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.doctorId || !bookingForm.slotDateTime) {
      toast.error('Please select a doctor and time slot');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/telemedicine/book', bookingForm, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success('Appointment booked successfully!');
        setBookingForm({
          doctorId: '',
          slotDateTime: '',
          consultationType: 'video',
          symptoms: '',
          notes: ''
        });
        fetchAppointments();
        setActiveTab('appointments');
      } else {
        toast.error(response.data.error || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const joinWaitingRoom = async (appointmentId: string) => {
    try {
      const response = await axios.post('/telemedicine/waiting-room', 
        { appointment_id: appointmentId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Joined waiting room successfully!');
        // In a real implementation, this would open the video consultation interface
        window.open(response.data.meeting_link, '_blank');
      } else {
        toast.error(response.data.error || 'Failed to join waiting room');
      }
    } catch (error) {
      console.error('Error joining waiting room:', error);
      toast.error('Failed to join waiting room');
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const response = await axios.delete('/telemedicine/cancel', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        data: { 
          appointment_id: appointmentId,
          cancellation_reason: 'Patient cancelled'
        }
      });

      if (response.data.success) {
        toast.success('Appointment cancelled successfully');
        fetchAppointments();
      } else {
        toast.error(response.data.error || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'in_progress': return <Video className="h-4 w-4 text-green-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isAppointmentStartable = (appointmentTime: string) => {
    const now = new Date();
    const aptTime = new Date(appointmentTime);
    const diffMinutes = (aptTime.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes <= 15 && diffMinutes >= -5; // Can join 15 minutes before to 5 minutes after
  };

  const renderAnalytics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center">
          <Calendar className="h-8 w-8 text-blue-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Appointments</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalAppointments || 0}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Completed Consultations</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.completedConsultations || 0}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center">
          <Clock className="h-8 w-8 text-orange-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.upcomingAppointments || 0}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center">
          <XCircle className="h-8 w-8 text-red-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Cancelled</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.cancelledAppointments || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookingTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Find the Right Doctor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Type</label>
            <select
              value={selectedConsultationType}
              onChange={(e) => setSelectedConsultationType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {consultationTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Available Doctors */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Doctors</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (doctors || []).length > 0 ? (
          <div className="grid gap-4">
            {(doctors || []).map(doctor => {
              const nextSlot = formatDateTime(doctor.next_available);
              return (
                <div key={doctor.doctor_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{doctor.doctor_name}</h4>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{doctor.rating}</span>
                        <span className="text-sm text-gray-400 mx-2">•</span>
                        <span className="text-sm text-gray-600">${doctor.consultation_fee}</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Next available: {nextSlot.date} at {nextSlot.time}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setBookingForm(prev => ({
                          ...prev,
                          doctorId: doctor.doctor_id,
                          slotDateTime: doctor.next_available,
                          consultationType: selectedConsultationType
                        }));
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Select
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No doctors available for the selected criteria</p>
        )}
      </div>

      {/* Booking Form */}
      {bookingForm.doctorId && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Appointment</h3>
          <form onSubmit={bookAppointment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms (Optional)</label>
              <textarea
                value={bookingForm.symptoms}
                onChange={(e) => setBookingForm(prev => ({ ...prev, symptoms: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your symptoms to help the doctor prepare..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
              <textarea
                value={bookingForm.notes}
                onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional information for the doctor..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setBookingForm({ doctorId: '', slotDateTime: '', consultationType: 'video', symptoms: '', notes: '' })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  const renderAppointmentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Appointments</h3>
        {(appointments || []).length > 0 ? (
          <div className="space-y-4">
            {(appointments || []).map(appointment => {
              const dateTime = formatDateTime(appointment.scheduled_time);
              const canJoin = isAppointmentStartable(appointment.scheduled_time);
              
              return (
                <div key={appointment.appointment_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(appointment.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{appointment.doctor_name}</h4>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {dateTime.date} at {dateTime.time}
                      </p>
                      <p className="text-sm text-gray-600">
                        Type: {appointment.consultation_type.charAt(0).toUpperCase() + appointment.consultation_type.slice(1)}
                      </p>
                      {appointment.symptoms && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Symptoms:</strong> {appointment.symptoms}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      {appointment.status === 'scheduled' && canJoin && (
                        <button
                          onClick={() => joinWaitingRoom(appointment.appointment_id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Join Now
                        </button>
                      )}
                      {appointment.status === 'scheduled' && !canJoin && (
                        <button
                          onClick={() => cancelAppointment(appointment.appointment_id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No appointments found</p>
        )}
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultation History</h3>
        {(consultationHistory || []).length > 0 ? (
          <div className="space-y-4">
            {(consultationHistory || []).map(consultation => {
              const dateTime = formatDateTime(consultation.consultation_date);
              
              return (
                <div key={consultation.consultation_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{consultation.doctor_name}</h4>
                      <p className="text-sm text-gray-600">{consultation.specialty}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {dateTime.date} at {dateTime.time}
                      </p>
                      <p className="text-sm text-gray-600">
                        Duration: {consultation.duration} minutes
                      </p>
                      {consultation.diagnosis && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                          <p className="text-sm text-gray-600">{consultation.diagnosis}</p>
                        </div>
                      )}
                      {consultation.prescription && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Prescription:</p>
                          <p className="text-sm text-gray-600">{consultation.prescription}</p>
                        </div>
                      )}
                      {consultation.follow_up_needed && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-green-700">Follow-up Required</p>
                          {consultation.follow_up_date && (
                            <p className="text-sm text-gray-600">
                              Follow-up Date: {formatDateTime(consultation.follow_up_date).date}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">${consultation.consultation_fee}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No consultation history found</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Telemedicine Dashboard</h1>
          <p className="text-gray-600">Consult with doctors from the comfort of your home</p>
        </div>

        {/* Analytics */}
        {renderAnalytics()}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'book', name: 'Book Appointment', icon: Calendar },
                { id: 'appointments', name: 'My Appointments', icon: Clock },
                { id: 'history', name: 'Consultation History', icon: Users }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'book' && renderBookingTab()}
          {activeTab === 'appointments' && renderAppointmentsTab()}
          {activeTab === 'history' && renderHistoryTab()}
        </div>
      </div>
    </div>
  );
};

export default TelemedicineDashboard;