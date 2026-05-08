import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import carsData from '../data/cars.json';
import { useVehicle } from '../context/VehicleContext';
import { useGarage } from '../context/GarageContext';

export default function VehicleSelectionPage() {
  const navigate = useNavigate();
  const { selectedVehicle, setSelectedVehicle } = useVehicle();
  const { clearGarage } = useGarage();

  const [selectedMake,   setSelectedMake]   = useState('');
  const [selectedModel,  setSelectedModel]  = useState('');
  const [selectedYear,   setSelectedYear]   = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');

  const currentMake      = carsData.find(m => m.id === selectedMake);
  const availableModels  = currentMake?.models ?? [];
  const currentModel     = availableModels.find(m => m.id === selectedModel);
  const availableYears   = currentModel?.years ?? [];
  const currentYear      = availableYears.find(y => y.year === Number(selectedYear));
  const availableEngines = currentYear?.engines ?? [];

  const handleMakeChange = (e) => {
    setSelectedMake(e.target.value);
    setSelectedModel('');
    setSelectedYear('');
    setSelectedEngine('');
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setSelectedYear('');
    setSelectedEngine('');
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setSelectedEngine('');
  };

  const isFormComplete = selectedMake && selectedModel && selectedYear && selectedEngine;

  const handleContinue = () => {
    const engine     = availableEngines.find(e => e.id === selectedEngine);
    const isNewVehicle = !selectedVehicle ||
      selectedVehicle.engine.id !== engine.id;

    if (isNewVehicle) clearGarage();

    setSelectedVehicle({
      makeId:    currentMake.id,
      makeName:  currentMake.make,
      modelId:   currentModel.id,
      modelName: currentModel.name,
      year:      Number(selectedYear),
      engine,
    });
    navigate('/catalog');
  };

  const selectClass =
    'w-full bg-[#121212] border border-[#2D2D2D] rounded text-[#E0E0E0] p-3 font-body-md text-body-md appearance-none focus:border-primary-container focus:ring-0 cursor-pointer pl-10 disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 md:pb-8 min-h-screen relative">

      {/* Background Engine Image */}
      <div
        className="absolute inset-0 z-0 opacity-10 mix-blend-luminosity bg-cover bg-center"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBurEgOH3jmw4eP2CFysB37rBzR1e4jguvbCXMmSgXy_LdyIj0Dt_4LflY0ZcbQ0nRomlIvMXFZ4bPCtz4SZ38MQj-1c_qeUmZATwJ8dY7uD-CB0iA11TPi2k_ug22YT7VK54m_28VUg2davlnVadi5crMA3P57aIiiT5H4tWe5tNHxBK1zvkhJHC4467uzSrInD9VO1VTO9AYe9cICqc3W8s6tP8Mm8cFIFmZBSilUSwMIX3iZbmvqwhBR6EioeMI43dCkoG72YTw')" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-lg">

        {/* Page Header */}
        <header className="mb-xl text-right">
          <div className="flex items-center gap-2 justify-end mb-2">
            <span className="font-h1 text-h1 text-primary-container">בחירת רכב</span>
            <span className="font-h2 text-h2 text-[#474747] opacity-60">(VEHICLE SELECTION)</span>
          </div>
          <p className="font-body-lg text-body-lg text-secondary">
            בחר את נתוני הרכב כדי להציג חלפים ושיפורים שמתאימים במדויק לדגם שלך.
          </p>
        </header>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

          {/* Manual Configuration Panel */}
          <section className="lg:col-span-8 bg-[#1E1E1E] border border-[#2D2D2D] rounded p-md shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-6 border-b border-[#2D2D2D] pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">tune</span>
                <div>
                  <h2 className="font-h2 text-h2 text-primary-container">הגדרת יעד</h2>
                  <span className="font-label-caps text-label-caps text-[#474747]">(CONFIGURE TARGET)</span>
                </div>
              </div>
              <button className="flex items-center gap-1 text-primary-container border border-primary-container rounded px-3 py-1 font-mono-data text-mono-data hover:bg-primary-container hover:text-[#121212] transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                <span className="material-symbols-outlined text-sm">keyboard</span>
                הזנה ידנית
              </button>
            </div>

            {/* 4-Step Cascading Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

              {/* 1 – Make */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-secondary">יצרן (Make)</label>
                <div className="relative">
                  <select className={selectClass} dir="rtl" value={selectedMake} onChange={handleMakeChange}>
                    <option value="" disabled>בחר יצרן (Select Make)</option>
                    {carsData.map(make => (
                      <option key={make.id} value={make.id}>{make.make}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-3 text-secondary pointer-events-none">arrow_drop_down</span>
                </div>
              </div>

              {/* 2 – Model */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-secondary">דגם (Model)</label>
                <div className="relative">
                  <select className={selectClass} dir="rtl" value={selectedModel} onChange={handleModelChange} disabled={!selectedMake}>
                    <option value="" disabled>בחר דגם (Select Model)</option>
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-3 text-[#474747] pointer-events-none">arrow_drop_down</span>
                </div>
              </div>

              {/* 3 – Year */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-secondary">שנה (Year)</label>
                <div className="relative">
                  <select className={selectClass} dir="rtl" value={selectedYear} onChange={handleYearChange} disabled={!selectedModel}>
                    <option value="" disabled>בחר שנה (Select Year)</option>
                    {availableYears.map(y => (
                      <option key={y.year} value={y.year}>{y.year}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-3 text-[#474747] pointer-events-none">arrow_drop_down</span>
                </div>
              </div>

              {/* 4 – Engine */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-secondary">מנוע (Engine)</label>
                <div className="relative">
                  <select className={selectClass} dir="rtl" value={selectedEngine} onChange={(e) => setSelectedEngine(e.target.value)} disabled={!selectedYear}>
                    <option value="" disabled>בחר מנוע (Select Engine)</option>
                    {availableEngines.map(engine => (
                      <option key={engine.id} value={engine.id}>{engine.label}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-3 text-[#474747] pointer-events-none">arrow_drop_down</span>
                </div>
              </div>

            </div>

            {/* CTA */}
            <button
              onClick={handleContinue}
              disabled={!isFormComplete}
              className="w-full bg-primary-container text-[#121212] font-bold py-4 rounded font-label-caps text-label-caps flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_2px_4px_rgba(0,0,0,0.5)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">power_settings_new</span>
              המשך לקטלוג
            </button>
          </section>

          {/* VIN Scan Panel */}
          <section className="lg:col-span-4 bg-[#1E1E1E] border border-[#2D2D2D] rounded p-md flex flex-col shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 mb-4 border-b border-[#2D2D2D] pb-4">
              <span className="material-symbols-outlined text-primary-container">qr_code_scanner</span>
              <div>
                <h2 className="font-h2 text-h2 text-primary-container">סריקת מספר שלדה</h2>
                <span className="font-label-caps text-label-caps text-[#474747]">(VIN SCAN)</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-[#121212] border border-[#2D2D2D] border-dashed rounded mb-4">
              <span className="material-symbols-outlined text-4xl text-[#474747] mb-2">view_in_ar</span>
              <p className="font-body-md text-body-md text-secondary px-4">
                זיהוי אוטומטי של נתוני הרכב באמצעות סריקת מספר שלדה (VIN).
              </p>
            </div>
            <button className="w-full border border-primary-container text-primary-container font-bold py-3 rounded font-label-caps text-label-caps flex items-center justify-center gap-2 hover:bg-primary-container hover:text-[#121212] transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <span className="material-symbols-outlined">document_scanner</span>
              הפעל סורק (LAUNCH SCANNER)
            </button>
          </section>
        </div>

        {/* Recent Platforms */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary-container">history</span>
            <div>
              <h2 className="font-h2 text-h2 text-primary-container">רכבים אחרונים</h2>
              <span className="font-label-caps text-label-caps text-[#474747]">(RECENT PLATFORMS)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">

            <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded p-md shadow-[0_2px_4px_rgba(0,0,0,0.5)] cursor-pointer hover:border-primary-container transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 bg-primary-container h-full" />
              <div className="flex justify-between items-start mb-2">
                <span className="inline-block bg-[#00C853] text-black font-label-caps text-[10px] uppercase px-2 py-1 rounded-sm">
                  שמור בגראז' (SAVED IN GARAGE)
                </span>
                <span className="material-symbols-outlined text-secondary group-hover:text-primary-container transition-colors">arrow_outward</span>
              </div>
              <h3 className="font-h2 text-h2 text-on-surface mb-1" dir="ltr">2021 Volkswagen Golf GTI</h3>
              <p className="font-mono-data text-mono-data text-secondary" dir="ltr">GTI • 2.0T EA888 Gen4</p>
            </div>

            <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded p-md shadow-[0_2px_4px_rgba(0,0,0,0.5)] cursor-pointer hover:border-primary-container transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-block bg-[#353534] text-secondary font-label-caps text-[10px] uppercase px-2 py-1 rounded-sm">
                  נצפה לאחרונה (RECENTLY VIEWED)
                </span>
                <span className="material-symbols-outlined text-secondary group-hover:text-primary-container transition-colors">arrow_outward</span>
              </div>
              <h3 className="font-h2 text-h2 text-on-surface mb-1" dir="ltr">2022 Hyundai i30 N</h3>
              <p className="font-mono-data text-mono-data text-secondary" dir="ltr">PERFORMANCE • 2.0T G4KH</p>
            </div>

            <div className="bg-[#121212] border border-[#2D2D2D] border-dashed rounded p-md flex flex-col items-center justify-center cursor-pointer hover:border-primary-container hover:text-primary-container transition-colors text-secondary min-h-[120px]">
              <span className="material-symbols-outlined text-3xl mb-2">add_circle</span>
              <span className="font-label-caps text-label-caps uppercase">הוסף רכב חדש (New Garage Entry)</span>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
