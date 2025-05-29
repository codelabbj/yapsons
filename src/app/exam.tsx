// {{ ... }}
//   const [formData, setFormData] = useState({
//     amount: '',
//     phoneNumber: '',
//     backendAmount: '',
//     extraCharge: '0',
//     userInputAmount: ''
//   });
// {{ ... }}
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
    
//     if (name === 'amount') {
//       const amount = parseInt(value);
//       if (!isNaN(amount) && amount > 0) {
//         const result = calculateSafeBackendAmount(amount);
//         if (!result.error) {
//           setFormData(prev => ({
//             ...prev,
//             [name]: value,
//             backendAmount: result.backendAmount.toString(),
//             extraCharge: (result.finalCharged - amount).toFixed(2),
//             userInputAmount: value
//           }));
//           return;
//         }
//       }
//     }
    
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const calculateSafeBackendAmount = (userInput: number) => {
//     if (userInput % 100 !== 0) {
//       return {
//         error: "Amount must be a multiple of 100 (e.g., 200, 300, 400)."
//       };
//     }

//     const minCharge = userInput;      // Must charge at least this
//     const maxCharge = userInput + 1;  // Must charge no more than this

//     let backendAmount = Math.floor(userInput); // start from full amount

//     while (backendAmount > 0) {
//       const finalCharged = parseFloat((backendAmount * 1.02).toFixed(2));

//       if (finalCharged >= minCharge && finalCharged <= maxCharge) {
//         return {
//           userInput,
//           backendAmount,
//           finalCharged,
//           commission: parseFloat((finalCharged - backendAmount).toFixed(2))
//         };
//       }

//       backendAmount -= 1;
//     }


//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedId || !selectedNetwork) return;
    
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('accessToken');
//       if (!token) throw new Error('Not authenticated');
      
//       // Use backendAmount for the transaction
//       const amountToUse = formData.backendAmount || formData.amount;
      
//       const response = await axios.post('https://api.yapson.net/yapson/transaction', {
//         type_trans: 'deposit',
//         amount: amountToUse,  // Use the calculated backend amount
//         phone_number: formData.phoneNumber,
//         network_id: selectedNetwork.id,
//         app_id: selectedId.app_name?.id,
//         user_app_id: selectedId.link
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       const transaction = response.data;
//       // Store the user input amount in the transaction for display
//       transaction.userInputAmount = formData.userInputAmount || amountToUse;
//       transaction.extraCharge = formData.extraCharge || '0';
      
//       setSelectedTransaction({ transaction });
//       setIsModalOpen(true);
      
//       setSuccess('Transaction initiated successfully!');
//       // Reset form
//       setCurrentStep('selectId');
//       setSelectedId(null);
//       setSelectedNetwork(null);
//       setFormData({ 
//         amount: '', 
//         phoneNumber: '',
//         backendAmount: '',
//         extraCharge: '0',
//         userInputAmount: ''
//       });
// {{ ... }}
//                   <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
//                     <span className="text-gray-600 dark:text-gray-400">{t("Amount")}</span>
//                     <div className="text-right">
//                       <div className="font-medium">{selectedTransaction.transaction.userInputAmount || selectedTransaction.transaction.amount} FCFA</div>
//                       {selectedTransaction.transaction.extraCharge > 0 && (
//                         <div className="text-sm text-gray-500">
//                           +{selectedTransaction.transaction.extraCharge} FCFA (fees)
//                         </div>
//                       )}
//                       <div className="font-bold">
//                         {selectedTransaction.transaction.amount} FCFA total
//                       </div>
//                     </div>
//                   </div>
// {{ ... }}



// const calculateSafeBackendAmount = (userInput: number) => {
//     if (userInput % 100 !== 0) {
//       return {
//         error: "Amount must be a multiple of 100 (e.g., 200, 300, 400)."
//       };
//     }

//     const minCharge = userInput;      // Must charge at least this
//     const maxCharge = userInput + 1;  // Must charge no more than this

//     let backendAmount = Math.floor(userInput); // start from full amount

//     while (backendAmount > 0) {
//       const finalCharged = parseFloat((backendAmount * 1.02).toFixed(2));

//       if (finalCharged >= minCharge && finalCharged <= maxCharge) {
//         return {
//           userInput,
//           backendAmount,
//           finalCharged,
//           commission: parseFloat((finalCharged - backendAmount).toFixed(2))
//         };
//       }

//       backendAmount -= 1;
//     }
//   }

//   {{ ... }}
//   const [calculationResult, setCalculationResult] = useState<{
//     userInput: number;
//     backendAmount: number;
//     finalCharged: number;
//     commission: number;
//   } | null>(null);

// {{ ... }}
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedId || !selectedNetwork) return;
    
//     // Calculate the final charged amount
//     const amount = parseFloat(formData.amount);
//     const calculation = calculateSafeBackendAmount(amount);
    
//     if ('error' in calculation) {
//       setError(calculation.error);
//       return;
//     }
    
//     setCalculationResult(calculation);
    
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('accessToken');
//       if (!token) throw new Error('Not authenticated');
      
//       const response = await axios.post('https://api.yapson.net/yapson/transaction', {
//         type_trans: 'deposit',
//         amount: calculation.backendAmount,  // Use backendAmount from calculation
//         phone_number: formData.phoneNumber,
//         network_id: selectedNetwork.id,
//         app_id: selectedId.app_name?.id,
//         user_app_id: selectedId.link
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       const transaction = response.data;
//       setSelectedTransaction({ transaction });
//       setIsModalOpen(true);
      
//       setSuccess('Transaction initiated successfully!');
//       // Reset form
//       setCurrentStep('selectId');
//       setSelectedId(null);
//       setSelectedNetwork(null);
//       setFormData({ amount: '', phoneNumber: '' });
//     } catch (err) {
//       console.error('Transaction error:', err);
//       if (
//         typeof err === 'object' &&
//         err !== null &&
//         'response' in err &&
//         typeof (err as { response?: unknown }).response === 'object'
//       ) {
//         const response = (err as { response?: { data?: { detail?: string } } }).response;
//         setError(response?.data?.detail || 'Failed to process transaction');
//       } else {
//         setError('Failed to process transaction');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
// {{ ... }}
//                   <div className="space-y-4">
//                     <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
//                       <span className="text-gray-600 dark:text-gray-400">{t("Amount")}</span>
//                       <span className="font-medium">{selectedTransaction.transaction.amount} FCFA</span>
//                     </div>
                    
//                     {calculationResult && (
//                       <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
//                         <span className="text-gray-600 dark:text-gray-400">{t("Final Charged")}</span>
//                         <span className="font-medium">{calculationResult.finalCharged} FCFA</span>
//                       </div>
//                     )}
                    
//                     <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
// {{ ... }}






// {{ ... }}
//   const calculateSafeBackendAmount = (userInput: number, networkName: string) => {
//     if (userInput % 100 !== 0) {
//       return {
//         error: "Amount must be a multiple of 100 (e.g., 200, 300, 400)."
//       };
//     }

//     // Define network-specific percentages
//     const networkPercentages: Record<string, number> = {
//       'MTN': 1.8,
//       'WAVE': 1.8,
//       'ORANGE': 1.6
//     };

//     // Get the percentage based on network name (case insensitive)
//     const networkKey = Object.keys(networkPercentages).find(
//       key => key.toLowerCase() === networkName.toLowerCase()
//     );
    
//     if (!networkKey) {
//       return {
//         error: `No commission rate defined for network: ${networkName}`
//       };
//     }

//     const percentage = networkPercentages[networkKey];
//     const commissionRate = 1 + (percentage / 100);

//     // Calculate the final charged amount
//     let finalCharged = userInput * commissionRate;
    
//     // Apply rounding rules
//     const decimalPart = finalCharged - Math.floor(finalCharged);
//     if (decimalPart >= 0.5) {
//       // If decimal part is 0.5 or more, round up to the next integer
//       finalCharged = Math.ceil(finalCharged);
//     } else {
//       // If decimal part is less than 0.5, remove the decimal part
//       finalCharged = Math.floor(finalCharged);
//     }

//     // Calculate commission and backend amount
//     const commission = finalCharged - userInput;
    
//     return {
//       userInput,
//       backendAmount: userInput, // The actual amount to be deposited
//       finalCharged,
//       commission: parseFloat(commission.toFixed(2)),
//       percentage
//     };
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedId || !selectedNetwork) return;

//     const amount = parseFloat(formData.amount);
//     const calculation = calculateSafeBackendAmount(amount, selectedNetwork.name);
    
//     if ('error' in calculation) {
//       setError(calculation.error);
//       return;
//     }
    
//     setCalculationResult(calculation);
// {{ ... }}
//                   <div className="space-y-4">
//                     <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
//                       <span className="text-gray-600 dark:text-gray-400">{t("Amount")}</span>
//                       <span className="font-medium">{selectedTransaction.transaction.amount} FCFA</span>
//                     </div>
                    
//                     {calculationResult && (
//                       <>
//                         <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
//                           <span className="text-gray-600 dark:text-gray-400">{t("Commission")} ({calculationResult.percentage}%)</span>
//                           <span className="font-medium">{calculationResult.commission} FCFA</span>
//                         </div>
//                         <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
//                           <span className="text-gray-600 dark:text-gray-400">{t("Total Charged")}</span>
//                           <span className="font-medium">{calculationResult.finalCharged} FCFA</span>
//                         </div>
//                       </>






// const calculateSafeBackendAmount = (userInput: number, networkName: string) => {
//     if (userInput % 100 !== 0) {
//       return {
//         error: "Amount must be a multiple of 100 (e.g., 200, 300, 400)."
//       };
//     }

//     // Define network-specific percentages
//     const networkPercentages: Record<string, number> = {
//       'MTN': 1.8,
//       'WAVE': 1.8,
//       'ORANGE': 1.6
//     };

//     // Get the percentage based on network name (case insensitive)
//     const networkKey = Object.keys(networkPercentages).find(
//       key => key.toLowerCase() === networkName.toLowerCase()
//     );
    
//     if (!networkKey) {
//       return {
//         error: `No commission rate defined for network: ${networkName}`
//       };
//     }

//     const percentage = networkPercentages[networkKey];
//     const commissionRate = 1 + (percentage / 100);

//     // Calculate the base amount that would result in the userInput after commission
//     // We're solving for: userInput = baseAmount * commissionRate
//     // So: baseAmount = userInput / commissionRate
//     const baseAmount = userInput / commissionRate;
    
//     // Round to 2 decimal places to avoid floating point precision issues
//     const roundedBaseAmount = parseFloat(baseAmount.toFixed(2));
    
//     // Calculate the final charged amount by reapplying the commission
//     let finalCharged = parseFloat((roundedBaseAmount * commissionRate).toFixed(2));
    
//     // Apply rounding rules to ensure finalCharged is very close to userInput
//     const difference = finalCharged - userInput;
    
//     // If the difference is more than 2 FCFA, adjust to stay within the limit
//     if (difference > 2) {
//       // If the charge is too high, we need to reduce the base amount slightly
//       const adjustment = (difference - 2) / commissionRate;
//       finalCharged = parseFloat(((roundedBaseAmount - adjustment) * commissionRate).toFixed(2));
//     }
    
//     // Ensure finalCharged is at least the userInput and at most userInput + 2
//     finalCharged = Math.max(userInput, Math.min(finalCharged, userInput + 2));
    
//     // Calculate commission and ensure it's not negative
//     const commission = Math.max(0, parseFloat((finalCharged - userInput).toFixed(2)));
    
//     return {
//       userInput,
//       backendAmount: userInput, // The actual amount to be deposited
//       finalCharged,
//       commission,
//       percentage
//     };
//   };
// {{ ... }}