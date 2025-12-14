export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-secondary mb-6">
          The profile you're looking for does not exist.
        </p>
        <a 
          href="/card" 
          className="text-primary font-semibold underline hover:text-appointments"
        >
          Return to Directory
        </a>
      </div>
    </div>
  );
}