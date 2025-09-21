import Layout from "./components/Layout";

export default function HomePage() {
  return (
    <Layout>
      {/* <div className="flex items-center justify-center h-screen font-sans text-center p-8 sm:p-20"> */}
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p>This is the main content area.</p>
      {/* </div> */}
    </Layout>
  );
}
