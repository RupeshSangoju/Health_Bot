// Replace C:\Users\rupes\Portifolio\Health Bot\frontend\src\components\Diagnostics.js
import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';

function Diagnostics({ user, darkMode, onClose }) {
  const { t } = useTranslation();
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [manualLocation, setManualLocation] = useState('');
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [diabetesResult, setDiabetesResult] = useState(null);
  const [heartDiseaseResult, setHeartDiseaseResult] = useState(null);
  const [mentalHealthResult, setMentalHealthResult] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [diabetesInputs, setDiabetesInputs] = useState({
    age: '',
    bmi: '',
    skin_thickness: '',
    glucose: '',
    physical_activity: 'Moderate',
  });
  const [heartDiseaseInputs, setHeartDiseaseInputs] = useState({
    age: '',
    blood_pressure: '',
    smoking: 0,
    bmi: '',
    chest_pain: 'Typical Angina',
  });
  const [mentalHealthInputs, setMentalHealthInputs] = useState({
    age: '',
    sleep_quality: 'Fair',
    mood_frequency: 'Rarely',
    social_activity: 'Moderate',
    mental_health_history: 0,
  });

  const symptomOptions = [
    { value: 'fever', label: t('fever') },
    { value: 'headache', label: t('headache') },
    { value: 'cough', label: t('cough') },
    { value: 'diarrhea', label: t('diarrhea') },
    { value: 'vomiting', label: t('vomiting') },
    { value: 'shortness_of_breath', label: t('shortness_of_breath') },
    { value: 'pain_chest', label: t('pain_chest') },
    { value: 'fatigue', label: t('fatigue') },
    { value: 'chills', label: t('chills') },
    { value: 'sore_to_touch', label: t('sore_to_touch') },
  ];

  const serviceOptions = [
    { value: 'disease_prediction', label: t('disease_prediction') },
    { value: 'diabetes_risk', label: t('diabetes_risk') },
    { value: 'heart_disease_risk', label: t('heart_disease_risk') },
    { value: 'mental_health_screening', label: t('mental_health_screening') },
    { value: 'nearby_hospitals', label: t('nearby_hospitals') },
  ];

  const chestPainOptions = [
    { value: 'Typical Angina', label: t('typical_angina') },
    { value: 'Atypical Angina', label: t('atypical_angina') },
    { value: 'Non-anginal Pain', label: t('non_anginal_pain') },
    { value: 'Asymptomatic', label: t('asymptomatic') },
  ];

  const handlePredictDisease = async () => {
    if (selectedSymptoms.length === 0) {
      setError(t('select_symptoms'));
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      selectedSymptoms.forEach((symptom) => formData.append(symptom.value, '1'));
      const response = await axios.post('http://localhost:5001/predict/disease', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiseaseResult(response.data);
    } catch (error) {
      setError(t('server_error') + ': ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredictDiabetes = async () => {
    const { age, bmi, skin_thickness, glucose } = diabetesInputs;
    if (!age || !bmi || !skin_thickness || !glucose) {
      setError(t('fill_all_fields'));
      return;
    }
    if (isNaN(parseFloat(age)) || isNaN(parseFloat(bmi)) || isNaN(parseFloat(skin_thickness)) || isNaN(parseFloat(glucose))) {
      setError(t('invalid_numbers'));
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const inputs = {
        age: parseFloat(age),
        bmi: parseFloat(bmi),
        skin_thickness: parseFloat(skin_thickness),
        glucose: parseFloat(glucose),
        physical_activity: diabetesInputs.physical_activity,
      };
      const response = await axios.post('http://localhost:5001/predict/diabetes', inputs, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiabetesResult(response.data);
    } catch (error) {
      setError(t('server_error') + ': ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredictHeartDisease = async () => {
    const { age, blood_pressure, bmi } = heartDiseaseInputs;
    if (!age || !blood_pressure || !bmi) {
      setError(t('fill_all_fields'));
      return;
    }
    if (isNaN(parseFloat(age)) || isNaN(parseFloat(blood_pressure)) || isNaN(parseFloat(bmi))) {
      setError(t('invalid_numbers'));
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const inputs = {
        age: parseFloat(age),
        blood_pressure: parseFloat(blood_pressure),
        smoking: parseInt(heartDiseaseInputs.smoking),
        bmi: parseFloat(bmi),
        chest_pain: heartDiseaseInputs.chest_pain,
      };
      const response = await axios.post('http://localhost:5001/predict/heart_disease', inputs, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHeartDiseaseResult(response.data);
    } catch (error) {
      setError(t('server_error') + ': ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredictMentalHealth = async () => {
    const { age } = mentalHealthInputs;
    if (!age) {
      setError(t('fill_all_fields'));
      return;
    }
    if (isNaN(parseFloat(age))) {
      setError(t('invalid_numbers'));
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const inputs = {
        age: parseFloat(age || '0'),
        sleep_quality: mentalHealthInputs.sleep_quality,
        mood_frequency: mentalHealthInputs.mood_frequency,
        social_activity: mentalHealthInputs.social_activity,
        mental_health_history: parseInt(mentalHealthInputs.mental_health_history),
      };
      const response = await axios.post('http://localhost:5001/predict/mental_health', inputs, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMentalHealthResult(response.data);
    } catch (error) {
      setError(t('server_error') + ': ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindHospitals = async () => {
    let coords;
    if (manualLocation) {
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { q: manualLocation, format: 'json' },
        });
        if (response.data.length > 0) {
          coords = {
            latitude: parseFloat(response.data[0].lat),
            longitude: parseFloat(response.data[0].lon),
          };
        } else {
          setError(t('invalid_location'));
          return;
        }
      } catch (error) {
        setError(t('geocode_failed') + ': ' + error.message);
        return;
      }
    } else {
      try {
        coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            () => reject(new Error(t('location_denied')))
          );
        });
      } catch (error) {
        setError(error.message);
        return;
      }
    }

    setIsLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const response = await axios.post('http://localhost:5001/hospitals', {
        lat: coords.latitude,
        lon: coords.longitude,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHospitals(response.data.hospitals || []);
    } catch (error) {
      setError(t('server_error') + ': ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const renderServiceOptions = () => {
    switch (selectedService?.value) {
      case 'disease_prediction':
        return (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{t('disease_prediction')}</h3>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('select_symptoms')}</span>
              <Select
                isMulti
                options={symptomOptions}
                value={selectedSymptoms}
                onChange={setSelectedSymptoms}
                placeholder={t('select_symptoms_placeholder')}
                className="mb-2"
                isOptionDisabled={() => selectedSymptoms.length >= 3}
              />
            </label>
            <button
              onClick={handlePredictDisease}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
              disabled={isLoading}
            >
              {t('predict_disease')}
            </button>
            {diseaseResult && (
              <div className="mt-4">
                {diseaseResult.map((result, index) => (
                  <div key={index} className="mb-2">
                    <p><strong>{t('result')} {index + 1}:</strong> {result.disease || t('unknown')}</p>
                    <p><strong>{t('confidence')}:</strong> {(result.confidence * 100).toFixed(2)}%</p>
                  </div>
                ))}
                <p className="text-red-500">{t('disclaimer')}</p>
                <button
                  className="mt-2 text-blue-500 hover:underline"
                  onClick={() => alert(t('discuss_prompt'))}
                >
                  {t('discuss_prompt')}
                </button>
              </div>
            )}
          </div>
        );
      case 'diabetes_risk':
        return (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{t('diabetes_risk')}</h3>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('age')}</span>
              <input
                type="number"
                placeholder={t('age')}
                value={diabetesInputs.age}
                onChange={(e) => setDiabetesInputs({ ...diabetesInputs, age: e.target.value })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              />
            </label>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('bmi')}</span>
              <input
                type="number"
                placeholder={t('bmi')}
                value={diabetesInputs.bmi}
                onChange={(e) => setDiabetesInputs({ ...diabetesInputs, bmi: e.target.value })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              />
            </label>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('skin_thickness')}</span>
              <input
                type="number"
                placeholder={t('skin_thickness')}
                value={diabetesInputs.skin_thickness}
                onChange={(e) => setDiabetesInputs({ ...diabetesInputs, skin_thickness: e.target.value })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              />
            </label>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('glucose')}</span>
              <input
                type="number"
                placeholder={t('glucose')}
                value={diabetesInputs.glucose}
                onChange={(e) => setDiabetesInputs({ ...diabetesInputs, glucose: e.target.value })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              />
            </label>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('physical_activity')}</span>
              <select
                value={diabetesInputs.physical_activity}
                onChange={(e) => setDiabetesInputs({ ...diabetesInputs, physical_activity: e.target.value })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              >
                <option value="High">{t('high')}</option>
                <option value="Moderate">{t('moderate')}</option>
                <option value="Low">{t('low')}</option>
              </select>
            </label>
            <button
              onClick={handlePredictDiabetes}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
              disabled={isLoading}
            >
              {t('predict_diabetes')}
            </button>
            {diabetesResult && (
              <div className="mt-4">
                <p><strong>{t('result')}:</strong> {diabetesResult.risk}</p>
                <p><strong>{t('confidence')}:</strong> {(diabetesResult.confidence * 100).toFixed(2)}%</p>
                <p className="text-red-500">{t('disclaimer')}</p>
              </div>
            )}
          </div>
        );
      case 'heart_disease_risk':
        return (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{t('heart_disease_risk')}</h3>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('age')}</span>
              <input
                type="number"
                placeholder={t('age')}
                value={heartDiseaseInputs.age}
                onChange={(e) => setHeartDiseaseInputs({ ...heartDiseaseInputs, age: e.target.value })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              />
            </label>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('blood_pressure')}</span>
              <input
                type="number"
                placeholder={t('blood_pressure')}
                value={heartDiseaseInputs.blood_pressure}
                onChange={(e) => setHeartDiseaseInputs({ ...heartDiseaseInputs, blood_pressure: e.target.value })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              />
            </label>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('smoking')}</span>
              <select
                value={heartDiseaseInputs.smoking}
                onChange={(e) => setHeartDiseaseInputs({ ...heartDiseaseInputs, smoking: parseInt(e.target.value) })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              >
                <option value="0">{t('non_smoker')}</option>
                <option value="1">{t('smoker')}</option>
              </select>
            </label>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('bmi')}</span>
              <input
                type="number"
                placeholder={t('bmi')}
                value={heartDiseaseInputs.bmi}
                onChange={(e) => setHeartDiseaseInputs({ ...heartDiseaseInputs, bmi: e.target.value })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              />
            </label>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('chest_pain')}</span>
              <select
                value={heartDiseaseInputs.chest_pain}
                onChange={(e) => setHeartDiseaseInputs({ ...heartDiseaseInputs, chest_pain: e.target.value })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              >
                {chestPainOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <button
              onClick={handlePredictHeartDisease}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
              disabled={isLoading}
            >
              {t('predict_heart_disease')}
            </button>
            {heartDiseaseResult && (
              <div className="mt-4">
                <p><strong>{t('result')}:</strong> {heartDiseaseResult.risk}</p>
                <p><strong>{t('confidence')}:</strong> {(heartDiseaseResult.confidence * 100).toFixed(2)}%</p>
                <p className="text-red-500">{t('disclaimer')}</p>
              </div>
            )}
          </div>
        );
      case 'mental_health_screening':
        return (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{t('mental_health_screening')}</h3>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('age')}</span>
              <input
                type="number"
                placeholder={t('age')}
                value={mentalHealthInputs.age}
                onChange={(e) => setMentalHealthInputs({ ...mentalHealthInputs, age: e.target.value })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              />
            </label>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('sleep_quality')}</span>
              <select
                value={mentalHealthInputs.sleep_quality}
                onChange={(e) => setMentalHealthInputs({ ...mentalHealthInputs, sleep_quality: e.target.value })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              >
                <option value="Good">{t('good')}</option>
                <option value="Fair">{t('fair')}</option>
                <option value="Poor">{t('poor')}</option>
              </select>
            </label>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('mood_frequency')}</span>
              <select
                value={mentalHealthInputs.mood_frequency}
                onChange={(e) => setMentalHealthInputs({ ...mentalHealthInputs, mood_frequency: e.target.value })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              >
                <option value="Often">{t('often')}</option>
                <option value="Rarely">{t('rarely')}</option>
              </select>
            </label>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('social_activity')}</span>
              <select
                value={mentalHealthInputs.social_activity}
                onChange={(e) => setMentalHealthInputs({ ...mentalHealthInputs, social_activity: e.target.value })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              >
                <option value="High">{t('high')}</option>
                <option value="Moderate">{t('moderate')}</option>
                <option value="Low">{t('low')}</option>
              </select>
            </label>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('mental_health_history')}</span>
              <select
                value={mentalHealthInputs.mental_health_history}
                onChange={(e) => setMentalHealthInputs({ ...mentalHealthInputs, mental_health_history: parseInt(e.target.value) })}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              >
                <option value="0">{t('no')}</option>
                <option value="1">{t('yes')}</option>
              </select>
            </label>
            <button
              onClick={handlePredictMentalHealth}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
              disabled={isLoading}
            >
              {t('predict_mental_health')}
            </button>
            {mentalHealthResult && (
              <div className="mt-4">
                <p><strong>{t('result')}:</strong> {mentalHealthResult.risk}</p>
                <p><strong>{t('confidence')}:</strong> {(mentalHealthResult.confidence * 100).toFixed(2)}%</p>
                <p className="text-red-500">{t('disclaimer')}</p>
              </div>
            )}
          </div>
        );
      case 'nearby_hospitals':
        return (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{t('nearby_hospitals')}</h3>
            <label className="block mb-2">
              <span className="block text-sm font-medium mb-1">{t('location')}</span>
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder={t('enter_location')}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleFindHospitals}
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                disabled={isLoading}
              >
                {manualLocation ? t('find_hospitals') : t('use_location')}
              </button>
              {manualLocation && (
                <button
                  onClick={() => setManualLocation('')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600"
                >
                  {t('clear')}
                </button>
              )}
            </div>
            {hospitals.length > 0 && (
              <ul className="mt-4">
                {hospitals.map((hospital, index) => (
                  <li key={index} className="mb-2">
                    <p><strong>{hospital.name || t('unknown')}</strong></p>
                    <p>{t('address')}: {hospital.address || t('no_address')}</p>
                    <p>{t('phone')}: {hospital.phone || t('no_phone')}</p>
                    <p>{t('distance')}: {hospital.distance ? `${hospital.distance.toFixed(2)} km` : t('na')}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      default:
        return <p className="text-gray-500">{t('select_service')}</p>;
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-xl font-bold mb-4">{t('diagnostics')}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Select
        options={serviceOptions}
        value={selectedService}
        onChange={setSelectedService}
        placeholder={t('select_service')}
        className="mb-4"
      />
      {renderServiceOptions()}
      {isLoading && (
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <button
        onClick={onClose}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
      >
        {t('close')}
      </button>
    </div>
  );
}

export default Diagnostics;