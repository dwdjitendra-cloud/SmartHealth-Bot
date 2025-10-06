export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  age?: boolean;
  password?: boolean;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateForm = (data: Record<string, string>, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((field) => {
    const value = data[field] || '';
    const rule = rules[field];

    // Required validation
    if (rule.required && !value.trim()) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      return;
    }

    // Skip other validations if field is empty and not required
    if (!value.trim() && !rule.required) {
      return;
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.minLength} characters`;
      return;
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${rule.maxLength} characters`;
      return;
    }

    // Email validation
    if (rule.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        errors[field] = 'Please enter a valid email address';
        return;
      }
    }

    // Phone validation
    if (rule.phone) {
      const phonePattern = /^\d{10}$/;
      if (!phonePattern.test(value.replace(/\D/g, ''))) {
        errors[field] = 'Please enter a valid 10-digit phone number';
        return;
      }
    }

    // Age validation
    if (rule.age) {
      const age = parseInt(value);
      if (isNaN(age) || age < 1 || age > 120) {
        errors[field] = 'Please enter a valid age between 1 and 120';
        return;
      }
    }

    // Password validation
    if (rule.password) {
      if (value.length < 8) {
        errors[field] = 'Password must be at least 8 characters long';
        return;
      }
      if (!/(?=.*[a-z])/.test(value)) {
        errors[field] = 'Password must contain at least one lowercase letter';
        return;
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        errors[field] = 'Password must contain at least one uppercase letter';
        return;
      }
      if (!/(?=.*\d)/.test(value)) {
        errors[field] = 'Password must contain at least one number';
        return;
      }
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} format is invalid`;
      return;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });

  return errors;
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove potential XSS
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('At least 8 characters long');
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('One lowercase letter');
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('One uppercase letter');
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push('One number');
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('One special character (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};