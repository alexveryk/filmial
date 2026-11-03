export const Spinner = () => (
  <div
    className="flex min-h-[100px] items-center justify-center"
    role="status"
    aria-label="Завантаження"
  >
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-400"></div>
  </div>
);
