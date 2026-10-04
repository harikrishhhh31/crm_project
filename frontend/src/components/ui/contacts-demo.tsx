'use client'

import { ContactsTable } from '@/components/ui/contacts-table-with-modal'

export default function ContactsTableDemo() {
  const handleContactSelect = (contactId: string) => {
    console.log(`Selected contact:`, contactId)
  }

  return (
    <div className="min-h-screen bg-background py-6 md:py-12">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="mb-8 md:mb-12">
          <ContactsTable title="Person" onContactSelect={handleContactSelect} />
        </div>
      </div>
    </div>
  )
}
