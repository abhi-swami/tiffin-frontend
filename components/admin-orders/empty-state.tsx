interface OrderEmptyStateProps {
  title: string;
  description: string;
}

export function OrderEmptyState({ title, description }: OrderEmptyStateProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
      <div className="text-4xl mb-4">📦</div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
      <p className="text-sm text-slate-600 max-w-sm mx-auto">{description}</p>
    </div>
  );
}
