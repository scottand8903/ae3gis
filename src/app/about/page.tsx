// export default function AboutPage() {
//     return (
//         <main className="flex flex-col gap-[32px] items-center justify-center min-h-screen p-8 sm:p-20">
//             <h1 className="text-4xl font-bold">About Us</h1>
//             <p className="text-lg text-center max-w-xl">
//                 This is the about page of our application. Here you can learn more about our mission, values, and team.
//             </p>
//             <div className="flex gap-4 items-center flex-col sm:flex-row">
//                 <a
//                     className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//                     href="/"
//                 >
//                     Go to Home
//                 </a>
//                 <a
//                     className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//                     href="/contact"
//                 >
//                     Contact Us
//                 </a>
//             </div>
//         </main>
//     )
// }


export default function AboutPage() {
  return (
    <div className="flex items-center justify-center h-screen font-sans text-center p-8 sm:p-20">
      <div>
        <h1 className="text-4xl font-bold mb-6">
          About Us
        </h1>

        <p className="text-lg max-w-xl mb-8">
          This is the about page of our application. Here you can learn more about our mission, values, and team.
        </p>

        {/* <div className="flex gap-4 flex-col sm:flex-row items-center sm:items-start"> */}
            <div className="flex gap-4 flex-col sm:flex-row items-center sm:items-start">
            <a
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                href="/landing"
            >
                Go to Home
            </a>

            <a
                className="rounded-full border border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
                href="/contact"
            >
                Contact Us
            </a>
            </div>
        {/* </div> */}
      </div>
    </div>
  );
}