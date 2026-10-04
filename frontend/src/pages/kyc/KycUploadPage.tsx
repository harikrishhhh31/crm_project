import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { SectionCard } from '@/components/ui/SectionCard'

type KycResult = {
  fileId: string
  documentType: string
  fields: Record<string, unknown>
  confidence: number
  verificationStatus: string
  validationValid?: boolean
  validationErrors?: string[]
  storedAs?: string
}

export function KycUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [customerId, setCustomerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<KycResult | null>(null)
  const [error, setError] = useState('')

  async function handleUpload() {
    if (!file) {
      setError('Choose a document first.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    const token = sessionStorage.getItem('harborline-access-token')
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
    const form = new FormData()
    form.append('file', file)
    const url = customerId ? `${apiUrl}/kyc/upload?customerId=${encodeURIComponent(customerId)}` : `${apiUrl}/kyc/upload`
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? 'Upload failed.')
        return
      }
      setResult(data)
    } catch {
      setError('Unable to reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      <SectionCard>
        <Typography variant="h2">KYC document verification</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Upload a PAN, Aadhaar, passport, or driving licence to extract and verify its details.
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 520 }}>
          <TextField
            label="Customer ID (optional)"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          />
          <Button variant="outlined" component="label">
            {file ? file.name : 'Choose file'}
            <input
              type="file"
              hidden
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          <Button variant="contained" onClick={handleUpload} disabled={loading || !file}>
            {loading ? 'Processing...' : 'Upload & verify'}
          </Button>
        </Stack>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </SectionCard>

      {result && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h3" gutterBottom>Result</Typography>
          <Typography><strong>Document type:</strong> {result.documentType}</Typography>
          <Typography><strong>Status:</strong> {result.verificationStatus}</Typography>
          <Typography><strong>Confidence:</strong> {result.confidence}</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Extracted fields</Typography>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(result.fields, null, 2)}
            </pre>
          </Box>
          {result.validationValid === false && result.validationErrors?.length ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {result.validationErrors.join(', ')}
            </Alert>
          ) : null}
        </Paper>
      )}
    </Stack>
  )
}
