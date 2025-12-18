import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: { home: 'Home', report: 'Report', map: 'Map', hospitals: 'Hospitals', ngos: 'NGOs', about: 'About' },
      home: { title: 'Disaster Alerts', sos: 'Emergency SOS', latestIncidents: 'Latest Incidents' },
      report: { title: 'Report an Incident', type: 'Type', description: 'Description', submit: 'Submit Report', location: 'Location' },
      map: { title: 'Interactive Map' },
      hospitals: { title: 'Nearby Hospitals & Relief Centers' },
      ngos: { title: 'NGO Directory', register: 'Register NGO' },
      about: { title: 'About IDMRS' },
      sos: { request: 'Request Ambulance' }
    }
  },
  hi: {
    translation: {
      nav: { home: 'होम', report: 'रिपोर्ट', map: 'मानचित्र', hospitals: 'अस्पताल', ngos: 'एनजीओ', about: 'हमारे बारे में' },
      home: { title: 'आपदा अलर्ट', sos: 'आपातकालीन एसओएस', latestIncidents: 'नवीनतम घटनाएँ' },
      report: { title: 'घटना दर्ज करें', type: 'प्रकार', description: 'विवरण', submit: 'सबमिट', location: 'स्थान' },
      map: { title: 'इंटरैक्टिव मानचित्र' },
      hospitals: { title: 'नज़दीकी अस्पताल और राहत केंद्र' },
      ngos: { title: 'एनजीओ निर्देशिका', register: 'एनजीओ पंजीकरण' },
      about: { title: 'आईडीएमआरएस के बारे में' },
      sos: { request: 'एम्बुलेंस अनुरोध' }
    }
  },
  bn: {
    translation: {
      nav: { home: 'হোম', report: 'রিপোর্ট', map: 'মানচিত্র', hospitals: 'হাসপাতাল', ngos: 'এনজিও', about: 'পরিচিতি' },
      home: { title: 'দুর্যোগ সতর্কতা', sos: 'জরুরি এসওএস', latestIncidents: 'সর্বশেষ ঘটনা' },
      report: { title: 'ঘটনা রিপোর্ট করুন', type: 'ধরন', description: 'বিবরণ', submit: 'জমা দিন', location: 'অবস্থান' },
      map: { title: 'ইন্টারেক্টিভ মানচিত্র' },
      hospitals: { title: 'নিকটস্থ হাসপাতাল ও রিলিফ সেন্টার' },
      ngos: { title: 'এনজিও ডিরেক্টরি', register: 'এনজিও রেজিস্ট্রেশন' },
      about: { title: 'আইডিএমআরএস পরিচিতি' },
      sos: { request: 'অ্যাম্বুলেন্স অনুরোধ' }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en'
});

export default i18n;


