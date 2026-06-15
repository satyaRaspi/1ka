import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = import.meta.env.VITE_API_URL || '/api';

const LANG_KEY = 'kgs_lang';
const LANG_CHOICE_VERSION_KEY = 'kgs_lang_choice_v115';
const I18N = {
  kn: {
    'Karnataka Guarantee Schemes Registration Portal': 'ಕರ್ನಾಟಕ ಗ್ಯಾರಂಟಿ ಯೋಜನೆಗಳ ನೋಂದಣಿ ಪೋರ್ಟಲ್',
    'Unified Citizen & Family Registration System': 'ಏಕೀಕೃತ ನಾಗರಿಕ ಮತ್ತು ಕುಟುಂಬ ನೋಂದಣಿ ವ್ಯವಸ್ಥೆ',
    'Public Statistics': 'ಸಾರ್ವಜನಿಕ ಅಂಕಿಅಂಶಗಳು',
    'Logout': 'ಲಾಗ್ ಔಟ್',
    'Portal Login': 'ಪೋರ್ಟಲ್ ಲಾಗಿನ್',
    'Citizen': 'ನಾಗರಿಕ',
    'Admin': 'ನಿರ್ವಾಹಕ',
    'Call Center': 'ಕಾಲ್ ಸೆಂಟರ್',
    'Mobile Number': 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    'OTP': 'ಒಟಿಪಿ',
    'Request OTP': 'ಒಟಿಪಿ ಕೇಳಿ',
    'Login as Citizen': 'ನಾಗರಿಕರಾಗಿ ಲಾಗಿನ್',
    'Login': 'ಲಾಗಿನ್',
    'Username': 'ಬಳಕೆದಾರ ಹೆಸರು',
    'Password': 'ಪಾಸ್‌ವರ್ಡ್',
    'Demo:': 'ಡೆಮೊ:',
    'Welcome': 'ಸ್ವಾಗತ',
    'No application found for this mobile number.': 'ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಯಾವುದೇ ಅರ್ಜಿ ಕಂಡುಬಂದಿಲ್ಲ.',
    'Start Registration': 'ನೋಂದಣಿ ಪ್ರಾರಂಭಿಸಿ',
    'Citizen Dashboard': 'ನಾಗರಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'Application Number': 'ಅರ್ಜಿ ಸಂಖ್ಯೆ',
    'Status': 'ಸ್ಥಿತಿ',
    'Selected Schemes': 'ಆಯ್ಕೆ ಮಾಡಿದ ಯೋಜನೆಗಳು',
    'Family Members': 'ಕುಟುಂಬ ಸದಸ್ಯರು',
    'Continue / Edit Registration': 'ನೋಂದಣಿ ಮುಂದುವರಿಸಿ / ತಿದ್ದುಪಡಿ ಮಾಡಿ',
    'View Registration': 'ನೋಂದಣಿ ವೀಕ್ಷಿಸಿ',
    'Application View Only': 'ಅರ್ಜಿಯ ವೀಕ್ಷಣೆ ಮಾತ್ರ',
    'This application is currently locked for editing. You can view it now, but changes are allowed only if the application is returned for correction by the department.': 'ಈ ಅರ್ಜಿ ಪ್ರಸ್ತುತ ತಿದ್ದುಪಡಿಗೆ ಲಾಕ್ ಆಗಿದೆ. ನೀವು ಇದನ್ನು ಈಗ ವೀಕ್ಷಿಸಬಹುದು, ಆದರೆ ಇಲಾಖೆ ತಿದ್ದುಪಡಿಗೆ ಹಿಂತಿರುಗಿಸಿದರೆ ಮಾತ್ರ ಬದಲಾವಣೆಗಳನ್ನು ಮಾಡಲು ಅನುಮತಿ ಇದೆ.',
    'Edit is enabled because this application is in Draft or Returned for Correction status.': 'ಈ ಅರ್ಜಿ ಕರಡು ಅಥವಾ ತಿದ್ದುಪಡಿಗೆ ಹಿಂತಿರುಗಿಸಲಾಗಿದೆ ಸ್ಥಿತಿಯಲ್ಲಿರುವುದರಿಂದ ತಿದ್ದುಪಡಿ ಸಕ್ರಿಯವಾಗಿದೆ.',
    'Applicant Details': 'ಅರ್ಜಿದಾರರ ವಿವರಗಳು',
    'Address Details': 'ವಿಳಾಸ ವಿವರಗಳು',
    'Scheme Details': 'ಯೋಜನೆ ವಿವರಗಳು',
    'View Status & Eligibility': 'ಸ್ಥಿತಿ ಮತ್ತು ಅರ್ಹತೆ ವೀಕ್ಷಿಸಿ',
    'Download Acknowledgement': 'ಸ್ವೀಕೃತಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    'My Data & Privacy Rights': 'ನನ್ನ ಡೇಟಾ ಮತ್ತು ಗೌಪ್ಯತೆ ಹಕ್ಕುಗಳು',
    'Privacy Notice and Consent Intimation': 'ಗೌಪ್ಯತೆ ಸೂಚನೆ ಮತ್ತು ಸಮ್ಮತಿ ಮಾಹಿತಿ',
    'This prototype collects citizen and family details for scheme registration, eligibility assessment, audit, grievance handling and aggregated reporting. Aadhaar verification is simulated; real eKYC is not enabled.': 'ಈ ಪ್ರೋಟೋಟೈಪ್ ಯೋಜನೆ ನೋಂದಣಿ, ಅರ್ಹತಾ ಮೌಲ್ಯಮಾಪನ, ಆಡಿಟ್, ದೂರು ನಿರ್ವಹಣೆ ಮತ್ತು ಸಂಯೋಜಿತ ವರದಿಗಾಗಿ ನಾಗರಿಕ ಮತ್ತು ಕುಟುಂಬ ವಿವರಗಳನ್ನು ಸಂಗ್ರಹಿಸುತ್ತದೆ. ಆಧಾರ್ ಪರಿಶೀಲನೆ ಅನುಕರಿಸಲಾಗಿದೆ; ನಿಜವಾದ eKYC ಸಕ್ರಿಯವಾಗಿಲ್ಲ.',
    'Public statistics are aggregated and do not expose personal information.': 'ಸಾರ್ವಜನಿಕ ಅಂಕಿಅಂಶಗಳು ಸಂಯೋಜಿತವಾಗಿದ್ದು ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ಬಹಿರಂಗಪಡಿಸುವುದಿಲ್ಲ.',
    'I Understand, Continue': 'ನಾನು ಅರ್ಥ ಮಾಡಿಕೊಂಡಿದ್ದೇನೆ, ಮುಂದುವರಿಸಿ',
    'Primary Applicant Details': 'ಮುಖ್ಯ ಅರ್ಜಿದಾರರ ವಿವರಗಳು',
    'Full Name': 'ಪೂರ್ಣ ಹೆಸರು',
    'Gender': 'ಲಿಂಗ',
    'Date of Birth': 'ಜನ್ಮ ದಿನಾಂಕ',
    'Age': 'ವಯಸ್ಸು',
    'Auto-calculated from DOB': 'ಜನ್ಮ ದಿನಾಂಕದಿಂದ ಸ್ವಯಂ ಲೆಕ್ಕಿಸಲಾಗಿದೆ',
    'Mobile': 'ಮೊಬೈಲ್',
    'Alternate Mobile': 'ಪರ್ಯಾಯ ಮೊಬೈಲ್',
    'Email': 'ಇಮೇಲ್',
    'Aadhaar Number': 'ಆಧಾರ್ ಸಂಖ್ಯೆ',
    'Aadhaar': 'ಆಧಾರ್',
    'Aadhaar Name': 'ಆಧಾರ್‌ನಲ್ಲಿರುವ ಹೆಸರು',
    'Aadhaar-linked Mobile': 'ಆಧಾರ್‌ಗೆ ಲಿಂಕ್ ಮಾಡಿದ ಮೊಬೈಲ್',
    'Ration Card': 'ರೇಷನ್ ಕಾರ್ಡ್',
    'Voter ID': 'ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ',
    'Caste / Category': 'ಜಾತಿ / ವರ್ಗ',
    'Marital Status': 'ವೈವಾಹಿಕ ಸ್ಥಿತಿ',
    'Occupation': 'ವೃತ್ತಿ',
    'Annual Income': 'ವಾರ್ಷಿಕ ಆದಾಯ',
    'Bank Holder Name': 'ಬ್ಯಾಂಕ್ ಖಾತೆದಾರರ ಹೆಸರು',
    'Bank Name': 'ಬ್ಯಾಂಕ್ ಹೆಸರು',
    'Branch': 'ಶಾಖೆ',
    'IFSC': 'IFSC',
    'Bank Account Number': 'ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆ',
    'Save and Continue': 'ಉಳಿಸಿ ಮುಂದುವರಿಸಿ',
    'Present Address': 'ಪ್ರಸ್ತುತ ವಿಳಾಸ',
    'House / Building': 'ಮನೆ / ಕಟ್ಟಡ',
    'Street / Locality': 'ರಸ್ತೆ / ಪ್ರದೇಶ',
    'Ward No': 'ವಾರ್ಡ್ ಸಂಖ್ಯೆ',
    'Village / Town / City': 'ಗ್ರಾಮ / ಪಟ್ಟಣ / ನಗರ',
    'Gram Panchayat / Municipality': 'ಗ್ರಾಮ ಪಂಚಾಯತ್ / ಪುರಸಭೆ',
    'Taluk': 'ತಾಲ್ಲೂಕು',
    'District': 'ಜಿಲ್ಲೆ',
    'State': 'ರಾಜ್ಯ',
    'PIN Code': 'ಪಿನ್ ಕೋಡ್',
    'Landmark': 'ಗುರುತು ಸ್ಥಳ',
    'Same as Aadhaar Address?': 'ಆಧಾರ್ ವಿಳಾಸದಂತೆ ಇದೆಯೇ?',
    'Residence Type': 'ನಿವಾಸ ಪ್ರಕಾರ',
    'Electricity Consumer No': 'ವಿದ್ಯುತ್ ಗ್ರಾಹಕ ಸಂಖ್ಯೆ',
    'LPG / Ration Shop': 'ಎಲ್‌ಪಿಜಿ / ರೇಷನ್ ಅಂಗಡಿ',
    'Immediate Family Details': 'ತಕ್ಷಣದ ಕುಟುಂಬ ವಿವರಗಳು',
    'Relationship': 'ಸಂಬಂಧ',
    'Education': 'ಶಿಕ್ಷಣ',
    'Dependent?': 'ಅವಲಂಬಿತರೇ?',
    'Already receiving benefit?': 'ಈಗಾಗಲೇ ಪ್ರಯೋಜನ ಪಡೆಯುತ್ತಿದೆಯೇ?',
    'Parent/guardian declaration confirmed for minor family member': 'ಅಪ್ರಾಪ್ತ ಕುಟುಂಬ ಸದಸ್ಯರಿಗೆ ಪಾಲಕರು/ರಕ್ಷಕರ ಘೋಷಣೆ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    'Add Family Member': 'ಕುಟುಂಬ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ',
    'Continue': 'ಮುಂದುವರಿಸಿ',
    'Scheme Selection': 'ಯೋಜನೆ ಆಯ್ಕೆ',
    'Selected': 'ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ',
    'Tap to select': 'ಆಯ್ಕೆ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    'Eligibility detail / reference number': 'ಅರ್ಹತಾ ವಿವರ / ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ',
    'Review and Submit': 'ಪರಿಶೀಲಿಸಿ ಸಲ್ಲಿಸಿ',
    'Applicant:': 'ಅರ್ಜಿದಾರ:',
    'Address:': 'ವಿಳಾಸ:',
    'Schemes:': 'ಯೋಜನೆಗಳು:',
    'I confirm the information is true and consent to its use for eligibility assessment and registration.': 'ಮಾಹಿತಿ ಸತ್ಯವೆಂದು ದೃಢೀಕರಿಸುತ್ತೇನೆ ಮತ್ತು ಅರ್ಹತಾ ಮೌಲ್ಯಮಾಪನ ಹಾಗೂ ನೋಂದಣಿಗಾಗಿ ಬಳಸಲು ಸಮ್ಮತಿಸುತ್ತೇನೆ.',
    'Register Application': 'ಅರ್ಜಿಯನ್ನು ನೋಂದಾಯಿಸಿ',
    'Application Status & Scheme Eligibility': 'ಅರ್ಜಿ ಸ್ಥಿತಿ ಮತ್ತು ಯೋಜನೆ ಅರ್ಹತೆ',
    'Current Status': 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ',
    'Aadhaar Batch Verification': 'ಆಧಾರ್ ಬ್ಯಾಚ್ ಪರಿಶೀಲನೆ',
    'Not Started': 'ಪ್ರಾರಂಭವಾಗಿಲ್ಲ',
    'Workflow': 'ಕಾರ್ಯಪ್ರವಾಹ',
    'Scheme-wise Approval and Eligibility': 'ಯೋಜನೆವಾರು ಅನುಮೋದನೆ ಮತ್ತು ಅರ್ಹತೆ',
    'Eligibility:': 'ಅರ್ಹತೆ:',
    'Eligibility decision is pending.': 'ಅರ್ಹತಾ ನಿರ್ಧಾರ ಬಾಕಿಯಿದೆ.',
    'Back': 'ಹಿಂದೆ',
    'Admin Dashboard': 'ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'Admin Analytics': 'ನಿರ್ವಾಹಕ ವಿಶ್ಲೇಷಣೆ',
    'Application Management': 'ಅರ್ಜಿ ನಿರ್ವಹಣೆ',
    'Citizen Application View': 'ನಾಗರಿಕ ಅರ್ಜಿ ವೀಕ್ಷಣೆ',
    'Search': 'ಹುಡುಕಿ',
    'All Statuses': 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು',
    'All Districts': 'ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು',
    'All Schemes': 'ಎಲ್ಲಾ ಯೋಜನೆಗಳು',
    'Run Batch Aadhaar Verification': 'ಬ್ಯಾಚ್ ಆಧಾರ್ ಪರಿಶೀಲನೆ ಚಾಲನೆ ಮಾಡಿ',
    'Export CSV': 'CSV ರಫ್ತು',
    'Application': 'ಅರ್ಜಿ',
    'Name': 'ಹೆಸರು',
    'Schemes': 'ಯೋಜನೆಗಳು',
    'Action': 'ಕ್ರಿಯೆ',
    'Open': 'ತೆರೆಯಿರಿ',
    'Reports': 'ವರದಿಗಳು',
    'Compliance Dashboard': 'ಅನುಪಾಲನೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'Audit Logs': 'ಆಡಿಟ್ ಲಾಗ್‌ಗಳು',
    'Settings / Master Data': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು / ಮಾಸ್ಟರ್ ಡೇಟಾ',
    'Karnataka Guarantee Schemes': 'ಕರ್ನಾಟಕ ಗ್ಯಾರಂಟಿ ಯೋಜನೆಗಳು',
    'Public Enrollment Statistics': 'ಸಾರ್ವಜನಿಕ ನೋಂದಣಿ ಅಂಕಿಅಂಶಗಳು',
    'Aggregated public dashboard': 'ಸಂಯೋಜಿತ ಸಾರ್ವಜನಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'Transparent enrollment view for Karnataka’s 5 Guarantee Schemes': 'ಕರ್ನಾಟಕದ 5 ಗ್ಯಾರಂಟಿ ಯೋಜನೆಗಳ ಪಾರದರ್ಶಕ ನೋಂದಣಿ ನೋಟ',
    'Overall Approval Rate': 'ಒಟ್ಟು ಅನುಮೋದನೆ ದರ',
    'Explore Statistics': 'ಅಂಕಿಅಂಶಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    'Filter by district or scheme': 'ಜಿಲ್ಲೆ ಅಥವಾ ಯೋಜನೆಯ ಆಧಾರದ ಮೇಲೆ ಫಿಲ್ಟರ್ ಮಾಡಿ',
    'Apply Filters': 'ಫಿಲ್ಟರ್ ಅನ್ವಯಿಸಿ',
    'Total Registrations': 'ಒಟ್ಟು ನೋಂದಣಿಗಳು',
    'Registered': 'ನೋಂದಾಯಿಸಲಾಗಿದೆ',
    'Under Review': 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ',
    'Approved': 'ಅನುಮೋದಿಸಲಾಗಿದೆ',
    'Rejected': 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
    'Scheme Enrollment Share': 'ಯೋಜನೆ ನೋಂದಣಿ ಹಂಚಿಕೆ',
    'Scheme-wise count of applications received.': 'ಸ್ವೀಕರಿಸಿದ ಅರ್ಜಿಗಳ ಯೋಜನೆವಾರು ಸಂಖ್ಯೆ.',
    'District Coverage': 'ಜಿಲ್ಲಾವಾರು ವ್ಯಾಪ್ತಿ',
    'District-wise participation across the portal.': 'ಪೋರ್ಟಲ್‌ನಲ್ಲಿನ ಜಿಲ್ಲಾವಾರು ಭಾಗವಹಿಸುವಿಕೆ.',
    'Application Pipeline': 'ಅರ್ಜಿ ಪೈಪ್‌ಲೈನ್',
    'Registered applications move to batch Aadhaar verification and then eligibility review.': 'ನೋಂದಾಯಿತ ಅರ್ಜಿಗಳು ಬ್ಯಾಚ್ ಆಧಾರ್ ಪರಿಶೀಲನೆಗೆ ಮತ್ತು ನಂತರ ಅರ್ಹತಾ ಪರಿಶೀಲನೆಗೆ ಸಾಗುತ್ತವೆ.',
    'Daily Trend': 'ದೈನಂದಿನ ಪ್ರವೃತ್ತಿ',
    'Registrations over time.': 'ಕಾಲಕ್ರಮೇಣ ನೋಂದಣಿಗಳು.',
    'Privacy note:': 'ಗೌಪ್ಯತೆ ಸೂಚನೆ:',
    'No data': 'ಡೇಟಾ ಇಲ್ಲ',
    'Not specified': 'ನಿರ್ದಿಷ್ಟಪಡಿಸಲಾಗಿಲ್ಲ',
    'Loading…': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
    'Language': 'ಭಾಷೆ',
    'Choose Language': 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    'Default language: Kannada': 'ಡೀಫಾಲ್ಟ್ ಭಾಷೆ: ಕನ್ನಡ',
    'Change to English anytime': 'ಯಾವಾಗ ಬೇಕಾದರೂ English ಗೆ ಬದಲಾಯಿಸಬಹುದು',
    'Select your role and continue': 'ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ಮುಂದುವರಿಸಿ',
    'Secure access for citizen registration, admin review and call center support.': 'ನಾಗರಿಕ ನೋಂದಣಿ, ನಿರ್ವಾಹಕ ಪರಿಶೀಲನೆ ಮತ್ತು ಕಾಲ್ ಸೆಂಟರ್ ಸಹಾಯಕ್ಕಾಗಿ ಸುರಕ್ಷಿತ ಪ್ರವೇಶ.',
    'Default login opens in Kannada. You can switch to English anytime.': 'ಲಾಗಿನ್ ಪುಟವು ಡೀಫಾಲ್ಟ್ ಆಗಿ ಕನ್ನಡದಲ್ಲಿ ತೆರೆಯುತ್ತದೆ. ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ English ಗೆ ಬದಲಾಯಿಸಬಹುದು.',
    'English': 'English',
    'Kannada': 'ಕನ್ನಡ',
    'Select': 'ಆಯ್ಕೆಮಾಡಿ',
    'Dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'Applications': 'ಅರ್ಜಿಗಳು',
    'Approval Scan': 'ಅನುಮೋದನೆ ಸ್ಕ್ಯಾನ್',
    'Approval Proposal Scan': 'ಅನುಮೋದನೆ ಪ್ರಸ್ತಾವ ಸ್ಕ್ಯಾನ್',
    'Run Approval Proposal Scan': 'ಅನುಮೋದನೆ ಪ್ರಸ್ತಾವ ಸ್ಕ್ಯಾನ್ ಚಾಲನೆ ಮಾಡಿ',
    'Apply Proposal': 'ಪ್ರಸ್ತಾವ ಅನ್ವಯಿಸಿ',
    'Approval proposal scan completed': 'ಅನುಮೋದನೆ ಪ್ರಸ್ತಾವ ಸ್ಕ್ಯಾನ್ ಪೂರ್ಣಗೊಂಡಿದೆ',
    'Approval proposal applied': 'ಅನುಮೋದನೆ ಪ್ರಸ್ತಾವ ಅನ್ವಯಿಸಲಾಗಿದೆ',
    'Rule Engine': 'ನಿಯಮ ಎಂಜಿನ್',
    'Proposal Records': 'ಪ್ರಸ್ತಾವ ದಾಖಲೆಗಳು',
    'Previous Proposals': 'ಹಿಂದಿನ ಪ್ರಸ್ತಾವಗಳು',
    'Proposal No': 'ಪ್ರಸ್ತಾವ ಸಂಖ್ಯೆ',
    'Proposed Approval': 'ಪ್ರಸ್ತಾಪಿತ ಅನುಮೋದನೆ',
    'Proposed Approved': 'ಪ್ರಸ್ತಾಪಿತ ಅನುಮೋದಿತ',
    'Proposed Rejected': 'ಪ್ರಸ್ತಾಪಿತ ತಿರಸ್ಕೃತ',
    'Proposed On Hold': 'ಪ್ರಸ್ತಾಪಿತ ತಡೆಹಿಡಿದಿದೆ',
    'Total Proposal Items': 'ಒಟ್ಟು ಪ್ರಸ್ತಾವ ಅಂಶಗಳು',
    'Monthly Electricity Usage Upload': 'ಮಾಸಿಕ ವಿದ್ಯುತ್ ಬಳಕೆ ಅಪ್‌ಲೋಡ್',
    'Ration Card BPL/APL Upload': 'ರೇಷನ್ ಕಾರ್ಡ್ BPL/APL ಅಪ್‌ಲೋಡ್',
    'Mass Upload Electricity Usage': 'ವಿದ್ಯುತ್ ಬಳಕೆ ಸಾಮೂಹಿಕ ಅಪ್‌ಲೋಡ್',
    'Mass Upload Ration Cards': 'ರೇಷನ್ ಕಾರ್ಡ್ ಸಾಮೂಹಿಕ ಅಪ್‌ಲೋಡ್',
    'Consumer No': 'ಗ್ರಾಹಕ ಸಂಖ್ಯೆ',
    'Month': 'ತಿಂಗಳು',
    'Units': 'ಯೂನಿಟ್‌ಗಳು',
    'Card Type': 'ಕಾರ್ಡ್ ಪ್ರಕಾರ',
    'Household Size': 'ಕುಟುಂಬ ಗಾತ್ರ',
    'Rule': 'ನಿಯಮ',
    'Reason': 'ಕಾರಣ',
    'Items': 'ಅಂಶಗಳು',
    'Created At': 'ರಚಿಸಿದ ಸಮಯ',
    'Applied At': 'ಅನ್ವಯಿಸಿದ ಸಮಯ',
    'Analytics': 'ವಿಶ್ಲೇಷಣೆ',
    'Compliance': 'ಅನುಪಾಲನೆ',
    'Audit': 'ಆಡಿಟ್',
    'Master': 'ಮಾಸ್ಟರ್',
    'Public Statistics': 'ಸಾರ್ವಜನಿಕ ಅಂಕಿಅಂಶಗಳು',
    'Generated with masked Aadhaar and bank details by default.': 'ಆಧಾರ್ ಮತ್ತು ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಡೀಫಾಲ್ಟ್ ಆಗಿ ಮಾಸ್ಕ್ ಮಾಡಿ ರಚಿಸಲಾಗಿದೆ.',
    'JSON': 'JSON', 'CSV': 'CSV', 'Excel': 'Excel', 'PDF/Text': 'PDF/ಪಠ್ಯ',
    'Correction': 'ತಿದ್ದುಪಡಿ', 'Update': 'ನವೀಕರಣ', 'Grievance': 'ದೂರು', 'Deletion request where legally permitted': 'ಕಾನೂನಿನಂತೆ ಅನುಮತಿಸಿದಲ್ಲಿ ಅಳಿಸುವ ವಿನಂತಿ',
    'Describe your request': 'ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ವಿವರಿಸಿ',
    'Submit Privacy Request': 'ಗೌಪ್ಯತೆ ವಿನಂತಿ ಸಲ್ಲಿಸಿ',
    'Submit Grievance': 'ದೂರು ಸಲ್ಲಿಸಿ',
    'Application:': 'ಅರ್ಜಿ:',
    'Aadhaar is stored and displayed in masked form in this prototype.': 'ಈ ಪ್ರೋಟೋಟೈಪ್‌ನಲ್ಲಿ ಆಧಾರ್ ಅನ್ನು ಮಾಸ್ಕ್ ರೂಪದಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತದೆ.',
    'A mobile-first registration portal prototype for Gruha Jyothi, Gruha Lakshmi, Anna Bhagya, Yuva Nidhi and Shakti Scheme.': 'ಗೃಹ ಜ್ಯೋತಿ, ಗೃಹ ಲಕ್ಷ್ಮಿ, ಅನ್ನ ಭಾಗ್ಯ, ಯುವ ನಿಧಿ ಮತ್ತು ಶಕ್ತಿ ಯೋಜನೆಗಳಿಗೆ ಮೊಬೈಲ್-ಮೊದಲು ನೋಂದಣಿ ಪೋರ್ಟಲ್ ಪ್ರೋಟೋಟೈಪ್.',
    'Call Center Comments': 'ಕಾಲ್ ಸೆಂಟರ್ ಟಿಪ್ಪಣಿಗಳು',
    'Pending SLA': 'ಬಾಕಿ SLA',
    'Privacy Requests': 'ಗೌಪ್ಯತೆ ವಿನಂತಿಗಳು',
    'Open Grievances': 'ಮುಕ್ತ ದೂರುಗಳು',
    'Status Distribution': 'ಸ್ಥಿತಿ ವಿತರಣೆ',
    'Scheme-wise Enrollment': 'ಯೋಜನೆವಾರು ನೋಂದಣಿ',
    'District-wise Enrollment': 'ಜಿಲ್ಲಾವಾರು ನೋಂದಣಿ',
    'Gender-wise Applicants': 'ಲಿಂಗವಾರು ಅರ್ಜಿದಾರರು',
    'Daily Registration Trend': 'ದೈನಂದಿನ ನೋಂದಣಿ ಪ್ರವೃತ್ತಿ',
    'Search name, mobile, app no, Aadhaar last 4': 'ಹೆಸರು, ಮೊಬೈಲ್, ಅರ್ಜಿ ಸಂಖ್ಯೆ, ಆಧಾರ್ ಕೊನೆಯ 4 ಅಂಕೆಗಳು ಹುಡುಕಿ',
    'Batch Aadhaar verification': 'ಬ್ಯಾಚ್ ಆಧಾರ್ ಪರಿಶೀಲನೆ',
    'Close': 'ಮುಚ್ಚಿ',
    'Bank': 'ಬ್ಯಾಂಕ್',
    'Address': 'ವಿಳಾಸ',
    'Schemes, Eligibility and Approval Status': 'ಯೋಜನೆಗಳು, ಅರ್ಹತೆ ಮತ್ತು ಅನುಮೋದನೆ ಸ್ಥಿತಿ',
    'Admin Status Action': 'ನಿರ್ವಾಹಕ ಸ್ಥಿತಿ ಕ್ರಿಯೆ',
    'Remarks': 'ಟಿಪ್ಪಣಿಗಳು',
    'Update Status': 'ಸ್ಥಿತಿ ನವೀಕರಿಸಿ',
    'View Sensitive Data': 'ಸೂಕ್ಷ್ಮ ಡೇಟಾ ವೀಕ್ಷಿಸಿ',
    'Comments': 'ಟಿಪ್ಪಣಿಗಳು',
    'Add call center/admin comment': 'ಕಾಲ್ ಸೆಂಟರ್/ನಿರ್ವಾಹಕ ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ',
    'Add Comment': 'ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ',
    'Status History': 'ಸ್ಥಿತಿ ಇತಿಹಾಸ',
    'Save Scheme Status': 'ಯೋಜನೆ ಸ್ಥಿತಿ ಉಳಿಸಿ',
    'Eligibility / approval remarks': 'ಅರ್ಹತೆ / ಅನುಮೋದನೆ ಟಿಪ್ಪಣಿಗಳು',
    'No application found.': 'ಯಾವುದೇ ಅರ್ಜಿ ಕಂಡುಬಂದಿಲ್ಲ.',
    'Privacy': 'ಗೌಪ್ಯತೆ', 'Applicant': 'ಅರ್ಜಿದಾರ', 'Family': 'ಕುಟುಂಬ', 'Review': 'ಪರಿಶೀಲನೆ',
    'Reason:': 'ಕಾರಣ:', 'Awaiting scheme review': 'ಯೋಜನೆ ಪರಿಶೀಲನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ',
    'registered application(s) moved to Under Review after batch Aadhaar verification': 'ನೋಂದಾಯಿತ ಅರ್ಜಿ(ಗಳು) ಬ್ಯಾಚ್ ಆಧಾರ್ ಪರಿಶೀಲನೆಯ ನಂತರ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ ಸ್ಥಿತಿಗೆ ಸಾಗಿವೆ',
    'Status updated': 'ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ', 'Comment added': 'ಟಿಪ್ಪಣಿ ಸೇರಿಸಲಾಗಿದೆ', 'Scheme eligibility and approval status updated': 'ಯೋಜನೆ ಅರ್ಹತೆ ಮತ್ತು ಅನುಮೋದನೆ ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ',
    'Applicant details saved': 'ಅರ್ಜಿದಾರರ ವಿವರಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ', 'Address saved': 'ವಿಳಾಸ ಉಳಿಸಲಾಗಿದೆ', 'Family member added': 'ಕುಟುಂಬ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಲಾಗಿದೆ', 'Scheme selections saved': 'ಯೋಜನೆ ಆಯ್ಕೆಗಳು ಉಳಿಸಲಾಗಿದೆ', 'Application registered': 'ಅರ್ಜಿಯನ್ನು ನೋಂದಾಯಿಸಲಾಗಿದೆ',
    'Time': 'ಸಮಯ', 'Role': 'ಪಾತ್ರ', 'Record': 'ದಾಖಲೆ', 'Retention Policy': 'ಧಾರಣೆ ನೀತಿ', 'Data Field Registry': 'ಡೇಟಾ ಕ್ಷೇತ್ರ ನೋಂದಣಿ',
    'Privacy request submitted': 'ಗೌಪ್ಯತೆ ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ', 'Grievance submitted': 'ದೂರು ಸಲ್ಲಿಸಲಾಗಿದೆ',
    'No personal citizen information, Aadhaar details, mobile numbers, addresses, or bank details are displayed.': 'ವೈಯಕ್ತಿಕ ನಾಗರಿಕ ಮಾಹಿತಿ, ಆಧಾರ್ ವಿವರಗಳು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗಳು, ವಿಳಾಸಗಳು ಅಥವಾ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಪ್ರದರ್ಶಿಸಲಾಗುವುದಿಲ್ಲ.',
    'Last updated:': 'ಕೊನೆಯ ನವೀಕರಣ:', 'approved of': 'ಅನುಮೋದಿಸಲಾಗಿದೆ /', 'registrations': 'ನೋಂದಣಿಗಳು',
    'Small-count suppression should be increased for production deployment where re-identification risk exists.': 'ಉತ್ಪಾದನಾ ನಿಯೋಜನೆಯಲ್ಲಿ ಮರು-ಗುರುತಿಸುವ ಅಪಾಯ ಇರುವಲ್ಲಿ ಸಣ್ಣ ಸಂಖ್ಯೆಯ ದಮನವನ್ನು ಹೆಚ್ಚಿಸಬೇಕು.',
    'Open Details': 'ವಿವರಗಳನ್ನು ತೆರೆಯಿರಿ',
    'Compliance Records': 'ಅನುಪಾಲನೆ ದಾಖಲೆಗಳು',
    'Back to Compliance Dashboard': 'ಅನುಪಾಲನೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ',
    'No records found': 'ಯಾವುದೇ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    'Download started': 'ಡೌನ್‌ಲೋಡ್ ಪ್ರಾರಂಭವಾಗಿದೆ',
    'Click any tile to open related details': 'ಸಂಬಂಧಿತ ವಿವರಗಳನ್ನು ತೆರೆಯಲು ಯಾವುದೇ ಟೈಲ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ',
    'Report Preview': 'ವರದಿ ಪೂರ್ವವೀಕ್ಷಣೆ',
    'Back to Reports': 'ವರದಿಗಳಿಗೆ ಹಿಂದಿರುಗಿ',
    'Related details': 'ಸಂಬಂಧಿತ ವಿವರಗಳು',
    'Demo Data': 'ಡೆಮೊ ಡೇಟಾ',
    'Mass Test Demo Data': 'ಸಾಮೂಹಿಕ ಪರೀಕ್ಷಾ ಡೆಮೊ ಡೇಟಾ',
    'Generate Demo Data': 'ಡೆಮೊ ಡೇಟಾ ರಚಿಸಿ',
    'Clear existing demo data first': 'ಹಳೆಯ ಡೆಮೊ ಡೇಟಾವನ್ನು ಮೊದಲು ತೆರವುಗೊಳಿಸಿ',
    'Include electricity and ration reference data': 'ವಿದ್ಯುತ್ ಮತ್ತು ರೇಷನ್ ಉಲ್ಲೇಖ ಡೇಟಾವನ್ನು ಸೇರಿಸಿ',
    'Number of demo applications': 'ಡೆಮೊ ಅರ್ಜಿಗಳ ಸಂಖ್ಯೆ',
    'Generate varied demo applications': 'ವೈವಿಧ್ಯಮಯ ಡೆಮೊ ಅರ್ಜಿಗಳನ್ನು ರಚಿಸಿ',
    'Demo data generated': 'ಡೆಮೊ ಡೇಟಾ ರಚಿಸಲಾಗಿದೆ',
    'Clear Demo Data': 'ಡೆಮೊ ಡೇಟಾ ತೆರವುಗೊಳಿಸಿ',
    'Demo data cleared': 'ಡೆಮೊ ಡೇಟಾ ತೆರವುಗೊಳಿಸಲಾಗಿದೆ',
    'Demo Summary': 'ಡೆಮೊ ಸಾರಾಂಶ',
    'Applications Created': 'ರಚಿಸಲಾದ ಅರ್ಜಿಗಳು',
    'Electricity Reference Rows': 'ವಿದ್ಯುತ್ ಉಲ್ಲೇಖ ಸಾಲುಗಳು',
    'Ration Reference Rows': 'ರೇಷನ್ ಉಲ್ಲೇಖ ಸಾಲುಗಳು',
    'Scenario Coverage': 'ಬಳಕೆ ಪ್ರಕರಣ ವ್ಯಾಪ್ತಿ',
    'Batch History': 'ಬ್ಯಾಚ್ ಇತಿಹಾಸ',
    'Batch ID': 'ಬ್ಯಾಚ್ ಐಡಿ',
    'First Created': 'ಮೊದಲ ರಚನೆ',
    'Last Created': 'ಕೊನೆಯ ರಚನೆ',
    'After generating demo data, run Approval Proposal Scan to see rule-based approvals and analytics.': 'ಡೆಮೊ ಡೇಟಾ ರಚಿಸಿದ ನಂತರ, ನಿಯಮಾಧಾರಿತ ಅನುಮೋದನೆಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆಯನ್ನು ನೋಡಲು ಅನುಮೋದನೆ ಪ್ರಸ್ತಾವ ಸ್ಕ್ಯಾನ್ ಚಾಲನೆ ಮಾಡಿ.',
    'Varied cases include duplicate same-address families, eldest-female Gruha Lakshmi cases, electricity under/over 200 units, BPL/APL ration cards, graduates/non-graduates and missing-data review cases.': 'ವೈವಿಧ್ಯಮಯ ಪ್ರಕರಣಗಳಲ್ಲಿ ಒಂದೇ ವಿಳಾಸದ ಕುಟುಂಬಗಳು, ಹಿರಿಯ ಮಹಿಳೆ ಗೃಹ ಲಕ್ಷ್ಮಿ ಪ್ರಕರಣಗಳು, 200 ಯೂನಿಟ್‌ಗಿಂತ ಕಡಿಮೆ/ಹೆಚ್ಚಿನ ವಿದ್ಯುತ್ ಬಳಕೆ, BPL/APL ರೇಷನ್ ಕಾರ್ಡ್‌ಗಳು, ಪದವೀಧರ/ಪದವೀಧರರಲ್ಲದವರು ಮತ್ತು ಡೇಟಾ ಕೊರತೆ ಪರಿಶೀಲನಾ ಪ್ರಕರಣಗಳು ಸೇರಿವೆ.',
    'Tile selected': 'ಟೈಲ್ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ'
  }
};
const VALUE_TRANSLATIONS = {
  kn: {
    'Gruha Jyothi': 'ಗೃಹ ಜ್ಯೋತಿ', 'Gruha Lakshmi': 'ಗೃಹ ಲಕ್ಷ್ಮಿ', 'Anna Bhagya': 'ಅನ್ನ ಭಾಗ್ಯ', 'Yuva Nidhi': 'ಯುವ ನಿಧಿ', 'Shakti Scheme': 'ಶಕ್ತಿ ಯೋಜನೆ',
    'Draft': 'ಕರಡು', 'Registered': 'ನೋಂದಾಯಿಸಲಾಗಿದೆ', 'Under Review': 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ', 'Returned for Correction': 'ತಿದ್ದುಪಡಿಗೆ ಹಿಂತಿರುಗಿಸಲಾಗಿದೆ', 'Approved': 'ಅನುಮೋದಿಸಲಾಗಿದೆ', 'Rejected': 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ', 'On Hold': 'ತಡೆಹಿಡಿಯಲಾಗಿದೆ',
    'Eligibility Under Review': 'ಅರ್ಹತೆ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ', 'Eligible': 'ಅರ್ಹ', 'Not Eligible': 'ಅರ್ಹರಲ್ಲ', 'Correction Required': 'ತಿದ್ದುಪಡಿ ಅಗತ್ಯ', 'Pending Scheme Approval': 'ಯೋಜನೆ ಅನುಮೋದನೆ ಬಾಕಿ',
    'Male': 'ಪುರುಷ', 'Female': 'ಮಹಿಳೆ', 'Other': 'ಇತರೆ', 'Prefer not to say': 'ಹೇಳಲು ಇಷ್ಟವಿಲ್ಲ',
    'Single': 'ಅವಿವಾಹಿತ', 'Married': 'ವಿವಾಹಿತ', 'Widowed': 'ವಿಧವೆ/ವಿಧುರ', 'Divorced': 'ವಿಚ್ಛೇದಿತ', 'Separated': 'ಪ್ರತ್ಯೇಕ',
    'Spouse': 'ಪತಿ/ಪತ್ನಿ', 'Son': 'ಮಗ', 'Daughter': 'ಮಗಳು', 'Father': 'ತಂದೆ', 'Mother': 'ತಾಯಿ', 'Brother': 'ಸಹೋದರ', 'Sister': 'ಸಹೋದರಿ', 'Grandfather': 'ಅಜ್ಜ', 'Grandmother': 'ಅಜ್ಜಿ', 'Other dependent family member': 'ಇತರೆ ಅವಲಂಬಿತ ಕುಟುಂಬ ಸದಸ್ಯ',
    'Yes': 'ಹೌದು', 'No': 'ಇಲ್ಲ', 'Own': 'ಸ್ವಂತ', 'Rented': 'ಬಾಡಿಗೆ', 'Government Quarters': 'ಸರ್ಕಾರಿ ವಸತಿ',
    'Karnataka': 'ಕರ್ನಾಟಕ', 'Andhra Pradesh': 'ಆಂಧ್ರ ಪ್ರದೇಶ', 'Tamil Nadu': 'ತಮಿಳುನಾಡು', 'Telangana': 'ತೆಲಂಗಾಣ', 'Kerala': 'ಕೇರಳ', 'Maharashtra': 'ಮಹಾರಾಷ್ಟ್ರ', 'Goa': 'ಗೋವಾ',
    'Bengaluru Urban': 'ಬೆಂಗಳೂರು ನಗರ', 'Bengaluru Rural': 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', 'Mysuru': 'ಮೈಸೂರು', 'Belagavi': 'ಬೆಳಗಾವಿ', 'Kalaburagi': 'ಕಲಬುರಗಿ', 'Dakshina Kannada': 'ದಕ್ಷಿಣ ಕನ್ನಡ', 'Dharwad': 'ಧಾರವಾಡ', 'Shivamogga': 'ಶಿವಮೊಗ್ಗ', 'Tumakuru': 'ತುಮಕೂರು', 'Ballari': 'ಬಳ್ಳಾರಿ'
  }
};
const I18nContext = createContext(null);
function getInitialLanguage() {
  if (!localStorage.getItem(LANG_CHOICE_VERSION_KEY)) {
    localStorage.setItem(LANG_KEY, 'kn');
    localStorage.setItem(LANG_CHOICE_VERSION_KEY, '1');
    return 'kn';
  }
  return localStorage.getItem(LANG_KEY) || 'kn';
}
function I18nProvider({ children }) {
  const [lang, setLang] = useState(getInitialLanguage);
  const changeLang = (next) => { localStorage.setItem(LANG_KEY, next); localStorage.setItem(LANG_CHOICE_VERSION_KEY, '1'); setLang(next); document.documentElement.lang = next === 'kn' ? 'kn' : 'en'; };
  useEffect(() => { document.documentElement.lang = lang === 'kn' ? 'kn' : 'en'; }, [lang]);
  const t = (text) => lang === 'kn' ? (I18N.kn[text] || VALUE_TRANSLATIONS.kn[text] || text) : text;
  const tv = (value) => lang === 'kn' ? (VALUE_TRANSLATIONS.kn[value] || I18N.kn[value] || value) : value;
  return <I18nContext.Provider value={{ lang, setLang: changeLang, t, tv }}>{children}</I18nContext.Provider>;
}
function useI18n() { return useContext(I18nContext) || { lang: 'en', setLang: () => {}, t: (x) => x, tv: (x) => x }; }
function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  return <div className="languageToggle" aria-label={t('Language')}><span>{t('Language')}</span><button className={lang === 'kn' ? 'active' : ''} onClick={() => setLang('kn')}>ಕನ್ನಡ</button><button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>English</button></div>;
}
const SCHEMES = ['Gruha Jyothi', 'Gruha Lakshmi', 'Anna Bhagya', 'Yuva Nidhi', 'Shakti Scheme'];
const STATUSES = ['Draft', 'Registered', 'Under Review', 'Returned for Correction', 'Approved', 'Rejected', 'On Hold'];
const DISTRICTS = ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Belagavi', 'Kalaburagi', 'Dakshina Kannada', 'Dharwad', 'Shivamogga', 'Tumakuru', 'Ballari'];
const STATES = ['Karnataka', 'Andhra Pradesh', 'Tamil Nadu', 'Telangana', 'Kerala', 'Maharashtra', 'Goa'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const MARITAL_STATUSES = ['Single', 'Married', 'Widowed', 'Divorced', 'Separated', 'Prefer not to say'];
const RELATIONSHIPS = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other dependent family member'];

function digitsOnly(value, maxLen) { return String(value || '').replace(/\D/g, '').slice(0, maxLen || 99); }
function calculateAgeFromDob(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : '';
}
function validateApplicantForm(f) {
  if (!f.applicant_name?.trim()) return 'Full name is required';
  if (!GENDERS.includes(f.gender)) return 'Please select gender from the dropdown';
  if (!f.dob) return 'Date of birth is required';
  if (f.mobile && (!/^\d{10}$/.test(f.mobile))) return 'Mobile number must be exactly 10 digits';
  if (f.alternate_mobile && (!/^\d{10}$/.test(f.alternate_mobile))) return 'Alternate mobile number must be exactly 10 digits';
  if (f.aadhaar && (!/^\d{12}$/.test(f.aadhaar))) return 'Aadhaar number must be exactly 12 digits';
  if (f.aadhaar_linked_mobile && (!/^\d{10}$/.test(f.aadhaar_linked_mobile))) return 'Aadhaar-linked mobile must be exactly 10 digits';
  if (f.email && !f.email.includes('@')) return 'Email must contain @';
  if (f.marital_status && !MARITAL_STATUSES.includes(f.marital_status)) return 'Please select marital status from the dropdown';
  return '';
}
function validateFamilyForm(f) {
  if (!f.full_name?.trim()) return 'Family member full name is required';
  if (f.gender && !GENDERS.includes(f.gender)) return 'Please select family member gender from the dropdown';
  if (f.mobile && !/^\d{10}$/.test(f.mobile)) return 'Family member mobile must be exactly 10 digits';
  if (f.aadhaar && !/^\d{12}$/.test(f.aadhaar)) return 'Family member Aadhaar must be exactly 12 digits';
  if (f.marital_status && !MARITAL_STATUSES.includes(f.marital_status)) return 'Please select family member marital status from the dropdown';
  return '';
}
function validateAddressForm(f) {
  if (!DISTRICTS.includes(f.district)) return 'Please select district from the dropdown';
  if (!STATES.includes(f.state)) return 'Please select state from the dropdown';
  if (f.pincode && !/^\d{6}$/.test(f.pincode)) return 'PIN code must be exactly 6 digits';
  return '';
}

function token() { return localStorage.getItem('kgs_token'); }
function role() { return localStorage.getItem('kgs_role'); }
function saveSession(data) { localStorage.setItem('kgs_token', data.token); localStorage.setItem('kgs_role', data.role); localStorage.setItem('kgs_user', JSON.stringify(data.user || {})); }
function clearSession() { localStorage.removeItem('kgs_token'); localStorage.removeItem('kgs_role'); localStorage.removeItem('kgs_user'); }

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const err = await res.json(); msg = err.detail || msg; } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

async function downloadWithAuth(path, fallbackName = 'report') {
  const headers = {};
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const err = await res.json(); msg = err.detail || msg; } catch {}
    throw new Error(msg);
  }
  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') || '';
  const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
  const filename = match ? match[1] : fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function App() {
  if (window.location.pathname.startsWith('/public/enrollment-statistics')) return <PublicStats />;
  const [sessionRole, setSessionRole] = useState(role());
  const [notice, setNotice] = useState('');
  const logout = async () => { try { await api('/auth/logout', { method: 'POST' }); } catch {} clearSession(); setSessionRole(null); };
  if (!sessionRole) return <Login onLogin={(data) => { saveSession(data); setSessionRole(data.role); }} />;
  return <Shell role={sessionRole} logout={logout} notice={notice} setNotice={setNotice} />;
}

function Shell({ role, logout, notice, setNotice }) {
  const { t } = useI18n();
  return <>
    <header className="topbar">
      <div className="brandSeal">ಕರ್ನಾಟಕ</div>
      <div>
        <h1>{t('Karnataka Guarantee Schemes Registration Portal')}</h1>
        <p>{t('Unified Citizen & Family Registration System')}</p>
      </div>
      <div className="topActions"><LanguageToggle /><a href="/public/enrollment-statistics" target="_blank">{t('Public Statistics')}</a><button onClick={logout}>{t('Logout')}</button></div>
    </header>
    {notice && <div className="toast" onClick={() => setNotice('')}>{notice}</div>}
    {role === 'admin' && <Admin setNotice={setNotice} />}
    {role === 'citizen' && <Citizen setNotice={setNotice} />}
    {role === 'callcenter' && <CallCenter setNotice={setNotice} />}
  </>;
}

function Login({ onLogin }) {
  const { t, tv } = useI18n();
  const [tab, setTab] = useState('citizen');
  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState('123456');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [otpMsg, setOtpMsg] = useState('');
  async function doCitizenLogin(e) {
    e.preventDefault(); setError('');
    try { const data = await api('/auth/citizen/otp/verify', { method: 'POST', body: JSON.stringify({ mobile, otp }) }); onLogin(data); }
    catch (err) { setError(err.message); }
  }
  async function doPasswordLogin(e) {
    e.preventDefault(); setError('');
    try {
      const path = tab === 'admin' ? '/auth/admin/login' : '/auth/callcenter/login';
      const data = await api(path, { method: 'POST', body: JSON.stringify({ username, password }) }); onLogin(data);
    } catch (err) { setError(err.message); }
  }
  async function requestOtp() {
    try { const data = await api('/auth/citizen/otp/request', { method: 'POST', body: JSON.stringify({ mobile }) }); setOtpMsg(`Demo OTP: ${data.demo_otp}`); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => { if (tab === 'admin') { setUsername('admin'); setPassword('admin123'); } if (tab === 'callcenter') { setUsername('callcenter'); setPassword('call123'); } }, [tab]);
  return <div className="landing loginLanding">
    <div className="loginShell">
      <div className="loginLanguageBar">
        <div>
          <strong>{t('Choose Language')}</strong>
          <span>{t('Default login opens in Kannada. You can switch to English anytime.')}</span>
        </div>
        <LanguageToggle />
      </div>
      <div className="loginLayout">
        <section className="hero loginHero">
          <div className="brandSeal big">ಕರ್ನಾಟಕ</div>
          <h1>{t('Karnataka Guarantee Schemes Registration Portal')}</h1>
          <p>{t('A mobile-first registration portal prototype for Gruha Jyothi, Gruha Lakshmi, Anna Bhagya, Yuva Nidhi and Shakti Scheme.')}</p>
          <div className="schemePills">{SCHEMES.map(s => <span key={s}>{tv(s)}</span>)}</div>
          <a className="publicLink" href="/public/enrollment-statistics">{t('Public Enrollment Statistics')}</a>
        </section>
        <section className="loginCard cleanLoginCard">
          <div className="loginHeader">
            <span>{t('Portal Login')}</span>
            <h2>{t('Select your role and continue')}</h2>
            <p>{t('Secure access for citizen registration, admin review and call center support.')}</p>
          </div>
          <div className="tabs loginTabs"><button type="button" className={tab==='citizen'?'active':''} onClick={()=>setTab('citizen')}>{t('Citizen')}</button><button type="button" className={tab==='admin'?'active':''} onClick={()=>setTab('admin')}>{t('Admin')}</button><button type="button" className={tab==='callcenter'?'active':''} onClick={()=>setTab('callcenter')}>{t('Call Center')}</button></div>
          {error && <div className="error">{error}</div>}
          {tab === 'citizen' ? <form onSubmit={doCitizenLogin}>
            <label>{t('Mobile Number')}<input inputMode="numeric" value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,'').slice(0,10))} maxLength="10" /></label>
            <label>{t('OTP')}<input inputMode="numeric" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} /></label>
            {otpMsg && <p className="hint">{otpMsg}</p>}
            <div className="loginActions">
              <button type="button" className="secondary" onClick={requestOtp}>{t('Request OTP')}</button>
              <button>{t('Login as Citizen')}</button>
            </div>
          </form> : <form onSubmit={doPasswordLogin}>
            <label>{t('Username')}<input value={username} onChange={e=>setUsername(e.target.value)} /></label>
            <label>{t('Password')}<input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
            <button>{t('Login')}</button>
          </form>}
          <div className="credentials"><b>{t('Demo:')}</b> admin/admin123, callcenter/call123, citizen OTP 123456</div>
        </section>
      </div>
    </div>
  </div>;
}

function Admin({ setNotice }) {
  const { t } = useI18n();
  const [view, setView] = useState('dashboard');
  const [appFilters, setAppFilters] = useState({});
  const [reportFocus, setReportFocus] = useState('');
  const [complianceFocus, setComplianceFocus] = useState('');
  function openApplications(filters = {}) { setAppFilters(filters); setView('applications'); }
  function openReport(reportName) { setReportFocus(reportName); setView('reports'); }
  function openCompliance(key) { setComplianceFocus(key); setView('compliance'); }
  function openAdminTile(target) {
    if (!target) return;
    if (target.view === 'applications') openApplications(target.filters || {});
    if (target.view === 'reports') openReport(target.report || 'registration-summary');
    if (target.view === 'compliance') openCompliance(target.key || 'consent_records');
    if (target.view === 'analytics') setView('analytics');
  }
  return <main className="appGrid">
    <aside className="sidebar">
      {['dashboard','applications','demo-data','approval-scan','analytics','reports','compliance','audit','master'].map(v => <button key={v} className={view===v?'active':''} onClick={()=>{ setView(v); if(v==='applications') setAppFilters({}); }}>{t(title(v))}</button>)}
    </aside>
    <section className="content">
      {view === 'dashboard' && <AdminDashboard onTileOpen={openAdminTile} />}
      {view === 'applications' && <ApplicationsPanel key={JSON.stringify(appFilters)} mode="admin" setNotice={setNotice} initialFilters={appFilters} />}
      {view === 'demo-data' && <DemoDataPanel setNotice={setNotice} />}
      {view === 'approval-scan' && <ApprovalScan setNotice={setNotice} />}
      {view === 'analytics' && <AdminDashboard analytics onTileOpen={openAdminTile} />}
      {view === 'reports' && <Reports initialReport={reportFocus} />}
      {view === 'compliance' && <Compliance initialKey={complianceFocus} />}
      {view === 'audit' && <AuditLogs />}
      {view === 'master' && <MasterData />}
    </section>
  </main>;
}

function AdminDashboard({ analytics=false, onTileOpen=()=>{} }) {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  useEffect(() => { api('/admin/dashboard').then(setData).catch(console.error); }, []);
  if (!data) return <Loading />;
  const s = data.summary;
  return <>
    <h2>{analytics ? t('Admin Analytics') : t('Admin Dashboard')}</h2>
    <p className="hint">{t('Click any tile to open related details')}</p>
    <div className="cards">
      <Metric label="Total Registrations" value={s.total_registrations} onClick={()=>onTileOpen({view:'applications', filters:{}})} />
      <Metric label="Family Members" value={s.family_members} onClick={()=>onTileOpen({view:'reports', report:'family-member'})} />
      <Metric label="Call Center Comments" value={s.comments} onClick={()=>onTileOpen({view:'reports', report:'call-center-comments'})} />
      <Metric label="Pending SLA" value={s.pending_sla} onClick={()=>onTileOpen({view:'applications', filters:{status:'Under Review'}})} />
      <Metric label="Privacy Requests" value={s.open_privacy_requests} onClick={()=>onTileOpen({view:'compliance', key:'privacy_requests'})} />
      <Metric label="Open Grievances" value={s.open_grievances} onClick={()=>onTileOpen({view:'compliance', key:'grievances'})} />
    </div>
    <div className="chartGrid">
      <Chart title="Status Distribution" rows={data.by_status} onRowClick={(r)=>onTileOpen({view:'applications', filters:{status:r.label}})} />
      <Chart title="Scheme-wise Enrollment" rows={data.by_scheme} onRowClick={(r)=>onTileOpen({view:'applications', filters:{scheme:r.label}})} />
      <Chart title="District-wise Enrollment" rows={data.by_district} onRowClick={(r)=>onTileOpen({view:'applications', filters:{district:r.label}})} />
      <Chart title="Gender-wise Applicants" rows={data.by_gender} onRowClick={()=>onTileOpen({view:'applications', filters:{}})} />
      <Chart title="Daily Registration Trend" rows={data.trend} onRowClick={()=>onTileOpen({view:'reports', report:'daily-enrollment'})} />
    </div>
  </>;
}

function ApplicationsPanel({ mode, setNotice, initialFilters={} }) {
  const { t, tv } = useI18n();
  const [apps, setApps] = useState([]);
  const [filters, setFilters] = useState({ q:'', status:'', district:'', scheme:'', ...initialFilters });
  const [selected, setSelected] = useState(null);
  async function load() {
    const params = new URLSearchParams(Object.entries(filters).filter(([_,v])=>v));
    const data = await api(`/applications?${params}`); setApps(data.applications);
  }
  async function runBatchAadhaar() {
    try {
      const data = await api('/admin/batch/aadhaar-verification', { method: 'POST' });
      setNotice(`${data.processed_count} ${t('registered application(s) moved to Under Review after batch Aadhaar verification')}`);
      await load();
    } catch (e) { setNotice(e.message); }
  }
  useEffect(() => { load().catch(err=>setNotice(err.message)); }, []);
  return <>
    <h2>{mode === 'admin' ? t('Application Management') : t('Citizen Application View')}</h2>
    <div className="filters">
      <input placeholder={t('Search name, mobile, app no, Aadhaar last 4')} value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value})} />
      <select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}><option value="">{t('All Statuses')}</option>{STATUSES.map(x=><option key={x} value={x}>{tv(x)}</option>)}</select>
      <select value={filters.district} onChange={e=>setFilters({...filters,district:e.target.value})}><option value="">{t('All Districts')}</option>{DISTRICTS.map(x=><option key={x} value={x}>{tv(x)}</option>)}</select>
      <select value={filters.scheme} onChange={e=>setFilters({...filters,scheme:e.target.value})}><option value="">{t('All Schemes')}</option>{SCHEMES.map(x=><option key={x} value={x}>{tv(x)}</option>)}</select>
      <button onClick={load}>{t('Search')}</button>
      {mode === 'admin' && <button className="secondary" onClick={runBatchAadhaar}>{t('Run Batch Aadhaar Verification')}</button>}
      {mode === 'admin' && <button className="secondary" type="button" onClick={()=>downloadWithAuth('/admin/reports/registration-summary?fmt=csv','registration-summary.csv').catch(e=>setNotice(e.message))}>{t('Export CSV')}</button>}
    </div>
    <div className="tableWrap">
      <table><thead><tr><th>{t('Application')}</th><th>{t('Name')}</th><th>{t('Mobile')}</th><th>{t('District')}</th><th>{t('Schemes')}</th><th>{t('Status')}</th><th>{t('Aadhaar')}</th><th>{t('Action')}</th></tr></thead>
      <tbody>{apps.map(a => <tr key={a.id}><td data-label="Application">{a.application_no}</td><td data-label="Name">{a.applicant_name || '-'}</td><td data-label="Mobile">{a.mobile}</td><td data-label={t('District')}>{tv(a.district)}</td><td data-label={t('Schemes')}>{(a.schemes||[]).map(tv).join(', ')}</td><td data-label={t('Status')}><span className="status">{tv(a.status)}</span></td><td data-label="Aadhaar">{a.aadhaar_masked}</td><td><button onClick={()=>setSelected(a.id)}>{t('Open')}</button></td></tr>)}</tbody></table>
    </div>
    {selected && <ApplicationModal id={selected} mode={mode} close={()=>{setSelected(null);load();}} setNotice={setNotice} />}
  </>;
}

function ApplicationModal({ id, mode, close, setNotice }) {
  const { t, tv } = useI18n();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('Under Review');
  const [remarks, setRemarks] = useState('');
  const [comment, setComment] = useState('');
  async function load(include=0) { const res = await api(`/applications/${id}?include_sensitive=${include}&reason=Admin%20review`); setData(res.application); }
  useEffect(() => { load().catch(e=>setNotice(e.message)); }, [id]);
  async function saveStatus() { await api(`/admin/applications/${id}/status`, { method:'POST', body: JSON.stringify({ status, remarks }) }); setNotice('Status updated'); load(); }
  async function saveComment() { await api(`/applications/${id}/comments`, { method:'POST', body: JSON.stringify({ comment_text: comment }) }); setComment(''); setNotice('Comment added'); load(); }
  if (!data) return <div className="modal"><div className="modalCard"><Loading /></div></div>;
  return <div className="modal"><div className="modalCard wide">
    <div className="modalHeader"><h3>{data.application_no} — {data.applicant_name}</h3><button onClick={close}>{t('Close')}</button></div>
    <div className="detailGrid">
      <Info label="Mobile" value={data.mobile} /><Info label="Status" value={data.status} /><Info label="Gender" value={data.gender} /><Info label="Aadhaar" value={data.aadhaar_masked} /><Info label="Bank" value={data.account_number_masked} />
      <Info label="District" value={data.address?.district} /><Info label="Taluk" value={data.address?.taluk} /><Info label="Address" value={`${data.address?.house_no||''} ${data.address?.street||''} ${data.address?.village_city||''}`} />
    </div>
    <h4>{t('Schemes, Eligibility and Approval Status')}</h4>
    <div className="schemeStatusGrid">{(data.scheme_selections||[]).map(s=><SchemeStatusCard key={s.id} scheme={s} applicationId={id} mode={mode} reload={load} setNotice={setNotice} />)}</div>
    <h4>{t('Family Members')}</h4>{(data.family_members||[]).map(f=><div key={f.id} className="miniCard"><b>{f.full_name}</b> — {f.relationship} — {f.aadhaar_masked}</div>)}
    {mode === 'admin' && <div className="actionBox"><h4>{t('Admin Status Action')}</h4><select value={status} onChange={e=>setStatus(e.target.value)}>{STATUSES.map(s=><option key={s} value={s}>{tv(s)}</option>)}</select><input placeholder={t('Remarks')} value={remarks} onChange={e=>setRemarks(e.target.value)} /><button onClick={saveStatus}>{t('Update Status')}</button><button className="secondary" onClick={()=>load(1)}>{t('View Sensitive Data')}</button></div>}
    <div className="actionBox"><h4>{t('Comments')}</h4><textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder={t('Add call center/admin comment')} /><button onClick={saveComment}>{t('Add Comment')}</button>{(data.comments||[]).map(c=><p className="comment" key={c.id}><b>{c.created_role}</b> {c.created_at}<br/>{c.comment_text}</p>)}</div>
    <h4>{t('Status History')}</h4>{(data.status_history||[]).map(h=><p className="comment" key={h.id}>{h.previous_status || '-'} → <b>{h.new_status}</b> by {h.changed_by} on {h.changed_at}</p>)}
  </div></div>;
}

function SchemeStatusCard({ scheme, applicationId, mode, reload, setNotice }) {
  const { t, tv } = useI18n();
  const [eligibility, setEligibility] = useState(scheme.eligibility_status || 'Eligibility Under Review');
  const [approval, setApproval] = useState(scheme.approval_status || 'Pending Scheme Approval');
  const [reason, setReason] = useState(scheme.eligibility_reason || '');
  async function save() {
    try {
      await api(`/admin/applications/${applicationId}/schemes/${encodeURIComponent(scheme.scheme_name)}/status`, {
        method: 'POST',
        body: JSON.stringify({ eligibility_status: eligibility, approval_status: approval, eligibility_reason: reason })
      });
      setNotice('Scheme eligibility and approval status updated');
      await reload();
    } catch (e) { setNotice(e.message); }
  }
  return <div className="schemeStatusCard">
    <div className="schemeStatusHead"><h3>{tv(scheme.scheme_name)}</h3><span className={`approvalBadge ${String(approval).toLowerCase().replaceAll(' ','-')}`}>{tv(approval)}</span></div>
    <p><b>{t('Eligibility:')}</b> {tv(scheme.eligibility_status || 'Pending')}</p>
    <p><b>{t('Reason:')}</b> {scheme.eligibility_reason || t('Awaiting scheme review')}</p>
    {mode === 'admin' && <div className="schemeAdminControls">
      <select value={eligibility} onChange={e=>setEligibility(e.target.value)}>{['Eligibility Under Review','Eligible','Not Eligible','Correction Required','On Hold'].map(x=><option key={x} value={x}>{tv(x)}</option>)}</select>
      <select value={approval} onChange={e=>setApproval(e.target.value)}>{['Pending Scheme Approval','Approved','Rejected','On Hold'].map(x=><option key={x} value={x}>{tv(x)}</option>)}</select>
      <input placeholder={t('Eligibility / approval remarks')} value={reason} onChange={e=>setReason(e.target.value)} />
      <button onClick={save}>{t('Save Scheme Status')}</button>
    </div>}
  </div>;
}

function DemoDataPanel({ setNotice }) {
  const { t, tv } = useI18n();
  const [count, setCount] = useState(100);
  const [clearExisting, setClearExisting] = useState(false);
  const [includeReference, setIncludeReference] = useState(true);
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  async function loadSummary(){
    const res = await api('/admin/demo-data/summary');
    setSummary(res);
  }
  async function generate(){
    setLoading(true);
    try {
      const res = await api('/admin/demo-data/generate', { method:'POST', body: JSON.stringify({ count: Number(count)||100, clear_existing_demo: clearExisting, include_reference_data: includeReference }) });
      setAnalytics(res.analytics);
      setNotice(`${t('Demo data generated')} — ${res.analytics.applications_created}`);
      await loadSummary();
    } catch(e) { setNotice(e.message); }
    finally { setLoading(false); }
  }
  async function clearDemo(){
    if (!confirm(t('Clear existing demo data first') + '?')) return;
    setLoading(true);
    try {
      const res = await api('/admin/demo-data', { method:'DELETE' });
      setAnalytics(null);
      setNotice(`${t('Demo data cleared')} — ${res.applications_deleted}`);
      await loadSummary();
    } catch(e) { setNotice(e.message); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ loadSummary().catch(e=>setNotice(e.message)); }, []);
  const byScheme = analytics?.by_scheme || {};
  const byStatus = analytics?.by_status || {};
  return <>
    <h2>{t('Mass Test Demo Data')}</h2>
    <p className="hint">{t('Varied cases include duplicate same-address families, eldest-female Gruha Lakshmi cases, electricity under/over 200 units, BPL/APL ration cards, graduates/non-graduates and missing-data review cases.')}</p>
    <section className="formCard actionPanel">
      <div className="proposalHeader">
        <div><h3>{t('Generate varied demo applications')}</h3><p>{t('After generating demo data, run Approval Proposal Scan to see rule-based approvals and analytics.')}</p></div>
        <div className="formGrid demoControls">
          <label>{t('Number of demo applications')}<input type="number" min="25" max="500" value={count} onChange={e=>setCount(e.target.value)} /></label>
          <label className="check"><input type="checkbox" checked={clearExisting} onChange={e=>setClearExisting(e.target.checked)} /> {t('Clear existing demo data first')}</label>
          <label className="check"><input type="checkbox" checked={includeReference} onChange={e=>setIncludeReference(e.target.checked)} /> {t('Include electricity and ration reference data')}</label>
          <div className="actions"><button onClick={generate} disabled={loading}>{loading ? t('Loading…') : t('Generate Demo Data')}</button><button className="secondary" onClick={clearDemo} disabled={loading}>{t('Clear Demo Data')}</button></div>
        </div>
      </div>
    </section>
    <div className="cards">
      <Metric label="Applications Created" value={analytics?.applications_created || summary?.total_demo_applications || 0} />
      <Metric label="Electricity Reference Rows" value={summary?.electricity_reference_rows || 0} />
      <Metric label="Ration Reference Rows" value={summary?.ration_reference_rows || 0} />
      <Metric label="Batch ID" value={analytics?.batch_id || '-'} />
    </div>
    {analytics && <section className="chartGrid"><Chart title="Scheme-wise Enrollment" rows={Object.entries(byScheme).map(([label,value])=>({label,value}))} /><Chart title="Status Distribution" rows={Object.entries(byStatus).map(([label,value])=>({label,value}))} /></section>}
    {analytics && <section className="formCard"><h3>{t('Scenario Coverage')}</h3><div className="tableWrap"><table><thead><tr><th>#</th><th>{t('Reason')}</th><th>{t('Applications')}</th><th>{t('Schemes')}</th></tr></thead><tbody>{Object.entries(analytics.scenario_coverage || {}).map(([k,v])=><tr key={k}><td data-label="#">{k}</td><td data-label={t('Reason')}>{v}</td><td data-label={t('Applications')}>{analytics.scenario_counts?.[k]?.applications || 0}</td><td data-label={t('Schemes')}>{analytics.scenario_counts?.[k]?.scheme_items || 0}</td></tr>)}</tbody></table></div></section>}
    <section className="formCard">
      <h3>{t('Demo Summary')}</h3>
      <div className="tableWrap"><table><thead><tr><th>{t('Batch ID')}</th><th>{t('Applications')}</th><th>{t('First Created')}</th><th>{t('Last Created')}</th></tr></thead><tbody>{(summary?.batches || []).map(b=><tr key={b.batch_id}><td data-label={t('Batch ID')}>{b.batch_id}</td><td data-label={t('Applications')}>{b.applications}</td><td data-label={t('First Created')}>{b.first_created}</td><td data-label={t('Last Created')}>{b.last_created}</td></tr>)}</tbody></table></div>
    </section>
  </>;
}

function ApprovalScan({ setNotice }) {
  const { t, tv } = useI18n();
  const [proposal, setProposal] = useState(null);
  const [items, setItems] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [electricityRows, setElectricityRows] = useState([]);
  const [rationRows, setRationRows] = useState([]);
  const [electricityCsv, setElectricityCsv] = useState('consumer_no,usage_month,units\nELEC000001,2026-06,145');
  const [rationCsv, setRationCsv] = useState('ration_card_no,card_type,household_size\nRC000001,BPL,4');
  const [loading, setLoading] = useState(false);
  async function loadRefs(){
    const [e, r, p] = await Promise.all([
      api('/admin/reference/electricity-usage'),
      api('/admin/reference/ration-cards'),
      api('/admin/approval-proposals')
    ]);
    setElectricityRows(e.rows || []); setRationRows(r.rows || []); setProposals(p.proposals || []);
  }
  async function openProposal(id){
    const res = await api(`/admin/approval-proposals/${id}`);
    setProposal(res.proposal); setItems(res.items || []);
  }
  async function runScan(){
    setLoading(true);
    try {
      const res = await api('/admin/approval-proposals/run', { method:'POST' });
      setNotice(t('Approval proposal scan completed'));
      await openProposal(res.proposal_id);
      await loadRefs();
    } catch(e){ setNotice(e.message); }
    finally { setLoading(false); }
  }
  async function applyProposal(){
    if (!proposal) return;
    if (!confirm(t('Apply this approval proposal? This will update scheme eligibility and approval statuses.'))) return;
    setLoading(true);
    try {
      const res = await api(`/admin/approval-proposals/${proposal.id}/apply`, { method:'POST' });
      setNotice(`${t('Approval proposal applied')} — ${res.items_applied} ${t('items applied')}`);
      await openProposal(proposal.id); await loadRefs();
    } catch(e){ setNotice(e.message); }
    finally { setLoading(false); }
  }
  async function uploadElectricity(){
    try { const res = await api('/admin/reference/electricity-usage/upload', { method:'POST', body: JSON.stringify({ csv_text: electricityCsv }) }); setNotice(`${t('Electricity usage uploaded')} — ${res.saved}`); await loadRefs(); } catch(e){ setNotice(e.message); }
  }
  async function uploadRation(){
    try { const res = await api('/admin/reference/ration-cards/upload', { method:'POST', body: JSON.stringify({ csv_text: rationCsv }) }); setNotice(`${t('Ration cards uploaded')} — ${res.saved}`); await loadRefs(); } catch(e){ setNotice(e.message); }
  }
  useEffect(()=>{ loadRefs().catch(e=>setNotice(e.message)); }, []);
  const analytics = proposal?.analytics || {};
  const byScheme = analytics.by_scheme || {};
  const byDecision = analytics.by_decision || {};
  return <>
    <h2>{t('Approval Proposal Scan')}</h2>
    <p className="hint">{t('Run the proposal first. Review analytics and proposed records. Then click Apply Proposal to update approvals.')}</p>
    <section className="formCard actionPanel">
      <div className="proposalHeader">
        <div><h3>{t('Rule Engine')}</h3><p>{t('Rules include one eldest female per same-address group for Gruha Lakshmi, Gruha Jyothi below 200 units, Anna Bhagya BPL card, and Yuva Nidhi graduate checks.')}</p></div>
        <div className="actions"><button onClick={runScan} disabled={loading}>{loading ? t('Loading…') : t('Run Approval Proposal Scan')}</button>{proposal?.status === 'Proposed' && <button className="secondary" onClick={applyProposal} disabled={loading}>{t('Apply Proposal')}</button>}</div>
      </div>
      {proposal && <div className="proposalMeta"><span>{t('Proposal No')}: <b>{proposal.proposal_no}</b></span><span>{t('Status')}: <b>{tv(proposal.status)}</b></span><span>{t('Created At')}: <b>{proposal.created_at}</b></span>{proposal.applied_at && <span>{t('Applied At')}: <b>{proposal.applied_at}</b></span>}</div>}
    </section>
    <div className="cards">
      <Metric label="Total Proposal Items" value={analytics.total_items || 0} />
      <Metric label="Proposed Approved" value={byDecision.Approved || 0} />
      <Metric label="Proposed Rejected" value={byDecision.Rejected || 0} />
      <Metric label="Proposed On Hold" value={byDecision['On Hold'] || 0} />
    </div>
    {proposal && <section className="chartGrid"><Chart title="Proposal by Scheme" rows={Object.entries(byScheme).map(([label,v])=>({label, value:v.total}))} /><Chart title="Proposal by Decision" rows={Object.entries(byDecision).map(([label,value])=>({label,value}))} /></section>}
    <section className="formCard">
      <h3>{t('Previous Proposals')}</h3>
      <div className="tableWrap"><table><thead><tr><th>{t('Proposal No')}</th><th>{t('Status')}</th><th>{t('Items')}</th><th>{t('Created At')}</th><th>{t('Action')}</th></tr></thead><tbody>{proposals.map(p=><tr key={p.id}><td data-label={t('Proposal No')}>{p.proposal_no}</td><td data-label={t('Status')}>{tv(p.status)}</td><td data-label={t('Items')}>{p.analytics?.total_items || 0}</td><td data-label={t('Created At')}>{p.created_at}</td><td data-label={t('Action')}><button onClick={()=>openProposal(p.id)}>{t('Open')}</button></td></tr>)}</tbody></table></div>
    </section>
    {proposal && <section className="formCard">
      <h3>{t('Proposal Records')}</h3>
      <div className="tableWrap"><table><thead><tr><th>{t('Application')}</th><th>{t('Name')}</th><th>{t('Scheme')}</th><th>{t('Eligibility')}</th><th>{t('Proposed Approval')}</th><th>{t('Rule')}</th><th>{t('Reason')}</th></tr></thead><tbody>{items.map(i=><tr key={i.id}><td data-label={t('Application')}>{i.application_no}</td><td data-label={t('Name')}>{i.applicant_name}</td><td data-label={t('Scheme')}>{tv(i.scheme_name)}</td><td data-label={t('Eligibility')}>{tv(i.proposed_eligibility_status)}</td><td data-label={t('Proposed Approval')}><span className={`approvalBadge ${String(i.proposed_approval_status).toLowerCase().replaceAll(' ','-')}`}>{tv(i.proposed_approval_status)}</span></td><td data-label={t('Rule')}>{i.rule_code}</td><td data-label={t('Reason')}>{i.reason}</td></tr>)}</tbody></table></div>
    </section>}
    <section className="referenceGrid">
      <div className="formCard"><h3>{t('Monthly Electricity Usage Upload')}</h3><p className="hint">{t('CSV columns')}: consumer_no, usage_month, units</p><textarea value={electricityCsv} onChange={e=>setElectricityCsv(e.target.value)} /><button onClick={uploadElectricity}>{t('Mass Upload Electricity Usage')}</button><div className="tableWrap compact"><table><thead><tr><th>{t('Consumer No')}</th><th>{t('Month')}</th><th>{t('Units')}</th></tr></thead><tbody>{electricityRows.slice(0,8).map(r=><tr key={r.id}><td>{r.consumer_no}</td><td>{r.usage_month}</td><td>{r.units}</td></tr>)}</tbody></table></div></div>
      <div className="formCard"><h3>{t('Ration Card BPL/APL Upload')}</h3><p className="hint">{t('CSV columns')}: ration_card_no, card_type, household_size</p><textarea value={rationCsv} onChange={e=>setRationCsv(e.target.value)} /><button onClick={uploadRation}>{t('Mass Upload Ration Cards')}</button><div className="tableWrap compact"><table><thead><tr><th>{t('Ration Card')}</th><th>{t('Card Type')}</th><th>{t('Household Size')}</th></tr></thead><tbody>{rationRows.slice(0,8).map(r=><tr key={r.id}><td>{r.ration_card_no}</td><td>{r.card_type}</td><td>{r.household_size}</td></tr>)}</tbody></table></div></div>
    </section>
  </>;
}

function Reports({ initialReport='' }) {
  const { t } = useI18n();
  const [msg, setMsg] = useState('');
  const [preview, setPreview] = useState(null);
  const reports = ['registration-summary','scheme-wise-enrollment','district-wise-enrollment','citizen-application-status','family-member','aadhaar-duplicate-check','pending-review','approved-applications','rejected-applications','call-center-comments','daily-enrollment','monthly-enrollment','sla-aging','admin-action-audit','privacy-request','grievance','sensitive-data-access'];
  async function downloadReport(reportName, fmt) {
    setMsg('');
    try {
      const ext = fmt === 'excel' ? 'xlsx' : fmt === 'pdf' ? 'txt' : fmt;
      await downloadWithAuth(`/admin/reports/${reportName}?fmt=${fmt}`, `${reportName}.${ext}`);
      setMsg(t('Download started'));
    } catch (e) { setMsg(e.message); }
  }
  async function previewReport(reportName) {
    setMsg('');
    setPreview({ reportName, rows: null });
    try {
      const res = await api(`/admin/reports/${reportName}?fmt=json`);
      setPreview({ reportName, rows: res.rows || [], title: res.title || title(reportName) });
    } catch (e) { setMsg(e.message); setPreview(null); }
  }
  useEffect(()=>{ if (initialReport) previewReport(initialReport); }, [initialReport]);
  return <>
    <h2>{t('Reports')}</h2>
    <p className="hint">{t('Click any tile to open related details')}</p>
    {msg && <div className={msg.includes('Missing') || msg.includes('HTTP') ? 'error' : 'disclaimer'}>{msg}</div>}
    <div className="reportGrid">{reports.map(r=><div className="reportCard clickableTile" role="button" tabIndex="0" key={r} onClick={()=>previewReport(r)} onKeyDown={(e)=>{ if(e.key==='Enter') previewReport(r); }}>
      <h3>{t(title(r))}</h3>
      <p>{t('Generated with masked Aadhaar and bank details by default.')}</p>
      <em className="tileHint">{t('Open Details')}</em>
      <div className="reportActions" onClick={e=>e.stopPropagation()}>
        <button type="button" className="secondary" onClick={()=>downloadReport(r,'json')}>{t('JSON')}</button>
        <button type="button" className="secondary" onClick={()=>downloadReport(r,'csv')}>{t('CSV')}</button>
        <button type="button" className="secondary" onClick={()=>downloadReport(r,'excel')}>{t('Excel')}</button>
        <button type="button" className="secondary" onClick={()=>downloadReport(r,'pdf')}>{t('PDF/Text')}</button>
      </div>
    </div>)}</div>
    {preview && <section className="formCard complianceDetail">
      <div className="modalHeader"><h3>{t('Report Preview')} — {t(preview.title || title(preview.reportName))}</h3><button type="button" onClick={()=>setPreview(null)}>{t('Back to Reports')}</button></div>
      {!preview.rows && <Loading />}
      {preview.rows && preview.rows.length === 0 && <p className="disclaimer">{t('No records found')}</p>}
      {preview.rows && preview.rows.length > 0 && <div className="tableWrap"><table><thead><tr>{Object.keys(preview.rows[0]).map(c=><th key={c}>{t(title(c))}</th>)}</tr></thead><tbody>{preview.rows.map((row,i)=><tr key={i}>{Object.entries(row).map(([k,v])=><td data-label={t(title(k))} key={k}>{String(v ?? '')}</td>)}</tr>)}</tbody></table></div>}
    </section>}
  </>;
}


function Compliance({ initialKey='' }) {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  useEffect(()=>{ api('/admin/compliance').then(setData).catch(e=>setError(e.message)); }, []);
  useEffect(()=>{ if (data && initialKey) openDetail(initialKey); }, [data, initialKey]);
  async function openDetail(key) {
    setError('');
    setDetail({ key, title: title(key), rows: null });
    try {
      const res = await api(`/admin/compliance/${key}`);
      setDetail(res);
    } catch (e) { setError(e.message); setDetail(null); }
  }
  if (!data) return <Loading />;
  return <>
    <h2>{t('Compliance Dashboard')}</h2>
    {error && <div className="error">{error}</div>}
    <div className="cards complianceCards">{Object.entries(data.compliance).map(([k,v])=><button type="button" className="metric complianceTile" key={k} onClick={()=>openDetail(k)}>
      <span>{t(title(k))}</span><strong>{typeof v === 'string' ? v : v}</strong><em>{t('Open Details')}</em>
    </button>)}</div>
    {detail && <section className="formCard complianceDetail">
      <div className="modalHeader"><h3>{t('Compliance Records')} — {t(detail.title || title(detail.key || ''))}</h3><button type="button" onClick={()=>setDetail(null)}>{t('Back to Compliance Dashboard')}</button></div>
      {!detail.rows && <Loading />}
      {detail.rows && detail.rows.length === 0 && <p className="disclaimer">{t('No records found')}</p>}
      {detail.rows && detail.rows.length > 0 && <div className="tableWrap"><table><thead><tr>{Object.keys(detail.rows[0]).map(c=><th key={c}>{t(title(c))}</th>)}</tr></thead><tbody>{detail.rows.map((row,i)=><tr key={i}>{Object.entries(row).map(([k,v])=><td data-label={t(title(k))} key={k}>{String(v ?? '')}</td>)}</tr>)}</tbody></table></div>}
    </section>}
  </>;
}
function AuditLogs() { const { t } = useI18n(); const [rows,setRows]=useState([]); useEffect(()=>{api('/admin/audit-logs').then(d=>setRows(d.audit_logs))},[]); return <><h2>{t('Audit Logs')}</h2><div className="tableWrap"><table><thead><tr><th>{t('Time')}</th><th>{t('Role')}</th><th>{t('Action')}</th><th>{t('Record')}</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.created_at}</td><td>{r.role}</td><td>{r.action}</td><td>{r.record_type} {r.record_id}</td></tr>)}</tbody></table></div></>; }
function MasterData() { const { t, tv } = useI18n(); const [data,setData]=useState(null); useEffect(()=>{api('/admin/master-data').then(setData)},[]); if(!data)return <Loading/>; return <><h2>{t('Settings / Master Data')}</h2><h3>{t('Schemes')}</h3><div className="schemePills">{data.schemes.map(s=><span key={s}>{tv(s)}</span>)}</div><h3>{t('Retention Policy')}</h3>{data.retention_policy.map(r=><div className="miniCard" key={r.id}><b>{r.data_category}</b>: {r.retention_period}</div>)}<h3>{t('Data Field Registry')}</h3>{data.data_field_registry.map(r=><div className="miniCard" key={r.id}><b>{r.field_name}</b>: {r.purpose} — Mask: {r.masking_rule}</div>)}</>; }

function Citizen({ setNotice }) {
  const { t } = useI18n();
  const [appData, setAppData] = useState(null);
  async function load() { const d = await api('/citizen/application'); setAppData(d.application); }
  async function createApp() { const d = await api('/citizen/application', { method: 'POST' }); setAppData(d.application); }
  useEffect(()=>{load().catch(e=>setNotice(e.message));},[]);
  if (appData === null) return <main className="citizenHome"><h2>{t('Welcome')}</h2><p>{t('No application found for this mobile number.')}</p><button onClick={createApp}>{t('Start Registration')}</button></main>;
  return <main className="citizenHome"><CitizenDashboard appData={appData} reload={load} setNotice={setNotice} /></main>;
}

function CitizenDashboard({ appData, reload, setNotice }) {
  const { t } = useI18n();
  const [step, setStep] = useState('dashboard');
  const canEdit = ['Draft','Returned for Correction'].includes(appData.status);
  return <>
    {step === 'dashboard' && <section><h2>{t('Citizen Dashboard')}</h2><p className="hint">{t('Click any tile to open related details')}</p><div className="cards"><Metric label="Application Number" value={appData.application_no} onClick={()=>setStep('view')} /><Metric label="Status" value={appData.status} onClick={()=>setStep('status')} /><Metric label="Selected Schemes" value={(appData.scheme_selections||[]).length} onClick={()=>setStep('status')} /><Metric label="Family Members" value={(appData.family_members||[]).length} onClick={()=>setStep('view')} /></div><div className="actions"><button onClick={()=>setStep(canEdit ? 'wizard' : 'view')}>{canEdit ? t('Continue / Edit Registration') : t('View Registration')}</button><button className="secondary" onClick={()=>setStep('status')}>{t('View Status & Eligibility')}</button><a className="buttonLike" href={`${API}/citizen/application/acknowledgement`} target="_blank">{t('Download Acknowledgement')}</a><button className="secondary" onClick={()=>setStep('privacy')}>{t('My Data & Privacy Rights')}</button></div><p className="disclaimer">{canEdit ? t('Edit is enabled because this application is in Draft or Returned for Correction status.') : t('This application is currently locked for editing. You can view it now, but changes are allowed only if the application is returned for correction by the department.')}</p></section>}
    {step === 'wizard' && canEdit && <RegistrationWizard appData={appData} reload={reload} setNotice={setNotice} back={()=>setStep('dashboard')} />}
    {step === 'wizard' && !canEdit && <ApplicationReadOnly appData={appData} back={()=>setStep('dashboard')} />}
    {step === 'view' && <ApplicationReadOnly appData={appData} back={()=>setStep('dashboard')} />}
    {step === 'status' && <CitizenStatusPage back={()=>setStep('dashboard')} setNotice={setNotice} />}
    {step === 'privacy' && <PrivacyRights appData={appData} back={()=>setStep('dashboard')} setNotice={setNotice} />}
  </>;
}

function ApplicationReadOnly({ appData, back }) {
  const { t, tv } = useI18n();
  const address = appData.address || {};
  return <div className="formCard readOnlyApplication">
    <button className="secondary" onClick={back}>{t('Back')}</button>
    <h2>{t('Application View Only')}</h2>
    <p className="disclaimer">{t('This application is currently locked for editing. You can view it now, but changes are allowed only if the application is returned for correction by the department.')}</p>
    <div className="statusHero clickableStatusHero"><button type="button"><span>{t('Application Number')}</span><strong>{appData.application_no}</strong></button><button type="button"><span>{t('Current Status')}</span><strong>{tv(appData.status)}</strong></button><button type="button"><span>{t('Aadhaar Batch Verification')}</span><strong>{tv(appData.aadhaar_verification_status || 'Not Started')}</strong></button></div>

    <h3>{t('Applicant Details')}</h3>
    <div className="detailGrid">
      <Info label="Full Name" value={appData.applicant_name} />
      <Info label="Gender" value={appData.gender} />
      <Info label="Date of Birth" value={appData.dob} />
      <Info label="Age" value={appData.age} />
      <Info label="Mobile" value={appData.mobile} />
      <Info label="Email" value={appData.email} />
      <Info label="Aadhaar" value={appData.aadhaar_masked} />
      <Info label="Marital Status" value={appData.marital_status} />
      <Info label="Ration Card" value={appData.ration_card} />
      <Info label="Bank" value={appData.account_number_masked} />
    </div>

    <h3>{t('Address Details')}</h3>
    <div className="detailGrid">
      <Info label="House / Building" value={address.house_no} />
      <Info label="Street / Locality" value={address.street} />
      <Info label="Village / Town / City" value={address.village_city} />
      <Info label="Taluk" value={address.taluk} />
      <Info label="District" value={address.district} />
      <Info label="State" value={address.state} />
      <Info label="PIN Code" value={address.pincode} />
      <Info label="Electricity Consumer No" value={address.electricity_consumer_no} />
    </div>

    <h3>{t('Immediate Family Details')}</h3>
    <div className="listCards">{(appData.family_members||[]).length ? (appData.family_members||[]).map(m=><div className="miniCard" key={m.id}><b>{m.full_name}</b><span>{tv(m.relationship)}</span><span>{tv(m.gender)}</span><span>{m.aadhaar_masked}</span></div>) : <p>{t('No data')}</p>}</div>

    <h3>{t('Scheme Details')}</h3>
    <div className="schemeStatusGrid">{(appData.scheme_selections||[]).length ? (appData.scheme_selections||[]).map(s=><div className="schemeStatusCard citizen" key={s.id}><div className="schemeStatusHead"><h3>{tv(s.scheme_name)}</h3><span className={`approvalBadge ${String(s.approval_status).toLowerCase().replaceAll(' ','-')}`}>{tv(s.approval_status)}</span></div><p><b>{t('Eligibility:')}</b> {tv(s.eligibility_status)}</p><p>{s.eligibility_reason || t('Eligibility decision is pending.')}</p></div>) : <p>{t('No data')}</p>}</div>
  </div>;
}

function CitizenStatusPage({ back, setNotice }) {
  const { t, tv } = useI18n();
  const [data, setData] = useState(null);
  useEffect(()=>{ api('/citizen/status').then(setData).catch(e=>setNotice(e.message)); }, []);
  if (!data) return <Loading />;
  if (!data.application) return <div className="formCard"><button className="secondary" onClick={back}>{t('Back')}</button><h2>{t('Status')}</h2><p>{t('No application found.')}</p></div>;
  const app = data.application;
  return <div className="formCard statusPage">
    <button className="secondary" onClick={back}>{t('Back')}</button>
    <h2>{t('Application Status & Scheme Eligibility')}</h2>
    <div className="statusHero clickableStatusHero"><button type="button"><span>{t('Application Number')}</span><strong>{app.application_no}</strong></button><button type="button"><span>{t('Current Status')}</span><strong>{tv(app.status)}</strong></button><button type="button"><span>{t('Aadhaar Batch Verification')}</span><strong>{tv(app.aadhaar_verification_status || 'Not Started')}</strong></button></div>
    <h3>{t('Workflow')}</h3>
    <div className="stageTimeline">{(data.workflow||[]).map((w,i)=><div className="timelineItem" key={w.step}><b>{i+1}</b><div><h4>{w.step}</h4><span>{w.status}</span><p>{w.description}</p></div></div>)}</div>
    <h3>{t('Scheme-wise Approval and Eligibility')}</h3>
    <div className="schemeStatusGrid">{(app.scheme_selections||[]).map(s=><div className="schemeStatusCard citizen" key={s.id}><div className="schemeStatusHead"><h3>{tv(s.scheme_name)}</h3><span className={`approvalBadge ${String(s.approval_status).toLowerCase().replaceAll(' ','-')}`}>{tv(s.approval_status)}</span></div><p><b>{t('Eligibility:')}</b> {tv(s.eligibility_status)}</p><p>{s.eligibility_reason || t('Eligibility decision is pending.')}</p></div>)}</div>
  </div>;
}

function RegistrationWizard({ appData, reload, setNotice, back }) {
  const { t } = useI18n();
  const [page,setPage]=useState(0);
  const steps=['Privacy','Applicant','Address','Family','Schemes','Review'];
  return <section><div className="wizardTop"><button className="secondary" onClick={back}>{t('Back')}</button><div className="progress">{steps.map((s,i)=><span className={i===page?'active':''} key={s}>{i+1}. {t(s)}</span>)}</div></div>
    {page===0 && <PrivacyStep next={()=>setPage(1)} />}
    {page===1 && <ApplicantStep appData={appData} next={async()=>{await reload();setPage(2)}} setNotice={setNotice} />}
    {page===2 && <AddressStep appData={appData} next={async()=>{await reload();setPage(3)}} setNotice={setNotice} />}
    {page===3 && <FamilyStep appData={appData} reload={reload} next={()=>setPage(4)} setNotice={setNotice} />}
    {page===4 && <SchemeStep appData={appData} next={async()=>{await reload();setPage(5)}} setNotice={setNotice} />}
    {page===5 && <ReviewStep appData={appData} reload={reload} setNotice={setNotice} back={back} />}
  </section>;
}
function PrivacyStep({ next }) { const { t } = useI18n(); return <div className="formCard"><h2>{t('Privacy Notice and Consent Intimation')}</h2><p>{t('This prototype collects citizen and family details for scheme registration, eligibility assessment, audit, grievance handling and aggregated reporting. Aadhaar verification is simulated; real eKYC is not enabled.')}</p><p className="disclaimer">{t('Public statistics are aggregated and do not expose personal information.')}</p><button onClick={next}>{t('I Understand, Continue')}</button></div>; }
function ApplicantStep({ appData, next, setNotice }) {
  const { t } = useI18n();
  const [f,setF]=useState({ applicant_name: appData.applicant_name||'', gender: appData.gender||'', dob: appData.dob||'', age: appData.age||'', mobile: appData.mobile||'', alternate_mobile: appData.alternate_mobile||'', email: appData.email||'', aadhaar: '', aadhaar_name: appData.aadhaar_name||'', aadhaar_linked_mobile: appData.aadhaar_linked_mobile||'', ration_card: appData.ration_card||'', voter_id: appData.voter_id||'', caste_category: appData.caste_category||'', marital_status: appData.marital_status||'', occupation: appData.occupation||'', annual_income: appData.annual_income||'', bank_holder_name: appData.bank_holder_name||'', bank_name: appData.bank_name||'', branch_name: appData.branch_name||'', ifsc: appData.ifsc||'', account_number: '' });
  function update(k,v){
    const nextF={...f,[k]:v};
    if(k==='dob') nextF.age = calculateAgeFromDob(v);
    setF(nextF);
  }
  async function save(){
    const err = validateApplicantForm(f);
    if (err) { setNotice(err); return; }
    try{ await api('/citizen/application/applicant',{method:'PUT',body:JSON.stringify({...f, age:Number(f.age)||0})}); setNotice('Applicant details saved'); next(); }catch(e){setNotice(e.message)}
  }
  return <div className="formCard"><h2>{t('Primary Applicant Details')}</h2><div className="formGrid">
    <Field label="Full Name" value={f.applicant_name} onChange={v=>update('applicant_name',v)} required />
    <Field label="Gender" type="select" value={f.gender} onChange={v=>update('gender',v)} options={GENDERS} required />
    <Field label="Date of Birth" type="date" value={f.dob} onChange={v=>update('dob',v)} required />
    <Field label="Age" value={f.age} onChange={()=>{}} readOnly hint="Auto-calculated from DOB" />
    <Field label="Mobile" value={f.mobile} onChange={v=>update('mobile',digitsOnly(v,10))} inputMode="numeric" maxLength="10" required />
    <Field label="Alternate Mobile" value={f.alternate_mobile} onChange={v=>update('alternate_mobile',digitsOnly(v,10))} inputMode="numeric" maxLength="10" />
    <Field label="Email" type="email" value={f.email} onChange={v=>update('email',v)} placeholder="name@example.com" />
    <Field label="Aadhaar Number" value={f.aadhaar} onChange={v=>update('aadhaar',digitsOnly(v,12))} inputMode="numeric" maxLength="12" placeholder={appData.aadhaar_masked || '12 digit Aadhaar'} required />
    <Field label="Aadhaar Name" value={f.aadhaar_name} onChange={v=>update('aadhaar_name',v)} />
    <Field label="Aadhaar-linked Mobile" value={f.aadhaar_linked_mobile} onChange={v=>update('aadhaar_linked_mobile',digitsOnly(v,10))} inputMode="numeric" maxLength="10" />
    <Field label="Ration Card" value={f.ration_card} onChange={v=>update('ration_card',v)} />
    <Field label="Voter ID" value={f.voter_id} onChange={v=>update('voter_id',v)} />
    <Field label="Caste / Category" value={f.caste_category} onChange={v=>update('caste_category',v)} />
    <Field label="Marital Status" type="select" value={f.marital_status} onChange={v=>update('marital_status',v)} options={MARITAL_STATUSES} />
    <Field label="Occupation" value={f.occupation} onChange={v=>update('occupation',v)} />
    <Field label="Annual Income" value={f.annual_income} onChange={v=>update('annual_income',v)} inputMode="numeric" />
    <Field label="Bank Holder Name" value={f.bank_holder_name} onChange={v=>update('bank_holder_name',v)} />
    <Field label="Bank Name" value={f.bank_name} onChange={v=>update('bank_name',v)} />
    <Field label="Branch" value={f.branch_name} onChange={v=>update('branch_name',v)} />
    <Field label="IFSC" value={f.ifsc} onChange={v=>update('ifsc',v.toUpperCase())} />
    <Field label="Bank Account Number" value={f.account_number} onChange={v=>update('account_number',digitsOnly(v,18))} inputMode="numeric" />
  </div><button onClick={save}>{t('Save and Continue')}</button></div>;
}
function AddressStep({ appData, next, setNotice }) {
  const { t } = useI18n();
  const a=appData.address||{};
  const [f,setF]=useState({ house_no:a.house_no||'', street:a.street||'', ward_no:a.ward_no||'', village_city:a.village_city||'', local_body:a.local_body||'', taluk:a.taluk||'', district:a.district||'', state:a.state||'Karnataka', pincode:a.pincode||'', landmark:a.landmark||'', same_as_aadhaar:a.same_as_aadhaar||'', residence_type:a.residence_type||'', electricity_consumer_no:a.electricity_consumer_no||'', lpg_ration_shop:a.lpg_ration_shop||'' });
  function update(k,v){ setF({...f,[k]:v}); }
  async function save(){
    const err = validateAddressForm(f);
    if (err) { setNotice(err); return; }
    try{await api('/citizen/application/address',{method:'PUT',body:JSON.stringify(f)});setNotice('Address saved');next();}catch(e){setNotice(e.message)}
  }
  return <div className="formCard"><h2>{t('Present Address')}</h2><div className="formGrid">
    <Field label="House / Building" value={f.house_no} onChange={v=>update('house_no',v)} />
    <Field label="Street / Locality" value={f.street} onChange={v=>update('street',v)} />
    <Field label="Ward No" value={f.ward_no} onChange={v=>update('ward_no',v)} />
    <Field label="Village / Town / City" value={f.village_city} onChange={v=>update('village_city',v)} />
    <Field label="Gram Panchayat / Municipality" value={f.local_body} onChange={v=>update('local_body',v)} />
    <Field label="Taluk" value={f.taluk} onChange={v=>update('taluk',v)} />
    <Field label="District" type="select" value={f.district} onChange={v=>update('district',v)} options={DISTRICTS} required />
    <Field label="State" type="select" value={f.state || 'Karnataka'} onChange={v=>update('state',v)} options={STATES} required />
    <Field label="PIN Code" value={f.pincode} onChange={v=>update('pincode',digitsOnly(v,6))} inputMode="numeric" maxLength="6" />
    <Field label="Landmark" value={f.landmark} onChange={v=>update('landmark',v)} />
    <Field label="Same as Aadhaar Address?" type="select" value={f.same_as_aadhaar} onChange={v=>update('same_as_aadhaar',v)} options={['Yes','No']} />
    <Field label="Residence Type" type="select" value={f.residence_type} onChange={v=>update('residence_type',v)} options={['Own','Rented','Government Quarters','Other']} />
    <Field label="Electricity Consumer No" value={f.electricity_consumer_no} onChange={v=>update('electricity_consumer_no',v)} />
    <Field label="LPG / Ration Shop" value={f.lpg_ration_shop} onChange={v=>update('lpg_ration_shop',v)} />
  </div><button onClick={save}>{t('Save and Continue')}</button></div>;
}
function Field({ label, value, onChange, type='text', options=[], required=false, readOnly=false, hint='', ...props }) {
  const { t, tv } = useI18n();
  const translatedLabel = t(label);
  return <label>{translatedLabel}{required && ' *'}
    {type==='select' ? <select value={value??''} onChange={e=>onChange(e.target.value)} disabled={readOnly}><option value="">{t('Select')} {translatedLabel}</option>{options.map(o=><option key={o} value={o}>{tv(o)}</option>)}</select> : <input type={type} value={value??''} readOnly={readOnly} onChange={e=>onChange(e.target.value)} {...props}/>} 
    {hint && <small>{t(hint)}</small>}
  </label>;
}
function FamilyStep({ appData, reload, next, setNotice }) {
  const { t, tv } = useI18n();
  const blank={full_name:'',relationship:'',gender:'',dob:'',age:'',aadhaar:'',mobile:'',occupation:'',education_status:'',marital_status:'',dependent:'',gov_benefit:'',scheme_eligibility:'',remarks:'',is_minor:0,guardian_declaration:0};
  const [f,setF]=useState(blank);
  function update(k,v){
    const nextF={...f,[k]:v};
    if(k==='dob') {
      const age = calculateAgeFromDob(v);
      nextF.age = age;
      nextF.is_minor = age !== '' && Number(age) < 18 ? 1 : 0;
    }
    setF(nextF);
  }
  async function add(){
    const err = validateFamilyForm(f);
    if (err) { setNotice(err); return; }
    try{await api('/citizen/application/family',{method:'POST',body:JSON.stringify({...f, age:Number(f.age)||0})});setF(blank);setNotice(t('Family member added'));await reload();}catch(e){setNotice(e.message)}
  }
  return <div className="formCard"><h2>{t('Immediate Family Details')}</h2><div className="listCards">{(appData.family_members||[]).map(m=><div className="miniCard" key={m.id}><b>{m.full_name}</b> — {tv(m.relationship)} — {m.aadhaar_masked}</div>)}</div><div className="formGrid">
    <Field label="Full Name" value={f.full_name} onChange={v=>update('full_name',v)} required />
    <Field label="Relationship" type="select" value={f.relationship} onChange={v=>update('relationship',v)} options={RELATIONSHIPS} />
    <Field label="Gender" type="select" value={f.gender} onChange={v=>update('gender',v)} options={GENDERS} />
    <Field label="Date of Birth" type="date" value={f.dob} onChange={v=>update('dob',v)} />
    <Field label="Age" value={f.age} onChange={()=>{}} readOnly hint="Auto-calculated from DOB" />
    <Field label="Aadhaar" value={f.aadhaar} onChange={v=>update('aadhaar',digitsOnly(v,12))} inputMode="numeric" maxLength="12" />
    <Field label="Mobile" value={f.mobile} onChange={v=>update('mobile',digitsOnly(v,10))} inputMode="numeric" maxLength="10" />
    <Field label="Marital Status" type="select" value={f.marital_status} onChange={v=>update('marital_status',v)} options={MARITAL_STATUSES} />
    <Field label="Occupation" value={f.occupation} onChange={v=>update('occupation',v)} />
    <Field label="Education" value={f.education_status} onChange={v=>update('education_status',v)} />
    <Field label="Dependent?" type="select" value={f.dependent} onChange={v=>update('dependent',v)} options={['Yes','No']} />
    <Field label="Already receiving benefit?" type="select" value={f.gov_benefit} onChange={v=>update('gov_benefit',v)} options={['Yes','No']} />
  </div>{Number(f.age) < 18 && f.age !== '' && <label className="check"><input type="checkbox" checked={!!f.guardian_declaration} onChange={e=>update('guardian_declaration', e.target.checked ? 1 : 0)} /> Parent/guardian declaration confirmed for minor family member</label>}<button onClick={add}>Add Family Member</button><button className="secondary" onClick={next}>Continue</button></div>;
}
function SchemeStep({ appData, next, setNotice }) { const { t, tv } = useI18n(); const initial={}; (appData.scheme_selections||[]).forEach(s=>initial[s.scheme_name]=s.details||{}); const [selected,setSelected]=useState(initial); function toggle(s){ const n={...selected}; if(n[s]) delete n[s]; else n[s]={}; setSelected(n);} function setDetail(s,k,v){ setSelected({...selected,[s]:{...(selected[s]||{}),[k]:v}}); } async function save(){try{await api('/citizen/application/schemes',{method:'PUT',body:JSON.stringify({schemes:selected})});setNotice(t('Scheme selections saved'));next();}catch(e){setNotice(e.message)}} return <div className="formCard"><h2>{t('Scheme Selection')}</h2><div className="schemeCards">{SCHEMES.map(s=><div className={`schemeCard ${selected[s]?'selected':''}`} key={s} onClick={()=>toggle(s)}><h3>{tv(s)}</h3><p>{selected[s]?t('Selected'):t('Tap to select')}</p>{selected[s] && <input onClick={e=>e.stopPropagation()} placeholder={t('Eligibility detail / reference number')} value={selected[s].reference||''} onChange={e=>setDetail(s,'reference',e.target.value)} />}</div>)}</div><button onClick={save}>{t('Save and Continue')}</button></div>; }
function ReviewStep({ appData, reload, setNotice, back }) { const { t, tv } = useI18n(); async function submit(){try{await api('/citizen/application/submit',{method:'POST'});setNotice(t('Application registered'));await reload();back();}catch(e){setNotice(e.message)}} return <div className="formCard"><h2>{t('Review and Submit')}</h2><p><b>{t('Applicant:')}</b> {appData.applicant_name}</p><p><b>{t('Aadhaar')}:</b> {appData.aadhaar_masked}</p><p><b>{t('Address:')}</b> {tv(appData.address?.district)}, {appData.address?.taluk}</p><p><b>{t('Schemes:')}</b> {(appData.scheme_selections||[]).map(s=>tv(s.scheme_name)).join(', ')}</p><label className="check"><input type="checkbox" checked readOnly /> {t('I confirm the information is true and consent to its use for eligibility assessment and registration.')}</label><button onClick={submit}>{t('Register Application')}</button></div>; }
function PrivacyRights({ appData, back, setNotice }) { const { t, tv } = useI18n(); const [type,setType]=useState('Correction'); const [desc,setDesc]=useState(''); async function submitPrivacy(){try{await api('/citizen/privacy-request',{method:'POST',body:JSON.stringify({application_id:appData.id,request_type:type,description:desc})});setNotice(t('Privacy request submitted'));setDesc('');}catch(e){setNotice(e.message)}} async function submitGrievance(){try{await api('/citizen/grievance',{method:'POST',body:JSON.stringify({application_id:appData.id,category:type,description:desc})});setNotice(t('Grievance submitted'));setDesc('');}catch(e){setNotice(e.message)}} return <div className="formCard"><button className="secondary" onClick={back}>{t('Back')}</button><h2>{t('My Data & Privacy Rights')}</h2><p>{t('Application:')} {appData.application_no}. {t('Aadhaar is stored and displayed in masked form in this prototype.')}</p><select value={type} onChange={e=>setType(e.target.value)}>{['Correction','Update','Grievance','Deletion request where legally permitted'].map(x=><option key={x} value={x}>{t(x)}</option>)}</select><textarea placeholder={t('Describe your request')} value={desc} onChange={e=>setDesc(e.target.value)} /><button onClick={submitPrivacy}>{t('Submit Privacy Request')}</button><button className="secondary" onClick={submitGrievance}>{t('Submit Grievance')}</button></div>; }

function CallCenter({ setNotice }) { return <main className="appGrid single"><section className="content"><ApplicationsPanel mode="callcenter" setNotice={setNotice}/></section></main>; }

function PublicStats() {
  const { t, tv } = useI18n();
  const [data,setData]=useState(null); const [district,setDistrict]=useState(''); const [scheme,setScheme]=useState(''); const [activeTile,setActiveTile]=useState('');
  async function load(){ const p=new URLSearchParams(Object.entries({district,scheme}).filter(([_,v])=>v)); const d=await api(`/public/enrollment-statistics?${p}`); setData(d); }
  function focusTile(name){ setActiveTile(name); setTimeout(()=>document.getElementById('public-details')?.scrollIntoView({behavior:'smooth', block:'start'}), 50); }
  useEffect(()=>{load();},[]);
  if(!data) return <Loading/>;
  const total = Number(data.summary.total_registrations || 0);
  const approved = Number(data.summary.approved || 0);
  const review = Number(data.summary.under_review || 0);
  const registered = Number(data.summary.registered || 0);
  const approvalRate = total ? Math.round((approved/total)*100) : 0;
  return <>
    <header className="publicHero">
      <nav><div className="brandSeal">ಕರ್ನಾಟಕ</div><div><h1>{t('Karnataka Guarantee Schemes')}</h1><p>{t('Public Enrollment Statistics')}</p></div><LanguageToggle /><a href="/">{t('Portal Login')}</a></nav>
      <section className="publicHeroBody">
        <div><span className="eyebrow">{t('Aggregated public dashboard')}</span><h2>{t('Transparent enrollment view for Karnataka’s 5 Guarantee Schemes')}</h2><p>{t('No personal citizen information, Aadhaar details, mobile numbers, addresses, or bank details are displayed.')} {t('Last updated:')} {data.last_updated}</p></div>
        <div className="heroStat"><small>{t('Overall Approval Rate')}</small><strong>{approvalRate}%</strong><span>{approved} {t('approved of')} {total} {t('registrations')}</span></div>
      </section>
    </header>
    <main className="publicModern">
      <section className="filterPanel"><div><b>{t('Explore Statistics')}</b><p>{t('Filter by district or scheme')}</p></div><select value={district} onChange={e=>setDistrict(e.target.value)}><option value="">{t('All Districts')}</option>{DISTRICTS.map(d=><option key={d} value={d}>{tv(d)}</option>)}</select><select value={scheme} onChange={e=>setScheme(e.target.value)}><option value="">{t('All Schemes')}</option>{SCHEMES.map(s=><option key={s} value={s}>{tv(s)}</option>)}</select><button onClick={load}>{t('Apply Filters')}</button></section>
      <section className="kpiRibbon"><Metric label="Total Registrations" value={total} onClick={()=>focusTile('Total Registrations')} /><Metric label="Registered" value={registered} onClick={()=>focusTile('Registered')} /><Metric label="Under Review" value={review} onClick={()=>focusTile('Under Review')} /><Metric label="Approved" value={approved} onClick={()=>focusTile('Approved')} /><Metric label="Rejected" value={data.summary.rejected} onClick={()=>focusTile('Rejected')} /></section>
      {activeTile && <section id="public-details" className="publicFooterNote"><b>{t('Related details')}:</b> {t(activeTile)} — {t('Public statistics are aggregated and do not expose personal information.')}</section>}
      <section className="publicDashboardGrid"><div className="spotlightPanel clickableTile" role="button" tabIndex="0" onClick={()=>focusTile('Scheme Enrollment Share')}><h3>{t('Scheme Enrollment Share')}</h3><p>{t('Scheme-wise count of applications received.')}</p><Chart title="" rows={data.scheme_wise} onRowClick={(r)=>{setScheme(r.label); focusTile(r.label);}}/></div><div className="spotlightPanel clickableTile" role="button" tabIndex="0" onClick={()=>focusTile('District Coverage')}><h3>{t('District Coverage')}</h3><p>{t('District-wise participation across the portal.')}</p><Chart title="" rows={data.district_wise} onRowClick={(r)=>{setDistrict(r.label); focusTile(r.label);}}/></div><div className="spotlightPanel clickableTile" role="button" tabIndex="0" onClick={()=>focusTile('Application Pipeline')}><h3>{t('Application Pipeline')}</h3><p>{t('Registered applications move to batch Aadhaar verification and then eligibility review.')}</p><Chart title="" rows={data.status} onRowClick={(r)=>focusTile(r.label)}/></div><div className="spotlightPanel clickableTile" role="button" tabIndex="0" onClick={()=>focusTile('Daily Trend')}><h3>{t('Daily Trend')}</h3><p>{t('Registrations over time.')}</p><Chart title="" rows={data.trend} onRowClick={(r)=>focusTile(r.label)}/></div></section>
      <section className="publicFooterNote"><b>{t('Privacy note:')}</b> {t(data.disclaimer)} {t('Small-count suppression should be increased for production deployment where re-identification risk exists.')}</section>
    </main>
  </>;
}

function Metric({ label, value, onClick }) { const { t, tv } = useI18n(); const content=<><span>{t(label)}</span><strong>{typeof value === 'string' ? tv(value) : value}</strong>{onClick && <em className="tileHint">{t('Open Details')}</em>}</>; return onClick ? <button type="button" className="metric metricButton" onClick={onClick}>{content}</button> : <div className="metric">{content}</div>; }
function Chart({ title, rows=[], onRowClick }) { const { t, tv } = useI18n(); const max = Math.max(1,...rows.map(r=>Number(r.value)||0)); return <div className="chart"><h3>{t(title)}</h3>{rows.length===0 && <p>{t('No data')}</p>}{rows.map((r,i)=>{ const row=<><span>{tv(r.label || 'Not specified')}</span><div><b style={{width:`${((Number(r.value)||0)/max)*100}%`}}></b></div><em>{r.value}</em></>; return onRowClick ? <button type="button" className="barRow barRowButton" key={i} onClick={(e)=>{e.stopPropagation(); onRowClick(r);}}>{row}</button> : <div className="barRow" key={i}>{row}</div>; })}</div>; }
function Info({ label, value }) { const { t, tv } = useI18n(); return <div className="info"><span>{t(label)}</span><b>{tv(value) || '-'}</b></div>; }
function Loading(){ const { t } = useI18n(); return <div className="loading">{t('Loading…')}</div>; }
function title(x){ return x.replace(/[-_]/g,' ').replace(/\b\w/g, m=>m.toUpperCase()); }

createRoot(document.getElementById('root')).render(<I18nProvider><App /></I18nProvider>);
