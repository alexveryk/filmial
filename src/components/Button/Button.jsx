export const Button = ({
  text,
  onClick,
  variant = "primary",
  disabled = false,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary:
      "bg-blue-500 text-white hover:bg-blue-400 active:bg-blue-600 focus:ring-blue-400",
    secondary:
      "border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-900 focus:ring-slate-500",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {text}
    </button>
  );
};
