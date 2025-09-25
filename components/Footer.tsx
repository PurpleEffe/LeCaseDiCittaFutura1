const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-10 text-center">
        <h3 className="text-2xl font-bold text-white"><span className="text-blue-400">Le Case</span> di <span className="text-green-400">Città Futura</span></h3>
        <p className="mt-2 text-slate-300 max-w-2xl mx-auto">Promuoviamo un modello di accoglienza e integrazione nel borgo di Riace, un mondo a colori dove ogni persona trova casa.</p>
        <div className="mt-6 text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Associazione Città Futura G. Puglisi. Tutti i diritti riservati.</p>
          <p>Questo sito è un prototipo a scopo dimostrativo e non gestisce prenotazioni reali.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;