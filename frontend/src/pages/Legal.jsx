import { useParams } from 'react-router-dom';

const Legal = () => {
  const { page } = useParams();

  const content = {
    privacy: 'Privacy Policy content',
    terms: 'Terms of Service content',
    cookies: 'Cookie Policy content',
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">{page} Policy</h1>
      <p>{content[page] || 'Page not found'}</p>
    </div>
  );
};

export default Legal;