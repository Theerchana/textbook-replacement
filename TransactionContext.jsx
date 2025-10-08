// src/context/TransactionContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../lib/api";
 // Make sure this file exists

// Create Context
const TransactionContext = createContext();

// Custom Hook
export function useTransactions() {
  return useContext(TransactionContext);
}

// Provider Component
export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all transactions from backend
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data || []);
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch transactions:", err);
      setError("Failed to load transactions from server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Add new transaction
  const addTransaction = async (transaction) => {
    try {
      const res = await api.post("/transactions", transaction);
      const newTx = res.data;
      setTransactions((prev) => [newTx, ...prev]);
      return newTx;
    } catch (err) {
      console.error("❌ Failed to add transaction:", err);
      throw new Error(err.response?.data?.message || "Unable to add transaction");
    }
  };

  // Update transaction status
  const updateTransactionStatus = async (id, status, paymentInfo = {}) => {
    try {
      const res = await api.put(`/transactions/${id}`, { status, paymentInfo });
      const updatedTx = res.data;
      setTransactions((prev) =>
        prev.map((t) => (t._id === id || t.id === id ? updatedTx : t))
      );
      return updatedTx;
    } catch (err) {
      console.error("❌ Failed to update transaction:", err);
      throw new Error(err.response?.data?.message || "Unable to update transaction");
    }
  };

  // Get transactions for a specific user
  const getTransactionsForUser = (email) => {
    if (!email) return [];
    return transactions.filter(
      (t) => t.buyerEmail === email || t.sellerEmail === email
    );
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) =>
        prev.filter((t) => t._id !== id && t.id !== id)
      );
    } catch (err) {
      console.error("❌ Failed to delete transaction:", err);
      throw new Error(err.response?.data?.message || "Unable to delete transaction");
    }
  };

  // Context value
  const value = {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransactionStatus,
    getTransactionsForUser,
    deleteTransaction,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}
