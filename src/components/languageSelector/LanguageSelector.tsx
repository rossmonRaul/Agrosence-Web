import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '/us.png' },
    { code: 'es', name: 'Español', flag: '/es.png' },
    { code: 'de', name: 'Deutsch', flag: '/de.png' }, // Añadir alemán
  ];

  const handleChangeLanguage = (code:any) => {
    setSelectedLanguage(code);
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px',
          fontSize: '16px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#fff',
          width: '190px',
          //height:'30%',
          justifyContent: 'space-between',
        }}
      >
        <img
          src={
            selectedLanguage === 'en'
              ? '/us.png'
              : selectedLanguage === 'es'
              ? '/es.png'
              : '/de.png'
          } // Añadir condición para la bandera alemana
          alt={selectedLanguage}
          style={{ width: '20px', height: '15px', marginRight: '10px' }}
        />
        <span>
          {selectedLanguage === 'en'
            ? 'English'
            : selectedLanguage === 'es'
            ? 'Español'
            : 'Deutsch'}
        </span>
        <span style={{ marginLeft: '10px' }}>▼</span>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            zIndex: 1,
          }}
        >
          {languages.map(({ code, name, flag }) => (
            <div
              key={code}
              onClick={() => handleChangeLanguage(code)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img
                src={flag}
                alt={name}
                style={{ width: '20px', height: '15px', marginRight: '10px' }}
              />
              <span>{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;