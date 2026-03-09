// pages/withdraw.js


'use client';
import { useState, useEffect } from 'react';
//import Head from 'next/head';
import api from '../../../utils/api';
import { useTranslation } from 'react-i18next';
// import styles from '../styles/Withdraw.module.css';
//import DashboardHeader from '@/components/DashboardHeader';
import { useTheme } from '../../components/ThemeProvider';
import { Trash2, PlusCircle } from 'lucide-react';


interface Network {
  id: string;
  name: string;
  public_name?: string;
  image?: string;
  with_fee?: boolean;
  fee_percent?: number;
}

interface App {
  id: string;
  name: string;
  public_name?: string;
  image?: string;
  is_active?: boolean;
  hash?: string;
  cashdeskid?: string;
  cashierpass?: string;
  order?: string | null;
  city?: string;
  street?: string;
  deposit_tuto_content?: string;
  deposit_link?: string;
  withdrawal_tuto_content?: string;
  withdrawal_link?: string;
  why_withdrawal_fail?: string;
}

// Updated IdLink interface to match the structure from deposit/page.tsx
interface IdLink {
  id: string;
  user: string;
  link: string; // This is the saved bet ID
  app_name: App; // This should be the full App object
}

interface Transaction {
  id: string;
  amount?: number;
  type_trans: string;
  status: string;
  reference: string;
  created_at: string;
  network?: Network;
  app?: App;
  phone_number?: string;
  user_app_id?: string;
  error_message?: string;
  withdriwal_code?: string;
}

interface TransactionDetail {
  transaction: Transaction;
}

// interface ErrorResponse {
//   data?: {
//     [key: string]: string[] | string | undefined;
//     detail?: string;
//     message?: string;
//   };
//   status?: number;
// }

export default function Withdraw() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<'selectId' | 'selectNetwork' | 'addBetId' | 'tutorial' | 'enterDetails'>('selectId');
  const [tutorials, setTutorials] = useState<{ name: string; url: string }[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<App | null>(null);
  const [platforms, setPlatforms] = useState<App[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<{ 
    id: string; 
    name: string; 
    public_name?: string; 
    image?: string;
    withdrawal_message?: string;
    with_fee?: boolean;
    fee_percent?: number;
  } | null>(null);
  const [formData, setFormData] = useState({
    withdrawalCode: '',
    phoneNumber: '',
    betid: '',
    amount: '',
  });
  
  const [networks, setNetworks] = useState<{ 
    id: string; 
    name: string; 
    public_name?: string; 
    image?: string;
    withdrawal_message?: string;
    with_fee?: boolean;
    fee_percent?: number;
  }[]>([]);
  const [savedAppIds, setSavedAppIds] = useState<IdLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);
  const { theme } = useTheme();
  const [showHowTo, setShowHowTo] = useState(false);
  const [withdrawalMessage, setWithdrawalMessage] = useState<string | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{
    type_trans: string;
    withdriwal_code: string;
    phone_number: string;
    network_id: string;
    app_id: string;
    user_app_id: string;
    amount: string;
  } | null>(null);
  
  // Fee calculation state
  const [calculatedFee, setCalculatedFee] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);

  // Calculate fee and net amount when amount or network changes
  useEffect(() => {
    if (formData.amount && selectedNetwork?.with_fee && selectedNetwork?.fee_percent) {
      const amount = parseFloat(formData.amount);
      if (!isNaN(amount) && amount > 0) {
        const fee = (amount * selectedNetwork.fee_percent) / 100;
        const net = amount - fee;
        setCalculatedFee(fee);
        setNetAmount(net);
      } else {
        setCalculatedFee(0);
        setNetAmount(0);
      }
    } else {
      setCalculatedFee(0);
      setNetAmount(0);
    }
  }, [formData.amount, selectedNetwork?.with_fee, selectedNetwork?.fee_percent]);

  const fetchPlatforms = async () => {
    try {
      const response = await api.get('yapson/app_name?operation_type=withdrawal');
      setPlatforms(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching platforms:', error);
      setPlatforms([]);
    }
  };
  // Fetch networks and saved app IDs on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel
        const [networksResponse, savedIdsResponse] = await Promise.all([
          api.get('/yapson/network/?type=withdrawal'),
          api.get('/yapson/id_link'),
          fetchPlatforms() // Fetch platforms in parallel
        ]);

        if (networksResponse.data) {
          setNetworks(networksResponse.data);
        }

        if (savedIdsResponse.data) {
          let processedData: IdLink[] = [];
          
          if (Array.isArray(savedIdsResponse.data)) {
            processedData = savedIdsResponse.data;
          } else if (savedIdsResponse.data?.results) {
            processedData = savedIdsResponse.data.results;
          } else if (savedIdsResponse.data?.data) {
            processedData = savedIdsResponse.data.data;
          }
          
          setSavedAppIds(processedData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('Failed to load data. Please try again later.'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 1. French translations for all user-facing text
  // 2. Card shadow and hover effect for platform selection
  // 3. Improved error handling (show all backend errors, auto-hide after 4s)
  // 4. Section and button text consistency
  // 5. Modal and progress step style improvements
  // 6. All other enhancements except the minimum/maximum amount logic

  // --- Add improved error auto-hide ---
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!mounted) return null;

  const handlePlatformSelect = (platform: App) => {
    setSelectedPlatform(platform);
    setCurrentStep('selectNetwork');
  };
  const handleNetworkSelect = (network: { 
    id: string; 
    name: string; 
    image?: string;
    withdrawal_message?: string;
  }) => {
    setSelectedNetwork(network);
    setWithdrawalMessage(network.withdrawal_message || null);
    setCurrentStep('addBetId');
  };

  const handleBetIdSelect = (betIdLink: string) => {
    setFormData(prev => ({ ...prev, betid: betIdLink }));
    const items: { name: string; url: string }[] = [];
    const appName = selectedPlatform?.public_name || '';
    if (selectedPlatform?.withdrawal_link) {
      items.push({ name: `Comment obtenir le code de retrait pour ${appName}`, url: selectedPlatform.withdrawal_link });
    }
    if (selectedPlatform?.why_withdrawal_fail) {
      items.push({ name: 'Pourquoi le retrait échoue-t-il ?', url: selectedPlatform.why_withdrawal_fail });
    }
    if (items.length > 0) {
      setTutorials(items);
      setCurrentStep('tutorial');
    } else {
      setCurrentStep('enterDetails');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform || !selectedNetwork) return;
    
    const payload = {
      type_trans: 'withdrawal',
      withdriwal_code: formData.withdrawalCode,
      phone_number: formData.phoneNumber,
      network_id: selectedNetwork.id,
      app_id: selectedPlatform.id,
      user_app_id: formData.betid,
      amount: formData.amount // Send the original amount, not the fee-deducted amount
    };

    // Show modal if withdrawal_message exists (regardless of withdrawal_api value)
    if (withdrawalMessage) {
      setPendingPayload(payload);
      setShowWithdrawalModal(true);
      return; // Don't submit yet, wait for user confirmation
    }

    // If withdrawal_api is not "connect" or withdrawal_message is null, submit directly
    await submitWithdrawal(payload);
  };

  const submitWithdrawal = async (payload: {
    type_trans: string;
    withdriwal_code: string;
    phone_number: string;
    network_id: string;
    app_id: string;
    user_app_id: string;
    amount: string;
  }) => {
    setLoading(true);
    try {
      const response = await api.post('yapson/transaction', payload);
      const transaction = response.data;
      setSelectedTransaction({ transaction });
      setIsModalOpen(true);
      setSuccess('Retrait initié avec succès!');
      setCurrentStep('selectId');
      setSelectedPlatform(null);
      setSelectedNetwork(null);
      setFormData({ withdrawalCode: '', phoneNumber: '', betid: '', amount: '' });
      setCalculatedFee(0);
      setNetAmount(0);
    } catch (err) {
      console.error('Withdrawal error:', err);
      // Enhanced error handling for backend field errors
      let errorMsg = 'Échec du traitement du retrait';
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: unknown }).response === 'object'
      ) {
        const response = (err as { response?: { data?: Record<string, unknown> } }).response;
        const data = response?.data as Record<string, unknown> | undefined;
        if (data && typeof data === 'object') {
          const messages: string[] = [];
          for (const key in data) {
            if (Array.isArray(data[key])) {
              messages.push(...(data[key] as string[]));
            } else if (typeof data[key] === 'string') {
              messages.push(data[key] as string);
            }
          }
          if (messages.length > 0) {
            errorMsg = messages.join(' ');
          } else if ('detail' in data && typeof data.detail === 'string') {
            errorMsg = data.detail;
          }
        } else if (data && 'detail' in data && typeof (data as { detail?: unknown }).detail === 'string') {
          errorMsg = (data as { detail?: string }).detail!;
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalModalConfirm = async () => {
    setShowWithdrawalModal(false);
    if (pendingPayload) {
      await submitWithdrawal(pendingPayload);
      setPendingPayload(null);
    }
  };

  const handleWithdrawalModalCancel = () => {
    setShowWithdrawalModal(false);
    setPendingPayload(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'selectId':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platforms.map((platform) => (
                <div 
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform)}
                  className={`p-4 border rounded-lg cursor-pointer text-center transition-colors shadow-md hover:shadow-xl
                    ${selectedPlatform?.id === platform.id ? `border-orange-500 bg-white dark:bg-gray-800` : `${theme.colors.hover} border-gray-200 dark:border-gray-700`}
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    {platform.image ? (
                      <img 
                        src={platform.image} 
                        alt={platform.public_name || platform.name}
                        className="h-12 mx-auto mb-2 object-contain"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2">
                        <span className="text-2xl font-bold text-gray-500">{platform.public_name?.charAt(0) || platform.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="text-sm font-medium text-center text-black dark:text-white">
                      {platform.public_name || platform.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {platforms.length === 0 && !loading && (
              <p className="text-gray-500 dark:text-gray-400">Aucune plateforme de pari disponible.</p>
            )}
          </div>
        );
      case 'selectNetwork':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {networks.map((network) => (
                <div
                  key={network.id}
                  onClick={() => handleNetworkSelect(network)}
                  className={`p-4 border rounded-lg cursor-pointer text-center transition-colors
                    ${selectedNetwork?.id === network.id ? `border-orange-500 bg-white dark:bg-gray-800` : `${theme.colors.hover}`}
                  `}
                >
                  {network.image ? (
                    <img src={network.image} alt={network.public_name} className="h-12 mx-auto mb-2" />
                  ) : (
                    <div className="h-12 flex items-center justify-center mb-2 text-black dark:text-white">
                      {network.public_name}
                    </div>
                  )}
                  <div className="text-sm font-medium text-black dark:text-white">{network.public_name}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setCurrentStep('selectId')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ← Retour aux Bet IDs
            </button>
          </div>
        );
      case 'addBetId':
        // Only show Bet IDs for the selected platform
        const filteredBetIds = selectedPlatform
          ? savedAppIds.filter(id => id.app_name?.id === selectedPlatform.id)
          : [];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                Gestion des Bet IDs
              </h2>
              <button
                onClick={() => { window.location.href = '/bet_id'; }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 transition-all text-base font-medium"
              >
                <PlusCircle className="w-5 h-5" />
                Ajouter un Bet ID
              </button>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">Vos Bet IDs enregistrés</h3>
              {!selectedPlatform ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <span className="text-4xl mb-2">🎲</span>
                  <p className="text-gray-500 dark:text-gray-400 text-center text-base font-medium">Veuillez d&apos;abord sélectionner une plateforme de pari.</p>
                </div>
              ) : filteredBetIds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <span className="text-4xl mb-2">📭</span>
                  <p className="text-gray-500 dark:text-gray-400 text-center text-base font-medium">Aucun Bet ID trouvé pour cette plateforme. Veuillez en ajouter un pour continuer.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-800 rounded-lg overflow-hidden">
                  {filteredBetIds.map((id) => (
                    <li
                      key={id.id}
                      className={`flex items-center justify-between px-4 py-3 transition-all ${formData.betid === id.link ? ' border-l-4 border-orange-500' : `${theme.colors.hover} cursor-pointer`}`}
                      onClick={() => handleBetIdSelect(id.link)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <span className="font-mono text-base text-black dark:text-white">{id.link}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{id.app_name?.public_name || id.app_name?.name}</span>
                      </div>
                      <button
                        className="ml-2 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-all"
                        onClick={e => {
                          e.stopPropagation();
                          setSavedAppIds(prev => prev.filter(bid => bid.id !== id.id));
                          if (formData.betid === id.link) setFormData(prev => ({ ...prev, betid: '' }));
                        }}
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:justify-between gap-2 mt-6">
              <button
                onClick={() => setCurrentStep('selectId')}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              >
                ← Retour
              </button>
            </div>
          </div>
        );

      case 'tutorial':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                Comment obtenir votre code de retrait ?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Suivez l&apos;un des tutoriels ci-dessous pour obtenir votre code de retrait.
              </p>
            </div>

            <ul className="space-y-3">
              {tutorials.map((tuto, index) => (
                <li key={index}>
                  <a
                    href={tuto.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${theme.colors.hover} transition-colors`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FF0000">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-black dark:text-white">{tuto.name}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <button
                onClick={() => setCurrentStep('addBetId')}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              >
                ← Retour
              </button>
              <button
                onClick={() => setCurrentStep('enterDetails')}
                className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
              >
                J&apos;ai déjà un code de retrait →
              </button>
            </div>
          </div>
        );

      case 'enterDetails':
        // Prevent access if no Bet ID is selected
        if (!formData.betid) {
          setCurrentStep('addBetId');
          return null;
        }
        return (
          <div className="space-y-4">
            {/* App Location Information */}
            {selectedPlatform && (
              <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-black dark:text-white">Ville:</span>
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium text-sm dark:bg-blue-950 dark:text-blue-300">
                    {selectedPlatform.city || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-black dark:text-white">Rue:</span>
                  <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-medium text-sm dark:bg-green-950 dark:text-green-300">
                    {selectedPlatform.street || 'N/A'}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-black dark:text-white">Bet ID sélectionné :</span>
              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-mono text-base border border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900">
                {formData.betid}
              </span>
            </div>
            <div className="flex items-center mb-4">
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1 text-black dark:text-white">
                  Montant à retirer
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Entrez le montant"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              {/* Fee Display */}
              {selectedNetwork?.with_fee && selectedNetwork?.fee_percent && formData.amount && (
                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    Calcul des frais
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-black dark:text-white">Montant saisi:</span>
                      <span className="font-medium">{parseFloat(formData.amount).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black dark:text-white">Frais ({selectedNetwork.fee_percent}%):</span>
                      <span className="font-medium text-red-600 dark:text-red-400">-{calculatedFee.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <hr className="border-orange-200 dark:border-orange-700" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-orange-800 dark:text-orange-200">Montant à recevoir:</span>
                      <span className="text-green-600 dark:text-green-400">{netAmount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="withdrawalCode" className="block text-sm font-medium mb-1 text-black dark:text-white">
                  Code de retrait
                </label>
                <input
                  type="text"
                  id="withdrawalCode"
                  name="withdrawalCode"
                  value={formData.withdrawalCode}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Entrez votre code de retrait"
                  required
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1 text-black dark:text-white">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Ex: 771234567"
                  required
                />
              </div>
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('addBetId')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Traitement...' : 'Soumettre'}
                </button>
              </div>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">Retirer des fonds</h1>

      {/* Flashing Info Icon and How-To Sentence */}
      {/* <div className="flex items-center mb-4">
        <button
          type="button"
          aria-label="Comment retirer ?"
          className="flex items-center gap-2 focus:outline-none"
          onClick={() => setShowHowTo((prev) => !prev)}
        >
          <span className="relative flex items-center justify-center w-8 h-8 rounded-full border border-orange-500 bg-white dark:bg-gray-800 animate-flash-info">
            <span className="text-orange-600 font-bold text-lg">i</span>
          </span>
          <span className="text-orange-600 font-medium animate-flash-text cursor-pointer">
            Comment retirer ?
          </span>
        </button>
      </div> */}
      {/* Dropdown for How to Withdraw */}
      {showHowTo && (
        <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded animate-scale-in text-gray-800 dark:bg-orange-950 dark:text-orange-100">
          <h2 className="font-semibold mb-2 text-orange-700 dark:text-orange-300">Comment fonctionne le retrait ?</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-orange-100">
            <li>Sélectionnez d&apos;abord la plateforme de pari sur laquelle vous souhaitez retirer vos fonds.</li>
            <li>Choisissez le réseau de paiement (par exemple, Orange Money, Wave, etc.).</li>
            <li>Ajoutez ou sélectionnez votre Bet ID enregistré pour cette plateforme.</li>
            <li>Entrez le code de retrait fourni par la plateforme de pari et votre numéro de téléphone mobile.</li>
            <li>Validez la demande. Vous recevrez une notification une fois le retrait traité.</li>
            <li>Assurez-vous que les informations saisies sont correctes pour éviter tout retard.</li>
          </ul>
        </div>
      )}

      <button
            onClick={() => window.history.back()}
            className="flex items-center text-md font-medium  dark:text-gray-300 dark:hover:text-white  px-4 py-2 rounded-lg shadow-sm transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
      </button>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8 relative">
        {['selectId', 'selectNetwork', 'addBetId', 'enterDetails'].map((step, index) => {
          const stepNum = index + 1;
          let stepName = '';
          const visibleStep = currentStep === 'tutorial' ? 'addBetId' : currentStep;
          const currentStepIndex = ['selectId', 'selectNetwork', 'addBetId', 'enterDetails'].indexOf(visibleStep);
          switch (step) {
            case 'selectId': stepName = 'Sélectionnez une plateforme de paris'; break;
            case 'selectNetwork': stepName = 'Sélectionner le réseau'; break;
            case 'addBetId': stepName = 'Gérer les Bet IDs'; break;
            case 'enterDetails': stepName = 'Entrer les détails'; break;
          }
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          return (
            <div key={step} className="flex flex-col items-center flex-1 relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isActive 
                    ? 'bg-orange-600 text-white' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <span className={`text-sm text-center ${isActive ? 'font-medium text-orange-600 dark:text-orange-400' : 'text-gray-500'}`}>
                {stepName}
              </span>
              {index < 3 && (
                <div className="absolute top-5 left-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10">
                  {isCompleted && (
                    <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className={`bg-gradient-to-br ${theme.colors.c_background} rounded-lg shadow-md p-6`}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {loading && !success && !error ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          renderStep()
        )}
      </div>

      {/* Withdrawal Message Modal */}
      {showWithdrawalModal && withdrawalMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                {t("Confirmation de retrait")}
              </h3>
              <button
                onClick={handleWithdrawalModalCancel}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {withdrawalMessage}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleWithdrawalModalCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                {t("Annuler")}
              </button>
              <button
                onClick={handleWithdrawalModalConfirm}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                {t("OK")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {isModalOpen && selectedTransaction && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Détails de la transaction</h3>
              <div className="space-y-2">
                <p className="text-black dark:text-white"><span className="font-medium text-black dark:text-white">Statut :</span> {selectedTransaction.transaction.status}</p>
                <p className="text-black dark:text-white"><span className="font-medium text-black dark:text-white">Référence :</span> {selectedTransaction.transaction.reference}</p>
                <p className="text-black dark:text-white"><span className="font-medium text-black dark:text-white">Date :</span> {new Date(selectedTransaction.transaction.created_at).toLocaleString('fr-FR')}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
        @keyframes flashInfo {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7); }
          50% { box-shadow: 0 0 8px 4px rgba(255, 152, 0, 0.5); }
        }
        .animate-flash-info {
          animation: flashInfo 1.2s infinite;
        }
        @keyframes flashText {
          0%, 100% { color: #ea580c; }
          50% { color: #fbbf24; }
        }
        .animate-flash-text {
          animation: flashText 1.2s infinite;
        }
      `}</style>
    </div>
  );
}