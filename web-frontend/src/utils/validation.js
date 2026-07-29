// Validation utility functions for the web frontend

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Password must be at least 6 characters
  if (password.length < 3) {
    return { isValid: false, message: "Password must be at least 6 characters long" };
  }
  // Optional: Add more strength requirements
  // if (!/[A-Z]/.test(password)) {
  //   return { isValid: false, message: "Password must contain at least one uppercase letter" };
  // }
  // if (!/[0-9]/.test(password)) {
  //   return { isValid: false, message: "Password must contain at least one number" };
  // }
  return { isValid: true, message: "" };
};

export const validateName = (name) => {
  if (name.trim().length < 2) {
    return { isValid: false, message: "Name must be at least 2 characters long" };
  }
  if (name.trim().length > 50) {
    return { isValid: false, message: "Name must be less than 50 characters" };
  }
  return { isValid: true, message: "" };
};

export const validateNIC = (nic) => {
  // Sri Lankan NIC format: 9 digits + V/v or 12 digits
  const nicRegex = /^(\d{9}[Vv]|\d{12})$/;
  if (!nic) {
    return { isValid: true, message: "" }; // Optional field
  }
  if (!nicRegex.test(nic)) {
    return { isValid: false, message: "Invalid NIC format (e.g., 123456789V or 123456789012)" };
  }
  return { isValid: true, message: "" };
};

export const validateDrivingLicense = (license) => {
  if (!license) {
    return { isValid: true, message: "" }; // Optional field
  }
  if (license.length < 5) {
    return { isValid: false, message: "License number must be at least 5 characters" };
  }
  return { isValid: true, message: "" };
};

export const validatePhoneNumber = (phone) => {
  if (!phone) {
    return { isValid: true, message: "" }; // Optional field
  }
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, message: "Phone number must be 10 digits" };
  }
  return { isValid: true, message: "" };
};

export const validateFile = (file, maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']) => {
  if (!file) {
    return { isValid: false, message: "Please select a file" };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, message: `File must be under ${maxSizeMB}MB` };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: "Only JPEG and PNG images are allowed" };
  }
  
  return { isValid: true, message: "" };
};

export const validateBookingDates = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { isValid: false, message: "Please select both start and end dates" };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (start < today) {
    return { isValid: false, message: "Start date cannot be in the past" };
  }
  
  if (end < start) {
    return { isValid: false, message: "End date must be on or after start date" };
  }
  
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  if (days > 7) {
    return { isValid: false, message: "Maximum booking period is 7 days" };
  }
  
  if (days < 1) {
    return { isValid: false, message: "Booking must be at least 1 day" };
  }
  
  return { isValid: true, message: "", days };
};
