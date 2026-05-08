export default function CategoryCard({ title, subtitle, itemCount, imageSrc, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-[#2D2D2D] rounded border border-[#2D2D2D] hover:border-primary-container transition-colors overflow-hidden flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(255,107,0,0.15)]"
    >
      <div className="h-48 w-full bg-surface-container-highest relative overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-md flex flex-col gap-xs flex-1 bg-[#2D2D2D]">
        <div className="flex justify-between items-start">
          <h2 className="font-h2 text-h2 text-primary-container flex items-baseline gap-2">
            {title}
            {subtitle && (
              <span className="text-tertiary-container text-sm font-normal">{subtitle}</span>
            )}
          </h2>
          <span className="material-symbols-outlined text-primary-container opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
            arrow_back
          </span>
        </div>
        <p className="font-mono-data text-mono-data text-tertiary-container">{itemCount}</p>
      </div>
    </div>
  );
}
