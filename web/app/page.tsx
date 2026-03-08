export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Canadian Credit Card Finder</h1>
          <p className="text-gray-600 mt-2">Find the best credit cards in Canada</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome</h2>
          <p className="text-gray-700">
            Compare Canadian credit cards and find the best one for your needs.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">Cash Back</h3>
              <p className="text-sm text-blue-700 mt-1">Earn money back on purchases</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">Travel</h3>
              <p className="text-sm text-green-700 mt-1">Earn points for flights and hotels</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900">Low Interest</h3>
              <p className="text-sm text-purple-700 mt-1">Save on interest charges</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
