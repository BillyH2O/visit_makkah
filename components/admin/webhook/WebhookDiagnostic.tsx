"use client"

import { useState, useEffect } from 'react'

export default function WebhookDiagnostic() {
  const [diagnostic, setDiagnostic] = useState<any>(null)
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState('ORD-20260111-8F25OG')
  const [orderCheck, setOrderCheck] = useState<any>(null)

  const fetchDiagnostic = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/webhooks/stripe/diagnostic')
      const data = await res.json()
      setDiagnostic(data)
    } catch (error) {
      console.error('Error fetching diagnostic:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/webhooks/stripe/status')
      const data = await res.json()
      setStatus(data)
    } catch (error) {
      console.error('Error fetching status:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkOrder = async () => {
    if (!orderNumber) return
    setLoading(true)
    try {
      const res = await fetch(`/api/webhooks/stripe/check-order?orderNumber=${encodeURIComponent(orderNumber)}`)
      const data = await res.json()
      setOrderCheck(data)
    } catch (error) {
      console.error('Error checking order:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiagnostic()
    fetchStatus()
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Diagnostic Webhook Stripe</h2>
        
        <div className="space-y-4">
          <button
            onClick={fetchDiagnostic}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Vérifier la configuration'}
          </button>

          {diagnostic && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold">Configuration :</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                <pre className="text-sm overflow-auto">{JSON.stringify(diagnostic, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Statut des commandes récentes</h2>
        
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 mb-4"
        >
          {loading ? 'Chargement...' : 'Vérifier les commandes'}
        </button>

        {status && (
          <div className="mt-4 space-y-2">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
              <pre className="text-sm overflow-auto">{JSON.stringify(status, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Vérifier une commande spécifique</h2>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Numéro de commande (ex: ORD-20260111-8F25OG)"
            className="flex-1 px-4 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            onClick={checkOrder}
            disabled={loading || !orderNumber}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
          >
            Vérifier
          </button>
        </div>

        {orderCheck && (
          <div className="mt-4 space-y-2">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
              <pre className="text-sm overflow-auto">{JSON.stringify(orderCheck, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

