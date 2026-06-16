import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children, title }) {
  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden font-sans antialiased">
      {/* La Sidebar à gauche */}
      <Sidebar />

      {/* La zone de droite */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Le Header en haut */}
        <Header title={title} />

        {/* Le contenu de la page */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}