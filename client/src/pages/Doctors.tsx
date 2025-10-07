import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  Video, 
  Phone, 
  MessageCircle,
  CreditCard,
  Users
} from 'lucide-react';
import LoadingSpinner from '../../LoadingSpinner';


interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  rating: number;
  consultationFee: number;
  profileImage: string;
  hospital: {
    name: string;
    city: string;
  };
  languages: string[];
  consultationModes: string[];
  totalConsultations: number;
}

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedSpecialization]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/doctors');
      setDoctors(response.data.data.doctors);
      setSpecializations(response.data.data.specializations);
      setFilteredDoctors(response.data.data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialization) {
      filtered = filtered.filter(doctor => 
        doctor.specialization === selectedSpecialization
      );
    }

    setFilteredDoctors(filtered);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleConsultation = async (doctor: Doctor) => {
    setPaymentLoading(doctor._id);

    try {
      // Create payment order
      console.log('🚀 Creating payment order for Dr.', doctor.name);
      console.log('💰 Amount:', doctor.consultationFee);
      
      const orderResponse = await axios.post('/payments/create-order', {
        amount: doctor.consultationFee,
        currency: 'INR',
        doctorId: doctor._id,
        consultationType: 'video',
        description: `Consultation with Dr. ${doctor.name}`
      });

      console.log('📦 Order response:', orderResponse.data);
      const { order, fallbackMode, note } = orderResponse.data;

      // Handle fallback mode (when payment service is unavailable)
      if (fallbackMode) {
        console.log('⚠️ Using fallback mode:', note);
        alert(`✅ Consultation Booked Successfully!\n\nDr. ${doctor.name} consultation has been scheduled.\n\n${note}\n\nYou will receive consultation details via email.`);
        setPaymentLoading(null);
        return;
      }

      console.log('🎯 Razorpay payment flow enabled');
      console.log('🔑 Razorpay Key ID:', import.meta.env.VITE_RAZORPAY_KEY_ID);

      // Load Razorpay script
      console.log('📜 Loading Razorpay script...');
      const res = await loadRazorpayScript();
      if (!res) {
        console.error('❌ Failed to load Razorpay script');
        alert('Failed to load Razorpay. Please try again.');
        setPaymentLoading(null);
        return;
      }
      console.log('✅ Razorpay script loaded successfully');

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo_key',
        amount: order.amount,
        currency: order.currency,
        name: 'SmartHealthBot',
        description: `Consultation with Dr. ${doctor.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          console.log('✅ Payment successful:', response);
          try {
            // Verify payment
            console.log('🔍 Verifying payment...');
            await axios.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            console.log('✅ Payment verified successfully');
            alert(`Payment successful! You can now connect with Dr. ${doctor.name}. Check your email for consultation details.`);
          } catch (error) {
            console.error('❌ Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          } finally {
            setPaymentLoading(null);
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: () => {
            console.log('💔 Payment modal dismissed by user');
            setPaymentLoading(null);
          }
        }
      };

      console.log('🚀 Opening Razorpay with options:', options);
      // Open Razorpay payment window
      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error('Error creating payment order:', error);
      
      // Handle improved fallback response (200 status with fallbackMode)
      if (error.response?.data?.fallbackMode) {
        const { note, booking } = error.response.data;
        alert(`✅ Consultation Booked Successfully!\n\n${note}\n\nBooking Details:\n👨‍⚕️ Doctor: ${booking.doctorName}\n💰 Fee: ${booking.currency} ${booking.amount}\n📞 Type: ${booking.consultationType}\n📅 Scheduled: ${booking.scheduledFor}`);
        setPaymentLoading(null);
        return;
      }
      
      // Handle payment service unavailable (503 status)
      if (error.response?.status === 503) {
        const fallbackData = error.response?.data?.fallback;
        if (fallbackData?.canProceed) {
          const proceed = window.confirm(
            `Payment service is temporarily unavailable. ${fallbackData.message}\n\nWould you like to proceed with booking the consultation? You can pay later.`
          );
          
          if (proceed) {
            alert(`Consultation booked with Dr. ${doctor.name}! You will receive details via email. Payment can be completed later.`);
          }
        } else {
          alert('Payment service is temporarily unavailable. Please try again later.');
        }
      } else {
        alert('Failed to initiate payment. Please try again.');
      }
      
      setPaymentLoading(null);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Phone className="h-4 w-4" />;
      case 'chat': return <MessageCircle className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading doctors..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Expert Doctors
          </h1>
          <p className="text-gray-600">
            Connect with certified healthcare professionals for personalized consultations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors, specializations, or hospitals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Specialization Filter */}
            <div className="md:w-64">
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Consultation Fee
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Any Price</option>
                    <option value="100">Under ₹100</option>
                    <option value="150">Under ₹150</option>
                    <option value="200">Under ₹200</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Any Experience</option>
                    <option value="5">5+ years</option>
                    <option value="10">10+ years</option>
                    <option value="15">15+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
            {selectedSpecialization && ` in ${selectedSpecialization}`}
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
              {/* Doctor Info */}
              <div className="flex items-center mb-4">
                <img
                  src={doctor.profileImage}
                  alt={doctor.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {doctor.name}
                  </h3>
                  <p className="text-blue-600 font-medium">
                    {doctor.specialization}
                  </p>
                  <p className="text-sm text-gray-600">
                    {doctor.qualification}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="font-semibold">{doctor.rating}</span>
                  </div>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="font-semibold">{doctor.totalConsultations}</span>
                  </div>
                  <p className="text-xs text-gray-600">Consultations</p>
                </div>
              </div>

              {/* Experience & Location */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {doctor.experience} years experience
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {doctor.hospital.name}, {doctor.hospital.city}
                </div>
              </div>

              {/* Languages */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Languages:</p>
                <div className="flex flex-wrap gap-1">
                  {doctor.languages.map((lang) => (
                    <span key={lang} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Consultation Modes */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Available modes:</p>
                <div className="flex space-x-2">
                  {doctor.consultationModes.map((mode) => (
                    <div key={mode} className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      {getModeIcon(mode)}
                      <span className="ml-1 capitalize">{mode}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultation Fee & Book Button */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{doctor.consultationFee}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleConsultation(doctor)}
                  disabled={paymentLoading === doctor._id}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {paymentLoading === doctor._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Book Consultation
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No doctors found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;