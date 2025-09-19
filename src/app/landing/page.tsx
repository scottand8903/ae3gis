export default function Landing() {
  return (
    <div className="flex items-center justify-center h-screen font-sans text-center p-8 sm:p-20">
      <div>
        <h1 className="text-4xl font-bold mb-6">
          Welcome to Our Landing Page
        </h1>

        <p className="text-lg max-w-xl mb-8">
          This is a simple landing page built with Next.js and Tailwind CSS. 
          Get started by exploring our features and services.
        </p>

        <div className="flex gap-4 flex-col sm:flex-row items-center sm:items-start">
          <a
            className="rounded-full border border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/about"
          >
            About Us
          </a>

          <a
            className="rounded-full border border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="/contact"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
