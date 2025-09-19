// export default function ContactPage() {
//     return (
//         <main className="flex flex-col gap-[32px] items-center justify-center min-h-screen p-8 sm:p-20">
//             <h1 className="text-4xl font-bold">Contact Us</h1>
//             <p className="text-lg text-center max-w-xl">
//                 This is the contact page of our application. Feel free to reach out to us with any questions or inquiries.
//             </p>
//             <div className="flex gap-4 items-center flex-col sm:flex-row">
//                 <a
//                     className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//                     href="/landing"
//                 >
//                     Go to Home
//                 </a>
//             </div>
//         </main>
//     )
// }

export default function ContactPage() {
  return (
    <div className="flex items-center justify-center h-screen font-sans text-center p-8 sm:p-20">
      <div>
        <h1 className="text-4xl font-bold mb-6">
          Contact Us
        </h1>

        <p className="text-lg max-w-xl mb-8">
          This is the contact page of our application. Feel free to reach out to us with any questions or inquiries.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/landing"
          >
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
}