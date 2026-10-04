import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import {
  useClaimTemplates,
  useClaimUpdateSetting,
  useResetClaimTemplate,
  useUpdateClaimTemplate,
  useUpdateClaimUpdateSetting,
} from '@/api/useCrmData'
import { CardSkeleton, SummarySkeleton, TableSkeleton } from '@/components/ui/SkeletonLoaders'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageState } from '@/components/ui/PageState'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatusChip } from '@/components/ui/StatusChip'
import { useRole } from '@/layout/useRole'
import { useSnackbar } from '@/components/ui/useSnackbar'
import { UsersSection } from '@/pages/settings/UsersSection'
import type { ClaimStage } from '@/types/crm'

const templateFormSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, 'Subject is required.')
    .max(160, 'Keep the subject under 160 characters.'),
  body: z
    .string()
    .trim()
    .min(1, 'Message body is required.')
    .max(2000, 'Keep the message under 2,000 characters.'),
})

type TemplateFormValues = z.infer<typeof templateFormSchema>

const stages: ClaimStage[] = [
  'REGISTERED',
  'DOCUMENTS_PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'SETTLED',
  'REJECTED',
]

const stageLabels: Record<ClaimStage, string> = {
  REGISTERED: 'Registered',
  DOCUMENTS_PENDING: 'Documents pending',
  UNDER_REVIEW: 'Under review',
  APPROVED: 'Approved',
  SETTLED: 'Settled',
  REJECTED: 'Rejected',
}

const stageColors: Record<ClaimStage, 'info' | 'warning' | 'success' | 'error'> = {
  REGISTERED: 'info',
  DOCUMENTS_PENDING: 'warning',
  UNDER_REVIEW: 'info',
  APPROVED: 'success',
  SETTLED: 'success',
  REJECTED: 'error',
}

const placeholders = ['{{customerName}}', '{{claimNo}}', '{{stage}}'] as const

function sampleMessage(value: string, stage: ClaimStage) {
  return value
    .replaceAll('{{customerName}}', 'Aarav Mehta')
    .replaceAll('{{claimNo}}', 'CLM/2026/1001')
    .replaceAll('{{stage}}', stageLabels[stage])
}

export function SettingsPage() {
  const { isAdmin } = useRole()
  const { showSuccess, showError } = useSnackbar()
  const queryClient = useQueryClient()
  const settingQuery = useClaimUpdateSetting()
  const templatesQuery = useClaimTemplates()
  const updateSetting = useUpdateClaimUpdateSetting()
  const updateTemplate = useUpdateClaimTemplate()
  const resetTemplate = useResetClaimTemplate()
  const [selectedTab, setSelectedTab] = useState(0)
  const [selectedStage, setSelectedStage] = useState<ClaimStage>('REGISTERED')
  const [resetOpen, setResetOpen] = useState(false)

  const selectedTemplate = templatesQuery.data?.find((template) => template.stage === selectedStage)

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: { subject: '', body: '' },
    mode: 'onChange',
  })

  const bodyRef = useRef<HTMLTextAreaElement | null>(null)
  const bodyValue = useWatch({ control: form.control, name: 'body' }) || ''
  const subjectValue = useWatch({ control: form.control, name: 'subject' }) || ''
  const enabled = settingQuery.data ?? true

  useEffect(() => {
    if (selectedTemplate) {
      form.reset({ subject: selectedTemplate.subject, body: selectedTemplate.body })
    }
  }, [form, selectedTemplate])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [form.formState.isDirty])

  const handleSettingChange = async (nextValue: boolean) => {
    const previousValue = settingQuery.data ?? true
    queryClient.setQueryData(['claim-update-setting'], nextValue)
    try {
      await updateSetting.mutateAsync(nextValue)
      showSuccess(
        nextValue ? 'Automatic claim updates enabled.' : 'Automatic claim updates disabled.',
      )
    } catch {
      queryClient.setQueryData(['claim-update-setting'], previousValue)
      showError('Could not update claim notifications. The previous setting was restored.')
    }
  }

  const saveTemplate = async ({ subject, body }: TemplateFormValues) => {
    if (!selectedTemplate) return
    try {
      await updateTemplate.mutateAsync({ templateId: selectedTemplate.id, subject, body })
      form.reset({ subject, body })
      showSuccess(`${selectedTemplate.name} template saved.`)
    } catch {
      showError('Could not save this template. Please try again.')
    }
  }

  const resetToDefault = async () => {
    if (!selectedTemplate) return
    try {
      await resetTemplate.mutateAsync(selectedTemplate.id)
      form.reset({
        subject: selectedTemplate.defaultSubject,
        body: selectedTemplate.defaultBody,
      })
      setResetOpen(false)
      showSuccess(`${selectedTemplate.name} reset to default.`)
    } catch {
      showError('Could not reset this template. Please try again.')
    }
  }

  const insertPlaceholder = (placeholder: string) => {
    const current = bodyValue ?? ''
    const start = bodyRef.current?.selectionStart ?? current.length
    const end = bodyRef.current?.selectionEnd ?? current.length
    const next = `${current.slice(0, start)}${placeholder}${current.slice(end)}`
    form.setValue('body', next, { shouldDirty: true, shouldValidate: true })
    requestAnimationFrame(() => {
      bodyRef.current?.focus()
      bodyRef.current?.setSelectionRange(start + placeholder.length, start + placeholder.length)
    })
  }

  const loading = settingQuery.isLoading || templatesQuery.isLoading

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Settings"
        subtitle="Control workspace defaults, automatic claim communication, and user access."
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value: number) => setSelectedTab(value)}
          aria-label="Settings sub-sections"
        >
          <Tab label="Claim Updates" />
          <Tab label="Users" />
        </Tabs>
      </Box>

      {selectedTab === 0 && (
        <PageState
          loading={false}
          forbidden={!isAdmin}
          error={settingQuery.isError || templatesQuery.isError}
          empty={!loading && !templatesQuery.data?.length}
          onRetry={() => {
            void settingQuery.refetch()
            void templatesQuery.refetch()
          }}
        >
          {loading ? (
            <Stack spacing={2}>
              <SummarySkeleton />
              <CardSkeleton />
              <TableSkeleton rows={6} />
            </Stack>
          ) : (
            selectedTemplate && (
              <Stack spacing={4}>
                <SectionCard
                  title="Claim Updates"
                  subtitle="Manage automatic messages sent as claims move through each stage."
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                        flexDirection: { xs: 'column', sm: 'row' },
                      }}
                    >
                      <Box>
                        <Typography variant="h3">Automatic claim updates</Typography>
                        <Typography color="text.secondary">
                          Notify customers when their claim stage changes.
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={enabled}
                            onChange={(event) => {
                              void handleSettingChange(event.target.checked)
                            }}
                            disabled={updateSetting.isPending}
                          />
                        }
                        label={enabled ? 'Enabled' : 'Disabled'}
                      />
                    </Box>
                    {!enabled && (
                      <Alert severity="warning">No messages will be sent automatically.</Alert>
                    )}
                  </Stack>
                </SectionCard>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '240px minmax(0, 1fr)' },
                    gap: 3,
                  }}
                >
                  <SectionCard title="Stages" subtitle="Choose a claim stage to edit.">
                    <Stack spacing={0.5}>
                      {stages.map((stage) => {
                        const template = templatesQuery.data?.find((item) => item.stage === stage)
                        return (
                          <Button
                            key={stage}
                            onClick={() => setSelectedStage(stage)}
                            sx={{
                              justifyContent: 'space-between',
                              textAlign: 'left',
                              px: 1.5,
                              py: 1.25,
                              color: selectedStage === stage ? 'primary.dark' : 'text.secondary',
                              bgcolor: selectedStage === stage ? 'primary.light' : 'transparent',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: `${stageColors[stage]}.main`,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: selectedStage === stage ? 600 : 400 }}
                              >
                                {stageLabels[stage]}
                              </Typography>
                            </Box>
                            <StatusChip
                              label={template?.customized ? 'Customized' : 'Default'}
                              status={template?.customized ? 'info' : 'neutral'}
                            />
                          </Button>
                        )
                      })}
                    </Stack>
                  </SectionCard>

                  <Stack spacing={3}>
                    <SectionCard
                      title={`${selectedTemplate.name} template`}
                      subtitle="Use placeholders to personalize each message."
                    >
                      <Stack spacing={2}>
                        <Controller
                          control={form.control}
                          name="subject"
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              label="Subject"
                              error={Boolean(fieldState.error)}
                              helperText={fieldState.error?.message}
                              fullWidth
                            />
                          )}
                        />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Placeholders
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.75 }}>
                            {placeholders.map((placeholder) => (
                              <Chip
                                key={placeholder}
                                label={placeholder}
                                onClick={() => insertPlaceholder(placeholder)}
                                icon={<CheckRoundedIcon />}
                                clickable
                              />
                            ))}
                          </Box>
                        </Box>
                        <Controller
                          control={form.control}
                          name="body"
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              inputRef={bodyRef}
                              label="Message body"
                              multiline
                              minRows={8}
                              maxRows={14}
                              error={Boolean(fieldState.error)}
                              helperText={fieldState.error?.message}
                              fullWidth
                            />
                          )}
                        />
                        <Typography
                          variant="caption"
                          color={bodyValue.length > 2000 ? 'error.main' : 'text.secondary'}
                          sx={{ alignSelf: 'flex-end' }}
                        >
                          {bodyValue.length}/2000 characters
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 1,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Button
                            startIcon={<RestartAltRoundedIcon />}
                            onClick={() => setResetOpen(true)}
                            disabled={!selectedTemplate.customized || resetTemplate.isPending}
                          >
                            Reset to default
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<SaveRoundedIcon />}
                            onClick={() => {
                              void form.handleSubmit(saveTemplate)()
                            }}
                            disabled={
                              !form.formState.isDirty ||
                              !form.formState.isValid ||
                              updateTemplate.isPending
                            }
                          >
                            Save template
                          </Button>
                        </Box>
                      </Stack>
                    </SectionCard>

                    <SectionCard title="Live preview" subtitle="Sample customer message">
                      <Paper
                        sx={{
                          p: 2.5,
                          bgcolor: 'background.default',
                          borderRadius: 2,
                          maxWidth: 680,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Subject
                        </Typography>
                        <Typography variant="h3" sx={{ mb: 2 }}>
                          {sampleMessage(subjectValue, selectedStage)}
                        </Typography>
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                          {sampleMessage(bodyValue, selectedStage)}
                        </Typography>
                      </Paper>
                    </SectionCard>
                  </Stack>
                </Box>

                {form.formState.isDirty && (
                  <Paper
                    sx={{
                      position: 'sticky',
                      bottom: 16,
                      zIndex: 2,
                      p: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                      bgcolor: 'primary.light',
                    }}
                  >
                    <Typography variant="body2">You have unsaved changes.</Typography>
                    <Button
                      variant="contained"
                      startIcon={<SaveRoundedIcon />}
                      onClick={() => {
                        void form.handleSubmit(saveTemplate)()
                      }}
                      disabled={!form.formState.isValid || updateTemplate.isPending}
                    >
                      Save changes
                    </Button>
                  </Paper>
                )}

                <ConfirmDialog
                  open={resetOpen}
                  title="Reset template to default?"
                  description="Your customized subject and body for this stage will be replaced with the default message."
                  confirmLabel="Reset template"
                  onClose={() => setResetOpen(false)}
                  onConfirm={() => {
                    void resetToDefault()
                  }}
                  loading={resetTemplate.isPending}
                />
              </Stack>
            )
          )}
        </PageState>
      )}

      {selectedTab === 1 && <UsersSection />}
    </Stack>
  )
}
