import Header from './Header';
import Footer from './Footer';
import CookieBanner from './CookieBanner';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <CookieBanner />
      <Footer />
    </div>
  );
};

export default Layout;