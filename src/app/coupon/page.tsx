"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image'; // Import StaticImageData
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../components/ThemeProvider'; // Adjust the import path as necessary
//import { StaticImport } from 'next/dist/shared/lib/get-img-props';


// Define the type for a single coupon object
interface Coupon {
  id: string; // Assuming id is a string based on usage
  images: string[]; // Assuming images is an array of strings (URLs)
  created_at: string; // Assuming created_at is a string
  // Add any other properties that the coupon object might have
}

// ------------------------------------------------------------
// CouponPage: Client component for displaying available coupons
// - Hydration-safe: avoids SSR/client mismatches
// - Date formatting only on client (FormatDate component)
// - No <Head> usage (move to parent layout/page if needed)
// ------------------------------------------------------------
const CouponPage = () => {
  // Use the Coupon type for the coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Explicitly type error state
  // selectedImage can be a string (URL) or null
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { t } = useTranslation();
  const { theme } = useTheme(); // Use the theme from ThemeProvider

  // Replace with your actual base URL and token
  const BASE_URL = 'https://api.yapson.net';

  // Use orange as the primary and accent color for this page
  const orangePrimary = '#ea580c'; // Tailwind orange-600
  const orangeAccent = '#fdba74'; // Tailwind orange-300

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken'); // Retrieve the access token
    if (!accessToken) {
        console.error(t('No access token found.'));
        // Consider using Next.js router for navigation
        window.location.href = '/';
        return;
    }
    fetchCoupons(accessToken); // Pass accessToken to fetchCoupons
  }, []); // Add t to dependency array as it comes from useTranslation

  // Accept accessToken as a parameter
  const fetchCoupons = async (accessToken: string) => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const response = await fetch(`${BASE_URL}/yapson/coupon`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Attempt to read error message from response body
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      // Ensure data.results is an array before setting state
      if (Array.isArray(data.results)) {
         setCoupons(
           data.results.map((coupon: unknown) => {
             if (typeof coupon === 'object' && coupon !== null && 'id' in coupon && 'created_at' in coupon) {
               const c = coupon as { id: string; images?: unknown; created_at: string };
               return {
                 ...c,
                 images: Array.isArray(c.images) ? c.images : [],
               };
             }
             // fallback for unexpected structure
             return { id: '', images: [], created_at: '' };
           })
         );
      } else {
         console.error('API response results is not an array:', data);
         setCoupons([]); // Set to empty array if results is not as expected
      }


    } catch (err) { // Use 'any' or a more specific error type if known
      console.error('Error fetching coupons:', err);
      // Set a user-friendly error message
      //setError(`Failed to load coupons: ${err.message || 'Please check your token and try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Correct the type for imageUrl to string
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: orangePrimary }}></div>
          <p className="text-gray-600 text-lg">Loading coupons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4`}>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Coupons</h2>
          <p className="text-gray-600 mb-6">{error}</p> {/* Display the error message */}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            style={{ background: orangePrimary, color: '#fff', borderRadius: theme.values.borderRadius }}
          >
            {t('Try Again')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.colors.c_background} py-8`}>
      {/* Header */}
      <header className={`bg-gradient-to-br ${theme.colors.a_background} shadow-sm border-b border-gray-200 rounded-b-xl mb-8`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold " style={{ color: orangePrimary }}>{t("Available Coupons")}</h1>
            {/* <p className="mt-1 text-base" style={{ color: theme.colors.text }}>Discover amazing deals and offers</p> */}
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-md font-medium px-4 py-2 rounded-lg shadow-sm transition-all duration-200"
              style={{ color: theme.colors.text, borderRadius: theme.values.borderRadius }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t("Back")}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8">
        {coupons.length === 0 ? (
          <div className="text-center py-16">
            <div className="rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center" style={{ background: theme.colors.background, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <svg className="w-10 h-10" fill="none" stroke={orangeAccent} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text }}>{t("No Coupons Available")}</h3>
            <p className="text-base" style={{ color: theme.colors.secondary }}>{t("Check back later!")}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {coupons.map((coupon: Coupon) => (
              <div
                key={coupon.id}
                className="rounded-2xl shadow-lg overflow-hidden transition-shadow duration-300 group border"
                style={{ background: theme.colors.background, borderColor: orangeAccent, borderWidth: '1px', borderRadius: theme.values.borderRadius }}
              >
                {/* Coupon Header */}
                <div
                  className="flex items-center justify-between px-6 py-4"
                  style={{ background: `linear-gradient(90deg, ${orangePrimary} 60%, ${orangeAccent} 100%)`, color: '#fff', borderTopLeftRadius: theme.values.borderRadius, borderTopRightRadius: theme.values.borderRadius }}
                >
                  <div>
                    <h3 className="text-lg font-semibold tracking-wide">Coupon #{coupon.id.slice(0, 8)}</h3>
                    <p className="text-xs opacity-80">{t('Created')}: <FormatDate dateString={coupon.created_at} /></p>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-medium shadow"
                    style={{ background: theme.colors.background, color: orangePrimary }}
                  >
                    {(coupon.images?.length ?? 0)} {t('Image')}{(coupon.images?.length ?? 0) !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Images Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(coupon.images ?? []).map((imageUrl: string, index: number) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer rounded-xl overflow-hidden"
                        style={{ background: theme.colors.c_background, borderRadius: theme.values.borderRadius, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                        onClick={() => handleImageClick(imageUrl)}
                      >
                        <Image
                          src={imageUrl}
                          alt={`Coupon image ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          style={{ borderRadius: theme.values.borderRadius, border: `2px solid ${orangeAccent}` }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center rounded-xl">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeModal}>
          <div className="relative max-w-4xl max-h-full w-full animate-scale-in" style={{ borderRadius: theme.values.borderRadius }}>
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden" style={{ borderRadius: theme.values.borderRadius }}>
              <Image
                src={selectedImage}
                alt="Coupon image enlarged"
                width={800}
                height={600}
                className="max-w-full max-h-[80vh] object-contain"
                onClick={(e) => e.stopPropagation()}
                style={{ borderRadius: theme.values.borderRadius, border: `2px solid ${orangeAccent}` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

// Add a FormatDate component for clarity
const FormatDate = ({ dateString }: { dateString: string }) => {
  const [formatted, setFormatted] = useState<string>("...");
  useEffect(() => {
    if (dateString) {
      setFormatted(
        new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }
  }, [dateString]);
  return <>{formatted}</>;
};

export default CouponPage;