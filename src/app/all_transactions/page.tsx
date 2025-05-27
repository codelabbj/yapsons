// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { ArrowDownLeft, ArrowUpRight, RotateCw, X, Activity,  Copy } from 'lucide-react';
// //import { useTranslation } from 'react-i18next';
// //import { useTheme } from '../../components/ThemeProvider'; // Adjust path as needed

// // Define the App interface
// interface App {
//   id: string;
//   name: string;
//   image: string;
//   public_name: string;
//   is_active: boolean;
// }

// // Define API response interfaces
// interface User {
//   id: string;
//   email: string;
//   first_name: string;
//   last_name: string;
// }

// interface Network {
//   id: number;
//   name: string;
//   public_name: string;
//   image: string;
//   country_code: string;
//   indication: string;
// }

// interface Transaction {
//   id: string;
//   amount: number;
//   reference: string;
//   type_trans: string;
//   status: string;
//   created_at: string;
//   phone_number: string;
//   app: App;
//   network: Network;
//   user: User;
//   user_app_id: string;
//   transaction_reference: string | null;
//   error_message: string | null;
//   net_payable_amount: number | null;
// }

// // Define the HistoricItem type
// type HistoricItem = {
//   id: string;
//   user: string;
//   created_at: string;
//   transaction: Transaction;
// };

// interface ApiResponse {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: HistoricItem[];
// }

// export default function AllTransactionHistoryPage() {
//   console.log('AllTransactionHistoryPage component rendering...');
//   const [transactions, setTransactions] = useState<HistoricItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedTransaction, setSelectedTransaction] = useState<HistoricItem | null>(null);
  
//   // const { t } = useTranslation();
//   // const { theme } = useTheme();

//   // Transactions map to track unique transactions
//   const transactionsMapRef = useRef<Map<string, HistoricItem>>(new Map());
//   const isMounted = useRef(true);

//   // Cleanup function to prevent memory leaks
//   useEffect(() => {
//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//   // Format date from ISO string to readable format
//   const formatDate = (isoDate: string) => {
//     const date = new Date(isoDate);
//     return date.toLocaleDateString('en-US', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     }).replace(',', '');
//   };

//   // Build API URL based on pagination
//   const getApiUrl = (pageNumber: number) => {
//     return `https://api.yapson.net/yapson/historic${pageNumber > 1 ? `?page=${pageNumber}` : ''}`;
//   };

//   // Create a function to generate a composite key for transactions
//   const getTransactionKey = (transaction: HistoricItem | Transaction) => {
//     const id = 'transaction' in transaction
//       ? transaction.transaction.id
//       : transaction.id;

//     if (!id) {
//       console.error('Could not extract ID from transaction:', transaction);
//       return `unknown-${Math.random().toString(36).substring(2, 11)}`;
//     }

//     return id.toString();
//   };

//   // Fetch all transactions from API
//     // Initial fetch
//   useEffect(() => {
//     const fetchTransactions = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem('accessToken');
//         if (!token) {
//           throw new Error('Authentication required');
//         }

//         const response = await fetch('https://api.yapson.net/yapson/historic/', {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           throw new Error(errorData.message || 'Failed to fetch transactions');
//         }

//         const data: ApiResponse = await response.json();
        
//         // Sort by date (newest first)
//         const sortedResults = [...data.results].sort((a, b) => 
//           new Date(b.transaction.created_at).getTime() - new Date(a.transaction.created_at).getTime()
//         );

//         setTransactions(sortedResults);
//         setError(null);
//       } catch (error) {
//         console.error('Error fetching transactions:', error);
//         setError(error instanceof Error ? error.message : 'Failed to load transactions');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTransactions();
//   }, []);

  
      
//   // Add error boundary effect
//   // useEffect(() => {
//   //   if (error) {
//   //     console.error('Transaction fetch error:', error);
//   //     // Auto-retry on error after delay
//   //     const retryTimer = setTimeout(() => {
//   //       if (isMounted.current) {
//   //         fetchAllTransactions();
//   //       }
//   //     }, 300);
//   //     return () => clearTimeout(retryTimer);
//   //   }
//   // }, []);

//   // In the fetchAllTransactions function, update the error handling:
//   const fetchAllTransactions = async (isRefresh = false) => {
//     if (!isRefresh) {
//       setLoading(true);
//     } else {
//       setIsRefreshing(true);
//     }
    
//     try {
//       const token = localStorage.getItem('accessToken');
//       if (!token) {
//         throw new Error('Authentication required. Please log in again.');
//       }

//       const allResults: HistoricItem[] = [];
//       let currentPage = 1;
//       let hasMore = true;
//       const newTransactionsMap = new Map<string, HistoricItem>();
//       let retryCount = 0;
//       const maxRetries = 3;

//       while (hasMore && isMounted.current && retryCount < maxRetries) {
//         try {
//           const response = await fetch(getApiUrl(currentPage), {
//             headers: {
//               'Authorization': `Bearer ${token}`,
//               'Content-Type': 'application/json',
//             },
//           });

//           if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//           }

//           const data: ApiResponse = await response.json();

//           // Process the current page of results
//           data.results.forEach((tx: HistoricItem) => {
//             const key = getTransactionKey(tx);
//             if (!newTransactionsMap.has(key)) {
//               newTransactionsMap.set(key, tx);
//               allResults.push(tx);
//             }
//           });

//           // Check if there are more pages
//           hasMore = !!data.next && data.next !== null;
//           currentPage++;
//           retryCount = 0; // Reset retry count on successful fetch
//         } catch (error) {
//           console.error(`Error fetching page ${currentPage}:`, error);
//           retryCount++;
//           if (retryCount >= maxRetries) {
//             throw error; // Re-throw after max retries
//           }
//           // Wait before retrying
//           await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
//         }
//       }

//       // Sort by date (newest first)
//       allResults.sort((a, b) => 
//         new Date(b.transaction.created_at).getTime() - new Date(a.transaction.created_at).getTime()
//       );

//       // Update state
//       if (isMounted.current) {
//         transactionsMapRef.current = newTransactionsMap;
//         setTransactions(allResults);
//         setError(null);
//       }
//     } catch (error) {
//       console.error('Error in fetchAllTransactions:', error);
//       if (isMounted.current) {
//         setError(error instanceof Error ? error.message : 'Failed to load transactions. Please try again.');
//       }
//       // Re-throw to be caught by error boundary
//       throw error;
//     } finally {
//       if (isMounted.current) {
//         setLoading(false);
//         setIsRefreshing(false);
//       }
//     }
//   };

  

//   // Status display component
//   const StatusBadge = ({ status }: { status: string }) => {
//     const statusMap: Record<string, { text: string; className: string }> = {
//       completed: { text: 'Completed', className: 'bg-green-500/10 text-green-500' },
//       pending: { text: 'Pending', className: 'bg-yellow-500/10 text-yellow-500' },
//       failed: { text: 'Failed', className: 'bg-red-500/10 text-red-500' },
//       error: { text: 'Failed', className: 'bg-red-500/10 text-red-500' },
//       default: { text: status, className: 'bg-gray-500/10 text-gray-500' },
//     };

//     const { text, className } = statusMap[status.toLowerCase()] || statusMap.default;

//     return (
//       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
//         {text}
//       </span>
//     );
//   };

//   // In the refresh button JSX:
  

//   // Format amount with currency
//   const formatAmount = (amount: number) => {
//     return new Intl.NumberFormat('fr-BJ', {
//       style: 'currency',
//       currency: 'XOF',
//       currencyDisplay: 'narrowSymbol',
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   // Get transaction type icon
//   const getTransactionTypeIcon = (type: string) => {
//     if (type === 'deposit') {
//       return <ArrowDownLeft size={16} />;
//     }
//     return <ArrowUpRight size={16} />;
//   };

//   // Update the transaction rendering to use the new StatusBadge component
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col gap-6">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <div>
//             <h1 className="text-2xl font-bold">All Transactions</h1>
//             <p className="text-gray-500">View your complete transaction history</p>
//           </div>
//           <button
//             onClick={() => fetchAllTransactions(true)}
//             disabled={loading || isRefreshing}
//             className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
//           >
//             <RotateCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
//             {isRefreshing ? 'Refreshing...' : 'Refresh'}
//           </button>
//         </div>

//         {/* Error message */}
//         {error && (
//           <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg">
//             {error}
//           </div>
//         )}

//         {/* Transactions list */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
//           {loading && transactions.length === 0 ? (
//             <div className="flex flex-col items-center justify-center p-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
//               <p className="text-gray-500">Loading transactions...</p>
//             </div>
//           ) : transactions.length === 0 ? (
//             <div className="flex flex-col items-center justify-center p-8 text-center">
//               <Activity size={48} className="text-gray-300 mb-4" />
//               <h3 className="text-lg font-medium text-gray-400 mb-2">No transactions found</h3>
//               <p className="text-sm text-gray-500">{("You haven't made any transactions yet.")}</p>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-200 dark:divide-gray-700">
//               {transactions.map((item) => (
//                 <div
//                   key={item.id}
//                   className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
//                   onClick={() => {
//                     setSelectedTransaction(item);
//                     setIsModalOpen(true);
//                   }}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
//                         item.transaction.type_trans === 'deposit'
//                           ? 'bg-orange-500/20 text-orange-500'
//                           : 'bg-blue-500/20 text-blue-500'
//                       }`}>
//                         {getTransactionTypeIcon(item.transaction.type_trans)}
//                       </div>
//                       <div>
//                         <div className="flex items-center gap-2">
//                           <span className="font-medium">
//                             {item.transaction.type_trans === 'deposit' ? 'Deposit' : 'Withdrawal'}
//                           </span>
//                           <StatusBadge status={item.transaction.status} />
//                         </div>
//                         <p className="text-sm text-gray-500">
//                           {formatDate(item.transaction.created_at)}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className={`font-medium ${
//                         item.transaction.type_trans === 'deposit'
//                           ? 'text-orange-500'
//                           : 'text-blue-500'
//                       }`}>
//                         {formatAmount(item.transaction.amount)}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {item.transaction.phone_number}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Transaction Details Modal */}
//       {isModalOpen && selectedTransaction && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
//             <div className="flex justify-between items-start mb-6">
//               <h3 className="text-lg font-semibold">Transaction Details</h3>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="space-y-4">
//               {/* Transaction type and status */}
//               <div className="flex items-center gap-3">
//                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
//                   selectedTransaction.transaction.type_trans === 'deposit'
//                     ? 'bg-orange-500/20 text-orange-500'
//                     : 'bg-blue-500/20 text-blue-500'
//                 }`}>
//                   {getTransactionTypeIcon(selectedTransaction.transaction.type_trans)}
//                 </div>
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <span className="font-medium text-lg">
//                       {selectedTransaction.transaction.type_trans === 'deposit' ? 'Deposit' : 'Withdrawal'}
//                     </span>
//                     <StatusBadge status={selectedTransaction.transaction.status} />
//                   </div>
//                   <p className="text-sm text-gray-500">
//                     {formatDate(selectedTransaction.transaction.created_at)}
//                   </p>
//                 </div>
//               </div>

//               {/* Amount */}
//               <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-xl">
//                 <p className="text-sm text-gray-500 mb-1">Amount</p>
//                 <p className={`text-2xl font-bold ${
//                   selectedTransaction.transaction.type_trans === 'deposit'
//                     ? 'text-orange-500'
//                     : 'text-blue-500'
//                 }`}>
//                   {formatAmount(selectedTransaction.transaction.amount)}
//                 </p>
//               </div>

//               {/* Details */}
//               <div className="space-y-3">
//                 {/* Transaction ID */}
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-500">Transaction ID</span>
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm font-mono">{selectedTransaction.transaction.id}</span>
//                     <button
//                       onClick={() => navigator.clipboard.writeText(selectedTransaction.transaction.id)}
//                       className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
//                     >
//                       <Copy size={16} />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Reference */}
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-500">Reference</span>
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm">{selectedTransaction.transaction.reference}</span>
//                     <button
//                       onClick={() => navigator.clipboard.writeText(selectedTransaction.transaction.reference)}
//                       className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
//                     >
//                       <Copy size={16} />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Phone Number */}
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-500">Phone Number</span>
//                   <span className="text-sm">{selectedTransaction.transaction.phone_number}</span>
//                 </div>

//                 {/* Network */}
//                 {selectedTransaction.transaction.network && (
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-500">Network</span>
//                     <span className="text-sm">
//                       {selectedTransaction.transaction.network.public_name || selectedTransaction.transaction.network.name}
//                     </span>
//                   </div>
//                 )}

//                 {/* Error Message */}
//                 {selectedTransaction.transaction.error_message && (
//                   <div className="mt-4 p-3 bg-red-500/10 text-red-500 text-sm rounded-lg">
//                     <p className="font-medium">Error:</p>
//                     <p>{selectedTransaction.transaction.error_message}</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="mt-6 flex justify-end">
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
















'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowDownLeft, ArrowUpRight, RotateCw, X, Copy } from 'lucide-react';
import { useTheme } from '../../components/ThemeProvider'; // Adjust path as needed
import axios from 'axios'

type Transaction = {
  id: string;
  amount: number;
  reference: string;
  type_trans: string;
  status: string;
  created_at: string;
  phone_number: string;
  transaction_reference: string | null;
  error_message: string | null;
  net_payable_amount: number | null;
  app: {
    id: string;
    name: string;
    public_name: string;
  };
  network: {
    id: number;
    name: string;
    public_name: string;
  };
};

type ApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: string;
    user: string;
    created_at: string;
    transaction: Transaction;
  }>;
};

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
 // const lastTransactionRef = useRef<HTMLDivElement | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();

  // Add this near the top of your component, after the state declarations

  const fetchTransactions = useCallback(async (pageNum = 1, isRefresh = false) => {
  if (!isRefresh) setLoading(true);
  else setIsRefreshing(true);
  
  try {
    console.log('Fetching transactions...');
    const token = localStorage.getItem('accessToken');
    console.log('Token exists:', !!token);
    
    if (!token) {
      console.error('No access token found');
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await axios.get(
      `https://api.yapson.net/yapson/historic${pageNum > 1 ? `?page=${pageNum}` : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Response status:', response.status);
    
    // With axios, the data is already parsed
    const data: ApiResponse = response.data;
    console.log('Received data:', data);
    console.log('Received data for page:', pageNum, data);
    
    const newTransactions = data.results
      .map(item => item.transaction)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setTransactions(prev => pageNum === 1 ? newTransactions : [...prev, ...newTransactions]);
    setHasMore(!!data.next);
    setError(null);
  } catch (err) {
    console.error('Error in fetchTransactions:', err);
    let errorMessage = 'Failed to load transactions';
    
    if (axios.isAxiosError(err)) {
      errorMessage = err.response?.data?.message || err.message;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    
    if (errorMessage.toLowerCase().includes('authenticat')) {
      console.log('Authentication error, redirecting to login...');
      // window.location.href = '/login'; // Uncomment this if you want to redirect to login
    }
  } finally {
    setLoading(false);
    setIsRefreshing(false);
  }
}, []);

const lastTransactionElement = useCallback((node: HTMLDivElement | null) => {
  if (loading || !node) return;
  
  if (observerRef.current) observerRef.current.disconnect();
  
  observerRef.current = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  });
  
  observerRef.current.observe(node);
}, [loading, hasMore]);

useEffect(() => {
  if (page > 1) {
    fetchTransactions(page, false);
  }
}, [page]);

useEffect(() => {
  fetchTransactions(1, false);
}, []);

 useEffect(() => {
  return () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  };
}, []);
  
 const handleRefresh = () => {
  setPage(1); // Reset to first page
  fetchTransactions(1, true);
};
  

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      completed: { text: 'Terminé', className: 'bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300' },
      accept: { text: 'accepter', className: 'bg-green-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300' },
      pending: { text: 'En cours', className: 'bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300' },
      failed: { text: 'Échoué', className: 'bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300' },
      error: { text: 'Échoué', className: 'bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300' },
      default: { text: status, className: 'bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300' },
    };

    const { text, className } = statusMap[status.toLowerCase()] || statusMap.default;
    return <span className={className}>{text}</span>;
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur! </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={handleRefresh}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <RotateCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold ">Toutes les transactions</h1>
          {/* <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 mt-4 md:mt-0"
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
          </button> */}.
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-md font-medium  dark:text-gray-300 dark:hover:text-white  px-4 py-2 rounded-lg shadow-sm transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {("Retour")}
          </button>
        </div>

        {/* <div className={`${theme.colors.background} rounded-lg shadow overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`bg-gradient-to-br ${theme.colors.a_background}`}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Référence
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${theme.colors.background} divide-y divide-gray-200 dark:divide-gray-700`}>
                {transactions.map((tx) => (
                  <tr key={tx.id} className={`${theme.colors.hover}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          tx.type_trans === 'deposit' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {tx.type_trans === 'deposit' ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium ">
                            {tx.type_trans === 'deposit' ? 'Dépôt' : 'Retrait'}
                          </div>
                          <div className="text-sm ">
                            {tx.phone_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        tx.type_trans === 'deposit' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {formatAmount(tx.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm ">
                        {tx.reference}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedTransaction(tx);
                          setIsModalOpen(true);
                        }}
                        className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          
          <div className={`${theme.colors.background} px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6`}>
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-gradient-to-br ${theme.colors.c_background} hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm ">
                  Page <span className="font-medium">{page}</span> sur <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-gradient-to-br ${theme.colors.c_background} text-sm font-medium  ${theme.colors.hover} dark:border-gray-600  disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="sr-only">Précédent</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <div className="flex items-center px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                    {page} / {totalPages}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Suivant</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div> */}
        
      <div className={`${theme.colors.background} rounded-lg shadow overflow-hidden`}>
        {/* Mobile View */}
        <div className="block md:hidden">
          {transactions.map((tx, index) => (
            <div 
              key={tx.id} 
              ref={index === transactions.length - 1 ? lastTransactionElement : null}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 ${theme.colors.hover}`}
              onClick={() => {
                setSelectedTransaction(tx);
                setIsModalOpen(true);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    tx.type_trans === 'deposit' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {tx.type_trans === 'deposit' ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium">
                      {tx.type_trans === 'deposit' ? 'Dépôt' : 'Retrait'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tx.phone_number}
                    </div>
                  </div>
                </div>
                <StatusBadge status={tx.status} />
              </div>
              
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-gray-500">Montant:</div>
                <div className={`text-sm font-medium ${
                  tx.type_trans === 'deposit' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {formatAmount(tx.amount)}
                </div>
              </div>

              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-gray-500">Référence:</div>
                <div className="text-sm">{tx.reference}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Date:</div>
                <div className="text-sm">{formatDate(tx.created_at)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View - Keep your existing table structure but hide it on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <div className={`${theme.colors.background} rounded-lg shadow overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`bg-gradient-to-br ${theme.colors.a_background}`}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Référence
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${theme.colors.background} divide-y divide-gray-200 dark:divide-gray-700`}>
                {transactions.map((tx) => (
                  <tr key={tx.id} className={`${theme.colors.hover}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          tx.type_trans === 'deposit' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {tx.type_trans === 'deposit' ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium ">
                            {tx.type_trans === 'deposit' ? 'Dépôt' : 'Retrait'}
                          </div>
                          <div className="text-sm ">
                            {tx.phone_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        tx.type_trans === 'deposit' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {formatAmount(tx.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm ">
                        {tx.reference}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedTransaction(tx);
                          setIsModalOpen(true);
                        }}
                        className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></div>
          </table>
        </div>

        {loading && hasMore && (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Pagination - Update to be more mobile-friendly */}
        {/* <div className={`${theme.colors.background} px-4 py-3 border-t border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div> */}
      </div>
      </div>

      {/* Transaction Details Modal */}
      {isModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Détails de la transaction</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {selectedTransaction.type_trans === 'deposit' ? 'Dépôt' : 'Retrait'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Montant</span>
                <span className={`text-sm font-medium ${
                  selectedTransaction.type_trans === 'deposit' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {formatAmount(selectedTransaction.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</span>
                <StatusBadge status={selectedTransaction.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {formatDate(selectedTransaction.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {selectedTransaction.phone_number}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Référence</span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 dark:text-white font-mono">
                    {selectedTransaction.reference}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTransaction.reference);
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    title="Copier la référence"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {selectedTransaction.network && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Réseau</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {selectedTransaction.network.public_name || selectedTransaction.network.name}
                  </span>
                </div>
              )}
              {selectedTransaction.error_message && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">{"Message d'erreur"}</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {selectedTransaction.error_message}
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:bg-orange-600 dark:hover:bg-orange-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}