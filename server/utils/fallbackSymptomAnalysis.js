/**
 * Fallback symptom analysis when AI model is unavailable
 * Provides basic symptom checking and health recommendations
 */

const fallbackSymptomAnalysis = {
  // Common conditions and their symptoms
  conditions: {
    'Common Cold': {
      symptoms: ['runny nose', 'sneezing', 'cough', 'sore throat', 'mild fever'],
      severity: 'Mild',
      description: 'A viral infection affecting the upper respiratory tract.',
      precautions: [
        'Get plenty of rest',
        'Stay hydrated',
        'Use tissues when sneezing or coughing',
        'Wash hands frequently'
      ]
    },
    'Flu': {
      symptoms: ['fever', 'muscle aches', 'fatigue', 'headache', 'cough'],
      severity: 'Moderate',
      description: 'A viral infection that affects the respiratory system.',
      precautions: [
        'Rest and avoid strenuous activities',
        'Stay hydrated',
        'Take fever reducers if needed',
        'Stay home to avoid spreading'
      ]
    },
    'Migraine': {
      symptoms: ['severe headache', 'nausea', 'sensitivity to light', 'dizziness'],
      severity: 'Moderate',
      description: 'A type of headache characterized by severe throbbing pain.',
      precautions: [
        'Rest in a dark, quiet room',
        'Apply cold or hot compress',
        'Stay hydrated',
        'Avoid triggers like stress and certain foods'
      ]
    },
    'Gastroenteritis': {
      symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'fever'],
      severity: 'Moderate',
      description: 'Inflammation of the stomach and intestines.',
      precautions: [
        'Stay hydrated with clear fluids',
        'Rest and avoid solid foods initially',
        'Gradually reintroduce bland foods',
        'Seek medical attention if symptoms persist'
      ]
    },
    'Anxiety': {
      symptoms: ['restlessness', 'rapid heartbeat', 'sweating', 'worry'],
      severity: 'Mild to Moderate',
      description: 'A mental health condition characterized by excessive worry.',
      precautions: [
        'Practice deep breathing exercises',
        'Engage in regular physical activity',
        'Limit caffeine and alcohol',
        'Consider talking to a mental health professional'
      ]
    }
  },

  // Symptom severity mapping
  severityMap: {
    'chest pain': 'High',
    'difficulty breathing': 'High',
    'severe abdominal pain': 'High',
    'high fever': 'High',
    'unconsciousness': 'High',
    'severe headache': 'Moderate',
    'persistent vomiting': 'Moderate',
    'moderate fever': 'Moderate',
    'mild headache': 'Mild',
    'runny nose': 'Mild',
    'fatigue': 'Mild'
  },

  /**
   * Analyze symptoms and provide basic health recommendations
   */
  analyzeSymptoms: function(symptoms) {
    const normalizedSymptoms = symptoms.toLowerCase();
    let matchedCondition = null;
    let maxMatches = 0;

    // Find the condition with the most matching symptoms
    for (const [condition, data] of Object.entries(this.conditions)) {
      const matches = data.symptoms.filter(symptom => 
        normalizedSymptoms.includes(symptom.toLowerCase())
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        matchedCondition = { name: condition, ...data };
      }
    }

    // Determine severity based on symptoms
    let severity = 'Mild';
    for (const [symptom, sev] of Object.entries(this.severityMap)) {
      if (normalizedSymptoms.includes(symptom)) {
        if (sev === 'High') {
          severity = 'High';
          break;
        } else if (sev === 'Moderate' && severity !== 'High') {
          severity = 'Moderate';
        }
      }
    }

    // Emergency warning check
    const emergencySymptoms = [
      'chest pain', 'difficulty breathing', 'unconsciousness', 
      'severe bleeding', 'stroke symptoms', 'heart attack'
    ];
    
    const hasEmergencySymptoms = emergencySymptoms.some(symptom => 
      normalizedSymptoms.includes(symptom)
    );

    return {
      disease: matchedCondition?.name || 'General Health Concern',
      description: matchedCondition?.description || 
        'Based on your symptoms, we recommend consulting with a healthcare professional for proper diagnosis.',
      severity: hasEmergencySymptoms ? 'Emergency' : severity,
      precautions: matchedCondition?.precautions || [
        'Monitor your symptoms',
        'Rest and stay hydrated',
        'Seek medical attention if symptoms worsen',
        'Maintain good hygiene practices'
      ],
      confidence: maxMatches > 0 ? Math.min(maxMatches * 25, 95) : 60,
      emergency: hasEmergencySymptoms,
      disclaimer: 'This is a basic analysis. Please consult a healthcare professional for accurate diagnosis and treatment.'
    };
  },

  /**
   * Get general health recommendations
   */
  getGeneralRecommendations: function() {
    return [
      'Maintain a balanced diet with fruits and vegetables',
      'Exercise regularly (at least 30 minutes a day)',
      'Get adequate sleep (7-9 hours per night)',
      'Stay hydrated by drinking plenty of water',
      'Practice stress management techniques',
      'Schedule regular health check-ups',
      'Avoid smoking and limit alcohol consumption',
      'Wash hands frequently to prevent infections'
    ];
  }
};

module.exports = fallbackSymptomAnalysis;