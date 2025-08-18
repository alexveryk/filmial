export const Container = ({ children, className = "" }) => {
  return (
    <div className={` flex justify-center mx-auto ${className}`}>
      <div className={`w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 mx-auto }`}>
        {children}
      </div>
    </div>
  );
};
