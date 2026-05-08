import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';
import CategoryCard from '../components/CategoryCard';

const CATEGORIES = [
  {
    id: 'induction',
    title: 'נשימה',
    subtitle: 'Induction',
    itemCount: '24 חלקים',
    imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFfPvvgcfDNaR1xd4-W7SF5Gx5WqYFOYm9YUoDgcx9zeYb61rBrI_qLa5huh9Q3WpCKH0i-3_bmL1wg_53UZnu8YhY95TABPChEBE8hcCj0RaCORpoQfOpR36fC3Y3h6B5Ljx9WIAy0_1DfuewvYHNFqjB39sStK-p87tkY7o4-zI8BFh0QxQIMHEwqn82yTkTrosK2orW3iEMWypGnxS1hsMgsQzBgQIuqtBQ0yrc6i7czbGlQm50CPzM1zjLMww2nE3M-ZT3uAs',
  },
  {
    id: 'ecu',
    title: 'תוכנה',
    subtitle: 'ECU Tuning',
    itemCount: '12 מערכות',
    imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzvkmoIsmwz4O7VTaG1vOjCZ5vRn9pa5CMfvuCwruNT8M8ojNcpuKym_6K5jz0m8eaLveRwM1UkYF0MuV-jmzjn3b7MS-CsaxMpC03hQeXZNR-DW48R6ITCgoVSRT1yOTQOIGSeJ-N-uKYE8m6tFGwYCaSGDQRTIue4hGNCZXyUCXv5sy1pm6TMa08RCaHq5mmmd6aiRFflhe48c7O1mLW9y-DX8O3M1o2d_xkCzsa4SicpBYLFQSYTdNPAr5UkchjBTnCjk29hT4',
  },
  {
    id: 'brakes',
    title: 'בלמים',
    subtitle: 'Braking',
    itemCount: '36 רכיבים',
    imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOQ42wr1sLTwADzACLf3A6H-kFxnmbAnGVTNOfG40hQm6Cqs3u-KfHUkne2xGfnX4N4rRpiTuLLCqNXoWsAHzv-AY-Vp_LeO3_cjn8cyyH328XD7t986QLKKliMFzWjWQdf_8ShfKGJx1bGjBNa4XRFb1haKebgUe6t3_5N5SzSVK9PfRx4ZCqZdN1knDicQrQsbkz1u7qkvOcNyeczg5bA4QfSJuYwLIErSZbrMvsdEn--a8KID9ZYxAI3ivbYQZW-JFW2HK7_YA',
  },
  {
    id: 'engine',
    title: 'מנוע',
    subtitle: 'Engine',
    itemCount: '128 חלקים פנימיים',
    imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-mVkJKyz1x7nyD5JCPvr7_9gRa7MdVDcShCsocXdMn0ZDkYESJ7F8lK6wOd30nNkh1V1OjmotJZYJTk8eM1h-kGP83HFXB-Qf7dGlxuHKCpCOOCmdYyUtf-2eNPwWFpwdrUcjm5WdIoce1QaUT7qUrJkd1JSQCmuW-xfRj5OwvdQYD87iB7xLyPWZSSGGhpu7qVkmf_iKWSmnFqzvPJo33UXiroinjHqO1q8Cz3KWvdjkxgrCAO9eb-bTjI9Dnbph-DC4brsZmqA',
  },
  {
    id: 'cooling',
    title: 'קירור',
    subtitle: 'Cooling',
    itemCount: '18 ערכות',
    imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCh9Wno6_A0bX1jAoN_o0Qxhr9AekM3ZE2UeWzgugDRXqULeOrWPMFAhWfSnrh6DRsROrkCSyKlD-K1Nj9Dw5afOXMlDB5KLAyvmuVDb28XbXyAFB41Zrcf_VpLFfMEXXkDFQnWd19f95UzePhYvwyAmFppj0e3fAV5wII4QcEeYgtxhTVSzcHrq1-vl9DQRJM-Mn70asz-YdOh1ic5TDByk4eE1Ww8-RTWuztPx_b8irmqDKSupdODsu1OhhfMNEsoU5BVQaap8xQ',
  },
  {
    id: 'body',
    title: 'גוף',
    subtitle: 'Body',
    itemCount: '42 חלקי אווירודינמיקה',
    imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhggpVT6i0AES-J2TXOVnq5yUWBKSbx7krL4_fv90M8xY1uQADZ3yEnPLUyZMfknHnBx0Zm6bb1eFCWTkgnH3fE8wpGszyoDC3QRmYd0Ydgdra8QFgdsNAvKP_PIObCFgEB8zM09WYl8hrDCgMDGgz80lVBLbBLSifLfSOig_X_X3H_59WKNJiFqT7cSCWIPKioI_L7dge6ITquYtZWlJqg2THESFI5ca_zMlwoZOGXIIt-NzjBfh-dL6F9xAtBgANaxZmcA3Mk1w',
  },
];

export default function CatalogPage() {
  const navigate = useNavigate();
  const { selectedVehicle } = useVehicle();

  useEffect(() => {
    if (!selectedVehicle) navigate('/', { replace: true });
  }, [selectedVehicle, navigate]);

  if (!selectedVehicle) return null;

  const { makeName, modelName, year, engine } = selectedVehicle;

  return (
    <main className="pt-24 md:pt-8 md:pr-72 px-container-margin pb-24 md:pb-8 min-h-screen">
      <div className="max-w-7xl mx-auto w-full">

        {/* Vehicle Context Banner */}
        <div className="mb-lg flex flex-row-reverse items-center gap-3 bg-[#1E1E1E] border border-[#2D2D2D] rounded p-md">
          <span className="material-symbols-outlined text-primary-container">directions_car</span>
          <div className="text-right">
            <p className="font-label-caps text-label-caps text-secondary uppercase">פלטפורמה פעילה</p>
            <p className="font-mono-data text-mono-data text-on-surface" dir="ltr">
              {year} {makeName} {modelName} &nbsp;|&nbsp; {engine.code} {engine.displacement} &nbsp;|&nbsp; {engine.stockHp} כ&quot;ס / {engine.stockTorque} Nm
            </p>
          </div>
        </div>

        {/* Page Header */}
        <header className="mb-lg text-right">
          <h1 className="font-h1 text-h1 text-on-background">קטגוריות שיפורים</h1>
          <p className="font-body-lg text-body-lg text-tertiary-container mt-xs">
            בחר מערכת לשדרוגי ביצועים ונתוני דיאגנוסטיקה.
          </p>
        </header>

        {/* 3×2 Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.id}
              title={cat.title}
              subtitle={cat.subtitle}
              itemCount={cat.itemCount}
              imageSrc={cat.imageSrc}
              onClick={() => navigate(`/catalog/category/${cat.id}`)}
            />
          ))}
        </div>

      </div>
    </main>
  );
}
